import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, ArrowRight, Activity, Zap, ShieldAlert, Cpu } from "lucide-react";

interface Opportunity {
  pair: string;
  route?: string;
  spread_bps: number;
  profit_usd: number;
  dex_a?: string;
  dex_b?: string;
  confidence?: number;
}

interface HyperImmersiveOpportunitiesProps {
  opportunities: Opportunity[];
}

export default function HyperImmersiveOpportunities({ opportunities }: HyperImmersiveOpportunitiesProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  // Background grid animation logic could be added here
  
  return (
    <div className="relative w-full h-full min-h-[300px] bg-black/50 backdrop-blur-md overflow-hidden rounded-xl border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)] p-6 font-mono relative overflow-hidden">
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-sky-500/10 blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-fuchsia-500/10 blur-[70px] pointer-events-none"></div>
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-black/60 rounded-lg border border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              <Zap className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-widest text-sky-100 uppercase">
                Active Quantum Opportunities
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_5px_#38bdf8]" />
                <span className="text-[10px] text-sky-400/70 tracking-widest uppercase">Nexus Engine live</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-400 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">
              {opportunities.length.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] text-sky-500/50 uppercase tracking-widest font-bold">
              Found
            </span>
          </div>
        </div>

        {/* Opportunity Grid */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            <AnimatePresence>
              {opportunities.map((opp, idx) => (
                <motion.div
                  key={`${opp.pair}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onMouseEnter={() => setActiveId(idx)}
                  onMouseLeave={() => setActiveId(null)}
                  className={`
                    group cursor-pointer overflow-hidden rounded-xl border transition-all duration-300
                    ${activeId === idx 
                      ? 'bg-black/80 border-sky-500/60 shadow-[0_0_15px_rgba(14,165,233,0.3)] scale-[1.02] z-20' 
                      : 'bg-black/40 border-[#27272a] hover:border-sky-500/20 z-10'}
                  `}
                >
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <div className="text-sm font-semibold text-neutral-200 mb-1.5">{opp.pair}</div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{opp.dex_a || "UNISWAP"}</span>
                          <ArrowRight className="w-3 h-3 text-neutral-500" />
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{opp.dex_b || "QUICKSWAP"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-semibold text-emerald-400 tracking-tight">
                          +${opp.profit_usd.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-400/60 mt-1 uppercase font-mono">{opp.spread_bps} BPS</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                        <span>Confidence</span>
                        <span className="text-neutral-300 font-mono">{opp.confidence || 98}%</span>
                      </div>
                      <div className="h-1 w-full bg-[#27272a] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${opp.confidence || 98}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Action Panel on Hover */}
                    <AnimatePresence>
                      {activeId === idx && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 mt-4 border-t border-[#27272a] flex items-center justify-between"
                        >
                           <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                             <Activity className="w-3.5 h-3.5" />
                             <span>SYNCED & ARMED</span>
                           </div>
                           <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded hover:text-white text-[10px] font-semibold transition-colors uppercase border border-white/5">
                             Execute Vector
                           </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {opportunities.length === 0 && (
              <div className="col-span-full h-40 flex flex-col items-center justify-center border border-dashed border-[#27272a] rounded-xl text-neutral-500 bg-white/[0.02]">
                <ShieldAlert className="w-8 h-8 mb-3 opacity-50" />
                <span className="text-sm font-medium">Scanning Grid...</span>
                <span className="text-xs mt-1 text-neutral-600">Awaiting live arbitrage vectors</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
