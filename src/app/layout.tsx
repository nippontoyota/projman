import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Incheon Mobility | River Dealership Expansion Tracker',
  description:
    'Executive Project Management, Gantt Timeline & Milestone Tracker for River EV Showroom Launches in Kerala.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-full bg-slate-50 text-slate-900 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
