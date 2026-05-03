const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");
const { execSync } = require("child_process");

const CONFIG = {
  model: "llama-3.3-70b-versatile",
  exts: [".js", ".py"],
  ignore: [
    "node_modules",
    ".git",
    "run_architect.js",
    "package.json",
    "package-lock.json",
  ],
  db: ".omega_hashes.json",
};

async function getFiles(dir, list = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fp = path.join(dir, file.name);
    if (file.isDirectory() && !CONFIG.ignore.includes(file.name))
      await getFiles(fp, list);
    else if (
      CONFIG.exts.includes(path.extname(file.name)) &&
      !CONFIG.ignore.includes(file.name)
    )
      list.push(fp);
  }
  return list;
}

async function run() {
  let hashes = {};
  try {
    hashes = JSON.parse(await fs.readFile(CONFIG.db, "utf8"));
  } catch (e) {}
  const files = await getFiles("./");

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    if (
      content.includes("<SOVEREIGN_CORE>") ||
      content.includes("DO NOT MINIFY")
    )
      continue;

    const hash = crypto.createHash("sha256").update(content).digest("hex");
    if (hashes[file] === hash) continue;

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: CONFIG.model,
          messages: [
            {
              role: "system",
              content:
                "Refactor code for extreme performance. Output RAW CODE only. Maintain original architecture. Do not minify.",
            },
            { role: "user", content: content },
          ],
          temperature: 0.1,
        },
        {
          headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
          timeout: 60000,
        },
      );

      let evolved = res.data.choices[0].message.content
        .replace(/^```[a-z]*\n/gi, "")
        .replace(/```$/g, "")
        .trim();
      if (evolved.length > content.length * 0.5) {
        try {
          if (file.endsWith(".js"))
            execSync(`node -e ${JSON.stringify(evolved)}`, { stdio: "ignore" });
          await fs.writeFile(file, evolved, "utf8");
          hashes[file] = crypto
            .createHash("sha256")
            .update(evolved)
            .digest("hex");
        } catch (e) {
          console.error(`Syntax Error in ${file}`);
        }
      }
    } catch (e) {
      console.error(`API Error for ${file}`);
    }
  }
  await fs.writeFile(CONFIG.db, JSON.stringify(hashes));
}
run();
