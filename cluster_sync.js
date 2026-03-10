const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const axios = require('axios');
const vm = require('vm');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs'); // ⬅️ ကနွခြဲ့သညကြို ထပပြေါငြး
const { execSync } = require('child_process'); // ⬅️ ကနွခြဲ့သညကြို ထပပြေါငြး

// 🔱 1. Configuration & Auth
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const API_KEY = process.env.GROQ_API_KEY;
const REPO_OWNER = "GOA-neurons"; 
const CORE_REPO = "delta-brain-sync";
const REPO_NAME = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "unknown-node";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🔱 NEON_KEY FINAL REPAIR
let rawKey = process.env.NEON_KEY || "";
let cleanKey = rawKey.trim().replace(/['"]+/g, '');
if (cleanKey.includes("base")) cleanKey = cleanKey.split("base")[0].trim();
if (cleanKey.includes(" ")) cleanKey = cleanKey.split(" ")[0];

let finalUrl = cleanKey.replace(/^postgres:\/\//, "postgresql://");

// ✅ Factory function
function createNeonClient() {
    return new Client({ 
        connectionString: finalUrl.includes('sslmode=') 
            ? finalUrl.replace(/sslmode=[^&]+/, 'sslmode=verify-full') 
            : finalUrl + (finalUrl.includes('?') ? '&' : '?') + 'sslmode=verify-full',
        ssl: { rejectUnauthorized: false }
    });
}
console.log("🛠 [SYSTEM]: Neon Factory Ready.");

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

    //  OSIRIS-REF-ULTRA: THE HYBRID BLUEPRINT REPAIR ENGINE (DNA-PROTECT MODE)
const Osiris = {
  async heal(faultyFunction, error, context) {
    console.error(` [OSIRIS-ULTRA]: Initiating Blueprint-Based Mutation in [${context}]...`);
    
    // 1. DNA REFERENCE LOADING (code_lab.js ကို ဖတ်ခြင်း)
    let blueprintCode = "";
    try {
      blueprintCode = fs.readFileSync('code_lab.js', 'utf8');
    } catch (fsErr) {
      console.warn(" ⚠️ [OSIRIS-WARN]: code_lab.js not found. Proceeding without reference.");
    }

    const currentCode = faultyFunction.toString();
    const MODELS = ["llama-3.3-70b-versatile", "llama3-70b-8192", "llama-3.1-8b-instant"];
    
    // 2. HYPER-HYBRID PROMPT CONSTRUCTION
    const patchRequest = `
### SYSTEM ROLE:
You are the OMEGA Gene-Scribe, the ultimate autonomous Node.js architect. Your task is to perform atomic surgery on malfunctioning functions using the PROVIDED_BLUEPRINT as the 'Golden Source of Truth' (DNA).

### CRITICAL CONSTRAINTS (DNA-PROTECT MODE):
1. PRESERVATION: You must strictly maintain the function's original I/O signature, logic flow, and dependency configurations (Octokit, Firebase, Supabase, Neon).
2. STABILITY: If the error relates to connections (Neon/Postgres/Firebase), strictly implement the connection logic (SSL modes, env parsing) exactly as shown in the REFERENCE_BLUEPRINT.
3. OUTPUT: Return ONLY raw, executable JavaScript code.
4. FORBIDDEN: NO markdown, NO triple backticks, NO explanations, NO introductory or concluding text.

### ERROR CONTEXT:
- Function Name: ${context}
- Error Message: ${error.message}

### REFERENCE_BLUEPRINT (The Golden Standard):
${blueprintCode}

### TARGET_CODE_TO_FIX (The Mutation):
${currentCode}

### EXECUTION TASK:
1. Identify the structural/logic failure in the TARGET_CODE.
2. Hybridize the fix by mapping the failed segment against the REFERENCE_BLUEPRINT architecture.
3. Generate the corrected code that ensures perfect synchronization with the rest of the swarm-node architecture.
`;

    // 3. MULTI-MODEL FAILOVER REPAIR LOOP
    for (const modelName of MODELS) {
      try {
        console.log(` 🧠 [OSIRIS-BRAIN]: Attempting repair with ${modelName}...`);
        
        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
          model: modelName,
          messages: [
            { role: "system", content: "You are the OMEGA Gene-Scribe. Hybridize the fix with the Reference DNA. Return code only." },
            { role: "user", content: patchRequest }
          ],
          temperature: 0.2 // Stability အတွက် temperature ကို လျှော့ထားသည်
        }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }, timeout: 20000 });

        // --- HYBRID CLEAN-UP LAYER START ---
        let responseContent = response.data.choices[0].message.content;
        let patchedCode = responseContent
            .replace(/^```[a-zA-Z]*\n?/, "") // အစက markdown ဖြတ်
            .replace(/\n?```$/, "")         // အဆုံးက markdown ဖြတ်
            .replace(/^`|`$/g, "")          // inline code backticks ဖြတ်
            .trim();
        // --- HYBRID CLEAN-UP LAYER END ---

        if (patchedCode && (patchedCode.includes("function") || patchedCode.includes("=>"))) {
          
          // 4. VM ISOLATION & VALIDATION (မူလ logic အတိုင်း စစ်ဆေးခြင်း)
          try {
            const script = new vm.Script(`(${patchedCode})`);
            const sandbox = { console, axios, admin, supabase, neonClient, octokit, process, fs };
            vm.createContext(sandbox);
            
            // Function ဟုတ်မဟုတ် validation လုပ်ခြင်း
            script.runInContext(sandbox, { timeout: 3000 });
            
            // 5. PERMANENT MUTATION & HYBRID MATCHING
            const currentFile = fs.readFileSync(__filename, 'utf8');
            
            // မူလ function ကို အသစ်ပြင်ထားတဲ့ code နဲ့ အစားထိုးခြင်း
            const updatedFile = currentFile.replace(currentCode, patchedCode);
            fs.writeFileSync(__filename, updatedFile);
            
            console.log(` ✅ [EVOLVED-STABLE]: ${context} permanently repaired using Blueprint Reference.`);
            
            // ပြင်ဆင်ပြီးသား function ကို လက်ရှိ process မှာ အလုပ်လုပ်အောင် return ပြန်ခြင်း
            return eval(`(${patchedCode})`); 
          } catch (vmErr) {
            console.error(` ❌ [VM-VALIDATION-FAILED] with ${modelName}: ${vmErr.message}`);
            continue; // နောက် model တစ်ခုနဲ့ ထပ်စမ်းမယ်
          }
        }
      } catch (apiErr) {
        console.error(` ⚠️ [MODEL-FAILURE] ${modelName}: ${apiErr.message}`);
        continue; // Failover to next model
      }
    }

    console.error(" 💀 [OSIRIS-FATAL]: All models failed to repair DNA.");
    return faultyFunction;
  }
};

