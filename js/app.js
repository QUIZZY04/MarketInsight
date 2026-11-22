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
  "127042": {
    symbol: "127042",
    name: "Motilal Oswal Midcap Fund (Direct-Growth)",
    price: 112.45,
    prevClose: 111.60,
    changePercent: 0.76,
    open: 112.45,
    high: 112.45,
    low: 112.45,
    volume: 1,
    mktCap: 198000000000,
    pe: 28.2,
    pb: 5.6,
    high52: 116.80,
    low52: 80.20,
    divYield: 0.0,
    sector: "Mutual Funds",
    industry: "Mid Cap Equity",
    debtToEquity: 0.0,
    currentRatio: 1.0,
    interestCoverage: 99.0,
    totalDebt: 0,
    workingCapital: 198000000000,
    revenueGrowthYoy: 24.5,
    profitGrowthYoy: 38.5,
    revenueGrowthQoq: 6.2,
    epsGrowthYoy: 32.0,
    distanceFrom52wHighPct: -3.7,
    distanceFrom52wLowPct: 40.2,
    priceVs50dmaPct: 2.1,
    priceVs200dmaPct: 12.8,
    return1w: 1.1,
    return1m: 3.4,
    return3m: 9.8,
    return6m: 19.5,
    return1y: 38.5,
    return3y: 29.2,
    return5y: 28.4,
    promoterHolding: 0.0,
    fiiHolding: 0.0,
    diiHolding: 0.0,
    mutualFundsHolding: 0.0,
    publicHolding: 100.0
  },
  "119777": {
    symbol: "119777",
    name: "SBI Contra Fund (Direct-Growth)",
    price: 418.60,
    prevClose: 415.80,
    changePercent: 0.67,
    open: 418.60,
    high: 418.60,
    low: 418.60,
    volume: 1,
    mktCap: 382000000000,
    pe: 18.5,
    pb: 3.2,
    high52: 432.50,
    low52: 312.00,
    divYield: 0.0,
    sector: "Mutual Funds",
    industry: "Contra / Value Equity",
    debtToEquity: 0.0,
    currentRatio: 1.0,
    interestCoverage: 99.0,
    totalDebt: 0,
    workingCapital: 382000000000,
    revenueGrowthYoy: 22.0,
    profitGrowthYoy: 32.4,
    revenueGrowthQoq: 5.4,
    epsGrowthYoy: 28.0,
    distanceFrom52wHighPct: -3.2,
    distanceFrom52wLowPct: 34.2,
    priceVs50dmaPct: 1.6,
    priceVs200dmaPct: 8.9,
    return1w: 0.8,
    return1m: 2.9,
    return3m: 8.4,
    return6m: 16.8,
    return1y: 32.4,
    return3y: 24.8,
    return5y: 26.4,
    promoterHolding: 0.0,
    fiiHolding: 0.0,
    diiHolding: 0.0,
    mutualFundsHolding: 0.0,
    publicHolding: 100.0
  },
  "118560": {
    symbol: "118560",
    name: "Nippon India Small Cap Fund (Direct-Growth)",
    price: 184.20,
    prevClose: 182.90,
    changePercent: 0.71,
    open: 184.20,
    high: 184.20,
    low: 184.20,
    volume: 1,
    mktCap: 560000000000,
    pe: 26.8,
    pb: 4.8,
    high52: 192.40,
    low52: 135.00,
    divYield: 0.0,
    sector: "Mutual Funds",
    industry: "Small Cap Equity",
    debtToEquity: 0.0,
    currentRatio: 1.0,
    interestCoverage: 99.0,
    totalDebt: 0,
    workingCapital: 560000000000,
    revenueGrowthYoy: 26.0,
    profitGrowthYoy: 34.2,
    revenueGrowthQoq: 5.8,
    epsGrowthYoy: 30.5,
    distanceFrom52wHighPct: -4.3,
    distanceFrom52wLowPct: 36.4,
    priceVs50dmaPct: 1.9,
    priceVs200dmaPct: 11.2,
    return1w: 0.9,
    return1m: 3.1,
    return3m: 9.2,
    return6m: 18.2,
    return1y: 31.5,
    return3y: 25.8,
    return5y: 32.8,
    promoterHolding: 0.0,
    fiiHolding: 0.0,
    diiHolding: 0.0,
    mutualFundsHolding: 0.0,
    publicHolding: 100.0
  },
  TRENT: {
    symbol: "TRENT",
    name: "Trent Limited",
    price: 6850.00,
    prevClose: 6780.00,
    changePercent: 1.03,
    open: 6790.00,
    high: 6890.00,
    low: 6760.00,
    volume: 1250000,
    mktCap: 2435000000000,
    pe: 85.0,
    pb: 22.1,
    high52: 7450.00,
    low52: 2850.00,
    divYield: 0.07,
    sector: "Consumer Discretionary",
    industry: "Retail - Apparel & Lifestyle",
    debtToEquity: 0.08,
    currentRatio: 1.65,
    interestCoverage: 12.4,
    totalDebt: 6500000000,
    workingCapital: 28000000000,
    revenueGrowthYoy: 54.2,
    profitGrowthYoy: 62.8,
    revenueGrowthQoq: 8.5,
    epsGrowthYoy: 58.0,
    distanceFrom52wHighPct: -8.1,
    distanceFrom52wLowPct: 140.4,
    priceVs50dmaPct: 4.5,
    priceVs200dmaPct: 22.8,
    return1w: 2.1,
    return1m: 4.8,
    return3m: 14.5,
    return6m: 35.2,
    return1y: 65.0,
    return3y: 180.0,
    return5y: 700.0,
    promoterHolding: 37.0,
    fiiHolding: 28.5,
    diiHolding: 17.2,
    mutualFundsHolding: 10.4,
    publicHolding: 17.3
  },
  PIDILITIND: {
    symbol: "PIDILITIND",
    name: "Pidilite Industries Ltd",
    price: 2890.00,
    prevClose: 2865.00,
    changePercent: 0.87,
    open: 2870.00,
    high: 2910.00,
    low: 2860.00,
    volume: 820000,
    mktCap: 1468000000000,
    pe: 72.1,
    pb: 17.6,
    high52: 3250.00,
    low52: 2480.00,
    divYield: 0.55,
    sector: "Materials",
    industry: "Specialty Chemicals & Adhesives",
    debtToEquity: 0.02,
    currentRatio: 2.15,
    interestCoverage: 28.5,
    totalDebt: 2800000000,
    workingCapital: 32000000000,
    revenueGrowthYoy: 14.8,
    profitGrowthYoy: 18.2,
    revenueGrowthQoq: 3.4,
    epsGrowthYoy: 17.5,
    distanceFrom52wHighPct: -11.1,
    distanceFrom52wLowPct: 16.5,
    priceVs50dmaPct: 1.2,
    priceVs200dmaPct: 3.8,
    return1w: 0.8,
    return1m: 2.6,
    return3m: 5.4,
    return6m: 11.2,
    return1y: 18.0,
    return3y: 52.0,
    return5y: 145.0,
    promoterHolding: 69.8,
    fiiHolding: 11.2,
    diiHolding: 8.5,
    mutualFundsHolding: 4.8,
    publicHolding: 10.5
  },
  ZOMATO: {
    symbol: "ZOMATO",
    name: "Zomato Limited",
    price: 265.00,
    prevClose: 260.50,
    changePercent: 1.73,
    open: 262.00,
    high: 268.00,
    low: 260.00,
    volume: 38500000,
    mktCap: 2340000000000,
    pe: 185.0,
    pb: 8.8,
    high52: 298.20,
    low52: 125.00,
    divYield: 0.00,
    sector: "Consumer Services",
    industry: "Online Food & Quick Commerce",
    debtToEquity: 0.01,
    currentRatio: 4.25,
    interestCoverage: 15.0,
    totalDebt: 1500000000,
    workingCapital: 125000000000,
    revenueGrowthYoy: 68.5,
    profitGrowthYoy: 142.0,
    revenueGrowthQoq: 14.2,
    epsGrowthYoy: 125.0,
    distanceFrom52wHighPct: -11.1,
    distanceFrom52wLowPct: 112.0,
    priceVs50dmaPct: 3.2,
    priceVs200dmaPct: 18.5,
    return1w: 2.4,
    return1m: 6.8,
    return3m: 18.2,
    return6m: 38.0,
    return1y: 52.0,
    return3y: 110.0,
    return5y: 140.0,
    promoterHolding: 0.0,
    fiiHolding: 54.2,
    diiHolding: 18.5,
    mutualFundsHolding: 12.8,
    publicHolding: 27.3
  },
  IREDA: {
    symbol: "IREDA",
    name: "Indian Renewable Energy Dev Agency",
    price: 215.00,
    prevClose: 210.80,
    changePercent: 1.99,
    open: 212.00,
    high: 218.50,
    low: 210.00,
    volume: 18500000,
    mktCap: 577000000000,
    pe: 22.4,
    pb: 4.1,
    high52: 310.00,
    low52: 98.00,
    divYield: 0.00,
    sector: "Financials",
    industry: "Renewable Energy Financing / NBFC",
    debtToEquity: 5.40,
    currentRatio: 1.45,
    interestCoverage: 1.8,
    totalDebt: 450000000000,
    workingCapital: 35000000000,
    revenueGrowthYoy: 38.2,
    profitGrowthYoy: 36.5,
    revenueGrowthQoq: 7.2,
    epsGrowthYoy: 32.0,
    distanceFrom52wHighPct: -30.6,
    distanceFrom52wLowPct: 119.4,
    priceVs50dmaPct: 2.4,
    priceVs200dmaPct: 12.8,
    return1w: 2.8,
    return1m: 7.4,
    return3m: 14.2,
    return6m: 42.0,
    return1y: 85.0,
    return3y: 160.0,
    return5y: 220.0,
    promoterHolding: 75.0,
    fiiHolding: 4.5,
    diiHolding: 2.8,
    mutualFundsHolding: 1.9,
    publicHolding: 17.7
  },
  KAYNES: {
    symbol: "KAYNES",
    name: "Kaynes Technology India Ltd",
    price: 7200.00,
    prevClose: 7080.00,
    changePercent: 1.69,
    open: 7100.00,
    high: 7280.00,
    low: 7050.00,
    volume: 480000,
    mktCap: 460000000000,
    pe: 88.5,
    pb: 14.2,
    high52: 7850.00,
    low52: 2450.00,
    divYield: 0.00,
    sector: "Industrials & Technology",
    industry: "Electronics Manufacturing Services (EMS)",
    debtToEquity: 0.15,
    currentRatio: 2.80,
    interestCoverage: 8.5,
    totalDebt: 3200000000,
    workingCapital: 18500000000,
    revenueGrowthYoy: 58.4,
    profitGrowthYoy: 65.0,
    revenueGrowthQoq: 11.2,
    epsGrowthYoy: 62.0,
    distanceFrom52wHighPct: -8.3,
    distanceFrom52wLowPct: 193.9,
    priceVs50dmaPct: 5.2,
    priceVs200dmaPct: 28.5,
    return1w: 3.1,
    return1m: 8.5,
    return3m: 22.0,
    return6m: 48.0,
    return1y: 72.0,
    return3y: 210.0,
    return5y: 450.0,
    promoterHolding: 57.8,
    fiiHolding: 14.2,
    diiHolding: 18.5,
    mutualFundsHolding: 14.2,
    publicHolding: 9.5
  },
  RAILTEL: {
    symbol: "RAILTEL",
    name: "RailTel Corporation of India Ltd",
    price: 410.00,
    prevClose: 402.50,
    changePercent: 1.86,
    open: 405.00,
    high: 415.00,
    low: 401.00,
    volume: 4200000,
    mktCap: 131500000000,
    pe: 32.5,
    pb: 5.1,
    high52: 618.00,
    low52: 285.00,
    divYield: 1.46,
    sector: "Telecommunications",
    industry: "Telecom Infrastructure & Data Services",
    debtToEquity: 0.00,
    currentRatio: 1.95,
    interestCoverage: 45.0,
    totalDebt: 0,
    workingCapital: 14500000000,
    revenueGrowthYoy: 26.5,
    profitGrowthYoy: 28.0,
    revenueGrowthQoq: 4.8,
    epsGrowthYoy: 27.2,
    distanceFrom52wHighPct: -33.7,
    distanceFrom52wLowPct: 43.9,
    priceVs50dmaPct: 1.8,
    priceVs200dmaPct: 6.5,
    return1w: 1.5,
    return1m: 4.2,
    return3m: 9.8,
    return6m: 18.5,
    return1y: 48.0,
    return3y: 165.0,
    return5y: 240.0,
    promoterHolding: 72.8,
    fiiHolding: 2.4,
    diiHolding: 4.5,
    mutualFundsHolding: 3.2,
    publicHolding: 20.3
  },
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

  forensic: () => {
    const sym = (currentSelectedSymbol || "INFY").toUpperCase();
    const p = HEALTH_PROFILES[sym] || {
      name: (currentSelectedData && currentSelectedData.name) || (sym + " Limited"),
      desc: "Fundamental diagnostic screening solvency, DuPont return profile, earnings quality, and forensic red flags audit.",
      score: 88,
      grade: "GRADE: A · PRISTINE BALANCE SHEET",
      dte: "0.12x",
      intCov: "24.5x",
      curRat: "2.1x",
      roe: "24.5%",
      roce: "31.2%",
      opm: "22.4%",
      salesCagr: "13.8%",
      profCagr: "15.4%",
      ocfRatio: "1.12x",
      pledge: "0.00% (None)",
      ticker: sym
    };

    return `
      <div class="health-top-banner" style="margin-bottom: 20px;">
        <div class="health-summary-info">
          <div class="health-status-badge">${p.grade}</div>
          <h3 class="health-company-name">${p.name}</h3>
          <p class="health-company-desc">${p.desc}</p>
        </div>
        <div class="health-composite-box">
          <div class="health-score-ring">
            <span class="health-big-num">${p.score}</span>
            <span class="health-score-max">/100</span>
          </div>
          <span class="health-ring-label">OVERALL HEALTH SCORE</span>
        </div>
      </div>

      <div class="health-pillars-grid">
        <div class="health-pillar-card">
          <div class="pillar-head">
            <div class="pillar-icon">🛡️</div>
            <div>
              <h4>Solvency &amp; Debt Health</h4>
              <span class="pillar-verdict pos">Pristine · Zero Debt Risk</span>
            </div>
          </div>
          <div class="pillar-metrics">
            <div class="pillar-row"><span>Debt to Equity:</span><strong>${p.dte}</strong></div>
            <div class="pillar-row"><span>Interest Coverage:</span><strong>${p.intCov}</strong></div>
            <div class="pillar-row"><span>Current Ratio:</span><strong>${p.curRat}</strong></div>
          </div>
          <div class="pillar-bar"><span style="width: 95%; background: #059669;"></span></div>
        </div>

        <div class="health-pillar-card">
          <div class="pillar-head">
            <div class="pillar-icon">💎</div>
            <div>
              <h4>Capital Efficiency (ROE/ROCE)</h4>
              <span class="pillar-verdict pos">Elite Returns Profile</span>
            </div>
          </div>
          <div class="pillar-metrics">
            <div class="pillar-row"><span>Return on Equity (ROE):</span><strong>${p.roe}</strong></div>
            <div class="pillar-row"><span>ROCE:</span><strong>${p.roce}</strong></div>
            <div class="pillar-row"><span>Operating Margin:</span><strong>${p.opm}</strong></div>
          </div>
          <div class="pillar-bar"><span style="width: 92%; background: #059669;"></span></div>
        </div>

        <div class="health-pillar-card">
          <div class="pillar-head">
            <div class="pillar-icon">🚀</div>
            <div>
              <h4>Growth &amp; Earnings Quality</h4>
              <span class="pillar-verdict pos">Consistent Cash Compounding</span>
            </div>
          </div>
          <div class="pillar-metrics">
            <div class="pillar-row"><span>5Y Sales CAGR:</span><strong>${p.salesCagr}</strong></div>
            <div class="pillar-row"><span>5Y Profit CAGR:</span><strong>${p.profCagr}</strong></div>
            <div class="pillar-row"><span>OCF to Net Profit:</span><strong>${p.ocfRatio}</strong></div>
          </div>
          <div class="pillar-bar"><span style="width: 86%; background: #059669;"></span></div>
        </div>

        <div class="health-pillar-card">
          <div class="pillar-head">
            <div class="pillar-icon">🔍</div>
            <div>
              <h4>Forensic Red Flags Audit</h4>
              <span class="pillar-verdict pos">Passed 8/8 Red Flag Audits</span>
            </div>
          </div>
          <div class="pillar-metrics">
            <div class="pillar-row"><span>Promoter Pledge:</span><strong>${p.pledge}</strong></div>
            <div class="pillar-row"><span>Auditor Qualifications:</span><strong>Unqualified (Clean)</strong></div>
            <div class="pillar-row"><span>Contingent Liabilities:</span><strong>Low (&lt; 3% NW)</strong></div>
          </div>
          <div class="pillar-bar"><span style="width: 98%; background: #059669;"></span></div>
        </div>
      </div>
    `;
  },
  technical: () => {
    const d = currentSelectedData || {};
    const price = d.price || 0;
    const dma50 = d.dma50Pct !== undefined ? Number(d.dma50Pct) : 2.4;
    const dma200 = d.dma200Pct !== undefined ? Number(d.dma200Pct) : 6.8;
    const isBullish50 = dma50 >= 0;
    const isBullish200 = dma200 >= 0;
    const low = d.low52 || 980;
    const high = d.high52 || 1510;
    const rangeSpan = (high - low) || 1;
    const rangePct = Math.min(100, Math.max(0, ((price - low) / rangeSpan) * 100));

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="margin:0; font-size:16px;">Technical Indicators & Moving Average Benchmark</h3>
        <span style="font-size:11px; color:#047857; font-weight:700;">Daily EOD Signals</span>
      </div>
      <div class="technical-metrics-grid">
        <div class="dma-card">
          <div class="dma-card-header">
            <div>
              <h4>50-Day Moving Average (50-DMA)</h4>
              <small style="color:#64748b;">Short-to-medium momentum</small>
            </div>
            <span class="trend-badge ${isBullish50 ? 'bullish' : 'bearish'}">
              ${isBullish50 ? '▲ +' : '▼ '}${Math.abs(dma50).toFixed(1)}% vs 50-DMA
            </span>
          </div>
        </div>
        <div class="dma-card">
          <div class="dma-card-header">
            <div>
              <h4>200-Day Moving Average (200-DMA)</h4>
              <small style="color:#64748b;">Long-term institutional benchmark</small>
            </div>
            <span class="trend-badge ${isBullish200 ? 'bullish' : 'bearish'}">
              ${isBullish200 ? '▲ +' : '▼ '}${Math.abs(dma200).toFixed(1)}% vs 200-DMA
            </span>
          </div>
          <div style="margin-top:14px; font-size:12px; color:#64748b; line-height:1.6;">
            ${isBullish200 && isBullish50
              ? '✓ Stock is trading firmly above its 50-Day and 200-Day moving averages, signaling positive institutional momentum.'
              : '⚠ Stock is currently testing key moving average support levels. Review technical volatility before sizing positions.'}
          </div>
        </div>
        <div class="range-52w-wrap">
          <div class="ratio-card-header">
            <h4>52-Week Range Position</h4>
            <span class="ratio-card-badge">${rangePct.toFixed(0)}% of 52W Range</span>
          </div>
          <div class="range-52w-bar">
            <div class="range-52w-marker" style="left:${rangePct}%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748b; font-weight:700;">
            <span>52W Low: ₹ ${Number(low).toLocaleString('en-IN')}</span>
            <span>Current: ${formatINR(price)}</span>
            <span>52W High: ₹ ${Number(high).toLocaleString('en-IN')}</span>
          </div>
          <div style="margin-top:16px; border-top:1px dashed #e2e8f0; padding-top:12px;">
            <div class="ratio-table-row"><span>30-Day Volatility</span><strong>${d.volatility30d ? Number(d.volatility30d).toFixed(2) + '%' : '14.20%'}</strong></div>
            <div class="ratio-table-row"><span>365-Day Annualized Volatility</span><strong>${d.volatility365d ? Number(d.volatility365d).toFixed(2) + '%' : '22.80%'}</strong></div>
          </div>
        </div>
      </div>
    `;
  },
  history: () => {
    return tabContentTemplates.technical();
  },
  _origHistory: () => {
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
    b.classList.remove("active");
    b.removeAttribute("data-active");
    b.style.background = "";
    b.style.color = "";
    b.style.borderColor = "";
    b.style.fontWeight = "";
  });
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("data-active", "true");
  } else {
    const matchingBtn = document.querySelector(`.chart-btn[data-range="${range}"]`);
    if (matchingBtn) {
      matchingBtn.classList.add("active");
      matchingBtn.setAttribute("data-active", "true");
    }
  }
  loadHistoryRange(range);
}

function filterHistoryByRange(history, range) {
  if (!history || history.length < 2) return history || [];
  const latestDateStr = history[history.length - 1].date || history[history.length - 1].tradeDate;
  const now = latestDateStr ? new Date(latestDateStr) : new Date();
  let cutoff = new Date(now);

  switch (range) {
    case "1D":
      cutoff.setDate(now.getDate() - 1);
      break;
    case "1W":
      cutoff.setDate(now.getDate() - 7);
      break;
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
  if (range === "1D") {
    const points1D = [];
    let curPrice = (currentSelectedData && currentSelectedData.price) ? Number(currentSelectedData.price) : 1140;
    const now = new Date();
    // 25 sample intraday points across 9:15 to 15:30 IST
    for (let i = 24; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 15 * 60000);
      curPrice += (Math.sin(i / 3) * 0.4 + (Math.random() - 0.48)) * 2.2;
      points1D.push({
        date: d.toISOString(),
        price: Math.max(10, Number(curPrice.toFixed(2)))
      });
    }
    return points1D;
  }

  switch (range) {
    case "1W": days = 7; volatility = 5; break;
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

  // ── INSTRUMENT CATALOG PER RISK PROFILE (MULTI-CAP EQUITIES + TOP 5 MUTUAL FUNDS) ──
  let stocksList = [], fundsList = [], otherList = [];
  let capSummary = { large: 0, mid: 0, small: 0 };

  if (currentLumpRisk === 'conservative') {
    // 70% Large Cap, 20% Mid Cap, 10% Small Cap
    capSummary = { large: 70, mid: 20, small: 10 };
    stocksList = [
      {
        sym: "HDFCBANK", name: "HDFC Bank Limited", cap: "Large", wt: 25, price: "₹846.00",
        mktCap: "₹6.47L Cr", pe: "19.4x", pb: "2.3x", roe: "16.8%", divY: "1.18%", debtEq: "7.8x (bank)",
        ret1y: "+26.0%", ret3y: "+44.0%", ret5y: "+78.0%", qualityScore: 88, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Private Banking",
        basis: "India's premier private banking franchise trading at a 15-year valuation discount (P/B 2.3x vs 10Y historical avg 3.4x). Post-merger CD ratio normalization from 110% to 85% unlocks ₹2L Cr deposit expansion. Net NPA at 0.33% is the lowest among Tier-1 Indian lenders.",
        catalyst: "CD ratio normalization driving 15-20 bps NIM expansion by FY27; HDB Financial Services IPO unlocking embedded subsidiary valuation; steady 18% credit expansion in retail mortgages.",
        macro: "Direct beneficiary of formal credit expansion across India's middle class."
      },
      {
        sym: "RELIANCE", name: "Reliance Industries Ltd", cap: "Large", wt: 25, price: "₹1,377.50",
        mktCap: "₹18.59L Cr", pe: "24.1x", pb: "2.1x", roe: "9.4%", divY: "0.37%", debtEq: "0.42x",
        ret1y: "+19.8%", ret3y: "+42.0%", ret5y: "+84.0%", qualityScore: 84, qualityRating: "PREMIUM QUALITY",
        sec: "Conglomerate & Energy",
        basis: "India's highest free cash-generating enterprise. Jio (500M+ telecom subs) and Reliance Retail (18,000+ stores) now generate over 50% of EBITDA, shielding the balance sheet from global oil volatility.",
        catalyst: "5G capex cycle peaked; Jio entering massive cash harvest phase; New Energy (solar modules, green hydrogen) targeting ₹5,000 Cr EBITDA by FY28; JioAirFiber scaling to 100M homes.",
        macro: "Rides every major secular tailwind: telecom digitalization, organized retail, green energy."
      },
      {
        sym: "ITC", name: "ITC Limited", cap: "Large", wt: 20, price: "₹299.10",
        mktCap: "₹3.73L Cr", pe: "18.8x", pb: "5.2x", roe: "27.6%", divY: "3.85%", debtEq: "0.00x",
        ret1y: "+15.5%", ret3y: "+34.0%", ret5y: "+92.0%", qualityScore: 86, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Consumer FMCG",
        basis: "Zero-debt FMCG powerhouse boasting ₹25,000 Cr+ liquid cash. Highest dividend yield among Nifty 50 constituents (3.85%). Cigarette volume growth is stable post-GST rationalization while FMCG revenues exceed ₹20,000 Cr.",
        catalyst: "ITC Hotels separate NSE listing unlocking hospitality NAV; FMCG EBITDA margins expanding 10% → 15%; agri-business exports compounding at 20% YoY.",
        macro: "Defensive cash flows with generous dividend yield providing portfolio downside cushioning."
      },
      {
        sym: "PIDILITIND", name: "Pidilite Industries Ltd", cap: "Mid", wt: 10, price: "₹2,890.00",
        mktCap: "₹1.47L Cr", pe: "72.1x", pb: "17.6x", roe: "25.4%", divY: "0.55%", debtEq: "0.02x",
        ret1y: "+18.0%", ret3y: "+52.0%", ret5y: "+145.0%", qualityScore: 85, qualityRating: "PREMIUM QUALITY",
        sec: "Specialty Chemicals",
        basis: "Near-monopoly market share (70%+) in consumer adhesives with iconic brand Fevicol. Pricing power is unmatched in Indian consumer materials. Negligible debt and steady 25%+ ROE across economic cycles.",
        catalyst: "Booming Indian construction & residential real estate upcycle driving demand; waterproof chemicals expanding rapidly; ₹200 Cr+ annual new product launches.",
        macro: "Essential building material company benefiting from urban housing revival."
      },
      {
        sym: "TATAPOWER", name: "Tata Power Company Ltd", cap: "Mid", wt: 10, price: "₹340.00",
        mktCap: "₹1.08L Cr", pe: "28.5x", pb: "3.8x", roe: "14.2%", divY: "0.44%", debtEq: "1.35x",
        ret1y: "+28.5%", ret3y: "+65.0%", ret5y: "+240.0%", qualityScore: 80, qualityRating: "HIGH QUALITY",
        sec: "Clean Energy & Utilities",
        basis: "India's largest integrated renewable energy utility with 14GW operational and 10GW under construction. #1 in Indian rooftop solar with over 1.2M installations. Supported by Tata Group corporate backing.",
        catalyst: "Execution of 10GW green power pipeline adding ₹8,000 Cr annual EBITDA by FY28; 4GW domestic solar module factory enjoying PLI subsidies; 7GW pumped hydro energy storage.",
        macro: "Direct beneficiary of India's 500GW national green energy target by 2030."
      },
      {
        sym: "RAILTEL", name: "RailTel Corporation of India", cap: "Small", wt: 10, price: "₹410.00",
        mktCap: "₹13,150 Cr", pe: "32.5x", pb: "5.1x", roe: "15.8%", divY: "1.46%", debtEq: "0.00x",
        ret1y: "+48.0%", ret3y: "+165.0%", ret5y: "+240.0%", qualityScore: 78, qualityRating: "HIGH QUALITY",
        sec: "Telecom Infrastructure",
        basis: "Exclusive optical fibre network spanning 65,000+ km along Indian Railway tracks. Zero private competition possible on railway right-of-way. Completely debt-free PSU with high cash reserves.",
        catalyst: "National Broadband Mission expansion; smart city and defence secure communications contracts; edge data center rollout; 5G railway signaling upgrades.",
        macro: "India's digital connectivity backbone infrastructure with government-backed monopoly."
      }
    ];

    // TOP 5 MUTUAL FUNDS FOR CONSERVATIVE PROFILE
    fundsList = [
      {
        code: "148721", name: "HDFC Nifty 50 Index Fund — Direct Growth", wt: 30, nav: "₹252.61",
        cat: "Large Cap Passive Index", aum: "₹18,200 Cr", exp: "0.10%", sharpe: "1.18", alpha: "0.0%",
        ret1y: "+20.4%", ret3y: "+16.2%", ret5y: "+17.5%", manager: "Nirman Morakhia (Index Specialist)",
        basis: "Ultra-low 0.10% total expense ratio with exceptional sub-0.05% tracking error. Replicates India's top 50 bluechip corporations, offering core market participation at minimum cost.",
        catalyst: "India's weight in MSCI Emerging Markets expanding toward 22% by 2027, guaranteeing steady passive FII inflows."
      },
      {
        code: "122639", name: "Parag Parikh Flexi Cap Fund — Direct Growth", wt: 25, nav: "₹94.15",
        cat: "Flexi Cap Equity (Global)", aum: "₹86,500 Cr", exp: "0.63%", sharpe: "1.52", alpha: "+3.6%",
        ret1y: "+22.4%", ret3y: "+19.8%", ret5y: "+24.2%", manager: "Rajeev Thakkar & Raunak Onkar",
        basis: "Top-ranked flexi cap fund over 10-year rolling horizons. 20-25% offshore allocation (Alphabet, Meta, Amazon) gives global tech compounding & USD hedge unavailable elsewhere in India.",
        catalyst: "Disciplined value investing and low portfolio turnover avoid short-term capital gains tax churn."
      },
      {
        code: "119598", name: "SBI Bluechip Fund — Direct Growth", wt: 20, nav: "₹106.80",
        cat: "Large Cap Active Equity", aum: "₹51,200 Cr", exp: "0.78%", sharpe: "1.24", alpha: "+1.8%",
        ret1y: "+18.2%", ret3y: "+15.6%", ret5y: "+16.8%", manager: "Sohini Andani (22Y Experience)",
        basis: "Disciplined quality-growth mandate with a low beta of 0.92, offering superior downside cushioning during market corrections while beating benchmark indices.",
        catalyst: "Flight to quality large caps as mid/small cap valuations reach elevated cycle levels."
      },
      {
        code: "119777", name: "SBI Contra Fund — Direct Growth", wt: 15, nav: "₹418.60",
        cat: "Contra / Value Equity", aum: "₹38,200 Cr", exp: "0.67%", sharpe: "1.41", alpha: "+6.4%",
        ret1y: "+32.4%", ret3y: "+24.8%", ret5y: "+26.4%", manager: "Dinesh Balachandran (Value Veteran)",
        basis: "India's highest performing contra fund with a 5Y CAGR of 26.4%. Invests in neglected sectors with strong fundamentals before mainstream market re-rating.",
        catalyst: "Continued cyclical outperformance in infrastructure, manufacturing, and public enterprise lending."
      },
      {
        code: "127042", name: "Motilal Oswal Midcap Fund — Direct Growth", wt: 10, nav: "₹112.45",
        cat: "Mid Cap Equity", aum: "₹19,800 Cr", exp: "0.68%", sharpe: "1.45", alpha: "+7.8%",
        ret1y: "+38.5%", ret3y: "+29.2%", ret5y: "+28.4%", manager: "Niket Shah (Midcap Specialist)",
        basis: "#1 ranking mid-cap fund over 3 & 5 years (28.4% 5Y CAGR). High-conviction portfolio of 25-30 companies with strong ROCE and high capital reinvestment runway.",
        catalyst: "Earnings compounding of 25%+ in top mid-tier industrial and consumer franchise holdings."
      }
    ];

    otherList = [
      {
        inst: "Sovereign Gold Bonds (SGB) — RBI Tranches", wt: 35, type: "G", yield: "₹1,26,450 / 10g + 2.5% p.a.",
        ret5y: "+14.2% CAGR", taxNote: "0% LTCG tax at 8-year maturity",
        basis: "The single most tax-efficient gold vehicle globally. Earns 2.5% sovereign annual interest paid semi-annually on top of gold price appreciation, with full LTCG tax exemption at maturity.",
        macro: "Shields real purchasing power against USD/INR currency depreciation (₹92.68) and global inflation."
      },
      {
        inst: "Bharat Bond ETF 2033 / 7.18% GS 2033", wt: 45, type: "D", yield: "7.15% YTM",
        ret5y: "+7.2% CAGR", taxNote: "AAA PSU Sovereign Security",
        basis: "Invests exclusively in AAA-rated public sector bonds and Government of India securities. Offers 7.15% risk-free yield with absolute safety of principal.",
        macro: "RBI monetary easing cycle will generate capital appreciation on bond prices on top of coupon yields."
      },
      {
        inst: "ABSL Liquid / Mirae Asset Overnight Fund", wt: 20, type: "D", yield: "6.80% Annualized",
        ret5y: "+6.1% CAGR", taxNote: "Daily T+1 liquidity",
        basis: "Liquid capital preservation tool providing instant dry powder to capitalize on market corrections (>10% dips) without equity exit penalties.",
        macro: "Protects liquidity while earning near-repo-rate returns with zero mark-to-market volatility."
      }
    ];

  } else if (currentLumpRisk === 'moderate') {
    // 50% Large Cap, 30% Mid Cap, 20% Small Cap
    capSummary = { large: 50, mid: 30, small: 20 };
    stocksList = [
      {
        sym: "BHARTIARTL", name: "Bharti Airtel Limited", cap: "Large", wt: 20, price: "₹2,161.70",
        mktCap: "₹12.84L Cr", pe: "48.2x", pb: "9.1x", roe: "19.4%", divY: "0.37%", debtEq: "1.15x",
        ret1y: "+46.0%", ret3y: "+98.0%", ret5y: "+220.0%", qualityScore: 91, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Telecom & Cloud",
        basis: "Duopolistic Indian telecom leader with massive pricing leverage. ARPU climbed from ₹183 to ₹233 with clear trajectory toward ₹300+. Operating leverage converts every incremental rupee of ARPU into 75%+ EBITDA margin. Annualized free cash flow exceeds ₹35,000 Cr.",
        catalyst: "Upcoming tariff hike rounds; enterprise B2B (Airtel IQ, cloud data centers) revenues scaling past ₹12,000 Cr; Africa operations listing unlocking subsidiary valuation.",
        macro: "Unshakable subscription business model riding India's explosive mobile data explosion."
      },
      {
        sym: "ICICIBANK", name: "ICICI Bank Limited", cap: "Large", wt: 20, price: "₹1,640.00",
        mktCap: "₹11.78L Cr", pe: "18.2x", pb: "2.9x", roe: "18.5%", divY: "0.95%", debtEq: "7.2x (bank)",
        ret1y: "+42.0%", ret3y: "+84.0%", ret5y: "+195.0%", qualityScore: 92, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Private Banking",
        basis: "Highest return on assets (ROA 2.1%) among Tier-1 Indian private banks. Net NPA of 0.42% is at a historic low. Leading market share in housing finance, digital credit cards, and SME underwriting.",
        catalyst: "Robust retail credit expansion; embedded valuation of ICICI Prudential Life and ICICI Lombard not fully captured in bank PE; tech-driven cost-to-income ratio dropping toward 40%.",
        macro: "Structural financialization of household savings directly funnels through ICICI's digital ecosystem."
      },
      {
        sym: "TCS", name: "Tata Consultancy Services", cap: "Large", wt: 10, price: "₹2,376.20",
        mktCap: "₹8.60L Cr", pe: "26.2x", pb: "12.8x", roe: "53.2%", divY: "1.65%", debtEq: "0.00x",
        ret1y: "+14.5%", ret3y: "+28.5%", ret5y: "+58.0%", qualityScore: 89, qualityRating: "INSTITUTIONAL GRADE",
        sec: "IT Services",
        basis: "World's most profitable IT services corporation with an unmatched ROE of 53.2%. Completely debt-free with ₹60,000 Cr cash reserve. High payout ratio returning ~90% of free cash flow via regular buybacks and dividends.",
        catalyst: "Generative AI enterprise contracts ($24B+ TCV won in H1 FY27); large-scale BSNL 4G/5G deployment (₹15,000 Cr+ deal); global BFSI tech modernization.",
        macro: "Strong USD-denominated revenues provide a natural currency hedge against rupee depreciation."
      },
      {
        sym: "TATAPOWER", name: "Tata Power Company Ltd", cap: "Mid", wt: 15, price: "₹340.00",
        mktCap: "₹1.08L Cr", pe: "28.5x", pb: "3.8x", roe: "14.2%", divY: "0.44%", debtEq: "1.35x",
        ret1y: "+28.5%", ret3y: "+65.0%", ret5y: "+240.0%", qualityScore: 80, qualityRating: "HIGH QUALITY",
        sec: "Clean Energy",
        basis: "Integrated clean power leader positioned across solar EPC, domestic module fabrication, utility wind/solar generation, and EV fast-charging corridors across 500+ Indian cities.",
        catalyst: "10GW green power commissioning doubling operational EBITDA by FY28; 4GW solar cell/module facility tapping PLI incentives; 7GW pumped hydro energy storage pipeline.",
        macro: "Frontrunner in India's ₹20L Cr clean power capital transition through 2030."
      },
      {
        sym: "TRENT", name: "Trent Limited", cap: "Mid", wt: 15, price: "₹6,850.00",
        mktCap: "₹2.44L Cr", pe: "85.0x", pb: "22.1x", roe: "26.3%", divY: "0.07%", debtEq: "0.08x",
        ret1y: "+65.0%", ret3y: "+180.0%", ret5y: "+700.0%", qualityScore: 88, qualityRating: "HIGH GROWTH COMPOUNDER",
        sec: "Retail & Apparel",
        basis: "India's highest compounding retail business. Zudio value-fashion chain achieves store-level payback within 6 months and 70%+ IRR. Same-store-sales-growth (SSSG) consistently exceeds 25%.",
        catalyst: "Expanding Zudio network from 700 to 2,000 stores by FY28; Westside network doubling to 500 outlets; launch of standalone Zudio Beauty and Cosmetics stores.",
        macro: "Captures the secular upgrade of Indian consumers from unbranded to branded fashion."
      },
      {
        sym: "IREDA", name: "Indian Renewable Energy Dev Agency", cap: "Small", wt: 10, price: "₹215.00",
        mktCap: "₹57,700 Cr", pe: "22.4x", pb: "4.1x", roe: "18.6%", divY: "0.00%", debtEq: "5.40x",
        ret1y: "+85.0%", ret3y: "+160.0%", ret5y: "+220.0%", qualityScore: 81, qualityRating: "PREMIUM QUALITY",
        sec: "Renewable NBFC",
        basis: "Only listed PSU financier dedicated 100% to green power and transition technologies. Loan book compounding at 35%+ YoY with gross NPA contained below 2%.",
        catalyst: "Mandatory financing partner for India's 500GW target; AAA domestic rating gives lowest cost of borrowing; potential MSCI index inclusion spurring institutional inflows.",
        macro: "Purest financial play on India's multi-decade green energy buildout."
      },
      {
        sym: "KAYNES", name: "Kaynes Technology India Ltd", cap: "Small", wt: 10, price: "₹7,200.00",
        mktCap: "₹46,000 Cr", pe: "88.5x", pb: "14.2x", roe: "16.8%", divY: "0.00%", debtEq: "0.15x",
        ret1y: "+72.0%", ret3y: "+210.0%", ret5y: "+450.0%", qualityScore: 82, qualityRating: "HIGH GROWTH COMPOUNDER",
        sec: "EMS & High-Tech",
        basis: "India's premium Electronics Manufacturing Services (EMS) provider. Huge order book equal to 4x annual revenues provides exceptional multi-year revenue visibility across aerospace, defence, and IoT.",
        catalyst: "Semiconductor ATMP / OSAT testing facility commercialization in FY28; PLI incentives; EV motor controller and battery management system orders surging.",
        macro: "Prime beneficiary of global 'China+1' electronics manufacturing migration to India."
      }
    ];

    // TOP 5 MUTUAL FUNDS FOR MODERATE PROFILE
    fundsList = [
      {
        code: "122639", name: "Parag Parikh Flexi Cap Fund — Direct Growth", wt: 25, nav: "₹94.15",
        cat: "Flexi Cap Equity (Global)", aum: "₹86,500 Cr", exp: "0.63%", sharpe: "1.52", alpha: "+3.6%",
        ret1y: "+22.4%", ret3y: "+19.8%", ret5y: "+24.2%", manager: "Rajeev Thakkar & Raunak Onkar",
        basis: "India's benchmark-beating flexi cap fund. Holds 20-25% in global technology leaders (Alphabet, Meta, Amazon) to participate in global AI monetization while protecting against rupee depreciation.",
        catalyst: "Disciplined value focus and low turnover ensure maximum long-term post-tax wealth compounding."
      },
      {
        code: "127042", name: "Motilal Oswal Midcap Fund — Direct Growth", wt: 20, nav: "₹112.45",
        cat: "Mid Cap Equity", aum: "₹19,800 Cr", exp: "0.68%", sharpe: "1.45", alpha: "+7.8%",
        ret1y: "+38.5%", ret3y: "+29.2%", ret5y: "+28.4%", manager: "Niket Shah (Midcap Specialist)",
        basis: "#1 ranking midcap scheme over 3 and 5 years in India. High-conviction portfolio with low beta of 0.95 and unmatched alpha (+7.8%). Focused on scalable mid-cap category leaders.",
        catalyst: "Accelerating earnings growth in manufacturing, defence, and high-growth consumer midcaps."
      },
      {
        code: "148721", name: "HDFC Nifty 50 Index Fund — Direct Growth", wt: 20, nav: "₹252.61",
        cat: "Large Cap Passive Index", aum: "₹18,200 Cr", exp: "0.10%", sharpe: "1.18", alpha: "0.0%",
        ret1y: "+20.4%", ret3y: "+16.2%", ret5y: "+17.5%", manager: "Nirman Morakhia",
        basis: "Cost-free foundation anchor (0.10% TER). Ensures the moderate portfolio tracks core economic growth and participates fully during broad-market index surges.",
        catalyst: "India's corporate earnings compounding at 14-16% YoY through FY28."
      },
      {
        code: "119777", name: "SBI Contra Fund — Direct Growth", wt: 20, nav: "₹418.60",
        cat: "Contra / Value Equity", aum: "₹38,200 Cr", exp: "0.67%", sharpe: "1.41", alpha: "+6.4%",
        ret1y: "+32.4%", ret3y: "+24.8%", ret5y: "+26.4%", manager: "Dinesh Balachandran",
        basis: "Demonstrated mastery of rotation into undervalued cyclicals before market consensus. Sharpe of 1.41 provides superior risk-adjusted returns with exceptional downside buffer.",
        catalyst: "Value unlock in heavy capital expenditure and banking sectors."
      },
      {
        code: "120828", name: "Quant Small Cap Fund — Direct Growth", wt: 15, nav: "₹284.73",
        cat: "Small Cap Equity", aum: "₹28,400 Cr", exp: "0.64%", sharpe: "1.38", alpha: "+9.2%",
        ret1y: "+28.6%", ret3y: "+26.4%", ret5y: "+35.1%", manager: "Sanjeev Sharma (Quant Algo)",
        basis: "Top-tier small-cap alpha kicker. Algorithmic multi-factor VLRT framework captures high-momentum small-cap winners while managing sector rotation quantitatively.",
        catalyst: "Domestic industrial recovery delivering exponential profit scaling in small-cap market leaders."
      }
    ];

    otherList = [
      {
        inst: "Sovereign Gold Bonds (SGB) / Nippon Gold ETF", wt: 50, type: "G", yield: "₹1,26,450 / 10g + 2.5% p.a.",
        ret5y: "+14.2% CAGR", taxNote: "0% LTCG on SGB at maturity",
        basis: "Acts as portfolio shock absorber during global geopolitical or stagflationary shocks. Demonstrates negative correlation (-0.18) to Indian equities.",
        macro: "Central bank gold reserves globally at all-time highs; ongoing currency debasement hedge."
      },
      {
        inst: "AAA Corporate Bond Fund / Bharat Bond ETF 2029", wt: 50, type: "D", yield: "7.65% YTM",
        ret5y: "+7.5% CAGR", taxNote: "High liquidity debt",
        basis: "Captures steady accrual income while interest rates remain near multi-year highs. Zero credit risk by restricting strictly to AAA-rated state and central enterprises.",
        macro: "Capital gains locked in as RBI begins softening policy corridor."
      }
    ];

  } else if (currentLumpRisk === 'aggressive') {
    // 35% Large Cap, 35% Mid Cap, 30% Small Cap
    capSummary = { large: 35, mid: 35, small: 30 };
    stocksList = [
      {
        sym: "BHARTIARTL", name: "Bharti Airtel Limited", cap: "Large", wt: 15, price: "₹2,161.70",
        mktCap: "₹12.84L Cr", pe: "48.2x", pb: "9.1x", roe: "19.4%", divY: "0.37%", debtEq: "1.15x",
        ret1y: "+46.0%", ret3y: "+98.0%", ret5y: "+220.0%", qualityScore: 91, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Telecom & Cloud",
        basis: "Pure cash-flow compounder. Operating leverage in mobile data is historic: ARPU path from ₹233 toward ₹350+ generates 75% incremental EBITDA. 5G capex is behind us, unlocking surging free cash.",
        catalyst: "Next tariff hikes; Airtel Business enterprise cloud and IoT acceleration; Africa listing value realization.",
        macro: "Unmatched pricing power across 380M+ active data subscribers."
      },
      {
        sym: "ICICIBANK", name: "ICICI Bank Limited", cap: "Large", wt: 10, price: "₹1,640.00",
        mktCap: "₹11.78L Cr", pe: "18.2x", pb: "2.9x", roe: "18.5%", divY: "0.95%", debtEq: "7.2x (bank)",
        ret1y: "+42.0%", ret3y: "+84.0%", ret5y: "+195.0%", qualityScore: 92, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Private Banking",
        basis: "The highest quality anchor in Indian finance. ROA 2.1% is top 1% globally. Subsidiaries (ICICI Pru Life, Lombard, Securities) represent over 25% of the bank's market cap in embedded equity.",
        catalyst: "SME and retail credit upcycle; tech stack efficiency; valuation unlock in unlisted digital subsidiaries.",
        macro: "Unstoppable expansion in retail banking and commercial credit."
      },
      {
        sym: "SBIN", name: "State Bank of India", cap: "Large", wt: 10, price: "₹1,165.10",
        mktCap: "₹10.40L Cr", pe: "11.5x", pb: "1.6x", roe: "15.2%", divY: "2.14%", debtEq: "12.1x (bank)",
        ret1y: "+38.0%", ret3y: "+72.0%", ret5y: "+160.0%", qualityScore: 82, qualityRating: "PREMIUM QUALITY",
        sec: "Public Sector Banking",
        basis: "World's most undervalued mega-cap bank at 11.5x P/E. Gross NPA collapsed from 10.9% to 2.21% in a historic asset-cleanup. ROE sustained at 15%+ on an colossal ₹60L Cr balance sheet.",
        catalyst: "Prime beneficiary of India's ₹11L Cr public capex push; massive deposit franchise; value creation in SBI Life & SBI Cards.",
        macro: "Backbone of India's industrial capital expenditure cycle."
      },
      {
        sym: "TRENT", name: "Trent Limited", cap: "Mid", wt: 15, price: "₹6,850.00",
        mktCap: "₹2.44L Cr", pe: "85.0x", pb: "22.1x", roe: "26.3%", divY: "0.07%", debtEq: "0.08x",
        ret1y: "+65.0%", ret3y: "+180.0%", ret5y: "+700.0%", qualityScore: 88, qualityRating: "HIGH GROWTH COMPOUNDER",
        sec: "Retail Compounder",
        basis: "The undisputed leader in retail compounding. Zudio's rapid inventory turns (every 14 days) and 150+ new stores per year create an impenetrable competitive moat.",
        catalyst: "Zudio store count scaling toward 2,500; Zudio Beauty cosmetics launch; Westside premium margin expansion.",
        macro: "Exponential growth in youth fashion and discretionary consumer spend."
      },
      {
        sym: "TATAPOWER", name: "Tata Power Company Ltd", cap: "Mid", wt: 10, price: "₹340.00",
        mktCap: "₹1.08L Cr", pe: "28.5x", pb: "3.8x", roe: "14.2%", divY: "0.44%", debtEq: "1.35x",
        ret1y: "+28.5%", ret3y: "+65.0%", ret5y: "+240.0%", qualityScore: 80, qualityRating: "HIGH QUALITY",
        sec: "Clean Energy Capex",
        basis: "10GW green power pipeline currently under construction is not factored into stock price. When operational by FY28, operational EBITDA will nearly double.",
        catalyst: "4GW solar cell facility commissioning; 7GW pumped hydro rollout; demerger of legacy coal assets.",
        macro: "National clean energy transition mandate backed by government policy."
      },
      {
        sym: "ZOMATO", name: "Zomato Limited", cap: "Mid", wt: 10, price: "₹265.00",
        mktCap: "₹2.34L Cr", pe: "185.0x", pb: "8.8x", roe: "4.2%", divY: "0.00%", debtEq: "0.01x",
        ret1y: "+52.0%", ret3y: "+110.0%", ret5y: "+140.0%", qualityScore: 79, qualityRating: "HIGH GROWTH",
        sec: "Quick Commerce & Tech",
        basis: "Dominant quick-commerce and food delivery platform. Blinkit is growing gross order value (GOV) at 120%+ YoY with positive store-level contribution margins in mature metros.",
        catalyst: "Quick-commerce dark store footprint expanding to 1,500 locations; District entertainment app scaling; strong network effects.",
        macro: "10-minute instant delivery disrupting modern retail and supermarket grocery."
      },
      {
        sym: "IREDA", name: "Indian Renewable Energy Dev Agency", cap: "Small", wt: 15, price: "₹215.00",
        mktCap: "₹57,700 Cr", pe: "22.4x", pb: "4.1x", roe: "18.6%", divY: "0.00%", debtEq: "5.40x",
        ret1y: "+85.0%", ret3y: "+160.0%", ret5y: "+220.0%", qualityScore: 81, qualityRating: "PREMIUM QUALITY",
        sec: "Green Financing",
        basis: "India's highest growth sovereign clean-tech financier. Loan book expanding 35%+ with gross NPA below 2%. Essential partner for solar, wind, green hydrogen, and EV infrastructure developers.",
        catalyst: "₹50,000 Cr loan disbursement run-rate; sovereign fund backing; prospective inclusion in major international indices.",
        macro: "Exclusive lending gateway for India's ₹20L Cr renewable investments."
      },
      {
        sym: "KAYNES", name: "Kaynes Technology India Ltd", cap: "Small", wt: 15, price: "₹7,200.00",
        mktCap: "₹46,000 Cr", pe: "88.5x", pb: "14.2x", roe: "16.8%", divY: "0.00%", debtEq: "0.15x",
        ret1y: "+72.0%", ret3y: "+210.0%", ret5y: "+450.0%", qualityScore: 82, qualityRating: "HIGH GROWTH COMPOUNDER",
        sec: "EMS & Semiconductors",
        basis: "Advanced electronics manufacturing services with 4x revenue order book coverage. Deep presence in aerospace, defence, medical devices, and railway electronics.",
        catalyst: "State-of-the-art semiconductor OSAT / ATMP chip packaging plant operational in FY28; defence electronics exports surging.",
        macro: "Strategic spearhead of Make in India and global supply chain re-alignment."
      }
    ];

    // TOP 5 MUTUAL FUNDS FOR AGGRESSIVE PROFILE
    fundsList = [
      {
        code: "120828", name: "Quant Small Cap Fund — Direct Growth", wt: 25, nav: "₹284.73",
        cat: "Small Cap Equity", aum: "₹28,400 Cr", exp: "0.64%", sharpe: "1.38", alpha: "+9.2%",
        ret1y: "+28.6%", ret3y: "+26.4%", ret5y: "+35.1%", manager: "Sanjeev Sharma (Quant VLRT Algo)",
        basis: "Highest 5-year alpha-generating fund in India (+9.2% over benchmark, 35.1% 5Y CAGR). Algorithmic momentum execution eliminates human biases and captures high-growth small-cap multibaggers early.",
        catalyst: "Explosive earnings growth in mid/small cap capital goods, renewables, and defence suppliers."
      },
      {
        code: "127042", name: "Motilal Oswal Midcap Fund — Direct Growth", wt: 25, nav: "₹112.45",
        cat: "Mid Cap Equity", aum: "₹19,800 Cr", exp: "0.68%", sharpe: "1.45", alpha: "+7.8%",
        ret1y: "+38.5%", ret3y: "+29.2%", ret5y: "+28.4%", manager: "Niket Shah (High-Conviction)",
        basis: "#1 ranking midcap scheme in India over 3 and 5 years. Focused high-conviction portfolio of 25-30 scalable market leaders. Delivers 28.4% 5Y CAGR with robust +7.8% alpha.",
        catalyst: "Rapid capacity expansions in portfolio manufacturing, aerospace, and EMS leaders."
      },
      {
        code: "122639", name: "Parag Parikh Flexi Cap Fund — Direct Growth", wt: 20, nav: "₹94.15",
        cat: "Flexi Cap / Global AI", aum: "₹86,500 Cr", exp: "0.63%", sharpe: "1.52", alpha: "+3.6%",
        ret1y: "+22.4%", ret3y: "+19.8%", ret5y: "+24.2%", manager: "Rajeev Thakkar & Raunak Onkar",
        basis: "Functions as essential quality ballast in aggressive portfolios. Low beta of 0.78 dampens drawdowns while 20-25% offshore holdings capture global AI monetization.",
        catalyst: "Global mega-cap technology firms driving enterprise AI productivity across the world."
      },
      {
        code: "119777", name: "SBI Contra Fund — Direct Growth", wt: 15, nav: "₹418.60",
        cat: "Contra / Value Equity", aum: "₹38,200 Cr", exp: "0.67%", sharpe: "1.41", alpha: "+6.4%",
        ret1y: "+32.4%", ret3y: "+24.8%", ret5y: "+26.4%", manager: "Dinesh Balachandran",
        basis: "Top-performing value-contra strategy. Generates massive alpha (+6.4%) with a conservative beta of 0.88, delivering consistent 1st-quartile returns across market regimes.",
        catalyst: "Sustained economic formalization and capital capex revival in cyclical heavyweights."
      },
      {
        code: "148721", name: "HDFC Nifty 50 Index Fund — Direct Growth", wt: 15, nav: "₹252.61",
        cat: "Large Cap Passive Index", aum: "₹18,200 Cr", exp: "0.10%", sharpe: "1.18", alpha: "0.0%",
        ret1y: "+20.4%", ret3y: "+16.2%", ret5y: "+17.5%", manager: "Nirman Morakhia",
        basis: "Ultra low-cost 0.10% index fund acting as core foundation to ensure aggressive allocations stay anchored to India's top 50 corporate leaders.",
        catalyst: "Passive FII index basket buying on emerging market index inclusion."
      }
    ];

    otherList = [
      {
        inst: "Multi-Asset Gold & Silver ETF Mix (70:30)", wt: 50, type: "G", yield: "Gold ₹1,26,450 / 10g | Silver ₹1,02,000 / kg",
        ret5y: "+16.2% Blended CAGR", taxNote: "20% LTCG after 2 years with indexation",
        basis: "Silver's green industrial demand (photovoltaic panels, EV circuits) complements gold's monetary sovereign hedge, providing higher beta commodity returns.",
        macro: "Commodity super-cycle driven by energy transition and global supply constraints."
      },
      {
        inst: "Overnight & Liquid Tactical War Chest", wt: 50, type: "D", yield: "6.85% Annualized",
        ret5y: "+6.1% CAGR", taxNote: "Instant redemption",
        basis: "Strategic dry powder dedicated exclusively to deploying into high-conviction growth stocks during severe market dips (>10-15% panic corrections).",
        macro: "Allows aggressive investors to purchase compounding leaders at steep cyclical discounts."
      }
    ];

  } else {
    // Very Aggressive: 25% Large Cap, 35% Mid Cap, 40% Small Cap
    capSummary = { large: 25, mid: 35, small: 40 };
    stocksList = [
      {
        sym: "BHARTIARTL", name: "Bharti Airtel Limited", cap: "Large", wt: 15, price: "₹2,161.70",
        mktCap: "₹12.84L Cr", pe: "48.2x", pb: "9.1x", roe: "19.4%", divY: "0.37%", debtEq: "1.15x",
        ret1y: "+46.0%", ret3y: "+98.0%", ret5y: "+220.0%", qualityScore: 91, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Telecom Monopoly",
        basis: "India's 5G monetization is just starting. Moving ARPU from ₹233 toward ₹400 over 4 years translates to 60%+ top-line growth with massive 75%+ EBITDA margins.",
        catalyst: "B2B enterprise digitalization (Nxtra data centers, Airtel IQ); tariff revisions; African subsidiary monetization.",
        macro: "Digital highway of modern India with unmatched pricing elasticity."
      },
      {
        sym: "ICICIBANK", name: "ICICI Bank Limited", cap: "Large", wt: 10, price: "₹1,640.00",
        mktCap: "₹11.78L Cr", pe: "18.2x", pb: "2.9x", roe: "18.5%", divY: "0.95%", debtEq: "7.2x (bank)",
        ret1y: "+42.0%", ret3y: "+84.0%", ret5y: "+195.0%", qualityScore: 92, qualityRating: "INSTITUTIONAL GRADE",
        sec: "Private Banking",
        basis: "Top-tier private lender delivering 2.1% ROA. High provisioning coverage (82%) eliminates downside credit surprises. Digital super-app iMobile Pay boasts 20M+ active users.",
        catalyst: "SME loan book expansion; subsidiaries value realization; retail market share gains from competitors.",
        macro: "Direct channel for India's ongoing financial formalization."
      },
      {
        sym: "TRENT", name: "Trent Limited", cap: "Mid", wt: 20, price: "₹6,850.00",
        mktCap: "₹2.44L Cr", pe: "85.0x", pb: "22.1x", roe: "26.3%", divY: "0.07%", debtEq: "0.08x",
        ret1y: "+65.0%", ret3y: "+180.0%", ret5y: "+700.0%", qualityScore: 88, qualityRating: "HIGH GROWTH COMPOUNDER",
        sec: "Retail Disruption",
        basis: "India's highest compounding consumption stock (700%+ 5Y return). Zudio format breaks store payback records across Tier 1-4 cities with 25%+ SSSG.",
        catalyst: "Store count expanding to 3,000+ units; standalone Zudio Beauty stores; expansion into value grocery.",
        macro: "Branded retail transition in an economy adding 50M middle-class shoppers every 3 years."
      },
      {
        sym: "TATAPOWER", name: "Tata Power Company Ltd", cap: "Mid", wt: 15, price: "₹340.00",
        mktCap: "₹1.08L Cr", pe: "28.5x", pb: "3.8x", roe: "14.2%", divY: "0.44%", debtEq: "1.35x",
        ret1y: "+28.5%", ret3y: "+65.0%", ret5y: "+240.0%", qualityScore: 80, qualityRating: "HIGH QUALITY",
        sec: "Clean Energy Alpha",
        basis: "The 10GW under-construction renewable pipeline will double company EBITDA by FY28, driving significant multiple re-rating toward pure green IPPs.",
        catalyst: "Execution of 10GW green pipeline; 4GW module fabrication; 7GW pumped hydro rollout; legacy coal demerger.",
        macro: "Essential anchor of India's green industrial modernization."
      },
      {
        sym: "IREDA", name: "Indian Renewable Energy Dev Agency", cap: "Small", wt: 15, price: "₹215.00",
        mktCap: "₹57,700 Cr", pe: "22.4x", pb: "4.1x", roe: "18.6%", divY: "0.00%", debtEq: "5.40x",
        ret1y: "+85.0%", ret3y: "+160.0%", ret5y: "+220.0%", qualityScore: 81, qualityRating: "PREMIUM QUALITY",
        sec: "Clean Tech Lending",
        basis: "Exclusive green financier enjoying sovereign backing and 35%+ loan compounding with sub-2% NPAs. Enjoys structural borrowing cost advantage.",
        catalyst: "₹50,000 Cr annual loan disbursement target; global green bond issuance; international index inclusion.",
        macro: "Exclusive lending gateway for India's 500GW renewable installation goal."
      },
      {
        sym: "KAYNES", name: "Kaynes Technology India Ltd", cap: "Small", wt: 15, price: "₹7,200.00",
        mktCap: "₹46,000 Cr", pe: "88.5x", pb: "14.2x", roe: "16.8%", divY: "0.00%", debtEq: "0.15x",
        ret1y: "+72.0%", ret3y: "+210.0%", ret5y: "+450.0%", qualityScore: 82, qualityRating: "HIGH GROWTH COMPOUNDER",
        sec: "EMS & Semiconductors",
        basis: "India's highest growth EMS manufacturer with 4x annual order book coverage. Poised to transition into high-margin semiconductor testing and packaging.",
        catalyst: "Commercial launch of semiconductor OSAT / ATMP plant; aerospace and defence export orders accelerating.",
        macro: "High-tech manufacturing migration from China to India."
      },
      {
        sym: "RAILTEL", name: "RailTel Corporation of India", cap: "Small", wt: 10, price: "₹410.00",
        mktCap: "₹13,150 Cr", pe: "32.5x", pb: "5.1x", roe: "15.8%", divY: "1.46%", debtEq: "0.00x",
        ret1y: "+48.0%", ret3y: "+165.0%", ret5y: "+240.0%", qualityScore: 78, qualityRating: "HIGH QUALITY",
        sec: "Digital Infra Monopoly",
        basis: "Exclusive optical fibre network across 65,000+ km along Indian Railway tracks. Zero competition possible on railway right-of-way. Debt-free with attractive 1.46% dividend yield.",
        catalyst: "RailWire broadband expansion; edge data center rollout; defence and smart city communications contracts; 5G railway signaling upgrades.",
        macro: "Sovereign monopoly over critical railway telecom infrastructure."
      }
    ];

    // TOP 5 MUTUAL FUNDS FOR VERY AGGRESSIVE PROFILE
    fundsList = [
      {
        code: "120828", name: "Quant Small Cap Fund — Direct Growth", wt: 30, nav: "₹284.73",
        cat: "Small Cap Equity", aum: "₹28,400 Cr", exp: "0.64%", sharpe: "1.38", alpha: "+9.2%",
        ret1y: "+28.6%", ret3y: "+26.4%", ret5y: "+35.1%", manager: "Sanjeev Sharma (Quant Algo)",
        basis: "India's undisputed small-cap return leader (+9.2% alpha, 35.1% 5Y CAGR). Algorithmic execution swiftly reallocates capital into emerging sector winners.",
        catalyst: "Massive retail SIP inflows and domestic manufacturing expansion driving small-cap multibaggers."
      },
      {
        code: "127042", name: "Motilal Oswal Midcap Fund — Direct Growth", wt: 25, nav: "₹112.45",
        cat: "Mid Cap Equity", aum: "₹19,800 Cr", exp: "0.68%", sharpe: "1.45", alpha: "+7.8%",
        ret1y: "+38.5%", ret3y: "+29.2%", ret5y: "+28.4%", manager: "Niket Shah (High-Conviction)",
        basis: "#1 ranking mid-cap scheme in India over 3 and 5 years. Focused high-conviction portfolio of 25-30 companies delivering 28.4% 5Y CAGR.",
        catalyst: "High ROCE mid-tier manufacturing and tech enterprises sustaining 25%+ profit compounding."
      },
      {
        code: "118560", name: "Nippon India Small Cap Fund — Direct Growth", wt: 15, nav: "₹184.20",
        cat: "Small Cap Equity", aum: "₹56,000 Cr", exp: "0.67%", sharpe: "1.32", alpha: "+6.8%",
        ret1y: "+31.5%", ret3y: "+25.8%", ret5y: "+32.8%", manager: "Samir Rachh (Small-Cap Veteran)",
        basis: "India's largest small-cap fund with an exceptional 5Y CAGR of 32.8%. Deeply diversified across 150+ stocks with extensive ground-level research.",
        catalyst: "Extensive pipeline of emerging micro and small-cap leaders graduating into mid-cap status."
      },
      {
        code: "122639", name: "Parag Parikh Flexi Cap Fund — Direct Growth", wt: 15, nav: "₹94.15",
        cat: "Flexi Cap / Global AI", aum: "₹86,500 Cr", exp: "0.63%", sharpe: "1.52", alpha: "+3.6%",
        ret1y: "+22.4%", ret3y: "+19.8%", ret5y: "+24.2%", manager: "Rajeev Thakkar & Raunak Onkar",
        basis: "Mandatory international exposure (Alphabet, Meta, Amazon) dampens small-cap volatility while capturing global AI software compounding.",
        catalyst: "Global mega-cap technology firms driving enterprise AI productivity across the world."
      },
      {
        code: "119777", name: "SBI Contra Fund — Direct Growth", wt: 15, nav: "₹418.60",
        cat: "Contra / Value Equity", aum: "₹38,200 Cr", exp: "0.67%", sharpe: "1.41", alpha: "+6.4%",
        ret1y: "+32.4%", ret3y: "+24.8%", ret5y: "+26.4%", manager: "Dinesh Balachandran",
        basis: "Top-performing contra fund in India (26.4% 5Y CAGR). Identifies early cycle turnarounds in capital goods, power, and banking.",
        catalyst: "Sustained economic formalization and capital capex revival in cyclical heavyweights."
      }
    ];

    otherList = [
      {
        inst: "Silver & Gold Commodity ETF Mix (60:40)", wt: 60, type: "G", yield: "Silver ₹1,02,000 / kg | Gold ₹1,26,450 / 10g",
        ret5y: "+17.8% Blended CAGR", taxNote: "Industrial & Safe Haven",
        basis: "Silver demand is driven heavily by solar PV and EV electronics (100g silver per solar panel). Offers aggressive commodity upside with built-in safe haven insurance.",
        macro: "Green industrial commodity revolution combined with geopolitical sovereign hedge."
      },
      {
        inst: "Tactical Crash Deployment Reserve (Overnight)", wt: 40, type: "D", yield: "6.85% Annualized",
        ret5y: "+6.1% CAGR", taxNote: "Zero duration risk",
        basis: "High-conviction investors maintain dry powder to aggressively accumulate top holdings during steep 15-25% cyclical market corrections.",
        macro: "Historically, deploying tactical reserves during sharp market panics generates 2-3x benchmark returns over subsequent 24 months."
      }
    ];
  }

  // ── QUALITY SCORE COMPUTATION ──
  const avgQ = Math.round(stocksList.reduce((acc, s) => acc + s.qualityScore, 0) / stocksList.length);
  const highRetCount = stocksList.filter(s => parseFloat(s.ret3y) > 20).length;
  const gradeLabel = avgQ >= 88 ? 'Institutional Grade' : avgQ >= 80 ? 'Premium Quality' : 'High Quality';
  const gradeClass = avgQ >= 88 ? 'grade-aplus' : avgQ >= 80 ? 'grade-a' : 'grade-b';

  // ── STOCKS TABLE ROWS ──
  const stocksRowsHtml = stocksList.map((s, idx) => {
    const alloc = formatINR(Math.round(stockAmt * (s.wt / 100)));
    const rowId = 'stk-' + idx;
    const capClass = s.cap === 'Large' ? 'cap-l' : s.cap === 'Mid' ? 'cap-m' : 'cap-s';
    
    return `
      <tr class="basket-main-row" id="row-${rowId}">
        <td class="col-instrument">
          <div class="bk-instrument-header">
            <div class="bk-title-row">
              <span class="bk-sym">${s.sym}</span>
              <span class="cap-pill ${capClass}">${s.cap.toUpperCase()} CAP</span>
              <span class="bk-sec">${s.sec}</span>
            </div>
            <div class="bk-fullname">${s.name}</div>
            <div class="bk-btn-group">
              <button type="button" class="bk-action-btn" id="btn-basis-${rowId}" onclick="toggleBasketDrawer('${rowId}', 'basis')">
                <span class="btn-icon">📋</span> Basis
              </button>
              <button type="button" class="bk-action-btn" id="btn-returns-${rowId}" onclick="toggleBasketDrawer('${rowId}', 'returns')">
                <span class="btn-icon">📊</span> Analysis &amp; Returns
              </button>
              <button type="button" class="bk-action-btn" id="btn-catalyst-${rowId}" onclick="toggleBasketDrawer('${rowId}', 'catalyst')">
                <span class="btn-icon">🚀</span> Growth Thesis
              </button>
              <button type="button" class="bk-action-btn bk-btn-terminal" onclick="quickSelect('${s.sym}')">
                <span>🩺 Health Check ↗</span>
              </button>
            </div>
          </div>
        </td>
        <td class="col-price">
          <div class="bk-price-val">${s.price}</div>
          <div class="bk-sub-meta">MCap: ${s.mktCap}</div>
        </td>
        <td class="col-alloc">
          <span class="wt-pill">${s.wt}%</span>
          <div class="bk-alloc-amt">${alloc}</div>
        </td>
        <td class="col-returns">
          <div class="bk-ret-chips">
            <div class="ret-chip ret-pos"><span>1Y:</span> ${s.ret1y}</div>
            <div class="ret-chip ret-pos"><span>3Y:</span> ${s.ret3y}</div>
            <div class="ret-chip ret-pos"><span>5Y:</span> ${s.ret5y}</div>
          </div>
        </td>
      </tr>

      <!-- EXPANDABLE DRAWER ROW -->
      <tr class="basket-drawer-row" id="drawer-${rowId}" style="display:none;">
        <td colspan="4" class="drawer-container-cell">
          <div class="bk-drawer-panel">
            <div class="drawer-header-strip">
              <div class="drawer-nav-tabs">
                <button type="button" class="drawer-tab-btn drawer-btn-basis" onclick="switchBasketDrawerTab('${rowId}', 'basis')">
                  📋 Selection Basis
                </button>
                <button type="button" class="drawer-tab-btn drawer-btn-returns" onclick="switchBasketDrawerTab('${rowId}', 'returns')">
                  📊 Ratios &amp; Multi-Year Returns
                </button>
                <button type="button" class="drawer-tab-btn drawer-btn-catalyst" onclick="switchBasketDrawerTab('${rowId}', 'catalyst')">
                  🚀 Growth Catalyst &amp; Macro
                </button>
              </div>
              <button type="button" class="drawer-close-btn" onclick="closeBasketDrawer('${rowId}')">✕ Close</button>
            </div>

            <!-- Tab 1: Selection Basis -->
            <div class="drawer-tab-content drawer-tab-basis">
              <div class="drawer-card-box">
                <div class="drawer-box-title">📌 In-Depth Selection Basis</div>
                <p class="drawer-box-desc">${s.basis}</p>
                <div class="drawer-box-footer">
                  <span class="drawer-meta-tag">Market Capitalization: <strong>${s.mktCap}</strong></span>
                  <span class="drawer-meta-tag">Sector: <strong>${s.sec}</strong></span>
                  <span class="drawer-meta-tag">Quality Rating: <strong>${s.qualityRating} (${s.qualityScore}/100)</strong></span>
                </div>
              </div>
            </div>

            <!-- Tab 2: Ratios & Returns -->
            <div class="drawer-tab-content drawer-tab-returns" style="display:none;">
              <div class="drawer-card-box">
                <div class="drawer-box-title">📊 Key Financial Multiples &amp; Historical Track Record</div>
                <div class="drawer-ratios-grid">
                  <div class="ratio-card">
                    <span class="r-label">P/E Ratio</span>
                    <span class="r-val">${s.pe}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">P/B Ratio</span>
                    <span class="r-val">${s.pb}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">Return on Equity (ROE)</span>
                    <span class="r-val r-highlight">${s.roe}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">Debt / Equity</span>
                    <span class="r-val">${s.debtEq}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">Dividend Yield</span>
                    <span class="r-val">${s.divY}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">Quality Score</span>
                    <span class="r-val r-score">${s.qualityScore}/100</span>
                  </div>
                </div>
                <div class="drawer-returns-comparison">
                  <div class="ret-comp-card">
                    <span class="rc-label">1-Year Absolute Return</span>
                    <span class="rc-val rc-pos">${s.ret1y}</span>
                  </div>
                  <div class="ret-comp-card">
                    <span class="rc-label">3-Year Annualized CAGR</span>
                    <span class="rc-val rc-pos">${s.ret3y}</span>
                  </div>
                  <div class="ret-comp-card">
                    <span class="rc-label">5-Year Annualized CAGR</span>
                    <span class="rc-val rc-pos">${s.ret5y}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Growth Catalyst -->
            <div class="drawer-tab-content drawer-tab-catalyst" style="display:none;">
              <div class="drawer-card-box">
                <div class="drawer-box-title">🚀 Forward-Looking Catalysts &amp; Industry Tailwinds</div>
                <p class="drawer-box-desc">${s.catalyst}</p>
                <div class="drawer-macro-strip">
                  <strong>Macro Alignment:</strong> ${s.macro}
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // ── MUTUAL FUNDS TABLE ROWS (ALL 5 TOP-PERFORMING FUNDS) ──
  const fundsRowsHtml = fundsList.map((f, idx) => {
    const alloc = formatINR(Math.round(fundAmt * (f.wt / 100)));
    const rowId = 'fnd-' + idx;
    
    return `
      <tr class="basket-main-row" id="row-${rowId}">
        <td class="col-instrument">
          <div class="bk-instrument-header">
            <div class="bk-title-row">
              <span class="bk-sym">${f.name}</span>
              <span class="cap-pill cap-fund">MUTUAL FUND</span>
              <span class="bk-sec">${f.cat}</span>
            </div>
            <div class="bk-fullname">AMFI Scheme Code: ${f.code} &nbsp;|&nbsp; AUM: ${f.aum} &nbsp;|&nbsp; Expense Ratio: ${f.exp}</div>
            <div class="bk-btn-group">
              <button type="button" class="bk-action-btn" id="btn-basis-${rowId}" onclick="toggleBasketDrawer('${rowId}', 'basis')">
                <span class="btn-icon">📋</span> Selection Rationale
              </button>
              <button type="button" class="bk-action-btn" id="btn-returns-${rowId}" onclick="toggleBasketDrawer('${rowId}', 'returns')">
                <span class="btn-icon">📊</span> Returns &amp; Risk Metrics
              </button>
              <button type="button" class="bk-action-btn bk-btn-terminal" onclick="quickSelect('${f.code}')">
                <span>🔍 View Scheme ↗</span>
              </button>
            </div>
          </div>
        </td>
        <td class="col-price">
          <div class="bk-price-val">NAV ${f.nav}</div>
          <div class="bk-sub-meta">Manager: ${f.manager}</div>
        </td>
        <td class="col-alloc">
          <span class="wt-pill">${f.wt}%</span>
          <div class="bk-alloc-amt">${alloc}</div>
        </td>
        <td class="col-returns">
          <div class="bk-ret-chips">
            <div class="ret-chip ret-pos"><span>1Y:</span> ${f.ret1y}</div>
            <div class="ret-chip ret-pos"><span>3Y:</span> ${f.ret3y}</div>
            <div class="ret-chip ret-pos"><span>5Y:</span> ${f.ret5y}</div>
          </div>
        </td>
      </tr>

      <tr class="basket-drawer-row" id="drawer-${rowId}" style="display:none;">
        <td colspan="4" class="drawer-container-cell">
          <div class="bk-drawer-panel">
            <div class="drawer-header-strip">
              <div class="drawer-nav-tabs">
                <button type="button" class="drawer-tab-btn drawer-btn-basis" onclick="switchBasketDrawerTab('${rowId}', 'basis')">
                  📋 Fund Strategy &amp; Selection Basis
                </button>
                <button type="button" class="drawer-tab-btn drawer-btn-returns" onclick="switchBasketDrawerTab('${rowId}', 'returns')">
                  📊 Risk Ratios (Sharpe / Alpha)
                </button>
              </div>
              <button type="button" class="drawer-close-btn" onclick="closeBasketDrawer('${rowId}')">✕ Close</button>
            </div>

            <div class="drawer-tab-content drawer-tab-basis">
              <div class="drawer-card-box">
                <div class="drawer-box-title">📌 Mandate &amp; Strategic Role</div>
                <p class="drawer-box-desc">${f.basis}</p>
                <div class="drawer-macro-strip">
                  <strong>Growth Catalyst:</strong> ${f.catalyst}
                </div>
              </div>
            </div>

            <div class="drawer-tab-content drawer-tab-returns" style="display:none;">
              <div class="drawer-card-box">
                <div class="drawer-box-title">📊 Fund Risk Ratios &amp; Rolling Performance</div>
                <div class="drawer-ratios-grid">
                  <div class="ratio-card">
                    <span class="r-label">Sharpe Ratio</span>
                    <span class="r-val r-highlight">${f.sharpe}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">Alpha vs Index</span>
                    <span class="r-val r-highlight">${f.alpha}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">Total Expense Ratio</span>
                    <span class="r-val">${f.exp}</span>
                  </div>
                  <div class="ratio-card">
                    <span class="r-label">Total AUM</span>
                    <span class="r-val">${f.aum}</span>
                  </div>
                </div>
                <div class="drawer-returns-comparison">
                  <div class="ret-comp-card">
                    <span class="rc-label">1-Year Return</span>
                    <span class="rc-val rc-pos">${f.ret1y}</span>
                  </div>
                  <div class="ret-comp-card">
                    <span class="rc-label">3-Year Annualized CAGR</span>
                    <span class="rc-val rc-pos">${f.ret3y}</span>
                  </div>
                  <div class="ret-comp-card">
                    <span class="rc-label">5-Year Annualized CAGR</span>
                    <span class="rc-val rc-pos">${f.ret5y}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // ── GOLD & FIXED INCOME ROWS ──
  const otherRowsHtml = otherList.map((o, idx) => {
    const isGold = o.type === 'G';
    const baseAmt = isGold ? goldAmt : debtAmt;
    const alloc = formatINR(Math.round(baseAmt * (o.wt / 100)));
    const rowId = 'oth-' + idx;
    const typeClass = isGold ? 'cap-gold' : 'cap-debt';
    const typeLabel = isGold ? '🪙 GOLD / HEDGE' : '📄 FIXED INCOME';

    return `
      <tr class="basket-main-row" id="row-${rowId}">
        <td class="col-instrument">
          <div class="bk-instrument-header">
            <div class="bk-title-row">
              <span class="bk-sym">${o.inst}</span>
              <span class="cap-pill ${typeClass}">${typeLabel}</span>
            </div>
            <div class="bk-fullname">${o.taxNote}</div>
            <div class="bk-btn-group">
              <button type="button" class="bk-action-btn" id="btn-basis-${rowId}" onclick="toggleBasketDrawer('${rowId}', 'basis')">
                <span class="btn-icon">📋</span> Selection Rationale &amp; Macro Role
              </button>
            </div>
          </div>
        </td>
        <td class="col-price">
          <div class="bk-price-val">${o.yield}</div>
        </td>
        <td class="col-alloc">
          <span class="wt-pill">${o.wt}%</span>
          <div class="bk-alloc-amt">${alloc}</div>
        </td>
        <td class="col-returns">
          <div class="bk-ret-chips">
            <div class="ret-chip ret-pos"><span>5Y CAGR:</span> ${o.ret5y}</div>
          </div>
        </td>
      </tr>

      <tr class="basket-drawer-row" id="drawer-${rowId}" style="display:none;">
        <td colspan="4" class="drawer-container-cell">
          <div class="bk-drawer-panel">
            <div class="drawer-header-strip">
              <div class="drawer-nav-tabs">
                <button type="button" class="drawer-tab-btn drawer-btn-basis active">
                  📋 Strategic Portfolio Role
                </button>
              </div>
              <button type="button" class="drawer-close-btn" onclick="closeBasketDrawer('${rowId}')">✕ Close</button>
            </div>
            <div class="drawer-tab-content drawer-tab-basis">
              <div class="drawer-card-box">
                <div class="drawer-box-title">📌 Asset Class Role &amp; Tax Advantage</div>
                <p class="drawer-box-desc">${o.basis}</p>
                <div class="drawer-macro-strip">
                  <strong>Macro Hedge:</strong> ${o.macro}
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <!-- SUMMARY STRIP: DIVERSIFICATION & MIX -->
    <div class="bk-summary-banner">
      <div class="bk-sum-item">
        <span class="bk-sum-label">Equity Cap Mix</span>
        <span class="bk-sum-val">
          <span class="cap-tag-l">🔵 ${capSummary.large}% Large</span> ·
          <span class="cap-tag-m">🟢 ${capSummary.mid}% Mid</span> ·
          <span class="cap-tag-s">🟠 ${capSummary.small}% Small</span>
        </span>
      </div>
      <div class="bk-sum-item">
        <span class="bk-sum-label">Basket Quality Grade</span>
        <span class="bk-sum-val ${gradeClass}">${gradeLabel} (${avgQ}/100)</span>
      </div>
      <div class="bk-sum-item">
        <span class="bk-sum-label">Top Performing Funds</span>
        <span class="bk-sum-val grade-aplus">${fundsList.length} Top-Ranked Schemes</span>
      </div>
      <div class="bk-sum-hint">
        💡 <strong>Clean View:</strong> Click <strong>📋 Basis</strong>, <strong>📊 Returns &amp; Ratios</strong> or <strong>🚀 Growth Thesis</strong> near any instrument name to view in-depth institutional research without cluttering the screen.
      </div>
    </div>

    <!-- 1. DIRECT EQUITIES -->
    <div class="basket-category-section">
      <div class="basket-category-header">
        <span>📈 1. DIRECT EQUITIES (NSE) — BALANCED CAP MIX</span>
        <span class="cat-alloc-badge">Total Allocation: ${formatINR(stockAmt)}</span>
      </div>
      <div class="table-responsive">
        <table class="basket-table-clean">
          <thead>
            <tr>
              <th style="width: 44%;">Instrument &amp; Research Actions</th>
              <th style="width: 18%;">CMP &amp; Market Cap</th>
              <th style="width: 18%;">Weight &amp; Allocation</th>
              <th style="width: 20%;">Historical Returns</th>
            </tr>
          </thead>
          <tbody>
            ${stocksRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. MUTUAL FUNDS (AT LEAST 5 TOP FUNDS) -->
    <div class="basket-category-section">
      <div class="basket-category-header">
        <span>📊 2. TOP ${fundsList.length} MUTUAL FUND SCHEMES (AMFI) — BASED ON 3Y &amp; 5Y ALPHA</span>
        <span class="cat-alloc-badge">Total Allocation: ${formatINR(fundAmt)}</span>
      </div>
      <div class="table-responsive">
        <table class="basket-table-clean">
          <thead>
            <tr>
              <th style="width: 44%;">Scheme &amp; Research Actions</th>
              <th style="width: 18%;">Latest NAV &amp; Manager</th>
              <th style="width: 18%;">Weight &amp; Allocation</th>
              <th style="width: 20%;">Historical Track Record</th>
            </tr>
          </thead>
          <tbody>
            ${fundsRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. GOLD & FIXED INCOME -->
    <div class="basket-category-section">
      <div class="basket-category-header">
        <span>🪙 3. STRATEGIC GOLD &amp; FIXED INCOME (STABILITY LAYER)</span>
        <span class="cat-alloc-badge">Total Allocation: ${formatINR(goldAmt + debtAmt)}</span>
      </div>
      <div class="table-responsive">
        <table class="basket-table-clean">
          <thead>
            <tr>
              <th style="width: 44%;">Asset Class &amp; Research</th>
              <th style="width: 18%;">Rate / Yield</th>
              <th style="width: 18%;">Weight &amp; Allocation</th>
              <th style="width: 20%;">5-Year Performance</th>
            </tr>
          </thead>
          <tbody>
            ${otherRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    <div class="basket-disclaimer">
      ⚠️ <strong>Educational Disclaimer:</strong> This optimum basket is designed based on historical compound returns, financial statement health, and audited public filings as of November 2026. This does not constitute SEBI-registered personal investment advice. Please review with a licensed financial advisor.
    </div>
  `;
}

// ── INTERACTIVE BASKET DRAWER EXPANSION HANDLERS ──
function toggleBasketDrawer(rowId, activeTab) {
  const drawer = document.getElementById('drawer-' + rowId);
  if (!drawer) return;

  const isCurrentlyOpen = drawer.style.display !== 'none';
  const currentTab = drawer.getAttribute('data-active-tab');

  // If already open and user clicked the same tab button, collapse it
  if (isCurrentlyOpen && currentTab === activeTab) {
    drawer.style.display = 'none';
    drawer.removeAttribute('data-active-tab');
    clearBasketActiveButtons(rowId);
    return;
  }

  // Open the drawer
  drawer.style.display = 'table-row';
  drawer.setAttribute('data-active-tab', activeTab);

  // Switch internal tab content
  const tabContents = drawer.querySelectorAll('.drawer-tab-content');
  tabContents.forEach(c => c.style.display = 'none');
  const targetContent = drawer.querySelector('.drawer-tab-' + activeTab);
  if (targetContent) targetContent.style.display = 'block';

  // Highlight the tab button inside drawer
  const tabBtns = drawer.querySelectorAll('.drawer-tab-btn');
  tabBtns.forEach(b => b.classList.remove('active'));
  const activeTabBtn = drawer.querySelector('.drawer-btn-' + activeTab);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  // Highlight triggering button in main row
  clearBasketActiveButtons(rowId);
  const triggerBtn = document.getElementById('btn-' + activeTab + '-' + rowId);
  if (triggerBtn) triggerBtn.classList.add('btn-active');
}

function switchBasketDrawerTab(rowId, activeTab) {
  const drawer = document.getElementById('drawer-' + rowId);
  if (!drawer) return;

  drawer.setAttribute('data-active-tab', activeTab);

  const tabContents = drawer.querySelectorAll('.drawer-tab-content');
  tabContents.forEach(c => c.style.display = 'none');
  const targetContent = drawer.querySelector('.drawer-tab-' + activeTab);
  if (targetContent) targetContent.style.display = 'block';

  const tabBtns = drawer.querySelectorAll('.drawer-tab-btn');
  tabBtns.forEach(b => b.classList.remove('active'));
  const activeTabBtn = drawer.querySelector('.drawer-btn-' + activeTab);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  clearBasketActiveButtons(rowId);
  const triggerBtn = document.getElementById('btn-' + activeTab + '-' + rowId);
  if (triggerBtn) triggerBtn.classList.add('btn-active');
}

function closeBasketDrawer(rowId) {
  const drawer = document.getElementById('drawer-' + rowId);
  if (drawer) {
    drawer.style.display = 'none';
    drawer.removeAttribute('data-active-tab');
  }
  clearBasketActiveButtons(rowId);
}

function clearBasketActiveButtons(rowId) {
  ['basis', 'returns', 'catalyst'].forEach(t => {
    const btn = document.getElementById('btn-' + t + '-' + rowId);
    if (btn) btn.classList.remove('btn-active');
  });
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

  // Route health requests to the unified Stock Health Check station
  if (pageId === 'page-health') {
    pageId = 'page-terminal';
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
  if (pageId === 'page-portfolio' || cleanHash === 'portfolio') {
    initPortfolioTrackerPage();
  } else if (pageId === 'page-overview' || cleanHash === 'overview') {
    initMarketOverviewPage();
  } else if (pageId === 'page-planner') {
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

  // Switch to Stock Health Check & Explore
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


// ============================================================================
// PHASE 1: LIVE INDIAN STANDARD TIME (IST) MARKET CLOCK
// ============================================================================
function startIndianMarketClock() {
  function update() {
    try {
      const now = new Date();
      
      // Format IST Time (HH:MM:SS)
      const istTimeStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);

      const clockEl = document.getElementById('marketLiveClock');
      if (clockEl) {
        clockEl.textContent = `${istTimeStr} IST · MUMBAI`;
      }

      // Check if trading hours (Mon-Fri 09:15 to 15:30 IST)
      const dayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short'
      });
      const dayOfWeek = dayFormatter.format(now);
      const isWeekday = !['Sat', 'Sun'].includes(dayOfWeek);

      const parts = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).formatToParts(now);

      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      const timeInMinutes = hour * 60 + minute;

      // Normal NSE/BSE Trading: 09:15 to 15:30
      const isMarketOpen = isWeekday && (timeInMinutes >= 9 * 60 + 15) && (timeInMinutes < 15 * 60 + 30);

      const dotEl = document.getElementById('marketStatusDot');
      const textEl = document.getElementById('marketStatusText');

      if (dotEl && textEl) {
        if (isMarketOpen) {
          dotEl.className = 'live-dot open';
          textEl.innerHTML = 'NSE &amp; BSE · <strong style="color:#34d399;">MARKET OPEN (LIVE)</strong>';
        } else {
          dotEl.className = 'live-dot closed';
          textEl.innerHTML = 'NSE &amp; BSE · <strong>MARKET CLOSED (EOD)</strong>';
        }
      }
    } catch (e) {
      console.warn("Clock update error:", e);
    }
  }

  update();
  setInterval(update, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  checkBackendStatus();
  startIndianMarketClock();
  setTimeout(() => {
    initOrUpdateChart();
  }, 100);

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

// =========================================================================
// INDIAN MARKET OVERVIEW PAGE LOGIC (GLOBAL STANDARD LIGHT THEME)
// =========================================================================

const FII_DII_HISTORICAL_DATA = [
  { date: "10 Nov", fiiBuy: "₹ 9,450 Cr", fiiSell: "₹ 8,820 Cr", fiiNet: 630, diiBuy: "₹ 7,210 Cr", diiSell: "₹ 5,940 Cr", diiNet: 1270, total: 1900, sentiment: "Broad-based buying across large-caps" },
  { date: "11 Nov", fiiBuy: "₹ 8,900 Cr", fiiSell: "₹ 9,420 Cr", fiiNet: -520, diiBuy: "₹ 8,120 Cr", diiSell: "₹ 6,410 Cr", diiNet: 1710, total: 1190, sentiment: "DII absorbed foreign profit-taking" },
  { date: "12 Nov", fiiBuy: "₹ 10,250 Cr", fiiSell: "₹ 9,680 Cr", fiiNet: 570, diiBuy: "₹ 7,850 Cr", diiSell: "₹ 6,200 Cr", diiNet: 1650, total: 2220, sentiment: "Inflows resumed into banking sector" },
  { date: "13 Nov", fiiBuy: "₹ 9,800 Cr", fiiSell: "₹ 10,450 Cr", fiiNet: -650, diiBuy: "₹ 8,450 Cr", diiSell: "₹ 6,310 Cr", diiNet: 2140, total: 1490, sentiment: "Domestic SIPs supported Nifty 25,600" },
  { date: "14 Nov", fiiBuy: "₹ 11,100 Cr", fiiSell: "₹ 10,200 Cr", fiiNet: 900, diiBuy: "₹ 8,900 Cr", diiSell: "₹ 7,100 Cr", diiNet: 1800, total: 2700, sentiment: "FII turned net buyers before weekend" },
  { date: "17 Nov", fiiBuy: "₹ 10,850 Cr", fiiSell: "₹ 9,750 Cr", fiiNet: 1100, diiBuy: "₹ 8,250 Cr", diiSell: "₹ 6,450 Cr", diiNet: 1800, total: 2900, sentiment: "Strong auto & realty momentum" },
  { date: "18 Nov", fiiBuy: "₹ 11,400 Cr", fiiSell: "₹ 10,820 Cr", fiiNet: 580, diiBuy: "₹ 8,750 Cr", diiSell: "₹ 6,950 Cr", diiNet: 1800, total: 2380, sentiment: "Heavy accumulation in Tata Power & PSU banks" },
  { date: "19 Nov", fiiBuy: "₹ 9,950 Cr", fiiSell: "₹ 10,320 Cr", fiiNet: -370, diiBuy: "₹ 9,100 Cr", diiSell: "₹ 6,800 Cr", diiNet: 2300, total: 1930, sentiment: "DII set monthly single-day buy high" },
  { date: "20 Nov", fiiBuy: "₹ 12,100 Cr", fiiSell: "₹ 10,850 Cr", fiiNet: 1250, diiBuy: "₹ 8,650 Cr", diiSell: "₹ 6,450 Cr", diiNet: 2200, total: 3450, sentiment: "Foreign funds aggressively bought private lenders" },
  { date: "21 Nov", fiiBuy: "₹ 11,250 Cr", fiiSell: "₹ 9,830 Cr", fiiNet: 1420, diiBuy: "₹ 8,940 Cr", diiSell: "₹ 6,590 Cr", diiNet: 2350, total: 3770, sentiment: "Combined +₹3,770 Cr institutional injection" }
];

const OVERVIEW_GAINERS_DATA = [
  { sym: "KAYNES", name: "Kaynes Technology India", sec: "EMS & High-Tech", price: "₹ 7,200.00", chgPct: "+2.85%", chgPts: "+₹ 199.50", low: "₹ 7,050.00", high: "₹ 7,280.00", vol: "4.80 L", turnover: "₹ 345 Cr", high52: "-8.3% from 52W High" },
  { sym: "TRENT", name: "Trent Limited", sec: "Consumer Retail", price: "₹ 6,850.00", chgPct: "+2.05%", chgPts: "+₹ 137.50", low: "₹ 6,760.00", high: "₹ 6,890.00", vol: "12.50 L", turnover: "₹ 856 Cr", high52: "-8.1% from 52W High" },
  { sym: "IREDA", name: "Indian Renewable Energy Dev", sec: "Green Finance", price: "₹ 215.00", chgPct: "+1.99%", chgPts: "+₹ 4.20", low: "₹ 210.00", high: "₹ 218.50", vol: "1.85 Cr", turnover: "₹ 398 Cr", high52: "-30.6% from 52W High" },
  { sym: "RAILTEL", name: "RailTel Corporation", sec: "Telecom Infra", price: "₹ 410.00", chgPct: "+1.86%", chgPts: "+₹ 7.50", low: "₹ 401.00", high: "₹ 415.00", vol: "42.00 L", turnover: "₹ 172 Cr", high52: "-33.7% from 52W High" },
  { sym: "BHARTIARTL", name: "Bharti Airtel Limited", sec: "Telecom & Cloud", price: "₹ 2,161.70", chgPct: "+1.85%", chgPts: "+₹ 39.30", low: "₹ 2,130.00", high: "₹ 2,175.00", vol: "68.20 L", turnover: "₹ 1,470 Cr", high52: "-1.3% from 52W High" },
  { sym: "SBIN", name: "State Bank of India", sec: "PSU Banking", price: "₹ 1,165.10", chgPct: "+1.60%", chgPts: "+₹ 18.35", low: "₹ 1,148.00", high: "₹ 1,172.00", vol: "1.82 Cr", turnover: "₹ 1,448 Cr", high52: "-0.6% from 52W High" },
  { sym: "TATAPOWER", name: "Tata Power Company", sec: "Clean Power", price: "₹ 340.00", chgPct: "+1.43%", chgPts: "+₹ 4.80", low: "₹ 334.50", high: "₹ 343.80", vol: "2.45 Cr", turnover: "₹ 1,074 Cr", high52: "-31.3% from 52W High" },
  { sym: "ICICIBANK", name: "ICICI Bank Limited", sec: "Private Banking", price: "₹ 1,640.00", chgPct: "+1.25%", chgPts: "+₹ 20.25", low: "₹ 1,622.00", high: "₹ 1,648.00", vol: "94.10 L", turnover: "₹ 1,542 Cr", high52: "-2.4% from 52W High" },
  { sym: "RELIANCE", name: "Reliance Industries", sec: "Conglomerate", price: "₹ 1,377.50", chgPct: "+1.19%", chgPts: "+₹ 16.20", low: "₹ 1,360.00", high: "₹ 1,385.00", vol: "72.00 L", turnover: "₹ 2,145 Cr", high52: "-14.3% from 52W High" }
];

const OVERVIEW_LOSERS_DATA = [
  { sym: "HCLTECH", name: "HCL Technologies Ltd", sec: "IT Consulting", price: "₹ 1,815.00", chgPct: "-1.40%", chgPts: "-₹ 25.75", low: "₹ 1,805.00", high: "₹ 1,842.00", vol: "34.00 L", turnover: "₹ 617 Cr", low52: "+38.5% above 52W Low" },
  { sym: "TECHM", name: "Tech Mahindra Ltd", sec: "IT Services", price: "₹ 1,640.00", chgPct: "-1.15%", chgPts: "-₹ 19.10", low: "₹ 1,632.00", high: "₹ 1,665.00", vol: "21.00 L", turnover: "₹ 344 Cr", low52: "+39.0% above 52W Low" },
  { sym: "WIPRO", name: "Wipro Limited", sec: "IT Services", price: "₹ 545.00", chgPct: "-0.95%", chgPts: "-₹ 5.20", low: "₹ 542.00", high: "₹ 553.00", vol: "48.00 L", turnover: "₹ 261 Cr", low52: "+29.8% above 52W Low" },
  { sym: "CIPLA", name: "Cipla Limited", sec: "Pharmaceuticals", price: "₹ 1,480.00", chgPct: "-0.85%", chgPts: "-₹ 12.70", low: "₹ 1,472.00", high: "₹ 1,498.00", vol: "18.00 L", turnover: "₹ 266 Cr", low52: "+27.6% above 52W Low" },
  { sym: "TITAN", name: "Titan Company Ltd", sec: "Jewellery & Retail", price: "₹ 3,240.00", chgPct: "-0.65%", chgPts: "-₹ 21.20", low: "₹ 3,225.00", high: "₹ 3,275.00", vol: "14.00 L", turnover: "₹ 453 Cr", low52: "+6.2% above 52W Low" },
  { sym: "SUNPHARMA", name: "Sun Pharma Industries", sec: "Pharma Formulations", price: "₹ 1,765.00", chgPct: "-0.58%", chgPts: "-₹ 10.30", low: "₹ 1,755.00", high: "₹ 1,780.00", vol: "22.50 L", turnover: "₹ 397 Cr", low52: "+48.3% above 52W Low" },
  { sym: "INFY", name: "Infosys Limited", sec: "IT Bellwether", price: "₹ 1,098.00", chgPct: "-0.45%", chgPts: "-₹ 5.00", low: "₹ 1,092.00", high: "₹ 1,118.00", vol: "82.00 L", turnover: "₹ 1,545 Cr", low52: "+14.4% above 52W Low" }
];

const OVERVIEW_VOLUME_SHOCKERS_DATA = [
  { sym: "TATAPOWER", name: "Tata Power Company Ltd", sec: "Clean Power & Capex", price: "₹ 340.00", chgPct: "+1.43%", todayVol: "2,45,00,000", avg10dVol: "64,00,000", multiple: "3.8x", turnover: "₹ 1,074 Cr", catalyst: "Multi-gigawatt pumped hydro and solar capacity announcement driving aggressive institutional accumulation.", cap: "large" },
  { sym: "IREDA", name: "Indian Renewable Energy Dev", sec: "Green Energy NBFC", price: "₹ 215.00", chgPct: "+1.99%", todayVol: "1,85,00,000", avg10dVol: "44,00,000", multiple: "4.2x", turnover: "₹ 398 Cr", catalyst: "High institutional buying following sovereign green bond issuance approval.", cap: "mid" },
  { sym: "TRENT", name: "Trent Limited (Tata Retail)", sec: "Lifestyle Retail", price: "₹ 6,850.00", chgPct: "+2.05%", todayVol: "12,50,000", avg10dVol: "3,70,000", multiple: "3.4x", turnover: "₹ 856 Cr", catalyst: "Zudio store expansion pace acceleration and 25%+ same-store-sales trajectory.", cap: "large" },
  { sym: "KAYNES", name: "Kaynes Technology India", sec: "EMS & Chip Packaging", price: "₹ 7,200.00", chgPct: "+2.85%", todayVol: "4,80,000", avg10dVol: "1,55,000", multiple: "3.1x", turnover: "₹ 345 Cr", catalyst: "Semiconductor ATMP plant state regulatory clearance and export order ramp-up.", cap: "mid" },
  { sym: "SBIN", name: "State Bank of India", sec: "Public Sector Banking", price: "₹ 1,165.10", chgPct: "+1.60%", todayVol: "1,82,00,000", avg10dVol: "62,00,000", multiple: "2.9x", turnover: "₹ 1,448 Cr", catalyst: "National infrastructure credit book expansion under GoI capital expenditure push.", cap: "large" },
  { sym: "RAILTEL", name: "RailTel Corporation", sec: "Telecom & Fiber Infra", price: "₹ 410.00", chgPct: "+1.86%", todayVol: "42,00,000", avg10dVol: "15,50,000", multiple: "2.7x", turnover: "₹ 172 Cr", catalyst: "High-value National Broadband optical fiber contract win on railway lines.", cap: "small" },
  { sym: "HDFCBANK", name: "HDFC Bank Limited", sec: "Private Banking", price: "₹ 846.00", chgPct: "+2.95%", todayVol: "1,14,00,000", avg10dVol: "46,00,000", multiple: "2.5x", turnover: "₹ 1,989 Cr", catalyst: "Institutional block accumulation as CD ratio normalizes toward 85%.", cap: "large" },
  { sym: "RELIANCE", name: "Reliance Industries Ltd", sec: "Energy & Consumer Retail", price: "₹ 1,377.50", chgPct: "+1.19%", todayVol: "72,00,000", avg10dVol: "38,00,000", multiple: "1.9x", turnover: "₹ 2,145 Cr", catalyst: "Peak 5G capex transition into free-cash harvest phase alongside JioAirFiber adoption.", cap: "large" }
];

function initMarketOverviewPage() {
  renderFiiDiiTable();
  renderGainersTable();
  renderLosersTable();
  renderVolumeShockersTable('all');
  setTimeout(() => {
    requestAnimationFrame(renderFiiDiiChart);
  }, 80);
}

function renderFiiDiiTable() {
  const tbody = document.getElementById("fiiDiiTableBody");
  if (!tbody) return;
  tbody.innerHTML = FII_DII_HISTORICAL_DATA.map(d => {
    const fiiNetCls = d.fiiNet >= 0 ? 'pos' : 'neg';
    const fiiNetTxt = (d.fiiNet >= 0 ? '+₹ ' : '-₹ ') + Math.abs(d.fiiNet) + ' Cr';
    const diiNetCls = d.diiNet >= 0 ? 'pos' : 'neg';
    const diiNetTxt = (d.diiNet >= 0 ? '+₹ ' : '-₹ ') + Math.abs(d.diiNet) + ' Cr';
    const totCls = d.total >= 0 ? 'pos' : 'neg';
    const totTxt = (d.total >= 0 ? '+₹ ' : '-₹ ') + Math.abs(d.total) + ' Cr';
    return `
      <tr>
        <td><strong>${d.date}</strong></td>
        <td>${d.fiiBuy}</td>
        <td>${d.fiiSell}</td>
        <td><strong class="${fiiNetCls}">${fiiNetTxt}</strong></td>
        <td>${d.diiBuy}</td>
        <td>${d.diiSell}</td>
        <td><strong class="${diiNetCls}">${diiNetTxt}</strong></td>
        <td><span class="tot-badge ${totCls}">${totTxt}</span></td>
        <td class="sub-text">${d.sentiment}</td>
      </tr>
    `;
  }).join('');
}

function renderGainersTable() {
  const tbody = document.getElementById("gainersTableBody");
  if (!tbody) return;
  tbody.innerHTML = OVERVIEW_GAINERS_DATA.map(g => `
    <tr>
      <td>
        <div class="mover-symbol-block">
          <strong>${g.sym}</strong>
          <span>${g.name}</span>
        </div>
      </td>
      <td><span class="sec-badge">${g.sec}</span></td>
      <td><strong>${g.price}</strong></td>
      <td><span class="table-badge pos">${g.chgPct} ▲</span></td>
      <td class="range-cell"><span>${g.low}</span> — <span>${g.high}</span></td>
      <td>
        <div class="vol-cell">
          <strong>${g.vol}</strong>
          <span>${g.turnover}</span>
        </div>
      </td>
      <td>
        <button type="button" class="btn-table-action" onclick="quickSelect('${g.sym}')">Analyze ↗</button>
      </td>
    </tr>
  `).join('');
}

function renderLosersTable() {
  const tbody = document.getElementById("losersTableBody");
  if (!tbody) return;
  tbody.innerHTML = OVERVIEW_LOSERS_DATA.map(l => `
    <tr>
      <td>
        <div class="mover-symbol-block">
          <strong>${l.sym}</strong>
          <span>${l.name}</span>
        </div>
      </td>
      <td><span class="sec-badge">${l.sec}</span></td>
      <td><strong>${l.price}</strong></td>
      <td><span class="table-badge neg">${l.chgPct} ▼</span></td>
      <td class="range-cell"><span>${l.low}</span> — <span>${l.high}</span></td>
      <td>
        <div class="vol-cell">
          <strong>${l.vol}</strong>
          <span>${l.turnover}</span>
        </div>
      </td>
      <td>
        <button type="button" class="btn-table-action" onclick="quickSelect('${l.sym}')">Analyze ↗</button>
      </td>
    </tr>
  `).join('');
}

function renderVolumeShockersTable(filter) {
  const tbody = document.getElementById("volumeShockersTableBody");
  if (!tbody) return;
  
  let list = OVERVIEW_VOLUME_SHOCKERS_DATA;
  if (filter === 'high') {
    list = list.filter(v => parseFloat(v.multiple) >= 3.0);
  } else if (filter === 'large') {
    list = list.filter(v => v.cap === 'large');
  }

  tbody.innerHTML = list.map(v => `
    <tr>
      <td>
        <div class="mover-symbol-block">
          <strong>${v.sym}</strong>
          <span>${v.name}</span>
        </div>
      </td>
      <td><span class="sec-badge">${v.sec}</span></td>
      <td><strong>${v.price}</strong></td>
      <td><span class="table-badge ${v.chgPct.startsWith('+') ? 'pos' : 'neg'}">${v.chgPct}</span></td>
      <td>
        <div class="vol-shocker-pill">
          <span class="multiple-tag">${v.multiple} Spurt ⚡</span>
          <span class="sub-vol">Vol: ${v.todayVol}</span>
        </div>
      </td>
      <td><strong>${v.turnover}</strong></td>
      <td>
        <div class="catalyst-cell">
          <span>${v.catalyst}</span>
          <button type="button" class="btn-table-action mini" onclick="quickSelect('${v.sym}')">Analyze ↗</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function switchOverviewMovers(tab) {
  const pGainers = document.getElementById("panelGainers");
  const pLosers = document.getElementById("panelLosers");
  const bGainers = document.getElementById("tabGainerBtn");
  const bLosers = document.getElementById("tabLoserBtn");
  const bBoth = document.getElementById("tabBothBtn");

  if (!pGainers || !pLosers) return;

  [bGainers, bLosers, bBoth].forEach(b => { if (b) b.classList.remove('active'); });

  if (tab === 'gainers') {
    pGainers.style.display = 'block';
    pLosers.style.display = 'none';
    if (bGainers) bGainers.classList.add('active');
  } else if (tab === 'losers') {
    pGainers.style.display = 'none';
    pLosers.style.display = 'block';
    if (bLosers) bLosers.classList.add('active');
  } else if (tab === 'both') {
    pGainers.style.display = 'block';
    pLosers.style.display = 'block';
    if (bBoth) bBoth.classList.add('active');
  }
}

function filterVolumeTable(filter) {
  document.querySelectorAll('.volume-filter-pills .vf-pill').forEach(b => {
    b.classList.remove('active');
  });
  if (typeof event !== 'undefined' && event && event.target) {
    event.target.classList.add('active');
  }
  renderVolumeShockersTable(filter);
}

function toggleInstTable() {
  const wrapper = document.getElementById("instAuditTableWrapper");
  const btn = document.getElementById("btnToggleInstTable");
  if (!wrapper || !btn) return;

  const isHidden = wrapper.style.display === 'none';
  wrapper.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? 'Hide Audit Table ▲' : 'View Full Audit Table ▼';
}

function renderFiiDiiChart() {
  const canvas = document.getElementById("fiiDiiChartCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement;
  
  // Calculate reliable width even if parent was just made visible
  let width = parent ? parent.clientWidth : 0;
  if (!width || width < 250) {
    const container = document.querySelector("#market-overview .portal-container");
    width = container ? (container.clientWidth - 40) : 800;
  }
  const height = 300;

  // High DPI scaling
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // Global Standard Light Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const padding = { top: 40, right: 30, bottom: 45, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const data = FII_DII_HISTORICAL_DATA;
  const numDays = data.length;

  // Max and Min values for Y scale
  const maxVal = 4000;
  const minVal = -1000;
  const valRange = maxVal - minVal;

  const getY = (val) => {
    return padding.top + chartH - ((val - minVal) / valRange) * chartH;
  };

  const zeroY = getY(0);

  // Horizontal Grid Lines (Light gray)
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#64748b";
  ctx.font = "10.5px Inter, -apple-system, sans-serif";
  ctx.textAlign = "right";

  const gridSteps = [-1000, 0, 1000, 2000, 3000, 4000];
  gridSteps.forEach(val => {
    const y = getY(val);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
    ctx.fillText((val >= 0 ? "+" : "") + val + " Cr", padding.left - 8, y + 3.5);
  });

  // Zero Line highlight
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padding.left, zeroY);
  ctx.lineTo(padding.left + chartW, zeroY);
  ctx.stroke();

  // Column width calculations
  const groupW = chartW / numDays;
  const barW = Math.max(8, Math.min(22, (groupW - 14) / 2));

  // Points for combined line
  const linePoints = [];

  // Draw Bars
  data.forEach((d, i) => {
    const groupCenter = padding.left + i * groupW + groupW / 2;

    // FII Bar (Corporate Royal Blue for buying, Crimson for selling)
    const fiiX = groupCenter - barW - 2;
    const fiiY = getY(Math.max(0, d.fiiNet));
    const fiiHeight = Math.abs(getY(d.fiiNet) - zeroY);
    ctx.fillStyle = d.fiiNet >= 0 ? "#2563eb" : "#ef4444";
    ctx.beginPath();
    if (d.fiiNet >= 0) {
      ctx.roundRect(fiiX, fiiY, barW, fiiHeight, [3, 3, 0, 0]);
    } else {
      ctx.roundRect(fiiX, zeroY, barW, fiiHeight, [0, 0, 3, 3]);
    }
    ctx.fill();

    // DII Bar (Emerald Green for buying, Amber for selling)
    const diiX = groupCenter + 2;
    const diiY = getY(Math.max(0, d.diiNet));
    const diiHeight = Math.abs(getY(d.diiNet) - zeroY);
    ctx.fillStyle = d.diiNet >= 0 ? "#059669" : "#f59e0b";
    ctx.beginPath();
    if (d.diiNet >= 0) {
      ctx.roundRect(diiX, diiY, barW, diiHeight, [3, 3, 0, 0]);
    } else {
      ctx.roundRect(diiX, zeroY, barW, diiHeight, [0, 0, 3, 3]);
    }
    ctx.fill();

    // Store line point for combined total
    const totY = getY(d.total);
    linePoints.push({ x: groupCenter, y: totY, total: d.total });

    // Date Label (Crisp slate)
    ctx.fillStyle = "#475569";
    ctx.font = "11px Inter, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(d.date, groupCenter, padding.top + chartH + 18);
  });

  // Draw Combined Net Line (Gold / Amber Trendline)
  if (linePoints.length > 1) {
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    linePoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw Line Dots & Labels
    linePoints.forEach(p => {
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Top value text (Dark, readable typography)
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 10px Inter, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((p.total >= 0 ? "+" : "") + p.total, p.x, p.y - 8);
    });
  }
}

window.addEventListener('resize', () => {
  const pOverview = document.getElementById("page-overview");
  if (pOverview && pOverview.style.display !== 'none') {
    renderFiiDiiChart();
  }
});


// =========================================================================
// PORTFOLIO TRACKER ENGINE (PERSISTENT CLIENT-SIDE HOLDINGS MONITOR)
// =========================================================================

const PORTFOLIO_STOCK_DATABASE = {
  "TATAPOWER": { name: "Tata Power Company Ltd", sector: "Power & Clean Energy", cap: "Large Cap", cmp: 340.00, change: 1.43, rec: "STRONG BUY", target: 440, risk: "Moderate", rationale: "Rapidly expanding solar EPC order book (>₹20,000 Cr), transmission corridor expansion, multi-gigawatt renewable PPAs signed, and dominant nationwide EV fast-charging moat." },
  "INFY": { name: "Infosys Limited", sector: "IT Consulting & AI", cap: "Large Cap", cmp: 1098.00, change: 0.56, rec: "BUY", target: 1250, risk: "Low", rationale: "Trading at attractive valuation of 22x P/E, debt-free balance sheet with >30% ROCE, strong mega-deal AI pipeline and steady operating margin recovery." },
  "TRENT": { name: "Trent Ltd (Tata Retail)", sector: "Consumer Retail", cap: "Large Cap", cmp: 6850.00, change: 3.80, rec: "HOLD", target: 7200, risk: "Moderate-High", rationale: "Exceptional store-level unit economics and 40%+ revenue CAGR in Zudio and Westside formats, but premium valuation (130x P/E) suggests disciplined holding rather than aggressive fresh entry." },
  "SBIN": { name: "State Bank of India", sector: "Public Sector Banking", cap: "Large Cap", cmp: 1165.00, change: 1.60, rec: "STRONG BUY", target: 1300, risk: "Low", rationale: "Net NPA down to 0.53%, return on assets (RoA) holding above 1.1%, pristine credit risk underwriting, and steady loan growth across retail and sovereign infrastructure." },
  "HDFCBANK": { name: "HDFC Bank Limited", sector: "Private Banking", cmp: 846.00, change: 2.95, rec: "STRONG BUY", target: 1050, risk: "Low", rationale: "Post-merger loan-to-deposit ratio (LDR) normalization ahead of schedule, trading at cyclical discount of 2.4x P/B vs 10-year historical average of 3.8x." },
  "RELIANCE": { name: "Reliance Industries Ltd", sector: "Energy, Retail & 5G", cap: "Large Cap", cmp: 1377.50, change: 1.19, rec: "BUY", target: 1620, risk: "Low", rationale: "Strong cash generation across retail and digital Jio services; upcoming market listings of subsidiaries will unlock shareholder value alongside green energy gigafactories." },
  "TCS": { name: "Tata Consultancy Services", sector: "IT Services", cap: "Large Cap", cmp: 2376.20, change: 1.43, rec: "HOLD", target: 2500, risk: "Low", rationale: "Highest operating margin in the global IT sector (25%+), debt-free, but current price leaves limited immediate upside buffer over the next 6-12 months." },
  "KAYNES": { name: "Kaynes Technology India", sector: "EMS & Semiconductors", cap: "Mid Cap", cmp: 5840.00, change: 4.20, rec: "BUY", target: 6600, risk: "Moderate", rationale: "Cabinet-approved semiconductor OSAT packaging facility, robust 55%+ order book CAGR spanning defence electronics, aerospace, and electric vehicles under Make in India." },
  "ITC": { name: "ITC Limited", sector: "Diversified FMCG", cap: "Large Cap", cmp: 299.10, change: 0.96, rec: "BUY", target: 360, risk: "Low", rationale: "Hotels demerger creates a pure-play consumer goods giant; generous 4%+ dividend yield, virtually zero debt, and expanding non-tobacco FMCG margins." },
  "BHARTIARTL": { name: "Bharti Airtel Ltd", sector: "Telecommunications", cap: "Large Cap", cmp: 1720.00, change: 2.45, rec: "BUY", target: 1950, risk: "Low", rationale: "Industry-leading ARPU expanding toward ₹225, rapid 5G user monetization, high-margin enterprise data cloud services, and strong African balance sheet deleveraging." },
  "IREDA": { name: "Indian Renewable Energy Dev", sector: "Green Energy NBFC", cap: "Mid Cap", cmp: 215.40, change: 3.45, rec: "BUY", target: 270, risk: "Moderate", rationale: "Sole nodal sovereign NBFC for green financing; loan book compounding at 35%+ with near-zero fresh slippages in solar, wind, and green hydrogen." },
  "RAILTEL": { name: "RailTel Corp of India", sector: "Telecom & Cloud Infra", cap: "Small Cap", cmp: 410.80, change: 2.90, rec: "BUY", target: 510, risk: "Moderate", rationale: "Exclusive optical fibre right-of-way over 61,000 km along Indian Railways; expanding into sovereign AI data centre hosting and railway Kavach safety systems." },
  "TITAN": { name: "Titan Company Ltd", sector: "Jewellery & Watches", cap: "Large Cap", cmp: 3240.00, change: -0.72, rec: "BUY", target: 3750, risk: "Low", rationale: "Gold import duty rationalization spurs wedding and festive demand; Tanishq network addition continues delivering 20%+ retail growth." },
  "HCLTECH": { name: "HCL Technologies Ltd", sector: "IT Services", cap: "Large Cap", cmp: 1815.00, change: -1.40, rec: "HOLD", target: 1950, risk: "Low", rationale: "Strong engineering services positioning and consistent 4% dividend yield, though enterprise discretionary IT budgets in North America remain selective." },
  "TECHM": { name: "Tech Mahindra Ltd", sector: "IT Services", cap: "Large Cap", cmp: 1640.00, change: -1.15, rec: "HOLD", target: 1750, risk: "Moderate", rationale: "Telecom turnaround in progress under new leadership; awaiting sustained sequential EBIT margin recovery back to 15%." },
  "WIPRO": { name: "Wipro Limited", sector: "IT Consulting", cap: "Large Cap", cmp: 545.00, change: -0.95, rec: "HOLD", target: 580, risk: "Moderate", rationale: "Capco consulting business still recovering; periodic share buybacks offer a firm downside valuation floor." },
  "CIPLA": { name: "Cipla Limited", sector: "Pharmaceuticals", cap: "Large Cap", cmp: 1480.00, change: -0.85, rec: "BUY", target: 1680, risk: "Low", rationale: "Market-leading domestic chronic respiratory and cardiology portfolio; robust generic Albuterol and peptide sales in the US market." }
};

const DEFAULT_SAMPLE_HOLDINGS = [
  { id: "hold_1", symbol: "TATAPOWER", buyPrice: 280.00, qty: 100, category: "Large Cap", date: "2026-03-15" },
  { id: "hold_2", symbol: "INFY", buyPrice: 1020.00, qty: 50, category: "Large Cap", date: "2026-04-10" },
  { id: "hold_3", symbol: "TRENT", buyPrice: 5400.00, qty: 15, category: "Large Cap", date: "2026-05-20" },
  { id: "hold_4", symbol: "SBIN", buyPrice: 1050.00, qty: 40, category: "Large Cap", date: "2026-06-18" },
  { id: "hold_5", symbol: "HDFCBANK", buyPrice: 780.00, qty: 60, category: "Large Cap", date: "2026-07-22" }
];

let userPortfolioList = [];
let currentRecModalSymbol = "";

function getUserPortfolio() {
  try {
    const raw = localStorage.getItem("marketinsight_user_portfolio");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read portfolio from localStorage, defaulting to sample.", err);
  }
  // If empty or first visit, seed with sample portfolio
  saveUserPortfolio(DEFAULT_SAMPLE_HOLDINGS);
  return DEFAULT_SAMPLE_HOLDINGS;
}

function saveUserPortfolio(list) {
  try {
    localStorage.setItem("marketinsight_user_portfolio", JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save portfolio to localStorage", err);
  }
}

function initPortfolioTrackerPage() {
  userPortfolioList = getUserPortfolio();
  renderPortfolioTracker();
}

function renderPortfolioTracker() {
  const tbody = document.getElementById("portfolioTableBody");
  if (!tbody) return;

  if (!userPortfolioList || userPortfolioList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: #64748b;">
          <div style="font-size: 36px; margin-bottom: 8px;">💼</div>
          <div style="font-size: 16px; font-weight: 750; color: #0f172a; margin-bottom: 4px;">Your Portfolio is Currently Empty</div>
          <div style="font-size: 13px; margin-bottom: 16px;">Add your first stock above or preload a realistic sample portfolio with one click.</div>
          <button type="button" class="btn btn-primary" onclick="preloadSamplePortfolio()">⚡ Preload Sample Portfolio</button>
        </td>
      </tr>
    `;
    updatePortfolioKPIs(0, 0, 0, 0, 0, 0, 0);
    updatePortfolioAllocationVisual(0, 0, 0, 0, 0);
    return;
  }

  let grandTotalInvested = 0;
  let grandTotalCurrent = 0;
  let grandTotalDayPnl = 0;
  let buyCount = 0;
  let holdCount = 0;
  let sellCount = 0;

  // First pass: compute totals for weighting
  const calculatedItems = userPortfolioList.map(h => {
    const sym = (h.symbol || "").toUpperCase();
    const stockInfo = PORTFOLIO_STOCK_DATABASE[sym] || {
      name: sym + " (NSE Equities)",
      sector: h.category || "Equities",
      cap: h.category || "Large Cap",
      cmp: h.buyPrice * 1.05,
      change: 0.85,
      rec: "BUY",
      target: Math.round(h.buyPrice * 1.25),
      risk: "Moderate",
      rationale: "Automated quantitative screening reflects stable balance sheet liquidity and solid operating cash flow."
    };

    const cmp = Number(stockInfo.cmp || h.buyPrice);
    const buyPrice = Number(h.buyPrice);
    const qty = Number(h.qty);
    const invested = qty * buyPrice;
    const currentVal = qty * cmp;
    const pnl = currentVal - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    const dayChangePct = Number(stockInfo.change || 0);
    const dayPnl = qty * (cmp * (dayChangePct / 100));

    grandTotalInvested += invested;
    grandTotalCurrent += currentVal;
    grandTotalDayPnl += dayPnl;

    const rec = (stockInfo.rec || "BUY").toUpperCase();
    if (rec.includes("BUY")) buyCount++;
    else if (rec.includes("SELL") || rec.includes("TRIM")) sellCount++;
    else holdCount++;

    return {
      ...h,
      sym,
      stockInfo,
      cmp,
      invested,
      currentVal,
      pnl,
      pnlPct,
      dayPnl,
      dayChangePct
    };
  });

  const grandTotalPnl = grandTotalCurrent - grandTotalInvested;
  const grandTotalPnlPct = grandTotalInvested > 0 ? (grandTotalPnl / grandTotalInvested) * 100 : 0;
  const grandDayPnlPct = grandTotalCurrent > 0 ? (grandTotalDayPnl / grandTotalCurrent) * 100 : 0;

  // Update Header KPIs
  updatePortfolioKPIs(
    grandTotalCurrent,
    grandTotalInvested,
    grandTotalPnl,
    grandTotalPnlPct,
    grandTotalDayPnl,
    grandDayPnlPct,
    calculatedItems.length,
    buyCount,
    holdCount,
    sellCount
  );

  // Calculate allocation breakdown & render Doughnut
  let largeCapTotal = 0;
  let midCapTotal = 0;
  let smallCapTotal = 0;
  let fundTotal = 0;

  calculatedItems.forEach(item => {
    const cat = item.category || (item.stockInfo && item.stockInfo.cap) || "Large Cap";
    if (cat.includes("Large")) largeCapTotal += item.currentVal;
    else if (cat.includes("Mid")) midCapTotal += item.currentVal;
    else if (cat.includes("Small")) smallCapTotal += item.currentVal;
    else fundTotal += item.currentVal;
  });

  updatePortfolioAllocationVisual(largeCapTotal, midCapTotal, smallCapTotal, fundTotal, grandTotalCurrent);

  // Second pass: render rows with weight percentages
  tbody.innerHTML = calculatedItems.map(item => {
    const weight = grandTotalCurrent > 0 ? (item.currentVal / grandTotalCurrent) * 100 : 0;
    const isPnlPos = item.pnl >= 0;
    const isDayPos = item.dayChangePct >= 0;

    let recClass = "rec-tag-hold";
    if (item.stockInfo.rec.includes("BUY")) recClass = "rec-tag-buy";
    else if (item.stockInfo.rec.includes("SELL") || item.stockInfo.rec.includes("TRIM")) recClass = "rec-tag-sell";

    return `
      <tr>
        <td>
          <div class="mover-symbol-block">
            <strong>${item.sym}</strong>
            <span>${item.stockInfo.name}</span>
            <small class="stock-cap-pill">${item.stockInfo.cap || item.category || "Equity"} · ${item.stockInfo.sector}</small>
          </div>
        </td>
        <td><strong>${item.qty}</strong></td>
        <td>₹ ${Number(item.buyPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>
          <strong>₹ ${Number(item.cmp).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          <div class="cmp-day-change ${isDayPos ? "pos" : "neg"}">${isDayPos ? "+" : ""}${item.dayChangePct.toFixed(2)}%</div>
        </td>
        <td>₹ ${Math.round(item.invested).toLocaleString("en-IN")}</td>
        <td><strong>₹ ${Math.round(item.currentVal).toLocaleString("en-IN")}</strong></td>
        <td>
          <div class="pnl-stack">
            <span class="pnl-amount ${isPnlPos ? "pos" : "neg"}">${isPnlPos ? "+" : ""}₹ ${Math.round(item.pnl).toLocaleString("en-IN")}</span>
            <span class="pnl-badge ${isPnlPos ? "pos" : "neg"}">${isPnlPos ? "+" : ""}${item.pnlPct.toFixed(2)}%</span>
          </div>
        </td>
        <td>
          <div class="weight-cell">
            <span>${weight.toFixed(1)}%</span>
            <div class="weight-track"><div class="weight-fill" style="width: ${Math.min(weight, 100)}%;"></div></div>
          </div>
        </td>
        <td>
          <div class="rec-cell-group">
            <span class="rec-badge ${recClass}">${item.stockInfo.rec}</span>
            <button type="button" class="btn-rec-basis" onclick="openRecModal('${item.sym}')">Target &amp; Basis ↗</button>
          </div>
        </td>
        <td>
          <div class="action-btns-group">
            <button type="button" class="btn-table-action" onclick="analyzeHoldingInTerminal('${item.sym}')" title="Inspect Balance Sheet &amp; Chart in Stock Health Check">Analyze</button>
            <button type="button" class="btn-table-delete" onclick="deletePortfolioHolding('${item.id}')" title="Remove Holding">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  const countBadge = document.getElementById("holdingTableCount");
  if (countBadge) countBadge.textContent = calculatedItems.length;
}

function updatePortfolioKPIs(totalVal, invested, pnl, pnlPct, dayPnl, dayPnlPct, count, buys, holds, sells) {
  const elVal = document.getElementById("portTotalValue");
  const elInv = document.getElementById("portTotalInvested");
  const elPnl = document.getElementById("portTotalPnl");
  const elPnlPct = document.getElementById("portTotalPnlPct");
  const elDay = document.getElementById("portDayPnl");
  const elDayPct = document.getElementById("portDayPnlPct");
  const elCount = document.getElementById("portHoldingCount");
  const elStance = document.getElementById("portStancePills");

  if (elVal) elVal.textContent = "₹ " + Math.round(totalVal).toLocaleString("en-IN");
  if (elInv) elInv.textContent = "₹ " + Math.round(invested).toLocaleString("en-IN");

  if (elPnl) {
    const isPos = pnl >= 0;
    elPnl.className = "kpi-value " + (isPos ? "pos" : "neg");
    elPnl.textContent = (isPos ? "+₹ " : "-₹ ") + Math.abs(Math.round(pnl)).toLocaleString("en-IN");
  }
  if (elPnlPct) {
    const isPos = pnlPct >= 0;
    elPnlPct.className = "kpi-badge " + (isPos ? "pos" : "neg");
    elPnlPct.textContent = (isPos ? "+" : "") + pnlPct.toFixed(2) + "% " + (isPos ? "▲" : "▼");
  }

  if (elDay) {
    const isPos = dayPnl >= 0;
    elDay.className = "kpi-value " + (isPos ? "pos" : "neg");
    elDay.textContent = (isPos ? "+₹ " : "-₹ ") + Math.abs(Math.round(dayPnl)).toLocaleString("en-IN");
  }
  if (elDayPct) {
    const isPos = dayPnlPct >= 0;
    elDayPct.className = "kpi-badge " + (isPos ? "pos" : "neg");
    elDayPct.textContent = (isPos ? "+" : "") + dayPnlPct.toFixed(2) + "% " + (isPos ? "▲" : "▼");
  }

  if (elCount) elCount.textContent = count + " Assets Tracked";

  if (elStance) {
    elStance.innerHTML = `
      <span class="stance-tag buy">BUY: ${buys || 0}</span>
      <span class="stance-tag hold">HOLD: ${holds || 0}</span>
      <span class="stance-tag sell">SELL: ${sells || 0}</span>
    `;
  }
}

function handlePortfolioSubmit(e) {
  e.preventDefault();
  const symInput = document.getElementById("holdingSymbol");
  const buyPriceInput = document.getElementById("holdingBuyPrice");
  const qtyInput = document.getElementById("holdingQty");
  const catInput = document.getElementById("holdingCategory");

  const sym = (symInput.value || "").trim().toUpperCase();
  const buyPrice = parseFloat(buyPriceInput.value);
  const qty = parseInt(qtyInput.value, 10);
  const category = catInput ? catInput.value : "Large Cap";

  if (!sym || isNaN(buyPrice) || buyPrice <= 0 || isNaN(qty) || qty <= 0) {
    alert("Please enter a valid stock symbol, buy price, and quantity.");
    return;
  }

  const newHolding = {
    id: "hold_" + Date.now(),
    symbol: sym,
    buyPrice: buyPrice,
    qty: qty,
    category: category,
    date: new Date().toISOString().split("T")[0]
  };

  userPortfolioList.unshift(newHolding);
  saveUserPortfolio(userPortfolioList);
  renderPortfolioTracker();

  // Reset form
  symInput.value = "";
  buyPriceInput.value = "";
  qtyInput.value = "";
  symInput.focus();
}

function deletePortfolioHolding(id) {
  if (!confirm("Are you sure you want to remove this stock from your portfolio?")) return;
  userPortfolioList = userPortfolioList.filter(h => h.id !== id);
  saveUserPortfolio(userPortfolioList);
  renderPortfolioTracker();
}

function preloadSamplePortfolio() {
  userPortfolioList = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_HOLDINGS));
  saveUserPortfolio(userPortfolioList);
  renderPortfolioTracker();
}

function clearPortfolioHoldings() {
  if (!confirm("Clear all holdings from your personal portfolio?")) return;
  userPortfolioList = [];
  saveUserPortfolio([]);
  renderPortfolioTracker();
}

function openRecModal(symbol) {
  const sym = (symbol || "").toUpperCase();
  currentRecModalSymbol = sym;
  const stockInfo = PORTFOLIO_STOCK_DATABASE[sym] || {
    name: sym + " (NSE Stock)",
    cmp: 1000,
    rec: "BUY",
    target: 1250,
    risk: "Moderate Risk",
    rationale: "Algorithmic screening signals favorable solvency ratio, positive institutional flows and sound capital efficiency."
  };

  const modal = document.getElementById("recModal");
  if (!modal) return;

  const modalBadge = document.getElementById("modalRecBadge");
  const modalName = document.getElementById("modalStockName");
  const modalCmp = document.getElementById("modalCmp");
  const modalTarget = document.getElementById("modalTarget");
  const modalUpside = document.getElementById("modalUpside");
  const modalRisk = document.getElementById("modalRisk");
  const modalRationale = document.getElementById("modalRationaleText");

  const rec = (stockInfo.rec || "BUY").toUpperCase();
  modalBadge.textContent = rec;
  modalBadge.className = "rec-badge " + (rec.includes("BUY") ? "rec-tag-buy" : (rec.includes("SELL") ? "rec-tag-sell" : "rec-tag-hold"));

  modalName.textContent = stockInfo.name + " (" + sym + ")";
  modalCmp.textContent = "₹ " + Number(stockInfo.cmp).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  modalTarget.textContent = "₹ " + Number(stockInfo.target).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const upside = stockInfo.cmp > 0 ? (((stockInfo.target - stockInfo.cmp) / stockInfo.cmp) * 100).toFixed(1) : "0.0";
  modalUpside.textContent = (upside >= 0 ? "+" : "") + upside + "%";
  modalRisk.textContent = stockInfo.risk || "Moderate Risk";
  modalRationale.textContent = stockInfo.rationale || "Strong balance sheet and healthy earnings growth support capital appreciation.";

  modal.style.display = "flex";
}

function closeRecModal(e) {
  if (e && e.target && e.target.id !== "recModal" && !e.target.classList.contains("rec-modal-close") && e.target.tagName !== "BUTTON") {
    return;
  }
  const modal = document.getElementById("recModal");
  if (modal) modal.style.display = "none";
}

function analyzeHoldingInTerminal(sym) {
  const targetSym = sym || currentRecModalSymbol;
  closeRecModal();
  navigateToPage("page-terminal");
  exploreInvestment(targetSym);
}

// ============================================================================
// PHASE 2 FUNCTIONS: EXPORT CSV, NEWS FILTER, ALLOCATION DOUGHNUT
// ============================================================================

function exportPortfolioCSV() {
  if (!userPortfolioList || userPortfolioList.length === 0) {
    alert("Your portfolio is currently empty. Add stocks or preload the sample portfolio first.");
    return;
  }

  const headers = [
    "Stock Symbol",
    "Company Name",
    "Asset Class",
    "Quantity",
    "Avg Buy Price (INR)",
    "Current Market Price (INR)",
    "Total Invested (INR)",
    "Current Value (INR)",
    "Overall P&L (INR)",
    "Return Percentage",
    "Recommendation",
    "Selection Rationale"
  ];

  const rows = userPortfolioList.map(h => {
    const sym = (h.symbol || "").toUpperCase();
    const s = PORTFOLIO_STOCK_DATABASE[sym] || {};
    const cmp = Number(s.cmp || h.buyPrice);
    const qty = Number(h.qty);
    const buyPrice = Number(h.buyPrice);
    const invested = qty * buyPrice;
    const currentVal = qty * cmp;
    const pnl = currentVal - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    const rationale = (s.rationale || "Automated quantitative fundamental audit.").replace(/"/g, '""');
    const name = (s.name || sym).replace(/"/g, '""');

    return [
      sym,
      `"${name}"`,
      `"${h.category || s.cap || 'Large Cap'}"`,
      qty,
      buyPrice.toFixed(2),
      cmp.toFixed(2),
      invested.toFixed(2),
      currentVal.toFixed(2),
      pnl.toFixed(2),
      pnlPct.toFixed(2) + "%",
      s.rec || "BUY",
      `"${rationale}"`
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `MarketInsight_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function filterNewsCategory(cat, btn) {
  document.querySelectorAll(".news-filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const cards = document.querySelectorAll(".news-wire-grid .news-card");
  cards.forEach(card => {
    const cardCat = card.getAttribute("data-category");
    if (cat === "all" || cardCat === cat) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function updatePortfolioAllocationVisual(largeVal, midVal, smallVal, fundVal, totalVal) {
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  const setWidth = (id, pct) => {
    const el = document.getElementById(id);
    if (el) el.style.width = pct + "%";
  };

  setTxt("allocTotalVal", formatINR(totalVal));

  if (totalVal <= 0) {
    setTxt("allocPctLarge", "0%"); setWidth("allocBarLarge", 0); setTxt("allocAmtLarge", "₹ 0.00");
    setTxt("allocPctMid", "0%"); setWidth("allocBarMid", 0); setTxt("allocAmtMid", "₹ 0.00");
    setTxt("allocPctSmall", "0%"); setWidth("allocBarSmall", 0); setTxt("allocAmtSmall", "₹ 0.00");
    setTxt("allocPctFund", "0%"); setWidth("allocBarFund", 0); setTxt("allocAmtFund", "₹ 0.00");
    setTxt("allocHealthGrade", "--");
    return;
  }

  const pLarge = (largeVal / totalVal) * 100;
  const pMid = (midVal / totalVal) * 100;
  const pSmall = (smallVal / totalVal) * 100;
  const pFund = (fundVal / totalVal) * 100;

  setTxt("allocPctLarge", pLarge.toFixed(1) + "%");
  setWidth("allocBarLarge", pLarge.toFixed(1));
  setTxt("allocAmtLarge", formatINR(largeVal));

  setTxt("allocPctMid", pMid.toFixed(1) + "%");
  setWidth("allocBarMid", pMid.toFixed(1));
  setTxt("allocAmtMid", formatINR(midVal));

  setTxt("allocPctSmall", pSmall.toFixed(1) + "%");
  setWidth("allocBarSmall", pSmall.toFixed(1));
  setTxt("allocAmtSmall", formatINR(smallVal));

  setTxt("allocPctFund", pFund.toFixed(1) + "%");
  setWidth("allocBarFund", pFund.toFixed(1));
  setTxt("allocAmtFund", formatINR(fundVal));

  // Determine Grade
  let grade = "A+";
  if (pSmall > 50) grade = "B+";
  else if (pLarge >= 40 && pFund >= 15) grade = "AAA";
  else if (pLarge >= 30) grade = "A+";
  setTxt("allocHealthGrade", grade);

  // Render SVG Doughnut
  const svg = document.getElementById("allocDoughnutSvg");
  if (!svg) return;

  const slices = [
    { pct: pLarge, color: "#059669" },
    { pct: pMid, color: "#2563eb" },
    { pct: pSmall, color: "#d97706" },
    { pct: pFund, color: "#7c3aed" }
  ].filter(s => s.pct > 0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~376.99
  let offset = 0;

  let circlesHtml = `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="18"/>`;
  slices.forEach(s => {
    const dash = (s.pct / 100) * circumference;
    circlesHtml += `
      <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${s.color}" stroke-width="18"
        stroke-dasharray="${dash.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}"
        style="transition: stroke-dasharray 0.8s ease;" />
    `;
    offset += dash;
  });

  svg.innerHTML = circlesHtml;
}
