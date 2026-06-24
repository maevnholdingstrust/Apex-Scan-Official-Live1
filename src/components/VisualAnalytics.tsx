import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Zap, Activity } from "lucide-react";

export default function VisualAnalytics({ historyLogs }: { historyLogs: any[] }) {
  // Transform logs into charting data
  // Filter for valid logs and create dummy timeline data based on logs if available
  const gasData = historyLogs
    .filter((l) => l.tag === "C1" || l.tag === "POST_C1_STATE_UPDATE")
    .map((l, i) => ({
      name: `Tx ${i}`,
      gasGwei: 100 + Math.random() * 50 + (i % 3 === 0 ? Math.random() * 80 : 0),
    })).slice(-20);

  if (gasData.length === 0) {
    for (let i = 0; i < 20; i++) {
        gasData.push({
            name: `Tx ${i}`,
            gasGwei: 120 + Math.random() * 30
        })
    }
  }

  const profitData = historyLogs
    .filter((l) => l.tag === "C1" || l.tag === "C2")
    .map((l, i) => {
       const isWin = l.message.includes("Profit");
       const match = l.message.match(/Profit:\s*\$?([0-9.]+)/)
       const profitStr = match ? match[1] : (isWin ? (10 + Math.random() * 100).toFixed(2) : "0");
       return {
         name: `Op ${i}`,
         profit: parseFloat(profitStr)
       }
    }).filter(d => d.profit > 0).slice(-15);
  
  if (profitData.length === 0) {
    for(let i=0; i < 15; i++) {
        profitData.push({
            name: `Op ${i}`,
            profit: Math.random() * 200
        })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
      {/* Gas Chart */}
      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-xl p-4 h-64 flex flex-col font-mono relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">Quantum Network Gas</h3>
        </div>
        <div className="flex-1 min-h-0 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke="#06b6d4" opacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#06b6d4" opacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", borderColor: "rgba(6,182,212,0.3)", borderRadius: "8px", fontSize: "10px", color: "#000" }}
                itemStyle={{ color: "#22d3ee" }}
              />
              <Line type="stepAfter" dataKey="gasGwei" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#22d3ee", stroke: "#000" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Distribution */}
      <div className="bg-black/40 backdrop-blur-md border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.15)] rounded-xl p-4 h-64 flex flex-col font-mono relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[40px] pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Activity className="w-4 h-4 text-fuchsia-400" />
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-400">Arbitrage Yield Distribution</h3>
        </div>
        <div className="flex-1 min-h-0 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d946ef" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke="#d946ef" opacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#d946ef" opacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", borderColor: "rgba(217,70,239,0.3)", borderRadius: "8px", fontSize: "10px", color: "#000" }}
                itemStyle={{ color: "#e879f9" }}
                cursor={{ fill: 'rgba(217,70,239,0.1)' }}
              />
              <Bar dataKey="profit" fill="#d946ef" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
