import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface AuditFormProps {
  onSubmit: (input: { type: 'url' | 'image'; value: string | File }) => void;
  isLoading: boolean;
}

export const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'image'>('url');
  const [url, setUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'url' && url.trim()) {
      onSubmit({ type: 'url', value: url.trim() });
    } else if (activeTab === 'image' && uploadedFile) {
      onSubmit({ type: 'image', value: uploadedFile });
    }
  };

  const isFormValid = (activeTab === 'url' && url.trim()) || (activeTab === 'image' && uploadedFile);

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft geometric shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 opacity-30"></div>
        <div className="absolute top-40 left-10 w-48 h-48 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 opacity-20"></div>
        <div className="absolute bottom-32 right-32 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 opacity-40"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="px-8 py-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">LM</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LimeMind</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-4xl text-center">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 leading-tight">
                Uncover Hidden
                <br />
                <span className="font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  UX Issues
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Get instant, AI-powered insights to transform your user experience. 
                Simply enter a URL or upload a screenshot to get started.
              </p>
            </div>

            {/* Clean Form Card */}
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-6">Start Your Audit</h2>

                {/* Minimal Tab Selection */}
                <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('url')}
                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'url'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'image'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Image
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="h-32">
                    {activeTab === 'url' ? (
                      <div className="h-full flex items-center">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all duration-200"
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className={`h-full border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          isDragActive
                            ? 'border-yellow-400 bg-yellow-50'
                            : uploadedFile
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {uploadedFile ? (
                          <div>
                            <div className="text-yellow-500 text-3xl mb-2">✓</div>
                            <p className="text-gray-700 font-medium text-sm">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-gray-300 text-3xl mb-2">📁</div>
                            <p className="text-gray-700 text-sm font-medium mb-1">
                              Drop your screenshot here
                            </p>
                            <p className="text-xs text-gray-500">
                              or click to browse files
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Start AI Audit'
                    )}
                  </button>
                </form>
              </div>

              {/* Simple feature highlights */}
              <div className="flex justify-center items-center space-x-6 mt-8 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Instant Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Actionable Insights</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="py-4 px-8 flex-shrink-0">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-400">
              Powered by advanced AI • Trusted by design teams worldwide
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};