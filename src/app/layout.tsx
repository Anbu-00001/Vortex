export const metadata = {import type { Metadata } from 'next';












}  );    </html>      <body>{children}</body>    <html lang="en">  return (export default function RootLayout({ children }: { children: React.ReactNode }) {};  description: '3D Vortex Visualization',  title: 'Vortex App',
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
