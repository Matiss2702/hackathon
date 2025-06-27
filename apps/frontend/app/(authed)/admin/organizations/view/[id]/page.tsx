"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDateTime } from "@/lib/formatDateTime";

type User = {
  id: string;
  lastname: string;
  firstname: string;
}

type OrganizationDetails = {
  id: string;
  name: string;
  vat: string;
  siren: string;
  siret: string;
  rib: string;
  created_at: Date;
  updated_at: Date;
  createdBy: User;
  updatedBy: User;
  deleted_at?: Date | null;
};

export default function OrganizationViewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user, loading } = useCurrentUser({
    redirectOnFail: true,
    search: "organization",
  });

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await api.get(`/organization/${id}`);
        if (res.status === 200) {
          setOrganization(res.data);
        } else {
          toast.error("Organisation introuvable");
          router.push("/organization");
        }
      } catch (error) {
        console.error("Erreur chargement organisation :", error);
        toast.error("Erreur de chargement");
        router.push("/organization");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchOrganization();
  }, [id, router]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user || !organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button asChild>
            <Link href="/admin/organizations" className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Retour
            </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Détails de l&apos;organisation</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{organization.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <strong>ID :</strong>
            <p>{organization.id}</p>
          </div>
          <div>
            <strong>TVA :</strong>
            <p>{organization.vat}</p>
          </div>
          <div>
            <strong>SIREN :</strong>
            <p>{organization.siren}</p>
          </div>
          <div>
            <strong>SIRET :</strong>
            <p>{organization.siret}</p>
          </div>
          <div>
            <strong>RIB :</strong>
            <p>{organization.rib}</p>
          </div>
          { organization.createdBy && (
            <div>
              <div>
                <strong>Créée par :</strong>
                <p>
                  <span className="uppercase">{organization.createdBy.lastname}</span><span className="capitalize">{organization.createdBy.firstname}</span>
                </p>
              </div>
              <div>
                <strong>Créé le :</strong>
                <p>
                  {formatDateTime(organization.created_at)}
                </p>
              </div>
            </div>
          )}
          { organization.updatedBy && (
            <div>
              <div>
                <strong>Mise à jour par :</strong>
                <p>
                  <span className="uppercase">{organization.updatedBy.lastname}</span><span className="capitalize">{organization.updatedBy.firstname}</span>
                </p>
              </div>
              <div>
                <strong>Mise à jour le :</strong>
                <p>
                  {formatDateTime(organization.updated_at)}
                </p>
              </div>
            </div>
          )}
          { organization.deleted_at && (
            <div>
              <strong>Supprimé le :</strong>
              <p>
                {formatDateTime(organization.deleted_at)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}