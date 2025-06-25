'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/toggle-theme";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Menu, X, BotMessageSquare, Building } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasTag } from "@/lib/route";
import Logo from "@/components/logo";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";

const navMainMenu = [
  {
    title: 'Nos agents IA',
    href: '/agents/ia',
    icon: BotMessageSquare,
    description: 'Découvrez nos agents IA pour créer vos besoins généralistes',
  }
]

export function menuMain() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Nos agents</NavigationMenuTrigger>
          <NavigationMenuContent className="p-4">
            <div className="grid gap-4 sm:w-[80vw] lg:w-[300px]">
              { navMainMenu.map((item) => (
                <NavigationMenuLink asChild key={item.href}>
                  <Link href={item.href} className="flex items-start gap-4 hover:bg-accent p-4 rounded-md transition">
                    <div className="flex gap-4 items-start">
                      <div>
                        <item.icon width={48} height={48} />
                      </div>
                      <div className="w-full grid gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-muted-foreground text-sm leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    </Link>
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (menuVisible) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [menuVisible]);

  const isHiddenRoute = hasTag(pathname, 'hidden')
  if (isHiddenRoute) return null;

  const closeMenu = () => {
    setMenuOpen(false);
    setTimeout(() => setMenuVisible(false), 200);
  };

  const openMenu = () => {
    setMenuVisible(true);
    requestAnimationFrame(() => setMenuOpen(true));
  };

  return (
    <header className="w-full top-0 sticky bg-white/80 dark:bg-black/80 border-b backdrop-blur z-50">
      <nav className="w-full mx-auto max-w-7xl flex items-center justify-between py-2 px-4">
        <Link href="/" className="text-xl font-bold">
          <Logo />
          <span className="sr-only">Page d&apos;accueil</span>
        </Link>
        
        <div className="lg:hidden flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" size="icon" onClick={openMenu}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </div>

        {/*MENU PRINCIPAL*/}
        <div className="hidden lg:block">
          {menuMain()}
        </div>

        <ul className="hidden lg:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <li>
                <Button variant="outline" asChild>
                  <Link href="/profile">
                    <User className="mr-1" />
                    Profile
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="destructive" onClick={logout}>
                  <LogOut className="mr-1" />
                  Se déconnecter
                </Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Button variant="outline" asChild>
                  <Link href="/login">Se connecter</Link>
                </Button>
              </li>
              <li>
                <Button variant="default" asChild>
                  <Link href="/register">S&apos;inscrire</Link>
                </Button>
              </li>
            </>
          )}
          <li>
            <ModeToggle />
          </li>
        </ul>
      </nav>

      {menuVisible && (
        <div
          className={`fixed inset-0 z-[99] h-screen grid grid-cols-3 md:grid-cols-2 transform transition-transform duration-200 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div
            className="bg-black/70 h-full flex justify-end"
            onClick={closeMenu}
          />
          <div className="col-span-2 md:col-span-1 overflow-y-auto md:w1/2 h-full bg-white dark:bg-zinc-900 shadow-xl flex flex-col py-2 px-4 gap-2">
            <div className="flex justify-between items-center border-b pb-2 sticky top-0 z-10">
              <div className="flex items-center justify-between w-full">
                <ModeToggle />
                <Button variant="outline" size="icon" onClick={closeMenu}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 grow flex-between">
              <div className="grow">
                {menuMain()}
              </div>
              <div className="border-t pt-2">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sticky bottom-0 z-10">
                      <Button variant="outline" asChild>
                        <Link href="/profile">
                          <User className="mr-1" />
                          Profil
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          logout();
                        }}
                      >
                        <LogOut className="mr-1" />
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/login">Se connecter</Link>
                      </Button>
                      <Button variant="default" asChild>
                        <Link href="/register">S&apos;inscrire</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
