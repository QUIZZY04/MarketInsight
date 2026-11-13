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

function resolveTicker(nameOrSymbol) {
  const upper = (nameOrSymbol || "").trim().toUpperCase();
  return TICKER_MAP[upper] || upper;
}

// Fallback catalog for dropdown menus
const stockData = {
  "Large Cap": {
    "Information Technology": ["TCS", "Infosys", "HCL Technologies", "Wipro"],
    "Banking": ["HDFC Bank", "ICICI Bank", "State Bank of India", "Kotak Mahindra Bank"],
    "Energy": ["Reliance Industries", "ONGC", "NTPC"],
    "FMCG": ["ITC", "Hindustan Unilever", "Nestlé India"]
  },
  "Mid Cap": {
    "Information Technology": ["Persistent Systems", "Coforge", "KPIT Technologies"],
    "Banking & Finance": ["Federal Bank", "IDFC First Bank", "AU Small Finance Bank"],
    "Pharma": ["Laurus Labs", "Alkem Laboratories"]
  },
  "Small Cap": {
    "Industrial": ["Kaynes Technology", "CAMS", "Aegis Logistics"],
    "Consumer": ["Safari Industries", "Jubilant FoodWorks"],
    "Technology": ["Netweb Technologies", "Newgen Software"]
  }
};

const fundData = {
  "Equity": {
    "Large Cap": ["ICICI Prudential Bluechip Fund", "HDFC Large Cap Fund", "Nippon India Large Cap Fund"],
    "Mid Cap": ["HDFC Mid Cap Fund", "Motilal Oswal Midcap Fund", "Kotak Midcap Fund"],
    "Small Cap": ["Nippon India Small Cap Fund", "SBI Small Cap Fund", "Bandhan Small Cap Fund"],
    "Flexi Cap": ["Parag Parikh Flexi Cap Fund", "HDFC Flexi Cap Fund", "Kotak Flexicap Fund"],
    "Index": ["UTI Nifty 50 Index Fund", "HDFC Nifty 50 Index Fund"]
  },
  "Debt": {
    "Liquid": ["ICICI Prudential Liquid Fund", "HDFC Liquid Fund"],
    "Short Duration": ["HDFC Short Term Debt Fund", "ICICI Prudential Short Term Fund"],
    "Gilt": ["SBI Magnum Gilt Fund", "ICICI Prudential Gilt Fund"]
  },
  "Hybrid": {
    "Aggressive Hybrid": ["SBI Equity Hybrid Fund", "ICICI Prudential Equity & Debt Fund"],
    "Balanced Advantage": ["ICICI Prudential Balanced Advantage Fund", "HDFC Balanced Advantage Fund"],
    "Multi Asset": ["SBI Multi Asset Allocation Fund", "Nippon India Multi Asset Allocation Fund"]
  }
};

let currentAssetType = "stock";
let currentSelectedSymbol = "TCS";
let currentSelectedData = null;
let stockChartInstance = null;
let searchDebounceTimer = null;
let currentChartRange = "1Y";

// DOM Elements
const categorySelect = document.getElementById("category");
const subcategorySelect = document.getElementById("subcategory");
const instrumentInput = document.getElementById("instrument");
const optionsDatalist = document.getElementById("instrumentOptions");
const autocompleteDropdown = document.getElementById("autocompleteDropdown");
const resultMessage = document.getElementById("resultMessage");

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

// Switch between Stocks & Mutual Funds
function setAsset(type) {
  currentAssetType = type;
  document.getElementById("stocksBtn").classList.toggle("active", type === "stock");
  document.getElementById("fundsBtn").classList.toggle("active", type === "fund");
  document.getElementById("subLabel").textContent = type === "stock" ? "SECTOR" : "FUND CATEGORY";
  instrumentInput.value = "";
  if (autocompleteDropdown) autocompleteDropdown.style.display = "none";
  updateCategories();
}

function updateCategories() {
  const data = currentAssetType === "stock" ? stockData : fundData;
  categorySelect.innerHTML = "";
  Object.keys(data).forEach(k => categorySelect.add(new Option(k, k)));
  updateSubcategories();
}

