"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Item = { name: string; value: number };

export function DashboardCharts({
  assetMix,
}: {
  assetMix: Item[];
}) {
  return (
    <div className="ta-card p-4">
      <h3 className="mb-2 text-xl font-semibold leading-none text-[#0f172a]">Asset Allocation</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={assetMix}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip formatter={(v) => Number(v || 0).toLocaleString("en-IN")} />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
