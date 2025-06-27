"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "./data-table";
import { columns, type Agent } from "./columns";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function AIAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  
  const { user, organization, loading } = useCurrentUser({
    redirectOnFail: true,
    search: "organization",
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agentia?from=organization");
        setAgents(response.data);
      } catch (error) {
        setAgents([]);
        console.error("Erreur lors de la récupération des agents :", error);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (!organization) {
    toast.error("Vous devez être membre d'une organisation pour accéder à cette page.", {
      description: "Veuillez rejoindre ou créer une organisation.",
      position: "top-center",
    });
    router.push("/organization");
    return null;
  }

  const isDeleted = organization.deleted_at !== null;
  const canCreateAgent = !isDeleted && (user?.role === "admin" || user?.role === "organization_admin");

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Agents</h1>
        {canCreateAgent && (
          <Button asChild>
            <Link href="/agents-ia/new" className="flex items-center gap-2">
              Créer un agent
            </Link>
          </Button>
        )}
      </div>

      {isDeleted && (
        <Alert variant="destructive">
          <TriangleAlert className="h-5 w-5" />
          <AlertTitle>Organisation désactivée</AlertTitle>
          <AlertDescription>
            Votre organisation est actuellement désactivée. La gestion des agents est bloquée. Veuillez contacter un administrateur.
          </AlertDescription>
        </Alert>
      )}

      {!isDeleted && agents.length === 0 && (
        <Alert variant="destructive">
          <TriangleAlert className="h-5 w-5" />
          <AlertTitle>Aucun agent n&apos;a été trouvé</AlertTitle>
          <AlertDescription>
            Veuillez créer vos premiers agents !
          </AlertDescription>
        </Alert>
      )}

      {!isDeleted && agents.length > 0 && (
        <>
          <p className="mt-4">Liste des agents récupérés :</p>
          <div className="w-full">
            <DataTable columns={columns} data={agents} />
          </div>
        </>
      )}
    </div>
  );
}
