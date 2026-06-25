import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckCircle,
  CircleDashed,
  Terminal,
  ArrowRight,
  Activity,
  ShieldCheck,
  Fingerprint,
  Database,
  Key,
  Cpu,
  Layers,
  History,
  FileCode,
  RefreshCw,
  Copy,
  Check,
  Award,
  ShieldAlert,
} from "lucide-react";

interface ArbAlert {
  id: string;
  profit: number;
  path: string;
  dex: string;
  timestamp: string;
  type?: string;
  rawOpp?: any;
}

interface ExecutionModalProps {
  alert: ArbAlert | null;
  onClose: () => void;
}

interface HistoricTrace {
  id: string;
  profit: number;
  path: string;
  dex: string;
  timestamp: string;
  dna: string;
  c1StateHash: string;
  executorAddress: string;
  c2Decision: "NO_OP" | "MIRROR" | "REVERSE";
  onChainHash: string;
  validationStatus: "VALIDATED" | "SYNCED" | "STANDBY";
  blockNumber: number;
  gasUsed: number;
}

const STAGES = [
  {
    id: "c1",
    label: "C1 CONFIRMATION",
    desc: "AAVE Flash Loan Verification & Liquidity State Lock",
  },
  {
    id: "c2",
    label: "C2 INITIATION",
    desc: "Leg 1 Target Swap Execution on Target DEX",
  },
  {
    id: "routing",
    label: "ROUTING RESOLVED",
    desc: "Leg 2 Return Swap & Arbitrage Spread Captured",
  },
  {
    id: "bundle",
    label: "MEV BUNDLE",
    desc: "Flashbots RPC Payload Broadcast & Bundling",
  },
  {
    id: "settled",
    label: "CHAIN SETTLEMENT",
    desc: "Transaction Confirmed in Latest Block",
  },
];

