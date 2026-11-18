'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function HomeContent({ initialPosts }) {
  const [activeSubject, setActiveSubject] = useState('全部');
  const [heroIndex, setHeroIndex] = useState(0);

  const subjects = ['全部', ...Array.from(new Set(initialPosts.map(p => p.subject)))];

  const filteredPosts = activeSubject === '全部'
    ? initialPosts
    : initialPosts.filter(p => p.subject === activeSubject);

  const heroPhotos = initialPosts
    .filter(p => p.photos && p.photos.length > 0)
    .slice(0, 5)
    .map(p => ({ url: p.photos[0].url, title: p.subject, id: p.id }));

  useEffect(() => {
    if (heroPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroPhotos.length]);

  return (
    <div>
      {/* Top Banner */}
      <div className="site-banner">
        <div className="site-banner-left">
          <img src="/logo.jpg" alt="車城自造科技中心" className="site-banner-logo" />
          <h1 className="site-banner-title">車城自造教育中心教學成果</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <a href="https://ccmtc.mooo.com" className="site-banner-btn" style={{ background: 'rgba(0,0,0,0.25)' }}>
            ← 回主站
          </a>
          <Link href="/portal-upload-center" className="site-banner-btn">
            + 上傳成果
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        {heroPhotos.length > 0 ? (
          heroPhotos.map((photo, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: idx === heroIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url(${photo.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: idx === heroIndex ? 'scale(1.05)' : 'scale(1)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '1s, 5s'
              }}
            >
              <div style={{ position: 'absolute', bottom: '10%', left: '10%', color: 'white' }}>
                <span style={{ background: 'var(--theme-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold' }}>最新發佈</span>
                <h2 className="hero-text-title">{photo.title}</h2>
              </div>
            </div>
          ))
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--theme-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 className="title" style={{ color: 'white', fontSize: '2.5rem' }}>車城自造教育科技中心</h1>
          </div>
        )}
      </div>

      <div className="main-container">
        {/* Tag Cloud */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>依據課程主題篩選：</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {subjects.map(subject => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`tag-btn ${activeSubject === subject ? 'active' : ''}`}
                style={{
                  transform: activeSubject === subject ? 'scale(1.1) translateY(-2px)' : `rotate(${Math.sin(subject.length) * 3}deg)`
                }}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Card Grid */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            目前還沒有發佈教學成果喔！
          </div>
        ) : (
          <div className="post-grid">
            {filteredPosts.map((post, index) => (
              <Link href={`/post/${post.id}`} key={post.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                <div
                  className="glass-panel"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(242, 183, 5, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.07)';
                  }}
                >
                  <div style={{ height: '200px', backgroundColor: '#e2e8f0', position: 'relative' }}>
                    {post.photos && post.photos.length > 0 ? (
                      <img
                        src={post.photos[0].url}
                        alt="成果封面"
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>無照片</div>
                    )}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--theme-color)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {post.gradeLevel}
                    </div>
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>{post.subject}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{post.school} • {format(new Date(post.date), 'yyyy-MM-dd')}</p>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {post.content}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 教學成果一覽表 */}
        {filteredPosts.length > 0 && (
          <div className="glass-panel animate-fade-in" style={{ marginTop: '50px', padding: '24px', overflowX: 'auto', animationDelay: '0.3s' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 'bold', borderLeft: '4px solid var(--theme-color)', paddingLeft: '12px' }}>教學成果一覽表</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--theme-color)' }}>
                  <th style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--text-muted)' }}>時間</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--text-muted)' }}>學校/年段</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--text-muted)' }}>授課教師</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--text-muted)' }}>主題分類</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--text-muted)' }}>教學主題</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center', width: '100px' }}>查看</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, idx) => (
                  <tr key={`list-${post.id}`}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.5)',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-light)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.5)'}
                  >
                    <td style={{ padding: '12px 10px', color: 'var(--text-main)', fontWeight: '500' }}>{format(new Date(post.date), 'yyyy-MM-dd')}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-main)' }}>
                      <span>{post.school}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '12px' }}>{post.gradeLevel}</span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-main)' }}>{post.teacher || '-'}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--theme-dark)', fontWeight: 'bold' }}>{post.category || '未分類'}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-main)' }}>{post.subject}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <Link href={`/post/${post.id}`} className="btn-primary" style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', display: 'inline-block', whiteSpace: 'nowrap' }}>
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
