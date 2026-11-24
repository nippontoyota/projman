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
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