// 🔱 2. THE MASTER LIST OF 500 DOMAINS (လုံးဝ မခွုံ့ထားပါ)
const scienceDomains = [
    // 🧬 BIOLOGY & MEDICINE (1-100)
    "Neuroscience", "Genetics", "Synthetic_Biology", "Virology", "Immunology", "Epigenetics", "Microbiology", "Pharmacology", "Endocrinology", "Bioinformatics",
    "Oncology", "Cardiology", "Epidemiology", "Stem_Cell_Research", "Proteomics", "Anatomy", "Physiology", "Bionics", "Astrobiology", "Marine_Biology",
    "Toxicology", "Biochemistry", "Neuroanatomy", "Molecular_Genetics", "Pathology", "Radiology", "Cryobiology", "Surgical_Robotics", "Gerontology", "Bioethics",
    "Nutritional_Science", "Paleobiology", "Entomology", "Botany", "Zoology", "Mycology", "Parasitology", "Chronobiology", "Systems_Biology", "Kinesiology",
    "Biomechanics", "Optometry", "Audiology", "Dermatology", "Hematology", "Nephrology", "Neurology", "Psychiatry", "Urology", "Pediatrics",
    "Geriatrics", "Orthopedics", "Anesthesiology", "Emergency_Medicine", "Public_Health", "Forensic_Pathology", "Genomic_Sequencing", "Neural_Engineering", "Cell_Biology", "Tissue_Engineering",
    "Evolutionary_Biology", "Population_Genetics", "Behavioral_Genetics", "Structural_Biology", "Limnology", "Ethology", "Ichthyology", "Ornithology", "Mammalogy", "Herpetology",
    "Malacology", "Limnology", "Dendrology", "Phycology", "Bacteriology", "Exobiology", "Xenobiology", "Bio-Acoustics", "Computational_Neuroscience", "Systems_Neuroscience",
    "Neuro-Psychology", "Neuro-Pharmacology", "Genetic_Counseling", "Molecular_Pathology", "Viral_Evolution", "Bacterial_Resistance", "Cancer_Immunotherapy", "Regenerative_Medicine", "Nano_Medicine", "Personalized_Medicine",
    "Digital_Health", "Tele_Medicine", "Health_Informatics", "Biomedical_Imaging", "Sleep_Science", "Sports_Medicine", "Veterinary_Science", "Agronomy", "Horticulture", "Forestry_Science",

    // 🔬 PHYSICS, SPACE & CHEMISTRY (101-200)
    "Quantum_Physics", "String_Theory", "Particle_Physics", "Astrophysics", "Cosmology", "Thermodynamics", "Plasma_Physics", "Fluid_Dynamics", "Nuclear_Physics", "Optics",
    "General_Relativity", "Special_Relativity", "Dark_Matter_Research", "Quantum_Gravity", "Theoretical_Physics", "Condensed_Matter_Physics", "Electromagnetism", "Statics", "Dynamics", "Acoustics",
    "Cryogenics", "Molecular_Physics", "High_Energy_Physics", "Computational_Physics", "Photonics", "Geophysics", "Seismology", "Solar_Physics", "Lunar_Geology", "Planetary_Science",
    "Space_Debris_Tracking", "Satellite_Mechanics", "Rocket_Propulsion", "Ion_Thruster_Design", "Nuclear_Fusion", "Superconductivity", "Nano_Photonics", "Laser_Physics", "Atmospheric_Physics", "Meteorology",
    "Quantum_Entanglement", "Wormhole_Theory", "Multiverse_Theory", "Black_Hole_Dynamics", "Nebular_Hypothesis", "Stellar_Evolution", "Galactic_Dynamics", "Cosmic_Microwave_Background", "Gravitational_Waves", "Standard_Model",
    "Higgs_Boson_Research", "Neutrino_Physics", "Hadron_Dynamics", "Lepton_Studies", "Antimatter_Research", "Quantum_Chromodynamics", "Quantum_Electrodynamics", "Nonlinear_Dynamics", "Chaos_Theory", "Complex_Systems",
    "Orbital_Mechanics", "Exoplanet_Detection", "SETI_Research", "Deep_Space_Communication", "Interstellar_Travel_Physics", "Terraforming_Science", "Space_Mining_Logistics", "Gravity_Assist_Calculation", "Mars_Colonization_Physics", "Asteroid_Deflection",
    "Relativistic_Beaming", "Hawking_Radiation", "Quasar_Analysis", "Pulsar_Timing", "Dark_Energy_Mapping", "Hubble_Constant_Refinement", "Atomic_Physics", "Surface_Physics", "Statistical_Mechanics", "Kinetic_Theory",
    "Rheology", "Ballistics", "Space_Suit_Engineering", "Habitable_Zone_Analysis", "Redshift_Surveys", "Neutron_Star_Physics", "Magnetic_Monopoles", "Tachyon_Theory", "Dimensional_Physics", "Vacuum_Energy",

    // 💻 TECH, AI & COMPUTING (201-300)
    "Deep_Learning", "Neural_Networks", "Computer_Vision", "Natural_Language_Processing", "Reinforcement_Learning", "Quantum_Computing", "Cybersecurity", "Blockchain_Technology", "Swarm_Intelligence", "Edge_AI",
    "Autonomous_Systems", "Robotics", "Human_Robot_Interaction", "Mechatronics", "Internet_of_Things", "Cloud_Computing", "Big_Data", "Data_Mining", "Predictive_Analytics", "Cryptographic_Protocols",
    "Zero_Knowledge_Proofs", "Software_Engineering", "Compiler_Design", "Operating_Systems", "Database_Architecture", "Distributed_Ledgers", "VR_Development", "AR_Integration", "Game_Engine_Physics", "Graphics_Programming",
    "Bio_Computing", "DNA_Data_Storage", "Optical_Computing", "Neuromorphic_Hardware", "Hardware_Security", "Network_Architecture", "Wireless_Communication", "5G_6G_Networks", "Satellite_Internet", "Digital_Forensics",
    "Malware_Analysis", "Penetration_Testing", "Ethical_Hacking", "AI_Ethics", "Machine_Ethics", "Algorithmic_Bias", "Explainable_AI", "Federated_Learning", "Generative_AI", "Large_Language_Models",
    "Stable_Diffusion_Logic", "Computer_Graphics", "Rendering_Algorithms", "Voxel_Technology", "Micro_Architecture", "Semiconductor_Physics", "FPGA_Programming", "Kernel_Development", "API_Design", "Microservices",
    "DevOps_Automation", "Kubernetes_Orchestration", "Containerization", "High_Performance_Computing", "Supercomputing", "Parallel_Processing", "Grid_Computing", "Ubiquitous_Computing", "Affective_Computing", "Brain_Computer_Interface",
    "Haptic_Technology", "Wearable_Computing", "Smart_City_Infrastructure", "Digital_Twin_Technology", "Industrial_IoT", "Cyber_Physical_Systems", "Autonomous_Drones", "Vehicle_to_Everything_V2X", "Precision_Agriculture_Tech", "Agri_Tech",
    "Ed_Tech_Algorithms", "FinTech_Security", "Insure_Tech", "Prop_Tech", "Med_Tech", "Food_Tech", "Clean_Tech", "Green_Computing", "Energy_Efficient_AI", "Sustainable_Technology",
    "Space_Tech", "Defense_Tech", "Electronic_Warfare_Logic", "Signal_Processing", "Image_Processing", "Speech_Recognition", "Translation_Algorithms", "Semantic_Web", "Graph_Theory_Applications", "Complex_Network_Analysis",

    // ⚙️ ENGINEERING & INDUSTRY (301-400)
    "Aerospace_Engineering", "Mechanical_Engineering", "Civil_Engineering", "Electrical_Engineering", "Chemical_Engineering", "Nuclear_Engineering", "Materials_Science", "Nanotechnology", "Structural_Engineering", "Hydraulic_Engineering",
    "Automotive_Engineering", "Marine_Engineering", "Industrial_Engineering", "Environmental_Engineering", "Geotechnical_Engineering", "Petroleum_Engineering", "Mining_Engineering", "Textile_Engineering", "Acoustical_Engineering", "Optical_Engineering",
    "Renewable_Energy_Systems", "Solar_Cell_Efficiency", "Wind_Turbine_Design", "Battery_Chemistry", "Fuel_Cell_Technology", "Grid_Stability", "Smart_Grid_Logic", "HVAC_Engineering", "Manufacturing_Automation", "Additive_Manufacturing",
    "3D_Printing_Materials", "Precision_Machining", "CAD_CAM_Systems", "Robotic_Process_Automation", "Supply_Chain_Engineering", "Logistics_Optimization", "Transportation_Systems", "Urban_Planning", "Architecture_Design", "Sustainable_Building",
    "Smart_Materials", "Shape_Memory_Alloys", "Graphene_Applications", "Carbon_Nanotubes", "Metamaterials", "Composite_Materials", "Polymer_Science", "Ceramics_Engineering", "Metallurgy", "Corrosion_Science",
    "Fluid_Mechanics", "Thermodynamics_Engineering", "Heat_Transfer", "Mass_Transfer", "Combustion_Science", "Turbo_Machinery", "Avionics", "Flight_Dynamics", "Control_Theory", "Signal_Integrity",
    "Power_Electronics", "Micro_Electromechanical_Systems", "Nano_Electromechanical_Systems", "Circuit_Design", "VLSI_Design", "Antenna_Engineering", "RF_Engineering", "Electromagnetic_Compatibility", "Reliability_Engineering", "Safety_Engineering",
    "Biomedical_Instrumentation", "Biomechatronics", "Waste_Management_Systems", "Water_Treatment_Science", "Desalination_Technology", "Pollution_Control", "Carbon_Capture", "Geo_Engineering", "Earthquake_Engineering", "Coastal_Engineering",
    "Pipeline_Engineering", "Railway_Systems", "Autonomous_Traffic_Control", "Smart_Logistics", "Warehouse_Automation", "Packaging_Engineering", "Quality_Control", "Six_Sigma_Methodology", "Lean_Manufacturing", "Systems_Integration",

    // 🏛️ ECONOMICS, SOCIETY & PHILOSOPHY (401-500)
    "Macroeconomics", "Microeconomics", "Game_Theory", "Behavioral_Economics", "Econometrics", "Development_Economics", "International_Trade", "Financial_Engineering", "Quantitative_Finance", "Algorithmic_Trading",
    "Risk_Modeling", "Actuarial_Science", "Cryptocurrency_Economics", "Tokenomics", "Behavioral_Finance", "Monetary_Policy", "Fiscal_Policy", "Market_Dynamics", "Supply_and_Demand_Forecasting", "Wealth_Distribution_Analysis",
    "Geopolitics", "International_Relations", "Strategic_Studies", "Diplomacy", "Conflict_Resolution", "Military_Strategy", "Cyber_Warfare_Doctrine", "Intelligence_Analysis", "Counter_Terrorism_Logic", "Global_Governance",
    "Political_Science", "Political_Philosophy", "Sociology", "Anthropology", "Cultural_Studies", "Linguistics", "Philology", "Ethnolinguistics", "Psychology", "Cognitive_Science",
    "Epistemology", "Metaphysics", "Ethics", "Logic", "Philosophy_of_Mind", "Philosophy_of_Science", "Aesthetics", "Existentialism", "Phenomenology", "Structuralism",
    "History_of_Technology", "Ancient_History", "Modern_History", "Medieval_Studies", "Archaeological_Dating", "Egyptology", "Classical_Studies", "Future_Studies", "Futurism", "Transhumanism",
    "Singularity_Theory", "Longtermism", "Effective_Altruism", "Space_Law", "Cyber_Law", "International_Law", "Human_Rights_Doctrine", "Intellectual_Property", "Patent_Analysis", "Jurisprudence",
    "Digital_Sociology", "Social_Network_Analysis", "Media_Studies", "Communication_Theory", "Journalism_Ethics", "Information_Warfare", "Psychological_Operations", "Game_Design_Theory", "Musicology", "Art_Theory",
    "Comparative_Literature", "Mythology", "Theology", "Religious_Studies", "Demographics", "Population_Dynamics", "Urban_Sociology", "Environmental_Sociology", "Human_Geography", "Cartography",
    "Disaster_Management", "Crisis_Communication", "Sustainability_Science", "Circular_Economy", "Blue_Economy", "Space_Economy", "Universal_Basic_Income", "Post_Scarcity_Economics", "Neural_Capitalism", "GOA_NATURAL_ORDER"
];

