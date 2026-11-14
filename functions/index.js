const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { BharatStock } = require("bharatstock");

if (!admin.apps.length) {
  admin.initializeApp();
}

const bharatStockApiKey = defineSecret("BHARAT_STOCK_API_KEY");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const router = express.Router();

const cache = new Map();

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data, ttlSeconds) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

function resolveApiKey() {
  return (
    process.env.BHARAT_STOCK_API_KEY ||
    process.env.BHARATSTOCK_API_KEY ||
    (bharatStockApiKey.value ? bharatStockApiKey.value() : "")
  );
}

function getClient() {
  const key = resolveApiKey();
  if (!key || key === "your_bharat_stock_api_key_here") {
    return null;
  }
  return new BharatStock({ apiKey: key });
}

// Common Indian Company Name to NSE Symbol map
const TICKER_MAP = {
  "INFOSYS": "INFY",
  "INFOSYS LIMITED": "INFY",
  "TCS": "TCS",
  "TATA CONSULTANCY SERVICES": "TCS",
  "TATA CONSULTANCY SERVICES LIMITED": "TCS",
  "RELIANCE": "RELIANCE",
  "RELIANCE INDUSTRIES": "RELIANCE",
  "RELIANCE INDUSTRIES LIMITED": "RELIANCE",
  "HDFC BANK": "HDFCBANK",
  "HDFCBANK": "HDFCBANK",
  "ICICI BANK": "ICICIBANK",
  "ICICIBANK": "ICICIBANK",
  "STATE BANK OF INDIA": "SBIN",
  "SBIN": "SBIN",
  "SBI": "SBIN",
  "KOTAK MAHINDRA BANK": "KOTAKBANK",
  "KOTAKBANK": "KOTAKBANK",
  "HINDUSTAN UNILEVER": "HINDUNILVR",
  "HINDUNILVR": "HINDUNILVR",
  "NESTLE INDIA": "NESTLEIND",
  "NESTLEIND": "NESTLEIND",
  "PERSISTENT SYSTEMS": "PERSISTENT",
  "COFORGE": "COFORGE",
  "KPIT TECHNOLOGIES": "KPITTECH",
  "KPITTECH": "KPITTECH",
  "FEDERAL BANK": "FEDERALBNK",
  "IDFC FIRST BANK": "IDFCFIRSTB",
  "AU SMALL FINANCE BANK": "AUBANK",
  "LAURUS LABS": "LAURUSLABS",
  "ALKEM LABORATORIES": "ALKEM",
  "KAYNES TECHNOLOGY": "KAYNES",
  "CAMS": "CAMS",
  "AEGIS LOGISTICS": "AEGISLOG",
  "SAFARI INDUSTRIES": "SAFARI",
  "JUBILANT FOODWORKS": "JUBLFOOD",
  "NETWEB TECHNOLOGIES": "NETWEB",
  "NEWGEN SOFTWARE": "NEWGEN",
  "TATA MOTORS": "TATAMOTORS",
  "BHARTI AIRTEL": "BHARTIARTL",
  "ITC": "ITC",
  "WIPRO": "WIPRO",
  "HCL TECHNOLOGIES": "HCLTECH",
  "HCLTECH": "HCLTECH",
  "ONGC": "ONGC",
  "NTPC": "NTPC"
};

async function resolveSymbol(rawSymbol, client) {
  const upper = (rawSymbol || "").trim().toUpperCase();
  if (TICKER_MAP[upper]) {
    return TICKER_MAP[upper];
  }
  // Try fetching directly first
  try {
    const test = await client.stocks.get(upper);
    if (test && test.symbol) return upper;
  } catch {}

  // Search if direct didn't match
  try {
    const searchRes = await client.search(rawSymbol);
    const results = searchRes.data || searchRes || [];
    if (results.length > 0) {
      const top = results[0];
      return (top.ticker || top.symbol || upper).toUpperCase();
    }
  } catch {}

  return upper;
}

