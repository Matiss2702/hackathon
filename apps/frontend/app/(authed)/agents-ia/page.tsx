"use client";
import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";

interface AgentIA {
  id: string;
  job: string;
  tarif: number;
  skills: string[];
  description?: string;
  url: string;
  isVisible: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    firstname?: string;
    lastname?: string;
  };
}

const initialForm: Partial<AgentIA> = {
  job: "",
  tarif: 0,
  skills: [],
  description: "",
  url: "",
  isVisible: true,
};

export default function AgentsIACrudPage() {
  const { token } = useAuth();
  const [agents, setAgents] = useState<AgentIA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const fetchAgents = () => {
    setLoading(true);
    axios.get("/agentia?includeUser=true", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAgents(res.data.filter((a: AgentIA) => a)))
      .catch(() => setError("Erreur lors du chargement des agents IA."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchAgents();
    // eslint-disable-next-line
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, skills: e.target.value.split(",").map(s => s.trim()) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editId) {
        const { id, userId, user, ...payload } = form as any;
        await axios.patch(`/agentia/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess("Agent IA modifié !");
      } else {
        await axios.post("/agentia", form, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess("Agent IA ajouté !");
      }
      setForm(initialForm);
      setEditId(null);
      fetchAgents();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleEdit = (agent: AgentIA) => {
    setForm({ ...agent, skills: agent.skills || [] });
    setEditId(agent.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cet agent IA ?")) return;
    try {
      await axios.delete(`/agentia/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAgents();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Gérer mes agents IA</h1>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 border rounded bg-muted">
        <div>
          <label className="block mb-1 font-medium">Métier</label>
          <Input name="job" value={form.job || ""} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tarif (€)</label>
          <Input name="tarif" type="number" value={form.tarif || 0} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Compétences (séparées par des virgules)</label>
          <Input name="skills" value={form.skills?.join(", ") || ""} onChange={handleSkillsChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <Textarea name="description" value={form.description || ""} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">URL de l'agent IA</label>
          <Input name="url" value={form.url || ""} onChange={handleChange} required />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.isVisible ?? true} onCheckedChange={v => setForm(f => ({ ...f, isVisible: v }))} />
          <span>Visible</span>
        </div>
        <Button type="submit">{editId ? "Modifier" : "Ajouter"}</Button>
        {editId && <Button type="button" variant="outline" onClick={() => { setForm(initialForm); setEditId(null); }}>Annuler</Button>}
      </form>
      <h2 className="text-xl font-semibold mb-4">Mes agents IA</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="space-y-4">
          {agents.length === 0 && <div>Aucun agent IA.</div>}
          {agents.map(agent => (
            <div key={agent.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-background">
              <div>
                <div className="font-bold">{agent.job}</div>
                <div className="text-xs text-muted-foreground">Tarif : {agent.tarif} €</div>
                <div className="text-xs text-muted-foreground">Compétences : {agent.skills.join(", ")}</div>
                {agent.description && <div className="text-xs mt-1">{agent.description}</div>}
                <a href={agent.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Accéder à l'agent IA</a>
                <div className="text-xs mt-1">{agent.isVisible ? <span className="text-green-600">Visible</span> : <span className="text-gray-400">Non visible</span>}</div>
                <div className="text-xs mt-1">
                  Prestataire : {agent.user ? `${agent.user.firstName || agent.user.firstname || ''} ${agent.user.lastName || agent.user.lastname || ''}`.trim() || "N/A" : "N/A"}
                </div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button size="sm" variant="outline" onClick={() => handleEdit(agent)}>Modifier</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(agent.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 