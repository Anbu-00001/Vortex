import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vortex 3D App',
  description: 'Next.js App Router with React Three Fiber Vortex',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
