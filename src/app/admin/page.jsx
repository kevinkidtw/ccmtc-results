'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function AdminLoginPortal() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // 檢查 sessionStorage 中是否已有快取的 token
    const cachedToken = sessionStorage.getItem('adminToken');
    if (cachedToken) {
      router.replace(`/admin/${encodeURIComponent(cachedToken)}`);
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 儲存於 sessionStorage 中
        sessionStorage.setItem('adminToken', data.token);
        // 跳轉到對應 token 的後台
        router.push(`/admin/${encodeURIComponent(data.token)}`);
      } else {
        setError(data.error || '密碼錯誤，請重新輸入');
      }
    } catch (err) {
      console.error(err);
      setError('登入時發生錯誤，請稍後重試。');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        載入中⋯
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      {/* Banner */}
      <div className="site-banner" style={{ borderRadius: 0 }}>
        <div className="site-banner-left">
          <img src="/logo.jpg" alt="車城自造科技中心" className="site-banner-logo" />
          <span className="site-banner-title">後台管理</span>
        </div>
        <Link href="/" className="site-banner-btn">← 返回首頁</Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '32px 24px', borderRadius: '16px', border: '1px solid rgba(242, 183, 5, 0.25)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px' }}>管理員登入</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>請輸入後台管理密碼以存取系統</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                後台管理密碼
              </label>
              <input
                type="password"
                placeholder="請輸入密碼..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            {error && (
              <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '20px' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? '驗證中⋯' : '確認登入'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
