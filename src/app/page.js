"use client";
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [highRes, setHighRes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processUrl = () => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      if (parts.length > 2) parts[1] = 'originals';
      u.pathname = parts.join('/');
      setHighRes(u.toString());
    } catch (e) {
      alert("Please paste a valid Pinterest image address.");
    }
  };

  const handleDownload = (type) => {
    setIsProcessing(true);
    window.location.href = `/api/download?url=${encodeURIComponent(highRes)}&type=${type}`;
    setTimeout(() => setIsProcessing(false), 3000);
  };

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: '"Inter", sans-serif', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>KODO <span style={{ color: '#E60023' }}>STUDIO</span></h1>
      <p style={{ opacity: 0.7, marginBottom: '40px' }}>Apparel Asset Downloader</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          style={{ width: '100%', maxWidth: '500px', padding: '18px', borderRadius: '12px', border: 'none', backgroundColor: '#222', color: '#fff', fontSize: '16px', outline: 'none' }}
          placeholder="Paste Pinterest link here..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <br />
        <button 
          onClick={processUrl} 
          style={{ marginTop: '20px', padding: '12px 40px', backgroundColor: '#fff', color: '#000', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
        >
          Verify Design
        </button>
      </div>
      
      {highRes && (
        <div style={{ marginTop: '50px', animation: 'fadeIn 0.5s ease-in' }}>
          
          {/* FIXED PREVIEW IMAGE: Now using type=preview */}
          <img 
            src={`/api/download?url=${encodeURIComponent(highRes)}&type=preview`} 
            style={{ width: '100%', maxWidth: '300px', borderRadius: '20px', border: '1px solid #444', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
            alt="preview" 
          />
          <br />

          {/* CLEAN 2-BUTTON LAYOUT */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
            
            <button 
              onClick={() => handleDownload('color')}
              disabled={isProcessing}
              style={{ padding: '18px 30px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
            >
              Get Original Size (PNG)
            </button>

            <button 
              onClick={() => handleDownload('vector')}
              disabled={isProcessing}
              style={{ padding: '18px 30px', backgroundColor: '#E60023', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
            >
              Get B&W Vector (SVG)
            </button>

          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}