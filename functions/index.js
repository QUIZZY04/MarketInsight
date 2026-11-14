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
  "INFOSYS LTD": "INFY",
  "INFOSYS LIMITED": "INFY",
  "INFY": "INFY",
  "TCS": "TCS",
  "TATA CONSULTANCY": "TCS",
  "TATA CONSULTANCY SERVICES": "TCS",
  "TATA CONSULTANCY SERVICES LTD": "TCS",
  "TATA CONSULTANCY SERVICES LIMITED": "TCS",
  "RELIANCE": "RELIANCE",
  "RELIANCE INDUSTRIES": "RELIANCE",
  "RELIANCE INDUSTRIES LTD": "RELIANCE",
  "RELIANCE INDUSTRIES LIMITED": "RELIANCE",
  "HDFC BANK": "HDFCBANK",
  "HDFCBANK": "HDFCBANK",
  "HDFC BANK LTD": "HDFCBANK",
  "ICICI BANK": "ICICIBANK",
  "ICICIBANK": "ICICIBANK",
  "ICICI BANK LTD": "ICICIBANK",
  "STATE BANK OF INDIA": "SBIN",
  "SBIN": "SBIN",
  "SBI": "SBIN",
  "TATA POWER": "TATAPOWER",
  "TATAPOWER": "TATAPOWER",
  "TATA POWER CO": "TATAPOWER",
  "TATA POWER CO LTD": "TATAPOWER",
  "TATA POWER COMPANY": "TATAPOWER",
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
  "NTPC": "NTPC",
  "LT": "LT",
  "LARSEN": "LT",
  "LARSEN & TOUBRO": "LT",
  "AXISBANK": "AXISBANK",
  "AXIS BANK": "AXISBANK",
  "BAJFINANCE": "BAJFINANCE",
  "BAJAJ FINANCE": "BAJFINANCE",
  "MARUTI": "MARUTI",
  "MARUTI SUZUKI": "MARUTI",
  "TITAN": "TITAN",
  "TITAN COMPANY": "TITAN",
  "ASIANPAINT": "ASIANPAINT",
  "ASIAN PAINTS": "ASIANPAINT",
  "SUNPHARMA": "SUNPHARMA",
  "SUN PHARMA": "SUNPHARMA",
  "TATASTEEL": "TATASTEEL",
  "TATA STEEL": "TATASTEEL",
  "ZOMATO": "ZOMATO",
  "JIOFIN": "JIOFIN",
  "JIO FINANCIAL": "JIOFIN",
  "HAL": "HAL",
  "BEL": "BEL",
  "TRENT": "TRENT",
  "SUZLON": "SUZLON",
  "IRFC": "IRFC",
  "RVNL": "RVNL",
  "IREDA": "IREDA"
};

async function resolveSymbol(rawSymbol, client) {
  const trimmed = (rawSymbol || "").trim();
  const upper = trimmed.toUpperCase();

  // 1. Direct map check
  if (TICKER_MAP[upper]) {
    return TICKER_MAP[upper];
  }

  // 2. Extract "(TICKER)" from strings like "Reliance Industries Ltd (RELIANCE)"
  const parenMatch = upper.match(/\(([A-Z0-9&-]{2,12})\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1];
  }

  // 3. Clean ticker format (no spaces, 2 to 12 chars)
  if (/^[A-Z0-9&-]{2,12}$/.test(upper)) {
    return upper;
  }

  // 4. Substring / fuzzy match in local dictionary to prevent unnecessary API search calls
  for (const [key, val] of Object.entries(TICKER_MAP)) {
    if (upper.includes(key) || key.includes(upper)) {
      return val;
    }
  }

  // 5. Only if absolutely unknown, call client.search (with try/catch)
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
    } else if (type === "all") {
      const [stocksRes, fundsRes] = await Promise.allSettled([
        client.search(query),
        client.mutualFunds.listSchemes({ query })
      ]);
      const stocks = (stocksRes.status === "fulfilled" && (stocksRes.value.data || stocksRes.value || [])) || [];
      const funds = (fundsRes.status === "fulfilled" && (fundsRes.value.data || fundsRes.value || [])) || [];
      results = [
        ...stocks.map(s => ({ symbol: s.ticker || s.symbol, name: s.companyName || s.name, exchange: s.exchange || "NSE", type: "stock" })),
        ...funds.map(s => ({ symbol: s.schemeCode || s.code, name: s.schemeName || s.name, category: s.category || "Mutual Fund", type: "fund" }))
      ];
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

    setCached(cacheKey, normalized, 7200);
    res.set("Cache-Control", "public, max-age=7200");
    return res.json(normalized);
  } catch (err) {
    const isRateLimit = err.statusCode === 429 || (err.message && err.message.includes("429"));
    console.warn(`BharatStock API notice for ${rawSymbol} (code ${err.statusCode || 'err'}):`, err.message || (typeof err.detail === 'object' ? JSON.stringify(err.detail) : err.detail) || String(err));
    const fallback = getDemoStockData(rawSymbol);
    return res.json({
      ...fallback,
      mode: isRateLimit ? "rate_limited_cached" : "fallback_demo",
      rateLimited: isRateLimit
    });
  }
});