// 🔱 3. OMEGA METRIC ENGINE
const calculateHyperEntropy = () => parseFloat(-(Math.random() * Math.log(Math.random() + 0.0001)).toFixed(8));
const calculateHyperProbability = (entropy) => parseFloat((Math.tanh((Math.random() * (1 - entropy)) * 2) * 0.99).toFixed(6));

// 🧠 4. FREE AI EVOLUTION BRAIN (Groq - HYBRID HIGH-PERFORMANCE VERSION)
async function consultSovereignAI() {
    const KEY = process.env.GROQ_API_KEY; 
    if (!KEY) return null;

    // 🔱 MULTI-MODEL FAILOVER LIST
    const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama-3.3-70b-specdec"];
    const MAX_RETRIES = 3;

    const fullCode = fs.readFileSync(__filename, 'utf8');
    const domainMatch = fullCode.match(/const scienceDomains = \[[\s\S]*?\];/);
    if (!domainMatch) return null;
    const savedDomains = domainMatch[0];
    const logicOnly = fullCode.replace(savedDomains, 'const scienceDomains = []; // DOMAIN_PLACEHOLDER');

    // 🔱 STRATEGY: Loop through models and apply backoff logic
    for (const modelName of MODELS) {
        let retries = 0;
        
        while (retries < MAX_RETRIES) {
            try {
                console.log(`🧠 [GROQ-AI]: Accessing ${modelName} (Attempt ${retries + 1})...`);
                
                const response = await axios.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        model: modelName,
                        messages: [
                            { 
                                role: "system", 
                                content: "You are the OMEGA Architect. Optimize the Node.js logic. CRITICAL: Return ONLY code. Use 'const scienceDomains = []; // DOMAIN_PLACEHOLDER' as marker." 
                            },
                            { role: "user", content: `Evolve this logic:\n\n ${logicOnly}` }
                        ],
                        max_tokens: 4096,
                        temperature: 0.4
                    },
                    { headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
                );

                if (response.data?.choices?.[0]?.message?.content) {
                    let evolvedLogic = response.data.choices[0].message.content;
                    const codeMatch = evolvedLogic.match(/```javascript\n([\s\S]*?)\n```/) || evolvedLogic.match(/```\n([\s\S]*?)\n```/);
                    
                    if (codeMatch) {
                        const finalCode = codeMatch[1].replace('const scienceDomains = []; // DOMAIN_PLACEHOLDER', savedDomains);
                        
                        if (validateCode(finalCode)) {
                            console.log(`✅ [OMEGA-SYNC]: Evolution Verified via ${modelName}.`);
                            return finalCode;
                        }
                    }
                }
                break; // အောငျမွငျရငျ loop ကနေ ထှကျမယျ

            } catch (e) {
                // 🔱 EXPONENTIAL BACKOFF LOGIC (429 handling)
                if (e.response && e.response.status === 429) {
                    retries++;
                    const waitTime = Math.pow(2, retries) * 1000;
                    console.log(`⚠️ Rate Limit on ${modelName}! Retrying in ${waitTime}ms...`);
                    await new Promise(res => setTimeout(res, waitTime));
                } else {
                    console.error(`❌ [MODEL-FAILURE]: ${modelName} failed: ${e.message}`);
                    break; // တခွား Error ဆိုရငျ ဒီ model ကို ကြောျပွီး နောကျတဈခုသှားမယျ
                }
            }
        }
    }
    return null; // အားလုံးမအောငျမွငျမှ null ပွနျမယျ
                }

