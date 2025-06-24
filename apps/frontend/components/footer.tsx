"use client"

import { hasTag } from '@/lib/route';
import { usePathname } from 'next/navigation';
import Link from "next/link"
import Logo from '@/components/logo';

export default function Footer() {
  const pathname = usePathname();

  const isHiddenRoute = hasTag(pathname, 'hidden');

  if (isHiddenRoute) return null;

  return (
    <footer className="w-full border-t">
      <div className="w-full mx-auto max-w-7xl grid grid-cols-1 gap-16 py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="flex flex-col items-start gap-4">
              <Link href="/" className="text-xl font-bold">
                <Logo />
                <span className="sr-only">Page d&apos;accueil</span>
              </Link>
              <p>
                Services CEO est une plateforme de mise en relation entre les dirigeants d’entreprise et les prestataires de services.
              </p>
            </div>
          </div>

        </div>
        <div>
          <p className='tex-sm'>© 2025 Services CEO, tout droit réservé</p>
        </div>
      </div>
    </footer>
  )
}