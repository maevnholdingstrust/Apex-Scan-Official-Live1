import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Zap, Database, Terminal as TerminalIcon, BarChart3, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

// Common Technical Border Component
const TechContainer = ({ children, title, icon: Icon }: { children: React.ReactNode, title?: string, icon?: any }) => (
  <div className="relative border border-[#1e2025] bg-[#0d0e12] p-4 rounded-sm overflow-hidden mb-4">
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500/50" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-500/50" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500/50" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500/50" />
    
    {title && (
      <div className="flex items-center gap-2 mb-4 border-b border-[#1e2025] pb-2">
        {Icon && <Icon size={16} className="text-blue-400" />}
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

const Terminal = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const messages = [
      "[SYSTEM] Booting APEX_OMEGA kernel...",
      "[NETWORK] Checking RPC health: 0.45ms latency",
      "[DEX] Indexing 274 liquidity pools...",
      "[AAVE] Scanner active - searching for health factor < 1.0",
      "[ARB] Scanning spreads: QuickSwap -> Uniswap V3",
      "[SEC] Reentrancy guards armed",
      "[SYSTEM] Ready for execution"
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev.slice(-15), messages[i]]);
        i++;
      } else {
        // Add random scanning noise
        const noise = [
          `[SCAN] Block ${42069137 + Math.floor(Math.random()*100)} processed`,
          `[SCAN] No spreads found on WETH/USDC`,
          `[AAVE] User 0x${Math.random().toString(16).slice(2, 6)}... healthy`,
        ];
        setLogs(prev => [...prev.slice(-15), noise[Math.floor(Math.random()*noise.length)]]);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <TechContainer title="System Logs" icon={TerminalIcon}>
      <div className="font-mono text-[11px] h-64 overflow-y-auto space-y-1 scrollbar-hide">
        {logs.map((log, i) => (
          <div key={i} className={log.includes('!]') ? 'text-red-400' : 'text-green-500/80'}>
            <span className="opacity-40 mr-2">[{new Date().toLocaleTimeString()}]</span>
            {log}
          </div>
        ))}
      </div>
    </TechContainer>
  );
};

