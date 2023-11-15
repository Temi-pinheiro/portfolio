import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '~~/components';
import { MobileNav } from '~~/components/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Temitope Pinheiro Portfolio',
  description: 'My portfolio page for 2023',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <NavBar />
        <MobileNav />
        {children}
      </body>
    </html>
  );
}
