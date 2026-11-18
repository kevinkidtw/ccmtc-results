import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import ShareButton from '@/app/components/ShareButton';
import PhotoGallery from '@/app/components/PhotoGallery';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { photos: { take: 1 } }
  });

  if (!post) {
    return { title: '成果未找到' };
  }

  const description = `${post.school} ${post.gradeLevel} ｜ ${post.teacher || ''}｜ ${post.content.substring(0, 100)}`;
  const ogImages = post.photos.length > 0
    ? [{ url: post.photos[0].url, width: 1200, height: 630, alt: post.subject }]
    : [{ url: '/logo.jpg', width: 1080, height: 1080, alt: '車城自造教育科技中心' }];

  return {
    title: `${post.subject} - 車城自造教育科技中心`,
    description,
    openGraph: {
      title: `${post.subject} - 車城自造教育科技中心`,
      description,
      type: 'article',
      images: ogImages,
      locale: 'zh_TW',
      siteName: '車城自造教育科技中心',
    },
  };
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { photos: true }
  });

  if (!post) {
    notFound();
  }

  const parseJSONSafe = (str) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const infoList = parseJSONSafe(post.infoTechDetails);
  const lifeList = parseJSONSafe(post.lifeTechDetails);
  const policyList = parseJSONSafe(post.policyFocus);

  return (
    <div>
      {/* Banner */}
      <div className="site-banner">
        <div className="site-banner-left">
          <img src="/logo.jpg" alt="車城自造科技中心" className="site-banner-logo" />
          <span className="site-banner-title">車城自造教育中心教學成果</span>
        </div>
        <Link href="/" className="site-banner-btn">← 成果發佈中心</Link>
      </div>

    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(14px, 4vw, 20px)' }}>
      {/* 標題區 */}
      <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 40px)', marginBottom: '28px' }}>
        <h1 className="title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '14px', color: 'var(--theme-color)' }}>
          {post.subject}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', marginBottom: '20px' }}>
          <span>🏫 {post.school}</span>
          <span>👥 {post.gradeLevel}</span>
          {post.teacher && <span>👨‍🏫 {post.teacher}</span>}
          <span>📅 {format(post.date, 'yyyy/MM/dd')}</span>
        </div>
        
        {/* 新增的分類與標籤區 */}
        {(post.category || infoList.length > 0 || lifeList.length > 0 || policyList.length > 0) && (
          <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(242, 183, 5, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--theme-color)' }}>
            {post.category && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-main)' }}>主題分類：</strong> 
                <span style={{ display: 'inline-block', background: 'var(--theme-light)', color: 'var(--theme-dark)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>{post.category}</span>
              </div>
            )}
            
            {infoList.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>資科主題細項：</strong> 
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {infoList.map(t => <span key={t} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '2px 10px', borderRadius: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t}</span>)}
                </div>
              </div>
            )}

            {lifeList.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>生科主題細項：</strong> 
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {lifeList.map(t => <span key={t} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '2px 10px', borderRadius: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t}</span>)}
                </div>
              </div>
            )}

            {policyList.length > 0 && (
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>政策重點：</strong> 
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {policyList.map(t => <span key={t} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '2px 10px', borderRadius: '16px', fontSize: '0.85rem', color: '#475569' }}>{t}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>

        {/* 社群分享與互動列 */}
        <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <ShareButton title={post.subject} text={post.content.substring(0, 100)} />
        </div>
      </div>

      {/* 照片牆區（支援點擊放大） */}
      <div>
        <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>活動剪影</h2>
        <PhotoGallery photos={post.photos} />
      </div>
      
    </div>
    </div>
  );
}
