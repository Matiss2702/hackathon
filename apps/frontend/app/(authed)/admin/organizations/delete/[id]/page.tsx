"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowLeft } from "lucide-react";

type Organization = {
  id: string;
  name: string;
  vat: string;
  siren: string;
  siret: string;
  rib: string;
  deleted_at?: Date | null
};

export default function OrganizationDeletePage() {
  const router = useRouter();
  const { id } = useParams();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await api.get(`/organization/${id}`);
        setOrganization(res.data);
      } catch (error) {
        toast.error("Impossible de charger l'organisation.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrganization();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.delete(`/organization/${id}`);
      toast.success("Organisation supprimée avec succès !", {
        position: "top-center",
        description:
          "L'organisation a été supprimée. Redirection en cours.",
      });
      router.push("/admin/organizations");
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

  if (!organization) {
    return <p className="text-muted-foreground">Organisation introuvable</p>;
  }

  if (organization.deleted_at) {
    return (
      <div className="space-y-6">
        <p className="text-red-500">Cette organisation a déjà été supprimée.</p>
        <Button asChild>
          <Link href="/admin/organizations">Retour aux organisations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild>
          <Link href="/admin/organizations" className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Retour
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle size={28} />
        <h1 className="text-2xl font-bold">
          Suppression de l&apos;organisation
        </h1>
      </div>

      <div className="border rounded-lg p-4 space-y-2 bg-muted">
        <p><strong>Nom :</strong> {organization.name}</p>
        <p><strong>TVA :</strong> {organization.vat}</p>
        <p><strong>SIREN :</strong> {organization.siren}</p>
        <p><strong>SIRET :</strong> {organization.siret}</p>
        <p><strong>RIB :</strong> {organization.rib}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Vous pourrez la récupérer !
      </p>

      <div className="flex gap-4">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={submitting}
        >
          {submitting ? "Suppression..." : "Supprimer"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/organizations">Annuler</Link>
        </Button>
      </div>
    </div>
  );
}
