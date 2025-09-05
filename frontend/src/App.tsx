import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuditForm } from './components/AuditForm';
import { AuditReport } from './components/AuditReport';
import { AuditData } from './types';
import { Toaster, toast } from 'sonner';

function AppContent() {
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load audit data from sessionStorage on component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('mainAuditData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setAuditData(parsedData);
      } catch (error) {
        console.error('Error parsing stored audit data:', error);
      }
    }
  }, []);

  const handleAuditSubmit = async (input: { type: 'url' | 'image'; value: string | File }) => {
    toast.dismiss();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', input.type);
      
      if (input.type === 'url') {
        formData.append('url', input.value as string);
      } else {
        formData.append('image', input.value as File);
      }

      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/audit' 
        : 'http://localhost:3001/api/audit';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let reason = 'Unknown error';
        try {
          const err = await response.json();
          reason = err.message || err.error || JSON.stringify(err);
        } catch {
          try { reason = await response.text(); } catch {}
        }
        toast.error(`Audit failed: ${reason}`);
        return;
      }

      const data = await response.json();
      setAuditData(data);
      sessionStorage.setItem('mainAuditData', JSON.stringify(data));
    } catch (error) {
      console.error('Audit error:', error);
      const reason = (error as Error).message || 'Request failed';
      toast.error(`Audit failed: ${reason}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors />
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
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

