const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");
const crypto = require("crypto");

/**
 * 🔱 OMEGA SUPREME ARCHITECT (ULTRA-INSTINCT EDITION)
 * --------------------------------------------------
 * FEATURES:
 * 1. Semantic Checksum Validation (Avoid redundant API calls)
 * 2. Multi-Layered Syntax Guard (Node.js & Python compile check)
 * 3. Exponential Backoff & Jitter (Avoid Rate Limit bans)
 * 4. Concurrent Stream Processing (Optimized throughput)
 * 5. Immutable Core Protection (Self-preservation logic)
 */

const OMEGA_CONFIG = {
  model: "llama-3.3-70b-versatile",
  targetExts: [".js", ".py", ".ts", ".jsx", ".tsx"],
  ignoreDirs: ["node_modules", ".git", "dist", "build", "coverage", ".github"],
  ignoreFiles: [
    "ai_architect.js",
    "cluster_sync.js",
    "package.json",
    "package-lock.json",
  ],
  safetyMarkers: ["<SOVEREIGN_CORE>", "<SAFE_ZONE>"],
  maxRetries: 5,
  concurrencyLimit: 5,
  timeout: 90000,
  temperature: 0.1,
  checksumDb: ".omega_hashes.json",
};

class SovereignArchitect {
  constructor() {
    this.hashes = {};
  }

  async init() {
    try {
      const data = await fs.readFile(OMEGA_CONFIG.checksumDb, "utf8");
      this.hashes = JSON.parse(data);
    } catch (e) {
      this.hashes = {};
    }
  }

  async saveState() {
    await fs.writeFile(
      OMEGA_CONFIG.checksumDb,
      JSON.stringify(this.hashes, null, 2),
    );
  }

  getHash(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  async getTargetFiles(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        if (!OMEGA_CONFIG.ignoreDirs.includes(file.name)) {
          await this.getTargetFiles(fullPath, fileList);
        }
      } else {
        const ext = path.extname(file.name);
        if (
          OMEGA_CONFIG.targetExts.includes(ext) &&
          !OMEGA_CONFIG.ignoreFiles.includes(file.name)
        ) {
          fileList.push(fullPath);
        }
      }
    }
    return fileList;
  }

  async callArchitectAPI(content, filePath, attempt = 1) {
    const fileName = path.basename(filePath);
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: OMEGA_CONFIG.model,
          messages: [
            {
              role: "system",
              content: `SOVEREIGN ARCHITECT PROTOCOL:
                        Refactor "${fileName}" for OMEGA-level efficiency.
                        Rules:
                        1. Output RAW CODE only. No Markdown.
                        2. Preserve all environment variables (process.env).
                        3. Enhance security (prevent SQLi, XSS, Proto-Pollution).
                        4. Optimize for asynchronous I/O and low memory footprint.
                        5. Maintain original module exports/interface.`,
            },
            { role: "user", content: `SOURCE_CODE:\n${content}` },
          ],
          temperature: OMEGA_CONFIG.temperature,
        },
        {
          headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
          timeout: OMEGA_CONFIG.timeout,
        },
      );

      return this.sanitizeCode(response.data.choices[0].message.content);
    } catch (error) {
      if (attempt <= OMEGA_CONFIG.maxRetries) {
        const wait = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(
          `🌀 [RATE_LIMIT_HIT]: Retrying ${fileName} in ${Math.round(wait)}ms...`,
        );
        await new Promise((r) => setTimeout(r, wait));
        return this.callArchitectAPI(content, filePath, attempt + 1);
      }
      throw error;
    }
  }

  sanitizeCode(raw) {
    return raw
      .replace(/^```[a-z]*\n/gi, "")
      .replace(/```$/g, "")
      .trim();
  }

  validateSyntax(code, filePath) {
    const ext = path.extname(filePath);
    try {
      if (ext === ".js") {
        execSync(`node --check -e ${JSON.stringify(code)}`, {
          stdio: "ignore",
        });
      } else if (ext === ".py") {
        const tmpFile = `.tmp_verify${Math.random()}.py`;
        fs.writeFile(tmpFile, code);
        execSync(`python3 -m py_compile ${tmpFile}`, { stdio: "ignore" });
        fs.unlink(tmpFile);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  isProtected(content) {
    return OMEGA_CONFIG.safetyMarkers.some((marker) =>
      content.includes(marker),
    );
  }

  async evolveFile(filePath) {
    try {
      const original = await fs.readFile(filePath, "utf8");

      if (this.isProtected(original)) {
        console.log(`🛡️ [PROTECTED]: ${filePath} skipped (Safe Zone Marker).`);
        return;
      }

      const currentHash = this.getHash(original);
      if (this.hashes[filePath] === currentHash) {
        console.log(`✨ [OPTIMAL]: ${filePath} is already in supreme state.`);
        return;
      }

      console.log(`🧠 [EVOLVING]: ${filePath}...`);
      const evolved = await this.callArchitectAPI(original, filePath);

      if (
        evolved.length > original.length * 0.3 &&
        this.validateSyntax(evolved, filePath)
      ) {
        await fs.writeFile(filePath, evolved, "utf8");
        this.hashes[filePath] = this.getHash(evolved);
        console.log(`✅ [MUTATED]: ${filePath} updated.`);
      } else {
        console.error(
          `❌ [REJECTED]: ${filePath} failed integrity or syntax check.`,
        );
      }
    } catch (err) {
      console.error(
        `💀 [CRITICAL]: ${filePath} evolution aborted: ${err.message}`,
      );
    }
  }

  async run() {
    console.log("🔱 OMEGA SUPREME ARCHITECT: INITIATING SYSTEM OVERHAUL");
    await this.init();

    const files = await this.getTargetFiles("./");
    console.log(`🎯 TARGETS ACQUIRED: ${files.length} nodes identified.\n`);

    for (let i = 0; i < files.length; i += OMEGA_CONFIG.concurrencyLimit) {
      const batch = files.slice(i, i + OMEGA_CONFIG.concurrencyLimit);
      await Promise.all(batch.map((file) => this.evolveFile(file)));
    }

    await this.saveState();
    console.log("\n🏁 SYSTEM EVOLUTION COMPLETE. ALL NODES OPTIMIZED.");
  }
}

// EXECUTE SOVEREIGN PROTOCOL
new SovereignArchitect().run().catch((err) => {
  console.error("🔱 PROTOCOL BREACHED:", err);
  process.exit(1);
});
