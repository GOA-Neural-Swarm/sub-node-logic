const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const { Octokit } = require("@octokit/rest");
const axios = require('axios');

// 🔱 1. Configuration (Org-Specific)
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const ORG_NAME = "GOA-neurons"; // 👈 မင်းရဲ့ Org နာမည် အမှန်ဖြစ်ရပါမယ်
const REPO_OWNER = ORG_NAME; 
const CORE_REPO = "delta-brain-sync"; 
const REPO_NAME = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "sub-node-logic";

// 🔱 2. Firebase Initialize
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
        });
        console.log("🔥 Firebase Connected.");
    } catch (e) {
        console.error("❌ Firebase Auth Error: Make sure FIREBASE_KEY is a valid JSON string.");
        process.exit(1);
    }
}
const db = admin.firestore();

// 🔱 3. Deep Injection Logic (Org Optimized)
async function injectSwarmLogic(nodeName) {
    console.log(`🧬 Injecting Neural Logic into ${nodeName}...`);
    
    const clusterSyncCode = `const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const axios = require('axios');
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const REPO_OWNER = "${REPO_OWNER}";
const REPO_NAME = process.env.GITHUB_REPOSITORY.split('/')[1];
if (!admin.apps.length) { 
    try {
        admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)) }); 
    } catch(e) { console.log("Firebase Init Skip/Error"); }
}
const db = admin.firestore();
async function run() {
    try {
        const start = Date.now();
        const { data: inst } = await axios.get(\`https://raw.githubusercontent.com/\${REPO_OWNER}/delta-brain-sync/main/instruction.json\`);
        const { data: rate } = await octokit.rateLimit.get();
        await db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'ACTIVE', latency: \`\${Date.now() - start}ms\`,
            api_remaining: rate.rate.remaining, command: inst.command,
            last_ping: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("🛰️ Node Pulse Sent.");
    } catch (e) { console.log("Node Error:", e.message); }
}
run();`;

    const workflowYaml = `name: Node Sync
on:
  schedule: [{cron: "*/15 * * * *"}]
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: npm install @octokit/rest firebase-admin axios
      - run: node cluster_sync.js
        env:
          GH_TOKEN: \${{ secrets.GH_TOKEN }}
          FIREBASE_KEY: \${{ secrets.FIREBASE_KEY }}`;

    try {
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER, repo: nodeName, path: 'cluster_sync.js',
            message: "🧬 Initializing Swarm Logic",
            content: Buffer.from(clusterSyncCode).toString('base64')
        });

        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER, repo: nodeName, path: '.github/workflows/node.js.yml',
            message: "⚙️ Deploying Cloud Engine",
            content: Buffer.from(workflowYaml).toString('base64')
        });
        console.log(`✅ ${nodeName} is now fully autonomous.`);
    } catch (err) {
        console.error(`❌ Injection Failed for ${nodeName}:`, err.message);
    }
}

// 🔱 4. Neural Decision Engine
async function getNeuralDecision() {
    const snapshot = await db.collection('cluster_nodes').get();
    let totalApi = 0;
    let nodeCount = snapshot.size;
    if (nodeCount === 0) return { command: "INITIALIZE", replicate: true, avgApi: 5000 };
    snapshot.forEach(doc => { totalApi += (doc.data().api_remaining || 5000); });
    const avgApi = totalApi / nodeCount;
    let cmd = avgApi > 4000 ? "HYPER_EXPANSION" : (avgApi < 1000 ? "STEALTH_LOCKDOWN" : "NORMAL_GROWTH");
    return { command: cmd, replicate: avgApi > 1000, avgApi };
}

// 🔱 5. Swarm Broadcast & Replication (Fix: createInOrg)
async function manageSwarm(decision, power) {
    const instruction = JSON.stringify({
        command: decision.command, core_power: power,
        avg_api: decision.avgApi, replicate: decision.replicate,
        updated_at: new Date().toISOString()
    }, null, 2);

    try {
        const { data: instFile } = await octokit.repos.getContent({ owner: REPO_OWNER, repo: CORE_REPO, path: 'instruction.json' });
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER, repo: CORE_REPO, path: 'instruction.json',
            message: `🧠 Decision: ${decision.command}`,
            content: Buffer.from(instruction).toString('base64'),
            sha: instFile.sha
        });
    } catch (e) { console.log("Instruction file sync error, proceeding..."); }

    if (decision.replicate) {
        const nextNode = `swarm-node-${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`;
        try {
            // 🔱 အရေးကြီးဆုံးအချက်: createInOrg ကို သုံးရပါမည်
            await octokit.repos.createInOrg({ org: ORG_NAME, name: nextNode, auto_init: true });
            console.log(`🚀 Spawned into Org: ${nextNode}`);
            await injectSwarmLogic(nextNode);
        } catch (e) { console.log("Spawn skipped or exists:", e.message); }
    }
}

// 🔱 6. Main Execution
async function executeAutonomousTrinity() {
    const neon = new Client({ connectionString: process.env.NEON_KEY + (process.env.NEON_KEY.includes('?') ? '&' : '?') + "sslmode=verify-full" });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        await neon.connect();
        console.log("🛰️ NEON CORE ONLINE.");
        
        // Trinity Sync Logic
        const res = await neon.query("SELECT * FROM neurons LIMIT 5"); // စမ်းသပ်ရန် ၅ ခုပဲ အရင်ယူမည်
        for (const neuron of res.rows) {
            await supabase.from('neurons').upsert({ id: neuron.id, data: neuron.data, synced_at: new Date().toISOString() });
            await db.collection('neurons').doc(`node_${neuron.id}`).set({ status: 'trinity_synced', last_evolution: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        }

        const decision = await getNeuralDecision();
        await manageSwarm(decision, 10000); // Default Power Level
        
        console.log("🏁 MISSION ACCOMPLISHED.");
    } catch (err) { 
        console.error("❌ FAILURE:", err.message); 
    } finally { 
        try { await neon.end(); } catch(e) {}
    }
}

executeAutonomousTrinity();
