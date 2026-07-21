// Regenerate the v2 visual snapshots in ../v2-snapshots/.
//
// The committed PNGs in v2-snapshots/ are the canonical reference — you only need
// this script to refresh them after intentional v2 changes.
//
// Prerequisites (one-time):
//   1) Dev server running on PORT (default 3434):   PORT=3434 npm run dev
//   2) Playwright + a browser:                      npm i -D playwright && npx playwright install chromium
//
// Run:   node scripts/snapshot.mjs           (uses PORT env or 3434)
//
// Portable: no hardcoded machine paths. Output dir resolves relative to this file.

import { fileURLToPath } from "node:url";
import path from "node:path";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("✗ Playwright not installed. Run:\n  npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "v2-snapshots");
const PORT = process.env.PORT || "3434";
const BASE = `http://localhost:${PORT}`;
const SUPPRESS = `try{['vox-tour-dashboard','vox-tour-adv','vox-tour-campaign','vox-tour-leads','vox-tour-settings','vox-tour-calls'].forEach(k=>localStorage.setItem(k,'1'));}catch(e){}`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.addInitScript(SUPPRESS);

async function open(route) {
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 40000 }).catch(() => {});
  await page.waitForTimeout(900);
  await page.evaluate(() => { const x = [...document.querySelectorAll("button")].find((b) => /^skip$/i.test((b.textContent || "").trim())); if (x) x.click(); }).catch(() => {});
  await page.waitForTimeout(400);
  return page;
}
async function shot(page, name) { await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); console.log("  ✓", name); }

// --- simple full-page screens ---
const SIMPLE = [
  ["/dashboard-v2", "01-dashboard"],
  ["/campaigns", "02-campaigns-list"],
  ["/campaigns/quick", "03-campaign-quick"],
  ["/leads", "10-leads"],
  ["/calls", "11-calls"],
  ["/analytics", "12-analytics"],
  ["/handoff", "13-handoff"],
  ["/settings", "14-settings"],
];
for (const [route, name] of SIMPLE) { const p = await open(route); await shot(p, name); await p.close(); }

// --- advanced wizard: one shot per step (scoped to the step rail) ---
const STEPS = [
  ["Basics", "04-advanced-1-basics"],
  ["Lead Schema", "05-advanced-2-schema"],
  ["Customer Data", "06-advanced-3-customer"],
  ["Scoring", "07-advanced-4-scoring"],
  ["Conversation", "08-advanced-5-conversation"],
  ["Phone & Outcomes", "09a-advanced-6-phone"],
  ["Agent Skills", "09b-advanced-7-skills"],
];
{
  const p = await open("/campaigns/advanced");
  for (const [label, name] of STEPS) {
    await p.locator('[data-tour="adv-steps"] button', { hasText: label }).first().click({ timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(500);
    if (label === "Lead Schema") { await p.getByRole("button", { name: /Add your first field|Add field/i }).first().click().catch(() => {}); await p.waitForTimeout(400); }
    await shot(p, name);
  }
  await p.close();
}

await browser.close();
console.log("DONE — snapshots written to v2-snapshots/");
