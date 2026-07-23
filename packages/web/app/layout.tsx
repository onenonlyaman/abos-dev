import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { CommandPalette } from '@/components/ui/command-palette';

export const metadata: Metadata = {
  title: 'ABOS: Enterprise OS (Avenue Builders Operating System)',
  description: 'AI-native Enterprise Operating System for Real Estate Developers & Builders',
};

const themeScript = `(function(){try{var t=localStorage.getItem('abos-theme');if(t){document.documentElement.setAttribute('data-theme',t);}else if(matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-[1180px] px-7 py-7">{children}</div>
            </main>
          </div>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
