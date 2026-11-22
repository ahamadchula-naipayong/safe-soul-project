import type { Metadata } from 'next';
import { Cinzel, Playfair_Display, Prompt, Noto_Serif_Thai, Mali } from 'next/font/google';
import './globals.css';
import { AudioProvider } from '@/context/AudioContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StickyAudioPlayer } from '@/components/StickyAudioPlayer';
import { CartDrawer } from '@/components/CartDrawer';
import { AdminViewAsBar } from '@/components/AdminViewAsBar';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-serif-thai',
  display: 'swap',
});

const mali = Mali({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-mali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Fitrah Shield | 4 มิติแห่งปัญญา • เกราะกำบังจิตวิญญาณเดิมแท้',
  description:
    'แพลตฟอร์มความรู้ พอดแคสต์ และแอนิเมชันแห่งปัญญา 7 เกาะแห่งการปกป้องจิตวิญญาณ เพื่อการสร้างภูมิคุ้มกันทางจิตวิญญาณ อยู่ร่วมกับโลกยุคใหม่โดยไม่ยอมให้โลกกลืนกินหัวใจ',
  keywords: [
    'The Fitrah Shield',
    '4 มิติแห่งปัญญา',
    'Safe from the Dunya',
    'The Key of Return',
    'เกราะกำบังจิตวิญญาณ',
    'ปรัชญาและวิทยาศาสตร์',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`scroll-smooth ${cinzel.variable} ${playfair.variable} ${prompt.variable} ${notoSerifThai.variable} ${mali.variable}`}
    >
      <body className="min-h-screen bg-slate-dark text-parchment-cream font-thai antialiased flex flex-col justify-between selection:bg-gold-warm selection:text-slate-abyss">
        <AuthProvider>
          <AudioProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>

              {/* Persistent Sticky Audio Player (Audio plays across all routes) */}
              <StickyAudioPlayer />

              {/* Slide-over Shopping Cart */}
              <CartDrawer />

              {/* Floating Admin / Co-Admin "View As" Perspective Switcher */}
              <AdminViewAsBar />
            </CartProvider>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
