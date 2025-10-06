// Liquid Image Hover Effect with Color Reveal and Hotspots (Optimized)
// Real-time water-like displacement, grayscale-to-color reveal, persistent hotspots, and performance optimizations.
import { useRef, useEffect, useState, useCallback } from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

const defaultImage = {
    src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
    alt: "Gradient 1 - Blue",
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function LiquidImage(props) {
    const {
        image = defaultImage,
        strength = 0.15,
        speed = 0.18,
        style,
        hotspots = [],
        borderRadius = 8,
    } = props
    const canvasRef = useRef(null)
    const [size, setSize] = useState({ width: 400, height: 300 })
    const dprRef = useRef(1)
    const isStatic = useIsStaticRenderer()

    // Animation and interaction refs
    const mouseRef = useRef({ x: -10, y: -10, active: false })
    const maskRadiusRef = useRef(0)
    const wakeRef = useRef([])
    const hotspotsRef = useRef(hotspots)
    const hoveredRef = useRef(false)
    const animatingRef = useRef(false)

    // Only update hotspotsRef when hotspots prop changes
    useEffect(() => {
        hotspotsRef.current = hotspots
    }, [hotspots])

    // Resize observer (with devicePixelRatio)
    useEffect(() => {
        if (!canvasRef.current) return
        const resize = () => {
            let dpr = 1
            if (typeof window !== "undefined") {
                dpr = window.devicePixelRatio || 1
            }
            dprRef.current = dpr
            const w = Math.round(canvasRef.current.offsetWidth * dpr)
            const h = Math.round(canvasRef.current.offsetHeight * dpr)
            setSize({ width: w, height: h })
        }
        resize()
        if (typeof window !== "undefined") {
            window.addEventListener("resize", resize)
            return () => window.removeEventListener("resize", resize)
        }
        return () => {}
    }, [])

    // Mouse events (no state updates on move)
    const handleMove = useCallback((e) => {
        if (!canvasRef.current) return
        const rect = canvasRef.current.getBoundingClientRect()
        let x, y
        if (e.touches && e.touches.length > 0) {
            x = (e.touches[0].clientX - rect.left) / rect.width
            y = (e.touches[0].clientY - rect.top) / rect.height
        } else {
            x = (e.clientX - rect.left) / rect.width
            y = (e.clientY - rect.top) / rect.height
        }
        x = Math.max(0, Math.min(1, x))
        y = Math.max(0, Math.min(1, y))
        mouseRef.current = { x, y, active: true }
        hoveredRef.current = true
        // Add a wake point (limit to 8 recent)
        const now = Date.now()
        wakeRef.current = [
            ...wakeRef.current.filter((w) => now - w.t < 1200),
            { x, y, t: now },
        ].slice(-8)
    }, [])
    const handleLeave = useCallback(() => {
        mouseRef.current = { ...mouseRef.current, active: false }
        hoveredRef.current = false
    }, [])

    // Animate mask radius on hover in/out (single animation loop, easeInOut cubic)
    useEffect(() => {
        let animId
        let lastHovered = false
        let start = null
        let from = 0
        let to = 0
        let duration = 650 // ms, slower for smoother effect
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }
        function animate(ts) {
            const hovered = hoveredRef.current
            if (hovered !== lastHovered) {
                lastHovered = hovered
                start = ts
                from = maskRadiusRef.current
                to = hovered ? 1.5 : 0
            }
            if (start === null) start = ts
            const elapsed = Math.min((ts - start) / duration, 1)
            const eased = easeInOutCubic(elapsed)
            maskRadiusRef.current = from + (to - from) * eased
            if (elapsed < 1) {
                animId = requestAnimationFrame(animate)
            } else {
                maskRadiusRef.current = to
                animId = requestAnimationFrame(animate)
            }
        }
        animId = requestAnimationFrame(animate)
        return () => animId && cancelAnimationFrame(animId)
    }, [])

    // WebGL shader effect (single stable render loop)
    useEffect(() => {
        if (!canvasRef.current || isStatic) return
        // Set canvas size for high-DPI
        const dpr = dprRef.current || 1
        canvasRef.current.width = size.width
        canvasRef.current.height = size.height
        canvasRef.current.style.width = size.width / dpr + "px"
        canvasRef.current.style.height = size.height / dpr + "px"
        let gl = canvasRef.current.getContext("webgl")
        if (!gl) return
        let animationId
        let img = new window.Image()
        img.crossOrigin = "anonymous"
        img.src = image.src
        let tex,
            program,
            uTime,
            uMouse,
            uStrength,
            uSpeed,
            uResolution,
            uWake,
            uWakeCount,
            uMaskRadius
        let startTime = Date.now()
        let loaded = false
        // Vertex shader
        const vs = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0, 1);
            }
        `
        // Fragment shader with wake effect and grayscale/color reveal
        const fs = `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_image;
            uniform vec2 u_mouse;
            uniform float u_time;
            uniform float u_strength;
            uniform float u_speed;
            uniform vec2 u_resolution;
            #define MAX_WAKE 16
            uniform int u_wakeCount;
            uniform vec3 u_wake[MAX_WAKE]; // x, y, t (t = seconds since start)
            uniform float u_maskRadius; // in [0,1], relative to min(width, height)
            void main() {
                vec2 uv = v_uv;
                float total = 0.0;
                // Wake ripples
                for (int i = 0; i < MAX_WAKE; ++i) {
                    if (i >= u_wakeCount) break;
                    vec2 w = u_wake[i].xy;
                    float t = u_time - u_wake[i].z;
                    float dist = distance(uv, w);
                    float amp = exp(-dist * 16.0) * exp(-t * 1.2);
                    float ripple = sin(32.0 * dist - t * 8.0 * u_speed) * 0.04;
                    uv += normalize(uv - w) * ripple * u_strength * amp * 2.0;
                }
                // Live mouse ripple
                if (u_mouse.x >= 0.0 && u_mouse.x <= 1.0 && u_mouse.y >= 0.0 && u_mouse.y <= 1.0) {
                    float dist = distance(uv, u_mouse);
                    float ripple = sin(32.0 * dist - u_time * 8.0 * u_speed) * 0.04;
                    float effect = exp(-dist * 12.0);
                    uv += normalize(uv - u_mouse) * ripple * u_strength * effect * 2.0;
                }
                uv = clamp(uv, 0.0, 1.0);
                vec4 color = texture2D(u_image, uv);
                // Grayscale
                float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                vec3 grayColor = vec3(gray);
                // Color reveal mask: union of all active hotspots and mouse
                float mask = 0.0;
                float maskRadius = u_maskRadius; // in [0,1], relative to min(width, height)
                // Mouse mask
                if (u_mouse.x >= 0.0 && u_mouse.x <= 1.0 && u_mouse.y >= 0.0 && u_mouse.y <= 1.0 && maskRadius > 0.0) {
                    float d = distance(uv, u_mouse);
                    mask = max(mask, smoothstep(maskRadius, maskRadius * 0.8, d));
                }
                // Hotspot masks
                for (int i = 0; i < MAX_WAKE; ++i) {
                    if (i >= u_wakeCount) break;
                    vec2 w = u_wake[i].xy;
                    float d = distance(uv, w);
                    mask = max(mask, smoothstep(maskRadius, maskRadius * 0.8, d));
                }
                // Blend
                vec3 finalColor = mix(grayColor, color.rgb, mask);
                gl_FragColor = vec4(finalColor, color.a);
            }
        `
        function createShader(type, src) {
            let s = gl.createShader(type)
            gl.shaderSource(s, src)
            gl.compileShader(s)
            return s
        }
        function createProgram(vs, fs) {
            let p = gl.createProgram()
            gl.attachShader(p, vs)
            gl.attachShader(p, fs)
            gl.linkProgram(p)
            return p
        }
        function setup() {
            // Create shaders
            let vshader = createShader(gl.VERTEX_SHADER, vs)
            let fshader = createShader(gl.FRAGMENT_SHADER, fs)
            program = createProgram(vshader, fshader)
            gl.useProgram(program)
            // Quad
            let pos = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, pos)
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
                gl.STATIC_DRAW
            )
            let loc = gl.getAttribLocation(program, "a_position")
            gl.enableVertexAttribArray(loc)
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
            // Uniforms
            uTime = gl.getUniformLocation(program, "u_time")
            uMouse = gl.getUniformLocation(program, "u_mouse")
            uStrength = gl.getUniformLocation(program, "u_strength")
            uSpeed = gl.getUniformLocation(program, "u_speed")
            uResolution = gl.getUniformLocation(program, "u_resolution")
            uWake = gl.getUniformLocation(program, "u_wake")
            uWakeCount = gl.getUniformLocation(program, "u_wakeCount")
            uMaskRadius = gl.getUniformLocation(program, "u_maskRadius")
            // Texture
            tex = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                img
            )
            gl.activeTexture(gl.TEXTURE0)
            gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0)
            loaded = true
        }
        img.onload = () => {
            setup()
            render()
        }
        function updateTexture() {
            if (!tex) return
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
            // Draw image to offscreen canvas with cover logic (high-DPI)
            let offW = size.width
            let offH = size.height
            let offCanvas = document.createElement("canvas")
            offCanvas.width = offW
            offCanvas.height = offH
            let ctx = offCanvas.getContext("2d")
            // Calculate cover
            let iw = img.width,
                ih = img.height
            let scale = Math.max(offW / iw, offH / ih)
            let sw = iw * scale,
                sh = ih * scale
            let sx = (offW - sw) / 2,
                sy = (offH - sh) / 2
            ctx.clearRect(0, 0, offW, offH)
            ctx.drawImage(img, sx, sy, sw, sh)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                offCanvas
            )
        }
        function render() {
            if (!loaded) return
            updateTexture()
            gl.viewport(0, 0, size.width, size.height)
            gl.clear(gl.COLOR_BUFFER_BIT)
            const now = (Date.now() - startTime) / 1000
            gl.uniform1f(uTime, now)
            // Clamp mouse to [0,1] and invert y for WebGL
            let mx = mouseRef.current.active
                ? Math.max(0, Math.min(1, mouseRef.current.x))
                : -10.0
            let my = mouseRef.current.active
                ? Math.max(0, Math.min(1, mouseRef.current.y))
                : -10.0
            my = 1.0 - my
            gl.uniform2f(uMouse, mx, my)
            gl.uniform1f(uStrength, strength * 2.5)
            gl.uniform1f(uSpeed, speed)
            gl.uniform2f(uResolution, size.width, size.height)
            // Wake effect (user + hotspots)
            let nowMs = Date.now()
            let wakeArr = wakeRef.current.slice(-8)
            // Add persistent hotspots
            let hotspotArr = (hotspotsRef.current || [])
                .slice(0, 8)
                .map((h) => ({
                    x: h.x,
                    y: h.y,
                    t: nowMs - 100000, // make t far in the past so they are always active
                }))
            let allWake = [...wakeArr, ...hotspotArr].slice(-16)
            let wakeData = new Float32Array(16 * 3)
            let count = 0
            for (let i = 0; i < allWake.length; ++i) {
                let w = allWake[i]
                // Invert y for WebGL
                wakeData[i * 3 + 0] = w.x
                wakeData[i * 3 + 1] = 1.0 - w.y
                wakeData[i * 3 + 2] = (w.t - startTime) / 1000
                count++
            }
            gl.uniform1i(uWakeCount, count)
            gl.uniform3fv(uWake, wakeData)
            // Mask radius
            gl.uniform1f(uMaskRadius, maskRadiusRef.current)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            animationId = requestAnimationFrame(render)
        }
        return () => {
            if (animationId) cancelAnimationFrame(animationId)
            gl = null
        }
    }, [image.src, size.width, size.height, strength, speed, isStatic])

    // Static fallback
    if (isStatic) {
        return (
            <div
                style={{
                    ...style,
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius,
                }}
            >
                <img
                    src={image.src}
                    alt={image.alt}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius,
                    }}
                />
            </div>
        )
    }

    return (
        <div
            style={{
                ...style,
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius,
            }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onTouchMove={handleMove}
            onTouchEnd={handleLeave}
        >
            <canvas
                ref={canvasRef}
                width={size.width}
                height={size.height}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    borderRadius,
                }}
                aria-label={image.alt}
            />
        </div>
    )
}

addPropertyControls(LiquidImage, {
    image: {
        type: ControlType.ResponsiveImage,
        title: "Image",
        description: "Add your image here.",
    },
    strength: {
        type: ControlType.Number,
        title: "Strength",
        description: "Amount of displacement.",
        defaultValue: 0.03,
        min: 0.01,
        max: 0.5,
        step: 0.01,
    },
    speed: {
        type: ControlType.Number,
        title: "Speed",
        description: "Speed of animation.",
        defaultValue: 0.14,
        min: 0.01,
        max: 1,
        step: 0.01,
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        description: "Radius of displacement.",
        defaultValue: 8,
        min: 0,
        max: 64,
    },
})
