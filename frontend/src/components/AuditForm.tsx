import React, { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, Globe, CheckCircle } from 'lucide-react';

interface AuditFormProps {
  onSubmit: (input: { type: 'url' | 'image'; value: string | File }) => void;
  isLoading: boolean;
}


export const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'image'>('url');
  const [url, setUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setError('');
      setUploadedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (activeTab === 'url') {
      if (!url.trim()) {
        setError('Please enter a valid URL');
        return;
      }
      const processedUrl = url.trim().startsWith('http://') || url.trim().startsWith('https://') ? url.trim() : `https://${url.trim()}`;
      onSubmit({ type: 'url', value: processedUrl });
    } else if (activeTab === 'image') {
      if (!uploadedFile) {
        setError('Please select an image file');
        return;
      }
      onSubmit({ type: 'image', value: uploadedFile });
    }
  };

  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, tab: 'url' | 'image') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  const isFormValid = (activeTab === 'url' && url.trim()) || (activeTab === 'image' && uploadedFile);

  return (
    <div 
      className="min-h-screen relative" 
      style={{
        fontFamily: 'Inter, sans-serif',
        background: `
          /* overlay on top (semi-transparent) */
          radial-gradient(circle at 35% 25%,
            rgba(255,255,255,0.85) 0%,
            rgba(255,255,255,0.70) 45%,
            rgba(255,255,255,0.45) 70%,
            rgba(255,255,255,0.25) 100%),
          /* grid underneath */
          repeating-linear-gradient(0deg,
            rgba(15,23,42,0.14) 0, rgba(15,23,42,0.14) 1px,
            transparent 1px, transparent 56px),
          repeating-linear-gradient(90deg,
            rgba(15,23,42,0.14) 0, rgba(15,23,42,0.14) 1px,
            transparent 1px, transparent 56px)
        `,
        backgroundSize: 'auto, auto, auto',
        backgroundRepeat: 'no-repeat, repeat, repeat'
      }}
    >
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Header */}
          <header className="pt-8 pb-12">
            <div className="flex items-center justify-center md:justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold text-lg">LM</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">LimeMind</span>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
            
            {/* Left Column - Content */}
            <motion.div 
              className="md:col-span-7 lg:col-span-6 text-center md:text-left"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <h1 
                className="font-bold text-gray-900 mb-6 leading-tight"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              >
                Design clarity,
                <br />
                instantly.
              </h1>
              <p className="text-xl text-slate-700 max-w-xl leading-relaxed mb-8">
                Uncover UX issues in seconds. Powered by Lemon Yellow's design expertise.
              </p>
            </motion.div>

            {/* Right Column - Audit Card */}
            <motion.div 
              className="md:col-span-5 lg:col-span-6 flex justify-center md:justify-end"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  
                  {/* Segmented Tabs */}
                  <div className="flex bg-gray-100 rounded-xl p-1 mb-6" role="tablist" aria-label="Audit input method">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'url'}
                      aria-controls="url-panel"
                      onClick={() => setActiveTab('url')}
                      onKeyDown={(e) => handleTabKeyDown(e, 'url')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                        activeTab === 'url'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      URL
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'image'}
                      aria-controls="image-panel"
                      onClick={() => setActiveTab('image')}
                      onKeyDown={(e) => handleTabKeyDown(e, 'image')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                        activeTab === 'image'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Image
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tab Panels */}
                    <div className="h-[100px]">
                      {activeTab === 'url' ? (
                        <div id="url-panel" role="tabpanel" aria-labelledby="url-tab">
                          <label htmlFor="url-input" className="sr-only">
                            Enter website URL for UX audit
                          </label>
                          <div className="h-[52px] relative">
                            <input
                              id="url-input"
                              type="text"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              placeholder="Paste a link (e.g., https://example.com)"
                              className="w-full h-full px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                              disabled={isLoading}
                              required
                              aria-describedby={error ? 'error-message' : undefined}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-3 leading-tight">
                            Enter any website URL to analyze its user experience
                          </p>
                        </div>
                      ) : (
                        <div id="image-panel" role="tabpanel" aria-labelledby="image-tab">
                          <label htmlFor="file-input" className="block">
                            <div className={`border-2 border-dashed rounded-xl text-center transition-all cursor-pointer h-[52px] flex items-center justify-center ${
                              uploadedFile
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400 bg-gray-50 focus-within:ring-2 focus-within:ring-yellow-400'
                            }`}>
                              <input
                                id="file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                                disabled={isLoading}
                                aria-describedby={error ? 'error-message' : undefined}
                              />
                              {uploadedFile ? (
                                <div className="flex items-center justify-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-700 font-medium truncate">{uploadedFile.name}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <p className="text-sm text-gray-700">
                                    Drop screenshot or click to browse
                                  </p>
                                </div>
                              )}
                            </div>
                          </label>
                          <p className="text-xs text-gray-500 mt-3 leading-tight">
                            Upload a screenshot of your website or interface
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div id="error-message" role="alert" aria-live="polite" className="text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 min-h-[44px]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span>Analysing...</span>
                        </div>
                      ) : (
                        'Analyse UX'
                      )}
                    </button>
                  </form>

                  {/* Microcopy */}
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    No storage. Instant insights.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="pb-12 text-center">
            <p className="text-sm text-gray-500">
              Powered by Lemon Yellow LLP. Created with ❤️ in India
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
};