import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

const isValidToken = (token) =>
  Boolean(process.env.ADMIN_TOKEN) && token === process.env.ADMIN_TOKEN;

const parseJSONSafe = (str) => {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export async function GET(request, { params }) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 格式化日期為 YYYY-MM-DD
    let dateStr = '';
    if (post.date) {
      const d = new Date(post.date);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dateStr = `${yyyy}-${mm}-${dd}`;
      }
    }

    // 解析複選欄位
    const infoList = parseJSONSafe(post.infoTechDetails);
    const lifeList = parseJSONSafe(post.lifeTechDetails);
    const policyList = parseJSONSafe(post.policyFocus);

    // 建立 README.txt 內容
    let readmeText = `==================================================
車城自造教育科技中心 - 教學成果留存資料
==================================================

【課程主題】${post.subject || ''}
【主題分類】${post.category || '無'}
【教學日期】${dateStr}
【學校名稱】${post.school || ''}
【適用年段】${post.gradeLevel || ''}
【授課教師】${post.teacher || '無'}

--------------------------------------------------
【資科主題細項】
${infoList.length > 0 ? infoList.map(item => `- ${item}`).join('\n') : '(無)'}

【生科主題細項】
${lifeList.length > 0 ? lifeList.map(item => `- ${item}`).join('\n') : '(無)'}

【政策重點】
${policyList.length > 0 ? policyList.map(item => `- ${item}`).join('\n') : '(無)'}
--------------------------------------------------

【教學內容簡介】
${post.content || ''}

==================================================
※ 本壓縮包內含此教學成果的所有活動剪影照片，供留存備份使用。
==================================================
`;

    // 建立 ZIP 實例
    const zip = new AdmZip();
    
    // 1. 將 README.txt 加入 ZIP（使用 UTF-8）
    zip.addFile('README.txt', Buffer.from(readmeText, 'utf-8'));

    // 2. 將照片檔案加入 ZIP
    // 照片儲存於 public/uploads/[id]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', id);
    try {
      const files = await fs.readdir(uploadDir);
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          const fileBuffer = await fs.readFile(filePath);
          zip.addFile(file, fileBuffer);
        }
      }
    } catch (err) {
      console.warn(`No photos directory found or error reading directory for post ${id}:`, err.message);
      // 如果沒有照片目錄或讀取失敗，ZIP 中就只包含 README.txt 即可，不拋錯中斷
    }

    // 產生 ZIP Buffer
    const zipBuffer = zip.toBuffer();

    // 檔名格式：學校_課程主題_日期.zip
    const cleanSchool = (post.school || '學校').replace(/[\/\\?%*:|"<>\s]/g, '');
    const cleanSubject = (post.subject || '課程主題').replace(/[\/\\?%*:|"<>\s]/g, '');
    const cleanDate = dateStr || '日期';
    const filename = `${cleanSchool}_${cleanSubject}_${cleanDate}.zip`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });

  } catch (error) {
    console.error('Download post error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
