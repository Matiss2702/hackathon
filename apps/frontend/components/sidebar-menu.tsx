'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building,
  ChevronRight,
  User,
  BotMessageSquare,
  Receipt,
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
import api from '@/lib/axios';

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subItems?: { title: string; url: string }[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type User = {
  role : string;
}

export default function SidebarNavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuth();
  const [getToken, setToken] = useState<JWTPayload | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) return;
    decodeJWT(token)
      .then(async decoded => {
        setToken(decoded);
        try {
          if (!decoded || !decoded.id) {
            return;
          }

          const response = await api.get('/user/me')
          setUser(response.data);
        } catch {
          setToken(null);
          router.push('/login');
        }
      })
      .catch(err => {
        console.error('❌ token invalide', err);
        setToken(null);
      });
  }, [getToken, router, token, user]);

  const isAdmin = user?.role === 'admin';

  const navigation: NavGroup[] = useMemo(() => {
    const groups: NavGroup[] = [];

    if (isAdmin) {
      groups.push({
        title: 'Administration',
        items: [
          { title: 'Utilisateurs', url: '/admin/users', icon: User },
          { title: 'Organisations', url: '/admin/organizations', icon: Building },
          { title: 'Agents IA', url: '/admin/agents-ia', icon: BotMessageSquare },
        ],
      });
    }

    groups.push({
      title: 'Organisation',
      items: [
        {
          title: 'Mon organisation',
          url: '/organization',
          icon: Building,
        },
        {
          title: 'Agents IA',
          url: '/agents-ia',
          icon: BotMessageSquare,
        }
      ],
    });

    groups.push({
      title: 'Compte',
      items: [
        {
          title: 'Profil',
          url: '/profile',
          icon: User,
        },
        {
          title: 'Abonnements',
          url: '/subscription',
          icon: Receipt,
        },
      ],
    });

    return groups;
  }, [isAdmin]);

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
              if (item.subItems?.length) {
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
