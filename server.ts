import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simulation Data for DeFi Index
  const pools = [
    { id: '1', dex: 'QuickSwap V2', token0: 'USDC', token1: 'WETH', reserve0: 5000000n * 1000000n, reserve1: 2500n * 10n**18n, fee: 0.003 },
    { id: '2', dex: 'Uniswap V3', token0: 'USDC', token1: 'WETH', reserve0: 4950000n * 1000000n, reserve1: 2510n * 10n**18n, fee: 0.003 },
    { id: '3', dex: 'SushiSwap', token0: 'USDC', token1: 'WETH', reserve0: 5100000n * 1000000n, reserve1: 2480n * 10n**18n, fee: 0.003 },
  ];

  // API Routes
  app.get('/api/pools', (req, res) => {
    // Convert BigInt to string for JSON serialization
    const serializedPools = pools.map(p => ({
      ...p,
      reserve0: p.reserve0.toString(),
      reserve1: p.reserve1.toString(),
    }));
    res.json(serializedPools);
  });

  app.post('/api/liquidations/execute', (req, res) => {
    const { user, healthFactor } = req.body;
    
    console.log(`[LATENCY] Received liquidation request for ${user}`);
    
    // Validation logic based on health factor
    if (healthFactor >= 1.0) {
      return res.status(400).json({ 
        success: false, 
        message: 'INVALID_TARGET: Health factor must be below 1.0' 
      });
    }

    // Simulate blockchain confirmation delay
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      if (success) {
        res.json({
          success: true,
          txHash: `0x${Math.random().toString(16).slice(2, 64)}`,
          profit: Math.floor(Math.random() * 500) + 100,
          gasUsed: 485921
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'TRANSACTION_REVERTED: Slippage limits exceeded'
        });
      }
    }, 2000);
  });

  app.get('/api/liquidations', (req, res) => {
    // Mock liquidation opportunities
    res.json([
      {
        user: '0x71C...a2E',
        collateral: 'WETH',
        debt: 'USDC',
        collateralValue: 12500,
        debtValue: 11000,
        healthFactor: 0.92,
        profitPotential: 450
      },
      {
        user: '0x3F2...b1C',
        collateral: 'WBTC',
        debt: 'DAI',
        collateralValue: 45000,
        debtValue: 42000,
        healthFactor: 0.98,
        profitPotential: 1200
      }
    ]);
  });

  app.get('/api/status', (req, res) => {
    res.json({
      status: 'OPERATIONAL',
      uptime: process.uptime(),
      scannedPools: 274,
      lastBlock: 42069137,
      isHunting: true
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[APEX_OMEGA] Core running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
