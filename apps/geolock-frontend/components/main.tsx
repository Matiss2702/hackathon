'use client';

import { hasTag } from '@/lib/route';
import { usePathname } from 'next/navigation';

export default function Main({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHiddenRoute = hasTag(pathname, 'hidden')

  return isHiddenRoute ? (
    <>{children}</>
  ) : (
    <main className="grow">{children}</main>
  );
}
