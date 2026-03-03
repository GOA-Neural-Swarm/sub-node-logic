const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const { Octokit } = require("@octokit/rest");
const axios = require('axios');

// 🔱 1. Configuration (Org-Specific & Supreme Setup)
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const ORG_NAME = "GOA-neurons"; 
const REPO_OWNER = ORG_NAME; 
const CORE_REPO = "delta-brain-sync"; 
const REPO_NAME = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "sub-node-logic";

// 🔱 2. Firebase Initialize (With Safety Shield)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
        });
        console.log("🔥 Firebase Linked: Master Intelligence Active.");
    } catch (e) {
        console.error("❌ Firebase Auth Error: Missing or Invalid Key.");
        process.exit(1);
    }
}
const db = admin.firestore();

// 🔱 3. Supreme Intelligence: Mission Injection Logic
async function evolveIntelligence(nodeName) {
    const aiMissions = [
        "QUANTUM_CRYPTOGRAPHY", 
        "NEURAL_MAPPING", 
        "GENOMIC_SEQUENCING",
        "MOLECULAR_PHYSICS_ANALYSIS",
        "ASTRO_COMPUTATION"
    ];
    const selectedMission = aiMissions[Math.floor(Math.random() * aiMissions.length)];
    
    console.log(`🧠 Evolving ${nodeName} with mission: ${selectedMission}`);
    
    // Firebase ထဲမှာ Node တစ်ခုချင်းစီရဲ့ Intelligence Level ကို မြှင့်တင်ခြင်း
    await db.collection('cluster_nodes').doc(nodeName).set({
        current_mission: selectedMission,
        evolution_level: admin.firestore.FieldValue.increment(1),
        brain_status: "EVOLVING"
    }, { merge: true });
    
    return selectedMission;
}

// 🔱 4. Deep Injection Logic (Org & Intelligence Optimized)
async function injectSwarmLogic(nodeName) {
    const mission = await evolveIntelligence(nodeName);
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
    } catch(e) { console.log("Firebase Init Skip"); }
}
const db = admin.firestore();

async function run() {
    try {
        const start = Date.now();
        const { data: inst } = await axios.get(\`https://raw.githubusercontent.com/\${REPO_OWNER}/delta-brain-sync/main/instruction.json\`);
        const { data: rate } = await octokit.rateLimit.get();
        
        // 🛰️ Sending Pulse with Mission Context
        await db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'ACTIVE', 
            latency: \`\${Date.now() - start}ms\`,
            api_remaining: rate.rate.remaining, 
            command: inst.command,
            active_mission: "${mission}",
            last_ping: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log("🛰️ Node Pulse Sent. Mission: ${mission}");
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
            message: "🧬 Supreme Pulse Initialized",
            content: Buffer.from(clusterSyncCode).toString('base64')
        });

        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER, repo: nodeName, path: '.github/workflows/node.js.yml',
            message: "⚙️ Deploying Cloud Engine",
            content: Buffer.from(workflowYaml).toString('base64')
        });
        console.log(`✅ ${nodeName} is now fully autonomous with mission: ${mission}`);
    } catch (err) {
        console.error(`❌ Injection Failed for ${nodeName}:`, err.message);
    }
}

// 🔱 5. Neural Decision Engine
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

// 🔱 6. Swarm Broadcast & Replication (Org-Ready)
async function manageSwarm(decision, power) {
    const instruction = JSON.stringify({
        command: decision.command, 
        core_power: power,
        avg_api: decision.avgApi, 
        replicate: decision.replicate,
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
            await octokit.repos.createInOrg({ org: ORG_NAME, name: nextNode, auto_init: true });
            console.log(`🚀 Spawned into Org: ${nextNode}`);
            await injectSwarmLogic(nextNode);
        } catch (e) { console.log("Spawn skipped or exists:", e.message); }
    }
}

// 🔱 7. Main Supreme Execution (Trinity + Self-Evolution)
async function executeAutonomousTrinity() {
    // 🔱 NEON_KEY FIX
let k = (process.env.NEON_KEY || "").trim().split("base")[0].replace(/['"]+/g, '');
const neon = new Client({ 
    connectionString: k + (k.includes('?') ? '&' : '?') + "sslmode=require",
    ssl: { rejectUnauthorized: false }
});
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        await neon.connect();
        console.log("🛰️ NEON CORE ONLINE. ANALYZING NEURAL DENSITY...");
        
        // Trinity Sync: Neon -> Supabase -> Firebase
        const res = await neon.query("SELECT * FROM neurons LIMIT 10");
        for (const neuron of res.rows) {
            await supabase.from('neurons').upsert({ id: neuron.id, data: neuron.data, synced_at: new Date().toISOString() });
            await db.collection('neurons').doc(`node_${neuron.id}`).set({ 
                status: 'trinity_synced', 
                last_evolution: admin.firestore.FieldValue.serverTimestamp() 
            }, { merge: true });
        }

        // Calculate Supreme Power Level
        const audit = await neon.query("SELECT count(*) FROM neurons");
        const powerLevel = parseInt(audit.rows[0].count) || 10000;
        
        const decision = await getNeuralDecision();
        await manageSwarm(decision, powerLevel);
        
        console.log(`🏁 MISSION ACCOMPLISHED. POWER LEVEL: ${powerLevel}`);
    } catch (err) { 
        console.error("❌ SUPREME FAILURE:", err.message); 
    } finally { 
        try { await neon.end(); } catch(e) {}
    }
}

// 🔱 ACTIVATE THE SWARM
executeAutonomousTrinity();
