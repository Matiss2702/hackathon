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
import { useNotificationsContext } from '@/providers/NotificationsProvider';
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
        isNotification: false,
      },
    ],
  },
];

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  isNotification?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Items de base (pour tous les utilisateurs avec abonnement)
const navGPS: NavGroup = {
  title: 'GPS',
  items: [
    { title: 'Carte', url: '/maps', icon: Earth },
    { title: 'Trajets', url: '/itinaries', icon: MapPin },
    { title: 'Véhicules', url: '/vehicles', icon: Car },
  ],
};

const navStats: NavGroup = {
  title: 'Statistiques',
  items: [
    { title: 'Statistiques', url: '/statistics', icon: ChartSpline },
    {
      title: 'Notifications',
      url: '/notifications',
      icon: Bell,
      isNotification: true,
    },
  ],
};

// Item profil (pour tous)
const profileItem: NavItem = { title: 'Profil', url: '/profile', icon: User };

export default function SidebarNavMenu() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationsContext();
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

  // 2) Vérification de l'abonnement
  useEffect(() => {
    if (!token || !user) return;
    console.log('🔍 check subscription for', user.sub);
    api.get('/billing/subscription/info')
      .then(({ data }) => {
        console.log('📊 subscription response:', data);
        setHasActiveSubscription(!!data.hasSubscription);
      })
      .catch(err => {
        console.error('❌ subscription error', err);
        setHasActiveSubscription(false);
      });
  }, [token, user]);

  // 3) Détermination des rôles
  const userPower = user?.roles?.[0]?.power ?? 0;
  const isSuperAdmin = userPower >= 100;  // Super admin
  const isEntityAdmin = userPower >= 50 && userPower < 100;  // Admin d'entité
  const isSimpleUser = userPower < 50;  // Simple utilisateur

  // 4) Génère l'item de paiement
  const paymentItem: NavItem = useMemo(() => {
    return hasActiveSubscription
      ? { title: 'Paiements-info', url: '/payments/information', icon: CreditCard }
      : { title: 'Paiements', url: '/payments/subscribe', icon: CreditCard };
  }, [hasActiveSubscription]);

  // 5) Construction de la navigation selon les permissions
  const navigation = useMemo(() => {
    const nav: NavGroup[] = [];

    // Super Admin : accès à tout (sans les paiements)
    if (isSuperAdmin) {
      // Panel d'administration
      nav.push(...navPanel);
      
      // Toutes les fonctionnalités
      nav.push(navGPS);
      nav.push(navStats);
      
      // Compte avec seulement le profil (pas de paiements)
      nav.push({
        title: 'Compte',
        items: [profileItem],
      });
    }
    // Admin d'entité
    else if (isEntityAdmin) {
      // Si pas d'abonnement : seulement profil et paiements
      if (!hasActiveSubscription) {
        nav.push({
          title: 'Compte',
          items: [profileItem, paymentItem],
        });
      }
      // Si abonnement actif : accès complet sauf super admin
      else {
        nav.push(navGPS);
        nav.push(navStats);
        nav.push({
          title: 'Compte',
          items: [profileItem, paymentItem],
        });
      }
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
        nav.push(navGPS);
        nav.push(navStats);
        nav.push({
          title: 'Compte',
          items: [profileItem],
        });
      }
    }

    return nav;
  }, [isSuperAdmin, isEntityAdmin, isSimpleUser, hasActiveSubscription, paymentItem]);

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

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

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
                      {item.isNotification && unreadCount > 0 && (
                        <SidebarMenuBadge>{badgeLabel}</SidebarMenuBadge>
                      )}
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