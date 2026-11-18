'use client';

import { useState, useEffect, useCallback } from 'react';

export default function PhotoGallery({ photos }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  const close  = useCallback(() => setSelectedIdx(null), []);
  const prev   = useCallback(() => setSelectedIdx(i => (i > 0 ? i - 1 : photos.length - 1)), [photos.length]);
  const next   = useCallback(() => setSelectedIdx(i => (i < photos.length - 1 ? i + 1 : 0)), [photos.length]);

  useEffect(() => {
    if (selectedIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape')     close();
      else if (e.key === 'ArrowLeft')  prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIdx, close, prev, next]);

  // 預載前後張，讓切換時幾乎無延遲
  useEffect(() => {
    if (selectedIdx === null) return;
    const targets = [selectedIdx - 1, selectedIdx + 1]
      .filter(i => i >= 0 && i < photos.length);
    targets.forEach(i => { const img = new Image(); img.src = photos[i].url; });
  }, [selectedIdx, photos]);

  // 防止背景滾動
  useEffect(() => {
    if (selectedIdx === null) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [selectedIdx]);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => setSelectedIdx(idx)}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              aspectRatio: '1',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'zoom-in',
              transition: 'transform 0.2s ease-in-out',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseOut={(e)  => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img
              src={photo.url}
              alt="活動照片"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {selectedIdx !== null && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(90vw, 800px)',
              maxHeight: '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 關閉 */}
            <button
              onClick={close}
              style={{
                position: 'absolute', top: '-44px', right: 0,
                background: 'none', border: 'none', color: 'white',
                fontSize: '2.5rem', lineHeight: 1, cursor: 'pointer', opacity: 0.8,
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e =>  e.currentTarget.style.opacity = '0.8'}
            >&times;</button>

            {/* 左箭頭 */}
            {photos.length > 1 && (
              <button onClick={prev} style={navBtnStyle('left')}>‹</button>
            )}

            <img
              src={photos[selectedIdx].url}
              alt="放大照片"
              style={{
                maxWidth: '100%', maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                animation: 'scaleIn 0.15s ease-out',
              }}
            />

            {/* 右箭頭 */}
            {photos.length > 1 && (
              <button onClick={next} style={navBtnStyle('right')}>›</button>
            )}

            {/* 計數器 */}
            {photos.length > 1 && (
              <div style={{
                position: 'absolute', bottom: '-36px',
                left: '50%', transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem',
                background: 'rgba(0,0,0,0.4)', padding: '3px 10px', borderRadius: '99px',
              }}>
                {selectedIdx + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}

const navBtnStyle = (side) => ({
  position: 'absolute',
  [side]: '-52px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.5)',
  border: 'none',
  color: 'white',
  fontSize: '2.2rem',
  width: '44px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: '6px',
  opacity: 0.75,
  transition: 'opacity 0.15s, background 0.15s',
});
