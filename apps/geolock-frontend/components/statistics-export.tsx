"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import * as XLSX from "xlsx";
import api from "@/lib/axios";

type ExportTab = {
  name: string;
  value: string;
};

export default function StatisticsExport({ tabs }: { tabs: ExportTab[] }) {
  const [selected, setSelected] = useState<string[]>(tabs.map((t) => t.value));
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleExport = async () => {
    setLoading(true);

    const workbook = XLSX.utils.book_new();

    for (const tab of tabs) {
      if (!selected.includes(tab.value)) continue;

      try {
        const url = tab.value === "login-history" ? "/auth/login-history" : `/${tab.value}`;
        const response = await api.get(url);
        const rawData = response.data;

        let rows = rawData;

        if (tab.value === "login-history") {
          type LoginHistoryEntry = {
            date: string;
            user_id: string;
          };

          rows = rawData.map((entry: LoginHistoryEntry) => ({
            Date: new Date(entry.date).toLocaleString("fr-FR"),
            User_ID: entry.user_id,
          }));
        }

        type MapEntry = {
          imei: string;
          speed: number;
          latitude: number;
          longitude: number;
          timestamp: string;
        };

        if (tab.value !== "login-history") {
          rows = rawData.map((entry: MapEntry) => ({
            IMEI: entry.imei,
            Vitesse: entry.speed,
            Latitude: entry.latitude,
            Longitude: entry.longitude,
            Date: new Date(entry.timestamp).toLocaleString("fr-FR"),
          }));
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, tab.name);
      } catch (err) {
        console.error(`Erreur export ${tab.value}`, err);
      }
    }

    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, "0");
    
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    
    const formatted = `${day}_${month}_${year}-${hours}_${minutes}`;
    const filename = `statistiques-${formatted}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
    setLoading(false);
  };

  if (tabs.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="excel">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </DialogTrigger>
      <DialogContent aria-description="Sélectionnez les statistiques à exporter">
        <DialogHeader>
          <DialogTitle>Exporter les statistiques</DialogTitle>
        </DialogHeader>
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleExport(); }}>
          <div className="space-y-4">
            {tabs.map((tab) => (
              <div key={tab.value} className="flex items-center gap-2">
                <Checkbox
                  id={tab.value}
                  checked={selected.includes(tab.value)}
                  onCheckedChange={() => handleChange(tab.value)}
                />
                <label htmlFor={tab.value} className="text-sm cursor-pointer">
                  {tab.name}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter className="flex flex-col gap-2 md:flex-row md:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="destructive">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="mt-4" variant='excel'>
              {loading ? "Génération en cours..." : "Exporter la sélection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
