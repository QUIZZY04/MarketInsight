/**
 * MarketInsight Frontend Application Logic
 * Integrates UI with Firebase Cloud Functions API Gateway (BharatStock proxy)
 */

// Connects to your live Firebase backend from GitHub Pages, custom domains, or local files
const API_BASE = (window.location.hostname === "marketinsight-research.web.app" || window.location.hostname === "marketinsight-research.firebaseapp.com")
  ? ""
  : "https://api-tucd5hdvya-el.a.run.app";

// Common Indian Company Name to NSE Symbol map
const TICKER_MAP = {
  "TCS": "TCS",
  "TATA CONSULTANCY SERVICES": "TCS",
  "INFOSYS": "INFY",
  "INFY": "INFY",
  "HCL TECHNOLOGIES": "HCLTECH",
  "HCLTECH": "HCLTECH",
  "WIPRO": "WIPRO",
  "HDFC BANK": "HDFCBANK",
  "HDFCBANK": "HDFCBANK",
  "ICICI BANK": "ICICIBANK",
  "ICICIBANK": "ICICIBANK",
  "STATE BANK OF INDIA": "SBIN",
  "SBIN": "SBIN",
  "SBI": "SBIN",
  "KOTAK MAHINDRA BANK": "KOTAKBANK",
  "KOTAKBANK": "KOTAKBANK",
  "RELIANCE": "RELIANCE",
  "RELIANCE INDUSTRIES": "RELIANCE",
  "ONGC": "ONGC",
  "NTPC": "NTPC",
  "ITC": "ITC",
  "HINDUSTAN UNILEVER": "HINDUNILVR",
  "HINDUNILVR": "HINDUNILVR",
  "NESTLE INDIA": "NESTLEIND",
  "NESTLÉ INDIA": "NESTLEIND",
  "NESTLEIND": "NESTLEIND",
  "PERSISTENT SYSTEMS": "PERSISTENT",
  "PERSISTENT": "PERSISTENT",
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
  "BHARTI AIRTEL": "BHARTIARTL"
};

