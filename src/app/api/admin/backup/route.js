import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

const isValidToken = (token) =>
  Boolean(process.env.ADMIN_TOKEN) && token === process.env.ADMIN_TOKEN;

// 遞迴讀取目錄並加入 ZIP
async function addDirectoryToZip(zip, localDir, zipDir) {
  try {
    const files = await fs.readdir(localDir);
    for (const file of files) {
      const localPath = path.join(localDir, file);
      const zipPath = path.join(zipDir, file);
      const stat = await fs.stat(localPath);

      if (stat.isDirectory()) {
        await addDirectoryToZip(zip, localPath, zipPath);
      } else if (stat.isFile()) {
        const buffer = await fs.readFile(localPath);
        zip.addFile(zipPath, buffer);
      }
    }
  } catch (err) {
    console.warn(`Error reading dir ${localDir}:`, err.message);
  }
}

export async function GET(request) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const zip = new AdmZip();

    // 1. 打包 SQLite 資料庫檔案
    const dbUrl = process.env.DATABASE_URL || 'file:./data/dev.db';
    let dbRelativePath = '';
    if (dbUrl.startsWith('file:')) {
      dbRelativePath = dbUrl.replace('file:', '');
    } else {
      dbRelativePath = dbUrl;
    }

    // 取得絕對路徑
    let dbPath = path.isAbsolute(dbRelativePath)
      ? dbRelativePath
      : path.join(process.cwd(), dbRelativePath);

    // 確保在開發環境與生產環境都能正確讀取
    let dbExists = false;
    try {
      await fs.access(dbPath);
      dbExists = true;
    } catch {
      // 嘗試其他常見位置
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'dev.db'),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const p of possiblePaths) {
        try {
          await fs.access(p);
          dbPath = p;
          dbExists = true;
          break;
        } catch {}
      }
    }

    if (dbExists) {
      const dbBuffer = await fs.readFile(dbPath);
      zip.addFile('checheng_database.db', dbBuffer);
    } else {
      console.warn('Database file not found during backup at:', dbPath);
      zip.addFile(
        'database_error_log.txt',
        Buffer.from(`找不到資料庫檔案，預計路徑: ${dbPath}`, 'utf-8')
      );
    }

    // 2. 遞迴打包 uploads 照片目錄
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
      await addDirectoryToZip(zip, uploadsDir, 'uploads');
    } catch (err) {
      console.warn('No uploads directory found or error backuping uploads:', err.message);
      zip.addFile(
        'uploads_error_log.txt',
        Buffer.from(`未找到 uploads 照片目錄或讀取失敗: ${err.message}`, 'utf-8')
      );
    }

    // 3. 加入一個備份說明的 txt 檔
    const now = new Date();
    // 轉為台灣時間 UTC+8
    const twTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const timeStr = twTime.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' (UTC+8)';
    const infoText = `==================================================
車城自造教育科技中心 - 全成果中心備份
==================================================

【備份時間】${timeStr}
【備份內容】
- checheng_database.db: SQLite 資料庫複製品 (內含所有成果與範本文字資料)
- uploads/: 全站上傳的活動剪影原始照片目錄

【還原說明】
1. 資料庫：將 checheng_database.db 命名為 dev.db，並替換至系統的資料庫目錄 (開發環境為 /data 或是 prisma 目錄，NAS Docker 為掛載的 data 目錄)。
2. 照片：將 uploads 目錄下的檔案替換至 public/uploads (NAS Docker 為掛載的 uploads 目錄)。

==================================================
`;
    zip.addFile('backup_info.txt', Buffer.from(infoText, 'utf-8'));

    // 產生 ZIP Buffer
    const zipBuffer = zip.toBuffer();

    // 檔名：checheng_backup_YYYYMMDD_HHMMSS.zip
    const yyyy = twTime.getFullYear();
    const mm = String(twTime.getMonth() + 1).padStart(2, '0');
    const dd = String(twTime.getDate()).padStart(2, '0');
    const hh = String(twTime.getHours()).padStart(2, '0');
    const min = String(twTime.getMinutes()).padStart(2, '0');
    const ss = String(twTime.getSeconds()).padStart(2, '0');
    
    const filename = `checheng_backup_${yyyy}${mm}${dd}_${hh}${min}${ss}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Backup failed', details: error.message }, { status: 500 });
  }
}
