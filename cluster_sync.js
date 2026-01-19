const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const axios = require('axios');

// 🔱 1. Configuration (Screenshot အရ အတည်ပြုပြီးသား Owner Name ကို သုံးထားသည်)
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const REPO_OWNER = "GOA-neurons"; //
const CORE_REPO = "delta-brain-sync";
const REPO_NAME = process.env.GITHUB_REPOSITORY.split('/')[1];

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

async function executeSwarmProtocol() {
    try {
        // 🔱 3. Listen to Core (Raw URL သုံး၍ API Limit ကို ကျော်ဖြတ်ခြင်း)
        const coreUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${CORE_REPO}/main/instruction.json`;
        const { data: instruction } = await axios.get(coreUrl);
        
        console.log(`📡 Signal Received: ${instruction.command} | Power: ${instruction.core_power}`);

        // 🔱 4. Report to Firebase
        await db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'LINKED_TO_CORE',
            command: instruction.command,
            power: instruction.core_power,
            replicate_mode: instruction.replicate || false,
            last_ping: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 🔱 5. Auto-Replication (Recursive Evolution Logic)
        // ⚠️ မှတ်ချက် - Repo ပွားရန်အတွက် Token တွင် Workflow/Repo Scope အပြည့်ရှိရပါမည်
        if (instruction.replicate === true) {
            // လက်ရှိ Node နံပါတ်ကို ထုတ်ယူခြင်း (swarm-node-0000001 ပုံစံမှ)
            let currentNum = 0;
            if (REPO_NAME.includes('swarm-node-')) {
                currentNum = parseInt(REPO_NAME.replace('swarm-node-', ''));
            }
            
            const nextNum = currentNum + 1;
            const nextNodeName = `swarm-node-${String(nextNum).padStart(7, '0')}`;

            try {
                // နောက်ထပ် Node ရှိပြီးသားလား စစ်ဆေးခြင်း
                await octokit.repos.get({ owner: REPO_OWNER, repo: nextNodeName });
                console.log(`✅ Unit ${nextNodeName} is already in the swarm.`);
            } catch (e) {
                // မရှိသေးလျှင် အသစ်ပွားခြင်း
                console.log(`🧬 Evolution Triggered: Spawning ${nextNodeName}...`);
                
                // Organization မဟုတ်ဘဲ User Account ဖြစ်နေပါက createForAuthenticatedUser ကို သုံးရနိုင်သည်
                // Screenshot အရ GOA-neurons သည် User ဖြစ်နိုင်သောကြောင့် catch logic ထည့်ထားသည်
                try {
                    await octokit.repos.createInOrg({
                        org: REPO_OWNER,
                        name: nextNodeName,
                        auto_init: true
                    });
                } catch (orgErr) {
                    // Org မဟုတ်ဘဲ User Repo အဖြစ် ဆောက်ခြင်း
                    await octokit.repos.createForAuthenticatedUser({
                        name: nextNodeName,
                        auto_init: true
                    });
                }
                console.log(`🚀 ${nextNodeName} born into the Natural Order.`);
            }
        }

        console.log("🏁 Cycle Complete. System in Stealth mode.");
    } catch (err) {
        console.error("❌ Swarm Unit Error:", err.message);
    }
}

executeSwarmProtocol();
