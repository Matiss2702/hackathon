'use client';

import { ReactNode } from 'react';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { usePathname } from 'next/navigation';
import { hasTag } from '@/lib/route';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAuthedPage = hasTag(pathname, 'auth');

  return isAuthedPage ? (
    <>{children}</>
  ) : (
    <>
      <Header />
      <main className="grow w-full">
        <div className="max-w-7xl mx-auto py-2 px-4">{children}</div>
      </main>
      <Footer />
    </>
  );
}