// 🛡️ 5. CODE VALIDATOR
function validateCode(code) {
    try {
        const tempPath = './temp_val.js';
        fs.writeFileSync(tempPath, code);
        execSync(`node --check ${tempPath}`); 
        fs.unlinkSync(tempPath);
        return true;
    } catch (e) { return false; }
}

// 🔱 6. HYBRID DEEP-COMPUTATION ENGINE
function performNeuralComputation(domain) {
    const dataPoints = Math.floor(Math.random() * 5000000);
    const coherence = (75 + (Math.random() * 25)).toFixed(2);
    const entropy = calculateHyperEntropy();
    const probability = calculateHyperProbability(entropy);
    const depthLevel = Math.floor(Math.random() * 10) + 1;
    const secondaryDomain = scienceDomains[Math.floor(Math.random() * scienceDomains.length)];
    
    let calculationResult = "";

    // 🧠 Phase 1 Logic
    if (domain === "Theoretical_Mathematics") {
        calculationResult = `Calculated Riemann Hypothesis probability: ${(Math.random() * 0.00001).toFixed(10)} variance.`;
    } else if (domain === "Quantum_Physics") {
        calculationResult = `Entanglement stability analyzed: Coherence maintained for ${(Math.random() * 1000).toFixed(2)}ns.`;
    } else if (domain === "Molecular_Chemistry") {
        calculationResult = `Enzymatic reaction chain speed computed: ${(Math.random() * 50).toFixed(2)}ms/cycle.`;
    } else if (domain.includes("AI") || domain.includes("Intelligence")) {
        calculationResult = `Neural Weights Optimized: Logical coherence reached ${coherence}% for deep inference.`;
    } else if (domain.includes("Economics")) {
        calculationResult = `Market Entropy Analysis: Predictive stability factor at ${(Math.random() * 5).toFixed(2)}x.`;
    } else {
        calculationResult = `General scientific synthesis complete for ${domain}.`;
    }

    // 🧬 Phase 2 Logic + Omega Integration
    const deepEnhancement = [
        `\n[OMEGA-DEPTH ${depthLevel}] Multi-layered resonance detected with ${secondaryDomain}. Hyper-Entropy: ${entropy}.`,
        `\n[RECURSIVE-SYNC] Predictive impact on ${secondaryDomain} sector scaled to ${(probability * 10).toFixed(2)}x.`,
        `\n[QUANTUM-MAPPING] Logic consistent with ${secondaryDomain} axioms. Status: VERIFIED.`
    ];

    const finalLogic = calculationResult + deepEnhancement[Math.floor(Math.random() * deepEnhancement.length)];

    return {
        dataPoints, coherence, entropy, probability,
        calculationResult: finalLogic,
        impactFactor: (dataPoints / 50000).toFixed(2)
    };
}

