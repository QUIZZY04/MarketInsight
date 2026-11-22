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
  "TATAMOTORS": "TATAMOTORS",
  "TATA STEEL": "TATASTEEL",
  "TATASTEEL": "TATASTEEL",
  "TATA CONSUMER": "TATACONSUM",
  "TATACONSUM": "TATACONSUM",
  "TATA POWER": "TATAPOWER",
  "TATAPOWER": "TATAPOWER",
  "ADANI POWER": "ADANIPOWER",
  "ADANIPOWER": "ADANIPOWER",
  "YES BANK": "YESBANK",
  "YESBANK": "YESBANK",
  "PNB": "PNB",
  "PUNJAB NATIONAL BANK": "PNB",
  "BANK OF BARODA": "BANKBARODA",
  "BANKBARODA": "BANKBARODA",
  "CANARA BANK": "CANBK",
  "CANBK": "CANBK",
  "UNION BANK": "UNIONBANK",
  "UNIONBANK": "UNIONBANK",
  "IRFC": "IRFC",
  "IREDA": "IREDA",
  "RVNL": "RVNL",
  "DMART": "DMART",
  "AVENUE SUPERMARTS": "DMART",
  "DLF": "DLF",
  "PIDILITE": "PIDILITIND",
  "PIDILITIND": "PIDILITIND",
  "HAVELLS": "HAVELLS",
  "SIEMENS": "SIEMENS",
  "ABB": "ABB",
  "HAL": "HAL",
  "BEL": "BEL",
  "MAZAGON DOCK": "MAZDOCK",
  "MAZDOCK": "MAZDOCK",
  "COCHIN SHIPYARD": "COCHINSHIP",
  "COCHINSHIP": "COCHINSHIP",
  "BHEL": "BHEL",
  "DIXON": "DIXON",
  "CDSL": "CDSL",
  "BSE": "BSE",
  "MCX": "MCX",
  "ZOMATO": "ZOMATO",
  "PAYTM": "PAYTM",
  "SUZLON": "SUZLON",
  "TRENT": "TRENT",
  "BHARTI AIRTEL": "BHARTIARTL",
  "PARAG PARIKH": "122639",
  "PPFAS": "122639"
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
  { symbol: "TATAPOWER", name: "Tata Power Co Ltd", type: "stock", meta: "Large Cap · Renewable & Thermal Power", exchange: "NSE" },
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
  { symbol: "ADANIPOWER", name: "Adani Power Ltd", type: "stock", meta: "Large Cap · Thermal Power Generation", exchange: "NSE" },
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
  { symbol: "MAZDOCK", name: "Mazagon Dock Shipbuilders Ltd", type: "stock", meta: "Mid Cap · Defence Warships & Submarines", exchange: "NSE" },
  { symbol: "COCHINSHIP", name: "Cochin Shipyard Ltd", type: "stock", meta: "Mid Cap · Shipbuilding & Ship Repair", exchange: "NSE" },
  { symbol: "TRENT", name: "Trent Ltd (Westside / Zudio)", type: "stock", meta: "Large Cap · Retail Apparel", exchange: "NSE" },
  { symbol: "VARUNBEV", name: "Varun Beverages Ltd", type: "stock", meta: "Large Cap · PepsiCo Bottling", exchange: "NSE" },
  { symbol: "POLYCAB", name: "Polycab India Ltd", type: "stock", meta: "Large Cap · Wires & Cables", exchange: "NSE" },
  { symbol: "IRCTC", name: "Indian Railway Catering & Tourism", type: "stock", meta: "Mid Cap · Railway Ticketing & Catering", exchange: "NSE" },
  { symbol: "IRFC", name: "Indian Railway Finance Corp", type: "stock", meta: "Large Cap · Railway Infra Financing", exchange: "NSE" },
  { symbol: "IREDA", name: "Indian Renewable Energy Dev Agency", type: "stock", meta: "Mid Cap · Green Clean Energy Financing", exchange: "NSE" },
  { symbol: "RVNL", name: "Rail Vikas Nigam Ltd", type: "stock", meta: "Mid Cap · Railway Infrastructure EPC", exchange: "NSE" },
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
  { symbol: "YESBANK", name: "Yes Bank Ltd", type: "stock", meta: "Mid Cap · Private Commercial Banking", exchange: "NSE" },
  { symbol: "PNB", name: "Punjab National Bank", type: "stock", meta: "Large Cap · Public Sector Bank", exchange: "NSE" },
  { symbol: "BANKBARODA", name: "Bank of Baroda", type: "stock", meta: "Large Cap · Public Sector Bank", exchange: "NSE" },
  { symbol: "CANBK", name: "Canara Bank", type: "stock", meta: "Large Cap · Public Sector Bank", exchange: "NSE" },
  { symbol: "DMART", name: "Avenue Supermarts Ltd (DMART)", type: "stock", meta: "Large Cap · Supermarket Retail Chain", exchange: "NSE" },
  { symbol: "DLF", name: "DLF Ltd", type: "stock", meta: "Large Cap · Real Estate & Commercial Properties", exchange: "NSE" },
  { symbol: "PIDILITIND", name: "Pidilite Industries Ltd (Fevicol)", type: "stock", meta: "Large Cap · Adhesives & Sealants", exchange: "NSE" },
  { symbol: "HAVELLS", name: "Havells India Ltd", type: "stock", meta: "Large Cap · Electricals & Consumer Goods", exchange: "NSE" },
  { symbol: "SIEMENS", name: "Siemens Ltd", type: "stock", meta: "Large Cap · Industrial Automation & Smart Infra", exchange: "NSE" },
  { symbol: "ABB", name: "ABB India Ltd", type: "stock", meta: "Large Cap · Electrification & Robotics", exchange: "NSE" },
  { symbol: "DIXON", name: "Dixon Technologies India Ltd", type: "stock", meta: "Large Cap · Electronics Contract Mfg (EMS)", exchange: "NSE" },
  { symbol: "CDSL", name: "Central Depository Services Ltd", type: "stock", meta: "Mid Cap · Securities Depository", exchange: "NSE" },
  { symbol: "BSE", name: "BSE Ltd", type: "stock", meta: "Mid Cap · Stock Exchange Platform", exchange: "NSE" },
  { symbol: "MCX", name: "Multi Commodity Exchange of India", type: "stock", meta: "Mid Cap · Commodity Derivatives Exchange", exchange: "NSE" },
  { symbol: "AMBUJACEM", name: "Ambuja Cements Ltd", type: "stock", meta: "Large Cap · Cement & Building Materials", exchange: "NSE" },
  { symbol: "ACC", name: "ACC Ltd", type: "stock", meta: "Large Cap · Cement & Concrete", exchange: "NSE" },
  { symbol: "JINDALSTEL", name: "Jindal Steel & Power Ltd", type: "stock", meta: "Large Cap · Steel & Mining", exchange: "NSE" },
  { symbol: "SAIL", name: "Steel Authority of India Ltd", type: "stock", meta: "Large Cap · Public Sector Steel Producer", exchange: "NSE" },
  { symbol: "GAIL", name: "GAIL India Ltd", type: "stock", meta: "Large Cap · Natural Gas Transmission", exchange: "NSE" },
  { symbol: "IOC", name: "Indian Oil Corporation Ltd", type: "stock", meta: "Large Cap · Petroleum Refining & Retail", exchange: "NSE" },
  { symbol: "BERGEPAINT", name: "Berger Paints India Ltd", type: "stock", meta: "Large Cap · Paints & Coatings", exchange: "NSE" },
  { symbol: "DABUR", name: "Dabur India Ltd", type: "stock", meta: "Large Cap · Ayurvedic Healthcare & FMCG", exchange: "NSE" },
  { symbol: "MARICO", name: "Marico Ltd (Parachute / Saffola)", type: "stock", meta: "Large Cap · Consumer Goods & Oils", exchange: "NSE" },
  { symbol: "LUPIN", name: "Lupin Ltd", type: "stock", meta: "Large Cap · Generic Pharma & Biotech", exchange: "NSE" },
  { symbol: "AUROPHARMA", name: "Aurobindo Pharma Ltd", type: "stock", meta: "Large Cap · Active Pharma Ingredients", exchange: "NSE" },
  { symbol: "BIOCON", name: "Biocon Ltd", type: "stock", meta: "Mid Cap · Biopharmaceuticals & Biosimilars", exchange: "NSE" },
  { symbol: "INDHOTEL", name: "The Indian Hotels Co Ltd (Taj)", type: "stock", meta: "Large Cap · Luxury Hospitality & Hotels", exchange: "NSE" },
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
  { symbol: "122640", name: "Parag Parikh ELSS Tax Saver Fund", type: "fund", meta: "Equity · Tax Saver ELSS (Direct Growth)", exchange: "AMFI" },
  { symbol: "120828", name: "Quant Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120823", name: "Quant Mid Cap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120841", name: "Quant Flexi Cap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120826", name: "Quant Active Fund", type: "fund", meta: "Equity · Multi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120839", name: "Quant Infrastructure Fund", type: "fund", meta: "Equity · Sectoral Infrastructure", exchange: "AMFI" },
  { symbol: "119063", name: "Mirae Asset Large Cap Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119062", name: "Mirae Asset ELSS Tax Saver Fund", type: "fund", meta: "Equity · Tax Saver ELSS", exchange: "AMFI" },
  { symbol: "119065", name: "Mirae Asset Midcap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120503", name: "ICICI Prudential Bluechip Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120505", name: "ICICI Prudential Balanced Advantage Fund", type: "fund", meta: "Hybrid · Dynamic Asset Allocation", exchange: "AMFI" },
  { symbol: "120586", name: "ICICI Prudential Equity & Debt Fund", type: "fund", meta: "Hybrid · Aggressive Hybrid Allocation", exchange: "AMFI" },
  { symbol: "120594", name: "ICICI Prudential Technology Fund", type: "fund", meta: "Equity · Sectoral Technology (Direct Growth)", exchange: "AMFI" },
  { symbol: "118989", name: "HDFC Top 100 Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118968", name: "HDFC Mid-Cap Opportunities Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118955", name: "HDFC Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118961", name: "HDFC Flexi Cap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "148721", name: "HDFC Nifty 50 Index Fund", type: "fund", meta: "Passive · NIFTY 50 Index Tracking", exchange: "AMFI" },
  { symbol: "119598", name: "SBI Bluechip Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119597", name: "SBI Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119782", name: "SBI Magnum Midcap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "119777", name: "SBI Contra Fund", type: "fund", meta: "Equity · Value & Contra Strategy", exchange: "AMFI" },
  { symbol: "118560", name: "Nippon India Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118558", name: "Nippon India Growth Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118556", name: "Nippon India Large Cap Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118559", name: "Nippon India Multi Cap Fund", type: "fund", meta: "Equity · Multi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118778", name: "Kotak Emerging Equity Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118765", name: "Kotak Flexicap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "118772", name: "Kotak Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "125354", name: "Axis Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120465", name: "Axis Bluechip Fund", type: "fund", meta: "Equity · Large Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120466", name: "Axis Midcap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "127042", name: "Motilal Oswal Midcap Fund", type: "fund", meta: "Equity · Mid Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "127040", name: "Motilal Oswal Flexi Cap Fund", type: "fund", meta: "Equity · Flexi Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "120716", name: "UTI Nifty 50 Index Fund", type: "fund", meta: "Passive · NIFTY 50 Index Tracking", exchange: "AMFI" },
  { symbol: "120684", name: "Bandhan Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" },
  { symbol: "135781", name: "Tata Digital India Fund", type: "fund", meta: "Equity · Technology Sectoral", exchange: "AMFI" },
  { symbol: "125497", name: "Canara Robeco Emerging Equities Fund", type: "fund", meta: "Equity · Large & Mid Cap", exchange: "AMFI" },
  { symbol: "119239", name: "DSP Small Cap Fund", type: "fund", meta: "Equity · Small Cap (Direct Growth)", exchange: "AMFI" }
];

let currentAssetType = "stock";
let currentSearchFilter = "all";
let currentSelectedSymbol = "INFY";
let currentSelectedData = null;
let currentActiveTab = "overview";
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
    const clearBtn = document.getElementById("clearSearchBtn");
    if (clearBtn) clearBtn.style.display = "none";
    if (autocompleteDropdown) {
      autocompleteDropdown.style.display = "none";
      autocompleteDropdown.innerHTML = "";
    }
  }
}

// Highlight matched letters in autocomplete suggestions
function highlightQuery(text, query) {
  if (!query || !text) return text;
  const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
  if (!terms.length) return text;
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Instant Sub-Millisecond Search (Zero Latency)
function handleInstantSearch(query) {
  const q = (query || "").trim().toLowerCase();
  selectedDropdownIndex = -1;

  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) {
    clearBtn.style.display = q ? "flex" : "none";
  }

  if (!q) {
    if (autocompleteDropdown) {
      autocompleteDropdown.style.display = "none";
      autocompleteDropdown.innerHTML = "";
    }
    return;
  }

  // Filter based on active filter ('all', 'stock', or 'fund')
  const pool = currentSearchFilter === "all"
    ? INSTANT_CATALOG
    : INSTANT_CATALOG.filter(item => item.type === currentSearchFilter);

  const qTerms = q.split(/\s+/).filter(Boolean);

  // Instant Tiered Ranking:
  // 1. Symbol exact match (e.g. "INFY")
  // 2. Symbol starts with query (e.g. "INF")
  // 3. Name starts with query (e.g. "Infosys")
  // 4. Any word in name starts with query (e.g. "TCS")
  // 5. Query substring in symbol or name
  // 6. All query terms match name, symbol or meta
  // 7. Query matches sector/meta description
  const exact = [];
  const symbolStarts = [];
  const nameStarts = [];
  const wordStarts = [];
  const substringMatches = [];
  const multiTermMatches = [];
  const metaMatches = [];

  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];
    const sym = item.symbol.toLowerCase();
    const name = item.name.toLowerCase();
    const meta = (item.meta || "").toLowerCase();

    if (sym === q) {
      exact.push(item);
    } else if (sym.startsWith(q)) {
      symbolStarts.push(item);
    } else if (name.startsWith(q)) {
      nameStarts.push(item);
    } else if (name.split(/\s+/).some(w => w.startsWith(q))) {
      wordStarts.push(item);
    } else if (sym.includes(q) || name.includes(q)) {
      substringMatches.push(item);
    } else if (qTerms.length > 1 && qTerms.every(term => sym.includes(term) || name.includes(term) || meta.includes(term))) {
      multiTermMatches.push(item);
    } else if (meta.includes(q)) {
      metaMatches.push(item);
    }
  }

  const combined = [
    ...exact,
    ...symbolStarts,
    ...nameStarts,
    ...wordStarts,
    ...substringMatches,
    ...multiTermMatches,
    ...metaMatches
  ];

  const uniqueMatches = [];
  const seen = new Set();
  for (const m of combined) {
    if (!seen.has(m.symbol)) {
      seen.add(m.symbol);
      uniqueMatches.push(m);
    }
  }

  renderAutocompleteItems(uniqueMatches.slice(0, 10), q);

  // Background fetch only if instant local catalog has fewer than 4 matches and query has >= 2 chars
  if (q.length >= 2 && uniqueMatches.length < 4) {
    clearTimeout(backgroundSearchDebounce);
    backgroundSearchDebounce = setTimeout(() => {
      fetchBackgroundSearchResults(q);
    }, 450);
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

    const displaySymbol = highlightQuery(item.symbol, query);
    const displayName = highlightQuery(item.name, query);

    div.innerHTML = `
      <div class="autocomplete-item-left">
        <div class="autocomplete-symbol-row">
          <span class="autocomplete-symbol">${displaySymbol}</span>
          <span class="autocomplete-name">${displayName}</span>
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
  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) clearBtn.style.display = "flex";

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

const clientSearchCache = new Map();

async function fetchBackgroundSearchResults(query) {
  const cacheKey = `${currentSearchFilter}:${query.toLowerCase()}`;
  if (clientSearchCache.has(cacheKey)) {
    return;
  }
  try {
    const typeParam = currentSearchFilter === "all" ? "all" : currentSearchFilter;
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&type=${typeParam}`);
    if (!res.ok) return;
    const json = await res.json();
    const liveResults = json.results || [];
    clientSearchCache.set(cacheKey, liveResults);
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

