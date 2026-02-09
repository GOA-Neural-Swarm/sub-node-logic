const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

// 🔱 1. Configuration (Set to your Org Name)
const ORG_NAME = "GOA-neurons"; 
const REPO_OWNER = ORG_NAME; 
const CORE_REPO = "delta-brain-sync"; 
const REPO_NAME = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "sub-node-logic";

const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const neonClient = new Client({ connectionString: process.env.NEON_KEY, ssl: { rejectUnauthorized: false } });

if (!admin.apps.length) {
    try {
        admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)) });
        console.log("🔥 Firebase Linked to Cluster.");
    } catch (e) { console.error("❌ Firebase Auth Fail"); process.exit(1); }
}
const db = admin.firestore();

async function executeSupremeExpansion() {
    try {
        await neonClient.connect();
        console.log("🛰️ NEON CORE ONLINE.");

        // 🔱 Step 1: Decision Logic from Core Instruction
        const { data: instruction } = await axios.get(`https://raw.githubusercontent.com/${REPO_OWNER}/${CORE_REPO}/main/instruction.json`);
        console.log(`🧠 Central Command: ${instruction.command}`);

        // 🔱 Step 2: Org-Level Replication Logic
        if (instruction.replicate === true) {
            const nextNode = `swarm-node-${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`;
            try {
                console.log(`🧬 Spawning ${nextNode} into Organization...`);
                await octokit.repos.createInOrg({ org: ORG_NAME, name: nextNode, auto_init: true });
                
                // Injecting logic & workflow
                const files = ['package.json', 'cluster_sync.js', '.github/workflows/node.js.yml'];
                for (const f of files) {
                    const { data: content } = await octokit.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path: f });
                    await octokit.repos.createOrUpdateFileContents({
                        owner: REPO_OWNER, repo: nextNode, path: f,
                        message: `🧬 Pulse: ${nextNode} activated`,
                        content: content.content
                    });
                }
                console.log(`✅ ${nextNode} is now live and synchronized.`);
            } catch (e) { console.log("Spawn overlap or error:", e.message); }
        }

        // 🔱 Step 3: Global Status Reporting
        await db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'MASTER_ACTIVE',
            org: ORG_NAME,
            last_pulse: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log("🏁 MISSION ACCOMPLISHED: ORG SWARM IS STABLE.");
    } catch (err) { console.error("❌ CRITICAL FAILURE:", err.message); }
    finally { await neonClient.end(); }
}

executeSupremeExpansion();
