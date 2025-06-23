export function SidebarBadge({ count }: { count: number }) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
