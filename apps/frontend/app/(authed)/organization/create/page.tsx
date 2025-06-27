"use client";

import { OrganizationCreateFormData, OrganizationCreateSchema } from "@/app/schemas/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function OrganizationCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [, setResponse] = useState(null);
  const { user, organization, loading } = useCurrentUser({
    redirectOnFail: true,
    search: "organization",
  });

  const form = useForm<OrganizationCreateFormData>({
    resolver: zodResolver(OrganizationCreateSchema),
    defaultValues: {
      name: "",
      siret: "",
      siren: "",
      rib: "",
      vat: "",
    },
  });

  const onSubmit = async (data: OrganizationCreateFormData) => {
    setSubmitting(true);
    try {
      const response = await api.post("/organization", data);
      if (response.status === 201) {
        toast.success("Organisation créée avec succès !");
        setResponse(response.data);
        router.push("/organization");
      }
    } catch (error) {
      console.error("Erreur création organisation :", error);
    } finally {
      setSubmitting(false);
      form.reset();
    }
  };

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
      <div>
        <Button asChild>
          <Link href="/organization" className="flex items-center gap-2">
            <ArrowLeft />
            Retour
          </Link>
        </Button>
      </div>

      {organization ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-5 w-5" />
          <AlertTitle>Vous avez déjà une organisation</AlertTitle>
          <AlertDescription>
            Vous ne pouvez en créer qu’une seule.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Création de mon organisation</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-1 gap-2">
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'organisation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vat"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-1 gap-2">
                    <FormLabel>TVA intercommunautaire</FormLabel>
                    <FormControl>
                      <Input placeholder="FRXX123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siren"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-1 gap-2">
                    <FormLabel>SIREN</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siret"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-1 gap-2">
                    <FormLabel>SIRET</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678900000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rib"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-1 gap-2">
                    <FormLabel>RIB</FormLabel>
                    <FormControl>
                      <Input placeholder="FR7612345678901234567890185" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Création en cours..." : "Créer mon organisation"}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}