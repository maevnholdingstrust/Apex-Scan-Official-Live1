import React, { useState, useEffect } from "react";
import { Shield, Zap, RefreshCw, Pause, Play, Eye, Flame, Activity } from "lucide-react";

interface HeaderProps {
  pnl: number;
  gas: number;
  block: number;
  dryRun: boolean;
  isPaused: boolean;
  onScan: () => void;
  onPauseToggle: () => void;
  onDryRunToggle: () => void;
  onArmLive: () => void;
  onTestLanes?: () => void;
  lanesHealth?: "idle" | "testing" | "healthy" | "error";
  connectionStatus: "live" | "poll" | "connecting" | "error";
  onDiagnosticOpen?: () => void;
}

export default function Header({
  pnl,
  gas,
  block,
  dryRun,
  isPaused,
  onScan,
  onPauseToggle,
  onDryRunToggle,
  onArmLive,
  onTestLanes,
  lanesHealth = "idle",
  connectionStatus,
  onDiagnosticOpen,
}: HeaderProps) {
  const [utcTime, setUtcTime] = useState("");
  const [isArmConfirming, setIsArmConfirming] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date().toUTCString().replace("GMT", "UTC"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleArmClick = () => {
    if (!isArmConfirming) {
      setIsArmConfirming(true);
      setTimeout(() => setIsArmConfirming(false), 4000);
    } else {
      setIsArmConfirming(false);
      onArmLive();
    }
  };

  const getConnBadge = () => {
    switch (connectionStatus) {
      case "live":
        return (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-sm text-emerald-400 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>LIVE · SYNCED</span>
          </div>
        );
      case "poll":
        return (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-sm text-amber-500 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            <span>API POLL</span>
          </div>
        );
      case "connecting":
        return (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-sm text-blue-400 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span>CONNECTING</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-sm text-rose-500 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
            <span>OFFLINE</span>
          </div>
        );
    }
  };

  return (
    <header className="h-14 bg-[#09090b] border-b border-[#27272a] flex items-center px-6 justify-between gap-6 font-mono text-xs shrink-0 relative z-30 select-none shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-[#18181b] rounded-md border border-[#27272a] flex items-center justify-center font-bold text-white shadow-sm">
          Ω
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-[0.15em] text-white/90 leading-none">
            APEX OMEGA 2.0
          </h1>
        </div>
      </div>

      <div className="h-5 w-px bg-[#27272a]" />

      {/* Backend Status Flag */}
      {getConnBadge()}

      <div className="h-4 w-px bg-cyan-900/50 hidden md:block" />

      {/* Real-time Telemetry Headers */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-gray-500 uppercase text-[9px] tracking-widest font-medium">
            NET P&L
          </span>
          <span
            className={`font-semibold font-mono transition-all text-xs ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            $
            {pnl.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-gray-500 uppercase text-[9px] tracking-widest font-medium">
            POLYGON GAS
          </span>
          <span className="text-amber-400 font-semibold font-mono text-xs">
            {gas.toFixed(1)} gwei
          </span>
        </div>

        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-gray-500 uppercase text-[9px] tracking-widest font-medium">
            BLOCK_HEIGHT
          </span>
          <span className="text-neutral-200 font-semibold font-mono text-xs">
            {block ? block.toLocaleString() : "—"}
          </span>
        </div>

        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-gray-500 uppercase text-[9px] tracking-widest font-medium">
            DRY RUN
          </span>
          <span
            className={`font-semibold text-xs ${dryRun ? "text-amber-400" : "text-emerald-400"}`}
          >
            {dryRun ? "YES (SHADOW)" : "NO (LIVE)"}
          </span>
        </div>
      </div>

      {/* Master Commands and Time */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={onTestLanes}
          disabled={lanesHealth === "testing"}
          className={`px-3 py-1.5 border rounded-md font-semibold text-[10px] uppercase transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer ${
            lanesHealth === "testing" 
              ? "bg-blue-500/10 border-blue-500/20 text-blue-400 cursor-wait"
              : lanesHealth === "healthy"
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400"
                : lanesHealth === "error"
                  ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-400 hover:text-white"
          }`}
          title="Run lightweight RPC heartbeat check for C1/C2 targets"
        >
          <Activity size={12} className={lanesHealth === "testing" ? "animate-spin" : ""} />
          <span>
            {lanesHealth === "testing" ? "TESTING LANES..." 
             : lanesHealth === "healthy" ? "LANES OK" 
             : lanesHealth === "error" ? "LANES ERR" 
             : "TEST LANES"}
          </span>
        </button>

        <button
          onClick={onDiagnosticOpen}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-md font-semibold text-[10px] uppercase transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer"
          title="Run Diagnostics"
        >
          <Zap size={12} />
          <span>DIAGNOSTICS</span>
        </button>

        <button
          onClick={onScan}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-md font-semibold text-[10px] uppercase transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer"
          title="Trigger on-demand DEX spread scanning"
        >
          <RefreshCw size={12} className="animate-spin-slow" />
          <span>SCAN</span>
        </button>

        {isPaused ? (
          <button
            onClick={onPauseToggle}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-md font-semibold text-[10px] uppercase transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={12} />
            <span>RESUME</span>
          </button>
        ) : (
          <button
            onClick={onPauseToggle}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-md font-semibold text-[10px] uppercase transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer"
          >
            <Pause size={12} />
            <span>PAUSE</span>
          </button>
        )}

        <button
          onClick={onDryRunToggle}
          className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-md font-semibold text-[10px] uppercase transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer"
        >
          <Eye size={12} />
          <span>FORCE DRY</span>
        </button>

        <button
          onClick={handleArmClick}
          className={`px-3 py-1.5 border rounded-md font-semibold text-[10px] uppercase transition-colors tracking-widest flex items-center gap-1.5 cursor-pointer ${
            isArmConfirming
              ? "bg-rose-500 border-rose-500 text-white animate-pulse"
              : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400"
          }`}
        >
          <Flame size={12} />
          <span>{isArmConfirming ? "CONFIRM ARM" : "ARM LIVE"}</span>
        </button>

        <span className="text-neutral-500 font-medium ml-4 text-right hidden lg:inline-block w-20 text-xs font-mono">
          {utcTime ? utcTime.split(" ")[4] : "00:00:00"}
        </span>
      </div>
    </header>
  );
}
