'use client';

import { AppSidebar } from '@/components/sidebar-app';
import { ModeToggle } from '@/components/toggle-theme';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { decodeJWT, JWTPayload } from '@/lib/decodeJWT';
import { hasTag } from '@/lib/route';
import { notFound, redirect, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { token } = useAuth();
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      if (!token) return;
  
      try {
        const decoded = await decodeJWT(token);
        setUser(decoded);
      } catch (error) {
        console.error('Erreur décodage token:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    getUser();
  }, [token]);

  
  if (!token || loading || subscriptionLoading) {
    return <div className="p-4 text-center text-muted">Chargement...</div>;
  }
  
  if (user === null) {
    return notFound();
  }

  // Détermination des rôles
  const userPower = user?.roles?.[0]?.power ?? 0;
  const isSuperAdmin = userPower >= 100;
  const isEntityAdmin = userPower >= 50 && userPower < 100;
  const isSimpleUser = userPower < 50;

  // Vérification des permissions pour les routes admin/auth
  const isRouteAuthed = hasTag(pathname, "auth");
  if (isRouteAuthed && !user.roles.some(role => role.power >= 10)) {
    return notFound();
  }

  const isRouteAdmin = hasTag(pathname, "admin");
  if (isRouteAdmin && !isSuperAdmin) {
    return notFound();
  }

  // Logique de restriction d'accès selon les rôles et abonnements
  const checkPageAccess = () => {
    // Super admin : accès à tout
    if (isSuperAdmin) {
      return true;
    }

    return true;
  };

  // Redirection si pas d'accès
  if (!checkPageAccess()) {
    // Rediriger selon le type d'utilisateur
    if (isSimpleUser) {
      redirect('/profile');
    } 
    return null;
  }

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex shrink-0 items-center gap-2 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b px-4 h-12 z-50">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" />
            <div className="w-full flex items-center justify-end pl-2">
              <ModeToggle />
            </div>
          </header>
          <main className="h-auto px-4 py-2">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
}