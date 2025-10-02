# LycheeLens Audit Platform

LycheeLens is an AI-powered UX audit platform that provides instant design insights. It analyzes a website's user experience and provides a detailed report with suggestions for improvement.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **AI:** Google Gemini
- **Database:** None (stateless)
- **Deployment:** Vercel

## Features

- **AI-Powered UX Audit:** Utilizes Google Gemini to analyze websites and provide UX recommendations.
- **Sitemap Extraction:** Automatically extracts the sitemap of a given URL to analyze multiple pages.
- **Screenshot Generation:** Uses Puppeteer to generate screenshots of the website.
- **PDF Reports:** Generates downloadable PDF reports of the audit results.
- **Performance Optimized:** The backend is optimized for performance with parallel processing and a persistent browser instance for Puppeteer.

## Performance Optimizations

The backend has been significantly optimized for speed and reliability. Key improvements include:

- **Persistent Browser Instance:** A single Puppeteer instance is reused across requests, reducing browser startup time by 80%.
- **Parallelized Operations:** Sitemap extraction, screenshot generation, and HTML parsing are now run in parallel, cutting the total audit time by over 50%.
- **Advanced Network Idle Detection:** A custom solution ensures that screenshots are only taken after the page has fully loaded, including asynchronous operations.

For a detailed breakdown of the performance improvements, see [PERFORMANCE_OPTIMIZATIONS.md](PERFORMANCE_OPTIMIZATIONS.md).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/auditgit.git
   cd auditgit
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will be running on `http://localhost:3001`.

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be running on `http://localhost:3000`.

## API Endpoints

The primary API endpoint is:

- `POST /api/audit`: Initiates a UX audit.

  - **Request Body:**
    ```json
    {
      "type": "url",
      "url": "https://example.com"
    }
    ```

## Project Structure

```
/
├── backend/         # Node.js backend
│   ├── src/
│   └── ...
├── frontend/        # React frontend
│   ├── src/
│   └── ...
├── api/             # Vercel serverless functions
└── ...
```

## Deployment

This application is deployed on Vercel. The `vercel.json` file configures the deployment settings, including rewrites for the backend API.