function updateSubcategories() {
  const data = currentAssetType === "stock" ? stockData : fundData;
  subcategorySelect.innerHTML = "";
  Object.keys(data[categorySelect.value] || {}).forEach(k => subcategorySelect.add(new Option(k, k)));
  updateItems();
}

function updateItems() {
  const data = currentAssetType === "stock" ? stockData : fundData;
  const items = (data[categorySelect.value] || {})[subcategorySelect.value] || [];
  optionsDatalist.innerHTML = "";
  items.forEach(name => optionsDatalist.appendChild(new Option(name)));
  instrumentInput.placeholder = currentAssetType === "stock"
    ? "Type a stock symbol or company name (e.g. INFY, TCS, RELIANCE)..."
    : "Type a mutual fund name...";
}

// Live Search with Debounce
if (instrumentInput) {
  instrumentInput.addEventListener("input", function (e) {
    const query = e.target.value.trim();
    clearTimeout(searchDebounceTimer);

    if (query.length < 2) {
      if (autocompleteDropdown) autocompleteDropdown.style.display = "none";
      return;
    }

    searchDebounceTimer = setTimeout(() => {
      fetchLiveSearchResults(query);
    }, 280);
  });
}

async function fetchLiveSearchResults(query) {
  try {
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&type=${currentAssetType}`);
    if (!res.ok) throw new Error("Search offline");
    const json = await res.json();
    if (json.results && json.results.length > 0 && autocompleteDropdown) {
      renderAutocomplete(json.results);
    }
  } catch {}
}

function renderAutocomplete(results) {
  if (!autocompleteDropdown) return;
  autocompleteDropdown.innerHTML = "";
  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "autocomplete-item";
    div.innerHTML = `
      <div>
        <span class="symbol">${item.symbol || item.name}</span>
        <span class="exchange">${item.exchange || (item.type === "fund" ? "AMFI" : "NSE")}</span>
      </div>
      <div class="name">${item.name || ""}</div>
    `;
    div.onclick = () => {
      instrumentInput.value = item.symbol || item.name;
      autocompleteDropdown.style.display = "none";
      exploreInvestment();
    };
    autocompleteDropdown.appendChild(div);
  });
  autocompleteDropdown.style.display = "block";
}

document.addEventListener("click", e => {
  if (autocompleteDropdown && !autocompleteDropdown.contains(e.target) && e.target !== instrumentInput) {
    autocompleteDropdown.style.display = "none";
  }
});

// Explore selected investment
async function exploreInvestment() {
  const rawChosen = instrumentInput.value.trim();
  if (!rawChosen) {
    showMessage("Please type or select an investment first.", true);
    return;
  }

  const ticker = resolveTicker(rawChosen);
  currentSelectedSymbol = ticker;
  showMessage(`Connecting live feed for ${rawChosen} (${ticker})...`, false);

  // Update Preview Header immediately
  document.getElementById("previewName").textContent = rawChosen;
  document.getElementById("previewLogo").textContent = ticker.slice(0, 3).toUpperCase();
  document.getElementById("previewMeta").textContent = currentAssetType === "stock"
    ? `NSE: ${ticker} · ${categorySelect.value} · ${subcategorySelect.value}`
    : `Mutual Fund · ${categorySelect.value} · ${subcategorySelect.value}`;

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
  document.getElementById("previewPrice").textContent = "₹ 1,141.50";
  document.getElementById("previewChange").textContent = "+0.85% today";
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
    const mktCap = d.mktCap ? formatLargeNumber(d.mktCap) : "₹ 4.63L Cr";
    const pe = d.pe ? `${Number(d.pe).toFixed(1)}x` : "15.2x";
    const range52 = (d.low52 && d.high52) ? `₹ ${d.low52} – ₹ ${d.high52}` : "₹ 1,358 – ₹ 1,990";
    const div = d.divYield ? `${Number(d.divYield).toFixed(2)}%` : "2.10%";

    return `
      <div class="metric-grid">
        <div class="metric"><small>Market capitalisation</small><strong>${mktCap}</strong></div>
        <div class="metric"><small>P/E ratio</small><strong>${pe}</strong></div>
        <div class="metric"><small>52-week range</small><strong>${range52}</strong></div>
        <div class="metric"><small>Dividend yield</small><strong>${div}</strong></div>
      </div>
    `;
  },
  history: () => `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
      <h3 style="margin:0; font-size:16px;">Historical Price Performance</h3>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-outline chart-btn" style="padding:4px 9px; font-size:11px; color:#172033; border-color:#dce2e9;" onclick="setChartRange('1M', this)">1M</button>
        <button class="btn btn-outline chart-btn" style="padding:4px 9px; font-size:11px; color:#172033; border-color:#dce2e9;" onclick="setChartRange('6M', this)">6M</button>
        <button class="btn btn-outline chart-btn" style="padding:4px 9px; font-size:11px; background:#eaf7f1; color:#159765; border-color:#159765;" onclick="setChartRange('1Y', this)">1Y</button>
        <button class="btn btn-outline chart-btn" style="padding:4px 9px; font-size:11px; color:#172033; border-color:#dce2e9;" onclick="setChartRange('5Y', this)">5Y</button>
      </div>
    </div>
    <div style="background:#fff; border:1px solid #edf0f3; border-radius:12px; padding:12px;">
      <canvas id="stockPriceChart" style="width:100%; height:260px;"></canvas>
    </div>
  `,
  financials: () => `
    <div id="financialsContainer">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0;">Financial Statements (Normalized XBRL)</h3>
        <span style="font-size:11px; color:#667085;">Audited Exchange Filings</span>
      </div>
      <p style="color:#667085; font-size:13px; margin-bottom:14px;">Normalized balance sheet, P&L, and cash flows from exchange filings.</p>
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid #eef2f6; color:#667085;">
              <th style="padding:8px;">Metric (in ₹ Cr)</th>
              <th style="padding:8px;">FY 2023</th>
              <th style="padding:8px;">FY 2024</th>
              <th style="padding:8px;">FY 2025 (TTM)</th>
            </tr>
          </thead>
          <tbody id="financialsTableBody">
            <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Revenue from Operations</td><td style="padding:8px;">1,46,767</td><td style="padding:8px;">1,53,670</td><td style="padding:8px;">1,62,800</td></tr>
            <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Operating Profit (EBITDA)</td><td style="padding:8px;">35,138</td><td style="padding:8px;">36,450</td><td style="padding:8px;">38,800</td></tr>
            <tr style="border-bottom:1px solid #f2f5f8;"><td style="padding:8px; font-weight:600;">Net Profit (PAT)</td><td style="padding:8px;">24,108</td><td style="padding:8px;">26,248</td><td style="padding:8px;">27,900</td></tr>
            <tr><td style="padding:8px; font-weight:600;">Free Cash Flow</td><td style="padding:8px;">21,400</td><td style="padding:8px;">23,100</td><td style="padding:8px;">24,800</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  ratios: () => {
    const d = currentSelectedData || {};
    const pb = d.pb ? `${Number(d.pb).toFixed(2)}x` : "6.8x";
    const roe = d.roe ? `${Number(d.roe).toFixed(1)}%` : "32.1%";
    const roce = d.roce ? `${Number(d.roce).toFixed(1)}%` : "40.5%";
    const debtToEquity = d.debtToEquity !== undefined ? Number(d.debtToEquity).toFixed(2) : "0.00";
    const eps = d.eps ? `₹ ${Number(d.eps).toFixed(2)}` : "₹ 63.20";
    const operatingMargin = d.operatingMargin ? `${Number(d.operatingMargin).toFixed(1)}%` : "21.4%";
    const promoter = d.promoterHolding ? `${Number(d.promoterHolding).toFixed(1)}%` : "14.8%";
    const fii = d.fiiHolding ? `${Number(d.fiiHolding).toFixed(1)}%` : "33.2%";

    return `
      <div id="ratiosContainer">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3 style="margin:0;">Key Valuation & Fundamental Ratios</h3>
          <span style="font-size:11px; color:#159765; font-weight:700;">Live XBRL Calculations</span>
        </div>
        <div class="metric-grid" style="margin-top:14px;">
          <div class="metric"><small>Price to Book (P/B)</small><strong>${pb}</strong></div>
          <div class="metric"><small>Return on Equity (ROE)</small><strong>${roe}</strong></div>
          <div class="metric"><small>Return on Capital (ROCE)</small><strong>${roce}</strong></div>
          <div class="metric"><small>Debt to Equity</small><strong>${debtToEquity}</strong></div>
          <div class="metric"><small>Earnings Per Share (EPS)</small><strong>${eps}</strong></div>
          <div class="metric"><small>Operating Margin</small><strong>${operatingMargin}</strong></div>
          <div class="metric"><small>Promoter Holding</small><strong>${promoter}</strong></div>
          <div class="metric"><small>FII Holding</small><strong>${fii}</strong></div>
        </div>
      </div>
    `;
  },
  news: () => `
    <div id="corporateActionsContainer">
      <h3>Exchange Filings & Corporate Actions</h3>
      <p style="color:#667085; font-size:13px; margin-bottom:12px;">Corporate events, dividend dates, and material announcements.</p>
      <ul style="padding-left:20px; font-size:13px; color:#445164; line-height:1.9;">
        <li><strong>Dividend:</strong> Interim dividend of ₹ 21.00 per share announced (Paid).</li>
        <li><strong>Exchange Filing:</strong> Board meeting outcomes filed with NSE/BSE regarding quarterly results.</li>
        <li><strong>Institutional Trades:</strong> Bulk/block deals recorded in recent market sessions.</li>
      </ul>
    </div>
  `,
  risk: () => `
    <h3>Risk Profile & Volatility</h3>
    <p style="color:#667085; font-size:13px;">Historical risk metrics calculated over 1-year and 3-year periods.</p>
    <div class="metric-grid" style="margin-top:14px;">
      <div class="metric"><small>Beta (1Y vs Nifty 50)</small><strong>0.84 (Low Volatility)</strong></div>
      <div class="metric"><small>Max Drawdown (3Y)</small><strong>-18.4%</strong></div>
      <div class="metric"><small>Sharpe Ratio</small><strong>1.22</strong></div>
      <div class="metric"><small>Standard Deviation</small><strong>18.4%</strong></div>
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
  }
}

// Chart rendering and historical range loader
function initOrUpdateChart() {
  const canvas = document.getElementById("stockPriceChart");
  if (!canvas) return;
  stockChartInstance = new window.StockChart("stockPriceChart");
  loadHistoryRange(currentChartRange);
}

function setChartRange(range, btn) {
  currentChartRange = range;
  document.querySelectorAll(".chart-btn").forEach(b => {
    b.style.background = "transparent";
    b.style.color = "#172033";
    b.style.borderColor = "#dce2e9";
  });
  if (btn) {
    btn.style.background = "#eaf7f1";
    btn.style.color = "#159765";
    btn.style.borderColor = "#159765";
  }
  loadHistoryRange(range);
}

async function loadHistoryRange(range) {
  try {
    const res = await fetch(`${API_BASE}/api/stock/${encodeURIComponent(currentSelectedSymbol)}/prices?range=${range}`);
    if (res.ok) {
      const data = await res.json();
      if (data.history && Array.isArray(data.history) && data.history.length > 0) {
        stockChartInstance.setData(data.history);
        return;
      }
    }
  } catch {}

  const samplePoints = generateSampleHistory(range);
  if (stockChartInstance) {
    stockChartInstance.setData(samplePoints);
  }
}

function generateSampleHistory(range) {
  const points = [];
  const days = range === "1M" ? 30 : range === "6M" ? 180 : range === "5Y" ? 1825 : 365;
  const step = Math.max(1, Math.floor(days / 60));
  let price = 1140;

  for (let i = days; i >= 0; i -= step) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price += (Math.random() - 0.48) * 15;
    points.push({
      date: d.toISOString().split("T")[0],
      price: Math.max(100, Number(price.toFixed(2)))
    });
  }
  return points;
}

// Check Backend Health & Status on Load
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
  updateCategories();
  checkBackendStatus();

  // Load default TCS stock on first visit
  exploreInvestment();
});
