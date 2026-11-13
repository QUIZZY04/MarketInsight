# MarketInsight — Indian Stock & Mutual Fund Research

An institutional-grade research platform for Indian stocks (NSE/BSE) and AMFI mutual funds, powered by **BharatStock API** and built on a secure **Firebase** architecture.

---

## 🔒 Architecture & Security

```
Browser (Public Frontend)
       │
       ▼  (Same-origin /api/** rewrites)
Firebase Hosting & CDN
       │
       ▼
Firebase Cloud Functions v2 (Node.js)
       ├── Google Secret Manager (stores BHARAT_STOCK_API_KEY)
       └── Server-side Cache (prevents quota exhaustion)
       │
       ▼  (Secured with X-API-Key)
BharatStock REST API (api.bharatstockapi.com)
```

Your API key is never exposed to the client. All client requests route through Firebase Cloud Functions which securely injects the `X-API-Key` header from Google Secret Manager.

---

## 📁 Project Structure

```
MarketInsight/
├── public/                 # Static assets deployed to Firebase Hosting
│   ├── index.html          # Main application interface
│   ├── css/style.css       # Clean, modern stylesheet
│   └── js/
│       ├── app.js          # Reactive UI, search, and tab handlers
│       └── chart.js        # Responsive Canvas stock chart engine
├── functions/              # Cloud Functions v2 API Gateway (Node.js)
│   ├── index.js            # Secure endpoints (/api/search, /api/stock, /api/fund)
│   ├── package.json        # Cloud Functions dependencies
│   └── .env.example        # Environment variable template for local testing
├── firebase.json           # Hosting rewrites and emulator configuration
├── .firebaserc             # Firebase project bindings
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Configure Your BharatStock API Key

#### For Production (Google Cloud Secret Manager via Firebase):
```bash
firebase functions:secrets:set BHARAT_STOCK_API_KEY
# Enter your BharatStock API key when prompted
```

#### For Local Testing:
Create a `.env.local` file inside the `functions/` directory:
```bash
# inside functions/.env.local
BHARAT_STOCK_API_KEY=your_actual_bharat_stock_api_key
```

---

### 2. Run Locally with Firebase Emulators

Make sure Firebase CLI is logged in:
```bash
firebase login
```

Start the local emulators:
```bash
firebase emulators:start
```

* **Frontend:** [http://localhost:5000](http://localhost:5000)
* **Emulator UI Dashboard:** [http://localhost:4000](http://localhost:4000)

---

### 3. Deploy to Firebase

To deploy hosting and functions together:
```bash
firebase deploy
```

To deploy only the frontend:
```bash
firebase deploy --only hosting
```

To deploy only backend functions:
```bash
firebase deploy --only functions
```

