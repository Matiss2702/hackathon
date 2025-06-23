"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "./data-table";
import { columns, type Menu } from "./columns"

export default function AdminMenus() {
  const [isLoading, setIsLoading] = useState(true);

  const [menus, setMenus] = useState<Menu[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get("/menu");
        setMenus(response.data);
      } catch (error) {
        setMenus([]);
        console.error("Erreur lors de la récupération des menus :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menus</h1>
      </div>
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {menus.length === 0 ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Aucun menu n&apos;a été trouvée</AlertTitle>
              <AlertDescription>Veuillez créer vos premières menus !</AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="mt-4">Liste des menus récupérées :</p>
              <div className="w-full">
                <DataTable columns={columns} data={menus} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}