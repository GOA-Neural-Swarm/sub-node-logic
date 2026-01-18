
const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const REPO_OWNER = 'GOA-neurons';
const CORE_REPO = 'delta-brain-sync';

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)) });
}
const db = admin.firestore();

async function listenToCore() {
    try {
        const { data } = await octokit.repos.getContent({ owner: REPO_OWNER, repo: CORE_REPO, path: 'instruction.json' });
        const instruction = JSON.parse(Buffer.from(data.content, 'base64').toString());
        await db.collection('cluster_nodes').doc('sub-node-logic').set({
            status: 'LINKED_TO_CORE',
            command: instruction.command,
            power: instruction.core_power,
            last_ping: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("✅ Sub-node Active.");
    } catch (e) { console.error("Waiting for core..."); }
}
listenToCore();
