"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Loader() {
  const router = useRouter();
  const { isAuthLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push('/maps');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-2"></div>
          <div>Chargement en cours...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-2"></div>
          <div>Redirection en cours...</div>
        </div>
      </div>
    );
  }
}