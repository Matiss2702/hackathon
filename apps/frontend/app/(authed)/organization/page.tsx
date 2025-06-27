"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type OrganizationDetails = {
  id: string;
  name: string;
  vat: string;
  siren: string;
  siret: string;
  rib: string;
  deleted_at: string | null;
};

export default function OrganizationPage() {
  const router = useRouter();
  const [detailsOrganization, setDetailsOrganization] = useState<OrganizationDetails | null>(null);
  const { user, organization, loading } = useCurrentUser({
    redirectOnFail: false,
    search: "organization",
  });

  useEffect(() => {
    if (!organization) return;

    const fetchExtraData = async () => {
      try {
        const response = await api.get(`/organization/${organization.id}`);
        if (response.status !== 200) {
          toast.error("❌ Une erreur est survenue lors de la récupération des données de l'organisation.", {
            position: "top-center",
            description: "Veuillez réessayer plus tard.",
          });
          return;
        }

        setDetailsOrganization(response.data);
      } catch (error) {
        console.error("❌ Erreur API additionnelle :", error);
      }
    };

    fetchExtraData();
  }, [organization]);

  const canEditOrganization = user?.role === "admin" || user?.role === "organization_admin";
  const isDeleted = detailsOrganization?.deleted_at !== null;

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

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mon organisation</h1>

        {!organization && !isDeleted && (
          <Button asChild>
            <Link href="/organization/create">Créer mon organisation</Link>
          </Button>
        )}

        {organization && canEditOrganization && !isDeleted && (
          <Button asChild>
            <Link href={`/organization/edit/${organization.id}`}>
              Modifier mon organisation
            </Link>
          </Button>
        )}
      </div>

      {isDeleted && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Organisation désactivée</AlertTitle>
          <AlertDescription>
            Cette organisation a été désactivée. Merci de contacter un administrateur pour plus d’informations.
          </AlertDescription>
        </Alert>
      )}

      {detailsOrganization && (
        <div className="max-w-[500px] w-full mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{detailsOrganization.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <strong>ID :</strong>
                  <p className="font-medium">{detailsOrganization.id}</p>
                </div>
                <div>
                  <strong>TVA :</strong>
                  <p className="font-medium">{detailsOrganization.vat}</p>
                </div>
                <div>
                  <strong>SIREN :</strong>
                  <p className="font-medium">{detailsOrganization.siren}</p>
                </div>
                <div>
                  <strong>SIRET :</strong>
                  <p className="font-medium">{detailsOrganization.siret}</p>
                </div>
                <div>
                  <strong>RIB :</strong>
                  <p className="font-medium">{detailsOrganization.rib}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