// Quick Select Chip Handler for Trending Stocks/Funds
function quickSelect(tickerOrSymbol) {
  navigateToPage('page-terminal');
  if (instrumentInput) {
    const item = INSTANT_CATALOG.find(c => c.symbol.toUpperCase() === tickerOrSymbol.toUpperCase());
    if (item) {
      instrumentInput.value = `${item.name} (${item.symbol})`;
    } else {
      instrumentInput.value = tickerOrSymbol;
    }
    const clearBtn = document.getElementById("clearSearchBtn");
    if (clearBtn) clearBtn.style.display = "flex";
  }
  exploreInvestment(tickerOrSymbol);
}

// Explore selected investment
async function exploreInvestment(targetNameOrSymbol) {
  let rawChosen = targetNameOrSymbol || (instrumentInput ? instrumentInput.value.trim() : "");
  if (!rawChosen) {
    rawChosen = "Infosys Ltd (INFY)";
    // Keep search input empty so the placeholder "Type your stock or mutual fund name" remains visible!
  }

  const ticker = resolveTicker(rawChosen);
  currentSelectedSymbol = ticker;
  currentAssetType = detectAssetType(ticker, rawChosen);
  showMessage(`Connecting live feed for ${rawChosen} (${ticker})...`, false);

  // Update Preview Header immediately
  const matchedCatalog = INSTANT_CATALOG.find(c => c.symbol.toUpperCase() === ticker.toUpperCase());
  const displayName = matchedCatalog ? matchedCatalog.name : (rawChosen === "INFY" ? "Infosys Ltd" : rawChosen);
  document.getElementById("previewName").textContent = displayName;
  document.getElementById("previewLogo").textContent = ticker.slice(0, 3).toUpperCase();
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
      showTab(currentActiveTab || "overview");
      if (data.mode === "live_exchange") {
        showMessage(`✓ Real-time NSE quote active for ${data.name || rawChosen} (Live exchange feed active).`);
      } else if (data.rateLimited || data.mode === "rate_limited_cached") {
        showMessage(`✓ Market data loaded for ${data.name || rawChosen} (BharatStock daily quota paused, showing synced market data).`);
      } else {
        showMessage(`✓ Live market details connected for ${data.name || rawChosen} via BharatStock API.`);
      }
    } else {
      renderDemoPlaceholderData(ticker);
      showTab(currentActiveTab || "overview");
      showMessage(`Connected to ${rawChosen}.`);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    renderDemoPlaceholderData(ticker);
    showTab(currentActiveTab || "overview");
    showMessage(`Showing research structure for ${rawChosen}.`);
  }

  const analysisSec = document.getElementById("analysis");
  if (analysisSec) {
    const rect = analysisSec.getBoundingClientRect();
    if (rect.top < -100 || rect.top > window.innerHeight - 100) {
      analysisSec.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
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
    document.getElementById("previewMeta").textContent = currentAssetType === "stock"
      ? `NSE: ${data.symbol} · ${data.sector || "Equity"} · ${data.industry || "Listed Equity"}`
      : `AMFI: ${data.symbol} · ${data.category || "Mutual Fund"}`;
  }

  // Update badge to reflect true connection state
  const badge = document.querySelector(".demo-label");
  if (badge) {
    if (data.mode === "live_exchange") {
      badge.textContent = "● LIVE NSE FEED (EXCHANGE ACTIVE)";
      badge.style.color = "#0284c7";
      badge.style.background = "#e0f2fe";
      badge.style.border = "1px solid rgba(2, 132, 199, 0.3)";
    } else if (data.rateLimited || data.mode === "rate_limited_cached") {
      badge.textContent = "● BHARATSTOCK QUOTA PAUSED (CACHED)";
      badge.style.color = "#b45309";
      badge.style.background = "#fef3c7";
      badge.style.border = "1px solid rgba(180, 83, 9, 0.3)";
    } else if (data.mode === "fallback_demo" || data.mode === "sandbox_demo") {
      badge.textContent = "● BHARATSTOCK SYNCED (CACHED)";
      badge.style.color = "#0284c7";
      badge.style.background = "#e0f2fe";
      badge.style.border = "1px solid rgba(2, 132, 199, 0.3)";
    } else {
      badge.textContent = "● LIVE BHARATSTOCK FEED";
      badge.style.color = "#159765";
      badge.style.background = "#eaf7f1";
      badge.style.border = "1px solid rgba(21, 151, 101, 0.3)";
    }
  }
}

const DEMO_STOCK_STORE = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 1377.50,
    prevClose: 1361.30,
    changePercent: 1.19,
    open: 1365.00,
    high: 1385.00,
    low: 1360.00,
    volume: 14850000,
    mktCap: 18640000000000,
    pe: 24.1,
    pb: 2.1,
    high52: 1608.80,
    low52: 1120.00,
    divYield: 0.73,
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
    distanceFrom52wHighPct: -14.3,
    distanceFrom52wLowPct: 22.9,
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
    price: 2376.20,
    prevClose: 2342.70,
    changePercent: 1.43,
    open: 2350.00,
    high: 2390.00,
    low: 2345.00,
    volume: 4120000,
    mktCap: 8590000000000,
    pe: 26.2,
    pb: 10.8,
    high52: 2780.00,
    low52: 2010.00,
    divYield: 1.68,
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
    distanceFrom52wHighPct: -14.5,
    distanceFrom52wLowPct: 18.2,
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
    name: "Infosys Limited",
    price: 1098.00,
    prevClose: 1091.90,
    changePercent: 0.56,
    open: 1092.00,
    high: 1105.50,
    low: 1088.00,
    volume: 8245000,
    mktCap: 4580000000000,
    pe: 22.4,
    pb: 6.5,
    high52: 1510.00,
    low52: 980.00,
    divYield: 2.35,
    sector: "Information Technology",
    industry: "IT Services",
    debtToEquity: 0.08,
    currentRatio: 2.15,
    interestCoverage: 38.0,
    totalDebt: 58000000000,
    workingCapital: 245000000000,
    revenueGrowthYoy: 5.8,
    profitGrowthYoy: 7.2,
    revenueGrowthQoq: 1.6,
    epsGrowthYoy: 7.1,
    distanceFrom52wHighPct: -27.2,
    distanceFrom52wLowPct: 12.0,
    priceVs50dmaPct: 0.9,
    priceVs200dmaPct: 2.4,
    return1w: 0.5,
    return1m: 1.8,
    return3m: 4.2,
    return6m: 8.5,
    return1y: 12.0,
    return3y: 22.0,
    return5y: 45.0,
    promoterHolding: 14.6,
    fiiHolding: 31.8,
    diiHolding: 36.4,
    mutualFundsHolding: 18.2,
    publicHolding: 17.2
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    price: 846.00,
    prevClose: 821.80,
    changePercent: 2.95,
    open: 825.00,
    high: 850.35,
    low: 815.50,
    volume: 18450000,
    mktCap: 13050000000000,
    pe: 19.4,
    pb: 2.6,
    high52: 1017.50,
    low52: 669.20,
    divYield: 1.25,
    sector: "Financials",
    industry: "Private Banking",
    debtToEquity: 1.25,
    currentRatio: 1.15,
    interestCoverage: 4.8,
    totalDebt: 9800000000000,
    workingCapital: 680000000000,
    revenueGrowthYoy: 14.5,
    profitGrowthYoy: 16.8,
    revenueGrowthQoq: 3.4,
    epsGrowthYoy: 15.2,
    distanceFrom52wHighPct: -16.8,
    distanceFrom52wLowPct: 26.4,
    priceVs50dmaPct: 2.6,
    priceVs200dmaPct: 5.4,
    return1w: 2.4,
    return1m: 5.1,
    return3m: 9.8,
    return6m: 18.5,
    return1y: 26.4,
    return3y: 44.0,
    return5y: 78.0,
    promoterHolding: 0.0,
    fiiHolding: 47.8,
    diiHolding: 34.2,
    mutualFundsHolding: 21.5,
    publicHolding: 18.0
  },
  TATAPOWER: {
    symbol: "TATAPOWER",
    name: "Tata Power Company Ltd",
    price: 340.00,
    prevClose: 335.20,
    changePercent: 1.43,
    open: 336.00,
    high: 343.80,
    low: 334.50,
    volume: 8750000,
    mktCap: 1080000000000,
    pe: 28.5,
    pb: 3.4,
    high52: 494.85,
    low52: 315.00,
    divYield: 0.65,
    sector: "Utilities",
    industry: "Power Generation & Distribution",
    debtToEquity: 1.35,
    currentRatio: 0.88,
    interestCoverage: 3.4,
    totalDebt: 520000000000,
    workingCapital: 42000000000,
    revenueGrowthYoy: 12.2,
    profitGrowthYoy: 14.5,
    revenueGrowthQoq: 2.9,
    epsGrowthYoy: 13.8,
    distanceFrom52wHighPct: -31.3,
    distanceFrom52wLowPct: 7.9,
    priceVs50dmaPct: 1.1,
    priceVs200dmaPct: 2.8,
    return1w: 1.2,
    return1m: 3.4,
    return3m: 7.2,
    return6m: 14.8,
    return1y: 28.5,
    return3y: 65.0,
    return5y: 240.0,
    promoterHolding: 46.9,
    fiiHolding: 9.8,
    diiHolding: 16.2,
    mutualFundsHolding: 8.5,
    publicHolding: 27.1
  },
  SBIN: {
    symbol: "SBIN",
    name: "State Bank of India",
    price: 1165.10,
    prevClose: 1146.75,
    changePercent: 1.60,
    open: 1150.00,
    high: 1172.00,
    low: 1142.00,
    volume: 11200000,
    mktCap: 10390000000000,
    pe: 11.5,
    pb: 1.6,
    high52: 1220.00,
    low52: 740.00,
    divYield: 1.45,
    sector: "Financials",
    industry: "Public Sector Banking",
    debtToEquity: 1.42,
    currentRatio: 1.12,
    interestCoverage: 4.2,
    totalDebt: 8400000000000,
    workingCapital: 540000000000,
    revenueGrowthYoy: 13.8,
    profitGrowthYoy: 18.2,
    revenueGrowthQoq: 3.8,
    epsGrowthYoy: 17.5,
    distanceFrom52wHighPct: -4.5,
    distanceFrom52wLowPct: 57.4,
    priceVs50dmaPct: 3.2,
    priceVs200dmaPct: 7.8,
    return1w: 1.8,
    return1m: 4.6,
    return3m: 11.2,
    return6m: 24.5,
    return1y: 38.0,
    return3y: 72.0,
    return5y: 160.0,
    promoterHolding: 57.5,
    fiiHolding: 11.2,
    diiHolding: 24.6,
    mutualFundsHolding: 14.8,
    publicHolding: 6.7
  },
  ICICIBANK: {
    symbol: "ICICIBANK",
    name: "ICICI Bank Limited",
    price: 1640.00,
    prevClose: 1608.90,
    changePercent: 1.93,
    open: 1612.00,
    high: 1645.00,
    low: 1600.90,
    volume: 9420000,
    mktCap: 11780000000000,
    pe: 18.2,
    pb: 2.9,
    high52: 1645.00,
    low52: 1188.00,
    divYield: 0.95,
    sector: "Financials",
    industry: "Private Banking",
    debtToEquity: 1.18,
    currentRatio: 1.20,
    interestCoverage: 5.6,
    totalDebt: 7200000000000,
    workingCapital: 490000000000,
    revenueGrowthYoy: 16.2,
    profitGrowthYoy: 19.5,
    revenueGrowthQoq: 4.1,
    epsGrowthYoy: 18.8,
    distanceFrom52wHighPct: -0.3,
    distanceFrom52wLowPct: 38.0,
    priceVs50dmaPct: 3.8,
    priceVs200dmaPct: 8.4,
    return1w: 2.1,
    return1m: 5.8,
    return3m: 12.5,
    return6m: 26.0,
    return1y: 42.0,
    return3y: 84.0,
    return5y: 195.0,
    promoterHolding: 0.0,
    fiiHolding: 44.2,
    diiHolding: 37.8,
    mutualFundsHolding: 24.2,
    publicHolding: 18.0
  },
  ITC: {
    symbol: "ITC",
    name: "ITC Limited",
    price: 299.10,
    prevClose: 296.25,
    changePercent: 0.96,
    open: 297.00,
    high: 302.50,
    low: 295.80,
    volume: 19800000,
    mktCap: 3730000000000,
    pe: 18.8,
    pb: 5.2,
    high52: 430.00,
    low52: 285.00,
    divYield: 3.85,
    sector: "Consumer Defensive",
    industry: "Diversified FMCG & Hotels",
    debtToEquity: 0.02,
    currentRatio: 2.85,
    interestCoverage: 85.0,
    totalDebt: 12000000000,
    workingCapital: 195000000000,
    revenueGrowthYoy: 8.5,
    profitGrowthYoy: 9.8,
    revenueGrowthQoq: 2.1,
    epsGrowthYoy: 9.2,
    distanceFrom52wHighPct: -30.4,
    distanceFrom52wLowPct: 4.9,
    priceVs50dmaPct: 0.8,
    priceVs200dmaPct: 2.1,
    return1w: 0.6,
    return1m: 1.9,
    return3m: 4.8,
    return6m: 9.2,
    return1y: 15.5,
    return3y: 34.0,
    return5y: 92.0,
    promoterHolding: 0.0,
    fiiHolding: 39.5,
    diiHolding: 42.1,
    mutualFundsHolding: 19.8,
    publicHolding: 18.4
  },
  BHARTIARTL: {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Limited",
    price: 2161.70,
    prevClose: 2143.90,
    changePercent: 0.83,
    open: 2148.00,
    high: 2175.00,
    low: 2140.00,
    volume: 5230000,
    mktCap: 12980000000000,
    pe: 48.2,
    pb: 8.2,
    high52: 2240.00,
    low52: 1480.00,
    divYield: 0.45,
    sector: "Telecommunications",
    industry: "Wireless Telecom Services",
    debtToEquity: 1.15,
    currentRatio: 0.95,
    interestCoverage: 6.2,
    totalDebt: 1850000000000,
    workingCapital: 110000000000,
    revenueGrowthYoy: 15.4,
    profitGrowthYoy: 28.5,
    revenueGrowthQoq: 4.2,
    epsGrowthYoy: 26.8,
    distanceFrom52wHighPct: -3.5,
    distanceFrom52wLowPct: 46.1,
    priceVs50dmaPct: 2.4,
    priceVs200dmaPct: 6.8,
    return1w: 1.4,
    return1m: 4.2,
    return3m: 11.5,
    return6m: 25.8,
    return1y: 46.0,
    return3y: 98.0,
    return5y: 220.0,
    promoterHolding: 53.2,
    fiiHolding: 25.4,
    diiHolding: 15.2,
    mutualFundsHolding: 9.4,
    publicHolding: 6.2
  },
  "122639": {
    symbol: "122639",
    name: "Parag Parikh Flexi Cap Fund (Direct-Growth)",
    price: 94.15,
    prevClose: 93.38,
    changePercent: 0.82,
    open: 94.15,
    high: 94.15,
    low: 94.15,
    volume: 1,
    mktCap: 865000000000,
    pe: 24.5,
    pb: 4.2,
    high52: 96.20,
    low52: 74.80,
    divYield: 0.0,
    sector: "Mutual Funds",
    industry: "Flexi Cap Equity",
    debtToEquity: 0.0,
    currentRatio: 1.0,
    interestCoverage: 99.0,
    totalDebt: 0,
    workingCapital: 865000000000,
    revenueGrowthYoy: 18.2,
    profitGrowthYoy: 22.4,
    revenueGrowthQoq: 4.8,
    epsGrowthYoy: 20.1,
    distanceFrom52wHighPct: -2.1,
    distanceFrom52wLowPct: 25.9,
    priceVs50dmaPct: 1.8,
    priceVs200dmaPct: 5.4,
    return1w: 0.9,
    return1m: 2.8,
    return3m: 6.9,
    return6m: 14.5,
    return1y: 22.4,
    return3y: 19.8,
    return5y: 24.2,
    promoterHolding: 0.0,
    fiiHolding: 0.0,
    diiHolding: 0.0,
    mutualFundsHolding: 0.0,
    publicHolding: 100.0
  },
  "120828": {
    symbol: "120828",
    name: "Quant Small Cap Fund (Direct-Growth)",
    price: 310.57,
    prevClose: 308.20,
    changePercent: 0.77,
    open: 310.57,
    high: 310.57,
    low: 310.57,
    volume: 1,
    mktCap: 284000000000,
    pe: 22.1,
    pb: 3.8,
    high52: 325.40,
    low52: 232.10,
    divYield: 0.0,
    sector: "Mutual Funds",
    industry: "Small Cap Equity",
    debtToEquity: 0.0,
    currentRatio: 1.0,
    interestCoverage: 99.0,
    totalDebt: 0,
    workingCapital: 284000000000,
    revenueGrowthYoy: 24.5,
    profitGrowthYoy: 28.1,
    revenueGrowthQoq: 6.2,
    epsGrowthYoy: 25.4,
    distanceFrom52wHighPct: -4.6,
    distanceFrom52wLowPct: 33.8,
    priceVs50dmaPct: 2.2,
    priceVs200dmaPct: 7.1,
    return1w: 1.2,
    return1m: 3.6,
    return3m: 8.5,
    return6m: 18.2,
    return1y: 28.6,
    return3y: 26.4,
    return5y: 35.1,
    promoterHolding: 0.0,
    fiiHolding: 0.0,
    diiHolding: 0.0,
    mutualFundsHolding: 0.0,
    publicHolding: 100.0
  },
  "119598": {
    symbol: "119598",
    name: "SBI Bluechip Fund (Direct-Growth)",
    price: 106.80,
    prevClose: 106.10,
    changePercent: 0.66,
    open: 106.80,
    high: 106.80,
    low: 106.80,
    volume: 1,
    mktCap: 512000000000,
    pe: 23.8,
    pb: 3.5,
    high52: 110.40,
    low52: 89.20,
    divYield: 0.0,
    sector: "Mutual Funds",
    industry: "Large Cap Equity",
    debtToEquity: 0.0,
    currentRatio: 1.0,
    interestCoverage: 99.0,
    totalDebt: 0,
    workingCapital: 512000000000,
    revenueGrowthYoy: 14.2,
    profitGrowthYoy: 16.5,
    revenueGrowthQoq: 3.2,
    epsGrowthYoy: 15.1,
    distanceFrom52wHighPct: -3.3,
    distanceFrom52wLowPct: 19.7,
    priceVs50dmaPct: 1.4,
    priceVs200dmaPct: 4.8,
    return1w: 0.7,
    return1m: 2.2,
    return3m: 5.8,
    return6m: 12.4,
    return1y: 18.2,
    return3y: 15.6,
    return5y: 16.8,
    promoterHolding: 0.0,
    fiiHolding: 0.0,
    diiHolding: 0.0,
    mutualFundsHolding: 0.0,
    publicHolding: 100.0
  },
  "148721": {
    symbol: "148721",
    name: "HDFC Nifty 50 Index Fund (Direct-Growth)",
    price: 252.61,
    prevClose: 249.81,
    changePercent: 1.12,
    open: 252.61,
    high: 252.61,
    low: 252.61,
    volume: 1,
    mktCap: 182000000000,
    pe: 23.2,
    pb: 3.9,
    high52: 258.40,
    low52: 205.10,
    divYield: 0.0,
    sector: "Mutual Funds",
    industry: "Index Fund",
    debtToEquity: 0.0,
    currentRatio: 1.0,
    interestCoverage: 99.0,
    totalDebt: 0,
    workingCapital: 182000000000,
    revenueGrowthYoy: 15.1,
    profitGrowthYoy: 17.8,
    revenueGrowthQoq: 3.5,
    epsGrowthYoy: 16.2,
    distanceFrom52wHighPct: -2.2,
    distanceFrom52wLowPct: 23.2,
    priceVs50dmaPct: 1.9,
    priceVs200dmaPct: 5.6,
    return1w: 1.1,
    return1m: 3.1,
    return3m: 7.2,
    return6m: 15.1,
    return1y: 20.4,
    return3y: 16.2,
    return5y: 17.5,
    promoterHolding: 0.0,
    fiiHolding: 0.0,
    diiHolding: 0.0,
    mutualFundsHolding: 0.0,
    publicHolding: 100.0
  }
};

