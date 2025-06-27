"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ValidTarificationsName = "monthly" | "annually";
type GetTarificationsProps = {
  name: ValidTarificationsName;
};

type Tarification = {
  id: string;
  name: string;
  price_monthly: number;
  price_annually: number;
  token: number;
  description: string[];
};

const ORDER: Record<string, number> = {
  decouverte: 1,
  essentiel: 2,
  pro: 3,
};

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function GetTarifications({ name }: GetTarificationsProps) {
  const [tarifications, setTarifications] = useState<Tarification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTarifications = async () => {
      try {
        const response = await api.get("/tarification/public");
        const data: Tarification[] = await response.data;
        setTarifications(data);
      } catch (error) {
        console.error("Erreur lors du chargement des tarifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTarifications();
  }, []);

  const discovery = tarifications.find(
    (t) => normalizeName(t.name) === "decouverte"
  );

  const filtered = tarifications
    .filter(
      (t) =>
        normalizeName(t.name) !== "decouverte" &&
        (name === "monthly"
          ? t.price_monthly > 0
          : t.price_annually > 0)
    )
    .sort(
      (a, b) =>
        (ORDER[normalizeName(a.name)] || 99) -
        (ORDER[normalizeName(b.name)] || 99)
    );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!discovery && filtered.length === 0) {
    return (
      <Alert variant="destructive" className="flex items-start gap-3">
        <TriangleAlert className="h-4 w-4 text-red-500 mt-1" />
        <div>
          <AlertTitle>Aucun plan {name} trouvé</AlertTitle>
        </div>
      </Alert>
    );
  }

  const renderCard = (tarif: Tarification) => {
    const nameNorm = normalizeName(tarif.name);
    const isPopular = nameNorm === "essentiel";
    const isFree =
      nameNorm === "decouverte" &&
      (name === "monthly" ? tarif.price_monthly === 0 : tarif.price_annually === 0);

    const isZeroPrice =
      name === "monthly" ? tarif.price_monthly === 0 : tarif.price_annually === 0;

    const price = isZeroPrice
      ? "€0"
      : name === "monthly"
      ? `€${tarif.price_monthly}`
      : `€${tarif.price_annually}`;

    const priceSuffix = name === "monthly" ? "/mois" : "/an";

    const benefitTitle = isFree
      ? "Inclus avec le plan gratuit :"
      : nameNorm === "essentiel"
      ? "Inclus avec Essentiel :"
      : "Inclus avec Pro :";

    return (
      <Card
        key={tarif.id}
        className="flex flex-col shadow-md p-6 border border-border gap-12"
      >
        <CardHeader className="min-h-[180px] px-0">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl font-bold capitalize">
              {tarif.name}
            </CardTitle>
            {isPopular && <Badge>POPULAR</Badge>}
          </div>
          <p className="text-5xl font-bold mt-4">
            {price}
            <span className="text-sm text-muted-foreground">{priceSuffix}</span>
          </p>
          <Button className="w-full">
            {isFree ? "Commencer gratuitement" : "S’abonner"}
          </Button>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4 px-0">
          <div>
            <p className="font-medium mb-1">{benefitTitle}</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-1 text-green-500 shrink-0" />
                <span className="leading-snug text-gray-400">{tarif.token} crédits / mois</span>
              </li>
              {tarif.description.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 text-green-500 shrink-0" />
                  <span className="leading-snug text-gray-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {discovery && renderCard(discovery)}
      {filtered.map((tarif) => renderCard(tarif))}
    </div>
  );
}
