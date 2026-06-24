<div align="center">

# ⚡ APEX OMEGA

### Production-Ready MEV Infrastructure for Polygon Mainnet

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Polygon](https://img.shields.io/badge/Chain-Polygon%20%28137%29-8247E5?logo=polygon&logoColor=white)](https://polygon.technology/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue)](LICENSE)

**APEX OMEGA** is a full-stack, AI-augmented MEV (Maximal Extractable Value) infrastructure platform. It combines a real-time React dashboard with a Node.js/Express backend to execute DEX arbitrage, monitor Aave V3 liquidation opportunities, and manage private MEV relay submissions — all on Polygon mainnet.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Docker Deployment](#docker-deployment)
- [Dashboard Modules](#dashboard-modules)
- [Execution Lanes & MEV Relays](#execution-lanes--mev-relays)
- [Environment Variables Reference](#environment-variables-reference)
- [Scripts](#scripts)
- [Security Notes](#security-notes)
- [Contributing](#contributing)

---

## Overview

APEX OMEGA is designed for operators running live on-chain arbitrage and liquidation strategies on Polygon. It surfaces every critical signal — pool TVL, spread detection, gas pricing, liquidation health factors, MEV relay status — in a single unified dashboard, and connects directly to smart contract executors for one-click or fully automated trade submission.

The system supports two primary executor contracts (`C1` and `C2`), each targeting different execution lanes (HFT vs. Merkle-based), and a dedicated liquidation executor for Aave V3 flash-loan liquidations.

---

## Key Features

| Feature | Description |
|---|---|
| **Dual Arbitrage Engines** | C1 (HFT) and C2 (Merkle) executor contract support with independent lane configurations |
| **Aave V3 Liquidation Monitor** | Real-time scanning of undercollateralized positions with flash-loan liquidation execution |
| **Private MEV Relays** | Titan Builder (US/EU/Global/AP), FastLane, and Polygon private mempool integrations |
| **AI Agent (Gemini)** | Google Gemini-powered agent tab for trade analysis and strategy recommendations |
| **Flash Loan Arbitrage** | Adaptive flash ladder scanning across Balancer V3, Curve, QuickSwap V3, and Uniswap V3 |
| **Real-time Oracle Feeds** | Live price feeds for major Polygon assets |
| **Fork Simulation** | Pre-submission Anvil fork simulation for profit and gas validation |
| **EIP-1559 Gas Management** | Dynamic fee construction with configurable gas caps and priority fee multipliers |
| **Multi-RPC Redundancy** | Automatic failover across Alchemy, Infura, GetBlock, Chainstack, DRPC, and public RPCs |
| **Telegram Notifications** | Bot integration for execution alerts and remote command support |
| **3D Visualization** | Three.js-powered arbitrage cycle and quantum core visualizations |
| **Benchmark Scorecard** | Performance metrics and P&L tracking across execution sessions |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend (Vite)               │
│   Dashboard · Profit Monitor · Config · AI Agent    │
│   Oracle Feeds · Liquidation Monitor · Lanes Grid   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────┐
│             Express + TypeScript Backend             │
│   server.ts  ·  ExecutionManager  ·  Engine Types   │
└──────┬─────────────────┬────────────────────────────┘
       │                 │
┌──────▼──────┐   ┌──────▼────────────────────────────┐
│  Polygon    │   │         MEV Relay Layer             │
│  Mainnet    │   │  Titan Builder · FastLane · DRPC   │
│  (Chain 137)│   │  Infura WSS · GetBlock · Chainstack │
└─────────────┘   └────────────────────────────────────┘
       │
┌──────▼─────────────────────────────────────────────┐
│              Smart Contracts (Polygon)              │
│  C1 Executor · C2 Executor · Liquidation Executor  │
│  Aave V3 Pool · Balancer V3 Vault · QuickSwap V3   │
└────────────────────────────────────────────────────┘
```

---

## Tech Stack

**Frontend**
- [React 19](https://react.dev/) with TypeScript
- [Vite 6](https://vitejs.dev/) — build tooling
- [Tailwind CSS 4](https://tailwindcss.com/) — styling
- [Motion (Framer Motion)](https://motion.dev/) — animations
- [Recharts](https://recharts.org/) — charting
- [React Three Fiber](https://r3f.docs.pmnd.rs/) + [Three.js](https://threejs.org/) — 3D visualizations
- [Lucide React](https://lucide.dev/) — icons
- [React Markdown](https://github.com/remarkjs/react-markdown) — AI agent output rendering

**Backend**
- [Node.js 20](https://nodejs.org/) + [Express 4](https://expressjs.com/)
- [TypeScript 5.8](https://www.typescriptlang.org/)
- [ethers.js 6](https://docs.ethers.org/v6/) — Ethereum/Polygon interaction
- [ws](https://github.com/websockets/ws) — WebSocket server
- [dotenv](https://github.com/motdotla/dotenv) — environment variable management

**AI**
- [Google Gemini (`@google/genai`)](https://ai.google.dev/) — AI agent integration

---

## Prerequisites

- **Node.js** v20 or higher
- **npm** v9 or higher
- A **Gemini API key** (from [Google AI Studio](https://aistudio.google.com/))
- A funded **Polygon wallet** private key (for live execution)
- RPC access to Polygon mainnet (Alchemy, Infura, GetBlock, or public endpoints)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/maevnholdingstrust/Apex-Scan-Official-Live1.git
cd Apex-Scan-Official-Live1

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env
```

---

## Configuration

Edit `.env` with your actual values. The most critical fields are:

```dotenv
# AI
GEMINI_API_KEY=your_gemini_api_key

# Wallet (NEVER commit real private keys)
PRIVATE_KEY=your_wallet_private_key
EXECUTOR_WALLET=0xYourWalletAddress
BOT_PROFIT_RECEIVER=0xYourProfitAddress

# RPC Endpoints
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
ALCHEMY_HTTP_1=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
INFURA_HTTP=https://polygon-mainnet.infura.io/v3/YOUR_KEY

# Executor Contracts
C1_ARB_EXECUTOR_ADDRESS=0xYourC1ContractAddress
C2_ARB_EXECUTOR_ADDRESS=0xYourC2ContractAddress
LIQUIDATION_EXECUTOR_ADDRESS=0xYourLiquidationContractAddress
```

Additional configuration is available via `config.json` in the project root, which mirrors many of the `.env` values for runtime overrides.

> **Shadow Mode**: Set `SHADOW_MODE=true` and `LIVE_EXECUTION=false` in `.env` to run in a fully simulated mode with no on-chain transactions.

---

## Running the App

### Development

```bash
npm run dev
```

This starts the full-stack application (Express backend + Vite frontend HMR) via `tsx server.ts`. The dashboard is available at `http://localhost:5173` by default.

### Production Build

```bash
# Build frontend and bundle backend
npm run build

# Start the production server
npm start
```

The production server runs from `dist/server.cjs` and serves the compiled frontend on port `3000`.

### Type Checking (Lint)

```bash
npm run lint
```

---

## Docker Deployment

### Build & Run with Docker Compose

```bash
# Copy and configure environment file
cp .env.example .env
# Edit .env with your values

# Build and start the container
docker-compose up --build -d
```

The app will be available at `http://localhost:3000`.

### Manual Docker Build

```bash
docker build -t apex-omega .
docker run -d \
  --name apex-omega-bot \
  --env-file .env \
  -p 3000:3000 \
  apex-omega
```

### Logs

```bash
docker-compose logs -f apex-omega
```

Logs are persisted to the `app_logs` Docker volume and written to `logs/` inside the container.

---

## Dashboard Modules

| Module | Description |
|---|---|
| **Control Panel** | Master on/off controls for execution, shadow mode, and live trading |
| **Profit Dashboard** | Real-time P&L, cumulative profit tracking, and per-trade breakdown |
| **Oracle Feeds** | Live price feeds for WMATIC, WETH, WBTC, USDC, and other Polygon assets |
| **Liquidation Monitor** | Aave V3 position health scanning with one-click flash-loan liquidation |
| **Arbitrage Cycle Visualization** | Animated DEX arbitrage path rendering (Uniswap V3, QuickSwap, Balancer) |
| **Lanes Grid** | Status of all 32 MEV execution lanes |
| **System Intel** | RPC health, block lag monitoring, mempool stats |
| **Simulation Console** | Pre-execution fork simulation output viewer |
| **Diagnostic Console** | Live log stream with tag filtering (C1, C2, AAVE, DEX, SYS, ERR) |
| **Benchmark Scorecard** | Session performance metrics and gas efficiency scores |
| **Visual Analytics** | Recharts-based profit and execution charts |
| **Quantum Core** | Three.js 3D system visualization |
| **Config Tab** | Runtime configuration editor |
| **Wallet Tab** | Wallet balance, nonce status, and gas reserve monitoring |
| **AI Agent Tab** | Google Gemini-powered strategy assistant |
| **Mainnet Payload Schema** | Live transaction payload inspector |
| **C2 Trigger Logic** | C2 executor trigger condition viewer and manual override |
| **Economic Sentiment Widget** | Market sentiment feed integration |
| **Notification Sidebar** | In-app alerts for execution events, errors, and opportunities |

---

## Execution Lanes & MEV Relays

APEX OMEGA submits transactions via a priority-ordered lane system to maximize inclusion probability while minimizing front-running risk.

**Private Relay Priority (default)**

```
TITAN_BUILDER_US → TITAN_BUILDER_GLOBAL → TITAN_BUILDER_EU → FASTLANE_HTTP → POLYGON_PRIVATE_MEMPOOL
```

**Relay Endpoints**

| Relay | URL |
|---|---|
| Titan Builder US | `https://us.rpc.titanbuilder.xyz` |
| Titan Builder Global | `https://rpc.titanbuilder.xyz` |
| Titan Builder EU | `https://eu.rpc.titanbuilder.xyz` |
| FastLane HTTP | `https://polygon-rpc.fastlane.xyz` |
| FastLane Relay | `https://fastlane-relay.polygon.technology` |

If all private relays fail and `ALLOW_PUBLIC_FALLBACK_ON_PRIVATE_FAIL=true`, the transaction falls back to the public mempool.

---

## Environment Variables Reference

Below are the most important variables. See `.env.example` for the full list.

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for the AI agent | ✅ |
| `PRIVATE_KEY` | Executor wallet private key | ✅ (live mode) |
| `EXECUTOR_WALLET` | Executor wallet address | ✅ |
| `BOT_PROFIT_RECEIVER` | Address to receive extracted profits | ✅ |
| `POLYGON_RPC_URL` | Primary Polygon HTTP RPC endpoint | ✅ |
| `C1_ARB_EXECUTOR_ADDRESS` | C1 arbitrage executor contract address | ✅ |
| `C2_ARB_EXECUTOR_ADDRESS` | C2 arbitrage executor contract address | ✅ |
| `LIQUIDATION_EXECUTOR_ADDRESS` | Aave V3 liquidation executor address | ✅ |
| `LIVE_EXECUTION` | Enable real on-chain transaction submission | — |
| `SHADOW_MODE` | Run in simulation-only mode | — |
| `DRY_RUN` | Log payloads without broadcasting | — |
| `MIN_NET_PROFIT_USD` | Minimum net profit threshold per trade | — |
| `MAX_DAILY_GAS_BUDGET_USD` | Daily gas spending cap | — |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for notifications | — |
| `TELEGRAM_CHAT_ID` | Telegram chat ID for alerts | — |
| `CHAIN_ID` | Target chain ID (default: `137` for Polygon) | — |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start full-stack app in development mode (hot reload) |
| `npm run build` | Build frontend (Vite) and bundle backend (esbuild) |
| `npm start` | Start production server from `dist/server.cjs` |
| `npm run preview` | Preview the Vite production build locally |
| `npm run clean` | Remove the `dist/` directory |
| `npm run lint` | Run TypeScript type checking (`tsc --noEmit`) |

---

## Security Notes

> ⚠️ **IMPORTANT — Read before deploying**

1. **Never commit real private keys or API keys.** The `.env.example` file is a template; replace all placeholder values with your own secrets and ensure `.env` is listed in `.gitignore`.

2. **Wallet security**: The executor wallet private key (`PRIVATE_KEY`) has direct control over on-chain funds. Use a dedicated hot wallet with only the minimum required balance. Never reuse a wallet that holds significant personal funds.

3. **Shadow Mode first**: Always test new configurations with `SHADOW_MODE=true` and `LIVE_EXECUTION=false` before enabling live execution.

4. **API key rotation**: Rotate all API keys (Alchemy, Infura, CoinGecko, Telegram, etc.) regularly and immediately if a leak is suspected.

5. **Access control**: The dashboard exposes sensitive execution controls. Restrict access using `AUTH_REQUIRED=true` and configure `CORS_ORIGINS` appropriately for production deployments.

6. **Gas caps**: Configure `MAX_DAILY_GAS_BUDGET_USD` and `MAX_GAS_PRICE_GWEI` to prevent runaway gas spend in adverse market conditions.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: description of change"`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure `npm run lint` passes before submitting.

---

<div align="center">

Built for Polygon Mainnet · Powered by Google Gemini AI · Apache 2.0 License

</div>
