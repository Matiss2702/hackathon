"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeJWT, JWTPayload } from "@/lib/decodeJWT";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";

type Organization = {
  id: string;
  name: string;
  deleted_at?: Date | null;
};

type User = {
  id: string;
  email: string;
  role: string;
  organization_id?: string;
  organization?: Organization | null;
  [key: string]: unknown;
};

type UseCurrentUserOptions = {
  redirectOnFail?: boolean;
  search?: string;
};

export function useCurrentUser(options?: UseCurrentUserOptions) {
  const { token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [jwtPayload, setJWTPayload] = useState<JWTPayload | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    decodeJWT(token)
      .then(async (decoded) => {
        setJWTPayload(decoded);

        if (!decoded?.id) {
          setLoading(false);
          return;
        }

        try {
          const res = await api.get("/user/me")

          const currentUser: User = res.data;
          setUser(currentUser);

          if (!currentUser) {
            if (options?.redirectOnFail) {
              toast.error("Utilisateur introuvable");
              router.push("/login");
            }
            setLoading(false);
            return;
          }

          if (options?.search === "organization" && currentUser.organization_id !== null) {
            const org = await api.get(`/organization/${currentUser.organization_id}`);
            setOrganization(org.data);
          } else {
            setOrganization(null);
          }

          setLoading(false);
        } catch (error) {
          console.error("❌ Erreur user/organization", error);
          if (options?.redirectOnFail) router.push("/login");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("❌ Token invalide", err);
        setJWTPayload(null);
        if (options?.redirectOnFail) router.push("/login");
        setLoading(false);
      });
  }, [token, options?.search, options?.redirectOnFail, router]);

  return {
    loading,
    user,
    organization,
    jwtPayload,
  };
}
