'use client';

import { useState, useEffect } from 'react';

export default function ViewsCounter() {
  const [views, setViews] = useState(null);

  useEffect(() => {
    // 透過同 Domain 的中央 API 進行累加並獲取計數
    fetch('/api/counter?site=results')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setViews(data.count);
        }
      })
      .catch(err => console.error('Failed to load view count:', err));
  }, []);

  return (
    <footer style={{ background: '#1e293b', borderTop: '1px solid #334155', padding: '24px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textAlign: 'center', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span>© 2026 車城自造教育科技中心 CCMTC. 教學成果中心版權所有。</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>📊 累積瀏覽次數：</span>
            <strong style={{ color: '#f2b705', fontFamily: 'monospace', fontWeight: 700 }}>{views !== null ? views.toLocaleString() : '...'}</strong>
          </span>
          <span style={{ opacity: 0.8 }}>主辦：車城自造教育科技中心</span>
        </div>
      </div>
    </footer>
  );
}
