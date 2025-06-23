'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Car,
  ChartSpline,
  ChevronRight,
  CreditCard,
  Earth,
  MapPin,
  ShieldUser,
  User,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { decodeJWT, JWTPayload } from '@/lib/decodeJWT';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

const navPanel = [
  {
    title: 'Panel',
    items: [
      {
        title: 'Administration',
        url: '/admin',
        icon: ShieldUser,
        subItems: [
          { title: 'Utilisateurs', url: '/admin/users' },
          { title: 'Pages', url: '/admin/pages' },
          { title: 'Menus', url: '/admin/menus' },
        ],
      },
    ],
  },
];

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Item profil (pour tous)
const profileItem: NavItem = { title: 'Profil', url: '/profile', icon: User };

export default function SidebarNavMenu() {
  const pathname = usePathname();
  const { token } = useAuth();

  const [user, setUser] = useState<JWTPayload | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // 1) Décodage du token
  useEffect(() => {
    if (!token) return;
    decodeJWT(token)
      .then(decoded => {
        console.log('👤 decoded user:', decoded);
        setUser(decoded);
      })
      .catch(err => {
        console.error('❌ token invalide', err);
        setUser(null);
      });
  }, [token]);

  // 3) Détermination des rôles
  const userPower = user?.roles?.[0]?.power ?? 0;
  const isSuperAdmin = userPower >= 100;  // Super admin
  const isEntityAdmin = userPower >= 50 && userPower < 100;  // Admin d'entité
  const isSimpleUser = userPower < 50;  // Simple utilisateur


  // 5) Construction de la navigation selon les permissions
  const navigation = useMemo(() => {
    const nav: NavGroup[] = [];

    // Super Admin : accès à tout (sans les paiements)
    if (isSuperAdmin) {
      // Panel d'administration
      nav.push(...navPanel);
      
      
      // Compte avec seulement le profil (pas de paiements)
      nav.push({
        title: 'Compte',
        items: [profileItem],
      });
    }
    // Admin d'entité
    else if (isEntityAdmin) {
      // Si pas d'abonnement : seulement profil et paiements

      console.log("je dois mettre une condition ici")
    }
    // Simple utilisateur
    else if (isSimpleUser) {
      // Si pas d'abonnement : seulement profil
      if (!hasActiveSubscription) {
        nav.push({
          title: 'Compte',
          items: [profileItem],
        });
      }
      // Si abonnement actif : accès aux fonctionnalités de base
      else {
        nav.push({
          title: 'Compte',
          items: [profileItem],
        });
      }
    }

    return nav;
  }, [isSuperAdmin, isEntityAdmin, isSimpleUser,]);

  // 6) Loading state
  if (!user) {
    return (
      <SidebarContent>
        <div className="p-4 text-center text-sm text-gray-500">
          Chargement…
        </div>
      </SidebarContent>
    );
  }

  console.log({
    pathname,
    userPower,
    isSuperAdmin,
    isEntityAdmin,
    isSimpleUser,
    hasActiveSubscription,
    navigation,
  });


  return (
    <SidebarContent>
      {/* Affichage des groupes de navigation */}
      {navigation.map(group => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map(item => {
              // Pour les items avec sous-menus (comme Administration)
              if ('subItems' in item && item.subItems) {
                const isActive = pathname === item.url
                  || (Array.isArray(item.subItems) && item.subItems.some(s => pathname.startsWith(s.url)));
                return (
                  <Collapsible key={item.title} asChild defaultOpen>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                          {item.icon && <item.icon />}
                          <Link href={item.url}><span>{item.title}</span></Link>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {Array.isArray(item.subItems) && item.subItems.map(sub => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild isActive={pathname.startsWith(sub.url)}>
                                <Link href={sub.url}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }
              
              // Pour les items simples
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url} className="relative flex-1">
                      {item.icon && <item.icon className="mr-2" />}
                      <span>{item.title}</span>

                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}