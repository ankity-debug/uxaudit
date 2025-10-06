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

  const handleAuditSubmit = async (input: { type: 'url' | 'image'; value: string | File; name: string; email: string }) => {
    toast.dismiss();
    setIsLoading(true);
    try {
      // Step 1: Send user data to database (non-blocking, parallel with audit)
      const userDataFormData = new FormData();
      userDataFormData.append('name', input.name);
      userDataFormData.append('email', input.email);

      const sendUserDataPromise = fetch('https://qa-lywebsite.ly.design/uxaudit/', {
        method: 'POST',
        body: userDataFormData,
      }).then(response => {
        if (response.ok) {
          console.log('✅ User data sent to database');
        } else {
          console.warn('⚠️ Failed to send user data to database');
        }
      }).catch(err => {
        console.warn('⚠️ Database unreachable:', err.message);
      });

      // Step 2: Run audit (parallel with user data submission)
      const auditFormData = new FormData();
      auditFormData.append('type', input.type);
      auditFormData.append('name', input.name);
      auditFormData.append('email', input.email);

      if (input.type === 'url') {
        auditFormData.append('url', input.value as string);
      } else {
        auditFormData.append('image', input.value as File);
      }

      const apiUrl = process.env.NODE_ENV === 'production'
        ? '/api/audit'
        : 'http://localhost:3001/api/audit';

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: auditFormData,
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

      // Wait for user data to complete (best effort, don't block UI)
      await Promise.race([
        sendUserDataPromise,
        new Promise(resolve => setTimeout(resolve, 5000)) // 5 second timeout
      ]);

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

