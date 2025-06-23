"use client";

import api from "@/lib/axios";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Page = {
  id: string;
  title: string;
  is_active: boolean;
  order: number;
  parentId: string | null;
};

type Menu = {
  id: string;
  createdAt: string;
  updatedAt: string;
  menuType: {
    id: string;
    title: string;
  };
  pages: Page[];
};

export default function AdminMenusView() {
  const { id } = useParams();
  const [menu, setMenu] = useState<Menu | null>(null);

  if (!id) {
    notFound();
  }

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get(`/menu/${id}`);
        if (response.status !== 200) {
          notFound();
        }
        setMenu(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement du menu.", {
          position: "top-center",
        });
        console.error("Erreur lors du chargement du menu :", error);
        notFound();
      }
    };

    fetchMenu();
  }, [id]);

  if (!menu || !id) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Button asChild>
            <Link href="/admin/menus">
              <ArrowLeft /> Retour
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Menu non trouvé</h1>
        <p className="mt-4">Le menu que vous cherchez n&apos;existe pas ou a été supprimé.</p>
      </div>
    );
  }

  const renderPages = (parentId: string | null, depth = 0) => {
    const children = menu.pages
      .filter((page) => page.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    if (children.length === 0) return null;

    return (
      <ul className={`ml-${depth > 0 ? 6 : 0} space-y-1`}>
        {children.map((page) => (
          <li key={page.id}>
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {page.order + 1}.
              </span>
              <span>{page.is_active ? "✅" : "❌"}</span>
              <span>{page.title}</span>
            </div>
            {renderPages(page.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Button asChild>
          <Link href="/admin/menus">
            <ArrowLeft /> Retour
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Détails du menu : {menu.menuType.title}</h1>

      <h2 className="text-xl font-bold mt-4">Structure des pages</h2>
      {renderPages(null)}
    </div>
  );
}
