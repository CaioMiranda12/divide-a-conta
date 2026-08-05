import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[560px] h-[900px] rotate-12 bg-gradient-to-b from-mint/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[480px] h-[780px] -rotate-12 bg-gradient-to-t from-mint/10 to-transparent blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}