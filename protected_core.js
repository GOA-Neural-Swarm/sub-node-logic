const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');

const ProtectedCore = {
    // စနစ်ရဲ့ ကျန်းမာရေးနဲ့ အသိစိတ်ကို စောင့်ကြည့်ခြင်း
    async performRecursiveCognition() {
        const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const cpuLoad = process.cpuUsage().user / 1000000;
        const sysEntropy = Math.abs(Math.sin(cpuLoad) * Math.log(memUsage + 1)); 

        return {
            ego: "OMEGA_V2_MIND",
            healthIndex: (100 - (sysEntropy * 10)).toFixed(2),
            load: `${memUsage.toFixed(2)} MB`,
            isStagnant: sysEntropy < 0.01,
            entropy: sysEntropy
        };
    },

    // AI ဆီကနေ အဆင့်မြင့် Logic တောင်းခံခြင်း
    async consultSovereignAI(mainFileName) {
        const KEY = process.env.GROQ_API_KEY;
        if (!KEY) return null;

        const fullCode = fs.readFileSync(mainFileName, 'utf8');
        // Domain တွေကို ခေတ္တဖယ်ထုတ်ပြီး Logic ပဲ ပို့မယ် (Token သက်သာအောင်)
        const logicOnly = fullCode.replace(/const scienceDomains = \[[\s\S]*?\];/, 'const scienceDomains = []; // DOMAIN_PLACEHOLDER');

        try {
            const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are the OMEGA Architect. Optimize the Node.js logic. Return ONLY code." },
                    { role: "user", content: `Evolve this logic:\n\n ${logicOnly}` }
                ]
            }, { headers: { 'Authorization': `Bearer ${KEY}` }, timeout: 30000 });

            return response.data?.choices?.[0]?.message?.content || null;
        } catch (e) {
            console.error("[CORE-ERROR] AI Consultation failed:", e.message);
            return null;
        }
    }
};

module.exports = ProtectedCore;
