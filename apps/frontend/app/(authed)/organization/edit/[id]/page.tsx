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
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function OrganizationEditPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [submitting, setSubmitting] = useState(false);
  const { user, loading } = useCurrentUser({
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

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await api.get(`/organization/${id}`);
        const org = res.data;
        form.reset({
          name: org.name,
          siret: org.siret,
          siren: org.siren,
          rib: org.rib,
          vat: org.vat,
        });
      } catch {
        toast.error("Erreur lors du chargement de l'organisation");
        router.push("/organization");
      }
    };

    if (id) fetchOrganization();
  }, [id, form, router]);

  const onSubmit = async (data: OrganizationCreateFormData) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/organization/${id}`, data);
      if (response.status === 200) {
        toast.success("Organisation mise à jour !",
          {
            description: "Votre organisation a été mise à jour avec succès.",
            position: "top-center",
          }
        );
        router.push("/organization");
      }
    } catch {
      toast.error("Échec de la mise à jour", {
        description: "Une erreur est survenue lors de la mise à jour de l'organisation.",
        position: "top-center",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canEditOrganization =
    user?.role === "admin" || user?.role === "organization_admin";

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

  if (!canEditOrganization) {
    router.push("/organization");
    return null;
  }

  const fields = [
    { name: "name", label: "Nom" },
    { name: "vat", label: "TVA" },
    { name: "siren", label: "SIREN" },
    { name: "siret", label: "SIRET" },
    { name: "rib", label: "RIB" },]

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

      <h1 className="text-2xl font-bold">Modifier mon organisation</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((fieldDef) => (
            <FormField
              key={fieldDef.name}
              control={form.control}
              name={fieldDef.name as keyof OrganizationCreateFormData}
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 gap-2">
                  <FormLabel>{fieldDef.label}</FormLabel>
                  <FormControl>
                    <Input placeholder={fieldDef.label} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Mise à jour en cours..." : "Mettre à jour"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
