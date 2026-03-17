import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreeAIcode - Find the Best Coding Models',
  description: 'Model-first catalog for API-accessible coding models. Find the best free and low-cost models by quality, cost, and availability.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
