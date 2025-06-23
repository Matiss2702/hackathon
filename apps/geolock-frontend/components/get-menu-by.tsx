"use client"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import api from "@/lib/axios"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface Page {
  id: string
  title: string
  slug: string
  parentId: string | null
  order: number
}

interface MenuResponse {
  menus: {
    pages: Page[]
  }[]
}

interface MenuTree extends Page {
  children: MenuTree[]
}

interface GetMenuByProps {
  menuKey: "main" | "footer"
}

export default function GetMenuBy({ menuKey }: GetMenuByProps) {
  const pathname = usePathname()
  const [tree, setTree] = useState<MenuTree[]>([])

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get<MenuResponse>(`menu-type/key/${menuKey}`)
        const pages = response.data.menus[0].pages
        const hierarchy = buildMenuTree(pages)
        setTree(hierarchy)
      } catch (error) {
        console.error("Erreur lors du chargement du menu :", error)
      }
    }

    fetchMenu()
  }, [menuKey])

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {tree.map(item => {
          const href = `/${item.slug}`
          const isActive = pathname === href

          return (
            <NavigationMenuItem key={item.id}>
              {item.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href={href}>{item.title}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4">
                      {item.children.map(child => (
                        <li key={child.id}>
                          <SubMenu page={child} parentPath={href} />
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <>
                  <Button variant={isActive ? "default" : "ghost"} asChild>
                    <Link href={href} className={navigationMenuTriggerStyle()}>
                      {item.title}
                    </Link>
                  </Button>
                </>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function buildMenuTree(pages: Page[], parentId: string | null = null): MenuTree[] {
  return pages
    .filter(p => p.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map(p => ({
      ...p,
      children: buildMenuTree(pages, p.id),
    }))
}

function SubMenu({ page, parentPath }: { page: MenuTree; parentPath: string }) {
  const pathname = usePathname()
  const path = `${parentPath}/${page.slug}`
  const isActive = pathname === path

  return (
    <>
      <Button variant={isActive ? "default" : "ghost"} asChild>
        <Link href={path} className="text-sm block w-full text-left justify-start">
          {page.title}
        </Link>
      </Button>
      {page.children.length > 0 && (
        <ul className="ml-4 mt-1 space-y-1">
          {page.children.map(child => (
            <li key={child.id}>
              <SubMenu page={child} parentPath={path} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
