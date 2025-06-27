"use client";

import { OrganizationUpdateFormData, OrganizationUpdateSchema } from "@/app/schemas/organization";
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
import { Switch } from "@/components/ui/switch";

export default function OrganizationEditPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [submitting, setSubmitting] = useState(false);
  const { user, organization, loading } = useCurrentUser({
    redirectOnFail: true,
    search: "organization",
  });

  const form = useForm<OrganizationUpdateFormData>({
    resolver: zodResolver(OrganizationUpdateSchema),
    defaultValues: {
      name: "",
      siret: "",
      siren: "",
      rib: "",
      vat: "",
      isDeleted: false,
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
          isDeleted: org.deleted_at ? true : false,
        });
      } catch {
        toast.error("Erreur lors du chargement de l'organisation");
        router.push("/organization");
      }
    };

    if (id) fetchOrganization();
  }, [id, form, router]);

  const onSubmit = async (data: OrganizationUpdateFormData) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/organization/${id}`, data);
      if (response.status === 200) {
        toast.success("Organisation mise à jour !",
          {
            description: "Organisation a été mise à jour avec succès.",
            position: "top-center",
          }
        );
        router.push("/admin/organizations");
      }
    } catch (error) {
      console.error("Erreur modification organisation :", error);
      toast.error("Échec de la mise à jour", {
        description: "Une erreur est survenue lors de la mise à jour de l'organisation.",
        position: "top-center",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canEditOrganization = user?.role === "admin";

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

  if (!organization) {
    toast.error("Organisation introuvable");
    router.push("/organization");
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
    { name: "rib", label: "RIB" },
  ]

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Button asChild>
          <Link href="/admin/organizations" className="flex items-center gap-2">
            <ArrowLeft />
            Retour
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Modifier l&apos;organisation {organization.name}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="isDeleted"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>À été supprimé ?</FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {fields.map((fieldDef) => (
            <FormField
              key={fieldDef.name}
              control={form.control}
              name={fieldDef.name as keyof OrganizationUpdateFormData}
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
