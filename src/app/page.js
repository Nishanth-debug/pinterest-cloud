"use client";
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [highRes, setHighRes] = useState('');

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

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E60023' }}>Kodo Downloader</h1>
      <input 
        style={{ width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        placeholder="Paste Pinterest link..." 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <br />
      <button onClick={processUrl} style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer' }}>
        Verify High-Res
      </button>
      
      {highRes && (
        <div style={{ marginTop: '30px' }}>
          <img src={highRes} style={{ width: '100%', maxWidth: '300px', borderRadius: '10px' }} alt="preview" />
          <br />
          <button 
            onClick={() => window.location.href = `/api/download?url=${encodeURIComponent(highRes)}`}
            style={{ 
              marginTop: '15px', 
              padding: '15px 30px', 
              backgroundColor: '#E60023', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Download Original Quality
          </button>
        </div>
      )}
    </div>
  );
}