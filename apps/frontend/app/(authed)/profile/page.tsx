'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileForm from '@/components/UserProfileForm';

export default function ProfilePage() {
  const { logout, token } = useAuth();

  const handleLogout = () => {
    console.log('🔓 Bouton logout cliqué');
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
      </div>
    </div>
  );
}