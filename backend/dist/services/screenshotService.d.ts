export declare class ScreenshotService {
    captureWebsite(url: string): Promise<Buffer>;
    processUploadedImage(buffer: Buffer): Promise<Buffer>;
    bufferToBase64(buffer: Buffer): string;
}
//# sourceMappingURL=screenshotService.d.ts.map