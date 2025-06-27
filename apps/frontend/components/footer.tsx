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
                Lexa est une plateforme de création de sites web et d&apos;applications avec l&apos;IA
              </p>
            </div>
          </div>
          <div className=''>
            <h3 className='text-lg font-semibold mb-2'>Liens utiles</h3>
            <ul className='space-y-2'>
              <li>
                <Link href="/cgu" className='text-sm hover:underline'>CGU</Link>
              </li>
              <li>
                <Link href="/cgv" className='text-sm hover:underline'>CGV</Link>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <p className='tex-sm'>© 2025 Lexa, tout droit réservé</p>
        </div>
      </div>
    </footer>
  )
}