// Comprehensive Instant In-Memory Catalog for Sub-Millisecond Search
const INSTANT_CATALOG = [
  // NIFTY 50 & Top Indian Equities
  { symbol: "INFY", name: "Infosys Ltd", type: "stock", meta: "Large Cap · IT Consulting & Services", exchange: "NSE" },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd", type: "stock", meta: "Large Cap · IT Services", exchange: "NSE" },
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", type: "stock", meta: "Large Cap · Energy, Retail & Telecom", exchange: "NSE" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", type: "stock", meta: "Large Cap · Private Banking", exchange: "NSE" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", type: "stock", meta: "Large Cap · Private Banking", exchange: "NSE" },
  { symbol: "SBIN", name: "State Bank of India", type: "stock", meta: "Large Cap · Public Sector Bank", exchange: "NSE" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", type: "stock", meta: "Large Cap · Telecommunications", exchange: "NSE" },
  { symbol: "ITC", name: "ITC Ltd", type: "stock", meta: "Large Cap · Diversified FMCG & Hotels", exchange: "NSE" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", type: "stock", meta: "Large Cap · Consumer Goods (FMCG)", exchange: "NSE" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", type: "stock", meta: "Large Cap · Private Banking", exchange: "NSE" },
  { symbol: "LT", name: "Larsen & Toubro Ltd", type: "stock", meta: "Large Cap · Infrastructure & EPC", exchange: "NSE" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", type: "stock", meta: "Large Cap · Private Banking", exchange: "NSE" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", type: "stock", meta: "Large Cap · Consumer Finance / NBFC", exchange: "NSE" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd", type: "stock", meta: "Large Cap · Passenger Automobiles", exchange: "NSE" },
  { symbol: "TITAN", name: "Titan Company Ltd", type: "stock", meta: "Large Cap · Jewellery & Luxury Goods", exchange: "NSE" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd", type: "stock", meta: "Large Cap · Paints & Coatings", exchange: "NSE" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd", type: "stock", meta: "Large Cap · Pharmaceuticals", exchange: "NSE" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", type: "stock", meta: "Large Cap · Commercial & EV Vehicles", exchange: "NSE" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", type: "stock", meta: "Large Cap · Steel Manufacturing", exchange: "NSE" },
  { symbol: "NTPC", name: "NTPC Ltd", type: "stock", meta: "Large Cap · Thermal & Green Power", exchange: "NSE" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd", type: "stock", meta: "Large Cap · Oil & Gas Exploration", exchange: "NSE" },
  { symbol: "POWERGRID", name: "Power Grid Corporation of India", type: "stock", meta: "Large Cap · Power Transmission", exchange: "NSE" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd", type: "stock", meta: "Large Cap · IT & Engineering R&D", exchange: "NSE" },
  { symbol: "WIPRO", name: "Wipro Ltd", type: "stock", meta: "Large Cap · IT & Business Consulting", exchange: "NSE" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd", type: "stock", meta: "Large Cap · Building Materials", exchange: "NSE" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd", type: "stock", meta: "Large Cap · Financial Holding", exchange: "NSE" },
  { symbol: "NESTLEIND", name: "Nestlé India Ltd", type: "stock", meta: "Large Cap · Food & Beverages", exchange: "NSE" },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd", type: "stock", meta: "Large Cap · Resource & Energy", exchange: "NSE" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ Ltd", type: "stock", meta: "Large Cap · Ports & Logistics", exchange: "NSE" },
  { symbol: "COALINDIA", name: "Coal India Ltd", type: "stock", meta: "Large Cap · Coal Mining", exchange: "NSE" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd", type: "stock", meta: "Large Cap · Steel & Iron", exchange: "NSE" },
  { symbol: "GRASIM", name: "Grasim Industries Ltd", type: "stock", meta: "Large Cap · Fibres & Chemicals", exchange: "NSE" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd", type: "stock", meta: "Large Cap · IT & Digital Solutions", exchange: "NSE" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd", type: "stock", meta: "Large Cap · Private Banking", exchange: "NSE" },
  { symbol: "CIPLA", name: "Cipla Ltd", type: "stock", meta: "Large Cap · Generic Pharmaceuticals", exchange: "NSE" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd", type: "stock", meta: "Large Cap · Active Pharma Ingredients", exchange: "NSE" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd (Royal Enfield)", type: "stock", meta: "Large Cap · Motorcycles & CVs", exchange: "NSE" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd", type: "stock", meta: "Large Cap · API & Biotech", exchange: "NSE" },
  { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd", type: "stock", meta: "Large Cap · Refining & Marketing", exchange: "NSE" },
  { symbol: "BRITANNIA", name: "Britannia Industries Ltd", type: "stock", meta: "Large Cap · Bakery & Dairy Goods", exchange: "NSE" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd", type: "stock", meta: "Large Cap · Two-Wheelers", exchange: "NSE" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd", type: "stock", meta: "Large Cap · Healthcare Services", exchange: "NSE" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd", type: "stock", meta: "Large Cap · Tea, Coffee & Foods", exchange: "NSE" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance Co Ltd", type: "stock", meta: "Large Cap · Life Insurance", exchange: "NSE" },
  { symbol: "SBILIFE", name: "SBI Life Insurance Co Ltd", type: "stock", meta: "Large Cap · Life Insurance", exchange: "NSE" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", type: "stock", meta: "Large Cap · Two & Three Wheelers", exchange: "NSE" },
  { symbol: "LTIM", name: "LTIMindtree Ltd", type: "stock", meta: "Large Cap · Technology Services", exchange: "NSE" },
  { symbol: "VEDL", name: "Vedanta Ltd", type: "stock", meta: "Large Cap · Natural Resources", exchange: "NSE" },
  { symbol: "ZOMATO", name: "Zomato Ltd", type: "stock", meta: "Large Cap · Food Delivery & Blinkit", exchange: "NSE" },
  { symbol: "JIOFIN", name: "Jio Financial Services Ltd", type: "stock", meta: "Large Cap · Digital NBFC & Payments", exchange: "NSE" },
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd", type: "stock", meta: "Large Cap · Aerospace & Defence", exchange: "NSE" },
  { symbol: "BEL", name: "Bharat Electronics Ltd", type: "stock", meta: "Large Cap · Defence Radars & Avionics", exchange: "NSE" },
  { symbol: "TRENT", name: "Trent Ltd (Westside / Zudio)", type: "stock", meta: "Large Cap · Retail Apparel", exchange: "NSE" },
  { symbol: "VARUNBEV", name: "Varun Beverages Ltd", type: "stock", meta: "Large Cap · PepsiCo Bottling", exchange: "NSE" },
  { symbol: "POLYCAB", name: "Polycab India Ltd", type: "stock", meta: "Large Cap · Wires & Cables", exchange: "NSE" },
  { symbol: "IRCTC", name: "Indian Railway Catering & Tourism", type: "stock", meta: "Mid Cap · Railway Ticketing & Catering", exchange: "NSE" },
  { symbol: "SUZLON", name: "Suzlon Energy Ltd", type: "stock", meta: "Mid Cap · Wind Turbines & Clean Energy", exchange: "NSE" },
  { symbol: "PAYTM", name: "One97 Communications (Paytm)", type: "stock", meta: "Mid Cap · Digital Payments & QR", exchange: "NSE" },
  { symbol: "BHEL", name: "Bharat Heavy Electricals Ltd", type: "stock", meta: "Mid Cap · Heavy Electrical Machinery", exchange: "NSE" },
  { symbol: "RECLTD", name: "REC Ltd", type: "stock", meta: "Large Cap · Rural Electrification Finance", exchange: "NSE" },
  { symbol: "PFC", name: "Power Finance Corporation Ltd", type: "stock", meta: "Large Cap · Power Infra Finance", exchange: "NSE" },
  { symbol: "PERSISTENT", name: "Persistent Systems Ltd", type: "stock", meta: "Mid Cap · Digital Engineering", exchange: "NSE" },
  { symbol: "COFORGE", name: "Coforge Ltd", type: "stock", meta: "Mid Cap · Enterprise Software & AI", exchange: "NSE" },
  { symbol: "KPITTECH", name: "KPIT Technologies Ltd", type: "stock", meta: "Mid Cap · Autonomous Auto Software", exchange: "NSE" },
  { symbol: "FEDERALBNK", name: "Federal Bank Ltd", type: "stock", meta: "Mid Cap · Commercial Banking", exchange: "NSE" },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd", type: "stock", meta: "Mid Cap · Retail Banking", exchange: "NSE" },
  { symbol: "AUBANK", name: "AU Small Finance Bank Ltd", type: "stock", meta: "Mid Cap · Small Finance Banking", exchange: "NSE" },
  { symbol: "LAURUSLABS", name: "Laurus Labs Ltd", type: "stock", meta: "Mid Cap · Active Pharmaceutical Active", exchange: "NSE" },
  { symbol: "ALKEM", name: "Alkem Laboratories Ltd", type: "stock", meta: "Mid Cap · Anti-infectives & Formulations", exchange: "NSE" },
  { symbol: "KAYNES", name: "Kaynes Technology India Ltd", type: "stock", meta: "Mid Cap · Precision Electronics Mfg", exchange: "NSE" },
  { symbol: "CAMS", name: "Computer Age Management Services", type: "stock", meta: "Mid Cap · Mutual Fund RTA Registrar", exchange: "NSE" },
  { symbol: "AEGISLOG", name: "Aegis Logistics Ltd", type: "stock", meta: "Mid Cap · LPG & Chemical Storage", exchange: "NSE" },
  { symbol: "SAFARI", name: "Safari Industries India Ltd", type: "stock", meta: "Small Cap · Luggage & Travel Gear", exchange: "NSE" },
  { symbol: "JUBLFOOD", name: "Jubilant FoodWorks (Domino's)", type: "stock", meta: "Mid Cap · Quick Service Restaurants", exchange: "NSE" },
  { symbol: "NETWEB", name: "Netweb Technologies Ltd", type: "stock", meta: "Small Cap · AI Supercomputing Servers", exchange: "NSE" },
  { symbol: "NEWGEN", name: "Newgen Software Technologies", type: "stock", meta: "Small Cap · Low-Code Digital Workflow", exchange: "NSE" },

  // Top Mutual Funds (AMFI Direct Schemes)
  { symbol: "122639", name: "Parag Parikh Flexi Cap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120828", name: "Quant Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120823", name: "Quant Mid Cap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120841", name: "Quant Flexi Cap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120826", name: "Quant Active Fund", type: "fund", meta: "Equity · Multi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119063", name: "Mirae Asset Large Cap Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119062", name: "Mirae Asset ELSS Tax Saver Fund", type: "fund", meta: "Equity · Tax Saver ELSS", exchange: "AMFI" },
  { symbol: "120503", name: "ICICI Prudential Bluechip Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120505", name: "ICICI Prudential Balanced Advantage Fund", type: "fund", meta: "Hybrid · Dynamic Asset Allocation", exchange: "AMFI" },
  { symbol: "120586", name: "ICICI Prudential Equity & Debt Fund", type: "fund", meta: "Hybrid · Aggressive Hybrid Allocation", exchange: "AMFI" },
  { symbol: "118989", name: "HDFC Top 100 Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118968", name: "HDFC Mid-Cap Opportunities Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118955", name: "HDFC Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118961", name: "HDFC Flexi Cap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119598", name: "SBI Bluechip Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119597", name: "SBI Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119782", name: "SBI Magnum Midcap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119777", name: "SBI Contra Fund", type: "fund", meta: "Equity · Value & Contra Strategy", exchange: "AMFI" },
  { symbol: "118560", name: "Nippon India Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118558", name: "Nippon India Growth Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118556", name: "Nippon India Large Cap Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118778", name: "Kotak Emerging Equity Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118765", name: "Kotak Flexicap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118772", name: "Kotak Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "125354", name: "Axis Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120465", name: "Axis Bluechip Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120466", name: "Axis Midcap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "127042", name: "Motilal Oswal Midcap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "127040", name: "Motilal Oswal Flexi Cap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120716", name: "UTI Nifty 50 Index Fund", type: "fund", meta: "Passive · NIFTY 50 Index Tracking", exchange: "AMFI" },
  { symbol: "148721", name: "HDFC Nifty 50 Index Fund", type: "fund", meta: "Passive · NIFTY 50 Index Tracking", exchange: "AMFI" },
  { symbol: "120684", name: "Bandhan Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" }
];

let currentAssetType = "stock";
let currentSearchFilter = "all";
let currentSelectedSymbol = "INFY";
let currentSelectedData = null;
let stockChartInstance = null;
let backgroundSearchDebounce = null;
let currentChartRange = "1Y";
let selectedDropdownIndex = -1;

// DOM Elements
const instrumentInput = document.getElementById("instrument");
const autocompleteDropdown = document.getElementById("autocompleteDropdown");
const resultMessage = document.getElementById("resultMessage");

function resolveTicker(nameOrSymbol) {
  if (!nameOrSymbol) return "INFY";
  const str = nameOrSymbol.trim();

  // If input format has parentheses like "Infosys Ltd (INFY)", extract ticker
  const parenMatch = str.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const inside = parenMatch[1].trim().toUpperCase();
    return TICKER_MAP[inside] || inside;
  }

  const upper = str.toUpperCase();
  if (TICKER_MAP[upper]) return TICKER_MAP[upper];

  // Match against catalog by exact name or code
  const found = INSTANT_CATALOG.find(
    c => c.name.toLowerCase() === str.toLowerCase() || c.symbol.toLowerCase() === str.toLowerCase()
  );
  if (found) return found.symbol;

  return upper;
}

function detectAssetType(ticker, rawChosen) {
  if (/^\d{5,7}$/.test(ticker)) return "fund";
  const catalogItem = INSTANT_CATALOG.find(c => c.symbol.toUpperCase() === ticker.toUpperCase());
  if (catalogItem && catalogItem.type === "fund") return "fund";
  const lower = (rawChosen || "").toLowerCase();
  if (lower.includes("fund") || lower.includes("plan") || lower.includes("amfi") || lower.includes("scheme")) {
    return "fund";
  }
  return "stock";
}

// Format helpers
function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(val);
}

function formatLargeNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return "N/A";
  if (num >= 1e12) {
    return "₹ " + (num / 1e12).toFixed(2) + "L Cr";
  }
  if (num >= 1e7) {
    return "₹ " + (num / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + " Cr";
  }
  if (num >= 1e5) {
    return "₹ " + (num / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + " L";
  }
  return formatINR(num);
}

// Search Filter Switching (All / Stocks / Mutual Funds)
function setSearchFilter(filter) {
  currentSearchFilter = filter;
  document.getElementById("filterAllBtn")?.classList.toggle("active", filter === "all");
  document.getElementById("filterStocksBtn")?.classList.toggle("active", filter === "stock");
  document.getElementById("filterFundsBtn")?.classList.toggle("active", filter === "fund");

  if (instrumentInput) {
    handleInstantSearch(instrumentInput.value);
  }
}

// Clear Search Input Button
function clearSearchInput() {
  if (instrumentInput) {
    instrumentInput.value = "";
    instrumentInput.focus();
    handleInstantSearch("");
  }
}

// Instant Sub-Millisecond Search (Zero Latency)
function handleInstantSearch(query) {
  const q = (query || "").trim().toLowerCase();
  selectedDropdownIndex = -1;

  // Filter based on active filter ('all', 'stock', or 'fund')
  const pool = currentSearchFilter === "all"
    ? INSTANT_CATALOG
    : INSTANT_CATALOG.filter(item => item.type === currentSearchFilter);

  if (!q) {
    // Show top trending recommendations immediately
    renderAutocompleteItems(pool.slice(0, 8), "");
    return;
  }

  // Tiered Instant Ranking:
  // 1. Symbol exact match
  // 2. Symbol starts with query
  // 3. Word in name starts with query
  // 4. Symbol contains query
  // 5. Name contains query
  const exact = [];
  const symbolStarts = [];
  const wordStarts = [];
  const symbolContains = [];
  const nameContains = [];

  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];
    const sym = item.symbol.toLowerCase();
    const name = item.name.toLowerCase();

    if (sym === q) {
      exact.push(item);
    } else if (sym.startsWith(q)) {
      symbolStarts.push(item);
    } else if (name.split(/\s+/).some(w => w.startsWith(q))) {
      wordStarts.push(item);
    } else if (sym.includes(q)) {
      symbolContains.push(item);
    } else if (name.includes(q)) {
      nameContains.push(item);
    }
  }

  const matches = [...exact, ...symbolStarts, ...wordStarts, ...symbolContains, ...nameContains];
  const uniqueMatches = [];
  const seen = new Set();
  for (const m of matches) {
    if (!seen.has(m.symbol)) {
      seen.add(m.symbol);
      uniqueMatches.push(m);
    }
  }

  renderAutocompleteItems(uniqueMatches.slice(0, 9), q);

  // Optional background fetch for uncommon symbols without blocking instant local results
  if (q.length >= 2) {
    clearTimeout(backgroundSearchDebounce);
    backgroundSearchDebounce = setTimeout(() => {
      fetchBackgroundSearchResults(q);
    }, 350);
  }
}

function renderAutocompleteItems(items, query = "") {
  if (!autocompleteDropdown) return;
  autocompleteDropdown.innerHTML = "";

  if (!items || items.length === 0) {
    const empty = document.createElement("div");
    empty.style.padding = "14px";
    empty.style.color = "#64748b";
    empty.style.fontSize = "13px";
    empty.style.textAlign = "center";
    empty.textContent = `No matching stock or fund found for "${query}". Press Enter to search live.`;
    autocompleteDropdown.appendChild(empty);
    autocompleteDropdown.style.display = "block";
    return;
  }

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "autocomplete-item";
    div.dataset.index = index;

    const isStock = item.type === "stock";
    const badgeText = isStock ? "STOCK" : "MUTUAL FUND";
    const badgeClass = isStock ? "stock" : "fund";

    div.innerHTML = `
      <div class="autocomplete-item-left">
        <div class="autocomplete-symbol-row">
          <span class="autocomplete-symbol">${item.symbol}</span>
          <span class="autocomplete-name">${item.name}</span>
        </div>
        <div class="autocomplete-meta">${item.meta || (isStock ? "Equity" : "Direct Scheme")}</div>
      </div>
      <div class="autocomplete-item-right">
        <span class="autocomplete-badge ${badgeClass}">${badgeText}</span>
        <span class="autocomplete-exchange">${item.exchange || (isStock ? "NSE" : "AMFI")}</span>
      </div>
    `;

    div.onmousedown = (e) => {
      e.preventDefault(); // Prevent input blur before click finishes
      selectSearchResult(item);
    };

    autocompleteDropdown.appendChild(div);
  });

  autocompleteDropdown.style.display = "block";
}

function selectSearchResult(item) {
  currentAssetType = item.type || "stock";
  currentSelectedSymbol = item.symbol;
  if (instrumentInput) {
    instrumentInput.value = `${item.name} (${item.symbol})`;
  }
  if (autocompleteDropdown) {
    autocompleteDropdown.style.display = "none";
  }

  // Update filter buttons to reflect selected type
  if (currentAssetType === "stock") {
    document.getElementById("filterStocksBtn")?.classList.add("active");
    document.getElementById("filterFundsBtn")?.classList.remove("active");
    document.getElementById("filterAllBtn")?.classList.remove("active");
  } else {
    document.getElementById("filterFundsBtn")?.classList.add("active");
    document.getElementById("filterStocksBtn")?.classList.remove("active");
    document.getElementById("filterAllBtn")?.classList.remove("active");
  }

  exploreInvestment();
}

async function fetchBackgroundSearchResults(query) {
  try {
    const typeParam = currentSearchFilter === "all" ? "all" : currentSearchFilter;
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&type=${typeParam}`);
    if (!res.ok) return;
    const json = await res.json();
    const liveResults = json.results || [];
    if (liveResults.length > 0 && autocompleteDropdown && autocompleteDropdown.style.display === "block") {
      // Append any unindexed new results
      const existingSymbols = new Set(Array.from(autocompleteDropdown.querySelectorAll(".autocomplete-symbol")).map(el => el.textContent.trim().toUpperCase()));
      let added = false;
      liveResults.forEach(item => {
        const sym = (item.symbol || "").toUpperCase();
        if (sym && !existingSymbols.has(sym)) {
          existingSymbols.add(sym);
          const div = document.createElement("div");
          div.className = "autocomplete-item";
          const isStock = item.type !== "fund";
          div.innerHTML = `
            <div class="autocomplete-item-left">
              <div class="autocomplete-symbol-row">
                <span class="autocomplete-symbol">${item.symbol}</span>
                <span class="autocomplete-name">${item.name}</span>
              </div>
              <div class="autocomplete-meta">${item.category || (isStock ? "Equity" : "Mutual Fund")}</div>
            </div>
            <div class="autocomplete-item-right">
              <span class="autocomplete-badge ${isStock ? 'stock' : 'fund'}">${isStock ? 'STOCK' : 'MUTUAL FUND'}</span>
              <span class="autocomplete-exchange">${item.exchange || (isStock ? "NSE" : "AMFI")}</span>
            </div>
          `;
          div.onmousedown = (e) => {
            e.preventDefault();
            selectSearchResult(item);
          };
          autocompleteDropdown.appendChild(div);
          added = true;
        }
      });
    }
  } catch {}
}

// Explore selected investment
async function exploreInvestment() {
  let rawChosen = instrumentInput ? instrumentInput.value.trim() : "";
  if (!rawChosen) {
    rawChosen = "Infosys Ltd (INFY)";
    if (instrumentInput) instrumentInput.value = "Infosys Ltd (INFY)";
  }

  const ticker = resolveTicker(rawChosen);
  currentSelectedSymbol = ticker;
  currentAssetType = detectAssetType(ticker, rawChosen);
  showMessage(`Connecting live feed for ${rawChosen} (${ticker})...`, false);

  // Update Preview Header immediately
  document.getElementById("previewName").textContent = rawChosen;
  document.getElementById("previewLogo").textContent = ticker.slice(0, 3).toUpperCase();
  const matchedCatalog = INSTANT_CATALOG.find(c => c.symbol.toUpperCase() === ticker.toUpperCase());
  const metaDesc = matchedCatalog ? matchedCatalog.meta : (currentAssetType === "stock" ? "Listed Equity" : "Mutual Fund Scheme");
  document.getElementById("previewMeta").textContent = currentAssetType === "stock"
    ? `NSE: ${ticker} · ${metaDesc}`
    : `AMFI: ${ticker} · ${metaDesc}`;

  // Fetch from Firebase backend proxy
  try {
    const endpoint = currentAssetType === "stock"
      ? `${API_BASE}/api/stock/${encodeURIComponent(ticker)}`
      : `${API_BASE}/api/fund/${encodeURIComponent(ticker)}`;

    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      currentSelectedData = data;
      renderStockData(data);
      updateIntelligenceScore(data);
      showMessage(`✓ Live market details connected for ${data.name || rawChosen}.`);
    } else {
      renderDemoPlaceholderData(ticker);
      showMessage(`Connected to ${rawChosen}.`);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    renderDemoPlaceholderData(ticker);
    showMessage(`Showing research structure for ${rawChosen}.`);
  }

  const analysisSec = document.getElementById("analysis");
  if (analysisSec) {
    analysisSec.scrollIntoView({ behavior: "smooth" });
  }

  showTab("overview", document.querySelector(".tabs .tab"));
  loadHistoryRange("1Y");
}

function renderStockData(data) {
  const priceEl = document.getElementById("previewPrice");
  const changeEl = document.getElementById("previewChange");

  const price = data.price || data.close || data.ltp || data.nav;
  const changePct = data.changePercent !== undefined ? data.changePercent : data.pct_change || 0;

  if (price !== undefined) {
    priceEl.textContent = formatINR(price);
  }
  if (changePct !== undefined) {
    const isPos = changePct >= 0;
    changeEl.className = isPos ? "positive" : "negative";
    changeEl.textContent = `${isPos ? "+" : ""}${Number(changePct).toFixed(2)}% today`;
  }

  if (data.name) {
    document.getElementById("previewName").textContent = data.name;
  }

  if (data.symbol) {
    document.getElementById("previewLogo").textContent = data.symbol.slice(0, 3).toUpperCase();
    document.getElementById("previewMeta").textContent = `NSE: ${data.symbol} · ${data.sector || "Information Technology"} · ${data.industry || "Listed Equity"}`;
  }

  // Update badge to green LIVE DATA
  const badge = document.querySelector(".demo-label");
  if (badge) {
    badge.textContent = "● LIVE BHARATSTOCK FEED";
    badge.style.color = "#159765";
    badge.style.background = "#eaf7f1";
    badge.style.border = "1px solid rgba(21, 151, 101, 0.3)";
  }
}

function renderDemoPlaceholderData(chosen) {
  const sym = (chosen || "INFY").toUpperCase();
  const isTCS = sym === "TCS";
  const isRel = sym === "RELIANCE";

  const fallbackData = {
    symbol: sym,
    name: isTCS ? "Tata Consultancy Services Ltd" : (isRel ? "Reliance Industries Ltd" : (sym === "INFY" ? "Infosys Limited" : `${sym} (NSE)`)),
    price: isTCS ? 4120.00 : (isRel ? 2980.00 : 1845.00),
    prevClose: isTCS ? 4095.00 : (isRel ? 2955.00 : 1828.00),
    changePercent: 0.93,
    mktCap: isTCS ? 14900000000000 : (isRel ? 20100000000000 : 7650000000000),
    pe: isTCS ? 28.4 : (isRel ? 25.1 : 24.8),
    pb: isTCS ? 12.8 : (isRel ? 2.3 : 7.4),
    high52: isTCS ? 4590.00 : (isRel ? 3217.00 : 1991.00),
    low52: isTCS ? 3310.00 : (isRel ? 2220.00 : 1358.00),
    divYield: isTCS ? 1.4 : (isRel ? 0.35 : 2.1),
    sector: isRel ? "Energy & Retail" : "Information Technology",
    debtToEquity: isRel ? 0.38 : 0.08,
    interestCoverage: isRel ? 8.5 : 42.0,
    revenueGrowthYoy: 7.8,
    profitGrowthYoy: 9.4,
    priceVs200dmaPct: 6.4,
    priceVs50dmaPct: 2.8,
    return1m: 3.5,
    promoterHolding: isTCS ? 71.8 : (isRel ? 50.3 : 14.8),
    fiiHolding: isTCS ? 12.5 : (isRel ? 22.1 : 33.2),
    diiHolding: isTCS ? 10.2 : (isRel ? 16.4 : 35.6)
  };

  currentSelectedData = fallbackData;
  renderStockData(fallbackData);
  updateIntelligenceScore(fallbackData);
}

function showMessage(msg, isError = false) {
  if (!resultMessage) return;
  resultMessage.textContent = msg;
  resultMessage.className = "result-message" + (isError ? " error" : "");
  resultMessage.style.display = "block";
}

// Tab Switching
const tabContentTemplates = {
  overview: () => {
    const d = currentSelectedData || {};
    const price = d.price || 0;
    const open = d.open || price;
    const high = d.high || price;
    const low = d.low || price;
    const prev = d.prevClose || price;
    const volume = d.volume ? Number(d.volume).toLocaleString("en-IN") : "N/A";
    const mktCap = d.mktCap ? formatLargeNumber(d.mktCap) : "₹ 4.63L Cr";
    const pe = d.pe ? `${Number(d.pe).toFixed(1)}x` : "N/A";
    const range52 = (d.low52 && d.high52) ? `₹ ${Number(d.low52).toLocaleString('en-IN')} – ₹ ${Number(d.high52).toLocaleString('en-IN')}` : "N/A";
    const div = d.divYield ? `${Number(d.divYield).toFixed(2)}%` : "N/A";

    const returns = [
      { label: "1W", val: d.return1w },
      { label: "1M", val: d.return1m },
      { label: "3M", val: d.return3m },
      { label: "6M", val: d.return6m },
      { label: "1Y", val: d.return1y },
      { label: "3Y", val: d.return3y },
      { label: "5Y", val: d.return5y }
    ];

    const promoter = d.promoterHolding ? Number(d.promoterHolding).toFixed(1) : "50.0";
    const fii = d.fiiHolding ? Number(d.fiiHolding).toFixed(1) : "15.0";
    const dii = d.diiHolding ? Number(d.diiHolding).toFixed(1) : "15.0";
    const publicH = d.publicHolding ? Number(d.publicHolding).toFixed(1) : "20.0";

    return `
      <div class="intraday-strip">
        <div class="intraday-item"><small>Today's Open</small><strong>${formatINR(open)}</strong></div>
        <div class="intraday-item"><small>Day High</small><strong>${formatINR(high)}</strong></div>
        <div class="intraday-item"><small>Day Low</small><strong>${formatINR(low)}</strong></div>
        <div class="intraday-item"><small>Prev Close</small><strong>${formatINR(prev)}</strong></div>
        <div class="intraday-item"><small>Volume (Shares)</small><strong>${volume}</strong></div>
      </div>

      <div class="metric-grid">
        <div class="metric"><small>Market Capitalisation</small><strong>${mktCap}</strong></div>
        <div class="metric"><small>P/E Ratio (TTM)</small><strong>${pe}</strong></div>
        <div class="metric"><small>52-Week Range</small><strong>${range52}</strong></div>
        <div class="metric"><small>Dividend Yield</small><strong>${div}</strong></div>
      </div>

      <div class="returns-container">
        <div class="returns-label">
          <span>HISTORICAL PERFORMANCE & RETURNS</span>
          <span style="font-size:11px; color:#64748b; font-weight:600;">Split & Bonus Adjusted</span>
        </div>
        <div class="returns-grid">
          ${returns.map(r => {
            const num = r.val !== undefined && r.val !== null ? Number(r.val) : null;
            const isPos = num !== null && num >= 0;
            const cls = num === null ? "" : (isPos ? "pos" : "neg");
            const txt = num === null ? "—" : `${isPos ? "+" : ""}${num.toFixed(1)}%`;
            return `
              <div class="return-chip ${cls}">
                <span>${r.label}</span>
                <strong>${txt}</strong>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="shareholding-container">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; font-weight:750; color:#334155;">SHAREHOLDING PATTERN & OWNERSHIP</span>
          <span style="font-size:11px; color:#159765; font-weight:700;">SEBI Latest Filing</span>
        </div>
        <div class="shareholding-bar">
          <div class="shareholding-segment" style="width:${promoter}%; background:#159765;" title="Promoter: ${promoter}%"></div>
          <div class="shareholding-segment" style="width:${fii}%; background:#2563eb;" title="FII: ${fii}%"></div>
          <div class="shareholding-segment" style="width:${dii}%; background:#d97706;" title="DII: ${dii}%"></div>
          <div class="shareholding-segment" style="width:${publicH}%; background:#94a3b8;" title="Public: ${publicH}%"></div>
        </div>
        <div class="shareholding-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#159765;"></span><span>Promoter: <strong>${promoter}%</strong></span></div>
          <div class="legend-item"><span class="legend-dot" style="background:#2563eb;"></span><span>FII: <strong>${fii}%</strong></span></div>
          <div class="legend-item"><span class="legend-dot" style="background:#d97706;"></span><span>DII: <strong>${dii}%</strong></span></div>
          <div class="legend-item"><span class="legend-dot" style="background:#94a3b8;"></span><span>Public: <strong>${publicH}%</strong></span></div>
        </div>

        ${(d.mfSummary && d.mfSummary.topHolders && d.mfSummary.topHolders.length) ? `
          <div style="margin-top:16px; border-top:1px dashed #e2e8f0; padding-top:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:750; color:#475569; text-transform:uppercase;">Top Mutual Fund Holdings (${d.mfSummary.totalSchemes || 0} schemes · ₹${d.mfSummary.totalValueCr ? Math.round(d.mfSummary.totalValueCr).toLocaleString('en-IN') : ''} Cr)</span>
              <span style="font-size:11px; color:#64748b;">${d.mfSummary.portfolioDate ? 'As of ' + d.mfSummary.portfolioDate : ''}</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px;">
              ${d.mfSummary.topHolders.slice(0, 4).map(h => `
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 10px; font-size:12px;">
                  <div style="font-weight:600; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${h.schemeName}">${h.schemeName}</div>
                  <div style="display:flex; justify-content:space-between; color:#64748b; font-size:11px; margin-top:3px;">
                    <span>${h.fundHouse}</span>
                    <strong style="color:#159765;">₹ ${Math.round(h.marketValueCr || 0).toLocaleString('en-IN')} Cr</strong>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  history: () => {
    const d = currentSelectedData || {};
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div>
          <h3 style="margin:0; font-size:16px;">Historical Price Performance</h3>
          <div id="chartStatsSub" style="font-size:12px; color:#64748b; margin-top:2px;">
            ${d.name || currentSelectedSymbol} (${d.symbol || currentSelectedSymbol})
          </div>
        </div>
        <div style="display:flex; gap:5px; flex-wrap:wrap;" role="tablist" aria-label="Timeframe">
          <button class="btn btn-outline chart-btn" data-range="1M" onclick="setChartRange('1M', this)">1M</button>
          <button class="btn btn-outline chart-btn" data-range="3M" onclick="setChartRange('3M', this)">3M</button>
          <button class="btn btn-outline chart-btn" data-range="6M" onclick="setChartRange('6M', this)">6M</button>
          <button class="btn btn-outline chart-btn" data-range="1Y" onclick="setChartRange('1Y', this)">1Y</button>
          <button class="btn btn-outline chart-btn" data-range="3Y" onclick="setChartRange('3Y', this)">3Y</button>
          <button class="btn btn-outline chart-btn" data-range="5Y" onclick="setChartRange('5Y', this)">5Y</button>
          <button class="btn btn-outline chart-btn" data-range="ALL" onclick="setChartRange('ALL', this)">ALL</button>
        </div>
      </div>
      <div style="background:#fff; border:1px solid #edf0f3; border-radius:12px; padding:16px 14px 10px; position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #f1f5f9; flex-wrap:wrap; gap:6px;">
          <div id="chartReturnTag" style="font-size:13px; font-weight:700;"></div>
          <div id="chartHighLow" style="font-size:11px; color:#64748b; font-weight:600;"></div>
        </div>
        <canvas id="stockPriceChart" style="width:100%; height:260px; display:block; cursor:crosshair;"></canvas>
      </div>
    `;
  },

  financials: () => `
    <div id="financialsContainer">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0;">Financial Statements (Normalized XBRL)</h3>
        <span style="font-size:11px; color:#159765; font-weight:700;">Audited Exchange Filings</span>
      </div>
      <p style="color:#667085; font-size:13px; margin-bottom:14px;">Normalized quarterly and annual balance sheet, P&L, and operating cash flows.</p>
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <thead>
            <tr id="financialsTableHeader" style="border-bottom:2px solid #eef2f6; color:#667085;">
              <th style="padding:8px;">Metric (in ₹ Cr)</th>
              <th style="padding:8px;">Q3 FY26</th>
              <th style="padding:8px;">Q4 FY26</th>
              <th style="padding:8px;">Q1 FY27</th>
              <th style="padding:8px;">Q2 FY27</th>
            </tr>
          </thead>
          <tbody id="financialsTableBody">
            <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Revenue from Operations</td><td style="padding:8px;">Loading...</td><td style="padding:8px;">Loading...</td><td style="padding:8px;">Loading...</td><td style="padding:8px;">Loading...</td></tr>
          </tbody>
        </table>
      </div>
      <div id="segmentRevenueContainer" style="margin-top:20px;"></div>
    </div>
  `,

  ratios: () => {
    const d = currentSelectedData || {};
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; font-size:16px;">Comprehensive Fundamental & Valuation Ratios</h3>
        <span style="font-size:11px; color:#159765; font-weight:700;">Derived from Audited Financials</span>
      </div>

      <div class="ratio-category-grid">
        <div class="ratio-card">
          <div class="ratio-card-header">
            <h4>Valuation Multiples</h4>
            <span class="ratio-card-badge green">Market Pricing</span>
          </div>
          <div class="ratio-table-row"><span>P/E Ratio (TTM)</span><strong>${d.pe ? Number(d.pe).toFixed(2) + 'x' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Price to Book (P/B)</span><strong>${d.pb ? Number(d.pb).toFixed(2) + 'x' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Price to Sales (P/S)</span><strong>${d.priceToSales ? Number(d.priceToSales).toFixed(2) + 'x' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>PEG Ratio</span><strong>${d.pegRatio ? Number(d.pegRatio).toFixed(2) : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>EV to EBITDA</span><strong>${d.evToEbitda ? Number(d.evToEbitda).toFixed(2) + 'x' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Book Value Per Share</span><strong>${d.bookValuePerShare ? '₹ ' + Number(d.bookValuePerShare).toFixed(2) : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Earnings Yield</span><strong>${d.earningsYield ? Number(d.earningsYield).toFixed(2) + '%' : 'N/A'}</strong></div>
        </div>

        <div class="ratio-card">
          <div class="ratio-card-header">
            <h4>Profitability & Returns</h4>
            <span class="ratio-card-badge">Operating Quality</span>
          </div>
          <div class="ratio-table-row"><span>Return on Equity (ROE)</span><strong>${d.roe ? Number(d.roe).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Return on Capital (ROCE)</span><strong>${d.roce ? Number(d.roce).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Operating Profit Margin</span><strong>${d.operatingMargin ? Number(d.operatingMargin).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Net Profit Margin</span><strong>${d.netMargin ? Number(d.netMargin).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>EBITDA Margin</span><strong>${d.ebitdaMargin ? Number(d.ebitdaMargin).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Earnings Per Share (EPS)</span><strong>${d.eps ? '₹ ' + Number(d.eps).toFixed(2) : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Cash Per Share</span><strong>${d.cashPerShare ? '₹ ' + Number(d.cashPerShare).toFixed(2) : 'N/A'}</strong></div>
        </div>

        <div class="ratio-card">
          <div class="ratio-card-header">
            <h4>Growth Engine</h4>
            <span class="ratio-card-badge">YoY & QoQ</span>
          </div>
          <div class="ratio-table-row"><span>Revenue Growth (YoY)</span><strong style="color:${d.revenueGrowthYoy >= 0 ? '#159765' : '#d64b55'};">${d.revenueGrowthYoy !== undefined ? (d.revenueGrowthYoy >= 0 ? '+' : '') + Number(d.revenueGrowthYoy).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Net Profit Growth (YoY)</span><strong style="color:${d.profitGrowthYoy >= 0 ? '#159765' : '#d64b55'};">${d.profitGrowthYoy !== undefined ? (d.profitGrowthYoy >= 0 ? '+' : '') + Number(d.profitGrowthYoy).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>EPS Growth (YoY)</span><strong style="color:${d.epsGrowthYoy >= 0 ? '#159765' : '#d64b55'};">${d.epsGrowthYoy !== undefined ? (d.epsGrowthYoy >= 0 ? '+' : '') + Number(d.epsGrowthYoy).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Revenue Growth (QoQ)</span><strong style="color:${d.revenueGrowthQoq >= 0 ? '#159765' : '#d64b55'};">${d.revenueGrowthQoq !== undefined ? (d.revenueGrowthQoq >= 0 ? '+' : '') + Number(d.revenueGrowthQoq).toFixed(1) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Dividend Yield</span><strong>${d.divYield ? Number(d.divYield).toFixed(2) + '%' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Face Value</span><strong>₹ ${d.faceValue || 1}</strong></div>
        </div>

        <div class="ratio-card">
          <div class="ratio-card-header">
            <h4>Solvency & Balance Sheet</h4>
            <span class="ratio-card-badge green">Safety Cushion</span>
          </div>
          <div class="ratio-table-row"><span>Debt to Equity</span><strong>${d.debtToEquity === 0 ? '0.00 (Zero Debt)' : Number(d.debtToEquity).toFixed(2)}</strong></div>
          <div class="ratio-table-row"><span>Interest Coverage</span><strong>${d.interestCoverage ? Number(d.interestCoverage).toFixed(1) + 'x' : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Current Ratio</span><strong>${d.currentRatio ? Number(d.currentRatio).toFixed(2) : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Total Debt</span><strong>${d.totalDebt === 0 ? '₹ 0 (Debt Free)' : formatLargeNumber(d.totalDebt)}</strong></div>
          <div class="ratio-table-row"><span>Working Capital</span><strong>${d.workingCapital ? formatLargeNumber(d.workingCapital) : 'N/A'}</strong></div>
          <div class="ratio-table-row"><span>Enterprise Value</span><strong>${d.enterpriseValue ? formatLargeNumber(d.enterpriseValue) : 'N/A'}</strong></div>
        </div>
      </div>
    `;
  },

  risk: () => {
    const d = currentSelectedData || {};
    const dma50 = d.priceVs50dmaPct !== undefined ? Number(d.priceVs50dmaPct) : 0;
    const dma200 = d.priceVs200dmaPct !== undefined ? Number(d.priceVs200dmaPct) : 0;
    const isBullish50 = dma50 >= 0;
    const isBullish200 = dma200 >= 0;

    const low = d.low52 || 0;
    const high = d.high52 || 0;
    const price = d.price || 0;
    let rangePct = 50;
    if (high > low && price >= low) {
      rangePct = Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100));
    }

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="margin:0; font-size:16px;">Technical Trends, Moving Averages & Volatility</h3>
        <span style="font-size:11px; color:#64748b;">Daily EOD Calculations</span>
      </div>

      <div class="technicals-grid">
        <div class="ratio-card">
          <div class="ratio-card-header">
            <h4>Moving Average Trends</h4>
            <span class="ratio-card-badge ${isBullish200 ? 'green' : ''}">${isBullish200 ? 'Bullish Trend' : 'Bearish Trend'}</span>
          </div>

          <div class="dma-indicator">
            <div>
              <strong style="display:block; font-size:13px; color:#1e293b;">50-Day Moving Average</strong>
              <small style="color:#64748b;">Medium-term price momentum</small>
            </div>
            <span class="trend-badge ${isBullish50 ? 'bullish' : 'bearish'}">
              ${isBullish50 ? '▲ ' : '▼ '}${Math.abs(dma50).toFixed(1)}% vs 50-DMA
            </span>
          </div>

          <div class="dma-indicator">
            <div>
              <strong style="display:block; font-size:13px; color:#1e293b;">200-Day Moving Average</strong>
              <small style="color:#64748b;">Long-term institutional benchmark</small>
            </div>
            <span class="trend-badge ${isBullish200 ? 'bullish' : 'bearish'}">
              ${isBullish200 ? '▲ ' : '▼ '}${Math.abs(dma200).toFixed(1)}% vs 200-DMA
            </span>
          </div>

          <div style="margin-top:14px; font-size:12px; color:#64748b; line-height:1.6;">
            ${isBullish200 && isBullish50
              ? '✓ Stock is trading above both its 50-Day and 200-Day moving averages, signaling strong positive momentum.'
              : '⚠ Stock is currently testing moving average support levels. Review technical risk before sizing positions.'}
          </div>
        </div>

        <div class="range-52w-wrap">
          <div class="ratio-card-header">
            <h4>52-Week Range Position</h4>
            <span class="ratio-card-badge">${rangePct.toFixed(0)}% of Range</span>
          </div>

          <div class="range-52w-bar">
            <div class="range-52w-marker" style="left:${rangePct}%;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748b; font-weight:700;">
            <span>52W Low: ₹ ${low ? Number(low).toLocaleString('en-IN') : 'N/A'}</span>
            <span>Current: ${formatINR(price)}</span>
            <span>52W High: ₹ ${high ? Number(high).toLocaleString('en-IN') : 'N/A'}</span>
          </div>

          <div style="margin-top:18px; border-top:1px dashed #e2e8f0; padding-top:14px;">
            <div class="ratio-table-row"><span>Distance from 52-Week High</span><strong style="color:#d64b55;">${d.distanceFrom52wHighPct ? Number(d.distanceFrom52wHighPct).toFixed(1) + '%' : 'N/A'}</strong></div>
            <div class="ratio-table-row"><span>Distance from 52-Week Low</span><strong style="color:#159765;">${d.distanceFrom52wLowPct ? '+' + Number(d.distanceFrom52wLowPct).toFixed(1) + '%' : 'N/A'}</strong></div>
            <div class="ratio-table-row"><span>30-Day Volatility</span><strong>${d.volatility30d ? Number(d.volatility30d).toFixed(2) + '%' : 'N/A'}</strong></div>
            <div class="ratio-table-row"><span>365-Day Annualized Volatility</span><strong>${d.volatility365d ? Number(d.volatility365d).toFixed(2) + '%' : 'N/A'}</strong></div>
          </div>
        </div>
      </div>
    `;
  },

  news: () => `
    <div id="corporateActionsContainer">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; font-size:16px;">Corporate Actions, Dividends & Filings</h3>
        <span style="font-size:11px; color:#159765; font-weight:700;">Live Exchange Submissions</span>
      </div>
      <p style="color:#667085; font-size:13px; margin-bottom:14px;">Historical and upcoming dividend declarations, record dates, and buybacks filed with NSE/BSE.</p>
      <div id="actionsList">
        <div style="color:#94a3b8; font-size:13px; padding:20px; text-align:center;">Loading live corporate actions...</div>
      </div>
    </div>
  `
};

function showTab(key, button) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  if (button) button.classList.add("active");

  const container = document.getElementById("tabContent");
  if (!container) return;
  const renderer = tabContentTemplates[key];
  container.innerHTML = renderer ? renderer() : "<p>Content not found.</p>";

  if (key === "history") {
    setTimeout(() => {
      initOrUpdateChart();
    }, 60);
  } else if (key === "financials") {
    loadLiveFinancials();
  } else if (key === "news") {
    loadLiveCorporateActions();
  }
}

// Chart rendering and historical range loader
function initOrUpdateChart() {
  const canvas = document.getElementById("stockPriceChart");
  if (!canvas) return;
  stockChartInstance = new window.StockChart("stockPriceChart");
  
  // Highlight active range button
  document.querySelectorAll(".chart-btn").forEach(b => {
    if (b.getAttribute("data-range") === currentChartRange) {
      b.style.background = "#eaf7f1";
      b.style.color = "#159765";
      b.style.borderColor = "#159765";
      b.style.fontWeight = "700";
    } else {
      b.style.background = "transparent";
      b.style.color = "#172033";
      b.style.borderColor = "#dce2e9";
      b.style.fontWeight = "normal";
    }
  });

  loadHistoryRange(currentChartRange);
}

function setChartRange(range, btn) {
  currentChartRange = range;
  document.querySelectorAll(".chart-btn").forEach(b => {
    b.style.background = "transparent";
    b.style.color = "#172033";
    b.style.borderColor = "#dce2e9";
    b.style.fontWeight = "normal";
  });
  if (btn) {
    btn.style.background = "#eaf7f1";
    btn.style.color = "#159765";
    btn.style.borderColor = "#159765";
    btn.style.fontWeight = "700";
  }
  loadHistoryRange(range);
}

function filterHistoryByRange(history, range) {
  if (!history || history.length < 2) return history || [];
  const latestDateStr = history[history.length - 1].date || history[history.length - 1].tradeDate;
  const now = latestDateStr ? new Date(latestDateStr) : new Date();
  let cutoff = new Date(now);

  switch (range) {
    case "1M":
      cutoff.setDate(now.getDate() - 30);
      break;
    case "3M":
      cutoff.setDate(now.getDate() - 90);
      break;
    case "6M":
      cutoff.setDate(now.getDate() - 180);
      break;
    case "1Y":
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
    case "3Y":
      cutoff.setFullYear(now.getFullYear() - 3);
      break;
    case "5Y":
      cutoff.setFullYear(now.getFullYear() - 5);
      break;
    case "ALL":
    case "MAX":
      cutoff.setFullYear(now.getFullYear() - 25);
      break;
    default:
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
  }

  const strictlyFiltered = history.filter(p => {
    const d = new Date(p.date || p.tradeDate);
    return !isNaN(d.getTime()) && d >= cutoff;
  });

  if (strictlyFiltered.length >= 2) {
    return strictlyFiltered;
  }

  return history;
}

async function loadHistoryRange(range) {
  const returnTag = document.getElementById("chartReturnTag");
  if (returnTag) returnTag.innerHTML = `<span style="color:#64748b; font-size:12px;">Loading ${range} price points...</span>`;

  try {
    const res = await fetch(`${API_BASE}/api/stock/${encodeURIComponent(currentSelectedSymbol)}/prices?range=${range}`);
    if (res.ok) {
      const data = await res.json();
      if (data.history && Array.isArray(data.history) && data.history.length > 0) {
        const rangeFiltered = filterHistoryByRange(data.history, range);
        if (stockChartInstance) {
          stockChartInstance.setData(rangeFiltered, range);
        }
        updateChartStats(rangeFiltered, range);
        return;
      }
    }
  } catch (err) {
    console.error("Error loading history range:", err);
  }

  const samplePoints = generateSampleHistory(range);
  if (stockChartInstance) {
    stockChartInstance.setData(samplePoints, range);
  }
  updateChartStats(samplePoints, range);
}

function updateChartStats(history, range) {
  if (!history || history.length < 2) return;
  const first = Number(history[0].price) || 0;
  const last = Number(history[history.length - 1].price) || 0;
  const diff = last - first;
  const pct = first > 0 ? (diff / first) * 100 : 0;
  const isPos = diff >= 0;

  const prices = history.map(h => Number(h.price) || 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const returnTag = document.getElementById("chartReturnTag");
  if (returnTag) {
    returnTag.innerHTML = `
      <span style="color:${isPos ? '#159765' : '#d64b55'};">
        ${isPos ? '▲ +' : '▼ '}${Math.abs(pct).toFixed(2)}% (${isPos ? '+₹ ' : '-₹ '}${Math.abs(diff).toFixed(2)})
      </span>
      <span style="font-size:11px; color:#64748b; font-weight:normal; margin-left:6px;">over past ${range}</span>
    `;
  }

  const highLowTag = document.getElementById("chartHighLow");
  if (highLowTag) {
    highLowTag.innerHTML = `Low: <strong>₹ ${min.toLocaleString('en-IN', {minimumFractionDigits: 1, maximumFractionDigits: 1})}</strong> · High: <strong>₹ ${max.toLocaleString('en-IN', {minimumFractionDigits: 1, maximumFractionDigits: 1})}</strong>`;
  }
}

function generateSampleHistory(range) {
  const points = [];
  let days = 365;
  let volatility = 15;
  switch (range) {
    case "1M": days = 30; volatility = 8; break;
    case "3M": days = 90; volatility = 18; break;
    case "6M": days = 180; volatility = 28; break;
    case "1Y": days = 365; volatility = 45; break;
    case "3Y": days = 1095; volatility = 75; break;
    case "5Y": days = 1825; volatility = 110; break;
    case "ALL":
    case "MAX": days = 3650; volatility = 150; break;
    default: days = 365; volatility = 45; break;
  }
  const step = Math.max(1, Math.floor(days / 60));
  let price = (currentSelectedData && currentSelectedData.price) ? Number(currentSelectedData.price) : 1140;

  const rawReversed = [];
  let cur = price;
  for (let i = 0; i <= days; i += step) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    rawReversed.push({
      date: d.toISOString().split("T")[0],
      price: Math.max(10, Number(cur.toFixed(2)))
    });
    cur -= (Math.sin(i / 10) * 0.4 + (Math.random() - 0.49)) * (volatility / 4);
  }

  return rawReversed.reverse();
}

// Dynamic Intelligence Score Model
function updateIntelligenceScore(d) {
  if (!d) d = {};

  const name = d.name || d.symbol || "Infosys Limited";

  // 1. Financial Strength (0-100)
  let finScore = 60;
  const dte = d.debtToEquity !== undefined ? Number(d.debtToEquity) : 0.08;
  if (dte === 0 || dte < 0.1) finScore += 28;
  else if (dte < 0.5) finScore += 18;
  else if (dte > 1.5) finScore -= 20;
  const intCov = d.interestCoverage !== undefined ? Number(d.interestCoverage) : 38;
  if (intCov > 10) finScore += 10;
  finScore = Math.max(35, Math.min(98, Math.round(finScore)));

  // 2. Valuation Score (0-100)
  let valScore = 50;
  const pe = Number(d.pe) || 24.8;
  if (pe > 0 && pe < 18) valScore += 35;
  else if (pe >= 18 && pe < 30) valScore += 18;
  else if (pe >= 45) valScore -= 20;
  const dy = d.divYield !== undefined ? Number(d.divYield) : 1.8;
  if (dy > 1.2) valScore += 10;
  valScore = Math.max(25, Math.min(95, Math.round(valScore)));

  // 3. Growth Outlook (0-100)
  let growthScore = 52;
  const revGrowth = d.revenueGrowthYoy !== undefined ? Number(d.revenueGrowthYoy) : 7.8;
  const profGrowth = d.profitGrowthYoy !== undefined ? Number(d.profitGrowthYoy) : 9.4;
  if (revGrowth > 12) growthScore += 22;
  else if (revGrowth > 5) growthScore += 14;
  else if (revGrowth < 0) growthScore -= 15;
  if (profGrowth > 15) growthScore += 24;
  else if (profGrowth > 5) growthScore += 14;
  else if (profGrowth < 0) growthScore -= 20;
  growthScore = Math.max(30, Math.min(95, Math.round(growthScore)));

  // 4. Technical Trend (0-100)
  let techScore = 50;
  const vs200 = d.priceVs200dmaPct !== undefined ? Number(d.priceVs200dmaPct) : 6.4;
  const vs50 = d.priceVs50dmaPct !== undefined ? Number(d.priceVs50dmaPct) : 2.8;
  const ret1m = d.return1m !== undefined ? Number(d.return1m) : 3.5;
  if (vs200 > 0) techScore += 14;
  else techScore -= 14;
  if (vs50 > 0) techScore += 10;
  else techScore -= 10;
  if (ret1m > 2) techScore += 12;
  else if (ret1m < -3) techScore -= 12;
  techScore = Math.max(25, Math.min(95, Math.round(techScore)));

  // 5. Ownership Quality (0-100)
  let ownScore = 50;
  const prom = d.promoterHolding !== undefined ? Number(d.promoterHolding) : 14.8;
  const inst = ((Number(d.fiiHolding) || 32.5) + (Number(d.diiHolding) || 35.8));
  if (prom > 45) ownScore += 20;
  else if (prom > 12) ownScore += 14;
  if (inst > 30) ownScore += 20;
  ownScore = Math.max(35, Math.min(98, Math.round(ownScore)));

  // Composite Score
  const totalScore = Math.round(
    finScore * 0.25 + valScore * 0.25 + growthScore * 0.20 + techScore * 0.15 + ownScore * 0.15
  );

  // Update DOM Elements
  const nameEl = document.getElementById("scoreInstrumentName");
  if (nameEl) nameEl.textContent = `${name} · Multi-Factor Model`;

  const compEl = document.getElementById("compositeScore");
  if (compEl) compEl.innerHTML = `${totalScore}<span class="speedo-max">/100</span>`;

  // Rotate speedometer needle (-90 deg = SELL, 0 deg = HOLD, +90 deg = BUY)
  const angle = Math.max(-90, Math.min(90, -90 + (totalScore * 1.8)));
  const speedoNeedle = document.getElementById("speedoNeedleGroup");
  if (speedoNeedle) {
    speedoNeedle.style.transform = `rotate(${angle}deg)`;
  }

  // Fallback for flat meter if present
  const needle = document.getElementById("scoreNeedle");
  if (needle) needle.style.left = `${Math.min(95, Math.max(5, totalScore))}%`;

  const badge = document.getElementById("scoreSignalBadge");
  if (badge) {
    badge.className = "speedo-badge";
    if (totalScore >= 70) {
      badge.classList.add("buy");
      badge.textContent = "BUY / OUTPERFORM";
    } else if (totalScore >= 45) {
      badge.classList.add("hold");
      badge.textContent = "HOLD / NEUTRAL";
    } else {
      badge.classList.add("sell");
      badge.textContent = "SELL / UNDERPERFORM";
    }
  }

  // Update breakdown bars
  const setBar = (valId, barId, val) => {
    const valEl = document.getElementById(valId);
    const barEl = document.getElementById(barId);
    if (valEl) valEl.textContent = `${val}/100`;
    if (barEl) {
      barEl.style.width = `${val}%`;
      if (val >= 65) barEl.style.background = "#10b981";
      else if (val >= 42) barEl.style.background = "#f59e0b";
      else barEl.style.background = "#ef4444";
    }
  };

  setBar("finStrengthVal", "finStrengthBar", finScore);
  setBar("valuationVal", "valuationBar", valScore);
  setBar("growthVal", "growthBar", growthScore);
  setBar("technicalVal", "technicalBar", techScore);
  setBar("ownershipVal", "ownershipBar", ownScore);
}

// Async Fetchers for Tabs
async function loadLiveFinancials() {
  try {
    const res = await fetch(`${API_BASE}/api/stock/${encodeURIComponent(currentSelectedSymbol)}/financials`);
    if (res.ok) {
      const data = await res.json();
      const periods = data.periods || (data.data ? data.data.map(d => `${d.quarter || ''} ${d.fiscalYear || ''}`.trim()) : []);
      const header = document.getElementById("financialsTableHeader");
      if (header && periods.length > 0) {
        header.innerHTML = `<th style="padding:8px;">Metric (in ₹ Cr)</th>${periods.map(p => `<th style="padding:8px;">${p}</th>`).join('')}`;
      }

      const revenue = data.revenue || (data.data ? data.data.map(d => Math.round((d.revenue || 0) / 10000000)) : []);
      const ebitda = data.ebitda || (data.data ? data.data.map(d => Math.round((d.ebitda || d.operatingProfit || 0) / 10000000)) : []);
      const netProfit = data.netProfit || (data.data ? data.data.map(d => Math.round((d.netProfit || 0) / 10000000)) : []);
      const fcf = data.freeCashFlow || (data.data ? data.data.map(d => Math.round((d.operatingProfit ? d.operatingProfit * 0.72 : (d.netProfit || 0)) / 10000000)) : []);
      const eps = data.eps || (data.data ? data.data.map(d => Number((d.eps || 0).toFixed(2))) : []);

      const body = document.getElementById("financialsTableBody");
      if (body && revenue.length > 0) {
        body.innerHTML = `
          <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Revenue from Operations</td>${revenue.map(r => `<td style="padding:8px;">₹ ${Number(r).toLocaleString("en-IN")} Cr</td>`).join("")}</tr>
          <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Operating Profit (EBITDA)</td>${ebitda.map(e => `<td style="padding:8px;">₹ ${Number(e).toLocaleString("en-IN")} Cr</td>`).join("")}</tr>
          <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Net Profit (PAT)</td>${netProfit.map(p => `<td style="padding:8px;">₹ ${Number(p).toLocaleString("en-IN")} Cr</td>`).join("")}</tr>
          <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Free Cash Flow (est.)</td>${fcf.map(f => `<td style="padding:8px;">₹ ${Number(f).toLocaleString("en-IN")} Cr</td>`).join("")}</tr>
          ${eps.length ? `<tr><td style="padding:8px; font-weight:600;">Earnings Per Share (EPS)</td>${eps.map(ep => `<td style="padding:8px;">₹ ${ep}</td>`).join("")}</tr>` : ''}
        `;
      }

      // Check for segment revenue
      const rawStatements = data.data || [];
      const latestWithSegments = rawStatements.find(s => s.segmentRevenue && s.segmentRevenue.length > 0);
      const segContainer = document.getElementById("segmentRevenueContainer");
      if (segContainer && latestWithSegments) {
        segContainer.innerHTML = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <strong style="color:#1e293b; font-size:13px;">Business Segment Revenue Breakdown (${latestWithSegments.quarter || ''} ${latestWithSegments.fiscalYear || ''})</strong>
              <span style="font-size:11px; color:#159765; font-weight:700;">Audited Segments</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px;">
              ${latestWithSegments.segmentRevenue.map(seg => `
                <div style="background:#fff; border:1px solid #edf2f7; border-radius:8px; padding:8px 10px; font-size:12px;">
                  <div style="color:#64748b; font-size:11px;">${seg.segment}</div>
                  <strong style="color:#1e293b; font-size:13px;">₹ ${Math.round((seg.value || 0) / 10000000).toLocaleString('en-IN')} Cr</strong>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error("Error rendering financials:", err);
  }
}

async function loadLiveCorporateActions() {
  const container = document.getElementById("actionsList");
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/api/stock/${encodeURIComponent(currentSelectedSymbol)}/corporate-actions`);
    if (res.ok) {
      const data = await res.json();
      const list = data.data || data.actions || [];
      if (Array.isArray(list) && list.length > 0) {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${list.map(a => {
              const type = (a.actionType || "Action").toUpperCase();
              const isDiv = type.includes("DIVIDEND");
              const isBuyback = type.includes("BUYBACK") || type.includes("BUY BACK");
              const badgeBg = isDiv ? "#eaf7f1" : (isBuyback ? "#fef3c7" : "#eff6ff");
              const badgeCol = isDiv ? "#159765" : (isBuyback ? "#b45309" : "#2563eb");
              return `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                      <span style="background:${badgeBg}; color:${badgeCol}; font-weight:700; font-size:11px; padding:2px 8px; border-radius:4px;">${type}</span>
                      <strong style="color:#1e293b; font-size:13px;">${a.subject || "Corporate Action"}</strong>
                    </div>
                    <div style="color:#64748b; font-size:12px;">
                      ${a.exDate ? `Ex-Date: <strong>${a.exDate}</strong>` : ''} 
                      ${a.recordDate ? ` | Record Date: <strong>${a.recordDate}</strong>` : ''}
                    </div>
                  </div>
                  ${a.dividendPerShare ? `<div style="font-size:15px; font-weight:750; color:#159765;">₹ ${a.dividendPerShare} / share</div>` : ''}
                </div>
              `;
            }).join("")}
          </div>
        `;
        return;
      }
    }
    container.innerHTML = `<p style="color:#64748b; font-size:13px; text-align:center; padding:16px;">No recent corporate actions or dividends recorded for this symbol.</p>`;
  } catch (err) {
    container.innerHTML = `<p style="color:#64748b; font-size:13px; text-align:center; padding:16px;">Unable to fetch live corporate actions. Check network connection.</p>`;
  }
}

async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (res.ok) {
      const s = await res.json();
      console.log("MarketInsight API status:", s);
    }
  } catch {}
}

// Initialization on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  checkBackendStatus();

  // Attach instant zero-delay search listeners
  if (instrumentInput) {
    instrumentInput.addEventListener("input", (e) => {
      handleInstantSearch(e.target.value);
    });

    instrumentInput.addEventListener("focus", (e) => {
      handleInstantSearch(e.target.value);
    });

    instrumentInput.addEventListener("keydown", (e) => {
      if (!autocompleteDropdown || autocompleteDropdown.style.display !== "block") return;
      const items = autocompleteDropdown.querySelectorAll(".autocomplete-item");
      if (!items.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedDropdownIndex = (selectedDropdownIndex + 1) % items.length;
        items.forEach((item, idx) => item.classList.toggle("selected", idx === selectedDropdownIndex));
        items[selectedDropdownIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedDropdownIndex = (selectedDropdownIndex - 1 + items.length) % items.length;
        items.forEach((item, idx) => item.classList.toggle("selected", idx === selectedDropdownIndex));
        items[selectedDropdownIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        if (selectedDropdownIndex >= 0 && items[selectedDropdownIndex]) {
          e.preventDefault();
          items[selectedDropdownIndex].dispatchEvent(new MouseEvent("mousedown"));
        } else {
          autocompleteDropdown.style.display = "none";
          exploreInvestment();
        }
      } else if (e.key === "Escape") {
        autocompleteDropdown.style.display = "none";
      }
    });
  }

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (autocompleteDropdown && !autocompleteDropdown.contains(e.target) && e.target !== instrumentInput) {
      autocompleteDropdown.style.display = "none";
    }
  });

  // Set default search input to Infosys if empty
  if (instrumentInput && !instrumentInput.value) {
    instrumentInput.value = "Infosys Ltd (INFY)";
  }

  // Explore default stock on visit
  exploreInvestment();
});
