import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/context/AuthContext';

const initialState = {
  lastname: '',
  firstname: '',
  email: '',
  phone_number: '',
  siret: '',
  legalStatus: '',
  identityDocument: '',
  rib: '',
  companyName: '',
  companyImage: '',
  image: '',
};

export default function UserProfileForm() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    axios.get('/user/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setForm({
          lastname: res.data.lastname || '',
          firstname: res.data.firstname || '',
          email: res.data.email || '',
          phone_number: res.data.phone_number || '',
          siret: res.data.siret || '',
          legalStatus: res.data.legalStatus || '',
          identityDocument: res.data.identityDocument || '',
          rib: res.data.rib || '',
          companyName: res.data.companyName || '',
          companyImage: res.data.companyImage || '',
          image: res.data.image || '',
        });
        setUserId(res.data.id);
      })
      .catch(() => setError('Erreur lors du chargement du profil.'));
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/user/${userId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Profil mis à jour !');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Mon profil</h2>
      {success && <div className="text-green-600">{success}</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lastname" className="block mb-1 font-medium">Nom</label>
          <Input id="lastname" name="lastname" value={form.lastname} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="firstname" className="block mb-1 font-medium">Prénom</label>
          <Input id="firstname" name="firstname" value={form.firstname} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <Input id="email" name="email" value={form.email} onChange={handleChange} type="email" required />
        </div>
        <div>
          <label htmlFor="phone_number" className="block mb-1 font-medium">Téléphone</label>
          <Input id="phone_number" name="phone_number" value={form.phone_number} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="siret" className="block mb-1 font-medium">SIRET (pour devenir prestataire)</label>
          <Input id="siret" name="siret" value={form.siret} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="legalStatus" className="block mb-1 font-medium">Statut juridique</label>
          <Input id="legalStatus" name="legalStatus" value={form.legalStatus} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="identityDocument" className="block mb-1 font-medium">Pièce d'identité (URL)</label>
          <Input id="identityDocument" name="identityDocument" value={form.identityDocument} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="rib" className="block mb-1 font-medium">RIB</label>
          <Input id="rib" name="rib" value={form.rib} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="companyName" className="block mb-1 font-medium">Nom de la société</label>
          <Input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="companyImage" className="block mb-1 font-medium">Image société (URL)</label>
          <Input id="companyImage" name="companyImage" value={form.companyImage} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="image" className="block mb-1 font-medium">Logo / Photo de profil (URL)</label>
          <Input id="image" name="image" value={form.image} onChange={handleChange} placeholder="URL de votre logo ou photo de profil" />
        </div>
      </div>
      <Button type="submit" disabled={loading || !userId}>{loading ? 'Envoi...' : 'Enregistrer'}</Button>
    </form>
  );
} 