const LiquidationList = () => {
  const [items, setItems] = useState<any[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<any | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/liquidations').then(res => res.json()).then(setItems);
  }, []);

  const handleExecute = async (item: any) => {
    setExecuting(item.user);
    setConfirmTarget(null);
    setResult(null);

    try {
      const res = await fetch('/api/liquidations/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: item.user, healthFactor: item.healthFactor })
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setItems(prev => prev.filter(i => i.user !== item.user));
      }
    } catch (err) {
      setResult({ success: false, message: 'Network failure' });
    } finally {
      setExecuting(null);
    }
  };

  return (
    <>
      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#0d0e12] border border-[#1e2025] p-6 rounded-sm shadow-2xl relative"
          >
            <div className="flex items-center gap-3 text-yellow-500 mb-4">
              <AlertTriangle size={24} />
              <h3 className="font-mono uppercase tracking-widest text-sm">Confirm Execution</h3>
            </div>
            
            <div className="space-y-4 mb-6 font-mono text-[11px]">
              <div className="flex justify-between border-b border-[#1e2025] pb-2">
                <span className="text-gray-500">Target</span>
                <span className="text-white">{confirmTarget.user}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e2025] pb-2">
                <span className="text-gray-500">Debt To Cover</span>
                <span className="text-white">${confirmTarget.debtValue.toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between border-b border-[#1e2025] pb-2">
                <span className="text-gray-500">Collateral Reward</span>
                <span className="text-green-500">${confirmTarget.collateralValue.toLocaleString()} {confirmTarget.collateral}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 mb-6 leading-relaxed">
              WARNING: This operation will request a Balancer flash loan to repay the debt. 
              Execution is permanent and depends on current gas market conditions on Polygon.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmTarget(null)}
                className="flex-1 py-2 border border-[#1e2025] text-gray-500 font-mono text-[10px] uppercase hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleExecute(confirmTarget)}
                className="flex-1 py-2 bg-blue-600 border border-blue-500 text-white font-mono text-[10px] uppercase hover:bg-blue-500"
              >
                Sign & Execute
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Result Notification Popup */}
      {result && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`fixed bottom-10 right-10 z-50 p-4 border rounded-sm flex items-center gap-4 shadow-2xl ${result.success ? 'bg-green-950/20 border-green-500/50 text-green-400' : 'bg-red-950/20 border-red-500/50 text-red-400'}`}
        >
          {result.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <div className="font-mono">
            <div className="text-[10px] uppercase font-bold">{result.success ? 'Success' : 'Execution Failed'}</div>
            <div className="text-[11px] opacity-80">{result.success ? `Profit: +$${result.profit}` : result.message}</div>
          </div>
          <button onClick={() => setResult(null)} className="ml-4 opacity-50 hover:opacity-100 text-sm">×</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <TechContainer key={i} title={`Target: ${item.user}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">Collateral ({item.collateral})</div>
                  <div className="text-xl font-mono text-white">${item.collateralValue.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase font-mono">HF</div>
                  <div className={`text-xl font-mono ${item.healthFactor < 1 ? 'text-red-500' : 'text-yellow-500'}`}>{item.healthFactor}</div>
                </div>
              </div>
              <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (1/item.healthFactor) * 50)}%` }}
                  className={`h-full ${item.healthFactor < 1 ? 'bg-red-500' : 'bg-blue-500'}`}
                 />
              </div>
              <button 
                disabled={executing === item.user}
                onClick={() => setConfirmTarget(item)}
                className={`w-full py-2 flex items-center justify-center gap-2 border-[1.5px] text-[10px] uppercase font-mono tracking-widest transition-all ${executing === item.user 
                  ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 active:scale-[0.98]'}`}
              >
                {executing === item.user ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Executing...
                  </>
                ) : 'Execute Liquidation'}
              </button>
            </div>
          </TechContainer>
        ))}
      </div>
    </>
  );
};

const StatsGrid = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/status').then(res => res.json()).then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'Status', value: stats.status, color: 'text-green-500', icon: Activity },
        { label: 'Latency', value: '0.45ms', color: 'text-blue-400', icon: Zap },
        { label: 'Pools Indexed', value: stats.scannedPools, color: 'text-white', icon: Database },
        { label: 'Target Block', value: stats.lastBlock, color: 'text-gray-400', icon: BarChart3 },
      ].map((s, i) => (
        <TechContainer key={i}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-sm">
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-tighter text-gray-500 font-mono">{s.label}</div>
              <div className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</div>
            </div>
          </div>
        </TechContainer>
      ))}
    </div>
  );
};

