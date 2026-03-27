"use client";
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [highRes, setHighRes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');

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

  const handleStandardDownload = (type) => {
    setIsProcessing(true);
    setStatusText('Downloading from Vercel Server...');
    window.location.href = `/api/download?url=${encodeURIComponent(highRes)}&type=${type}`;
    setTimeout(() => {
      setIsProcessing(false);
      setStatusText('');
    }, 3000);
  };

  // --- THE NEW BROWSER AI ENGINE ---
  const handleAIUpscale = async () => {
    setIsProcessing(true);
    try {
      // 1. Fetch the raw image through our Vercel Proxy (bypasses CORS security)
      setStatusText('Fetching base image...');
      const response = await fetch(`/api/download?url=${encodeURIComponent(highRes)}&type=color`);
      const blob = await response.blob();
      const imageObjectUrl = URL.createObjectURL(blob);

      // 2. Load it into a temporary HTML Image Element
      const img = new Image();
      img.src = imageObjectUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      // 3. Dynamically load TensorFlow & Upscaler (prevents server crashes)
      setStatusText('Loading Neural Network (First time takes a few seconds)...');
      const { default: Upscaler } = await import('upscaler');
      const upscaler = new Upscaler();

      // 4. Run the AI processing using your Laptop's GPU
      setStatusText('AI Upscaling in progress... Please wait 10-30 seconds.');
      const upscaledImageBase64 = await upscaler.upscale(img);

      // 5. Trigger the download of the massive new file
      setStatusText('Done! Downloading Kodo DTF Master...');
      const link = document.createElement('a');
      link.href = upscaledImageBase64;
      link.download = `kodo_ai_master_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error(error);
      alert("AI Processing Failed. Image might be too large for browser memory.");
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: '"Inter", sans-serif', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>KODO <span style={{ color: '#E60023' }}>STUDIO</span></h1>
      <p style={{ opacity: 0.7, marginBottom: '40px' }}>Local AI Web Upscaler</p>
      
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
          <img src={highRes} style={{ width: '100%', maxWidth: '300px', borderRadius: '20px', border: '1px solid #444', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} alt="preview" />
          <br />

          {statusText && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#222', borderRadius: '8px', color: '#00f2fe', fontWeight: 'bold', display: 'inline-block' }}>
              ⚙️ {statusText}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
            
            {/* VERCEL PROXY DOWNLOAD */}
            <button 
              onClick={() => handleStandardDownload('color')}
              disabled={isProcessing}
              style={{ padding: '15px 25px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
            >
              Get Original Size (PNG)
            </button>

            {/* BROWSER AI UPSCALER */}
            <button 
              onClick={handleAIUpscale}
              disabled={isProcessing}
              style={{ padding: '15px 25px', backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px 0 rgba(0,242,254,0.39)' }}
            >
              ✨ Run Browser AI Upscale (2x)
            </button>

            {/* VECTOR BUTTON */}
            <button 
              onClick={() => handleStandardDownload('vector')}
              disabled={isProcessing}
              style={{ padding: '15px 25px', backgroundColor: '#E60023', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
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