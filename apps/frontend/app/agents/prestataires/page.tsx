'use client';
import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function PrestatairesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/user')
      .then(res => setUsers(res.data.filter((u: any) => u.siret)))
      .catch(() => setError('Erreur lors du chargement des prestataires.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tous les prestataires</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <Card key={u.id} className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="size-12">
                <AvatarImage src={u.image} alt={u.firstname + ' ' + u.lastname} />
                <AvatarFallback>
                  {u.firstname?.[0]?.toUpperCase()}{u.lastname?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{u.firstname} {u.lastname}</CardTitle>
                <div className="text-muted-foreground text-xs">{u.companyName}</div>
              </div>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
} 