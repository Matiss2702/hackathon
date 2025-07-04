"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Check, Eye, Pen, Trash, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export type Agent = {
  id: string
  created_at: string
  updated_at: string
  description: string
  url: string
  isVisible: boolean
  skills : string[]
  name: string
}

export const columns: ColumnDef<Agent>[] = [
  {
    id: "id",
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
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Agent
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.name,
  },
  {
    id: "skills",
    accessorKey: "skills",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Compétences
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.skills.join(", "),
  },
  {
    id: "isVisible",
    accessorKey: "isVisible",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Visibilité
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      row.original.isVisible ? (
        <Check className="text-green-500 w-4 h-4" />
      ) : (
        <X className="text-red-500 w-4 h-4" />
      )
    ),
  },
  {
    id: "created_at",
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
    id: "updated_at",
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
      const agent = row.original;
      return (
        <div className="flex space-x-2">
          <Button asChild variant="view">
            <Link href={`/agents-ia/view/${agent.id}`}>
              <Eye />
              <span className="sr-only">Voir {agent.name}</span>
            </Link>
          </Button>
          <Button asChild variant="edit">
            <Link href={`/agents-ia/edit/${agent.id}`}>
              <Pen />
              <span className="sr-only">Modifier {agent.name}</span>
            </Link>
          </Button>
          <Button asChild variant="destructive">
            <Link href={`/agents-ia/delete/${agent.id}`}>
              <Trash />
              <span className="sr-only">Supprimer {agent.name}</span>
            </Link>
          </Button>
        </div>
      );
    },
  }
]