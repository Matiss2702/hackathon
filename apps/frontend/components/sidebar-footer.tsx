'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, LogOut, User } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from '@/context/AuthContext';
import { decodeJWT, JWTPayload } from "@/lib/decodeJWT";

export default function SidebarNavFooter() {
  const { isMobile } = useSidebar();
  const { logout, token } = useAuth();

  const [user, setUser] = useState<JWTPayload | null>(null);

  useEffect(() => {
    const getUser = async () => {
      if (token) {
        const decoded = await decodeJWT(token);
        setUser(decoded);
      }
    };
    getUser();
  }, [token]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="w-[32px] h-[32px] rounded-md bg-primary"></div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  <span className="uppercase">{user.lastname}</span>{' '}
                  <span className="capitalize">{user.firstname}</span>
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem>
              <Link href="/profile" className="flex items-center gap-2 w-full">
                <User />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div
                onClick={handleLogout}
                className="flex items-center gap-2 w-full cursor-pointer"
              >
                <LogOut />
                Logout
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
