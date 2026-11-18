'use client';

import { useState } from 'react';

export default function ShareButton({ title, text }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Tool 1: Copy link ---
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Tool 2: Share to Facebook ---
  // Opens Facebook's share dialog in a new tab — same mechanism as YouTube's "Share to FB"
  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer');
  };

  // --- Tool 3: Save as PDF ---
  // Triggers browser print dialog; @media print CSS in globals.css formats the output
  const handleSavePdf = () => {
    setIsOpen(false);
    setTimeout(() => window.print(), 150);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-primary" onClick={() => setIsOpen(prev => !prev)}>
        📤 分享此成果
      </button>

      {isOpen && (
        <>
          {/* Backdrop — click to close */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Share Panel */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              background: 'white',
              borderRadius: '20px 20px 0 0',
              padding: '28px 24px 36px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            {/* Handle bar */}
            <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto 20px' }} />

            {/* Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1f2937' }}>分享此成果</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* --- Tool 1: Copy Link --- */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>頁面連結</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
                <span style={{ flex: 1, fontSize: '0.85rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {typeof window !== 'undefined' ? window.location.href : ''}
                </span>
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? '#dcfce7' : 'var(--theme-color)',
                    color: copied ? '#166534' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  {copied ? '✓ 已複製' : '複製'}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: '20px' }} />

            {/* --- Tool 2 & 3: Action Buttons --- */}
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>分享 / 儲存</p>
            <div style={{ display: 'flex', gap: '14px' }}>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 10px',
                  background: '#f0f4ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Facebook logo SVG */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#1877F2"/>
                  <path d="M22 16C22 12.686 19.314 10 16 10C12.686 10 10 12.686 10 16C10 19.001 12.124 21.495 14.938 21.938V17.75H13.437V16H14.938V14.688C14.938 13.207 15.831 12.375 17.178 12.375C17.822 12.375 18.5 12.5 18.5 12.5V13.969H17.751C17.012 13.969 16.75 14.434 16.75 14.906V16H18.438L18.143 17.75H16.75V21.938C19.564 21.495 22 19.001 22 16Z" fill="white"/>
                </svg>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1877F2' }}>分享至 Facebook</span>
              </button>

              {/* PDF */}
              <button
                onClick={handleSavePdf}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 10px',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* PDF icon SVG */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#EA4335"/>
                  <path d="M9 8h9l5 5v11a1 1 0 01-1 1H9a1 1 0 01-1-1V9a1 1 0 011-1z" fill="white" opacity="0.9"/>
                  <path d="M18 8l5 5h-4a1 1 0 01-1-1V8z" fill="white" opacity="0.6"/>
                  <text x="16" y="21" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#EA4335" fontFamily="Arial">PDF</text>
                </svg>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c2410c' }}>儲存為 PDF</span>
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
