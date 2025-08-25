# UX Audit Platform

AI-powered UX audit platform using Gemini AI to analyze websites and screenshots for usability issues based on Nielsen's heuristics, UX laws, copywriting quality, and accessibility standards.

## 🚀 Features

- **URL Analysis**: Automatically capture and analyze any public website
- **Image Upload**: Upload screenshots for detailed UX analysis  
- **AI-Powered Insights**: Gemini AI provides comprehensive UX evaluation
- **Professional Reports**: Generate branded PDF reports with actionable recommendations
- **Multiple Assessment Categories**:
  - Nielsen's 10 Usability Heuristics (40% weight)
  - UX Laws: Fitts's, Hick's, Miller's Rules (30% weight)  
  - Copywriting Quality (20% weight)
  - Basic Accessibility (10% weight)
- **Responsive Design**: Works on desktop and mobile devices
- **No Login Required**: Frictionless audit experience

## 🏗️ Architecture

### Frontend (React + TypeScript + Tailwind)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Components**: Modular component architecture
- **File Upload**: Drag-and-drop interface with react-dropzone
- **PDF Export**: Client-side PDF generation with jsPDF

### Backend (Node.js + Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **AI Integration**: Google Gemini 1.5 Pro for UX analysis
- **Screenshot Capture**: Puppeteer for automated website screenshots
- **Image Processing**: Sharp for image optimization
- **File Handling**: Multer for upload management

## 📋 Prerequisites

- Node.js 18+ and npm
- Chrome/Chromium (for Puppeteer)
- Gemini API key from Google AI Studio

## 🛠️ Installation & Setup

1. **Clone and install dependencies**:
```bash
cd ux-audit-platform
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. **Configure environment variables**:
The Gemini API key is already configured in `backend/.env`:
```
GEMINI_API_KEY=AIzaSyCv662IWsKFtys9izsueAEtGr5w0mMiiFI
PORT=3001
```

3. **Start the development servers**:
```bash
# From the root directory - starts both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # React app on http://localhost:3000
npm run dev:backend   # API server on http://localhost:3001
```

## 🎯 Usage

### Web Interface
1. Open http://localhost:3000
2. Choose analysis type:
   - **URL**: Enter any public website URL
   - **Image**: Upload a screenshot (PNG, JPG, WebP up to 10MB)
3. Click "Start UX Audit"
4. Review results and download PDF report

### API Endpoints

**POST** `/api/audit`
- Analyze URL or uploaded image
- Form data: `type=url&url=https://example.com` OR `type=image` with file upload

**GET** `/api/health`
- Check service health status

**GET** `/api/status`  
- Get audit service status

## 📊 Analysis Framework

### Nielsen's Heuristics (40 points)
- Visibility of system status
- Match between system and real world  
- User control and freedom
- Consistency and standards
- Error prevention
- Recognition rather than recall
- Flexibility and efficiency of use
- Aesthetic and minimalist design
- Help users recognize, diagnose, recover from errors
- Help and documentation

### UX Laws (30 points)
- **Fitts's Law**: Button sizes and click target accessibility
- **Hick's Law**: Choice complexity and decision time
- **Miller's Rule**: Cognitive load and information chunking
- **Law of Proximity**: Visual grouping and spatial relationships

### Copywriting (20 points)
- Clarity and conciseness
- Call-to-action effectiveness  
- Tone consistency
- Information hierarchy
- Microcopy quality

### Accessibility (10 points)
- Color contrast compliance (WCAG AA)
- Text readability
- Button/link visibility
- Visual hierarchy

## 🏗️ Build & Deploy

### Development
```bash
npm run dev  # Start both services
```

### Production Build
```bash
npm run build          # Build both frontend and backend
npm run build:frontend # Build React app only  
npm run build:backend  # Build Node.js API only
```

### Production Start
```bash
npm start  # Start production server
```

## 📁 Project Structure

```
ux-audit-platform/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AuditForm.tsx
│   │   │   ├── AuditResults.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ScoreCard.tsx
│   │   │   ├── IssuesList.tsx
│   │   │   └── PDFExport.tsx
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── App.tsx          # Main app component
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   │   ├── geminiService.ts    # AI analysis
│   │   │   └── screenshotService.ts # Image processing
│   │   ├── types/           # TypeScript interfaces  
│   │   ├── utils/           # Helper functions
│   │   └── index.ts         # Express server
│   ├── uploads/             # Temporary file storage
│   ├── .env                 # Environment variables
│   └── package.json
├── package.json             # Root package with scripts
└── README.md
```

## 🔧 Configuration

### Environment Variables (backend/.env)
- `GEMINI_API_KEY`: Google Gemini API key (already configured)
- `PORT`: Backend server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

### Gemini AI Settings
- Model: `gemini-1.5-pro`
- Temperature: 0.1 (focused responses)
- Max Output: 4096 tokens
- Context: Comprehensive UX analysis prompt

## 🚨 Troubleshooting

### Common Issues

**Puppeteer/Chrome Issues**:
```bash
# Install Chrome dependencies (Linux)
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libatk1.0-0 libgtk-3-0

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

**Memory Issues**:
- Increase Node.js memory: `node --max-old-space-size=4096`
- Reduce image quality in `screenshotService.ts`

**CORS Issues**:
- Update allowed origins in `backend/src/index.ts`
- Check frontend URL matches CORS configuration

### Performance Optimization
- Enable Redis caching for repeated audits
- Implement image compression for faster uploads  
- Add request rate limiting for production use
- Use CDN for static assets

## 📈 Future Enhancements

- **User Accounts**: Save audit history and projects
- **Team Collaboration**: Share audits and comments
- **Advanced Analytics**: Heatmaps, SEO, performance metrics
- **API Integration**: Webhook support and third-party tools
- **White Label**: Custom branding for agencies
- **Batch Processing**: Multiple URL analysis
- **Video Analysis**: Screen recording audit capability

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Email: support@ly-design.com
- Documentation: [Project Wiki](link-to-wiki)

---

**Powered by LY Design** 🎨✨