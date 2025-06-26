"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "./data-table";
import { columns, type Organization } from "./columns"

export default function OrganizationPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [organization, Organizations] = useState<Organization[]>([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await api.get("/organization");
        Organizations(response.data);
      } catch (error) {
        Organizations([]);
        console.error("Erreur lors de la récupération des organizations :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organisations</h1>
      </div>
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {organization.length === 0 ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Aucune organisation n&apos;a été trouvée</AlertTitle>
              <AlertDescription>Veuillez créer vos premières organisations !</AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="mt-4">Liste des organisations récupérées :</p>
              <div className="w-full">
                <DataTable columns={columns} data={organization} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}