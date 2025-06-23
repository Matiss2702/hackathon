// src/app/AuthedLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/sidebar-app';
import { ModeToggle } from '@/components/toggle-theme';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { JWTPayload, decodeJWT } from '@/lib/decodeJWT';

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { token, isAuthLoading } = useAuth();
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1) Décodage du token en user
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const decoded = await decodeJWT(token);
        setUser(decoded);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // 2) Une fois loaded, si user/token absent → replace vers /login
  useEffect(() => {
    if (!isAuthLoading && !loading) {
      if (!token || !user) {
        router.replace('/login');
      }
    }
  }, [isAuthLoading, loading, token, user, router]);

  // 3) Tant que l’un ou l’autre charge, on affiche rien (ou un spinner)
  if (isAuthLoading || loading) {
    return null;
  }

  // 4) Quand tout est OK, on rend l’UI
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex items-center gap-2 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b px-4 h-12 z-50">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator orientation="vertical" />
          <div className="flex-1 flex justify-end">
            <ModeToggle />
          </div>
        </header>
        <main className="h-auto px-4 py-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