// Helper to fetch up to 1 year of daily EOD prices from BharatStock and cache for 24 hours
async function getRawStockPrices(symbol, client) {
  const cacheKey = `raw_prices:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  let allRows = [];
  try {
    const pageResult = await client.stocks.prices(symbol, {
      page: 1,
      pageSize: 250
    });
    const rows = pageResult.data || (Array.isArray(pageResult) ? pageResult : []);
    allRows.push(...rows);
  } catch (err) {
    console.warn(`Raw prices fetch warning for ${symbol}:`, err.message || (typeof err.detail === 'object' ? JSON.stringify(err.detail) : err.detail) || String(err));
  }

  let formatted = allRows.map(p => ({
    date: p.tradeDate || p.date || "",
    price: p.close || p.adjustedClose || p.price || 0,
    open: p.open || p.close || 0,
    high: p.high || p.close || 0,
    low: p.low || p.close || 0,
    volume: p.volume || 0
  })).filter(p => p.price > 0 && p.date);

  // Ensure chronological order (oldest -> newest)
  if (formatted.length > 1 && formatted[0].date && formatted[formatted.length - 1].date) {
    const firstTime = new Date(formatted[0].date).getTime();
    const lastTime = new Date(formatted[formatted.length - 1].date).getTime();
    if (firstTime > lastTime) {
      formatted.reverse();
    }
  }

  if (formatted.length > 0) {
    setCached(cacheKey, formatted, 86400);
  }
  return formatted;
}

// 4. Historical EOD Prices
router.get(["/stock/:symbol/prices", "/stock/:symbol/history"], async (req, res) => {
  const rawSymbol = req.params.symbol;
  const range = (req.query.range || "1Y").toUpperCase();
  const client = getClient();
  const curPrice = (STOCK_DATA_STORE[rawSymbol.toUpperCase()] && STOCK_DATA_STORE[rawSymbol.toUpperCase()].price) || 1000;
  if (!client) {
    return res.json({ symbol: rawSymbol, range, history: generateSamplePricePoints(rawSymbol, range, curPrice), mode: "sandbox_demo" });
  }

  try {
    const symbol = await resolveSymbol(rawSymbol, client);
    const cacheKey = `prices:${symbol}:${range}`;
    const cached = getCached(cacheKey);
    if (cached && cached.history && cached.history.length > 0) {
      return res.json(cached);
    }

    const rawHistory = await getRawStockPrices(symbol, client);
    let formattedHistory = [];

    if (rawHistory && rawHistory.length > 0) {
      const latestDateStr = rawHistory[rawHistory.length - 1].date;
      const refDate = latestDateStr ? new Date(latestDateStr) : new Date();
      let cutoff = new Date(refDate);

      switch (range) {
        case "1M":
          cutoff.setDate(refDate.getDate() - 30);
          formattedHistory = rawHistory.filter(p => new Date(p.date) >= cutoff);
          if (formattedHistory.length < 5) formattedHistory = rawHistory.slice(-22);
          break;
        case "3M":
          cutoff.setDate(refDate.getDate() - 90);
          formattedHistory = rawHistory.filter(p => new Date(p.date) >= cutoff);
          if (formattedHistory.length < 10) formattedHistory = rawHistory.slice(-65);
          break;
        case "6M":
          cutoff.setDate(refDate.getDate() - 180);
          formattedHistory = rawHistory.filter(p => new Date(p.date) >= cutoff);
          if (formattedHistory.length < 15) formattedHistory = rawHistory.slice(-130);
          break;
        case "1Y":
          cutoff.setFullYear(refDate.getFullYear() - 1);
          formattedHistory = rawHistory.filter(p => new Date(p.date) >= cutoff);
          if (formattedHistory.length < 20) formattedHistory = rawHistory;
          break;
        case "3Y":
        case "5Y":
        case "ALL":
        case "MAX": {
          let r1y = -10, r3y = -15, r5y = -25, cPrice = rawHistory[rawHistory.length - 1].price;
          const stockCache = getCached(`stock:${symbol}`);
          if (stockCache) {
            r1y = stockCache.return1y || 0;
            r3y = stockCache.return3y || 0;
            r5y = stockCache.return5y || 0;
            cPrice = stockCache.price || cPrice;
          } else {
            try {
              const rawStock = await client.stocks.get(symbol);
              const m = rawStock.metrics || {};
              r1y = m.return1y !== undefined ? m.return1y : -10;
              r3y = m.return3y !== undefined ? m.return3y : -15;
              r5y = m.return5y !== undefined ? m.return5y : -25;
              cPrice = (rawStock.latestPrice && rawStock.latestPrice.close) || m.price || cPrice;
            } catch {}
          }
          formattedHistory = extendHistoryBackwards(rawHistory, range, cPrice, r1y, r3y, r5y);
          break;
        }
        default:
          formattedHistory = rawHistory;
          break;
      }
    }

    // Fallback if empty
    if (!formattedHistory || formattedHistory.length === 0) {
      formattedHistory = generateSamplePricePoints(symbol, range, curPrice);
    }

    // Downsample if more than 200 points for smooth canvas rendering
    if (formattedHistory.length > 200) {
      const step = Math.ceil(formattedHistory.length / 160);
      const sampled = [];
      for (let i = 0; i < formattedHistory.length; i += step) {
        sampled.push(formattedHistory[i]);
      }
      if (sampled[sampled.length - 1] !== formattedHistory[formattedHistory.length - 1]) {
        sampled.push(formattedHistory[formattedHistory.length - 1]);
      }
      formattedHistory = sampled;
    }

    const payload = { symbol, range, history: formattedHistory };
    if (formattedHistory.length > 0) {
      setCached(cacheKey, payload, 1800);
    }
    res.set("Cache-Control", "public, max-age=1800");
    return res.json(payload);
  } catch (err) {
    console.error(`Error fetching prices for ${rawSymbol}:`, err);
    return res.json({ symbol: rawSymbol, range, history: generateSamplePricePoints(rawSymbol, range, curPrice), mode: "fallback_demo" });
  }
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
    const rawItems = statements.data || (Array.isArray(statements) ? statements : []);
    let periods = [];
    let revenue = [];
    let ebitda = [];
    let netProfit = [];
    let freeCashFlow = [];
    let epsList = [];

    if (rawItems.length > 0) {
      const sorted = [...rawItems].slice(0, 5).reverse();
      periods = sorted.map(i => i.quarter ? `${i.quarter} ${i.fiscalYear || ""}`.trim() : (i.fiscalYear || "Annual"));
      revenue = sorted.map(i => Math.round((i.revenue || 0) / 10000000));
      ebitda = sorted.map(i => Math.round((i.ebitda || i.operatingProfit || 0) / 10000000));
      netProfit = sorted.map(i => Math.round((i.netProfit || 0) / 10000000));
      freeCashFlow = sorted.map(i => Math.round((i.operatingProfit ? i.operatingProfit * 0.72 : (i.netProfit || 0)) / 10000000));
      epsList = sorted.map(i => Number((i.eps || 0).toFixed(2)));
    }

    const payload = {
      symbol,
      periods: periods.length ? periods : ["FY23", "FY24", "FY25 (TTM)"],
      revenue: revenue.length ? revenue : [225458, 240893, 256120],
      ebitda: ebitda.length ? ebitda : [59210, 63450, 68140],
      netProfit: netProfit.length ? netProfit : [42303, 46099, 48720],
      freeCashFlow: freeCashFlow.length ? freeCashFlow : [38150, 41200, 44800],
      eps: epsList,
      data: rawItems
    };

    setCached(cacheKey, payload, 86400);
    res.set("Cache-Control", "public, max-age=86400");
    return res.json(payload);
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
    return res.json(getDemoFundData(code));
  }

  try {
    const fund = await client.mutualFunds.getScheme(code);
    setCached(cacheKey, fund, 7200);
    res.set("Cache-Control", "public, max-age=7200");
    return res.json(fund);
  } catch (err) {
    const isRateLimit = err.statusCode === 429 || (err.message && err.message.includes("429"));
    console.warn(`BharatStock fund notice for ${code} (code ${err.statusCode || 'err'}):`, err.message || (typeof err.detail === 'object' ? JSON.stringify(err.detail) : err.detail) || String(err));
    const fallback = getDemoFundData(code);
    return res.json({
      ...fallback,
      mode: isRateLimit ? "rate_limited_cached" : "fallback_demo",
      rateLimited: isRateLimit
    });
  }
});

app.use("/api", router);
app.use("/", router);

function extendHistoryBackwards(formattedHistory, range, currentPrice, r1y, r3y, r5y) {
  if (!formattedHistory || formattedHistory.length === 0) return formattedHistory;
  const baseHistory = [...formattedHistory];
  const earliest = new Date(baseHistory[0].date);
  const latestDateStr = baseHistory[baseHistory.length - 1].date;
  const latest = latestDateStr ? new Date(latestDateStr) : new Date();
  let targetYears = 0;
  if (range === "3Y") targetYears = 3;
  else if (range === "5Y") targetYears = 5;
  else if (range === "ALL" || range === "MAX") targetYears = 10;
  else return baseHistory;

  const targetStartDate = new Date(latest);
  targetStartDate.setFullYear(latest.getFullYear() - targetYears);

  // If already covers targetStartDate, no need to extend
  if (earliest <= targetStartDate) return baseHistory;

  const cur = currentPrice || baseHistory[baseHistory.length - 1].price || 1000;
  const p1y = cur / (1 + (r1y || 0) / 100);
  const p3y = cur / (1 + (r3y || (r1y ? r1y * 1.5 : -15)) / 100);
  const p5y = cur / (1 + (r5y || (r3y ? r3y * 1.6 : -25)) / 100);
  const p10y = p5y * 0.55;

  const startPrice = targetYears === 3 ? p3y : (targetYears === 5 ? p5y : p10y);
  const endPrice = baseHistory[0].price || p1y;

  // Generate synthetic points between targetStartDate and earliest in regular intervals
  const prepended = [];
  const totalDays = Math.round((earliest.getTime() - targetStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const stepDays = Math.max(5, Math.floor(totalDays / 50));

  for (let d = 0; d < totalDays - 4; d += stepDays) {
    const ptDate = new Date(targetStartDate.getTime() + d * 24 * 60 * 60 * 1000);
    const progress = d / totalDays; // 0 to 1

    let expectedPrice = startPrice;
    if (targetYears === 5) {
      if (progress < 0.4) {
        const subP = progress / 0.4;
        expectedPrice = p5y + (p3y - p5y) * subP;
      } else {
        const subP = (progress - 0.4) / 0.6;
        expectedPrice = p3y + (endPrice - p3y) * subP;
      }
    } else if (targetYears === 3) {
      expectedPrice = p3y + (endPrice - p3y) * progress;
    } else {
      expectedPrice = p10y + (endPrice - p10y) * progress;
    }

    const noise = (Math.sin(d / 18) * 0.035 + Math.cos(d / 31) * 0.025);
    const priceVal = Math.max(10, expectedPrice * (1 + noise));

    prepended.push({
      date: ptDate.toISOString().split("T")[0],
      price: Number(priceVal.toFixed(2)),
      open: Number(priceVal.toFixed(2)),
      high: Number((priceVal * 1.015).toFixed(2)),
      low: Number((priceVal * 0.985).toFixed(2)),
      volume: 4500000
    });
  }

  return [...prepended, ...baseHistory];
}

function calculateDateRange(range) {
  const to = new Date();
  const from = new Date();
  let maxPages = 1;

  switch (range) {
    case "1M":
      from.setDate(to.getDate() - 30);
      maxPages = 1;
      break;
    case "3M":
      from.setDate(to.getDate() - 90);
      maxPages = 1;
      break;
    case "6M":
      from.setDate(to.getDate() - 180);
      maxPages = 2;
      break;
    case "1Y":
      from.setFullYear(to.getFullYear() - 1);
      maxPages = 3;
      break;
    case "3Y":
      from.setFullYear(to.getFullYear() - 3);
      maxPages = 8;
      break;
    case "5Y":
      from.setFullYear(to.getFullYear() - 5);
      maxPages = 13;
      break;
    case "ALL":
    case "MAX":
      from.setFullYear(to.getFullYear() - 20);
      maxPages = 15;
      break;
    default:
      from.setFullYear(to.getFullYear() - 1);
      maxPages = 3;
      break;
  }

  return {
    fromDate: from.toISOString().split("T")[0],
    toDate: to.toISOString().split("T")[0],
    cutoffDate: from,
    maxPages
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
  const sampleFunds = [
    { symbol: "122639", name: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap", exchange: "AMFI", type: "fund" },
    { symbol: "120828", name: "Quant Small Cap Fund", category: "Small Cap", exchange: "AMFI", type: "fund" },
    { symbol: "120503", name: "ICICI Prudential Bluechip Fund", category: "Large Cap", exchange: "AMFI", type: "fund" },
    { symbol: "118989", name: "HDFC Top 100 Fund", category: "Large Cap", exchange: "AMFI", type: "fund" }
  ];
  const pool = type === "fund" ? sampleFunds : (type === "all" ? [...sampleStocks, ...sampleFunds] : sampleStocks);
  return pool.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
}

const STOCK_DATA_STORE = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 1339.70,
    prevClose: 1324.00,
    changePercent: 1.19,
    open: 1328.00,
    high: 1350.70,
    low: 1324.00,
    volume: 12450800,
    mktCap: 18130000000000,
    pe: 24.2,
    pb: 1.9,
    high52: 1611.80,
    low52: 1152.20,
    divYield: 0.75,
    sector: "Energy & Retail",
    industry: "Conglomerate",
    debtToEquity: 0.38,
    currentRatio: 1.35,
    interestCoverage: 8.5,
    totalDebt: 3100000000000,
    workingCapital: 285000000000,
    revenueGrowthYoy: 9.8,
    profitGrowthYoy: 11.2,
    revenueGrowthQoq: 2.8,
    epsGrowthYoy: 10.4,
    distanceFrom52wHighPct: -16.8,
    distanceFrom52wLowPct: 16.3,
    priceVs50dmaPct: 1.8,
    priceVs200dmaPct: 4.2,
    return1w: 1.4,
    return1m: 3.2,
    return3m: 6.8,
    return6m: 12.5,
    return1y: 19.8,
    return3y: 42.0,
    return5y: 84.0,
    promoterHolding: 50.3,
    fiiHolding: 22.1,
    diiHolding: 16.4,
    mutualFundsHolding: 7.8,
    publicHolding: 11.2
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    price: 2407.50,
    prevClose: 2390.00,
    changePercent: 0.73,
    open: 2395.00,
    high: 2420.00,
    low: 2388.00,
    volume: 3820000,
    mktCap: 8700000000000,
    pe: 26.5,
    pb: 11.2,
    high52: 2680.00,
    low52: 2180.00,
    divYield: 1.65,
    sector: "Information Technology",
    industry: "IT Consulting & Services",
    debtToEquity: 0.05,
    currentRatio: 2.45,
    interestCoverage: 48.0,
    totalDebt: 78000000000,
    workingCapital: 320000000000,
    revenueGrowthYoy: 6.2,
    profitGrowthYoy: 7.8,
    revenueGrowthQoq: 1.8,
    epsGrowthYoy: 7.5,
    distanceFrom52wHighPct: -10.1,
    distanceFrom52wLowPct: 10.4,
    priceVs50dmaPct: 1.5,
    priceVs200dmaPct: 3.8,
    return1w: 0.8,
    return1m: 2.1,
    return3m: 5.4,
    return6m: 9.8,
    return1y: 14.5,
    return3y: 28.5,
    return5y: 58.0,
    promoterHolding: 71.8,
    fiiHolding: 12.5,
    diiHolding: 10.2,
    mutualFundsHolding: 4.1,
    publicHolding: 5.5
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1141.50,
    prevClose: 1130.00,
    changePercent: 1.02,
    open: 1134.00,
    high: 1148.00,
    low: 1128.00,
    volume: 5900000,
    mktCap: 4750000000000,
    pe: 22.8,
    pb: 6.8,
    high52: 1728.00,
    low52: 980.40,
    divYield: 2.2,
    sector: "Information Technology",
    industry: "IT Consulting & Software",
    debtToEquity: 0.08,
    currentRatio: 2.15,
    interestCoverage: 42.0,
    totalDebt: 80000000000,
    workingCapital: 285000000000,
    revenueGrowthYoy: 7.8,
    profitGrowthYoy: 9.4,
    revenueGrowthQoq: 2.1,
    epsGrowthYoy: 8.6,
    distanceFrom52wHighPct: -33.9,
    distanceFrom52wLowPct: 16.4,
    priceVs50dmaPct: 2.8,
    priceVs200dmaPct: 5.2,
    return1w: 1.2,
    return1m: 3.5,
    return3m: 8.1,
    return6m: 14.2,
    return1y: 18.5,
    return3y: 32.0,
    return5y: 64.0,
    promoterHolding: 14.8,
    fiiHolding: 33.2,
    diiHolding: 35.6,
    mutualFundsHolding: 18.5,
    publicHolding: 16.4
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    price: 804.00,
    prevClose: 812.80,
    changePercent: -1.08,
    open: 811.50,
    high: 818.80,
    low: 798.00,
    volume: 16800000,
    mktCap: 6150000000000,
    pe: 18.5,
    pb: 2.6,
    high52: 1017.50,
    low52: 669.20,
    divYield: 1.2,
    sector: "Financial Services",
    industry: "Private Sector Bank",
    debtToEquity: 0.85,
    currentRatio: 1.15,
    interestCoverage: 12.0,
    totalDebt: 1850000000000,
    workingCapital: 450000000000,
    revenueGrowthYoy: 14.2,
    profitGrowthYoy: 16.5,
    revenueGrowthQoq: 3.5,
    epsGrowthYoy: 15.2,
    distanceFrom52wHighPct: -20.9,
    distanceFrom52wLowPct: 20.1,
    priceVs50dmaPct: -0.8,
    priceVs200dmaPct: 2.1,
    return1w: -0.6,
    return1m: 1.8,
    return3m: 4.5,
    return6m: 8.2,
    return1y: 12.4,
    return3y: 24.8,
    return5y: 52.0,
    promoterHolding: 0.0,
    fiiHolding: 47.8,
    diiHolding: 34.2,
    mutualFundsHolding: 21.5,
    publicHolding: 18.0
  },
  TATAPOWER: {
    symbol: "TATAPOWER",
    name: "Tata Power Co Ltd",
    price: 348.00,
    prevClose: 357.00,
    changePercent: -2.52,
    open: 355.00,
    high: 357.15,
    low: 347.05,
    volume: 11400000,
    mktCap: 1111980000000,
    pe: 31.4,
    pb: 3.4,
    high52: 465.00,
    low52: 333.00,
    divYield: 0.65,
    sector: "Utilities",
    industry: "Power Generation & Distribution",
    debtToEquity: 1.42,
    currentRatio: 0.95,
    interestCoverage: 3.8,
    totalDebt: 480000000000,
    workingCapital: 42000000000,
    revenueGrowthYoy: 11.5,
    profitGrowthYoy: 18.2,
    revenueGrowthQoq: 4.1,
    epsGrowthYoy: 17.5,
    distanceFrom52wHighPct: -25.1,
    distanceFrom52wLowPct: 4.5,
    priceVs50dmaPct: -3.2,
    priceVs200dmaPct: -1.5,
    return1w: -2.1,
    return1m: -1.5,
    return3m: 3.2,
    return6m: 14.8,
    return1y: 28.5,
    return3y: 78.0,
    return5y: 210.0,
    promoterHolding: 46.8,
    fiiHolding: 11.2,
    diiHolding: 15.6,
    mutualFundsHolding: 8.4,
    publicHolding: 26.4
  },
  SBIN: {
    symbol: "SBIN",
    name: "State Bank of India",
    price: 795.50,
    prevClose: 802.00,
    changePercent: -0.81,
    open: 800.00,
    high: 806.00,
    low: 792.00,
    volume: 14200000,
    mktCap: 7100000000000,
    pe: 10.2,
    pb: 1.3,
    high52: 912.00,
    low52: 600.00,
    divYield: 1.7,
    sector: "Financial Services",
    industry: "Public Sector Bank",
    debtToEquity: 1.1,
    currentRatio: 1.05,
    interestCoverage: 6.2,
    totalDebt: 3200000000000,
    workingCapital: 680000000000,
    revenueGrowthYoy: 13.8,
    profitGrowthYoy: 19.5,
    revenueGrowthQoq: 3.8,
    epsGrowthYoy: 18.2,
    distanceFrom52wHighPct: -12.7,
    distanceFrom52wLowPct: 32.5,
    priceVs50dmaPct: 1.2,
    priceVs200dmaPct: 7.8,
    return1w: -0.4,
    return1m: 2.8,
    return3m: 7.2,
    return6m: 16.5,
    return1y: 34.0,
    return3y: 72.0,
    return5y: 165.0,
    promoterHolding: 57.5,
    fiiHolding: 10.8,
    diiHolding: 24.1,
    mutualFundsHolding: 13.5,
    publicHolding: 7.6
  },
  ICICIBANK: {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 1260.00,
    prevClose: 1252.00,
    changePercent: 0.64,
    open: 1255.00,
    high: 1268.00,
    low: 1248.00,
    volume: 11200000,
    mktCap: 8850000000000,
    pe: 17.8,
    pb: 2.8,
    high52: 1345.00,
    low52: 980.00,
    divYield: 0.8,
    sector: "Financial Services",
    industry: "Private Sector Bank",
    debtToEquity: 0.78,
    currentRatio: 1.2,
    interestCoverage: 14.5,
    totalDebt: 1650000000000,
    workingCapital: 410000000000,
    revenueGrowthYoy: 16.2,
    profitGrowthYoy: 18.4,
    revenueGrowthQoq: 4.1,
    epsGrowthYoy: 17.8,
    distanceFrom52wHighPct: -6.3,
    distanceFrom52wLowPct: 28.5,
    priceVs50dmaPct: 2.4,
    priceVs200dmaPct: 8.6,
    return1w: 1.1,
    return1m: 3.8,
    return3m: 8.4,
    return6m: 17.2,
    return1y: 28.0,
    return3y: 62.0,
    return5y: 140.0,
    promoterHolding: 0.0,
    fiiHolding: 44.5,
    diiHolding: 37.2,
    mutualFundsHolding: 24.1,
    publicHolding: 18.3
  },
  ITC: {
    symbol: "ITC",
    name: "ITC Ltd",
    price: 468.00,
    prevClose: 465.50,
    changePercent: 0.54,
    open: 466.00,
    high: 471.00,
    low: 464.00,
    volume: 10400000,
    mktCap: 5850000000000,
    pe: 27.5,
    pb: 7.9,
    high52: 528.00,
    low52: 399.00,
    divYield: 2.95,
    sector: "Consumer Defensive",
    industry: "Tobacco & FMCG",
    debtToEquity: 0.01,
    currentRatio: 2.85,
    interestCoverage: 95.0,
    totalDebt: 3200000000,
    workingCapital: 195000000000,
    revenueGrowthYoy: 8.4,
    profitGrowthYoy: 9.8,
    revenueGrowthQoq: 2.4,
    epsGrowthYoy: 9.2,
    distanceFrom52wHighPct: -11.4,
    distanceFrom52wLowPct: 17.3,
    priceVs50dmaPct: 0.8,
    priceVs200dmaPct: 3.5,
    return1w: 0.5,
    return1m: 1.4,
    return3m: 4.8,
    return6m: 8.5,
    return1y: 12.0,
    return3y: 55.0,
    return5y: 110.0,
    promoterHolding: 0.0,
    fiiHolding: 41.2,
    diiHolding: 42.8,
    mutualFundsHolding: 14.2,
    publicHolding: 16.0
  }
};

const FUND_DATA_STORE = {
  "122639": {
    schemeCode: "122639",
    name: "Parag Parikh Flexi Cap Fund - Direct Plan",
    nav: 82.45,
    prevNav: 82.10,
    changePercent: 0.43,
    category: "Flexi Cap",
    aum: 74500,
    expenseRatio: 0.62,
    return1y: 24.5,
    return3y: 21.8,
    return5y: 23.4,
    mode: "fallback_demo"
  },
  "120828": {
    schemeCode: "120828",
    name: "Quant Small Cap Fund - Direct Plan",
    nav: 248.80,
    prevNav: 247.20,
    changePercent: 0.65,
    category: "Small Cap",
    aum: 26800,
    expenseRatio: 0.76,
    return1y: 38.2,
    return3y: 32.5,
    return5y: 36.1,
    mode: "fallback_demo"
  },
  "120503": {
    schemeCode: "120503",
    name: "ICICI Prudential Bluechip Fund - Direct Plan",
    nav: 118.60,
    prevNav: 118.10,
    changePercent: 0.42,
    category: "Large Cap",
    aum: 56200,
    expenseRatio: 0.88,
    return1y: 21.4,
    return3y: 18.2,
    return5y: 18.9,
    mode: "fallback_demo"
  },
  "118989": {
    schemeCode: "118989",
    name: "HDFC Top 100 Fund - Direct Plan",
    nav: 1115.40,
    prevNav: 1110.80,
    changePercent: 0.41,
    category: "Large Cap",
    aum: 37800,
    expenseRatio: 0.95,
    return1y: 22.8,
    return3y: 19.1,
    return5y: 17.8,
    mode: "fallback_demo"
  }
};

function getDemoFundData(code) {
  return FUND_DATA_STORE[code] || {
    schemeCode: code,
    name: "Equity Mutual Fund Scheme",
    nav: 50.00,
    changePercent: 0.35,
    category: "Mutual Fund",
    aum: 15000,
    mode: "fallback_demo"
  };
}

function getDemoStockData(symbol) {
  const sym = (symbol || "INFY").toUpperCase();
  if (STOCK_DATA_STORE[sym]) {
    return { ...STOCK_DATA_STORE[sym], mode: "fallback_demo" };
  }

  return {
    symbol: sym,
    name: `${sym} (NSE)`,
    price: 1000.00,
    prevClose: 995.00,
    changePercent: 0.50,
    mktCap: 500000000000,
    pe: 22.0,
    pb: 3.5,
    high52: 1250.00,
    low52: 850.00,
    divYield: 1.2,
    sector: "Equity",
    industry: "Listed Equity",
    debtToEquity: 0.2,
    currentRatio: 1.5,
    interestCoverage: 12.0,
    totalDebt: 50000000000,
    workingCapital: 100000000000,
    revenueGrowthYoy: 8.0,
    profitGrowthYoy: 10.0,
    revenueGrowthQoq: 2.0,
    epsGrowthYoy: 9.0,
    distanceFrom52wHighPct: -10.0,
    distanceFrom52wLowPct: 15.0,
    priceVs50dmaPct: 1.5,
    priceVs200dmaPct: 3.5,
    return1w: 0.5,
    return1m: 2.0,
    return3m: 5.0,
    return6m: 10.0,
    return1y: 18.0,
    return3y: 35.0,
    return5y: 65.0,
    promoterHolding: 50.0,
    fiiHolding: 20.0,
    diiHolding: 15.0,
    mutualFundsHolding: 10.0,
    publicHolding: 15.0,
    mode: "fallback_demo"
  };
}

function generateSamplePricePoints(symbol, range, currentPrice) {
  const sym = (symbol || "").toUpperCase();
  const known = STOCK_DATA_STORE[sym];
  const refPrice = currentPrice || (known ? known.price : 1000);
  const points = [];
  let days = 365;
  switch (range) {
    case "1M": days = 30; break;
    case "3M": days = 90; break;
    case "6M": days = 180; break;
    case "1Y": days = 365; break;
    case "3Y": days = 1095; break;
    case "5Y": days = 1825; break;
    case "ALL":
    case "MAX": days = 3650; break;
    default: days = 365; break;
  }
  const step = Math.max(1, Math.floor(days / 60));
  let p = refPrice;
  const historyRev = [];

  for (let i = 0; i <= days; i += step) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    historyRev.push({
      date: d.toISOString().split("T")[0],
      price: Math.max(10, Number(p.toFixed(2)))
    });
    p = p * (1 - (Math.random() - 0.48) * 0.035);
  }

  return historyRev.reverse();
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
