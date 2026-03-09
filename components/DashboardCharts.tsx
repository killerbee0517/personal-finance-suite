"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Item = { name: string; value: number };

const pieColors = ["#3b6cf6", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DashboardCharts({
  assetMix,
  bankExposure,
  maturityTimeline,
}: {
  assetMix: Item[];
  bankExposure: Item[];
  maturityTimeline: Item[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="ta-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Asset Allocation</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={assetMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92}>
                {assetMix.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ta-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Bank-wise FD Exposure</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bankExposure}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b6cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ta-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Upcoming Maturity Timeline</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maturityTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

