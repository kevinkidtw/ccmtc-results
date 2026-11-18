'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../portal-upload-center/upload.module.css';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

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

const parseJsonArray = (str) => {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function EditPost() {
  const params = useParams();
  const router = useRouter();
  const { token, id } = params;

  const [formData, setFormData] = useState({
    date: '', school: '', gradeLevel: '', teacher: '', subject: '', content: '', category: ''
  });
  const [infoTechDetails, setInfoTechDetails] = useState([]);
  const [lifeTechDetails, setLifeTechDetails] = useState([]);
  const [policyFocus, setPolicyFocus] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', ok: true });

  useEffect(() => {
    fetch(`${BASE}/api/admin/posts/${id}?token=${encodeURIComponent(token)}`)
      .then(r => {
        if (r.status === 401) {
          router.replace('/admin');
          return null;
        }
        if (r.status === 404) {
          alert('找不到此課程成果，即將返回成果列表');
          router.replace(`/admin/${token}`);
          return null;
        }
        return r.json();
      })
      .then(data => {
        if (!data?.success) return;
        const p = data.post;
        
        // 防禦性解析與格式化日期
        let dateVal = '';
        if (p.date) {
          const d = new Date(p.date);
          if (!isNaN(d.getTime())) {
            // 使用本地時區格式化，以避免 UTC 轉換導致日期少一天的問題
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            dateVal = `${yyyy}-${mm}-${dd}`;
          }
        }

        setFormData({
          date: dateVal,
          school: p.school || '',
          gradeLevel: p.gradeLevel || '',
          teacher: p.teacher || '',
          subject: p.subject || '',
          content: p.content || '',
          category: p.category || '',
        });
        setInfoTechDetails(parseJsonArray(p.infoTechDetails));
        setLifeTechDetails(parseJsonArray(p.lifeTechDetails));
        setPolicyFocus(parseJsonArray(p.policyFocus));
        setPhotos(p.photos || []);
      })
      .finally(() => setLoading(false));
  }, [token, id, router]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleCheckbox = (setter, list, value) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const showInfoTech = formData.category === '國小資訊教育議題' || formData.category === '國中資訊科技';
  const showLifeTech = formData.category === '國小科技教育議題' || formData.category === '國中生活科技';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', ok: true });
    try {
      const res = await fetch(`${BASE}/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...formData,
          infoTechDetails: showInfoTech && infoTechDetails.length > 0 ? JSON.stringify(infoTechDetails) : null,
          lifeTechDetails: showLifeTech && lifeTechDetails.length > 0 ? JSON.stringify(lifeTechDetails) : null,
          policyFocus: policyFocus.length > 0 ? JSON.stringify(policyFocus) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: '✓ 儲存成功！即將返回列表', ok: true });
        setTimeout(() => router.push(`/admin/${token}`), 1200);
      } else {
        setMessage({ text: '儲存失敗：' + (data.error || '未知錯誤'), ok: false });
      }
    } catch {
      setMessage({ text: '發生錯誤，請稍後再試', ok: false });
    } finally {
      setSaving(false);
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
        <Link href={`/admin/${token}`} className="site-banner-btn">← 返回列表</Link>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 60px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24, color: 'var(--text-main)' }}>
          編輯成果
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>載入中⋯</div>
        ) : (
          <form onSubmit={handleSave}>
            <div className={`glass-panel ${styles.formCard}`}>

              {/* 教學日期 */}
              <div className={styles.formGroup}>
                <label>教學日期</label>
                <input type="date" name="date" required value={formData.date} onChange={handleChange} className={styles.inputField} />
              </div>

              {/* 學校 / 年段 / 教師 */}
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
                <input type="text" name="subject" required placeholder="請輸入課程主題" value={formData.subject} onChange={handleChange} className={styles.inputField} />
              </div>

              {/* 主題分類 */}
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--theme-color)' }}>主題分類（單選）</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {CATEGORIES.map(cat => (
                    <label key={cat} style={{
                      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                      background: formData.category === cat ? 'rgba(242,183,5,0.18)' : '#f8fafc',
                      border: `1px solid ${formData.category === cat ? 'var(--theme-color)' : '#e2e8f0'}`,
                      padding: '8px 14px', borderRadius: 10, fontSize: '0.9rem', transition: 'all 0.2s'
                    }}>
                      <input type="radio" name="category" value={cat} checked={formData.category === cat} onChange={handleChange} />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* 資科細項 */}
              {showInfoTech && (
                <div className={styles.formGroup} style={{ background: 'rgba(242,183,5,0.05)', padding: 16, borderRadius: 10, borderLeft: '4px solid var(--theme-color)' }}>
                  <label>資科主題細項（可複選）</label>
                  <div className={styles.checkboxGrid}>
                    {INFO_TECH_OPTIONS.map(opt => (
                      <label key={opt} className={styles.checkboxItem}>
                        <input type="checkbox" value={opt} checked={infoTechDetails.includes(opt)}
                          onChange={() => toggleCheckbox(setInfoTechDetails, infoTechDetails, opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 生科細項 */}
              {showLifeTech && (
                <div className={styles.formGroup} style={{ background: 'rgba(242,183,5,0.05)', padding: 16, borderRadius: 10, borderLeft: '4px solid var(--theme-color)' }}>
                  <label>生科主題細項（可複選）</label>
                  <div className={styles.checkboxGrid}>
                    {LIFE_TECH_OPTIONS.map(opt => (
                      <label key={opt} className={styles.checkboxItem}>
                        <input type="checkbox" value={opt} checked={lifeTechDetails.includes(opt)}
                          onChange={() => toggleCheckbox(setLifeTechDetails, lifeTechDetails, opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 政策重點 */}
              <div className={styles.formGroup}>
                <label>政策重點（可複選）</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8 }}>
                  {POLICY_FOCUS_OPTIONS.map(opt => (
                    <label key={opt} className={styles.checkboxItem}>
                      <input type="checkbox" value={opt} checked={policyFocus.includes(opt)}
                        onChange={() => toggleCheckbox(setPolicyFocus, policyFocus, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* 課程內容簡介 */}
              <div className={styles.formGroup}>
                <label>課程內容簡介</label>
                <textarea name="content" required rows={8}
                  value={formData.content} onChange={handleChange}
                  className={styles.inputField}
                  style={{ resize: 'vertical', minHeight: 160, lineHeight: 1.7 }}
                />
              </div>

              {/* 既有照片（唯讀） */}
              {photos.length > 0 && (
                <div className={styles.formGroup}>
                  <label style={{ color: 'var(--text-muted)' }}>既有照片（共 {photos.length} 張）</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginTop: 8 }}>
                    {photos.map(photo => (
                      <img key={photo.id} src={photo.url} alt=""
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* 訊息列 */}
              {message.text && (
                <div style={{
                  padding: '12px 16px', borderRadius: 8, marginBottom: 8,
                  background: message.ok ? '#dcfce7' : '#fee2e2',
                  color: message.ok ? '#166534' : '#dc2626',
                  fontWeight: 600
                }}>
                  {message.text}
                </div>
              )}

              {/* 按鈕列 */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Link href={`/admin/${token}`}
                  style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid #cbd5e1', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
                  取消
                </Link>
                <button type="submit" disabled={saving} style={{
                  padding: '11px 28px', borderRadius: 10,
                  background: saving ? '#e2e8f0' : 'var(--theme-color)',
                  color: saving ? 'var(--text-muted)' : 'white',
                  border: 'none', fontWeight: 700, fontSize: '1rem',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}>
                  {saving ? '儲存中⋯' : '儲存變更'}
                </button>
              </div>

            </div>
          </form>
        )}
      </div>
    </div>
  );
}
