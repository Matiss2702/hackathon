'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileForm from '@/components/UserProfileForm';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { logout } = useAuth();

  const handleLogout = () => {
    toast.success('Vous avez été déconnecté avec succès.',
      {
        position: 'top-center',
        description: 'Vous allez être redirigé vers la page de connexion.',
      }
    );
    logout();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations de profil et préférences.
          </p>
        </div>

        {/* Card Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
            <CardDescription>
              Vous êtes maintenant dans l&apos;espace authentifié
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cette page est protégée par authentification. Seuls les utilisateurs connectés peuvent y accéder.
            </p>
          </CardContent>
        </Card>

        {/* Formulaire de profil utilisateur */}
        <UserProfileForm />

        {/* Logout Button */}
        <Card>
          <CardHeader>
            <CardTitle>Déconnexion</CardTitle>
            <CardDescription>
              Se déconnecter de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Se déconnecter
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}