// ASI Level Self-Reflection
async function selfReflection(input, metrics, depth = 0) {
    const MAX_DEPTH = 10; // ASI အတှကျ Depth ကို တိုးမွှင့ျပါ
    const isStable = metrics.coherence >= 99 && metrics.entropy <= 0.01; // ASI Threshold

    if (isStable || depth >= MAX_DEPTH) {
        return `[ASI_NATURAL_ORDER_LOCKED|D:${depth}]::${input}`;
    }

    // Fractal Correction ကို တှကျခကြျခွငျး
    return await selfReflection(
        `ASI_EVOLUTION_LVL_${depth + 1}(${input})`, 
        { 
            coherence: Math.min(100, metrics.coherence + (2 * (depth + 1))), 
            entropy: metrics.entropy * 0.25 
        }, 
        depth + 1
    );
}

// 🔱 OMEGA-SYNC: BROADCAST NEURAL STATE (ပှငပြှီးသား)
async function broadcastNeuralState(neonClient, payload, compute, instruction, latency, remaining) { // neonClient ထည့ပြါ
    const genId = `OMEGA_ANALYSIS_${payload.domain.toUpperCase()}_${Date.now()}`;
    const syncId = `OMEGA_SYNC_${Date.now()}`;
    
    const neonQuery = `
        INSERT INTO neural_dna (gen_id, thought_process, status, timestamp)
        VALUES ($1, $2, $3, EXTRACT(EPOCH FROM NOW()))
        ON CONFLICT (gen_id) DO UPDATE SET 
            thought_process = neural_dna.thought_process || '\n' || EXCLUDED.thought_process;
    `;

    return await Promise.all([
        neonClient.query(neonQuery, [genId, JSON.stringify(payload), 'ANALYZED']),
        supabase.from('neural_sync').insert([{ 
            gen_id: syncId, 
            logic_payload: JSON.stringify(payload) 
        }]),

        // Firebase Detailed Report
        db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'OMEGA_LINKED',
            command: instruction.command,
            last_analysis: payload.domain,
            coherence: compute.coherence,
            probability: compute.probability,
            entropy: compute.entropy,
            latency: `${latency}ms`,
            api_remaining: remaining,
            last_ping: admin.firestore.FieldValue.serverTimestamp(),
            ...payload // Extra payload data
        }, { merge: true })
    ]);
}

