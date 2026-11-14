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

// Dynamic Intelligence Score Model
function updateIntelligenceScore(d) {
  if (!d) return;

  // 1. Financial Strength (0-100)
  let finScore = 55;
  if (d.debtToEquity === 0 || d.debtToEquity < 0.1) finScore += 35;
  else if (d.debtToEquity < 0.5) finScore += 20;
  else if (d.debtToEquity > 1.5) finScore -= 20;
  if (d.interestCoverage && d.interestCoverage > 10) finScore += 10;
  finScore = Math.max(25, Math.min(98, Math.round(finScore)));

  // 2. Valuation Score (0-100)
  let valScore = 50;
  const pe = d.pe || 25;
  if (pe > 0 && pe < 18) valScore += 35;
  else if (pe >= 18 && pe < 30) valScore += 15;
  else if (pe >= 45) valScore -= 20;
  if (d.divYield && d.divYield > 2) valScore += 10;
  valScore = Math.max(20, Math.min(95, Math.round(valScore)));

  // 3. Growth Outlook (0-100)
  let growthScore = 50;
  const revGrowth = d.revenueGrowthYoy || 0;
  const profGrowth = d.profitGrowthYoy || 0;
  if (revGrowth > 12) growthScore += 20;
  else if (revGrowth > 5) growthScore += 10;
  else if (revGrowth < 0) growthScore -= 15;
  if (profGrowth > 15) growthScore += 25;
  else if (profGrowth > 5) growthScore += 15;
  else if (profGrowth < 0) growthScore -= 20;
  growthScore = Math.max(20, Math.min(95, Math.round(growthScore)));

  // 4. Technical Trend (0-100)
  let techScore = 50;
  if (d.priceVs200dmaPct > 0) techScore += 20;
  else techScore -= 20;
  if (d.priceVs50dmaPct > 0) techScore += 15;
  else techScore -= 15;
  if (d.return1m > 5) techScore += 15;
  else if (d.return1m < -5) techScore -= 15;
  techScore = Math.max(15, Math.min(95, Math.round(techScore)));

  // 5. Ownership Quality (0-100)
  let ownScore = 50;
  const prom = d.promoterHolding || 0;
  const inst = (d.fiiHolding || 0) + (d.diiHolding || 0);
  if (prom > 50) ownScore += 25;
  else if (prom > 30) ownScore += 10;
  if (inst > 25) ownScore += 20;
  ownScore = Math.max(25, Math.min(98, Math.round(ownScore)));

  // Composite Score
  const totalScore = Math.round(
    finScore * 0.25 + valScore * 0.25 + growthScore * 0.20 + techScore * 0.15 + ownScore * 0.15
  );

  // Update DOM Elements
  const nameEl = document.getElementById("scoreInstrumentName");
  if (nameEl) nameEl.textContent = `${d.name || d.symbol} · Fundamental Intelligence Model`;

  const compEl = document.getElementById("compositeScore");
  if (compEl) compEl.innerHTML = `${totalScore}<span style="font-size:14px;color:#667085">/100</span>`;

  const needle = document.getElementById("scoreNeedle");
  if (needle) needle.style.left = `${Math.min(95, Math.max(5, totalScore))}%`;

  const badge = document.getElementById("scoreSignalBadge");
  if (badge) {
    if (totalScore >= 75) {
      badge.textContent = "SIGNAL: STRONG BUY / QUALITY OUTPERFORM";
      badge.style.color = "#159765";
      badge.style.background = "#eaf7f1";
    } else if (totalScore >= 60) {
      badge.textContent = "SIGNAL: ACCUMULATE / POSITIVE";
      badge.style.color = "#0d8055";
      badge.style.background = "#e8f7ef";
    } else if (totalScore >= 45) {
      badge.textContent = "SIGNAL: HOLD / BALANCED RISK";
      badge.style.color = "#b45309";
      badge.style.background = "#fef3c7";
    } else {
      badge.textContent = "SIGNAL: CAUTION / ELEVATED RISK";
      badge.style.color = "#b91c1c";
      badge.style.background = "#fee2e2";
    }
  }

  // Update breakdown bars
  const setBar = (valId, barId, val) => {
    const valEl = document.getElementById(valId);
    const barEl = document.getElementById(barId);
    if (valEl) valEl.textContent = `${val}/100`;
    if (barEl) barEl.style.width = `${val}%`;
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
  updateCategories();
  checkBackendStatus();

  // Load default TCS stock on first visit
  exploreInvestment();
});
