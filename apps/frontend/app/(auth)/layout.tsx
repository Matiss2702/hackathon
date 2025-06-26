"use client";

import Image from "next/image";
import cover from "@/public/cover-bg.jpg";
import Link from "next/link";
import { ModeToggle } from "@/components/toggle-theme";
import Loader from "@/components/loader";
import { useAuth } from "@/context/AuthContext";
import { decodeJWT } from "@/lib/decodeJWT";
import Logo from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { token, isAuthLoading } = useAuth();
  
  if (isAuthLoading) {
    return <Loader />;
  }

  decodeJWT(token || '');
  
  return (
    <main className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        <div className="hidden lg:block w-full">
          <div className="relative h-full w-full">
            <Image
              src={cover}
              alt="Cover Background"
              className="object-cover h-full w-full"
              priority={true}
            />
            <div className="absolute bg-black/50 w-full h-full inset-0"></div>
          </div>
        </div>
        <div className="flex flex-col items-center h-full gap-12 max-w-lg p-4 lg:p-8 mx-auto w-full">
          <div className="container flex items-center justify-between top-0 sticky backdrop-blur z-50 p-4">
              <Link href="/" className="block">
                <Logo />
                <span className="sr-only">Aller à l&apos;accueil</span>
              </Link>
              <ModeToggle />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
