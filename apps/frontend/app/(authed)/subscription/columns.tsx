"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export type Subscription = {
  id: string
  tarification: {
    id: string
    name: string
    price: number
    token: number
    planType: "monthly" | "annually"
    description: string[]
  }
  created_at: Date
  end_at: Date
}

export const columns: ColumnDef<Subscription>[] = [
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
    id: "tarification",
    accessorKey: "tarification.name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Plan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.tarification.name,
  },
  {
    id: "type",
    accessorKey: "tarification.planType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type de plan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.tarification.planType === "annually" ? "Annuel" : "Mensuel",
  },
  {
    id: "price",
    accessorKey: "tarification.price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Prix
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.tarification.price.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    }),
  },
  {
    id: "token",
    accessorKey: "tarification.token",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Crédits Alloués
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.tarification.token.toLocaleString(),
  },
  {
    id: "description",
    accessorKey: "tarification.description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Compétences
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.tarification.description.join(", "),
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
          Souscrit le
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
    id: "end_at",
    accessorKey: "end_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Se termine le
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
      const subscription = row.original;
      return (
        <div className="flex space-x-2">
          <Button asChild variant="view">
            <Link href={`/subscription/view/${subscription.id}`}>
              <Eye />
              <span className="sr-only">Voir {subscription.tarification.name}</span>
            </Link>
          </Button>
        </div>
      );
    },
  }
]