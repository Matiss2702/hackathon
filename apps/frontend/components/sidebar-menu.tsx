'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Building,
  ChevronRight,
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
} from '@/components/ui/sidebar';
import { decodeJWT, JWTPayload } from '@/lib/decodeJWT';
import { useAuth } from '@/context/AuthContext';

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

const profileItem = { title: 'Profil', url: '/profile', icon: User };
const agentsIaItem = { title: 'Mes agents IA', url: '/agents-ia', icon: User };

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  subItems?: { title: string; url: string }[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export default function SidebarNavMenu() {
  const pathname = usePathname();
  const { token } = useAuth();

  const [user, setUser] = useState<JWTPayload | null>(null);

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

  const userPower = useMemo(() => {
    if (!user?.roles || !Array.isArray(user.roles)) return 0;
    return Math.max(...user.roles.map(role => role.power ?? 0));
  }, [user]);

  const isSuperAdmin = userPower >= 100;

  const navigation = useMemo(() => {
    const nonAdminPanel: NavGroup[] = [
      {
        title: 'Organisation',
        items: [
          {
            title: 'Mon organisation',
            url: '/organization',
            icon: Building,
          },
        ],
      },
    ];
    const nav: NavGroup[] = [];

    if (isSuperAdmin) {
      nav.push(...navPanel);
    }

    nav.push(...nonAdminPanel);

    nav.push({ title: 'Compte', items: [profileItem, agentsIaItem] });
    return nav;
  }, [isSuperAdmin]);

  if (!user) {
    return (
      <SidebarContent>
        <div className="p-4 text-center text-sm text-gray-500">
          Chargement…
        </div>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent>
      {navigation.map(group => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map(item => {
              if (item.subItems && Array.isArray(item.subItems)) {
                const isActive =
                  pathname === item.url ||
                  item.subItems.some(sub => pathname.startsWith(sub.url));
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
                          {item.subItems.map(sub => (
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