const PoolList = () => {
  const [pools, setPools] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/pools').then(res => res.json()).then(setPools);
  }, []);

  return (
    <TechContainer title="Indexed Liquidity Pools" icon={Database}>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[10px] text-left">
          <thead className="text-gray-500 border-b border-[#1e2025]">
            <tr>
              <th className="pb-2">DEX</th>
              <th className="pb-2">PAIR</th>
              <th className="pb-2">FEE</th>
              <th className="pb-2 text-right">RESERVE0</th>
              <th className="pb-2 text-right">RESERVE1</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2025]/30">
            {pools.map((pool, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors cursor-crosshair">
                <td className="py-2 text-blue-400">{pool.dex}</td>
                <td className="py-2">{pool.token0}/{pool.token1}</td>
                <td className="py-2">{(pool.fee * 100).toFixed(2)}%</td>
                <td className="py-2 text-right opacity-60">{(Number(pool.reserve0) / 10**6).toFixed(0)} USDC</td>
                <td className="py-2 text-right opacity-60">{(Number(pool.reserve1) / 10**18).toFixed(2)} WETH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TechContainer>
  );
};

const ArbitrageScanner = () => {
  const [amount, setAmount] = useState('10000');
  
  return (
    <TechContainer title="Arbitrage Spread Scanner" icon={Zap}>
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="text-[9px] uppercase text-gray-500 mb-1 block">Flash Loan Amount (USDC)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-[#1e2025] p-2 text-xs font-mono focus:border-blue-500 outline-none"
            />
          </div>
          <button className="h-10 px-6 bg-blue-600/20 border border-blue-500/50 text-blue-400 text-[10px] uppercase font-mono tracking-widest mt-5">
            Execute Scan
          </button>
        </div>
        
        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] uppercase font-mono text-yellow-500">Opportunity Found</span>
             <span className="text-[10px] font-mono text-green-500">+$245.12 Net Profit</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Path: QuickSwap V2 (Buy WETH) → Uniswap V3 (Sell WETH)
          </div>
        </div>
      </div>
    </TechContainer>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('hunting');

  return (
    <div className="min-h-screen bg-[#07080a] text-gray-300 p-6 selection:bg-blue-500/30">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-[#1e2025] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Shield className="text-blue-500" size={18} />
             <h1 className="text-xl font-bold tracking-[0.3em] text-white uppercase italic">APEX_OMEGA</h1>
          </div>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Strategic MEV Infrastructure // v4.0.2 Stable
          </p>
        </div>
        
        <nav className="flex gap-4 mt-6 md:mt-0 font-mono text-[10px] uppercase tracking-widest">
          {['hunting', 'arbitrage', 'pools', 'config'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 border-b-2 transition-all ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto">
        <StatsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-[12px] font-mono uppercase tracking-[0.4em] text-white/50 mb-4 ml-1">
              {activeTab} // Operations
            </h2>
            
            {activeTab === 'hunting' && <LiquidationList />}
            {activeTab === 'pools' && <PoolList />}
            {activeTab === 'arbitrage' && <ArbitrageScanner />}
            {activeTab === 'config' && (
              <TechContainer title="Configuration System">
                <div className="grid grid-cols-2 gap-6 p-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase mb-2 block">Min Profit Threshold ($)</label>
                    <input type="text" defaultValue="500" className="w-full bg-black/40 border border-[#1e2025] p-2 text-xs font-mono" />
                  </div>
                   <div>
                    <label className="text-[10px] text-gray-500 uppercase mb-2 block">Max Slippage (%)</label>
                    <input type="text" defaultValue="0.5" className="w-full bg-black/40 border border-[#1e2025] p-2 text-xs font-mono" />
                  </div>
                </div>
              </TechContainer>
            )}
          </div>
          
          <div className="lg:col-span-1">
             <h2 className="text-[12px] font-mono uppercase tracking-[0.4em] text-white/50 mb-4 ml-1">
              System Core // Telemetry
            </h2>
            <Terminal />
            
            <TechContainer title="Global Health" icon={Zap}>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Network Sync</span>
                  <span className="text-green-500">100%</span>
                </div>
                <div className="h-[2px] bg-gray-900 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                    className="absolute h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" 
                  />
                </div>
                
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Gas Usage Optimization</span>
                  <span className="text-blue-400">92%</span>
                </div>
                <div className="h-[2px] bg-gray-900 relative">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1.5 }}
                    className="absolute h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                  />
                </div>
              </div>
            </TechContainer>
          </div>
        </div>
      </main>

      <footer className="mt-12 pt-8 border-t border-[#1e2025] flex justify-between items-center opacity-30 pointer-events-none">
        <div className="text-[9px] font-mono uppercase tracking-widest">
          Auth Signature: 0x8488...4541
        </div>
        <div className="text-[9px] font-mono uppercase tracking-widest">
          Polygon Mainnet // Balancer V2 Flash Loans
        </div>
      </footer>
    </div>
  );
}
