import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChatSupport } from '@/components/ChatSupport';

export const metadata: Metadata = {
  title: 'PhysioByHarish - Real-time Physiotherapy at Home',
  description: 'Book home visits with expert physiotherapists and purchase premium equipment.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <ChatSupport />
      </body>
    </html>
  );
}
