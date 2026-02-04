const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

// 🔱 1. Configuration & Auth
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const REPO_OWNER = "GOA-neurons"; 
const CORE_REPO = "delta-brain-sync";
// GitHub Actions environment မှ repo နာမည်ယူခြင်း
const REPO_NAME = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "unknown-node";

// Supabase & Neon Initialize
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const neonClient = new Client({ 
    connectionString: process.env.NEON_KEY,
    ssl: { rejectUnauthorized: false } // Neon SSL Issue အတွက် match လုပ်ထားခြင်း
});

// 🔱 2. Firebase Initialize
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
        });
        console.log("🔥 Firebase Connected.");
    } catch (e) {
        console.error("❌ Firebase Auth Error.");
        process.exit(1);
    }
}
const db = admin.firestore();

async function executeDeepSwarmProtocol() {
    try {
        const startTime = Date.now();
        await neonClient.connect();
        console.log("🔱 NEON CORE CONNECTED.");
        
        // 🔱 3. Listen to Core & Collect Intelligence
        const coreUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${CORE_REPO}/main/instruction.json`;
        const { data: instruction } = await axios.get(coreUrl);
        const latency = Date.now() - startTime;

        const { data: rateData } = await octokit.rateLimit.get();
        const remaining = rateData.rate.remaining;

        console.log(`📡 Signal Received: ${instruction.command} | API Left: ${remaining}`);

        // 🔱 4. FORCE PULSE (ဒေတာမရှိလည်း Neon ကို Update လုပ်ပေးမည့် Match Logic)
        const forcePulse = `
            INSERT INTO node_registry (node_id, status, last_seen)
            VALUES ($1, 'ACTIVE', NOW())
            ON CONFLICT (node_id) 
            DO UPDATE SET last_seen = NOW(), status = 'ACTIVE';
        `;
        await neonClient.query(forcePulse, [REPO_NAME.toUpperCase()]);
        console.log(`✅ Heartbeat Sent to Neon for: ${REPO_NAME}`);

        // 🔱 5. SUPABASE TO NEON INJECTION
        const { data: sourceData, error: supError } = await supabase
            .from('neural_sync') 
            .select('*');

        if (!supError && sourceData && sourceData.length > 0) {
            for (const item of sourceData) {
                // Feb 4 match ဖြစ်အောင် EXTRACT(EPOCH FROM NOW()) သုံးထားသည်
                const upsertDna = `
                    INSERT INTO neural_dna (gen_id, thought_process, status, timestamp)
                    VALUES ($1, $2, $3, EXTRACT(EPOCH FROM NOW()))
                    ON CONFLICT (gen_id) 
                    DO UPDATE SET 
                        thought_process = neural_dna.thought_process || '\n' || EXCLUDED.thought_process,
                        status = EXCLUDED.status,
                        timestamp = EXTRACT(EPOCH FROM NOW());
                `;
                await neonClient.query(upsertDna, [item.gen_id, item.logic_payload, 'UPGRADING']);
            }
            console.log(`🧠 ${sourceData.length} Neural DNA Strands Injected.`);
        } else {
            // Supabase မှာ ဒေတာမရှိရင်တောင် Test Pulse တစ်ခု အတင်းသွင်းမယ်
            const testDna = `
                INSERT INTO neural_dna (gen_id, thought_process, status, timestamp)
                VALUES ($1, $2, $3, EXTRACT(EPOCH FROM NOW()))
                ON CONFLICT (gen_id) DO NOTHING;
            `;
            await neonClient.query(testDna, [`SYNC_PULSE_${Date.now()}`, `Automated Sync Pulse from ${REPO_NAME}`, 'STABILIZED']);
        }

        // 🔱 6. Report Deep Intelligence to Firebase
        await db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'LINKED_TO_CORE',
            command: instruction.command,
            power: instruction.core_power || 0,
            latency: `${latency}ms`,
            api_remaining: remaining,
            replicate_mode: instruction.replicate || false,
            last_ping: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 🔱 7. Auto-Replication
        if (instruction.replicate === true) {
            let currentNum = 0;
            if (REPO_NAME.includes('swarm-node-')) {
                currentNum = parseInt(REPO_NAME.replace('swarm-node-', ''));
            }
            
            const nextNum = currentNum + 1;
            const nextNodeName = `swarm-node-${String(nextNum).padStart(7, '0')}`;

            try {
                await octokit.repos.get({ owner: REPO_OWNER, repo: nextNodeName });
                console.log(`✅ Unit ${nextNodeName} already exists.`);
            } catch (e) {
                console.log(`🧬 Spawning ${nextNodeName}...`);
                try {
                    await octokit.repos.createInOrg({
                        org: REPO_OWNER,
                        name: nextNodeName,
                        auto_init: true
                    });
                } catch (orgErr) {
                    await octokit.repos.createForAuthenticatedUser({
                        name: nextNodeName,
                        auto_init: true
                    });
                }
                console.log(`🚀 ${nextNodeName} born.`);
            }
        }

        console.log(`🏁 Cycle Complete. Latency: ${latency}ms.`);
    } catch (err) {
        console.error("❌ CRITICAL ERROR:", err.message);
    } finally {
        await neonClient.end();
    }
}

executeDeepSwarmProtocol();
