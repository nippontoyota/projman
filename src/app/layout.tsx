import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'Incheon Mobility | Dealership Projects',
  description: 'Project Management & Milestone Tracker for Dealership Rollouts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white light" style={{ colorScheme: 'light' }}>
      <body className="min-h-full bg-white text-slate-900 flex flex-col antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
