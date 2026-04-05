process.removeAllListeners("warning");

const { Octokit } = require("@octokit/rest");
const admin = require("firebase-admin");
const axios = require("axios");
const vm = require("vm");
const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");
const fs = require("fs");
const { execSync } = require("child_process");

// 🔱 1. Configuration & Auth
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const API_KEY = process.env.GROQ_API_KEY;
const REPO_OWNER = "GOA-neurons";

// 🔱 NEON_KEY REPAIR
let rawKey = process.env.NEON_KEY || "";
let cleanKey = rawKey.trim().replace(/['"]+/g, "");
let finalUrl = cleanKey.replace(/^postgres:\/\//, "postgresql://");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// 🔱 DATABASE FACTORY
const neonClientFactory = async () => {
  if (global.neonClient && !global.neonClient._ending) return global.neonClient;
  const client = new Client({
    connectionString: finalUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  global.neonClient = client;
  return client;
};

// 🧠 MASTER EXECUTION PROTOCOL
async function executeDeepSwarmProtocol() {
  try {
    console.log("🛠 [SYSTEM]: Initializing Swarm Protocol...");
    const client = await neonClientFactory();
    await client.query("SELECT 1");
    console.log("🔱 [NEON]: Core Connected and Verified.");

    const startTime = Date.now();
    // Your core logic here
    console.log(`⏱️ Cycle processed in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error("💀 [CORE_ERROR]:", error.message);
    global.neonClient = null;
    process.exit(1);
  }
}

// 🚀 START SYSTEM
executeDeepSwarmProtocol().catch((err) => {
  console.error("Fatal Breach:", err);
  process.exit(1);
});
