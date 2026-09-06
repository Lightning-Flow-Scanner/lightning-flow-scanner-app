#!/usr/bin/env node
/**
 * Renders the clean-scan celebration to a PNG, for docs and release posts.
 *
 * The animation is not re-implemented here: the real c/lfsConfetti source is
 * read, stripped of its LWC wrapper and run against a plain canvas, so what the
 * image shows is the code that ships. Only the surrounding markup is a stand-in
 * for the Lightning page.
 *
 *   node scripts/confetti-preview.mjs [--out media/clean-scan.png] [--at 700]
 *
 * --at is the millisecond mark of the burst to capture. Frames are stepped by
 * hand rather than left to requestAnimationFrame, so the same run gives the
 * same image every time.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lwcDir = path.join(repoRoot, "force-app/main/default/lwc");

const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i === -1 ? fallback : args[i + 1];
};
const outPath = path.resolve(repoRoot, argValue("--out", "media/clean-scan-celebration.png"));
const captureAt = Number(argValue("--at", "1100"));
// Sized to the panel, so the PNG is the celebration and not a field of white.
const windowSize = argValue("--size", "1200,400");

// Chromium comes from the Playwright cache; nothing here needs Playwright itself.
function findChrome() {
    const explicit = process.env.CHROME_PATH;
    if (explicit && existsSync(explicit)) return explicit;
    const cache = path.join(process.env.HOME || "", ".cache/ms-playwright");
    if (!existsSync(cache)) return null;
    for (const dir of readdirSync(cache).filter((d) => d.startsWith("chromium-"))) {
        const candidate = path.join(cache, dir, "chrome-linux64/chrome");
        if (existsSync(candidate)) return candidate;
        const legacy = path.join(cache, dir, "chrome-linux/chrome");
        if (existsSync(legacy)) return legacy;
    }
    return null;
}

// The component is an LWC class; the browser here has no LWC runtime, so the
// decorators and the module wrapper come off and `template` is handed in.
function componentAsPlainClass() {
    const src = readFileSync(path.join(lwcDir, "lfsConfetti/lfsConfetti.js"), "utf8");
    return src
        .replace(/^import[^\n]*\n/gm, "")
        .replace(/^\s*@api\s*$/gm, "")
        .replace(/export default class LfsConfetti extends LightningElement/, "class LfsConfetti");
}

const componentCss = readFileSync(path.join(lwcDir, "lightningFlowScanner/lightningFlowScanner.css"), "utf8");
const confettiCss = readFileSync(path.join(lwcDir, "lfsConfetti/lfsConfetti.css"), "utf8")
    .replace(/:host/g, ".confetti-host");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #f3f3f3; font-family: "Salesforce Sans", Arial, sans-serif; padding: 16px; }
  .page { margin: 0 auto; }
  .slds-grid { display: flex; }
  .slds-grid_vertical-align-center { align-items: center; }
  .table-card { min-height: 300px; }
  .toolbar-search {
    background: #fff; border: 1px solid #00205b; border-radius: 0.25rem;
    color: #7c8ba5; font-size: 0.8rem; padding: 0.25rem 0.5rem; min-width: 140px;
  }
  .toolbar-export {
    background: #0176d3; border: 1px solid #0176d3; border-radius: 0.25rem;
    color: #fff; font-size: 0.8rem; padding: 0.3rem 0.75rem; font-weight: 600;
  }
  h2 { font-size: 0.95rem; font-weight: 600; }
${componentCss}
${confettiCss}
</style>
</head>
<body>
<div class="page">
  <div class="all-mode-container">
    <div class="confetti-host"><canvas class="confetti-canvas"></canvas></div>
    <div class="slds-grid slds-grid_vertical-align-center toolbar-row">
      <div class="toolbar-title"><h2>All Results</h2></div>
      <div class="toolbar-item"><div class="toolbar-search">Flow Name</div></div>
      <div class="toolbar-item"><div class="toolbar-search">Search All Fields</div></div>
      <div class="toolbar-item"><span class="toolbar-stats"><strong>Violations: 0 / 0</strong></span></div>
      <div class="toolbar-item"><button class="toolbar-export">Export CSV</button></div>
    </div>
    <div class="table-card">
      <div class="clean-result">
        <svg width="48" height="48" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="26" fill="#2e844a"/>
          <path d="M20.6 35.4 12 26.8l3.4-3.4 5.2 5.2 15-15 3.4 3.4z" fill="#fff"/>
        </svg>
        <h3 class="clean-result-title">All clear!</h3>
        <p class="clean-result-subtitle">No violations found across 34 flows.</p>
        <p class="clean-result-meta">30 rules run &middot; 0 violations</p>
      </div>
    </div>
  </div>
</div>
<script>
${componentAsPlainClass()}
// Headless Chromium hands out only a handful of animation frames, so the burst
// is stepped by hand at a fixed 16ms: same physics, but the captured frame is
// exactly CAPTURE_AT into the animation on every run.
const CAPTURE_AT = ${captureAt};
let pending = null;
window.requestAnimationFrame = (cb) => { pending = cb; return 1; };
window.cancelAnimationFrame = () => { pending = null; };

const host = document.querySelector('.confetti-host');
const confetti = new LfsConfetti();
confetti.template = host;
confetti.burst();

let t = 0;
while (pending && t < CAPTURE_AT) {
  const cb = pending;
  pending = null;
  t += 16;
  cb(t);
}
</script>
</body>
</html>`;

const chrome = findChrome();
if (!chrome) {
    console.error("No Chromium found. Set CHROME_PATH to a Chrome/Chromium binary.");
    process.exit(1);
}

const workDir = mkdtempSync(path.join(tmpdir(), "lfs-confetti-"));
const pagePath = path.join(workDir, "preview.html");
writeFileSync(pagePath, html);

// Virtual time makes the capture reproducible: the page's clock is advanced to
// captureAt and the screenshot is taken there, rather than racing a real timer.
execFileSync(
    chrome,
    [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--hide-scrollbars",
        `--window-size=${windowSize}`,
        "--virtual-time-budget=1500",
        `--screenshot=${outPath}`,
        `file://${pagePath}`
    ],
    { stdio: "inherit" }
);

console.log(`Wrote ${outPath} (burst captured at ${captureAt}ms)`);
