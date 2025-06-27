"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "./data-table";
import { columns, type Subscription } from "./columns"
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const { user, loading } = useCurrentUser({
    redirectOnFail: false,
    search: "",
  });

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await api.get("/subscription");
        setSubscriptions(response.data);
      } catch (error) {
        setSubscriptions([]);
        console.error("Erreur lors de la récupération des souscriptions :", error);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 flex justify-center">
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Abonnements</h1>
      </div>
        {subscriptions.length === 0 ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Aucun abonnement n&apos;a été trouvé</AlertTitle>
          </Alert>
        ) : (
          <>
            <p className="mt-4">Liste des abonnements récupérés :</p>
            <div className="w-full">
              <DataTable columns={columns} data={subscriptions} />
            </div>
          </>
        )}
    </div>
  );
}