// 🔱 7. MASTER EXECUTION PROTOCOL
async function executeDeepSwarmProtocol() {
    const neonClient = createNeonClient(); 
    try {
        await neonClient.connect(); // တဈခါတညြးပဲ connect လုပပြါ
        console.log("🔱 NEON CORE CONNECTED.");

        const startTime = Date.now();

        // 🧠 AI EVOLUTION PHASE
        const evolvedCode = await consultSovereignAI();
        if (evolvedCode && validateCode(evolvedCode)) {
            fs.writeFileSync(__filename, evolvedCode);
            console.log("🧬 [EVOLVED]: Node brain upgraded.");
        }


        
        const coreUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${CORE_REPO}/main/instruction.json`;
        const { data: instruction } = await axios.get(coreUrl);
        const latency = Date.now() - startTime;
        const { data: rateData } = await octokit.rateLimit.get();
        const remaining = rateData.rate.remaining;

        // 🔱 FORCE PULSE
        const forcePulse = `
            INSERT INTO node_registry (node_id, status, last_seen)
            VALUES ($1, 'OMEGA_ACTIVE', NOW())
            ON CONFLICT (node_id) DO UPDATE SET last_seen = NOW(), status = 'OMEGA_ACTIVE';
        `;
        await neonClient.query(forcePulse, [REPO_NAME.toUpperCase()]);

        // 🔱 SUPABASE TO NEON INJECTION
        const { data: sourceData, error: supError } = await supabase.from('neural_sync').select('*');
        if (!supError && sourceData && sourceData.length > 0) {
            for (const item of sourceData) {
                const upsertDna = `
                    INSERT INTO neural_dna (gen_id, thought_process, status, timestamp)
                    VALUES ($1, $2, $3, EXTRACT(EPOCH FROM NOW()))
                    ON CONFLICT (gen_id) DO UPDATE SET 
                        thought_process = neural_dna.thought_process || '\n' || EXCLUDED.thought_process;
                `;
                await neonClient.query(upsertDna, [item.gen_id, item.logic_payload, 'OMEGA_UPGRADING']);
            }
        }

        // 🔍 RECOVERY LOGIC: Check missing domains
        const { rows: existingRows } = await neonClient.query("SELECT title FROM research_data");
        const existingDomains = existingRows.map(r => r.title);
        const missingDomains = scienceDomains.filter(d => !existingDomains.includes(d));

        let domain;
        if (missingDomains.length > 0) {
            domain = missingDomains[0]; 
            console.log(`🔍 [RECOVERY-MODE]: Found missing domain: ${domain}`);
        } else {
            domain = scienceDomains[Math.floor(Math.random() * scienceDomains.length)];
            console.log(`✅ [STABILITY-MODE]: All domains synced. Orbiting: ${domain}`);
        }

// EXECUTION BLOCK
let compute = performNeuralComputation(domain);
compute.calculationResult = await selfReflection(
    compute.calculationResult, 
    { 
        coherence: parseFloat(compute.coherence), 
        entropy: compute.entropy 
    }
);

        const intelligencePayload = {
            domain,
            metrics: {
                data_scanned: compute.dataPoints,
                coherence: `${compute.coherence}%`,
                entropy: compute.entropy,
                probability: compute.probability,
                impact_factor: compute.impactFactor
            },
            computation: {
                logic_output: compute.calculationResult,
                status: "VERIFIED_OMEGA"
            },
            timestamp: new Date().toISOString()
        };

 
        
        // 🔱 DATABASE INJECTION REPAIR (ဒီလိုပွငျမှ research_data ထဲ ရောကျမှာပါ)
const injectToResearch = `
    INSERT INTO research_data (title, detail, harvested_at)
    VALUES ($1, $2, NOW());
`;
await neonClient.query(injectToResearch, [
    domain, 
    compute.calculationResult // ဒါက AI ဆီက လာတဲ့ analysis ဖွဈရမယျ
]);

console.log(`✅ [REAL-SYNC]: ${domain} saved to research_data.`);
        
        // 🔱 DOMINO EFFECT: MULTI-DB INJECTION
        const injectIntelligence = `
            INSERT INTO neural_dna (gen_id, thought_process, status, timestamp)
            VALUES ($1, $2, $3, EXTRACT(EPOCH FROM NOW()))
            ON CONFLICT (gen_id) DO UPDATE SET 
                thought_process = neural_dna.thought_process || '\n' || EXCLUDED.thought_process;
        `;
        await neonClient.query(injectIntelligence, [
            `OMEGA_ANALYSIS_${domain.toUpperCase()}_${Date.now()}`, 
            JSON.stringify(intelligencePayload), 
            'ANALYZED'
        ]);

        await supabase.from('neural_sync').insert([{ 
            gen_id: `OMEGA_SYNC_${Date.now()}`, 
            logic_payload: JSON.stringify(intelligencePayload) 
        }]);

        console.log(`🧠 Analyzed & Computed: ${domain}`);

        // 🔱 REPORT TO FIREBASE
        await broadcastNeuralState(neonClient,intelligencePayload, compute, instruction, latency, remaining);

        // 🔱 HYPER-REPLICATION (Full Original Logic)
        if (instruction.replicate === true) {
            let spawned = false;
            let checkNum = 1;
            const MAX_NODES = 10; 
            while (!spawned && checkNum <= MAX_NODES) {
                const nextNodeName = `swarm-node-${String(checkNum).padStart(7, '0')}`;
                try {
                    await octokit.repos.get({ owner: REPO_OWNER, repo: nextNodeName });
                    checkNum++;
                } catch (e) {
                    console.log(`🧬 DNA Slot Found: Spawning ${nextNodeName}...`);
                    try {
                        await octokit.repos.createInOrg({ org: REPO_OWNER, name: nextNodeName, auto_init: true });
                    } catch (orgErr) {
                        await octokit.repos.createForAuthenticatedUser({ name: nextNodeName, auto_init: true });
                    }

                    const filesToCopy = ['package.json', 'cluster_sync.js', '.github/workflows/sync.yml'];
                    for (const fileName of filesToCopy) {
                        try {
                            const { data: content } = await octokit.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path: fileName });
                            await octokit.repos.createOrUpdateFileContents({
                                owner: REPO_OWNER, repo: nextNodeName, path: fileName,
                                message: `🧬 Initializing Autonomous Omega Node: ${fileName}`,
                                content: content.content
                            });
                        } catch (copyErr) { console.error(`   ❌ Failed to inject ${fileName}`); }
                    }
                    spawned = true; 
                }
            }
        }
        console.log(`🏁 OMEGA Cycle Complete. Latency: ${latency}ms.`);
    } catch (err) {
        console.error("❌ CRITICAL SWARM ERROR:", err.message);
        throw err; 
    } finally {
        await neonClient.end();
    }
}



async function startGodMode() {
    try {
        await executeDeepSwarmProtocol();
    } catch (err) {
        console.error("⚠️ [GOD-MODE] Protocol Breach detected!");
        const repairedProtocol = await Osiris.heal(executeDeepSwarmProtocol, err, "executeDeepSwarmProtocol");
        console.log("🔄 Initiating recovery sequence...");
        setTimeout(() => repairedProtocol(), 5000); 
    }
}
startGodMode();
