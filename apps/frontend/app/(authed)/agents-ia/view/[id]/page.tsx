"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type User = {
  id: string;
  lastname: string;
  firstname: string;
}

type AgentData = {
  id: string;
  name: string;
  description: string;
  skills: string[];
  url?: string;
  isVisible: boolean;
  updated_at: Date;
  created_at: Date;
  createdBy: User;
  updatedBy: User;
};

export default function AgentViewPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await api.get(`/agentia/${id}`);
        setAgent(response.data);
        console.log("Agent data:", response.data);
      } catch {
        toast.error("Erreur lors du chargement de l'agent.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAgent();
  }, [id]);

  if (loading) return <Skeleton className="w-full h-64 rounded-lg" />;

  if (!agent) {
    return <div className="text-muted-foreground text-center">Agent introuvable</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/agents-ia" className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Retour
          </Link>
        </Button>
      </div>
      <div className="max-w-[500px] mx-auto">
        <Card>
          <CardHeader className="space-y-2">
            <Badge variant={agent.isVisible ? "default" : "secondary"}>
              {agent.isVisible ? "Visible" : "Privé"}
            </Badge>
            <p className="text-muted-foreground">{agent.id}</p>
            <CardTitle className="text-2xl">{agent.name}</CardTitle>
            <CardDescription>{agent.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              {agent.url && (
                <p>
                  🔗 URL :{" "}
                  <a href={agent.url} target="_blank" className="text-blue-600 underline">
                    {agent.url}
                  </a>
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Compétences :</h2>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-1 gap-2">
            <div className="flex flex-col gap-2">
              <p>Créé le : {new Date(agent.created_at).toLocaleDateString()} par <span className="uppercase">{agent.createdBy.lastname}</span> <span className="capitalize">{agent.createdBy.firstname}</span></p>
              {agent.updatedBy && (
                <p>Modifié le : {new Date(agent.updated_at).toLocaleDateString()} par <span className="uppercase">{agent.updatedBy.lastname}</span> <span className="capitalize">{agent.updatedBy.firstname}</span></p>
              )}
            </div>
            <Button asChild>
              <Link href={`/agents-ia/edit/${agent.id}`}>Modifier l&apos;agent</Link>
            </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
  );
}
