'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './upload.module.css';

const INFO_TECH_OPTIONS = [
  "程式設計", "演算法", "系統平台", "資訊科技與人類社會", "資訊科技應用",
  "資訊表示處理及分析", "跨領域語文", "跨領域數學", "跨領域社會", "跨領域自然科學",
  "跨領域藝術", "跨領域體健", "跨領域綜合", "課程發展與教學策略-專題導向學習",
  "課程發展與教學策略-素養導向學習", "多元評量", "教材教法", "專業知能"
];

const LIFE_TECH_OPTIONS = [
  "設計與製作", "科技本質", "科技的應用", "科技與社會", "跨領域語文",
  "跨領域數學", "跨領域社會", "跨領域自然科學", "跨領域藝術", "跨領域體健",
  "跨領域綜合", "課程發展與教學策略-專題導向學習", "課程發展與教學策略-素養導向學習",
  "多元評量", "教材教法", "專業知能"
];

const POLICY_FOCUS_OPTIONS = [
  "新興科技", "性別科技議題", "數位遠距教學", "數位媒體素養", "STEM", "STEAM", "無"
];

const CATEGORIES = [
  "國小資訊教育議題", "國小科技教育議題", "國中資訊科技", "國中生活科技"
];

export default function UploadPortal() {
  const [formData, setFormData] = useState({
    date: '', school: '', gradeLevel: '', teacher: '', subject: '', content: '', category: ''
  });

  const [infoTechDetails, setInfoTechDetails] = useState([]);
  const [lifeTechDetails, setLifeTechDetails] = useState([]);
  const [policyFocus, setPolicyFocus] = useState([]);

  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [successPostId, setSuccessPostId] = useState('');

  const [existingSubjects, setExistingSubjects] = useState([]);
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateFilter, setTemplateFilter] = useState('全部');

  const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    fetch(`${BASE}/api/subjects`)
      .then(res => res.json())
      .then(data => { if (data.success && data.subjects) setExistingSubjects(data.subjects); })
      .catch(err => console.error("Failed to load subjects:", err));

    fetch(`${BASE}/api/templates`)
      .then(res => res.json())
      .then(data => { if (data.success && data.templates) setTemplates(data.templates); })
      .catch(err => console.error("Failed to load templates:", err));
  }, [BASE]);

  const handleSaveTemplate = async () => {
    if (formData.content.trim().length === 0) { alert("請先輸入簡介內容再儲存範本"); return; }
    const name = window.prompt("請輸入範本名稱（例如：李老師-生科公版）：");
    if (!name) return;
    const category = window.prompt("請輸入課程主題分類（例如：3D列印、智創機器人、Scratch程式設計）：") || '其他';
    try {
      const res = await fetch(`${BASE}/api/templates`, {
        method: 'POST',
        body: JSON.stringify({ name, content: formData.content, category }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) { setTemplates([data.template, ...templates]); alert(`範本「${name}」儲存成功！`); }
      else alert("儲存失敗：" + data.error);
    } catch (err) { console.error(err); alert("發生錯誤，無法儲存範本"); }
  };

  const applyTemplate = (tmpl) => {
    setFormData(prev => ({ ...prev, content: tmpl.content }));
    setShowTemplateModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (setter, state) => (e) => {
    const { value, checked } = e.target;
    setter(checked ? [...state, value] : state.filter(item => item !== value));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPreviews(prev => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index); });
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const compressImage = (file) => new Promise((resolve) => {
    // HEIC/HEIF can't be drawn on canvas in most browsers — send as-is (server handles it)
    if (!file.type.startsWith('image/') || /heic|heif/i.test(file.type)) {
      return resolve(file);
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 1600;
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file);
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.content.length < 50) { setMessage('⚠️ 教學內容簡介必須至少 50 個字'); return; }
    if (photos.length < 4) { setMessage('⚠️ 請上傳至少 4 張照片'); return; }

    setIsSubmitting(true);
    setMessage('壓縮照片中，請稍候...');
    try {
      const compressed = await Promise.all(photos.map(compressImage));
      setMessage('上傳中，請稍候...');
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('infoTechDetails', JSON.stringify(infoTechDetails));
      data.append('lifeTechDetails', JSON.stringify(lifeTechDetails));
      data.append('policyFocus', JSON.stringify(policyFocus));
      compressed.forEach(photo => data.append('photos', photo));

      const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: data });
      let result;
      try { result = await res.json(); } catch { throw new Error(`伺服器錯誤 (${res.status})，請確認照片大小後重試`); }
      if (!result.success) throw new Error(result.error || '上傳失敗');
      setMessage('✅ 上傳成功！');
      setSuccessPostId(result.postId);
      setFormData({ date: '', school: '', gradeLevel: '', teacher: '', subject: '', content: '', category: '' });
      setInfoTechDetails([]); setLifeTechDetails([]); setPolicyFocus([]);
      setPhotos([]); setPreviews([]); setIsCustomSubject(false);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setMessage(`❌ 上傳失敗：${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showInfoTech = formData.category && formData.category.includes('資訊');
  const showLifeTech = formData.category && (formData.category.includes('科技教育') || formData.category.includes('生活科技'));

  return (
    <div className={styles.container}>
      {/* Banner — 共用 CSS class */}
      <div className="site-banner" style={{ borderRadius: 0, marginBottom: 0 }}>
        <div className="site-banner-left">
          <img src="/logo.jpg" alt="車城自造科技中心" className="site-banner-logo" />
          <span className="site-banner-title">教學成果上傳中心</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin" className="site-banner-btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)' }}>⚙ 後台管理</Link>
          <Link href="/" className="site-banner-btn">← 成果發佈中心</Link>
        </div>
      </div>

      {/* 副標題 */}
      <div className={styles.header}>
        <p>提供教師快速上傳課程剪影與內容簡介</p>
      </div>

      <div className={`glass-panel ${styles.formCard}`}>
        <form onSubmit={handleSubmit}>

          {/* 教學日期 */}
          <div className={styles.formGroup}>
            <label>教學日期</label>
            <input type="date" name="date" required value={formData.date} onChange={handleChange} className={styles.inputField} />
          </div>

          {/* 學校 / 年段 / 教師 — 三欄，手機自動變一欄 */}
          <div className={styles.fieldRow}>
            <div className={styles.formGroup}>
              <label>學校</label>
              <input type="text" name="school" required placeholder="例如：車城國小" value={formData.school} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label>年段</label>
              <input type="text" name="gradeLevel" required placeholder="例如：五年級" value={formData.gradeLevel} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label>授課教師</label>
              <input type="text" name="teacher" required placeholder="請輸入姓名" value={formData.teacher} onChange={handleChange} className={styles.inputField} />
            </div>
          </div>

          {/* 課程主題 */}
          <div className={styles.formGroup}>
            <label>課程主題</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {existingSubjects.map(sub => (
                <button type="button" key={sub}
                  onClick={() => { setFormData(prev => ({ ...prev, subject: sub })); setIsCustomSubject(false); }}
                  className={`tag-btn ${formData.subject === sub && !isCustomSubject ? 'active' : ''}`}
                >{sub}</button>
              ))}
              <button type="button"
                onClick={() => { setFormData(prev => ({ ...prev, subject: '' })); setIsCustomSubject(true); }}
                className={`tag-btn ${isCustomSubject ? 'active' : ''}`}
                style={{ borderStyle: 'dashed', backgroundColor: isCustomSubject ? 'var(--theme-color)' : 'transparent', color: isCustomSubject ? 'white' : 'var(--text-main)' }}
              >+ 新增主題</button>
            </div>
            {isCustomSubject && (
              <input type="text" name="subject" required placeholder="請輸入自訂課程主題..."
                value={formData.subject} onChange={handleChange} className={styles.inputField}
                style={{ marginTop: '8px' }} autoFocus />
            )}
          </div>

          {/* 主題分類 */}
          <div className={styles.formGroup}>
            <label style={{ color: 'var(--theme-color)' }}>主題分類（單選）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {CATEGORIES.map(cat => (
                <label key={cat} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  background: formData.category === cat ? 'rgba(242,183,5,0.18)' : '#f8fafc',
                  border: `1px solid ${formData.category === cat ? 'var(--theme-color)' : '#e2e8f0'}`,
                  padding: '8px 14px', borderRadius: '10px', transition: 'all 0.2s', fontSize: '0.9rem'
                }}>
                  <input type="radio" name="category" value={cat} checked={formData.category === cat} onChange={handleChange} required />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* 資科細項 */}
          {showInfoTech && (
            <div className={styles.formGroup} style={{ background: 'rgba(242,183,5,0.05)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid var(--theme-color)' }}>
              <label>資科主題細項（可複選）</label>
              <div className={styles.checkboxGrid}>
                {INFO_TECH_OPTIONS.map(opt => (
                  <label key={opt} className={styles.checkboxItem}>
                    <input type="checkbox" value={opt} checked={infoTechDetails.includes(opt)} onChange={handleCheckboxChange(setInfoTechDetails, infoTechDetails)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 生科細項 */}
          {showLifeTech && (
            <div className={styles.formGroup} style={{ background: 'rgba(242,183,5,0.05)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid var(--theme-color)' }}>
              <label>生科主題細項（可複選）</label>
              <div className={styles.checkboxGrid}>
                {LIFE_TECH_OPTIONS.map(opt => (
                  <label key={opt} className={styles.checkboxItem}>
                    <input type="checkbox" value={opt} checked={lifeTechDetails.includes(opt)} onChange={handleCheckboxChange(setLifeTechDetails, lifeTechDetails)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 政策重點 */}
          <div className={styles.formGroup} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #94a3b8' }}>
            <label>政策重點（可複選或填無）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {POLICY_FOCUS_OPTIONS.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" value={opt} checked={policyFocus.includes(opt)} onChange={handleCheckboxChange(setPolicyFocus, policyFocus)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* 教學內容簡介 */}
          <div className={styles.formGroup}>
            <div className={styles.contentLabelRow}>
              <label>
                教學內容簡介
                <span style={{ color: formData.content.length < 50 ? '#dc2626' : '#16a34a', fontSize: '0.82rem', fontWeight: 'normal', marginLeft: '8px' }}>
                  請多於50字（{formData.content.length} 字）
                </span>
              </label>
              <div className={styles.templateBtns}>
                <button type="button" onClick={() => setShowTemplateModal(true)}
                  style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  📂 選擇範本
                </button>
                <button type="button" onClick={handleSaveTemplate}
                  style={{ background: 'var(--theme-color)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  📦 存為範本
                </button>
              </div>
            </div>
            <textarea name="content" required placeholder="簡述本次課程的重點與學生的收穫..."
              value={formData.content} onChange={handleChange} className={styles.inputField}
              style={{ minHeight: '120px', borderColor: formData.content.length > 0 && formData.content.length < 50 ? '#dc2626' : '' }}
            />
          </div>

          {/* 照片上傳 */}
          <div className={styles.formGroup}>
            <label>
              上傳成果照片（可多選）
              <span style={{ color: photos.length < 4 ? '#dc2626' : '#16a34a', fontSize: '0.82rem', fontWeight: 'normal', marginLeft: '8px' }}>
                至少4張（目前 {photos.length} 張）
              </span>
            </label>
            <div className={styles.fileArea} onClick={() => document.getElementById('file-upload').click()}>
              <p style={{ margin: 0, color: '#64748b' }}>點擊此處選擇照片，支援多張上傳</p>
              <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
            {previews.length > 0 && (
              <div className={styles.previewGrid}>
                {previews.map((src, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    <img src={src} alt="preview" />
                    <button type="button" onClick={() => removePhoto(idx)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px', lineHeight: '22px', textAlign: 'center', padding: 0 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 訊息 */}
          {message && (
            <div style={{ padding: '14px 16px', background: message.includes('✅') ? '#f0fdf4' : '#fef2f2', color: message.includes('✅') ? '#166534' : '#991b1b', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
              {message}
              {successPostId && (
                <Link href={`/post/${successPostId}`} style={{ display: 'inline-block', marginTop: '10px', background: 'var(--theme-color)', color: 'white', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', textDecoration: 'none' }}>
                  前往查看成果 →
                </Link>
              )}
            </div>
          )}

          <button type="submit"
            disabled={isSubmitting || formData.content.length < 50 || photos.length < 4 || !formData.category}
            className={`btn btn-primary ${styles.submitBtn}`}>
            {isSubmitting ? '發佈中...' : '確認發佈'}
          </button>
        </form>
      </div>

      {/* 範本 Modal */}
      {showTemplateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', padding: 'clamp(20px,5vw,30px)', borderRadius: '14px', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal 標題列 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)' }}>📂 選擇簡介範本</h2>
              <button onClick={() => setShowTemplateModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* 課程主題分類篩選器 */}
            {templates.length > 0 && (() => {
              const cats = ['全部', ...Array.from(new Set(templates.map(t => t.category || '其他')))];
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, flexShrink: 0 }}>
                  {cats.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setTemplateFilter(cat)}
                      style={{
                        padding: '5px 14px', borderRadius: 20, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
                        border: `1.5px solid ${templateFilter === cat ? 'var(--theme-color)' : '#cbd5e1'}`,
                        background: templateFilter === cat ? 'var(--theme-color)' : '#f8fafc',
                        color: templateFilter === cat ? 'white' : 'var(--text-muted)',
                        transition: 'all 0.15s'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* 範本清單（可滾動） */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {templates.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>目前沒有任何範本，您可以先在下方輸入內容後點擊「存為範本」。</p>
              ) : (() => {
                const filtered = templateFilter === '全部' ? templates : templates.filter(t => (t.category || '其他') === templateFilter);
                return filtered.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>此分類目前沒有範本</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(tmpl => (
                      <div key={tmpl.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                          <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: '1rem', display: 'block' }}>{tmpl.name}</strong>
                              <span style={{ fontSize: '0.78rem', background: 'rgba(242,183,5,0.15)', color: 'var(--theme-dark)', border: '1px solid rgba(242,183,5,0.4)', padding: '1px 8px', borderRadius: 12, fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                                {tmpl.category || '其他'}
                              </span>
                          </div>
                          <button onClick={() => applyTemplate(tmpl)} className="btn"
                            style={{ background: 'var(--theme-color)', color: 'white', padding: '6px 14px', fontSize: '0.85rem', flexShrink: 0 }}>
                            套用
                          </button>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', maxHeight: '80px', overflowY: 'auto', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                          {tmpl.content}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
