// Vercel build: copies the static app into ./dist and generates dist/config.js from ENVIRONMENT VARIABLES,
// so the Firebase API key is never stored in the Git repository.
const fs = require("fs"), path = require("path");
const key = (process.env.FIREBASE_API_KEY || "").trim();
const url = (process.env.FIREBASE_URL || process.env.FIREBASE_DATABASE_URL || "https://manager-8f0b2-default-rtdb.firebaseio.com").trim().replace(/\/+$/, "");
const sheet = (process.env.SHEET_URL || "").trim();
if (!key && !sheet) {
  console.error("\nBUILD STOPPED: FIREBASE_API_KEY is not set.\nVercel > Project > Settings > Environment Variables > add FIREBASE_API_KEY (and optionally FIREBASE_URL), then Redeploy.\n");
  process.exit(1);
}
if (key && !/^AIza[0-9A-Za-z_\-]{30,}$/.test(key)) { console.error("\nBUILD STOPPED: FIREBASE_API_KEY does not look like a Firebase Web API key (it starts with AIza).\n"); process.exit(1); }
if (key && !/^https:\/\/[a-z0-9-]+(-default-rtdb)?(\.[a-z0-9-]+)?\.(firebaseio\.com|firebasedatabase\.app)$/.test(url)) { console.error("\nBUILD STOPPED: FIREBASE_URL must look like https://YOUR-PROJECT-default-rtdb.firebaseio.com\n"); process.exit(1); }
const out = path.join(__dirname, "dist");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ["index.html", "sw.js", "manifest.webmanifest", "xlsx.full.min.js", "icons", "fonts"]) {
  fs.cpSync(path.join(__dirname, f), path.join(out, f), { recursive: true });
}
const cfg = `// generated at build time from Vercel environment variables\nwindow.FIREBASE_URL=${JSON.stringify(key ? url : "")};\nwindow.FIREBASE_API_KEY=${JSON.stringify(key)};\nwindow.SHEET_URL=${JSON.stringify(key ? "" : sheet)};\n`;
fs.writeFileSync(path.join(out, "config.js"), cfg);
console.log("Built dist/ with " + (key ? "Firebase (" + url + ")" : "Google Sheet backend"));