// 1. Status
router.get("/status", async (req, res) => {
  try {
    const unauthenticatedClient = new BharatStock({ apiKey: "status_probe" });
    const liveStatus = await unauthenticatedClient.status();
    const keyConfigured = Boolean(resolveApiKey() && resolveApiKey() !== "your_bharat_stock_api_key_here");

    res.json({
      service: "MarketInsight API Gateway",
      apiKeyConfigured: keyConfigured,
      bharatStockStatus: liveStatus.status,
      checksPassing: `${liveStatus.checksPassing}/${liveStatus.checksTotal}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to check status", message: err.message });
  }
});

// 2. Search
router.get("/search", async (req, res) => {
  const query = (req.query.q || "").trim();
  const type = req.query.type || "stock";

  if (!query || query.length < 2) {
    return res.json({ results: [] });
  }

  const cacheKey = `search:${type}:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const client = getClient();
  if (!client) {
    return res.json({ results: getSampleSearchResults(query, type), mode: "sandbox_demo" });
  }

  try {
    let results = [];
    if (type === "fund") {
      const schemes = await client.mutualFunds.listSchemes({ query });
      results = (schemes.data || schemes || []).map(s => ({
        symbol: s.schemeCode || s.code,
        name: s.schemeName || s.name,
        category: s.category || "Mutual Fund",
        type: "fund"
      }));
    } else {
      const searchRes = await client.search(query);
      results = (searchRes.data || searchRes || []).map(s => ({
        symbol: s.ticker || s.symbol,
        name: s.companyName || s.name,
        exchange: s.exchange || "NSE",
        type: "stock"
      }));
    }

    const payload = { results };
    setCached(cacheKey, payload, 300);
    res.set("Cache-Control", "public, max-age=300");
    return res.json(payload);
  } catch (err) {
    console.error("Search API error:", err);
    return res.json({ results: getSampleSearchResults(query, type), mode: "fallback_demo" });
  }
});

// 3. Stock Quote & Overview
router.get("/stock/:symbol", async (req, res) => {
  const rawSymbol = req.params.symbol;
  const client = getClient();
  if (!client) {
    return res.json({ ...getDemoStockData(rawSymbol), mode: "sandbox_demo" });
  }

  try {
    const symbol = await resolveSymbol(rawSymbol, client);
    const cacheKey = `stock:${symbol}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const rawStock = await client.stocks.get(symbol);
    const m = rawStock.metrics || {};
    const lp = rawStock.latestPrice || {};

    const price = lp.close || m.price || 0;
    const prev = lp.prevClose || price;
    const changePct = prev ? ((price - prev) / prev) * 100 : 0;

    const normalized = {
      symbol: rawStock.symbol || symbol,
      name: rawStock.companyName || symbol,
      sector: rawStock.sector || "Equity",
      industry: rawStock.industry || "",
      listingDate: rawStock.listingDate || "",
      faceValue: rawStock.faceValue || 1,
      price,
      prevClose: prev,
      changePercent: Number(changePct.toFixed(2)),
      open: lp.open || price,
      high: lp.high || price,
      low: lp.low || price,
      volume: lp.volume || 0,
      tradeDate: lp.tradeDate || "",

      // Valuation & Multiples
      mktCap: rawStock.marketCap || m.marketCap || 0,
      pe: m.peRatio || 0,
      pb: m.pbRatio || 0,
      priceToSales: m.priceToSales || 0,
      pegRatio: m.pegRatio || 0,
      evToEbitda: m.evToEbitda || 0,
      enterpriseValue: m.enterpriseValue || 0,
      bookValuePerShare: m.bookValuePerShare || 0,
      earningsYield: m.earningsYield || 0,
      divYield: m.dividendYield || 0,

      // Profitability & Margins
      roe: m.roe || 0,
      roce: m.roce || 0,
      eps: m.eps || 0,
      cashPerShare: m.cashPerShare || 0,
      revenuePerShare: m.revenuePerShare || 0,
      operatingMargin: m.operatingMargin || 0,
      netMargin: m.netMargin || 0,
      ebitdaMargin: m.ebitdaMargin || 0,

      // Growth Engine
      revenueGrowthYoy: m.revenueGrowthYoy || 0,
      profitGrowthYoy: m.profitGrowthYoy || 0,
      epsGrowthYoy: m.epsGrowthYoy || 0,
      revenueGrowthQoq: m.revenueGrowthQoq || 0,

      // Health & Solvency
      debtToEquity: m.debtToEquity !== undefined ? m.debtToEquity : 0,
      currentRatio: m.currentRatio || 0,
      interestCoverage: m.interestCoverage || 0,
      totalDebt: m.totalDebt || 0,
      workingCapital: m.workingCapital || 0,

      // Technicals & Multi-Period Returns
      high52: m.high52w || 0,
      low52: m.low52w || 0,
      distanceFrom52wHighPct: m.distanceFrom52wHighPct || 0,
      distanceFrom52wLowPct: m.distanceFrom52wLowPct || 0,
      priceVs50dmaPct: m.priceVs50dmaPct || 0,
      priceVs200dmaPct: m.priceVs200dmaPct || 0,
      return1w: m.return1w || 0,
      return1m: m.return1m || 0,
      return3m: m.return3m || 0,
      return6m: m.return6m || 0,
      return1y: m.return1y || 0,
      return3y: m.return3y || 0,
      return5y: m.return5y || 0,
      volatility30d: m.volatility30d || 0,
      volatility365d: m.volatility365d || 0,

      // Ownership & Institutional Backing
      promoterHolding: m.promoterHolding || 0,
      fiiHolding: m.fiiHolding || 0,
      diiHolding: m.diiHolding || 0,
      mutualFundsHolding: m.mutualFundsHolding || 0,
      publicHolding: m.publicHolding || 0,
      mfSummary: rawStock.mfHoldingsSummary || null
    };

    setCached(cacheKey, normalized, 60);
    res.set("Cache-Control", "public, max-age=60");
    return res.json(normalized);
  } catch (err) {
    console.error(`Error retrieving stock ${rawSymbol}:`, err);
    return res.json({ ...getDemoStockData(rawSymbol), mode: "fallback_demo" });
  }
});

// 4. Historical EOD Prices
router.get("/stock/:symbol/prices", async (req, res) => {
  const rawSymbol = req.params.symbol;
  const range = req.query.range || "1Y";
  const client = getClient();
  if (!client) {
    return res.json({ symbol: rawSymbol, history: generateSamplePricePoints(rawSymbol, range), mode: "sandbox_demo" });
  }

  try {
    const symbol = await resolveSymbol(rawSymbol, client);
    const cacheKey = `prices:${symbol}:${range}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const { from, to } = calculateDateRange(range);
    const priceSeries = await client.stocks.prices(symbol, { from, to });

    const formattedHistory = (priceSeries.data || priceSeries || []).map(p => ({
      date: p.date,
      price: p.adjustedClose || p.close,
      open: p.open,
      high: p.high,
      low: p.low,
      volume: p.volume
    }));

    const payload = { symbol, history: formattedHistory };
    setCached(cacheKey, payload, 1800);
    res.set("Cache-Control", "public, max-age=1800");
    return res.json(payload);
  } catch (err) {
    console.error(`Error fetching prices for ${rawSymbol}:`, err);
    return res.json({ symbol: rawSymbol, history: generateSamplePricePoints(rawSymbol, range), mode: "fallback_demo" });
  }
});

router.get("/stock/:symbol/history", (req, res) => {
  res.redirect(307, `/stock/${req.params.symbol}/prices?range=${req.query.range || "1Y"}`);
});

// 5. Normalized Financials
router.get("/stock/:symbol/financials", async (req, res) => {
  const rawSymbol = req.params.symbol;
  const period = req.query.period || "annual";
  const client = getClient();
  if (!client) {
    return res.json({ ...getDemoFinancials(rawSymbol), mode: "sandbox_demo" });
  }

  try {
    const symbol = await resolveSymbol(rawSymbol, client);
    const cacheKey = `financials:${symbol}:${period}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const statements = await client.stocks.financials(symbol, { period });
    setCached(cacheKey, statements, 86400);
    res.set("Cache-Control", "public, max-age=86400");
    return res.json(statements);
  } catch (err) {
    console.error(`Error fetching financials for ${rawSymbol}:`, err);
    return res.json({ ...getDemoFinancials(rawSymbol), mode: "fallback_demo" });
  }
});

// 6. Ratios
router.get("/stock/:symbol/ratios", async (req, res) => {
  const rawSymbol = req.params.symbol;
  const client = getClient();
  if (!client) {
    return res.json({ ...getDemoRatios(rawSymbol), mode: "sandbox_demo" });
  }

  try {
    const symbol = await resolveSymbol(rawSymbol, client);
    const cacheKey = `ratios:${symbol}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ratios = await client.stocks.ratios(symbol);
    setCached(cacheKey, ratios, 86400);
    res.set("Cache-Control", "public, max-age=86400");
    return res.json(ratios);
  } catch (err) {
    console.error(`Error fetching ratios for ${rawSymbol}:`, err);
    return res.json({ ...getDemoRatios(rawSymbol), mode: "fallback_demo" });
  }
});

// 7. Corporate Actions
router.get("/stock/:symbol/corporate-actions", async (req, res) => {
  const rawSymbol = req.params.symbol;
  const client = getClient();
  if (!client) {
    return res.json({ actions: [], mode: "sandbox_demo" });
  }

  try {
    const symbol = await resolveSymbol(rawSymbol, client);
    const cacheKey = `actions:${symbol}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const actions = await client.stocks.corporateActions(symbol);
    setCached(cacheKey, actions, 43200);
    return res.json(actions);
  } catch (err) {
    console.error(`Error fetching corporate actions for ${rawSymbol}:`, err);
    return res.json({ actions: [], error: err.message });
  }
});

// 8. Mutual Funds
router.get("/fund/:code", async (req, res) => {
  const code = req.params.code;
  const cacheKey = `fund:${code}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const client = getClient();
  if (!client) {
    return res.json({
      schemeCode: code,
      name: "Parag Parikh Flexi Cap Fund - Direct Plan",
      nav: 82.45,
      changePercent: 0.65,
      category: "Flexi Cap",
      aum: 65400,
      mode: "sandbox_demo"
    });
  }

  try {
    const fund = await client.mutualFunds.getScheme(code);
    setCached(cacheKey, fund, 1800);
    return res.json(fund);
  } catch (err) {
    console.error(`Error fetching fund ${code}:`, err);
    return res.status(500).json({ error: "Failed to fetch fund details" });
  }
});

app.use("/api", router);
app.use("/", router);

function calculateDateRange(range) {
  const to = new Date();
  const from = new Date();
  switch (range) {
    case "1M":
      from.setMonth(to.getMonth() - 1);
      break;
    case "6M":
      from.setMonth(to.getMonth() - 6);
      break;
    case "5Y":
      from.setFullYear(to.getFullYear() - 5);
      break;
    case "1Y":
    default:
      from.setFullYear(to.getFullYear() - 1);
      break;
  }
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0]
  };
}

function getSampleSearchResults(query, type) {
  const q = query.toLowerCase();
  const sampleStocks = [
    { symbol: "TCS", name: "Tata Consultancy Services Ltd", exchange: "NSE", type: "stock" },
    { symbol: "INFY", name: "Infosys Ltd", exchange: "NSE", type: "stock" },
    { symbol: "RELIANCE", name: "Reliance Industries Ltd", exchange: "NSE", type: "stock" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", exchange: "NSE", type: "stock" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd", exchange: "NSE", type: "stock" },
    { symbol: "ITC", name: "ITC Ltd", exchange: "NSE", type: "stock" }
  ];
  return sampleStocks.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
}

function getDemoStockData(symbol) {
  return {
    symbol,
    name: `${symbol} (NSE)`,
    price: 3450.00,
    prevClose: 3410.00,
    changePercent: 1.17,
    mktCap: 8500000000000,
    pe: 26.5,
    pb: 8.2,
    high52: 4100,
    low52: 2900,
    divYield: 1.5,
    sector: "Information Technology"
  };
}

function generateSamplePricePoints(symbol, range) {
  const points = [];
  const days = range === "1M" ? 30 : range === "6M" ? 180 : range === "5Y" ? 1825 : 365;
  const step = Math.max(1, Math.floor(days / 60));
  let basePrice = 2400;

  for (let i = days; i >= 0; i -= step) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    basePrice += (Math.random() - 0.48) * 35;
    points.push({
      date: d.toISOString().split("T")[0],
      price: Math.max(100, Number(basePrice.toFixed(2)))
    });
  }
  return points;
}

function getDemoFinancials(symbol) {
  return {
    symbol,
    periods: ["FY23", "FY24", "FY25 (TTM)"],
    revenue: [225458, 240893, 256120],
    ebitda: [59210, 63450, 68140],
    netProfit: [42303, 46099, 48720],
    freeCashFlow: [38150, 41200, 44800]
  };
}

function getDemoRatios(symbol) {
  return {
    symbol,
    pb: 7.37,
    roe: 43.2,
    roce: 56.0,
    debtToEquity: 0.0,
    eps: 142.64,
    operatingMargin: 26.3,
    currentRatio: 2.48,
    promoterHolding: 71.8
  };
}

exports.api = onRequest(
  {
    secrets: [bharatStockApiKey],
    region: "asia-south1",
    maxInstances: 10,
    cors: true
  },
  app
);
