'use client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>
              Détails de votre compte actuellement connecté
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Statut</label>
              <p className="text-sm text-muted-foreground">✅ Connecté</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Token (aperçu)</label>
              <p className="text-sm text-muted-foreground font-mono">
                {token ? token.substring(0, 20) + '...' : 'Aucun token'}
              </p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}