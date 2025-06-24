import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import SidebarNavFooter from "@/components/sidebar-footer"
import SidebarNavMenu from "@/components/sidebar-menu"
import Logo from "@/components/logo"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="block">
              <Logo />
              <span className="sr-only">Go to home</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarNavMenu />
      <SidebarFooter>
        <SidebarNavFooter />
      </SidebarFooter>
    </Sidebar>
  )
}