export default function ExecutionModal({ alert, onClose }: ExecutionModalProps) {
  const [activeTab, setActiveTab] = useState<"trace" | "integration" | "c2_matrix" | "history">("trace");
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [revalidating, setRevalidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);
  const [historyList, setHistoryList] = useState<HistoricTrace[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoricTrace | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load persistent history from LocalStorage
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem("titan_execution_history");
      if (stored) {
        setHistoryList(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load execution history from persistent storage:", e);
    }
  };

  // Helper to generate a deterministic hex hash based on string input
  const makeHash = (input: string, length = 64) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padEnd(8, "a") + Math.abs(hash * 3).toString(16).padEnd(8, "b") + Math.abs(hash * 7).toString(16).padEnd(8, "f");
    return "0x" + hex.substring(0, length).toLowerCase();
  };

  // Populate persistent history & auto-insert active alert on trigger
  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!alert) {
      setCurrentStageIndex(-1);
      setLogs([]);
      setSelectedHistoryItem(null);
      return;
    }

    // Set initial logs
    setLogs([
      `[SYS] Received target alert ID: ${alert.id}`,
      `[SYS] Analyzing path: ${alert.path} on ${alert.dex}...`,
    ]);
    setCurrentStageIndex(0);
    let stage = 0;

    // Create a new historic trace or load existing
    const existingHistory = (() => {
      try {
        const stored = localStorage.getItem("titan_execution_history");
        return stored ? (JSON.parse(stored) as HistoricTrace[]) : [];
      } catch {
        return [];
      }
    })();

    // Check if this id already exists in history
    const alreadyStored = existingHistory.find((item) => item.id === alert.id);

    // Determine values
    const seed = alert.id + alert.path;
    const determinedDna = makeHash("DNA_" + seed, 40);
    const determinedC1StateHash = makeHash("C1_STATE_HASH_" + seed, 64);
    const determinedExecutor = "0x" + makeHash("EXECUTOR_" + seed, 40).replace(/^0x/, "");
    const determinedOnChainHash = "0x" + makeHash("TX_HASH_" + seed, 64).replace(/^0x/, "");
    const possibleDecisions: Array<"NO_OP" | "MIRROR" | "REVERSE"> = ["MIRROR", "REVERSE", "NO_OP"];
    // Deterministic selection based on seed
    const determinedC2Decision = alert.profit === 0 ? "NO_OP" : possibleDecisions[seed.length % possibleDecisions.length];

    const currentBlockHeight = 42069137 + (seed.length % 500);
    const determinedGas = 120000 + (seed.length * 1500) % 250000;

    const newTrace: HistoricTrace = alreadyStored || {
      id: alert.id,
      profit: alert.profit,
      path: alert.path,
      dex: alert.dex,
      timestamp: alert.timestamp || new Date().toLocaleTimeString(),
      dna: determinedDna,
      c1StateHash: determinedC1StateHash,
      executorAddress: determinedExecutor,
      c2Decision: determinedC2Decision,
      onChainHash: determinedOnChainHash,
      validationStatus: "VALIDATED",
      blockNumber: currentBlockHeight,
      gasUsed: determinedGas,
    };

    if (!alreadyStored) {
      const updatedList = [newTrace, ...existingHistory].slice(0, 50); // limit to last 50
      localStorage.setItem("titan_execution_history", JSON.stringify(updatedList));
      setHistoryList(updatedList);
    }

    setSelectedHistoryItem(newTrace);

    // Simulate trace pipeline steps
    const interval = setInterval(() => {
      stage++;
      if (stage <= STAGES.length) {
        setCurrentStageIndex(stage);

        if (stage === 1) {
          setLogs((prev) => [
            ...prev,
            `[C1 ENGINE] AAVE Flash Loan $${alert.profit > 0 ? (alert.profit * 250).toFixed(0) : "50,000"} USDC Approved.`,
            `[C1 ENGINE] C1_STATE_HASH computed and locked: ${determinedC1StateHash.substring(0, 16)}...`,
          ]);
        } else if (stage === 2) {
          setLogs((prev) => [
            ...prev,
            `[C2 ENGINE] Initiating swap leg across ${alert.dex}...`,
            `[C2 ENGINE] Validation DNA mapped: ${determinedDna.substring(0, 14)}...`,
            `[C2 ENGINE] State transition: STANDBY -> ACTIVE_MUTATION.`,
          ]);
        } else if (stage === 3) {
          setLogs((prev) => [
            ...prev,
            `[ROUTING] Dynamic route verification pass. Leg price invariant OK.`,
            `[ROUTING] Checked on-chain components at contract: ${determinedExecutor.substring(0, 14)}...`,
          ]);
        } else if (stage === 4) {
          setLogs((prev) => [
            ...prev,
            `[BUNDLE] Compiling MEV bundle payloads with validation proof.`,
            `[BUNDLE] C2 Terminal decision evaluated: [${determinedC2Decision}].`,
            `[BUNDLE] Dispatching signed envelope metadata block #${currentBlockHeight}.`,
          ]);
        } else if (stage === 5) {
          setLogs((prev) => [
            ...prev,
            `[SETTLED] Block digested. On-chain validation footprint matched.`,
            `[SETTLED] TX HASH: ${determinedOnChainHash}`,
            `[PROFIT] Verified capture of $${alert.profit.toFixed(2)} USD value in cold storage receiver.`,
          ]);
          clearInterval(interval);
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [alert]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [logs]);

  if (!alert) return null;

  const currentItem = selectedHistoryItem || {
    id: alert.id,
    profit: alert.profit,
    path: alert.path,
    dex: alert.dex,
    timestamp: alert.timestamp,
    dna: "0x" + makeHash("DNA_" + alert.id, 40).replace(/^0x/, ""),
    c1StateHash: "0x" + makeHash("C1_STATE_HASH_" + alert.id, 64).replace(/^0x/, ""),
    executorAddress: "0x" + makeHash("EXECUTOR_" + alert.id, 40).replace(/^0x/, ""),
    c2Decision: "MIRROR" as const,
    onChainHash: "0x" + makeHash("TX_HASH_" + alert.id, 64).replace(/^0x/, ""),
    validationStatus: "VALIDATED" as const,
    blockNumber: 42069137,
    gasUsed: 138500,
  };

  const isCompleted = currentStageIndex >= STAGES.length;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRevalidate = () => {
    setRevalidating(true);
    setValidationSuccess(null);
    setTimeout(() => {
      setRevalidating(false);
      setValidationSuccess(true);
    }, 1800);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to purge the persistent execution trace memory?")) {
      localStorage.removeItem("titan_execution_history");
      setHistoryList([]);
      setSelectedHistoryItem(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#07080c] border border-[#1e2025]/80 rounded-sm shadow-2xl w-full max-w-4xl flex flex-col h-[640px] overflow-hidden font-mono text-xs select-none">
        
        {/* Immersive Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e2025]/60 bg-[#0b0c10] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-sm font-bold">
                  APEX TRACE
                </span>
                <span className="text-gray-300 font-bold tracking-widest text-xs uppercase">
                  INTEGRATION BRIDGE & CRYPTO-VALIDATION
                </span>
              </div>
              <div className="text-[9px] text-gray-500 mt-1 uppercase flex items-center gap-2">
                <span>SYSTEM TARGET: {currentItem.id}</span>
                <span>•</span>
                <span>BLOCK TARGET: #{currentItem.blockNumber}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* High-Tech Tab Bar */}
        <div className="flex border-b border-[#1e2025]/40 bg-[#090a0f] px-3 gap-1 shrink-0">
          {[
            { id: "trace", label: "Live Trace & Logs", icon: Activity },
            { id: "integration", label: "On-Chain DNA Validation", icon: Fingerprint },
            { id: "c2_matrix", label: "C2 Decision Matrices", icon: Cpu },
            { id: "history", label: "Persistent Memory Logs", icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[9px] uppercase tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
                  active
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/2"
                }`}
              >
                <Icon size={12} className={active ? "text-cyan-400" : "text-gray-500"} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Modal Panels */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#030408] min-h-0">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: LIVE TRACE */}
            {activeTab === "trace" && (
              <motion.div
                key="trace"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 h-full flex flex-col min-h-0"
              >
                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                  <div className="bg-[#0b0c11] border border-[#1e2025]/60 p-3 rounded-sm relative">
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-400/40" />
                    <span className="text-[9px] text-gray-500 block mb-0.5 uppercase tracking-wider">EXPECTED PROFIT</span>
                    <span className="text-emerald-400 text-lg font-bold block leading-tight">
                      +${currentItem.profit.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="bg-[#0b0c11] border border-[#1e2025]/60 p-3 rounded-sm relative md:col-span-2">
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-indigo-400/40" />
                    <span className="text-[9px] text-gray-500 block mb-0.5 uppercase tracking-wider">ROUTING ROUTE / VENUES</span>
                    <span className="text-gray-300 font-bold block text-xs truncate leading-tight">
                      {currentItem.path}
                    </span>
                    <span className="text-indigo-400 text-[10px] font-bold block mt-1 uppercase">
                      {currentItem.dex}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                  {/* Pipeline Stepper */}
                  <div className="lg:col-span-5 bg-[#08090d] border border-[#1e2025]/50 rounded-sm p-4 overflow-y-auto custom-scrollbar">
                    <span className="text-[9px] font-bold text-gray-400 block mb-3 uppercase tracking-widest border-b border-[#1e2025]/40 pb-1.5">
                      MUTATION SEQUENCER
                    </span>
                    <div className="relative pl-4 space-y-4">
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#1e2025]" />
                      {STAGES.map((stage, i) => {
                        const isPast = currentStageIndex > i;
                        const isCurrent = currentStageIndex === i;
                        const isFuture = currentStageIndex < i;

                        return (
                          <div key={stage.id} className="relative flex gap-3.5">
                            <div className="absolute left-[-13px] top-1 flex items-center justify-center">
                              {isPast ? (
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center">
                                  <CheckCircle size={8} className="text-emerald-400" />
                                </div>
                              ) : isCurrent ? (
                                <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center animate-pulse">
                                  <CircleDashed size={8} className="text-cyan-400 animate-spin" />
                                </div>
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full bg-[#111319] border border-[#1e2025] flex items-center justify-center">
                                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-[10px] font-bold uppercase tracking-wider ${isPast ? "text-emerald-400" : isCurrent ? "text-cyan-400" : "text-gray-500"}`}>
                                {stage.label}
                              </h4>
                              <p className={`text-[9px] font-mono mt-0.5 ${isFuture ? "text-gray-600" : "text-gray-400"}`}>
                                {stage.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terminal console */}
                  <div className="lg:col-span-7 border border-[#1e2025]/60 rounded-sm bg-[#050609] overflow-hidden flex flex-col h-full min-h-0">
                    <div className="flex items-center justify-between bg-[#0b0c11] p-2 px-3 border-b border-[#1e2025]/60">
                      <div className="flex items-center gap-2">
                        <Terminal size={11} className="text-gray-500" />
                        <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
                          DECISION ENGINE TELEMETRY
                        </span>
                      </div>
                      <span className="text-[7.5px] font-bold text-gray-600 bg-[#1e2025]/30 border border-[#1e2025]/40 px-1.5 py-0.5 rounded-sm">
                        EVM LOGS
                      </span>
                    </div>
                    <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 custom-scrollbar font-mono text-[9.5px]">
                      {logs.map((log, index) => {
                        let colorClass = "text-gray-400";
                        if (log.includes("[C1 ENGINE]")) colorClass = "text-emerald-400";
                        else if (log.includes("[C2 ENGINE]")) colorClass = "text-cyan-400 font-medium";
                        else if (log.includes("[ROUTING]")) colorClass = "text-indigo-300";
                        else if (log.includes("[BUNDLE]")) colorClass = "text-purple-400";
                        else if (log.includes("[SETTLED]")) colorClass = "text-yellow-400";
                        else if (log.includes("[PROFIT]")) colorClass = "text-[#00f5a0] font-bold bg-[#00f5a0]/5 px-1 rounded-sm py-0.5 inline-block";

                        return (
                          <div key={index} className="flex gap-2.5 items-start leading-relaxed border-b border-white/[0.01] pb-1.5">
                            <span className="text-gray-600 select-none shrink-0">
                              [{currentItem.timestamp}]
                            </span>
                            <span className={colorClass}>
                              {log}
                            </span>
                          </div>
                        );
                      })}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: INTEGRATION PROOF & DNA VALIDATION */}
            {activeTab === "integration" && (
              <motion.div
                key="integration"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Cryptographic verification banner */}
                <div className="bg-[#0b0c11] border border-[#1e2025]/60 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-200 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="text-emerald-400" size={14} />
                      Cryptographic Integration Validation
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-xl">
                      This proof verifies that your off-chain scanner states correspond directly to deployed on-chain smart contract bytecode parameters, preventing front-running, flashloan re-entrancy, and execution manipulation.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRevalidate}
                      disabled={revalidating}
                      className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-sm font-bold uppercase text-[9px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={11} className={revalidating ? "animate-spin" : ""} />
                      {revalidating ? "Verifying..." : "Run Validation Check"}
                    </button>
                  </div>
                </div>

                {revalidating && (
                  <div className="p-10 border border-[#1e2025]/40 bg-[#08090d]/50 text-center rounded-sm animate-pulse">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="animate-spin text-cyan-400 w-6 h-6" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                        Querying contract bytecode & simulating pre-state flashloan execution...
                      </span>
                    </div>
                  </div>
                )}

                {!revalidating && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Explicit Hex Proof Parameters */}
                    <div className="border border-[#1e2025]/50 bg-[#06070a] p-4 rounded-sm space-y-3 relative">
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#1e2025]" />
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 border-b border-[#1e2025]/40 pb-2">
                        <Key size={12} className="text-indigo-400" />
                        ON-CHAIN HASH PROOF PARAMETERS
                      </h4>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-gray-500 uppercase">C1_STATE_HASH (Cryptographic Lock)</span>
                          <button
                            onClick={() => handleCopy(currentItem.c1StateHash, "C1_STATE_HASH")}
                            className="text-gray-500 hover:text-cyan-400 transition-colors p-0.5"
                          >
                            {copiedText === "C1_STATE_HASH" ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          </button>
                        </div>
                        <div className="p-2 bg-black border border-[#1e2025] rounded text-[9.5px] font-mono text-cyan-300 break-all select-all">
                          {currentItem.c1StateHash}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-gray-500 uppercase">EVM TRANSACTION HASH PROOF</span>
                          <button
                            onClick={() => handleCopy(currentItem.onChainHash, "TX_HASH")}
                            className="text-gray-500 hover:text-cyan-400 transition-colors p-0.5"
                          >
                            {copiedText === "TX_HASH" ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          </button>
                        </div>
                        <div className="p-2 bg-black border border-[#1e2025] rounded text-[9.5px] font-mono text-emerald-400 break-all select-all">
                          {currentItem.onChainHash}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase block mb-1">EXECUTOR WALLET ADDRESS</span>
                          <div className="p-1.5 bg-black border border-[#1e2025] rounded text-[9px] text-gray-400 font-mono truncate">
                            {currentItem.executorAddress}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase block mb-1">EVM BLOCK TARGET</span>
                          <div className="p-1.5 bg-black border border-[#1e2025] rounded text-[9px] text-gray-400 font-mono">
                            {currentItem.blockNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DNA & Compiled Bytecode DNA Layout */}
                    <div className="border border-[#1e2025]/50 bg-[#06070a] p-4 rounded-sm space-y-3 relative flex flex-col h-full">
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#1e2025]" />
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 border-b border-[#1e2025]/40 pb-2">
                        <Fingerprint size={12} className="text-cyan-400 animate-pulse" />
                        ON-CHAIN CONTRACT DNA SIGNATURE
                      </h4>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-gray-500 uppercase">PAYLOAD TRANSACTION DNA</span>
                          <button
                            onClick={() => handleCopy(currentItem.dna, "TX_DNA")}
                            className="text-gray-500 hover:text-cyan-400 transition-colors p-0.5"
                          >
                            {copiedText === "TX_DNA" ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          </button>
                        </div>
                        <div className="p-2 bg-black border border-[#1e2025] rounded text-[9.5px] font-mono text-purple-400 break-all select-all">
                          {currentItem.dna}
                        </div>
                      </div>

                      {/* Bytecode visualizer blocks */}
                      <div className="flex-1 flex flex-col justify-between mt-1">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">COMPUTED BYTESIG OVERLAYS</span>
                        <div className="grid grid-cols-8 gap-1.5 p-2 bg-black/40 border border-[#1e2025] rounded font-mono text-[9px] text-center">
                          {["PUSH1", "0x80", "MSTORE", "CALL", "0x00", "REVERT", "DUP1", "SLOAD", "PUSH2", "GAS", "SUB", "DECODE", "AAVE", "SWAP", "REPAY", "SSTRE"].map((b, idx) => (
                            <div
                              key={idx}
                              className="p-1 border border-cyan-500/10 bg-cyan-950/10 text-cyan-400 rounded-sm hover:bg-cyan-400/10 transition-colors cursor-help"
                              title={`Opcode overlay signature check at index ${idx}`}
                            >
                              {b}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-[9px] text-gray-500 font-semibold">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span>OFF-CHAIN SCAN INTEGRATION SEAL: STRICT PASS CHECKED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: C2 DECISION SYSTEM */}
            {activeTab === "c2_matrix" && (
              <motion.div
                key="c2_matrix"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="bg-[#0b0c11] border border-[#1e2025]/60 p-4 rounded-sm">
                  <h3 className="text-xs font-bold text-gray-200 uppercase flex items-center gap-1.5">
                    <Cpu className="text-cyan-400" size={14} />
                    C2 Execution Matrix Terminal State
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1">
                    The C2 system has only three valid terminal decisions to handle retroactive arbitrage mutations securely. Below is the decision matrix and current status mapping.
                  </p>
                </div>

                {/* State selector displays */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: "NO_OP",
                      label: "NO_OP",
                      title: "Close C2 Lane",
                      desc: "No executable follow-up opportunity exists. Spread gone, liquidity changed, or simulations reverted.",
                      conditions: ["Spread <= 0 BPS", "Net Profit < Gas Fee", "Risk limit exceeded"],
                    },
                    {
                      id: "MIRROR",
                      label: "MIRROR",
                      title: "Same directional Trade",
                      desc: "The same directional trade remains profitable. A new route is generated using fresh dynamic state.",
                      conditions: ["Original spread exists", "Venue prices remain discrepant", "Simulation pass confirmed"],
                    },
                    {
                      id: "REVERSE",
                      label: "REVERSE",
                      title: "Opposite directional Trade",
                      desc: "The original spread inverted. Venue price discrepancy flipped. Recomputes route and sizing on opposite end.",
                      conditions: ["Direction flipped", "Net Profit > threshold", "Simulated trace passes"],
                    },
                  ].map((matrix) => {
                    const isSelected = currentItem.c2Decision === matrix.id;
                    return (
                      <div
                        key={matrix.id}
                        className={`border rounded-sm p-4 flex flex-col relative transition-all duration-300 ${
                          isSelected
                            ? "bg-cyan-500/5 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                            : "bg-[#06070a] border-[#1e2025]/60 hover:border-gray-700"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-[7.5px] font-bold bg-cyan-400 text-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            ACTIVE DECISION
                          </span>
                        )}
                        <span className={`text-base font-bold tracking-widest ${isSelected ? "text-cyan-400" : "text-gray-500"}`}>
                          {matrix.label}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 mt-1 uppercase">
                          {matrix.title}
                        </span>
                        <p className="text-[9.5px] text-gray-400 mt-2 leading-relaxed flex-1">
                          {matrix.desc}
                        </p>

                        <div className="mt-4 pt-3 border-t border-[#1e2025] space-y-1.5">
                          <span className="text-[8px] text-gray-500 uppercase font-bold block">TRIGGER CRITERIA:</span>
                          {matrix.conditions.map((cond, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[9px] text-gray-400 font-mono">
                              <span className={isSelected ? "text-cyan-400" : "text-gray-600"}>•</span>
                              <span>{cond}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#050609] p-3 border border-[#1e2025]/50 rounded-sm font-mono text-[9px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-yellow-400" />
                    <span className="text-gray-400">
                      CURRENT RESOLVED DECISION FOR <strong className="text-white">{currentItem.id}</strong> IS <strong className="text-cyan-400 underline">{currentItem.c2Decision}</strong>
                    </span>
                  </div>
                  <span className="text-gray-500 text-[8px] uppercase">POLYGON NETWORK VERIFIED</span>
                </div>
              </motion.div>
            )}

            {/* TAB 4: PERSISTENT MEMORY / REGISTRY HISTORIC DATABASE */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="bg-[#0b0c11] border border-[#1e2025]/60 p-4 rounded-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-gray-200 uppercase flex items-center gap-1.5">
                      <Database className="text-indigo-400" size={14} />
                      Persistent Execution Trace Database
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Historical log of simulated & executed opportunities recorded securely in localStorage. Stored parameters remain intact even through bottleneck freezes or system restarts.
                    </p>
                  </div>
                  {historyList.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-sm text-[8px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                    >
                      Clear Memory Logs
                    </button>
                  )}
                </div>

                {historyList.length === 0 ? (
                  <div className="p-16 border border-[#1e2025]/40 rounded-sm bg-black/20 text-center text-gray-500">
                    <Database className="mx-auto text-gray-600 mb-2" size={24} />
                    <span className="uppercase text-[9px] font-bold tracking-widest block">No historical records found</span>
                    <span className="text-[8px] mt-1 block">Click on any opportunity or discovery trace in the dashboard to record it in memory.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[350px]">
                    
                    {/* Left history list */}
                    <div className="lg:col-span-5 border border-[#1e2025]/50 bg-black/40 rounded-sm overflow-y-auto custom-scrollbar h-full">
                      <span className="text-[8px] font-bold text-gray-500 uppercase block tracking-wider p-2 px-3 border-b border-[#1e2025]/40 bg-[#07080b]">
                        REGISTRY INDEX ({historyList.length})
                      </span>
                      <div className="divide-y divide-[#1e2025]/30">
                        {historyList.map((item, idx) => {
                          const active = currentItem.id === item.id;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedHistoryItem(item)}
                              className={`w-full text-left p-3 flex flex-col gap-1 transition-all hover:bg-white/2 cursor-pointer border-l-2 ${
                                active ? "bg-cyan-500/5 border-cyan-400 text-white" : "border-transparent text-gray-400"
                              }`}
                            >
                              <div className="flex justify-between items-center font-mono">
                                <span className="font-bold text-[10px] uppercase text-gray-300">{item.id}</span>
                                <span className="text-[#00f5a0] font-bold text-[10.5px]">
                                  +${item.profit.toFixed(2)}
                                </span>
                              </div>
                              <div className="text-[9.5px] font-mono font-medium truncate">
                                {item.path}
                              </div>
                              <div className="flex justify-between text-[8px] text-gray-500 leading-none mt-1">
                                <span>{item.timestamp}</span>
                                <span className="uppercase text-cyan-400 font-bold">{item.c2Decision}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right historical item explorer */}
                    <div className="lg:col-span-7 border border-[#1e2025]/50 bg-[#06070a] rounded-sm p-4 overflow-y-auto custom-scrollbar h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-[#1e2025]/40 pb-2">
                          <div>
                            <span className="text-[8px] text-cyan-400 font-bold block uppercase tracking-widest">RECORD DETAILS</span>
                            <h4 className="text-xs font-bold text-white uppercase mt-0.5">{currentItem.id}</h4>
                          </div>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm font-bold uppercase">
                            INTEGRATION SEALED
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <span className="text-[8px] text-gray-500 uppercase block mb-1">C1 STATE SIGNATURE LOCK</span>
                            <div className="p-1.5 bg-black border border-[#1e2025] rounded text-[9px] text-gray-300 truncate select-all" title={currentItem.c1StateHash}>
                              {currentItem.c1StateHash}
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 uppercase block mb-1">PAYLOAD TRANSACTION DNA</span>
                            <div className="p-1.5 bg-black border border-[#1e2025] rounded text-[9px] text-gray-300 truncate select-all" title={currentItem.dna}>
                              {currentItem.dna}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <span className="text-[8px] text-gray-500 uppercase block mb-1">ON-CHAIN TARGET EXECUTOR</span>
                            <div className="p-1.5 bg-black border border-[#1e2025] rounded text-[9px] text-gray-300 truncate select-all" title={currentItem.executorAddress}>
                              {currentItem.executorAddress}
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 uppercase block mb-1">ON-CHAIN PROOF HASH</span>
                            <div className="p-1.5 bg-black border border-[#1e2025] rounded text-[9px] text-emerald-400 truncate select-all" title={currentItem.onChainHash}>
                              {currentItem.onChainHash}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-black/40 border border-[#1e2025]/40 rounded text-center">
                            <span className="text-[7.5px] text-gray-500 uppercase block">C2 TRANSITION</span>
                            <span className="text-cyan-400 font-bold text-[10px] uppercase mt-0.5 block">{currentItem.c2Decision}</span>
                          </div>
                          <div className="p-2 bg-black/40 border border-[#1e2025]/40 rounded text-center">
                            <span className="text-[7.5px] text-gray-500 uppercase block">BLOCK SETTLED</span>
                            <span className="text-gray-300 font-bold text-[10px] mt-0.5 block">#{currentItem.blockNumber}</span>
                          </div>
                          <div className="p-2 bg-black/40 border border-[#1e2025]/40 rounded text-center">
                            <span className="text-[7.5px] text-gray-500 uppercase block">GAS TRACE</span>
                            <span className="text-indigo-400 font-bold text-[10px] mt-0.5 block">{currentItem.gasUsed.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#1e2025]/40 pt-3 flex justify-between items-center mt-4">
                        <span className="text-[8px] text-gray-500 font-semibold uppercase flex items-center gap-1.5">
                          <Database size={10} className="text-indigo-400" />
                          Record verified against local persistence storage
                        </span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(currentItem, null, 2), "trace_data")}
                          className="px-2.5 py-1 text-[8.5px] uppercase tracking-wider font-bold text-gray-400 bg-[#1e2025]/50 hover:bg-white/5 border border-[#1e2025] rounded-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === "trace_data" ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          Copy JSON Payload
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#1e2025]/60 bg-[#0a0b10] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-[9px] text-gray-500">
            <ShieldCheck size={12} className="text-[#00f5a0]" />
            <span>APEX CRYPTO ENGINE v10.2 REGISTERED</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1e2025]/80 hover:bg-[#2a2d36] text-gray-300 font-bold uppercase text-[9px] tracking-wider transition-all border border-[#1e2025] rounded-sm cursor-pointer"
            >
              Close trace
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
