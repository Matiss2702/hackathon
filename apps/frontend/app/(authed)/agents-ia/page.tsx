"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "./data-table";
import { columns, type Agent } from "./columns"
import { Button } from "@/components/ui/button";

export default function AIAgentsPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [agents, Agents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agentia");
        Agents(response.data);
      } catch (error) {
        Agents([]);
        console.error("Erreur lors de la récupération des agents :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Button>
          <a href="/agents-ia/new">Créer un agent</a>
        </Button>
      </div>
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {agents.length === 0 ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Aucun agent n&apos;a été trouvé</AlertTitle>
              <AlertDescription>Veuillez créer vos premiers agents !</AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="mt-4">Liste des agents récupérés :</p>
              <div className="w-full">
                <DataTable columns={columns} data={agents} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}