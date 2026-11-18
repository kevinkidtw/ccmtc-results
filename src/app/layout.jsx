import './globals.css';
import ViewsCounter from './components/ViewsCounter';

const siteUrl = process.env.SITE_URL || 'http://localhost:3010';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: '車城自造教育科技中心 - 教學成果',
  description: '展示車城自造科技中心的豐碩教學與創客成果',
  openGraph: {
    siteName: '車城自造教育科技中心',
    locale: 'zh_TW',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <ViewsCounter />
        </div>
      </body>
    </html>
  );
}
