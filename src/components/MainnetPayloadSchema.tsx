import React from "react";
import { ArrowRight, ChevronRight, Zap, Target } from "lucide-react";

export default function MainnetPayloadSchema() {
  const codeBlock = `{
  "envelope": {
    "targetContract": "0xApexOmegaExecutor...",
    "chainId": 137,
    "value": "0",
    "gasLimit": "1500000",
    "maxFeePerGas": "150000000000"
  },
  "payloadSchema": {
    "actionType": "FLASH_LOAN_ARBITRAGE",
    "flashloanProvider": "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Aave V3 Pool
    "flashloanAsset": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",     // USDC
    "flashloanAmount": "1000000000",                                    // 1,000 USDC
    "routes": [
      {
        "dex": "UniswapV3",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "path": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174...WETH",
        "amountIn": "1000000000",
        "minAmountOut": "284690000000000000"
      },
      {
        "dex": "Quickswap",
        "router": "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "path": "WETH...0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "amountIn": "284690000000000000",
        "minAmountOut": "1010000000" 
      }
    ],
    "repaymentInfo": {
      "repayAsset": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "repayAmount": "1000500000" // Original + 0.05% Flashloan fee
    },
    "expectedSurplus": "9500000" // 9.50 USDC
  },
  "callData": "0xdeadbeef..." // ABI encoded data of the payload
}`;

  return (
    <div className="border border-[#1e2025] bg-[#0d0e12] rounded-md p-4 font-mono text-[10px] text-gray-300 max-h-64 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1e2025]">
        <h3 className="text-cyan-400 font-bold uppercase flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          C1 OFF-CHAIN TO ON-CHAIN PIPELINE
        </h3>
        <span className="text-[9px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-red-500/20">
          Mainnet Prepared
        </span>
      </div>

      {/* Off-chain to On-chain Flow */}
      <div className="mb-6 p-4 bg-[#0a0b0e] border border-[#1e2025] rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap className="w-32 h-32 text-cyan-500" />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-slate-800 text-[10px] font-mono">
          <div className="px-3 py-1.5 bg-cyan-900/30 border border-cyan-700/50 rounded-sm text-cyan-300">
            **OFF-CHAIN BOT DISCOVERY
          </div>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <div className="px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/50 rounded-sm text-emerald-300">
            C1 FLASHLOAN CALL
          </div>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <div className="px-3 py-1.5 bg-orange-900/30 border border-orange-700/50 rounded-sm text-orange-300">
            ON-CHAIN EXECUTOR
          </div>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <div className="px-3 py-1.5 bg-purple-900/30 border border-purple-700/50 rounded-sm text-purple-300">
            C1 EXECUTES ARBE SWAPS
          </div>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <div className="px-3 py-1.5 bg-red-900/30 border border-red-700/50 rounded-sm text-red-300">
            REPAYS LOAN + FEES EXACT
          </div>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <div className="px-3 py-1.5 bg-green-900/30 border border-green-700/50 rounded-sm text-green-300">
            SURPLUS RETAINED
          </div>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <div className="px-3 py-1.5 bg-cyan-900/30 border border-cyan-700/50 rounded-sm text-cyan-300">
            **OFF-CHAIN TELEMETRY UPDATE
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-gray-400 uppercase tracking-wider mb-2">
          [ Payload Schema, Envelope, Call Data Submitted On Chain ]
        </h4>
        <pre className="bg-black/50 p-4 rounded-sm overflow-auto border border-[#1e2025] max-h-32 scrollbar-thin">
          <code className="text-[10px] leading-relaxed text-indigo-300">
            {codeBlock}
          </code>
        </pre>
      </div>

      <div className="mt-4 pt-4 border-t border-[#1e2025] flex justify-between text-gray-500">
        <p>
          Awaiting valid signed transaction payload strictly fulfilling schema
          mandates.
        </p>
        <p>Mocks Cleared. C1 Integrity Ready.</p>
      </div>
    </div>
  );
}
