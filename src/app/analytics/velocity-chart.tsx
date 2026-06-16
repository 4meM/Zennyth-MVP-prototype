"use client";

import { Card } from "@/components/ui/card";
import {
  ComposedChart,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface VelocityData {
  periodo: string;
  planificado: number;
  completado: number;
}

const DEFAULT_MOCK_DATA: VelocityData[] = [
  { periodo: "Lun", planificado: 5, completado: 3 },
  { periodo: "Mar", planificado: 4, completado: 4 }, // ¡Día Perfecto!
  { periodo: "Mié", planificado: 3, completado: 1 },
  { periodo: "Jue", planificado: 6, completado: 6 }, // ¡Día Perfecto!
  { periodo: "Vie", planificado: 4, completado: 3 },
  { periodo: "Sáb", planificado: 2, completado: 2 }, // ¡Día Perfecto!
  { periodo: "Dom", planificado: 2, completado: 0 },
];

interface VelocityChartProps {
  data?: VelocityData[];
}

export function VelocityChart({ data = DEFAULT_MOCK_DATA }: VelocityChartProps) {
  const avgVelocity = Math.round(
    data.reduce((acc, curr) => acc + curr.completado, 0) / data.length
  );

  return (
    <Card className="p-5 w-full mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-bold text-text-1">Rendimiento Semanal</h2>
          <p className="text-xs text-text-3">Tareas planificadas vs tareas completadas</p>
        </div>
        <div className="bg-warning text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
          Promedio: {avgVelocity}/día
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-bg-subtle)" // Variable de tema
            />
            <XAxis
              dataKey="periodo"
              tick={{ fontSize: 12, fill: "var(--color-text-2)" }} // Variable de tema
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-text-2)" }} // Variable de tema
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-surface)", // Variable de tema
                border: "1px solid var(--color-border)", // Variable de tema
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--color-text-1)", // Variable de tema
              }}
            />
            
            {/* LEYENDA CORREGIDA PARA SOPORTAR TEMAS */}
            <Legend 
              wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
              formatter={(value) => <span style={{ color: "var(--color-text-2)" }}>{value}</span>} 
            />

            {/* BARRA: Planificado (Agregamos fill base para arreglar el cuadrado negro) */}
            <Bar
              dataKey="planificado"
              name="Planificado"
              fill="#7bd3ea" 
              radius={[4, 4, 0, 0]}
              barSize={35}
            >
              {data.map((entry, index) => {
                const isPerfect = entry.planificado === entry.completado && entry.planificado > 0;
                return <Cell key={`cell-plan-${index}`} fill={isPerfect ? "#fde047" : "#7bd3ea"} />;
              })}
            </Bar>

            {/* BARRA: Completado (Agregamos fill base para arreglar el cuadrado negro) */}
            <Bar
              dataKey="completado"
              name="Completado"
              fill="#068fff"
              radius={[4, 4, 0, 0]}
              barSize={35}
            >
              {data.map((entry, index) => {
                const isPerfect = entry.planificado === entry.completado && entry.planificado > 0;
                return <Cell key={`cell-comp-${index}`} fill={isPerfect ? "#eab308" : "#068fff"} />;
              })}
            </Bar>

            <Line
              type="monotone"
              dataKey="completado"
              name="Tendencia (Velocidad)"
              stroke="#ff6b6b"
              strokeWidth={3}
              dot={{ r: 5, fill: "#ff6b6b", strokeWidth: 2, stroke: "var(--color-surface)" }} // Borde del punto dinámico
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}