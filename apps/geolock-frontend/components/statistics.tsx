"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  BarChart,
  Bar,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export type ValidStatisticsName = "login-history" | "maps";

type getStatisticsProps = {
  name: ValidStatisticsName;
};

type LoginStats = { date: string; count: number }[];
type SpeedStats = {
  imei: string;
  min: number;
  avg: number;
  max: number;
}[];

export default function GetStatistics({ name }: getStatisticsProps) {
  const [data, setData] = useState<LoginStats | SpeedStats | null>(null);
  useEffect(() => {
    if (!name) return;

    let apiUrl = "";

    if (name === "login-history") {
      apiUrl = "auth/login-history";
    } else {
      apiUrl = name;
    }

    api.get(`/${apiUrl}`)
      .then((response) => {
        let result = response.data;

        if (name === "login-history") {
          const grouped: Record<string, number> = {};
          result.forEach((entry: { date: string }) => {
            const day = new Date(entry.date).toISOString().slice(0, 10);
            grouped[day] = (grouped[day] || 0) + 1;
          });

          result = Object.entries(grouped)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        }

        if (name === "maps") {
          const grouped: Record<string, number[]> = {};
          result.forEach((entry: { imei: string; speed: number }) => {
            if (!grouped[entry.imei]) grouped[entry.imei] = [];
            grouped[entry.imei].push(entry.speed);
          });

          result = Object.entries(grouped).map(([imei, speeds]) => ({
            imei,
            min: Math.min(...speeds),
            avg: parseFloat((speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1)),
            max: Math.max(...speeds),
          }));
        }

        setData(result);
      })
      .catch(console.error);
  }, [name]);

  if (!data) return <div className="p-4">Chargement des données...</div>;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number | string, string>) => {
    if (active && payload && payload.length) {
      // Essayons de formater le label s'il ressemble à une date ISO
      let formattedLabel = label;
      if (typeof label === "string" && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
        const [year, month, day] = label.split("-");
        formattedLabel = `${day}/${month}/${year}`;
      }
  
      return (
        <div className="bg-white border rounded p-2 shadow text-sm">
          <p className="font-medium">{formattedLabel}</p>
          <p className="text-gray-600">
            nb : {payload?.[0]?.value !== undefined ? String(payload[0].value) : "N/A"}
          </p>
        </div>
      );
    }
  
    return null;
  };
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques</CardTitle>
        <CardDescription>Données visualisées par type</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        {name === "login-history" && Array.isArray(data) && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data as LoginStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("fr-FR");
                }}
              />
              <Tooltip 
                content={<CustomTooltip />}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1ce828"
                strokeWidth={2} 
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {name === "maps" && Array.isArray(data) && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as SpeedStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="imei" />
              <YAxis unit=" km/h" />
              <Tooltip />
              <Bar dataKey="min" fill="#4ade80" name="Min" />
              <Bar dataKey="avg" fill="#22c55e" name="Moyenne" />
              <Bar dataKey="max" fill="#16a34a" name="Max" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
