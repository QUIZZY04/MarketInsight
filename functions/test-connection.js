/**
 * Diagnostic test script for BharatStock API connectivity
 * Run with: node functions/test-connection.js
 */
require("dotenv").config({ path: "functions/.env.local" });
require("dotenv").config({ path: ".env" });
const { BharatStock } = require("bharatstock");

async function runDiagnostics() {
  console.log("=== MarketInsight BharatStock Diagnostic ===\n");

  // 1. Check API Status (No Key required)
  console.log("1. Checking live BharatStock API status...");
  try {
    const probe = new BharatStock({ apiKey: "status_probe" });
    const status = await probe.status();
    console.log(`   ✓ Status: ${status.status.toUpperCase()}`);
    console.log(`   ✓ System summary: ${status.summary}`);
    console.log(`   ✓ Data integrity checks: ${status.checksPassing}/${status.checksTotal} passing\n`);
  } catch (err) {
    console.error("   ✗ Status check failed:", err.message);
    return;
  }

  // 2. Check API Key
  const apiKey = process.env.BHARAT_STOCK_API_KEY || process.env.BHARATSTOCK_API_KEY;
  if (!apiKey || apiKey === "your_bharat_stock_api_key_here") {
    console.log("2. API Key Check:");
    console.log("   ⚠ No live API key found in functions/.env.local or environment.");
    console.log("   To test live data, add your key to functions/.env.local:");
    console.log("     BHARAT_STOCK_API_KEY=your_actual_key\n");
    console.log("   ✓ Diagnostic complete. (Server endpoints will run in sandbox/demo mode until key is configured)");
    return;
  }

  console.log(`2. Testing API Key: ${apiKey.slice(0, 8)}...`);
  try {
    const client = new BharatStock({ apiKey });
    const tcs = await client.stocks.get("TCS");
    console.log("   ✓ Key Verified! Successfully fetched live data for TCS.");
    console.log(`   Company: ${tcs.companyName || tcs.name || "TCS"}`);
    console.log(`   Current/Close Price: ₹ ${tcs.price || tcs.close || tcs.ltp || "N/A"}`);
    console.log(`   Market Cap: ${tcs.mktCap || tcs.marketCap || "N/A"}`);
    console.log("\nAll systems green! Ready for live deployment.");
  } catch (err) {
    console.error("   ✗ Error querying stock with provided key:", err.message);
    if (err.status === 401 || err.name === "AuthenticationError") {
      console.error("   ⚠ The API key was rejected by BharatStock. Check your key string.");
    }
  }
}

runDiagnostics();

