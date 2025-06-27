"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowLeft } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  description: string;
};

export default function AgentDeletePage() {
  const router = useRouter();
  const { id } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await api.get(`/agentia/${id}`);
        setAgent(res.data);
      } catch (error) {
        toast.error("Impossible de charger l'agent.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAgent();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.delete(`/agentia/${id}`);
      toast.success("Agent supprimé avec succès !", {
        position: "top-center",
        description: "L'agent a été supprimé définitivement. Vous allez être redirigé.",
      });
      router.push("/admin/agents-ia");
    } catch (error) {
      toast.error("Échec de la suppression.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Skeleton className="w-full h-40 rounded-lg" />;
  }

  if (!agent) {
    return <p className="text-muted-foreground">Agent introuvable</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild>
          <Link href="/admin/agents-ia" className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Retour
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle size={28} />
        <h1 className="text-2xl font-bold">
          Suppression irréversible de l&apos;agent
        </h1>
      </div>

      <div className="border rounded-lg p-4 space-y-2 bg-muted">
        <p><strong>Nom :</strong> {agent.name}</p>
        <p><strong>Description :</strong> {agent.description}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Cette action est <strong>définitive</strong>. Aucune récupération ne sera possible.
      </p>

      <div className="flex gap-4">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={submitting}
        >
          {submitting ? "Suppression..." : "Supprimer définitivement"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/agents-ia">Annuler</Link>
        </Button>
      </div>
    </div>
  );
}
