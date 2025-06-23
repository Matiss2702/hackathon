"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Pen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export type Menu = {
  id: string
  menu: string
  createdAt: string
  updatedAt: string
  menuType: {
    id: string
    title: string
  }
  pages: [
    {
      id: string
      is_active: boolean
    }
  ]
}

export const columns: ColumnDef<Menu>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "menuTypeTitle",
    accessorKey: "menuType.title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Menu
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.menuType.title,
  },
  {
    accessorKey: "pages",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Pages
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.pages.length,
    sortingFn: (a, b) => a.original.pages.length - b.original.pages.length,
  },
  {
    id: "pages_published",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Pages publiées
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.original.pages.filter((p) => p.is_active).length,
    sortingFn: (a, b) =>
      a.original.pages.filter((p) => p.is_active).length -
      b.original.pages.filter((p) => p.is_active).length,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Créée le
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mise à jour le
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const menu = row.original;
      return (
        <div className="flex space-x-2">
          <Button asChild variant="view">
            <Link href={`/admin/menus/view/${menu.id}`}>
              <Eye />
              <span className="sr-only">Voir {menu.menuType.title}</span>
            </Link>
          </Button>
          <Button asChild variant="edit">
            <Link href={`/admin/menus/edit/${menu.id}`}>
              <Pen />
              <span className="sr-only">Modifier {menu.menuType.title}</span>
            </Link>
          </Button>
        </div>
      );
    },
  }
]