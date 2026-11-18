'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function AdminDashboard() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [deletingTplId, setDeletingTplId] = useState(null);

  // 新增範本相關 state
  const [showAddTpl, setShowAddTpl] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplCategory, setNewTplCategory] = useState('3D列印');
  const [newTplCustomCategory, setNewTplCustomCategory] = useState('');
  const [newTplContent, setNewTplContent] = useState('');
  const [savingTpl, setSavingTpl] = useState(false);

  const handleAddTemplate = async (e) => {
    e.preventDefault();
    if (!newTplName.trim() || !newTplContent.trim()) {
      alert('請填寫範本名稱與內容');
      return;
    }
    const finalCategory = newTplCategory === '自訂' ? newTplCustomCategory.trim() : newTplCategory;
    if (!finalCategory) {
      alert('請選擇或填寫課程主題分類');
      return;
    }

    setSavingTpl(true);
    try {
      const res = await fetch(`${BASE}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTplName,
          content: newTplContent,
          category: finalCategory
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => [data.template, ...prev]);
        setNewTplName('');
        setNewTplContent('');
        setNewTplCustomCategory('');
        setShowAddTpl(false);
        alert('範本新增成功！');
      } else {
        alert('新增失敗：' + (data.error || '未知錯誤'));
      }
    } catch (err) {
      console.error(err);
      alert('新增範本時發生錯誤');
    } finally {
      setSavingTpl(false);
    }
  };

  useEffect(() => {
    fetch(`${BASE}/api/admin/posts?token=${encodeURIComponent(token)}`)
      .then(r => {
        if (r.status === 401) { router.replace('/'); return null; }
        return r.json();
      })
      .then(data => {
        if (data?.success) setPosts(data.posts);
      })
      .finally(() => setLoading(false));

    fetch(`${BASE}/api/templates`)
      .then(r => r.json())
      .then(data => { if (data.success) setTemplates(data.templates); });
  }, [token, router]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`確定要刪除「${title}」嗎？\n此操作無法復原，照片也會一併刪除。`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${BASE}/api/admin/posts/${id}?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        alert('刪除失敗：' + (data.error || '未知錯誤'));
      }
    } catch {
      alert('刪除時發生錯誤');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteTemplate = async (id, name) => {
    if (!window.confirm(`確定要刪除範本「${name}」嗎？`)) return;
    setDeletingTplId(id);
    try {
      const res = await fetch(`${BASE}/api/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      } else {
        alert('刪除失敗：' + (data.error || '未知錯誤'));
      }
    } catch {
      alert('刪除時發生錯誤');
    } finally {
      setDeletingTplId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Banner */}
      <div className="site-banner">
        <div className="site-banner-left">
          <img src="/logo.jpg" alt="車城自造科技中心" className="site-banner-logo" />
          <span className="site-banner-title">後台管理</span>
        </div>
        <Link href="/" className="site-banner-btn">← 返回首頁</Link>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            成果列表
            {!loading && (
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 10 }}>
                共 {posts.length} 筆
              </span>
            )}
          </h2>
          {!loading && posts.length > 0 && (
            <a
              href={`${BASE}/api/admin/backup?token=${encodeURIComponent(token)}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 10,
                border: '1px solid rgba(242, 183, 5, 0.4)',
                background: 'rgba(242, 183, 5, 0.12)',
                color: 'var(--theme-dark)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              💾 備份全成果中心
            </a>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>載入中⋯</div>
        ) : posts.length === 0 ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', borderRadius: 16 }}>
            目前尚無成果資料
          </div>
        ) : (
          <>
            {/* 桌機表格 */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, display: 'block' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--theme-light)', borderBottom: '2px solid var(--theme-color)' }}>
                      {['日期', '學校', '年段', '教師', '課程主題', '分類', '照片', '操作'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post, i) => (
                      <tr key={post.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                          {new Date(post.date).toLocaleDateString('zh-TW')}
                        </td>
                        <td style={{ padding: '11px 14px' }}>{post.school}</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{post.gradeLevel}</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{post.teacher}</td>
                        <td style={{ padding: '11px 14px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.subject}
                        </td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ background: 'var(--theme-light)', color: 'var(--theme-dark)', padding: '2px 8px', borderRadius: 20, fontSize: '0.82rem' }}>
                            {post.category || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {post._count?.photos ?? 0}
                        </td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <Link
                            href={`/admin/${token}/edit/${post.id}`}
                            style={{ display: 'inline-block', padding: '5px 14px', background: 'var(--theme-color)', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginRight: 6 }}
                          >
                            編輯
                          </Link>
                          <a
                            href={`${BASE}/api/admin/posts/${post.id}/download?token=${encodeURIComponent(token)}`}
                            style={{ display: 'inline-block', padding: '5px 14px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginRight: 6 }}
                          >
                            下載
                          </a>
                          <button
                            onClick={() => handleDelete(post.id, post.subject)}
                            disabled={deletingId === post.id}
                            style={{ padding: '5px 14px', background: deletingId === post.id ? '#e2e8f0' : '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                          >
                            {deletingId === post.id ? '刪除中⋯' : '刪除'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ──────────────────── 範本管理 ──────────────────── */}
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              簡介範本管理
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 10 }}>
                共 {templates.length} 個
              </span>
            </h2>
            <button
              onClick={() => setShowAddTpl(prev => !prev)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: showAddTpl ? '#e2e8f0' : 'var(--theme-color)',
                color: showAddTpl ? 'var(--text-main)' : 'white',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {showAddTpl ? '✕ 取消' : '➕ 新增範本'}
            </button>
          </div>

          {/* ── 新增範本表單 ── */}
          {showAddTpl && (
            <div className="glass-panel" style={{
              padding: '24px', borderRadius: 16, marginBottom: 20,
              border: '1px solid rgba(242,183,5,0.3)',
              background: 'rgba(255,255,255,0.85)'
            }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                📝 新增教學簡介範本
              </h3>
              <form onSubmit={handleAddTemplate}>
                {/* 範本名稱 */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 6 }}>
                    範本名稱 <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例如：李老師-3D列印入門範本"
                    value={newTplName}
                    onChange={e => setNewTplName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* 課程主題分類 */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 6 }}>
                    課程主題分類 <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['3D列印', '智創機器人', '物聯網/Arduino', 'Scratch程式設計', 'AI人工智慧', '數位影音創作', '其他', '自訂'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewTplCategory(cat)}
                        style={{
                          padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${newTplCategory === cat ? 'var(--theme-color)' : '#cbd5e1'}`,
                          background: newTplCategory === cat ? 'var(--theme-color)' : 'white',
                          color: newTplCategory === cat ? 'white' : 'var(--text-main)',
                          fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {newTplCategory === '自訂' && (
                    <input
                      type="text"
                      placeholder="請輸入自訂分類名稱..."
                      value={newTplCustomCategory}
                      onChange={e => setNewTplCustomCategory(e.target.value)}
                      style={{ marginTop: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #f2b705', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      autoFocus
                    />
                  )}
                </div>

                {/* 範本內容 */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 6 }}>
                    範本內容 <span style={{ color: '#dc2626' }}>*</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>（{newTplContent.length} 字）</span>
                  </label>
                  <textarea
                    placeholder="在此輸入教學簡介範本內容，教師可直接套用後再修改..."
                    value={newTplContent}
                    onChange={e => setNewTplContent(e.target.value)}
                    rows={6}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    disabled={savingTpl}
                    className="btn btn-primary"
                    style={{ padding: '10px 28px', borderRadius: 10, fontWeight: 700 }}
                  >
                    {savingTpl ? '儲存中⋯' : '💾 儲存範本'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTpl(false)}
                    style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── 範本列表 ── */}
          {templates.length === 0 ? (
            <div className="glass-panel" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', borderRadius: 16 }}>
              目前尚無範本，請點擊右上角「➕ 新增範本」建立第一個範本
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: 'var(--theme-light)', borderBottom: '2px solid var(--theme-color)' }}>
                    {['範本名稱', '課程主題分類', '內容預覽', '操作'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl, i) => (
                    <tr key={tpl.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{
                          fontWeight: 600,
                          whiteSpace: 'normal',
                          maxWidth: 240,
                          wordBreak: 'break-all',
                          lineHeight: '1.4'
                        }}>
                          {tpl.name}
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(242,183,5,0.15)', color: 'var(--theme-dark)',
                          border: '1px solid rgba(242,183,5,0.4)',
                          padding: '2px 10px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600
                        }}>
                          {tpl.category || '其他'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{
                          color: 'var(--text-muted)',
                          maxWidth: 320,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {tpl.content}
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                          disabled={deletingTplId === tpl.id}
                          style={{ padding: '5px 14px', background: deletingTplId === tpl.id ? '#e2e8f0' : '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          {deletingTplId === tpl.id ? '刪除中⋯' : '刪除'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