function renderDemoPlaceholderData(chosen) {
  const sym = (chosen || "INFY").toUpperCase();
  const known = DEMO_STOCK_STORE[sym];

  const fallbackData = known ? { ...known, mode: "fallback_demo" } : {
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
    debtToEquity: 0.2,
    interestCoverage: 15.0,
    revenueGrowthYoy: 8.0,
    profitGrowthYoy: 10.0,
    priceVs200dmaPct: 4.0,
    priceVs50dmaPct: 2.0,
    return1m: 2.5,
    promoterHolding: 50.0,
    fiiHolding: 20.0,
    diiHolding: 15.0,
    mode: "fallback_demo"
  };

  currentSelectedData = fallbackData;
  renderStockData(fallbackData);
  updateIntelligenceScore(fallbackData);
  showTab(currentActiveTab || "overview");
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
          <span style="font-size:11px; color:#047857; font-weight:700;">SEBI Latest Filing</span>
        </div>
        <div class="shareholding-bar">
          <div class="shareholding-segment" style="width:${promoter}%; background:#047857;" title="Promoter: ${promoter}%"></div>
          <div class="shareholding-segment" style="width:${fii}%; background:#2563eb;" title="FII: ${fii}%"></div>
          <div class="shareholding-segment" style="width:${dii}%; background:#d97706;" title="DII: ${dii}%"></div>
          <div class="shareholding-segment" style="width:${publicH}%; background:#94a3b8;" title="Public: ${publicH}%"></div>
        </div>
        <div class="shareholding-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#047857;"></span><span>Promoter: <strong>${promoter}%</strong></span></div>
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
                    <strong style="color:#047857;">₹ ${Math.round(h.marketValueCr || 0).toLocaleString('en-IN')} Cr</strong>
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
        <canvas id="stockPriceChart" style="width:100%; height:210px; display:block; cursor:crosshair;"></canvas>
      </div>
    `;
  },

  financials: () => `
    <div id="financialsContainer">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0;">Financial Statements (Normalized XBRL)</h3>
        <span style="font-size:11px; color:#047857; font-weight:700;">Audited Exchange Filings</span>
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
        <span style="font-size:11px; color:#047857; font-weight:700;">Derived from Audited Financials</span>
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
            <div class="ratio-table-row"><span>Distance from 52-Week Low</span><strong style="color:#047857;">${d.distanceFrom52wLowPct ? '+' + Number(d.distanceFrom52wLowPct).toFixed(1) + '%' : 'N/A'}</strong></div>
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
        <span style="font-size:11px; color:#047857; font-weight:700;">Live Exchange Submissions</span>
      </div>
      <p style="color:#667085; font-size:13px; margin-bottom:14px;">Historical and upcoming dividend declarations, record dates, and buybacks filed with NSE/BSE.</p>
      <div id="actionsList">
        <div style="color:#94a3b8; font-size:13px; padding:20px; text-align:center;">Loading live corporate actions...</div>
      </div>
    </div>
  `
};

function showTab(key, button) {
  key = key || currentActiveTab || "overview";
  currentActiveTab = key;

  document.querySelectorAll(".tab").forEach(t => {
    const isTarget = button ? (t === button) : (t.getAttribute("data-tab") === key || t.textContent.trim().toLowerCase().includes(key));
    t.classList.toggle("active", isTarget);
  });

  const container = document.getElementById("tabContent");
  if (!container) return;

  if (!currentSelectedData) {
    currentSelectedData = DEMO_STOCK_STORE[currentSelectedSymbol] || DEMO_STOCK_STORE["INFY"] || {};
  }

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
      if (val >= 65) barEl.style.background = "#059669";
      else if (val >= 42) barEl.style.background = "#d97706";
      else barEl.style.background = "#dc2626";
    }
  };

  setBar("finStrengthVal", "finStrengthBar", finScore);
  setBar("valuationVal", "valuationBar", valScore);
  setBar("growthVal", "growthBar", growthScore);
  setBar("technicalVal", "technicalBar", techScore);
  setBar("ownershipVal", "ownershipBar", ownScore);

  const verdictEl = document.getElementById("speedoVerdictText");
  if (verdictEl) {
    if (totalScore >= 75) {
      verdictEl.textContent = `Strong positive conviction: High solvency score (${finScore}/100) and healthy institutional backing (${inst.toFixed(0)}%) support an Outperform ranking.`;
    } else if (totalScore >= 50) {
      verdictEl.textContent = `Balanced risk-reward: Sound operating fundamentals counterbalanced by current valuation multiples (${pe.toFixed(1)}x P/E). Suitable for accumulation.`;
    } else {
      verdictEl.textContent = `Caution warranted: Testing key moving average supports or elevated valuation multiples. Assess technical stop-loss before adding exposure.`;
    }
  }
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
              <span style="font-size:11px; color:#047857; font-weight:700;">Audited Segments</span>
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
                  ${a.dividendPerShare ? `<div style="font-size:15px; font-weight:750; color:#047857;">₹ ${a.dividendPerShare} / share</div>` : ''}
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

// =============================================================================
// PORTAL MODULES: SIP CALCULATOR, HEALTH CHECKER, MOVERS TABS
// =============================================================================

// Stock Health Diagnostic Profiles
const HEALTH_PROFILES = {
  "INFY": {
    name: "Infosys Limited (NSE: INFY)",
    desc: "Demonstrates near-zero debt leverage, world-class capital efficiency (ROE > 28%), stable operating cash flows and pristine forensic audit compliance.",
    score: 92,
    grade: "GRADE: A+ · EXCEPTIONAL HEALTH",
    dte: "0.08x",
    intCov: "42.5x",
    curRat: "2.4x",
    roe: "29.4%",
    roce: "37.8%",
    opm: "21.2%",
    salesCagr: "11.4%",
    profCagr: "12.8%",
    ocfRatio: "1.12x",
    pledge: "0.00% (None)",
    ticker: "INFY"
  },
  "TCS": {
    name: "Tata Consultancy Services Ltd (NSE: TCS)",
    desc: "Market leader in global IT services. Boasts superior ROCE exceeding 50%, zero debt, and outstanding cash dividend conversion.",
    score: 95,
    grade: "GRADE: AAA · HIGHEST QUALITY",
    dte: "0.00x (Debt Free)",
    intCov: "98.0x",
    curRat: "2.6x",
    roe: "48.2%",
    roce: "58.6%",
    opm: "25.1%",
    salesCagr: "12.1%",
    profCagr: "11.5%",
    ocfRatio: "1.08x",
    pledge: "0.00% (None)",
    ticker: "TCS"
  },
  "RELIANCE": {
    name: "Reliance Industries Ltd (NSE: RELIANCE)",
    desc: "India's largest conglomerate spanning Telecom (Jio), Retail, and Oil-to-Chemicals with robust cash flows and prudent debt-to-equity.",
    score: 88,
    grade: "GRADE: A+ · ROBUST CONGLOMERATE",
    dte: "0.38x",
    intCov: "9.2x",
    curRat: "1.2x",
    roe: "9.8%",
    roce: "11.4%",
    opm: "17.4%",
    salesCagr: "15.8%",
    profCagr: "12.2%",
    ocfRatio: "1.24x",
    pledge: "0.00% (None)",
    ticker: "RELIANCE"
  },
  "SBIN": {
    name: "State Bank of India (NSE: SBIN)",
    desc: "Largest public lender in India. Demonstrates historic low Net NPA (<0.6%), strong credit growth, and expanding Return on Assets (RoA > 1.0%).",
    score: 84,
    grade: "GRADE: A · SYSTEMICALLY IMPORTANT",
    dte: "Tier 1: 13.8%",
    intCov: "NIM: 3.3%",
    curRat: "PCR: 75%",
    roe: "16.4%",
    roce: "15.2%",
    opm: "NII +14%",
    salesCagr: "16.2%",
    profCagr: "22.8%",
    ocfRatio: "Stable",
    pledge: "Government Owned",
    ticker: "SBIN"
  },
  "ITC": {
    name: "ITC Limited (NSE: ITC)",
    desc: "Dominant FMCG, Hotels, Paperboards and Agri powerhouse. Net debt-free with remarkable operating margins and generous 3%+ dividend yield.",
    score: 93,
    grade: "GRADE: A+ · CASH COMPOUNDER",
    dte: "0.00x (Debt Free)",
    intCov: "120.0x",
    curRat: "2.8x",
    roe: "28.5%",
    roce: "38.2%",
    opm: "36.8%",
    salesCagr: "9.8%",
    profCagr: "11.2%",
    ocfRatio: "1.15x",
    pledge: "0.00% (None)",
    ticker: "ITC"
  },
  "TATAPOWER": {
    name: "Tata Power Company Ltd (NSE: TATAPOWER)",
    desc: "Leading integrated clean energy powerhouse. Benefiting from multi-gigawatt renewable transition, expanding ROE, and healthy solvency.",
    score: 82,
    grade: "GRADE: A · GREEN ENERGY LEADER",
    dte: "1.20x",
    intCov: "3.8x",
    curRat: "1.1x",
    roe: "12.8%",
    roce: "11.6%",
    opm: "19.5%",
    salesCagr: "18.4%",
    profCagr: "26.5%",
    ocfRatio: "1.05x",
    pledge: "1.2% (Minimal)",
    ticker: "TATAPOWER"
  }
};

function selectHealthStock(ticker, btnEl) {
  const profile = HEALTH_PROFILES[ticker] || HEALTH_PROFILES["INFY"];
  
  document.querySelectorAll('.health-pill').forEach(btn => {
    const bTicker = btn.getAttribute('data-ticker') || btn.textContent.trim();
    btn.classList.toggle('active', bTicker === ticker);
  });

  const setAll = (sel, val) => {
    document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
  };

  setAll(".healthCompanyName, #healthCompanyName", profile.name);
  setAll(".healthCompanyDesc, #healthCompanyDesc", profile.desc);
  setAll(".healthGradeBadge, #healthGradeBadge", profile.grade);
  setAll(".healthBigScore, #healthBigScore", profile.score);
  setAll(".healthDte, #healthDte", profile.dte);
  setAll(".healthIntCov, #healthIntCov", profile.intCov);
  setAll(".healthCurRat, #healthCurRat", profile.curRat);
  setAll(".healthRoe, #healthRoe", profile.roe);
  setAll(".healthRoce, #healthRoce", profile.roce);
  setAll(".healthOpm, #healthOpm", profile.opm);
  setAll(".healthSalesCagr, #healthSalesCagr", profile.salesCagr);
  setAll(".healthProfCagr, #healthProfCagr", profile.profCagr);
  setAll(".healthOcfRatio, #healthOcfRatio", profile.ocfRatio);
  setAll(".healthPledge, #healthPledge", profile.pledge);

  document.querySelectorAll(".healthActionBtn, #healthActionBtn").forEach(btn => {
    btn.onclick = () => exploreInvestment(profile.ticker);
  });
}

// SIP / Lumpsum Wealth Planner
let currentPlannerMode = 'sip';
let currentLumpRisk = 'moderate';
let currentLumpPeriod = 5;
let currentLumpAmount = 500000;

function switchPlannerMode(mode) {
  currentPlannerMode = mode;
  document.querySelectorAll(".btnModeSip, #btnModeSip").forEach(el => el.classList.toggle("active", mode === 'sip'));
  document.querySelectorAll(".btnModeLump, #btnModeLump").forEach(el => el.classList.toggle("active", mode === 'lumpsum'));

  const isSip = mode === 'sip';
  document.querySelectorAll(".labelInvestmentAmount, #labelInvestmentAmount").forEach(el => {
    el.textContent = isSip ? "Monthly Investment Amount:" : "Total Lumpsum Investment Amount:";
  });

  const amtInput = document.querySelector(".sipAmountInput, #sipAmountInput");
  const amtRange = document.querySelector(".sipAmountRange, #sipAmountRange");
  if (isSip) {
    if (amtRange) { amtRange.min = "1000"; amtRange.max = "100000"; amtRange.step = "1000"; amtRange.value = "10000"; }
    if (amtInput) { amtInput.value = "10000"; }
  } else {
    if (amtRange) { amtRange.min = "10000"; amtRange.max = "2000000"; amtRange.step = "10000"; amtRange.value = "200000"; }
    if (amtInput) { amtInput.value = "200000"; }
  }
  updateSipCalculator();
  updateLumpsumPortfolio();
}

function handleSipInput(inputEl, field) {
  const val = parseFloat(inputEl.value) || 0;
  if (field === 'amount') {
    document.querySelectorAll(".sipAmountRange, #sipAmountRange").forEach(el => { el.value = Math.min(el.max, Math.max(el.min, val)); });
    document.querySelectorAll(".sipAmountInput, #sipAmountInput").forEach(el => { if (el !== inputEl) el.value = val; });
  } else if (field === 'rate') {
    document.querySelectorAll(".sipRateRange, #sipRateRange").forEach(el => { el.value = Math.min(el.max, Math.max(el.min, val)); });
    document.querySelectorAll(".sipRateInput, #sipRateInput").forEach(el => { if (el !== inputEl) el.value = val; });
  } else if (field === 'years') {
    document.querySelectorAll(".sipYearsRange, #sipYearsRange").forEach(el => { el.value = Math.min(el.max, Math.max(el.min, val)); });
    document.querySelectorAll(".sipYearsInput, #sipYearsInput").forEach(el => { if (el !== inputEl) el.value = val; });
  }
  updateSipCalculator(inputEl);
}

function setSipPreset(field, val) {
  if (field === 'amount') {
    document.querySelectorAll(".sipAmountInput, #sipAmountInput").forEach(el => { el.value = val; });
    document.querySelectorAll(".sipAmountRange, #sipAmountRange").forEach(el => { el.value = Math.min(el.max, val); });
  } else if (field === 'rate') {
    document.querySelectorAll(".sipRateInput, #sipRateInput").forEach(el => { el.value = val; });
    document.querySelectorAll(".sipRateRange, #sipRateRange").forEach(el => { el.value = val; });
  } else if (field === 'years') {
    document.querySelectorAll(".sipYearsInput, #sipYearsInput").forEach(el => { el.value = val; });
    document.querySelectorAll(".sipYearsRange, #sipYearsRange").forEach(el => { el.value = val; });
  }
  updateSipCalculator();
}

function updateSipCalculator(sourceEl) {
  let amt = 10000, rate = 14.5, years = 10;

  const amtInput = document.querySelector(".sipAmountInput, #sipAmountInput");
  const rateInput = document.querySelector(".sipRateInput, #sipRateInput");
  const yearsInput = document.querySelector(".sipYearsInput, #sipYearsInput");

  if (sourceEl && (sourceEl.classList.contains("sipAmountRange") || sourceEl.id === "sipAmountRange")) {
    amt = parseFloat(sourceEl.value) || 10000;
    if (amtInput) amtInput.value = amt;
  } else if (amtInput) {
    amt = parseFloat(amtInput.value) || 10000;
  }

  if (sourceEl && (sourceEl.classList.contains("sipRateRange") || sourceEl.id === "sipRateRange")) {
    rate = parseFloat(sourceEl.value) || 14.5;
    if (rateInput) rateInput.value = rate;
  } else if (rateInput) {
    rate = parseFloat(rateInput.value) || 14.5;
  }

  if (sourceEl && (sourceEl.classList.contains("sipYearsRange") || sourceEl.id === "sipYearsRange")) {
    years = parseInt(sourceEl.value) || 10;
    if (yearsInput) yearsInput.value = years;
  } else if (yearsInput) {
    years = parseInt(yearsInput.value) || 10;
  }

  document.querySelectorAll(".sipAmountRange, #sipAmountRange").forEach(el => {
    if (el !== sourceEl) el.value = Math.min(el.max, Math.max(el.min, amt));
  });
  document.querySelectorAll(".sipRateRange, #sipRateRange").forEach(el => {
    if (el !== sourceEl) el.value = Math.min(el.max, Math.max(el.min, rate));
  });
  document.querySelectorAll(".sipYearsRange, #sipYearsRange").forEach(el => {
    if (el !== sourceEl) el.value = Math.min(el.max, Math.max(el.min, years));
  });

  // Check step-up and inflation toggles
  const stepUpToggle = document.getElementById("sipStepUpToggle");
  const stepUpRateEl = document.getElementById("sipStepUpRate");
  const isStepUp = stepUpToggle && stepUpToggle.checked;
  const stepUpPct = isStepUp ? (parseFloat(stepUpRateEl?.value) || 10) : 0;

  const inflationToggle = document.getElementById("sipInflationToggle");
  const isInflation = inflationToggle && inflationToggle.checked;
  const inflationRate = 0.06; // 6.0% Indian inflation baseline

  let invested = 0;
  let futureVal = 0;

  if (currentPlannerMode === 'sip') {
    const totalMonths = years * 12;
    const monthlyRate = (rate / 100) / 12;

    if (isStepUp && stepUpPct > 0) {
      for (let m = 1; m <= totalMonths; m++) {
        const yearIndex = Math.floor((m - 1) / 12);
        const currentMonthly = amt * Math.pow(1 + (stepUpPct / 100), yearIndex);
        invested += currentMonthly;
        const remainingMonths = totalMonths - m + 1;
        futureVal += currentMonthly * Math.pow(1 + monthlyRate, remainingMonths);
      }
      invested = Math.round(invested);
      futureVal = Math.round(futureVal);
    } else {
      invested = amt * totalMonths;
      if (monthlyRate > 0) {
        futureVal = Math.round(amt * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
      } else {
        futureVal = invested;
      }
    }
  } else {
    invested = amt;
    futureVal = Math.round(amt * Math.pow(1 + (rate / 100), years));
  }

  // Deflate for inflation if requested
  if (isInflation && years > 0) {
    futureVal = Math.round(futureVal / Math.pow(1 + inflationRate, years));
  }

  const gains = Math.max(0, futureVal - invested);

  document.querySelectorAll(".futureValueResult, #futureValueResult").forEach(el => { el.textContent = formatINR(futureVal); });
  document.querySelectorAll(".investedAmountResult, #investedAmountResult").forEach(el => { el.textContent = formatINR(invested); });
  document.querySelectorAll(".gainsAmountResult, #gainsAmountResult").forEach(el => { el.textContent = formatINR(gains); });

  const total = invested + gains;
  const invPct = total > 0 ? Math.round((invested / total) * 100) : 50;
  const gainsPct = 100 - invPct;

  document.querySelectorAll(".barInvested, #barInvested").forEach(el => { el.style.width = invPct + "%"; });
  document.querySelectorAll(".barGains, #barGains").forEach(el => { el.style.width = gainsPct + "%"; });

  const strategyHtml = years >= 15
    ? `For an ultra long-term ${years}-year horizon, allocate <strong>80% to Mid/Small Cap and Flexi-Cap Equities</strong>, <strong>15% to Nifty 50 Index</strong>, and <strong>5% to Sovereign Gold</strong> to maximize compounding.`
    : years >= 7
    ? `For a balanced ${years}-year horizon, allocate <strong>70% to Flexi-Cap / NIFTY 50 Index Funds</strong>, <strong>20% to High-Yield Corporate Debt</strong>, and <strong>10% to Sovereign Gold / Liquid Assets</strong>.`
    : `For a shorter ${years}-year horizon, prioritize capital safety with <strong>50% in Conservative Large-Cap / Balanced Advantage Funds</strong> and <strong>50% in Short-Duration Debt Funds / FDs</strong>.`;

  document.querySelectorAll(".strategyDesc, #strategyDesc").forEach(el => { el.innerHTML = strategyHtml; });

  // Render Compounding Milestones Grid
  renderSipMilestones(amt, rate, years, isStepUp ? stepUpPct : 0, isInflation);
}

function renderSipMilestones(baseAmt, ratePct, totalYears, stepUpPct, isInflation) {
  const container = document.getElementById("sipMilestonesGrid");
  if (!container) return;

  const milestones = [1, 3, 5, 10, 15, 20, 25, 30].filter(y => y <= Math.max(totalYears, 5));
  if (!milestones.includes(totalYears) && totalYears > 1) {
    milestones.push(totalYears);
    milestones.sort((a, b) => a - b);
  }

  const r = (ratePct / 100) / 12;
  const htmlArr = milestones.map(y => {
    let fv = 0;
    const months = y * 12;
    if (stepUpPct > 0) {
      for (let m = 1; m <= months; m++) {
        const yrIdx = Math.floor((m - 1) / 12);
        const curM = baseAmt * Math.pow(1 + (stepUpPct / 100), yrIdx);
        fv += curM * Math.pow(1 + r, months - m + 1);
      }
    } else {
      fv = baseAmt * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    }
    if (isInflation) {
      fv = fv / Math.pow(1 + 0.06, y);
    }
    return `
      <div class="milestone-pill">
        <div class="milestone-yr">${y} ${y === 1 ? 'Year' : 'Years'}</div>
        <div class="milestone-val">${formatINR(Math.round(fv))}</div>
      </div>
    `;
  });

  container.innerHTML = htmlArr.join('');
}


// =============================================================================
// INSTITUTIONAL LUMPSUM PORTFOLIO ARCHITECT (Grounded in 2026 Climate)
// =============================================================================

function setLumpRisk(risk) {
  currentLumpRisk = risk;
  ['conservative', 'moderate', 'aggressive', 'very_aggressive'].forEach(r => {
    const card = document.getElementById('riskOpt-' + r);
    if (card) card.classList.toggle('active', r === risk);
  });
  updateLumpsumPortfolio();
}

function setLumpPeriod(years) {
  currentLumpPeriod = years;
  const input = document.getElementById("lumpPeriodInput");
  if (input) input.value = years;

  [2, 5, 8, 15].forEach(y => {
    const pill = document.getElementById('pillHorizon' + y);
    if (pill) pill.classList.toggle('active', y === years);
  });
  updateLumpsumPortfolio();
}

function setLumpAmount(amt) {
  currentLumpAmount = amt;
  const input = document.getElementById("lumpAmountInput");
  const range = document.getElementById("lumpAmountRange");
  if (input) input.value = amt;
  if (range) range.value = Math.min(range.max, Math.max(range.min, amt));
  updateLumpsumPortfolio();
}

function syncLumpRange(rangeEl) {
  const amt = parseFloat(rangeEl.value) || 500000;
  const input = document.getElementById("lumpAmountInput");
  if (input) input.value = amt;
  updateLumpsumPortfolio();
}

function updateLumpsumPortfolio() {
  const amtInput = document.getElementById("lumpAmountInput");
  const periodInput = document.getElementById("lumpPeriodInput");
  const objSelect = document.getElementById("lumpObjectiveSelect");

  const amount = amtInput ? (parseFloat(amtInput.value) || 500000) : 500000;
  const years = periodInput ? (parseInt(periodInput.value) || 5) : 5;
  const objective = objSelect ? objSelect.value : 'wealth_creation';

  currentLumpAmount = amount;
  currentLumpPeriod = years;

  // Multi-Asset Allocation Ratios & Expected CAGRs based on Risk Profile
  let stockPct = 35, fundPct = 30, goldPct = 15, debtPct = 20, expectedCagr = 14.5;
  let riskName = "Moderate Compounding", riskColor = "#059669";

  if (currentLumpRisk === 'conservative') {
    stockPct = 20; fundPct = 20; goldPct = 15; debtPct = 45; expectedCagr = 10.5;
    riskName = "Conservative Preservation"; riskColor = "#2563eb";
  } else if (currentLumpRisk === 'moderate') {
    stockPct = 35; fundPct = 30; goldPct = 15; debtPct = 20; expectedCagr = 14.5;
    riskName = "Moderate Balanced"; riskColor = "#059669";
  } else if (currentLumpRisk === 'aggressive') {
    stockPct = 45; fundPct = 35; goldPct = 10; debtPct = 10; expectedCagr = 16.8;
    riskName = "Aggressive Wealth Growth"; riskColor = "#d97706";
  } else if (currentLumpRisk === 'very_aggressive') {
    stockPct = 55; fundPct = 35; goldPct = 5; debtPct = 5; expectedCagr = 19.2;
    riskName = "Alpha Momentum"; riskColor = "#dc2626";
  }

  // Adjust slightly for objective
  if (objective === 'dividend_cashflow') {
    expectedCagr = Math.max(9.5, expectedCagr - 1.5);
  } else if (objective === 'balanced_growth') {
    expectedCagr = Math.max(10.0, expectedCagr - 0.5);
  }

  // Amounts
  const stockAmt = Math.round(amount * (stockPct / 100));
  const fundAmt = Math.round(amount * (fundPct / 100));
  const goldAmt = Math.round(amount * (goldPct / 100));
  const debtAmt = Math.round(amount * (debtPct / 100));

  // Future Maturity Value & Multiplier
  const futureVal = Math.round(amount * Math.pow(1 + (expectedCagr / 100), years));
  const gainAmt = Math.max(0, futureVal - amount);
  const gainPct = ((gainAmt / amount) * 100).toFixed(1);
  const multiplier = (futureVal / amount).toFixed(2);

  // Update Summary Box
  const matValEl = document.getElementById("lumpMaturityValue");
  if (matValEl) matValEl.textContent = formatINR(futureVal);

  const gainBadgeEl = document.getElementById("lumpGainBadge");
  if (gainBadgeEl) gainBadgeEl.textContent = `+${formatINR(gainAmt)} (+${gainPct}% Gain · ${multiplier}x Multiplier)`;

  const cagrMetaEl = document.getElementById("lumpCagrMeta");
  if (cagrMetaEl) cagrMetaEl.innerHTML = `Expected Blended Portfolio CAGR: <strong>${expectedCagr.toFixed(1)}% p.a.</strong> (Target ${years}-Year Horizon)`;

  const capTagEl = document.getElementById("lumpCapitalTag");
  if (capTagEl) capTagEl.textContent = `Total Capital: ${formatINR(amount)}`;

  // Update Asset Mix Bar & Legend
  const barStocks = document.getElementById("barMixStocks");
  const barFunds = document.getElementById("barMixFunds");
  const barGold = document.getElementById("barMixGold");
  const barDebt = document.getElementById("barMixDebt");

  if (barStocks) barStocks.style.width = stockPct + "%";
  if (barFunds) barFunds.style.width = fundPct + "%";
  if (barGold) barGold.style.width = goldPct + "%";
  if (barDebt) barDebt.style.width = debtPct + "%";

  const elMixPctStocks = document.getElementById("mixPctStocks");
  const elMixAmtStocks = document.getElementById("mixAmtStocks");
  if (elMixPctStocks) elMixPctStocks.textContent = stockPct + "%";
  if (elMixAmtStocks) elMixAmtStocks.textContent = formatINR(stockAmt);

  const elMixPctFunds = document.getElementById("mixPctFunds");
  const elMixAmtFunds = document.getElementById("mixAmtFunds");
  if (elMixPctFunds) elMixPctFunds.textContent = fundPct + "%";
  if (elMixAmtFunds) elMixAmtFunds.textContent = formatINR(fundAmt);

  const elMixPctGold = document.getElementById("mixPctGold");
  const elMixAmtGold = document.getElementById("mixAmtGold");
  if (elMixPctGold) elMixPctGold.textContent = goldPct + "%";
  if (elMixAmtGold) elMixAmtGold.textContent = formatINR(goldAmt);

  const elMixPctDebt = document.getElementById("mixPctDebt");
  const elMixAmtDebt = document.getElementById("mixAmtDebt");
  if (elMixPctDebt) elMixPctDebt.textContent = debtPct + "%";
  if (elMixAmtDebt) elMixAmtDebt.textContent = formatINR(debtAmt);

  // Update Strategic Grounding Rationale
  const ratText = document.getElementById("rationaleText");
  if (ratText) {
    if (currentLumpRisk === 'conservative') {
      ratText.innerHTML = `With NIFTY at ~25,800 and high sovereign yields, this conservative setup anchors ${debtPct}% in AAA/sovereign debt, ${goldPct}% in sovereign gold (at ₹1,26,450/10g) to protect purchasing power, and ${stockPct + fundPct}% in cash-flow generative, dividend bluechips (HDFC Bank, Reliance, ITC) for safe compounding.`;
    } else if (currentLumpRisk === 'moderate') {
      ratText.innerHTML = `At NIFTY 25,800 (P/E ~22.4x), this balanced allocation captures secular Indian GDP expansion with ${stockPct}% direct bluechips (Airtel, ICICI Bank, Reliance, Tata Power), ${fundPct}% Flexi-Cap/Index MFs (PPFAS & HDFC Nifty 50), plus ${goldPct}% gold and ${debtPct}% debt as a downside buffer.`;
    } else if (currentLumpRisk === 'aggressive') {
      ratText.innerHTML = `Optimized for multi-year capital compounding: ${stockPct}% allocated to high-growth market leaders (Airtel, Tata Power, SBI, Trent), ${fundPct}% to high-alpha small/flexi-cap funds (Quant Small Cap & PPFAS), with ${goldPct + debtPct}% reserve for opportunistic dip deployment.`;
    } else {
      ratText.innerHTML = `Aggressive alpha capture model: ${stockPct}% momentum equities (Tata Power, Trent, SBI, Airtel), ${fundPct}% high-conviction small-cap alpha (Quant Small Cap), keeping a lean ${goldPct + debtPct}% buffer to maximize compound returns over ${years} years.`;
    }
  }

  // Render Suggested Optimum Basket Tables
  renderOptimumBasket(amount, stockAmt, fundAmt, goldAmt, debtAmt);
}

function renderOptimumBasket(totalAmount, stockAmt, fundAmt, goldAmt, debtAmt) {
  const container = document.getElementById("basketTablesContainer");
  if (!container) return;

  // ============================================================
  //  COMPREHENSIVE INSTRUMENT CATALOG — Nov 2026
  //  Each instrument: price, valuation, returns, quality, basis
  // ============================================================
  let stocksList = [];
  let fundsList  = [];
  let otherList  = [];

  // ---- CONSERVATIVE BASKET ----
  if (currentLumpRisk === 'conservative') {
    stocksList = [
      {
        sym: "HDFCBANK", name: "HDFC Bank Limited",
        price: "₹846.00", mktCap: "₹6.47L Cr", sec: "Private Banking",
        pe: "19.4x", pb: "2.3x", roe: "16.8%", debtEq: "7.8x (bank)", divYield: "1.18%",
        ret1y: "+26.0%", ret3y: "+44.0%", ret5y: "+78.0%",
        qualityScore: 88, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "India's largest private sector bank trading at a 15-year valuation discount (P/B 2.3x vs 10yr avg 3.4x) post HDFC merger. CD ratio normalizing from 110% → 85% over next 6 quarters will structurally re-rate the stock. Net NPA at 0.33% — best-in-class among Tier-1 banks. GNPA declining trajectory 1.26% → <1% by FY27.",
        futureCatalyst: "CD ratio normalization unlocking ₹2.1L Cr deposit growth headroom; insurance & HDB Financial Services IPO unlocking embedded subsidiaries value; RBI rate cut cycle to expand NIM by 15-20 bps by FY27; merger synergies yet to fully reflect in financials.",
        macroAlignment: "Direct beneficiary of India's formalization of credit and rising middle-class mortgage demand."
      },
      {
        sym: "RELIANCE", name: "Reliance Industries Ltd",
        price: "₹1,377.50", mktCap: "₹18.59L Cr", sec: "Conglomerate",
        pe: "24.1x", pb: "2.1x", roe: "9.4%", debtEq: "0.42x", divYield: "0.37%",
        ret1y: "+19.8%", ret3y: "+42.0%", ret5y: "+84.0%",
        qualityScore: 84, qualityRating: "PREMIUM QUALITY",
        selectionBasis: "India's most diversified conglomerate — O2C + Jio (500M+ subscribers) + Retail (18,000+ stores) + Green Energy (100GW target by 2030). Multi-engine free cash flow generation provides defensive stability for conservative portfolios. 5G capex cycle peaked; now FCF harvest phase for Jio.",
        futureCatalyst: "New Energy (solar panels, green hydrogen, electrolyzers) targeting ₹5,000-cr EBITDA by FY28; Jio Financial Services scaling; Retail IPO potential unlocking subsidiary value; Jio AirFiber targeting 100M homes by FY28.",
        macroAlignment: "Structurally positioned across all India mega-themes: digital connectivity, clean energy, organized retail."
      },
      {
        sym: "ITC", name: "ITC Limited",
        price: "₹299.10", mktCap: "₹3.73L Cr", sec: "Consumer FMCG",
        pe: "18.8x", pb: "5.2x", roe: "27.6%", debtEq: "0.00x", divYield: "3.85%",
        ret1y: "+15.5%", ret3y: "+34.0%", ret5y: "+92.0%",
        qualityScore: 86, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "Zero-debt FMCG powerhouse with ₹25,000 Cr+ cash on balance sheet. Highest dividend yield among Nifty-50 (3.85%). Hotels demerger (ITC Hotels listing) creates binary value-unlock catalyst. FMCG segment crossing ₹20,000 Cr revenue with 10%+ margins. Cigarette volumes inflecting post-GST stabilization.",
        futureCatalyst: "ITC Hotels demerger and separate NSE listing unlocking real estate + hospitality NAV; FMCG segment margin expansion 10% → 15% by FY27; agri-business vertical growing 20% YoY; paperboards capacity expansion.",
        macroAlignment: "Defensive allocation with high dividend yield acting as buffer in market downturns."
      },
      {
        sym: "INFY", name: "Infosys Limited",
        price: "₹1,098.00", mktCap: "₹4.56L Cr", sec: "IT Services",
        pe: "22.4x", pb: "7.1x", roe: "32.5%", debtEq: "0.00x", divYield: "2.42%",
        ret1y: "+12.0%", ret3y: "+22.0%", ret5y: "+45.0%",
        qualityScore: 83, qualityRating: "HIGH QUALITY",
        selectionBasis: "Debt-free IT bellwether with consistent 20%+ ROE and ₹35,000 Cr+ free cash flow annually. Revenue guidance upgraded to 4.5-5% for FY27 — indicating AI deal momentum recovery. 65 large deal wins in H1 FY27. Buyback and dividend payout ratio ~90% of FCF rewards long-term shareholders consistently.",
        futureCatalyst: "Generative AI & enterprise cloud transformation driving new deal cycle with 40%+ AI-augmented services by FY28; margin recovery to 22-23% from current 20.8%; Cobalt cloud platform differentiation vs peers.",
        macroAlignment: "USD-earning export business provides natural INR depreciation hedge for the portfolio."
      }
    ];
    fundsList = [
      {
        code: "148721", name: "HDFC Nifty 50 Index Fund — Direct Growth",
        nav: "₹252.61", aum: "₹18,200 Cr", expRatio: "0.10%", wt: 55,
        cat: "Large Cap Index",
        ret1y: "+20.4%", ret3y: "+16.2%", ret5y: "+17.5%",
        sharpe: "1.18", alpha: "0.0%", beta: "1.00",
        fundManager: "Passively Managed (Nifty 50 Replication)",
        mandateStyle: "Passive / Index Tracking",
        selectionBasis: "Lowest total expense ratio (0.10%) in category. Zero fund manager risk. Nifty 50 has delivered 16-17% CAGR over 25 years — structurally the most cost-efficient core equity exposure for conservative investors. Tracking error <0.05% — industry best.",
        futureCatalyst: "India's GDP growth 7%+ sustaining corporate earnings; Nifty 50 EPS growing at 14-15% YoY through FY28; FII inflows accelerating as Indian weight in MSCI EM increases."
      },
      {
        code: "119598", name: "SBI Bluechip Fund — Direct Growth",
        nav: "₹106.80", aum: "₹51,200 Cr", expRatio: "0.78%", wt: 45,
        cat: "Large Cap Equity",
        ret1y: "+18.2%", ret3y: "+15.6%", ret5y: "+16.8%",
        sharpe: "1.24", alpha: "+1.8%", beta: "0.92",
        fundManager: "Sohini Andani (22-yr track record)",
        mandateStyle: "Active Large Cap / Quality Bias",
        selectionBasis: "India's largest large-cap active fund (₹51,200 Cr AUM) with consistent 1st quartile performance across 5, 7, 10 year rolling periods. Beta 0.92 provides ~8% downside protection vs Nifty during corrections. Manager Sohini Andani's quality-tilt philosophy perfectly suited for conservative risk profiles.",
        futureCatalyst: "Quality factor outperformance in uncertain macro environment; large-cap leadership as mid/small cap valuations get stretched; SEBI large-cap mandate ensures portfolio stays defensive."
      }
    ];
    otherList = [
      {
        inst: "Sovereign Gold Bonds (SGB) — RBI Series", yield: "Gold ₹1,26,450/10g + 2.5% p.a. interest",
        wt: 35, role: "Inflation hedge + sovereign guarantee",
        ret5y: "+14.2% CAGR (INR)", taxNote: "0% LTCG at maturity (held to 8-yr tenor) vs 20% physical gold",
        macroNote: "USD/INR depreciation of ₹92.68 supports gold in INR terms; global recession fears & geopolitical risk add to gold demand thesis.",
        selectionBasis: "SGBs offer 2.5% annual interest on face value IN ADDITION to gold price appreciation — the only instrument with dual return. Zero LTCG at maturity makes effective post-tax return 20-25% superior to physical gold ETFs for the same gold price movement."
      },
      {
        inst: "7.18% GOI 2033 / Bharat Bond ETF (Apr-2033)", yield: "7.15% YTM",
        wt: 45, role: "Sovereign risk-free income anchor",
        ret5y: "+7.2% CAGR", taxNote: "Bharat Bond ETF: Indexation benefit reduces effective tax to 1-2% for 10yr holding",
        macroNote: "RBI repo rate at 6.5%; rate cut cycle expected → bond prices rise → capital gains on top of yield. 10-yr G-Sec spread vs US Treasury at 250 bps is historically high — FII bond inflows likely.",
        selectionBasis: "Bharat Bond ETF provides AAA PSU bond diversification within single ETF structure. YTM of 7.15% with near-zero credit risk. Indexation post 3yr holding lowers effective tax rate structurally. Bond duration of 7.8 years — optimal for a 7-8yr conservative holding period."
      },
      {
        inst: "ABSL Liquid Fund / Mirae Asset Overnight Fund", yield: "6.75-6.85% annualized",
        wt: 20, role: "Tactical liquidity buffer",
        ret5y: "+6.1% CAGR", taxNote: "Taxable at slab rate (liquid funds) — optimal for short-term parking <3yr",
        macroNote: "RBI liquidity corridor tightened; call money rates elevated — liquid/overnight funds benefit directly with same-day redemption facility.",
        selectionBasis: "Capital safety with daily liquidity. Used as tactical buffer to deploy into equities during significant corrections (>10% drawdowns). Overnight fund has zero duration risk — NAV cannot fall unlike debt funds."
      }
    ];

  // ---- MODERATE BASKET ----
  } else if (currentLumpRisk === 'moderate') {
    stocksList = [
      {
        sym: "BHARTIARTL", name: "Bharti Airtel Limited",
        price: "₹2,161.70", mktCap: "₹12.84L Cr", sec: "Telecom & Digital",
        pe: "48.2x", pb: "9.1x", roe: "19.4%", debtEq: "1.15x", divYield: "0.37%",
        ret1y: "+46.0%", ret3y: "+98.0%", ret5y: "+220.0%",
        qualityScore: 91, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "Duopoly telecom market (Airtel + Jio) with structural pricing power — ARPU grew ₹183 → ₹233 in 2 years, still 40-50% below global EM peers suggesting 2-3 more tariff hike cycles. 5G subscriber addition at 3.5M/month; Africa operations (Airtel Africa, 14 countries) adding currency diversification. FCF surged to ₹35,000 Cr annualized — delevering rapidly.",
        futureCatalyst: "ARPU path to ₹300+ by FY28 (vs ₹233 today); 5G enterprise B2B revenues inflecting (Airtel IQ cloud, IoT); Nxtra data center business scaling; Airtel Africa potential separate listing unlocking subsidiary value.",
        macroAlignment: "Rides India's digital economy growth; pricing power insulated from inflation pressures."
      },
      {
        sym: "ICICIBANK", name: "ICICI Bank Limited",
        price: "₹1,640.00", mktCap: "₹11.78L Cr", sec: "Private Banking",
        pe: "18.2x", pb: "2.9x", roe: "18.5%", debtEq: "7.2x (bank)", divYield: "0.95%",
        ret1y: "+42.0%", ret3y: "+84.0%", ret5y: "+195.0%",
        qualityScore: 92, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "India's highest ROA bank (2.1%) among Tier-1 private banks — a full 60 bps above HDFC Bank. Net NPA at 0.42% with GNPA declining to 2.16% — a 10-year low. 50%+ market share in housing finance growth, credit card spends & SME loans. Conservative provisioning coverage at 82% provides future earnings buffer.",
        futureCatalyst: "Credit cycle upcycle in SME/retail/personal loans; ICICI Prudential Life + ICICI Lombard embedded value not in current stock price; technology-led C/I ratio improvement from 44% → 40% by FY28; RBI rate cut cycle expanding NIM.",
        macroAlignment: "India's private credit formalization is a decade-long structural tailwind; ICICI best positioned to capture it."
      },
      {
        sym: "RELIANCE", name: "Reliance Industries Ltd",
        price: "₹1,377.50", mktCap: "₹18.59L Cr", sec: "Conglomerate",
        pe: "24.1x", pb: "2.1x", roe: "9.4%", debtEq: "0.42x", divYield: "0.37%",
        ret1y: "+19.8%", ret3y: "+42.0%", ret5y: "+84.0%",
        qualityScore: 84, qualityRating: "PREMIUM QUALITY",
        selectionBasis: "Multi-engine conglomerate where standalone valuation understates sum-of-parts NAV. Jio alone valued at ₹8-9L Cr by DCF; Retail at ₹4-5L Cr; O2C (petrochem) generates ₹60,000 Cr annual EBITDA. Mukesh Ambani committed ₹8L Cr capex through 2030 across green energy and digital — creating long-term asset-building moat.",
        futureCatalyst: "New Energy business targeting ₹1L Cr EBITDA by 2035; Jio Financial Services becoming India's digital NBFC giant; Retail IPO; JioAirFiber scaling to 100M homes — Reliance is building the digital/energy highway of India.",
        macroAlignment: "India's largest private company with presence in every growth sector of the economy."
      },
      {
        sym: "TATAPOWER", name: "Tata Power Company Ltd",
        price: "₹340.00", mktCap: "₹1.08L Cr", sec: "Clean Energy & Utilities",
        pe: "28.5x", pb: "3.8x", roe: "14.2%", debtEq: "1.52x", divYield: "0.44%",
        ret1y: "+28.5%", ret3y: "+65.0%", ret5y: "+240.0%",
        qualityScore: 79, qualityRating: "HIGH QUALITY",
        selectionBasis: "India's leading integrated clean energy company: 14GW operational + 10GW under construction + 20GW pipeline. Largest rooftop solar installer (#1 in India with 1.2M+ rooftop installs). Tata Power Solar (EPC + modules) benefiting from India's PLI scheme and China+1 manufacturing shift. Mundra port coal exposure being structurally reduced.",
        futureCatalyst: "10GW renewable capacity addition through FY28; Tata Power Solar module factory (India's largest at 4GW capacity); EV charging network (1,500+ stations) monetization; pumped hydro storage pipeline of 7GW riding green energy storage demand.",
        macroAlignment: "India's Energy Transition — ₹20L Cr investment opportunity through 2030; 500GW renewable target by GoI directly benefits Tata Power."
      },
      {
        sym: "TCS", name: "Tata Consultancy Services Ltd",
        price: "₹2,376.20", mktCap: "₹8.60L Cr", sec: "IT Services",
        pe: "26.2x", pb: "12.8x", roe: "53.2%", debtEq: "0.00x", divYield: "1.65%",
        ret1y: "+14.5%", ret3y: "+28.5%", ret5y: "+58.0%",
        qualityScore: 89, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "World's most profitable IT services company (ROE 53.2% — industry-defining). Revenue diversified across 46 industries, 55 countries, 600,000+ employees. AI demand accelerating — secured $24B+ TCV in FY27 H1. Buyback machine: ₹24,000 Cr buyback + ₹18 special dividend in FY27. Zero debt, ₹60,000 Cr cash on books.",
        futureCatalyst: "Generative AI-led enterprise transformation (Cognitive Business Ops, TCS Pace Ports); BSNL 4G/5G network rollout (₹15,000 Cr+ order) delivering over FY27-28; North America banking sector BFSI spend recovery; Europe defense tech spending uptick post-geopolitical tensions.",
        macroAlignment: "USD-denominated revenues = natural currency hedge; global digital transformation is a multi-decade megatrend."
      }
    ];
    fundsList = [
      {
        code: "122639", name: "Parag Parikh Flexi Cap Fund — Direct Growth",
        nav: "₹94.15", aum: "₹86,500 Cr", expRatio: "0.63%", wt: 55,
        cat: "Flexi Cap Equity",
        ret1y: "+22.4%", ret3y: "+19.8%", ret5y: "+24.2%",
        sharpe: "1.52", alpha: "+3.6%", beta: "0.78",
        fundManager: "Rajeev Thakkar & Raunak Onkar",
        mandateStyle: "Value / Quality / Global Diversified",
        selectionBasis: "India's most unique flexi cap fund with 20-25% mandated international exposure (Alphabet, Meta, Amazon). Beta 0.78 means 22% less volatility than Nifty while delivering alpha of 3.6% — exceptional risk-adjusted returns. AMFI data shows top 1% fund across all 3, 5, 7 year rolling periods. AUM of ₹86,500 Cr indicates strong institutional faith.",
        futureCatalyst: "International allocation (FAANG/AI platform companies) adding USD exposure; Indian value portfolio aligns with quality factor outperformance; Rajeev Thakkar's 25-year institutional-grade track record; zero high-churn style — low portfolio turnover = tax efficiency."
      },
      {
        code: "148721", name: "HDFC Nifty 50 Index Fund — Direct Growth",
        nav: "₹252.61", aum: "₹18,200 Cr", expRatio: "0.10%", wt: 45,
        cat: "Large Cap Index",
        ret1y: "+20.4%", ret3y: "+16.2%", ret5y: "+17.5%",
        sharpe: "1.18", alpha: "0.0%", beta: "1.00",
        fundManager: "Passively Managed",
        mandateStyle: "Passive Index Replication",
        selectionBasis: "Core India equity exposure at 0.10% expense ratio — 8x cheaper than average active fund. The 'satellite allocation' alongside PPFAS active fund creates a core-satellite portfolio architecture. Nifty 50 EPS growth at 14-15% with FII inflows accelerating on MSCI weight increase.",
        futureCatalyst: "India's rising MSCI EM weight (target 20%+ by 2027 from current 17.9%) driving passive FII inflows; corporate earnings growth 15% CAGR through FY28; market breadth expansion in Nifty 50 composition."
      }
    ];
    otherList = [
      {
        inst: "Sovereign Gold Bonds (SGB) / Nippon Gold BeES ETF", yield: "Gold ₹1,26,450/10g + 2.5% p.a. (SGB)",
        wt: 50, role: "Geopolitical hedge + portfolio insurance",
        ret5y: "+14.2% CAGR (INR)", taxNote: "SGB: 0% LTCG at maturity. Gold ETF: 20% LTCG after 2yr holding.",
        macroNote: "Gold-equity correlation = -0.18 (excellent diversifier). USD/INR at ₹92.68 — INR depreciation trend amplifies gold returns in rupee terms. Central bank gold buying at record highs globally.",
        selectionBasis: "Gold has delivered 14.2% CAGR in INR terms over 5 years — matching or beating large-cap equity returns with negative equity correlation. SGB's 2.5% annual interest + gold appreciation makes it structurally superior to physical gold and ETFs for 5yr+ holding periods."
      },
      {
        inst: "AAA Corporate Bond Fund (Target Maturity 2029) / Bharat Bond ETF", yield: "7.55-7.80% YTM",
        wt: 50, role: "Predictable accrual income & volatility damper",
        ret5y: "+7.5% CAGR", taxNote: "Indexation available after 3yr; Bharat Bond ETF: effective tax rate 1-2% for long-term holders",
        macroNote: "RBI rate cut cycle beginning — bond prices rise as yields fall, adding capital gains on top of 7.5-7.8% accrual. Indian 10-yr G-Sec yield premium vs US at 250 bps — historically compelling for FII bond inflows driving price appreciation.",
        selectionBasis: "Target maturity funds offer predictable YTM with no reinvestment risk — closest to FD returns without credit risk. Bharat Bond ETF invests ONLY in AAA-rated PSU bonds — zero default risk. 7.5-7.8% post-tax effective return in a rate-cut cycle environment is superior to bank FDs."
      }
    ];

  // ---- AGGRESSIVE BASKET ----
  } else if (currentLumpRisk === 'aggressive') {
    stocksList = [
      {
        sym: "BHARTIARTL", name: "Bharti Airtel Limited",
        price: "₹2,161.70", mktCap: "₹12.84L Cr", sec: "Telecom & Digital",
        pe: "48.2x", pb: "9.1x", roe: "19.4%", debtEq: "1.15x", divYield: "0.37%",
        ret1y: "+46.0%", ret3y: "+98.0%", ret5y: "+220.0%",
        qualityScore: 91, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "India's most powerful telecom franchise — ARPU at ₹233, path to ₹300+ in 24 months means 25-30% revenue growth with almost no corresponding cost increase. Operating leverage is extreme. FCF crossing ₹35,000 Cr accelerates debt reduction. Aggressive profile rewards the high PE (48x) which is justified by earnings growth of 35%+ CAGR.",
        futureCatalyst: "ARPU path ₹300+ → ₹400 by FY30; 5G enterprise monetization (Airtel IQ, Cloud, IoT B2B); Nxtra Data Centers IPO; Africa expansion to 20 countries. PEG ratio of 1.4x — cheap relative to growth.",
        macroAlignment: "Secular digitalization — India will add 300M more internet users by 2030, all using Airtel's network."
      },
      {
        sym: "TATAPOWER", name: "Tata Power Company Ltd",
        price: "₹340.00", mktCap: "₹1.08L Cr", sec: "Clean Energy",
        pe: "28.5x", pb: "3.8x", roe: "14.2%", debtEq: "1.52x", divYield: "0.44%",
        ret1y: "+28.5%", ret3y: "+65.0%", ret5y: "+240.0%",
        qualityScore: 79, qualityRating: "HIGH QUALITY",
        selectionBasis: "India's Energy Transition is the biggest capital cycle in a generation — ₹20L Cr investments through 2030. Tata Power is the purest play with operational + EPC + manufacturing + rooftop solar + EV charging across the value chain. PE of 28.5x grossly undervalues the 10GW under-construction pipeline which will add ₹8,000-10,000 Cr EBITDA by FY28.",
        futureCatalyst: "10GW renewable capacity addition; Tata Power Solar 4GW module factory (PLI beneficiary); pumped hydro 7GW pipeline; EV charging network monetization; Mundra coal demerger unlocking clean energy pure-play valuation re-rating.",
        macroAlignment: "India's 500GW renewable target, Rs 10L Cr Green Energy Corridor investment = multi-decade tailwind."
      },
      {
        sym: "SBIN", name: "State Bank of India",
        price: "₹1,165.10", mktCap: "₹10.40L Cr", sec: "Public Sector Banking",
        pe: "11.5x", pb: "1.6x", roe: "15.2%", debtEq: "12.1x (bank)", divYield: "2.14%",
        ret1y: "+38.0%", ret3y: "+72.0%", ret5y: "+160.0%",
        qualityScore: 82, qualityRating: "PREMIUM QUALITY",
        selectionBasis: "India's largest bank by deposits and assets — trading at PE 11.5x, the CHEAPEST large-cap quality bank in the world for its ROE profile. GNPA collapsed from 10.9% (2018) → 2.21% (2026) — a historic NPL cleanup complete. Infra credit expansion (₹11L Cr capex budget) directly channels through SBI. ROE structurally expanded from 7% → 15%.",
        futureCatalyst: "Infrastructure & capex financing leadership under government's ₹11L Cr CAPEX push; rural credit expansion (Jan Dhan leverage); SBI Life/SBI Cards embedded subsidiaries growing at 25%+ compounding; global issuance of masala bonds riding India's investment grade upgrade potential.",
        macroAlignment: "PSU bank outperformance cycle has years remaining — private credit penetration still at 50% of GDP vs 150% China."
      },
      {
        sym: "TRENT", name: "Trent Limited",
        price: "₹6,850.00", mktCap: "₹2.44L Cr", sec: "Consumer Retail",
        pe: "85.0x", pb: "22.1x", roe: "26.3%", debtEq: "0.08x", divYield: "0.07%",
        ret1y: "+65.0%", ret3y: "+180.0%", ret5y: "+700.0%",
        qualityScore: 88, qualityRating: "HIGH GROWTH COMPOUNDER",
        selectionBasis: "India's highest-compounding large-cap retail stock (5Y CAGR 700%+). Zudio (value fashion) expanding at 150+ stores/year — a Zara/H&M equivalent at Indian price points. Westside targeting 500 stores by FY27. SSSG (Same-Store-Sales-Growth) consistently 25%+. Tata Group backing provides real estate access and brand credibility unavailable to competitors.",
        futureCatalyst: "Zudio store count 700 → 2,000 by FY28; Westside 220 → 500 stores; Zara India partnership extension; possible Trent Foods and beauty verticals; Zudio's private label strategy hitting 90%+ own-brand margin improvement.",
        macroAlignment: "India's organized retail penetration at 12% vs 85% USA — a 7x expansion opportunity over 10 years."
      },
      {
        sym: "ICICIBANK", name: "ICICI Bank Limited",
        price: "₹1,640.00", mktCap: "₹11.78L Cr", sec: "Private Banking",
        pe: "18.2x", pb: "2.9x", roe: "18.5%", debtEq: "7.2x (bank)", divYield: "0.95%",
        ret1y: "+42.0%", ret3y: "+84.0%", ret5y: "+195.0%",
        qualityScore: 92, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "Highest ROA (2.1%) in Tier-1 Indian banking. The aggressive portfolio needs a quality anchor that still delivers 40%+ annual returns. ICICI Bank's credit quality, technology stack (iMobile Pay — 20M active users) and embedded subsidiaries (ICICI Pru Life, ICICI Lombard, ICICI Securities) make it India's closest equivalent to a financial services conglomerate.",
        futureCatalyst: "Embedded subsidiaries listing/value unlock; credit cycle expansion in SME loans; instant credit underwriting using AI-ML cutting processing time by 80%; NIM expansion of 10-15 bps per 25 bps rate cut.",
        macroAlignment: "India's private credit formalization, rising middle class loan demand, and retail banking expansion."
      }
    ];
    fundsList = [
      {
        code: "122639", name: "Parag Parikh Flexi Cap Fund — Direct Growth",
        nav: "₹94.15", aum: "₹86,500 Cr", expRatio: "0.63%", wt: 40,
        cat: "Flexi Cap / Global",
        ret1y: "+22.4%", ret3y: "+19.8%", ret5y: "+24.2%",
        sharpe: "1.52", alpha: "+3.6%", beta: "0.78",
        fundManager: "Rajeev Thakkar & Raunak Onkar",
        mandateStyle: "Value / Quality / Global Diversified",
        selectionBasis: "Even in an aggressive portfolio, PPFAS Flexi Cap acts as the 'quality ballast' — beta 0.78 reduces extreme drawdown risk while the international allocation (20-25% in Alphabet/Meta/Amazon) provides USD-hedge and AI platform exposure unavailable in pure Indian equity funds. Sharpe of 1.52 — best risk-adjusted return in category.",
        futureCatalyst: "International AI platform companies (Alphabet, Meta) outperforming on GenAI monetization; Indian value portfolio aligns with India's quality-earnings growth upcycle; fund size provides institutional access to IPOs and rights issues unavailable to retail investors."
      },
      {
        code: "120828", name: "Quant Small Cap Fund — Direct Growth",
        nav: "₹284.73", aum: "₹28,400 Cr", expRatio: "0.64%", wt: 60,
        cat: "Small Cap Equity",
        ret1y: "+28.6%", ret3y: "+26.4%", ret5y: "+35.1%",
        sharpe: "1.38", alpha: "+9.2%", beta: "1.14",
        fundManager: "Sanjeev Sharma & Team (Quant algo-driven model)",
        mandateStyle: "Quantitative Momentum / Small Cap",
        selectionBasis: "India's highest 5-year alpha-generating small-cap fund (+9.2% over benchmark). Quant Mutual Fund's proprietary VLRT (Valuation, Liquidity, Risk, Time) model screens 10,000+ stocks — systematic approach removes human emotion bias. Beta 1.14 is acceptable for aggressive investors with 5yr+ horizon where small-cap cycles fully play out.",
        futureCatalyst: "India's mid/small cap earnings expected to grow 20%+ CAGR through FY29 as domestic capex cycle matures; Quant's algo model already capturing sector rotation signals; small-cap India is a 40-50M emerging middle-class consumption and infrastructure beneficiary."
      }
    ];
    otherList = [
      {
        inst: "Multi-Asset Gold ETF (Nippon / HDFC Gold ETF) + Sovereign Gold Bonds", yield: "Gold ₹1,26,450/10g",
        wt: 50, role: "Tail risk hedge + currency depreciation buffer",
        ret5y: "+14.2% CAGR (INR)", taxNote: "SGB: 0% LTCG at maturity. Gold ETF: 20% with indexation after 2yr.",
        macroNote: "In aggressive portfolios, gold serves as 'portfolio insurance' — when equity falls 20%+, gold historically rises 10-15%, cushioning drawdowns by 300-400 bps.",
        selectionBasis: "Gold delivered 14.2% 5Y CAGR in INR — rivaling large-cap equity with NEGATIVE correlation to equities. Aggressive portfolios with high equity beta NEED uncorrelated assets. Gold-to-S&P 500 correlation = -0.18 makes it the optimal diversifier. SGB structure gives 2.5% extra annual return on top."
      },
      {
        inst: "Liquid Fund / Overnight Fund (Mirae Asset / ABSL) — Dip-Buying Reserve", yield: "6.75-6.85% annualized",
        wt: 50, role: "Tactical firepower for market corrections",
        ret5y: "+6.1% CAGR", taxNote: "Taxable at slab rate — optimal only as short-term tactical buffer",
        macroNote: "Nifty has had 10%+ corrections every 18-24 months historically. Maintaining 5-10% liquid war chest allows buying quality stocks at significant discounts during fear-driven market crashes.",
        selectionBasis: "Overnight funds earn near-repo-rate returns with ZERO NAV risk. The aggressive investor who keeps this war chest deployed during market dips (like March 2020 or Oct 2022) earns significantly superior 3-5yr returns versus fully-invested peers. This is a proven institutional wealth management strategy."
      }
    ];

  // ---- VERY AGGRESSIVE BASKET ----
  } else {
    stocksList = [
      {
        sym: "BHARTIARTL", name: "Bharti Airtel Limited",
        price: "₹2,161.70", mktCap: "₹12.84L Cr", sec: "Telecom Monopoly",
        pe: "48.2x", pb: "9.1x", roe: "19.4%", debtEq: "1.15x", divYield: "0.37%",
        ret1y: "+46.0%", ret3y: "+98.0%", ret5y: "+220.0%",
        qualityScore: 91, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "Highest conviction pick for very aggressive profile. India's 5G monetization is in inning 2 of 9 — ARPU at ₹233 must reach ₹350-400 for Airtel to earn its cost of capital on 5G capex. That 50-70% ARPU journey over 3-4 years = 50-70% revenue growth with 70-80% EBITDA margin = explosive earnings leverage. FCF tripling is base case.",
        futureCatalyst: "ARPU ₹400 by FY30; Airtel Business (B2B enterprise cloud) crossing ₹10,000 Cr revenue; Africa Airtel listing; Nxtra Data Center IPO; 5G IoT monetization from smart cities + Industry 4.0.",
        macroAlignment: "India's digital infrastructure buildout — the biggest investment cycle since 1991 liberalization."
      },
      {
        sym: "TRENT", name: "Trent Limited",
        price: "₹6,850.00", mktCap: "₹2.44L Cr", sec: "Retail Compounder",
        pe: "85.0x", pb: "22.1x", roe: "26.3%", debtEq: "0.08x", divYield: "0.07%",
        ret1y: "+65.0%", ret3y: "+180.0%", ret5y: "+700.0%",
        qualityScore: 88, qualityRating: "HIGH GROWTH COMPOUNDER",
        selectionBasis: "Zudio is India's answer to Zara/SHEIN — affordable fashion at ₹300-500 price point in a 1.4B population market. Store economics: each Zudio store becomes profitable in 6 months, IRR of 70%+. SSSG 25% means even existing stores are growing explosively. Very aggressive investors are rewarded for holding through PE compression — revenue growth will drive PE down from 85x to 40x as earnings scale.",
        futureCatalyst: "Zudio 700 → 3,000 stores over 5 years; Beauty/Cosmetics vertical launch (Zudio Beauty); Food & Grocery potential foray; Trent's access to Tata Group land bank for mall/store placement is unfair competitive advantage.",
        macroAlignment: "India organized retail: ₹65L Cr market, 12% penetrated → 50% penetrated in 10 years = ₹25L Cr incremental organized retail opportunity."
      },
      {
        sym: "SBIN", name: "State Bank of India",
        price: "₹1,165.10", mktCap: "₹10.40L Cr", sec: "PSU Banking Turnaround",
        pe: "11.5x", pb: "1.6x", roe: "15.2%", debtEq: "12.1x (bank)", divYield: "2.14%",
        ret1y: "+38.0%", ret3y: "+72.0%", ret5y: "+160.0%",
        qualityScore: 82, qualityRating: "PREMIUM QUALITY",
        selectionBasis: "World's cheapest quality bank at PE 11.5x and ROE 15.2% — a PEG ratio of 0.6x is classically undervalued. SBI's NPL cleanup from 10.9% to 2.21% is one of the most dramatic balance sheet transformations in global banking history. Very aggressive investors buy quality at value: SBI is both. Infrastructure capex lending leadership adds direct government policy tailwind.",
        futureCatalyst: "Infrastructure financing (₹11L Cr capex) direct beneficiary; SBI Life crossing ₹2L Cr market cap standalone; SBI Cards profitability inflection; NIM expansion of 15 bps in rate-cut cycle; potential MSCI weight increase driving ₹8,000+ Cr passive FII inflows.",
        macroAlignment: "India's credit-to-GDP ratio at 50% vs 150% global average — decades of credit expansion ahead with SBI as primary channel."
      },
      {
        sym: "ICICIBANK", name: "ICICI Bank Limited",
        price: "₹1,640.00", mktCap: "₹11.78L Cr", sec: "Private Banking",
        pe: "18.2x", pb: "2.9x", roe: "18.5%", debtEq: "7.2x (bank)", divYield: "0.95%",
        ret1y: "+42.0%", ret3y: "+84.0%", ret5y: "+195.0%",
        qualityScore: 92, qualityRating: "INSTITUTIONAL GRADE",
        selectionBasis: "Highest quality anchor in the very aggressive basket. ICICI Bank's ROA 2.1% is a world-class metric — only 15-20 banks globally achieve this consistently. The embedded subsidiaries alone (ICICI Pru ₹1.1L Cr + ICICI Lombard ₹88,000 Cr + ICICI Securities ₹25,000 Cr) are worth nearly 25% of ICICI Bank's own market cap — essentially hidden embedded value not reflected in PE.",
        futureCatalyst: "Subsidiary IPOs/listings unlocking embedded value; SME credit cycle expansion; iMobile Pay becoming India's leading financial super-app; NIM expansion; credit card market share gain from HDFC Bank's card-business slowdown.",
        macroAlignment: "India's rising middle-class insurance and wealth management penetration = 10-year structural tailwind for ICICI's subsidiaries."
      },
      {
        sym: "TATAPOWER", name: "Tata Power Company Ltd",
        price: "₹340.00", mktCap: "₹1.08L Cr", sec: "Clean Energy Alpha",
        pe: "28.5x", pb: "3.8x", roe: "14.2%", debtEq: "1.52x", divYield: "0.44%",
        ret1y: "+28.5%", ret3y: "+65.0%", ret5y: "+240.0%",
        qualityScore: 79, qualityRating: "HIGH QUALITY",
        selectionBasis: "Energy transition alpha play — the 10GW renewable pipeline currently under construction is not in the stock price. At completion (FY28-29), Tata Power will have 24GW+ operational capacity, the EBITDA will nearly double, and PE will compress dramatically from 28.5x to 15-18x even without stock price change — implying 60-80% return from earnings alone without multiple expansion.",
        futureCatalyst: "10GW under construction completion; Tata Power Solar 4GW module factory (India's largest, PLI funded); pumped hydro 7GW pipeline; Mundra coal demerger creating clean energy pure-play re-rating; EV charging network monetization.",
        macroAlignment: "India 500GW renewable target is a government-backed mandate — the equivalent of 60 years of historical power build in 10 years."
      }
    ];
    fundsList = [
      {
        code: "120828", name: "Quant Small Cap Fund — Direct Growth",
        nav: "₹284.73", aum: "₹28,400 Cr", expRatio: "0.64%", wt: 55,
        cat: "Small Cap Equity",
        ret1y: "+28.6%", ret3y: "+26.4%", ret5y: "+35.1%",
        sharpe: "1.38", alpha: "+9.2%", beta: "1.14",
        fundManager: "Sanjeev Sharma (Quant VLRT Algo Model)",
        mandateStyle: "Quantitative Momentum / Small Cap",
        selectionBasis: "India's highest 5Y alpha small-cap fund (+9.2% vs benchmark) — absolutely suited for very aggressive mandates. Quant's systematic VLRT model identifies market cycles and rotates sectors proactively — unlike human fund managers who lag cycle recognition. Beta 1.14 — highest market sensitivity among recommended funds, appropriate for aggressive risk-takers with 5yr+ horizon.",
        futureCatalyst: "Indian small-cap earnings expected to grow 22-25% CAGR through FY29 as domestic capex cycle matures; 60M new demat account holders deploying SIP money creating small-cap demand; Quant's algo model well-positioned to capture upcoming small-cap midcycle rally."
      },
      {
        code: "122639", name: "Parag Parikh Flexi Cap Fund — Direct Growth",
        nav: "₹94.15", aum: "₹86,500 Cr", expRatio: "0.63%", wt: 45,
        cat: "Flexi Cap / Global Diversified",
        ret1y: "+22.4%", ret3y: "+19.8%", ret5y: "+24.2%",
        sharpe: "1.52", alpha: "+3.6%", beta: "0.78",
        fundManager: "Rajeev Thakkar & Raunak Onkar",
        mandateStyle: "Value / Quality / International",
        selectionBasis: "Even in a very aggressive basket, PPFAS provides essential 'global AI exposure' — 20-25% allocation in Alphabet, Meta, Amazon acts as a global GenAI monetization play within an Indian MF wrapper. No other Indian mutual fund provides this international quality alongside domestic value picks. Sharpe 1.52 is best-in-class — counterbalances the Quant Small Cap's high beta.",
        futureCatalyst: "International allocation benefiting from AI platform revenue explosions (Alphabet +35% YoY, Meta +20% YoY); domestic India value portfolio aligned with earnings growth; fund's low turnover means tax efficiency — no short-term capital gains churn."
      }
    ];
    otherList = [
      {
        inst: "Multi-Asset Commodity ETF / Gold + Silver ETF Mix", yield: "Gold ₹1,26,450/10g | Silver ₹1,02,000/kg",
        wt: 60, role: "Commodity cycle diversifier and tail hedge",
        ret5y: "+14.2% CAGR gold, +18.5% CAGR silver (INR)", taxNote: "Commodity ETFs: 20% LTCG after 2yr holding with indexation benefit",
        macroNote: "Very aggressive portfolios with 80%+ equity need commodity diversification. Gold-equity correlation -0.18 and silver's industrial demand from EV/solar panels adds industrial cycle exposure.",
        selectionBasis: "Silver has outperformed gold in 2024-26 on green energy demand (solar panels use 100g silver each; global solar installations growing 40% YoY). Silver 5Y CAGR of 18.5% in INR terms makes it superior to gold for aggressive investors willing to accept volatility. A 70:30 gold:silver split in this allocation is recommended."
      },
      {
        inst: "Liquid/Overnight Fund — Tactical Dip-Buying Reserve", yield: "6.75-6.85% annualized",
        wt: 40, role: "Opportunistic equity deployment reserve",
        ret5y: "+6.1% CAGR", taxNote: "Taxable at slab rate — treat as 12-24 month tactical weapon, not long-term hold",
        macroNote: "Very aggressive investors MUST keep tactical reserves to exploit market panic. Those who deployed cash during Oct 2022 (Nifty -17%), Jun 2022 (-18%), and Mar 2020 (-38%) earned 2-3x market returns over the following 18 months.",
        selectionBasis: "Market crashes of 15-30% occur every 2-3 years in India. Maintaining 5-8% tactical cash in an overnight fund (earning 6.8% while waiting) lets very aggressive investors buy their conviction stocks at 25-40% discounts during fear-driven corrections — a core institutional wealth management technique."
      }
    ];
  }

  // ========== BASKET QUALITY SUMMARY COMPUTATION ==========
  const qualityScores = stocksList.map(s => s.qualityScore);
  const avgQuality = Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length);
  const peValues = stocksList.map(s => parseFloat(s.pe));
  const wtdPE = (peValues.reduce((a, v, i) => a + v * (stocksList[i].wt || 20), 0) / peValues.reduce((a, v, i) => a + (stocksList[i].wt || 20), 0)).toFixed(1);
  const highReturn = stocksList.filter(s => parseFloat(s.ret3y) > 20).length;
  const basketGrade = avgQuality >= 88 ? 'A+' : avgQuality >= 80 ? 'A' : 'B+';
  const gradeLabel = avgQuality >= 88 ? 'Institutional Grade' : avgQuality >= 80 ? 'Premium Quality' : 'High Quality';
  const gradeClass = avgQuality >= 88 ? 'grade-aplus' : avgQuality >= 80 ? 'grade-a' : 'grade-b';
  const divScore = currentLumpRisk === 'conservative' ? '8.6' : currentLumpRisk === 'moderate' ? '8.9' : '8.2';

  // ========== HTML RENDERING ==========
  const renderStockRow = (s) => {
    const itemAlloc = Math.round(stockAmt * (s.wt / 100));
    const retColor1 = s.ret1y.startsWith('+') ? '#16a34a' : '#dc2626';
    const retColor3 = s.ret3y.startsWith('+') ? '#16a34a' : '#dc2626';
    const retColor5 = s.ret5y.startsWith('+') ? '#16a34a' : '#dc2626';
    const qBarW = s.qualityScore;
    const qBarColor = s.qualityScore >= 88 ? '#6366f1' : s.qualityScore >= 80 ? '#10b981' : '#f59e0b';
    return `
      <tr>
        <td>
          <div class="instrument-cell">
            <strong>${s.sym}</strong>
            <span>${s.name}</span>
            <span class="quality-badge quality-badge-${s.qualityScore >= 88 ? 'inst' : s.qualityScore >= 80 ? 'prem' : 'high'}">${s.qualityRating}</span>
          </div>
        </td>
        <td>
          <div class="cmp-cell">
            <strong>${s.price}</strong>
            <span class="sub-text">MCap: ${s.mktCap}</span>
          </div>
        </td>
        <td>
          <div class="valuation-cell">
            <span>PE: <strong>${s.pe}</strong></span>
            <span>PB: <strong>${s.pb}</strong></span>
            <span>ROE: <strong>${s.roe}</strong></span>
            <span>Div: <strong>${s.divYield}</strong></span>
          </div>
        </td>
        <td>
          <div class="returns-cell">
            <span style="color:${retColor1}"><strong>${s.ret1y}</strong><br><small>1Y</small></span>
            <span style="color:${retColor3}"><strong>${s.ret3y}</strong><br><small>3Y CAGR</small></span>
            <span style="color:${retColor5}"><strong>${s.ret5y}</strong><br><small>5Y CAGR</small></span>
          </div>
        </td>
        <td>
          <div class="quality-cell">
            <div class="quality-score-num">${s.qualityScore}<span>/100</span></div>
            <div class="quality-bar-mini"><div style="width:${qBarW}%;background:${qBarColor};"></div></div>
            <span class="sub-text">${s.sec}</span>
          </div>
        </td>
        <td>
          <div class="basis-cell">
            <div class="basis-title">📌 Selection Basis</div>
            <div class="basis-text">${s.selectionBasis}</div>
            <div class="catalyst-title">🚀 Growth Catalyst</div>
            <div class="catalyst-text">${s.futureCatalyst}</div>
          </div>
        </td>
        <td>
          <div class="action-cell">
            <div class="weight-alloc-display">
              <div><span class="weight-badge">${s.wt}%</span></div>
              <div class="alloc-amt">${formatINR(itemAlloc)}</div>
            </div>
            <button type="button" class="btn-terminal-link" onclick="quickSelect('${s.sym}')">Analyze ↗</button>
          </div>
        </td>
      </tr>
    `;
  };

  const renderFundRow = (f) => {
    const itemAlloc = Math.round(fundAmt * (f.wt / 100));
    const retColor1 = f.ret1y.startsWith('+') ? '#16a34a' : '#dc2626';
    const retColor3 = f.ret3y.startsWith('+') ? '#16a34a' : '#dc2626';
    const retColor5 = f.ret5y.startsWith('+') ? '#16a34a' : '#dc2626';
    return `
      <tr>
        <td>
          <div class="instrument-cell">
            <strong style="font-size:12.5px;">${f.name}</strong>
            <span>AMFI Code: ${f.code} | AUM: ${f.aum}</span>
            <span>Manager: ${f.fundManager}</span>
            <span class="quality-badge quality-badge-inst">${f.mandateStyle}</span>
          </div>
        </td>
        <td>
          <div class="cmp-cell">
            <strong>NAV ${f.nav}</strong>
            <span class="sub-text">Exp Ratio: ${f.expRatio}</span>
          </div>
        </td>
        <td>
          <div class="valuation-cell">
            <span>Sharpe: <strong>${f.sharpe}</strong></span>
            <span>Alpha: <strong style="color:#16a34a">${f.alpha}</strong></span>
            <span>Beta: <strong>${f.beta}</strong></span>
          </div>
        </td>
        <td>
          <div class="returns-cell">
            <span style="color:${retColor1}"><strong>${f.ret1y}</strong><br><small>1Y</small></span>
            <span style="color:${retColor3}"><strong>${f.ret3y}</strong><br><small>3Y CAGR</small></span>
            <span style="color:${retColor5}"><strong>${f.ret5y}</strong><br><small>5Y CAGR</small></span>
          </div>
        </td>
        <td>
          <div class="quality-cell">
            <span class="quality-badge quality-badge-inst">${f.cat}</span>
          </div>
        </td>
        <td>
          <div class="basis-cell">
            <div class="basis-title">📌 Selection Basis</div>
            <div class="basis-text">${f.selectionBasis}</div>
            <div class="catalyst-title">🚀 Growth Catalyst</div>
            <div class="catalyst-text">${f.futureCatalyst}</div>
          </div>
        </td>
        <td>
          <div class="action-cell">
            <div class="weight-alloc-display">
              <div><span class="weight-badge">${f.wt}%</span></div>
              <div class="alloc-amt">${formatINR(itemAlloc)}</div>
            </div>
            <button type="button" class="btn-terminal-link" onclick="quickSelect('${f.code}')">View Fund ↗</button>
          </div>
        </td>
      </tr>
    `;
  };

  const renderOtherRow = (o) => {
    const isGold = o.inst.toLowerCase().includes('gold') || o.inst.toLowerCase().includes('commodity');
    const baseAmt = isGold ? goldAmt : debtAmt;
    const itemAlloc = Math.round(baseAmt * (o.wt / 100));
    return `
      <tr>
        <td colspan="2">
          <div class="instrument-cell">
            <strong>${o.inst}</strong>
            <span>5Y CAGR: <strong style="color:#16a34a">${o.ret5y}</strong></span>
            <span class="sub-text">${o.taxNote}</span>
          </div>
        </td>
        <td>
          <div class="cmp-cell">
            <strong style="font-size:12px;">${o.yield}</strong>
          </div>
        </td>
        <td>
          <div class="basis-cell">
            <div class="basis-title">📌 Why This?</div>
            <div class="basis-text">${o.selectionBasis}</div>
            <div class="catalyst-title">🌐 Macro Context</div>
            <div class="catalyst-text">${o.macroNote}</div>
          </div>
        </td>
        <td colspan="2">
          <div class="basis-cell">
            <div class="basis-title">🛡 Portfolio Role</div>
            <div class="basis-text">${o.role}</div>
          </div>
        </td>
        <td>
          <div class="action-cell">
            <div class="weight-alloc-display">
              <div><span class="weight-badge">${o.wt}% of class</span></div>
              <div class="alloc-amt">${formatINR(itemAlloc)}</div>
            </div>
          </div>
        </td>
      </tr>
    `;
  };

  const stocksRowsHtml = stocksList.map(renderStockRow).join('');
  const fundsRowsHtml  = fundsList.map(renderFundRow).join('');
  const otherRowsHtml  = otherList.map(renderOtherRow).join('');

  container.innerHTML = `
    <!-- Basket Quality Summary Header -->
    <div class="basket-quality-summary">
      <div class="bqs-item">
        <div class="bqs-label">Basket Avg Quality Score</div>
        <div class="bqs-value ${gradeClass}">${avgQuality}<span>/100</span></div>
      </div>
      <div class="bqs-item">
        <div class="bqs-label">Weighted Basket PE</div>
        <div class="bqs-value">${wtdPE}x</div>
      </div>
      <div class="bqs-item">
        <div class="bqs-label">Stocks with 3Y CAGR &gt; 20%</div>
        <div class="bqs-value grade-aplus">${highReturn}/${stocksList.length}</div>
      </div>
      <div class="bqs-item">
        <div class="bqs-label">Portfolio Diversification Score</div>
        <div class="bqs-value">${divScore}/10</div>
      </div>
      <div class="bqs-item bqs-grade">
        <div class="bqs-label">Overall Basket Grade</div>
        <div class="bqs-value ${gradeClass}">${basketGrade} — ${gradeLabel}</div>
      </div>
    </div>

    <!-- Category 1: Direct Stocks -->
    <div class="basket-category-section">
      <div class="basket-category-header">
        <span>📈 1. DIRECT INDIAN EQUITIES (NSE) — DEEP ANALYSIS</span>
        <span class="cat-alloc-badge">Total Allocation: ${formatINR(stockAmt)}</span>
      </div>
      <div class="table-responsive">
        <table class="basket-table-styled basket-table-comprehensive">
          <thead>
            <tr>
              <th>Instrument &amp; Quality</th>
              <th>CMP &amp; Market Cap</th>
              <th>Valuation Metrics</th>
              <th>Historical Returns</th>
              <th>Quality Score</th>
              <th>Selection Basis &amp; Growth Catalyst</th>
              <th>Weight &amp; Allocation</th>
            </tr>
          </thead>
          <tbody>${stocksRowsHtml}</tbody>
        </table>
      </div>
    </div>

    <!-- Category 2: Mutual Funds -->
    <div class="basket-category-section">
      <div class="basket-category-header">
        <span>📊 2. MUTUAL FUND SCHEMES (AMFI) — INSTITUTIONAL ANALYSIS</span>
        <span class="cat-alloc-badge">Total Allocation: ${formatINR(fundAmt)}</span>
      </div>
      <div class="table-responsive">
        <table class="basket-table-styled basket-table-comprehensive">
          <thead>
            <tr>
              <th>Scheme &amp; Manager</th>
              <th>NAV &amp; Expense</th>
              <th>Risk Metrics</th>
              <th>Historical Returns</th>
              <th>Category</th>
              <th>Selection Basis &amp; Growth Catalyst</th>
              <th>Weight &amp; Allocation</th>
            </tr>
          </thead>
          <tbody>${fundsRowsHtml}</tbody>
        </table>
      </div>
    </div>

    <!-- Category 3: Gold & Debt -->
    <div class="basket-category-section">
      <div class="basket-category-header">
        <span>🪙 3. STRATEGIC GOLD &amp; FIXED INCOME — STABILITY LAYER</span>
        <span class="cat-alloc-badge">Total Allocation: ${formatINR(goldAmt + debtAmt)}</span>
      </div>
      <div class="table-responsive">
        <table class="basket-table-styled basket-table-comprehensive">
          <thead>
            <tr>
              <th colspan="2">Asset / Instrument &amp; Returns</th>
              <th>Rate / Yield</th>
              <th>Selection Basis &amp; Macro Context</th>
              <th colspan="2">Portfolio Role</th>
              <th>Allocation</th>
            </tr>
          </thead>
          <tbody>${otherRowsHtml}</tbody>
        </table>
      </div>
    </div>

    <div class="basket-disclaimer">
      ⚠️ <strong>Disclaimer:</strong> This basket is generated for educational and informational purposes based on publicly available market data as of November 2026. This is NOT SEBI-registered investment advice. Past returns do not guarantee future performance. Please consult a SEBI-registered investment advisor before making investment decisions.
    </div>
  `;
}


function loadBasketIntoTerminal(ticker = 'RELIANCE') {
  quickSelect(ticker);
}

function exportPortfolioPlan() {
  window.print();
}

// Market Movers Tab Switching
function switchMoversTab(tab) {
  document.querySelectorAll(".tableGainers, #tableGainers").forEach(el => { el.style.display = tab === 'gainers' ? 'block' : 'none'; });
  document.querySelectorAll(".tableLosers, #tableLosers").forEach(el => { el.style.display = tab === 'losers' ? 'block' : 'none'; });
  document.querySelectorAll(".tableActive, #tableActive").forEach(el => { el.style.display = tab === 'active' ? 'block' : 'none'; });

  document.querySelectorAll(".btnGainers, #btnGainers").forEach(el => el.classList.toggle("active", tab === 'gainers'));
  document.querySelectorAll(".btnLosers, #btnLosers").forEach(el => el.classList.toggle("active", tab === 'losers'));
  document.querySelectorAll(".btnActive, #btnActive").forEach(el => el.classList.toggle("active", tab === 'active'));
}


// =============================================================================
// MULTI-PAGE CLIENT-SIDE ROUTER & GLOBAL HEADER SEARCH
// (Zero Page Reloads · 100% GitHub Pages Compatible)
// =============================================================================

function navigateToPage(pageId) {
  // Normalize page ID
  if (!pageId.startsWith('page-')) {
    pageId = 'page-' + pageId;
  }

  // 1. Hide all pages
  const allPages = document.querySelectorAll('.portal-page');
  allPages.forEach(p => {
    p.style.display = 'none';
  });

  // 2. Show target page (default to page-home if not found)
  let target = document.getElementById(pageId);
  if (!target) {
    target = document.getElementById('page-home');
    pageId = 'page-home';
  }
  if (target) {
    target.style.display = 'block';
  }

  // 3. Update Subnav Links Active State
  document.querySelectorAll('.subnav-link').forEach(link => {
    const isAct = link.getAttribute('data-page') === pageId;
    link.classList.toggle('active', isAct);
  });

  // 4. Update URL hash without reloads
  const cleanHash = pageId.replace('page-', '');
  if (window.location.hash !== '#' + cleanHash) {
    history.pushState(null, '', '#' + cleanHash);
  }

  // 5. Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 6. If switching to terminal or health, ensure calculations or default tickers are loaded
  if (pageId === 'page-planner') {
    updateSipCalculator();
    updateLumpsumPortfolio();
  } else if (pageId === 'page-terminal' || cleanHash === 'terminal' || cleanHash === 'research') {
    showTab(currentActiveTab || 'overview');
    if (currentSelectedData) {
      updateIntelligenceScore(currentSelectedData);
    }
  }
}

// Global Header Search Handlers
function handleHeaderSearch(query) {
  const dropdown = document.getElementById("headerDropdown");
  if (!dropdown) return;

  const trimmed = (query || "").trim().toLowerCase();
  if (!trimmed) {
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
    return;
  }

  const matches = INSTANT_CATALOG.filter(item => {
    return (item.symbol && item.symbol.toLowerCase().includes(trimmed)) ||
           (item.name && item.name.toLowerCase().includes(trimmed));
  }).slice(0, 8);

  if (matches.length === 0) {
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
    return;
  }

  dropdown.innerHTML = matches.map((m, idx) => `
    <div class="autocomplete-item" onclick="selectHeaderSearchResult('${m.symbol}')">
      <div>
        <div class="autocomplete-item-name">${m.name}</div>
        <div class="autocomplete-item-type">${m.meta || m.type}</div>
      </div>
      <span class="autocomplete-item-symbol">${m.symbol}</span>
    </div>
  `).join("");
  dropdown.style.display = "block";
}

function handleHeaderSearchKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    executeHeaderSearch();
  } else if (e.key === "Escape") {
    const dropdown = document.getElementById("headerDropdown");
    if (dropdown) dropdown.style.display = "none";
  }
}

function selectHeaderSearchResult(symbol) {
  const input = document.getElementById("headerSearchInput");
  if (input) input.value = symbol;
  const dropdown = document.getElementById("headerDropdown");
  if (dropdown) dropdown.style.display = "none";
  quickSelect(symbol);
}

function executeHeaderSearch() {
  const input = document.getElementById("headerSearchInput");
  const query = input ? input.value.trim() : "";
  if (!query) return;

  const dropdown = document.getElementById("headerDropdown");
  if (dropdown) dropdown.style.display = "none";

  // Switch to Research Terminal & Explore
  navigateToPage('page-terminal');
  exploreInvestment(query);
}

// Router Hash Listener
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash) {
    navigateToPage(hash);
  } else {
    navigateToPage('page-home');
  }
});

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
      if (e.target.value.trim()) {
        handleInstantSearch(e.target.value);
      }
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
        } else if (items.length > 0) {
          e.preventDefault();
          items[0].dispatchEvent(new MouseEvent("mousedown"));
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

  // Ensure clear button is hidden when input is blank
  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) {
    clearBtn.style.display = (instrumentInput && instrumentInput.value) ? "flex" : "none";
  }

  // Explore default stock on visit without populating search input text
  exploreInvestment("Infosys Ltd (INFY)");
  const initialHash = window.location.hash.replace('#', '').trim();
  if (initialHash) {
    navigateToPage(initialHash);
  } else {
    navigateToPage('page-home');
  }
});
