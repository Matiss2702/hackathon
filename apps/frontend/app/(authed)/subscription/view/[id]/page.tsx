"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Package, Coins, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SubscriptionView = {
  id: string;
  tarification: {
    name: string;
    price: number;
    planType: "monthly" | "annually";
    description: string[];
    token: number;
  };
  end_at: Date;
  created_at: Date;
};

export default function SubscriptionViewPage() {
  const { id } = useParams();
  const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await api.get(`/subscription/${id}`);
        setSubscription(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement de la souscription", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSubscription();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-6">
        <AlertTitle>Abonnement introuvable</AlertTitle>
        <AlertDescription>
          Impossible de récupérer les détails de cette souscription.
        </AlertDescription>
      </Alert>
    );
  }

  const { tarification, created_at, end_at } = subscription;

  const isExpired =
    end_at && new Date(end_at).getTime() < new Date().getTime();

  return (
    <section className="grid grid-cols-1 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Détails de la souscription</h1>
      </div>
      <div>
        <Button asChild>
          <Link href="/subscription/">Retour</Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-bold">
              Abonnement à <span className="text-primary">{tarification.name}</span>
            </CardTitle>
            {isExpired && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Expiré
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p>N° de souscription :</p>
            <span className="font-bold">{subscription.id}</span>
          </div>
          <div>
            <p>
              Prix :
            </p>
            <span className="font-bold">{tarification.price} €</span> <span>{tarification.planType === "annually" ? "par an" : "par mois"}</span>
          </div>
          <div>
            <p className="text-gray-700">
              Description :
            </p>
            <div className="flex flex-wrap gap-2">
              <p className="font-bold">{tarification.description.join(", ")}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Package className="text-muted-foreground w-5 h-5" />
              <span className="text-sm">
                Plan : <strong>{tarification.name}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Coins className="text-muted-foreground w-5 h-5" />
              <span className="text-sm">
                Tokens inclus : <strong>{tarification.token}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="text-muted-foreground w-5 h-5" />
              <span className="text-sm">
                Début :{" "}
                <strong>{new Date(created_at).toLocaleDateString()}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="text-muted-foreground w-5 h-5" />
              <span className="text-sm">
                Fin :{" "}
                <strong>
                  {end_at
                    ? new Date(end_at).toLocaleDateString()
                    : "Non défini"}
                </strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
