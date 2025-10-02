import React, { useState, KeyboardEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Globe, CheckCircle, User, Mail } from 'lucide-react';
import { Header } from './Header';
import LycheeBrandingPopup from './LycheeBrandingPopup';
import { saveUserData, validateEmail, validateName } from '../utils/userStorage';

interface AuditFormProps {
  onSubmit: (input: { type: 'url' | 'image'; value: string | File }) => void;
  isLoading: boolean;
}


export const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'image'>('url');
  const [url, setUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // User data fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const loadingSteps = [
    'Analyzing interface...',
    'Checking heuristics...',
    'Assessing revenue impact...',
    'Evaluating accessibility...',
    'Generating insights...'
  ];

  // Cycle through loading steps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 2000); // Change step every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, loadingSteps.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setError('');
    setUploadedFile(file);
    setActiveTab('image'); // Switch to image tab when file is dropped
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeTab === 'image') {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!validateName(name)) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Save user data to storage (will be replaced with DB later)
    try {
      await saveUserData({ name, email });
    } catch (err) {
      setError('Failed to save user data. Please try again.');
      return;
    }

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

  const isFormValid =
    name.trim() &&
    email.trim() &&
    ((activeTab === 'url' && url.trim()) || (activeTab === 'image' && uploadedFile));

  return (
    <>
      {/* Lychee Branding Popup */}
      <LycheeBrandingPopup
        isVisible={isLoading}
        loadingStep={loadingStep}
        loadingSteps={loadingSteps}
      />

      <div
        className={`min-h-screen relative ${
          activeTab === 'image' && isDragging ? 'bg-blue-50' : ''
        }`}
        style={{
          fontFamily: 'Inter, sans-serif',
          background: activeTab === 'image' && isDragging ? 'rgba(59, 130, 246, 0.05)' : `
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
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Header */}
          <Header />

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
                className="text-gray-900 mb-6 leading-tight"
                style={{ 
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: '800',
                  letterSpacing: '-0.025em'
                }}
              >
                Design clarity,
                <br />
                instantly.
              </h1>
              <p className="text-xl text-slate-700 max-w-xl leading-relaxed mb-8">
                Instant audits that turn into ticket-ready tasks.
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

                  {/* User Info Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      Share your details
                    </h3>
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div>
                      <label htmlFor="name-input" className="sr-only">
                        Your full name
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          id="name-input"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full h-[52px] pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email-input" className="sr-only">
                        Your email address
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Mail className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          id="email-input"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full h-[52px] pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Audit Input Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      What would you like LycheeLens to audit?
                    </h3>

                    {/* Segmented Tabs */}
                    <div className="relative flex bg-gray-100 rounded-xl p-1 mb-4" role="tablist" aria-label="Audit input method">
                    {/* Animated Background */}
                    <motion.div
                      className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
                      initial={false}
                      animate={{
                        x: activeTab === 'url' ? '0%' : '100%',
                        width: 'calc(50% - 4px)'
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        duration: 0.4
                      }}
                      style={{
                        left: '4px'
                      }}
                    />
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'url'}
                      aria-controls="url-panel"
                      onClick={() => setActiveTab('url')}
                      onKeyDown={(e) => handleTabKeyDown(e, 'url')}
                      className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
                        activeTab === 'url'
                          ? 'text-gray-900'
                          : 'text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
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
                      className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
                        activeTab === 'image'
                          ? 'text-gray-900'
                          : 'text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Image
                    </button>
                  </div>

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
                              className="w-full h-full px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
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
                                : isDragging
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400 bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500'
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
                                    {isDragging ? 'Drop image here' : 'Drop screenshot or click to browse'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </label>
                          <p className="text-xs text-gray-500 mt-3 leading-tight">
                            {isDragging ? 'Release to upload image' : 'Upload a screenshot of your website or interface'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                      <div id="error-message" role="alert" aria-live="polite" className="text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 min-h-[44px]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="flex space-x-1">
                            <motion.div 
                              className="w-2 h-2 bg-gray-900 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-gray-900 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-gray-900 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <motion.span
                            key={loadingStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            {loadingSteps[loadingStep]}
                          </motion.span>
                        </div>
                      ) : (
                        'Analyse UX'
                      )}
                    </button>
                  </form>

                  {/* Privacy Notice */}
                  <p className="text-xs text-gray-500 mt-4 text-left">
                    🔒 We don't store any data. Instant insights.
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
    </>
  );
};