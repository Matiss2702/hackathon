"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/lib/useCurrentUser";
import api from "@/lib/axios";
import { toast } from "sonner";

// type Subscription = {
//   id: string;
//   tarification: {
//     id: string;
//     name: string;
//     price: number
//     token: number;
//     description: string[];
//   };
//   created_at: Date;
//   end_at: Date;
// }

type Tarification = {
  id: string;
  name: string;
  price_monthly: number;
  price_annually: number;
  token: number;
  description: string[];
};

export default function SubscribePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const name = searchParams.get("name") as "monthly" | "annually" | null;

  const { user, loading: userLoading } = useCurrentUser({
    redirectOnFail: false,
    search: "",
  });

  const [tarification, setTarification] = useState<Tarification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !name || (name !== "monthly" && name !== "annually")) {
      router.replace("/404");
    }
  }, [id, name, router]);

  useEffect(() => {
    if (!id) return;

    const fetchTarif = async () => {
      try {
        const response = await api.get(`/tarification/${id}?from=front`);
        setTarification(response.data);
      } catch (err) {
        console.error("Tarification introuvable", err);
        setTarification(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTarif();
  }, [id]);

  const handleSubscribe = async () => {
    if (!tarification || !user) {
      toast.error("Données manquantes", {
        description: "Impossible de continuer la souscription.",
        position: "top-center",
      });
      return;
    }

    try {
      const payload = {
        tarification: {
          planType: name,
          id: tarification.id,
          name: tarification.name,
          token: tarification.token,
          description: tarification.description,
          price: name === "annually" ? tarification.price_annually : tarification.price_monthly,
        }
      };

      const response = await api.post("/subscription", payload);

      if (response.status !== 201) {
        toast.error("Erreur lors de la souscription", {
          description: "Veuillez réessayer plus tard.",
          position: "top-center",
        });
        return;
      }

      toast.success("Souscription réussie", {
        description: `Vous avez souscrit à l'abonnement ${tarification.name} (${name === "monthly" ? "mensuel" : "annuel"}).`,
        position: "top-center",
      });

      router.push("/subscription");
    } catch (err) {
      console.error("Erreur lors de la souscription", err);
      toast.error("Erreur serveur", {
        description: "Impossible de finaliser la souscription.",
        position: "top-center",
      });
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="max-w-7xl mx-auto p-4">
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Vous devez être connecté</AlertTitle>
          <AlertDescription>
            Veuillez vous connecter pour souscrire à un abonnement.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (!tarification) {
    return (
      <section className="max-w-7xl mx-auto p-4">
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Tarification introuvable</AlertTitle>
          <AlertDescription>
            L’abonnement demandé n’existe pas ou a été supprimé.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="capitalize text-2xl">
            Abonnement : {tarification.name} ({name === "monthly" ? "mensuel" : "annuel"})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Prix {name === "monthly" ? "mensuel" : "annuel"} :{" "}
            <strong>
              {name === "monthly"
                ? `${tarification.price_monthly} €`
                : `${tarification.price_annually} €`}
            </strong>
          </p>

          <p>
            Tokens inclus : <strong>{tarification.token}</strong>
          </p>

          <p>
            Expire le :{" "}
            <strong>
              {new Date(
                new Date().setMonth(
                  name === "monthly"
                    ? new Date().getMonth() + 1
                    : new Date().getMonth() + 12
                )
              ).toLocaleDateString("fr-FR")}
            </strong>
          </p>

          <p>
            Renouvelé automatiquement le{" "}
            <strong>
              {new Date(
                new Date().setMonth(
                  name === "monthly"
                    ? new Date().getMonth() + 1
                    : new Date().getMonth() + 12
                )
              ).toLocaleDateString("fr-FR")}
            </strong>
          </p>
          <div>
            <p className="font-semibold mb-1">Description :</p>
            <ul className="list-disc list-inside text-muted-foreground">
              {tarification.description.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <Button className="w-full" onClick={handleSubscribe}>
            Souscrire
          </Button>
        </CardContent>

      </Card>
    </section>
  );
}
