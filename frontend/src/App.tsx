import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuditForm } from './components/AuditForm';
import { AuditReport } from './components/AuditReport';
import { DeepDiveReport } from './components/DeepDiveReport';
import { AuditData } from './types';
import { mockAuditData } from './mockData';

function AppContent() {
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load audit data from sessionStorage on component mount
  useEffect(() => {
    // Check for stored audit data with either key
    const mainData = sessionStorage.getItem('mainAuditData');
    const deepDiveData = sessionStorage.getItem('deepDiveAuditData');
    
    console.log('Checking sessionStorage for audit data:');
    console.log('mainData:', mainData ? 'found' : 'not found');
    console.log('deepDiveData:', deepDiveData ? 'found' : 'not found');
    
    const storedData = mainData || deepDiveData;
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Loading audit data from sessionStorage:', parsedData.url || 'image data');
        setAuditData(parsedData);
      } catch (error) {
        console.error('Error parsing stored audit data:', error);
      }
    } else {
      console.log('No stored audit data found');
    }
  }, []);

  const handleAuditSubmit = async (input: { type: 'url' | 'image'; value: string | File }) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', input.type);
      
      if (input.type === 'url') {
        formData.append('url', input.value as string);
      } else {
        formData.append('image', input.value as File);
      }

      const response = await fetch('http://localhost:3001/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Audit failed');
      }

      const data = await response.json();
      setAuditData(data);
      // Store audit data in sessionStorage for consistent navigation
      sessionStorage.setItem('mainAuditData', JSON.stringify(data));
      sessionStorage.setItem('deepDiveAuditData', JSON.stringify(data));
    } catch (error) {
      console.error('Audit error:', error);
      alert('Audit failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/" 
          element={
            !auditData ? (
              <AuditForm onSubmit={handleAuditSubmit} isLoading={isLoading} />
            ) : (
              <AuditReport data={auditData} />
            )
          } 
        />
        <Route 
          path="/report" 
          element={<ReportPage />} 
        />
        <Route 
          path="/deep-dive" 
          element={<DeepDivePage />} 
        />
      </Routes>
    </div>
  );
}

function ReportPage() {
  const [reportData, setReportData] = useState<AuditData | null>(null);

  useEffect(() => {
    // Load audit data from sessionStorage
    const mainData = sessionStorage.getItem('mainAuditData');
    const deepDiveData = sessionStorage.getItem('deepDiveAuditData');
    
    const storedData = mainData || deepDiveData;
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setReportData(parsedData);
      } catch (error) {
        console.error('Error parsing stored audit data:', error);
        // Fallback to mock data
        setReportData(mockAuditData);
      }
    } else {
      // If no stored data, use mock data
      setReportData(mockAuditData);
    }
  }, []);

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading report...</h2>
        </div>
      </div>
    );
  }

  return <AuditReport data={reportData} />;
}

function DeepDivePage() {
  const [deepDiveData, setDeepDiveData] = useState<AuditData | null>(null);

  useEffect(() => {
    // Try to load audit data from sessionStorage
    const storedData = sessionStorage.getItem('deepDiveAuditData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setDeepDiveData(parsedData);
      } catch (error) {
        console.error('Error parsing stored audit data:', error);
        // Fallback to mock data for development
        setDeepDiveData(mockAuditData);
      }
    } else {
      // If no stored data, use mock data for development/testing
      setDeepDiveData(mockAuditData);
      // Store mock data so other components can access it
      sessionStorage.setItem('deepDiveAuditData', JSON.stringify(mockAuditData));
      sessionStorage.setItem('mainAuditData', JSON.stringify(mockAuditData));
    }
  }, []);

  if (!deepDiveData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No audit data available</h2>
          <p className="text-gray-600 mb-4">Please perform an audit first.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-xl font-medium hover:bg-yellow-500 transition-colors"
          >
            Start New Audit
          </button>
        </div>
      </div>
    );
  }

  return <DeepDiveReport data={deepDiveData} />;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
