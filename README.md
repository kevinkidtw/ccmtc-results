# ccmtc-results — 教學成果發佈中心

車城自造教育科技中心的教學成果發佈系統：教師上傳課程成果、教學照片與紀錄，前台公開展示。
Next.js 16（App Router、`basePath: /results`）＋ Prisma ＋ SQLite，部署在 `https://ccmtc.mooo.com/results`。

## 功能

| 路徑 | 說明 |
|---|---|
| `/results` | 成果列表（依科目篩選） |
| `/results/post/[id]` | 單篇成果與照片 |
| `/results/admin/[token]` | 後台：新增／編輯成果、上傳照片、教學簡介範本、備份下載 |
| `/results/portal-upload-center` | 官網端的上傳入口 |
| `/results/api/gallery` | 提供官網與其他子站使用的成果相簿 API |

資料表：`Post`（成果）、`Photo`（照片）、`Template`（教學簡介範本），定義在 `prisma/schema.prisma`；
容器啟動時由 `migrate.js` 自動建表。

## 架構與部署

- 屬於 `ccmtc-official` 的 Docker Compose 編排（服務名 `results`，內網 3010 埠，由官網 portal 以 `/results` rewrite 進來）。
- 部署：`./deploy_nas.sh`（共用 `../_deploy_lib.sh`：打包 → 上傳 → 重建容器 → 線上驗證）。
- 管理用 `ADMIN_TOKEN` 只放在 NAS 的 `ccmtc-official/.env`，不進版控。

## 不在版控內的東西

- `dev.db`、`data/`：正式資料庫。
- `public/uploads/`：教師上傳的照片（NAS 的 `ccmtc-results/uploads/` 卷冊）。
- `.env*`。

## 維護腳本

| 檔案 | 用途 |
|---|---|
| `scripts/generate-thumbs.js` | 一次性：替既有照片產生縮圖（容器內執行） |
| `scripts/compress-originals.cjs` | 一次性：壓縮既有原始照片（容器內執行） |

## 本機開發

```bash
npm install
npx prisma generate
npm run dev        # http://localhost:3000/results
```
