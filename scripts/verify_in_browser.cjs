const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('Starting Vite preview server on port 4184...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4184', '--strictPort'], {
    cwd: ROOT,
    stdio: 'pipe',
  });

  await sleep(2200);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const failedUrls = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`CONSOLE ERROR: ${msg.text()}`);
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        failedUrls.push(`${res.status()} ${res.url()}`);
      }
    });

    // 1. Desktop Start Screen (1440x900)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4184/', { waitUntil: 'networkidle0' });
    await sleep(1400);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_1_start_screen.png'),
    });
    console.log('Captured verify_1_start_screen.png');

    // 2. Mobile Landscape Start Screen (812x375)
    await page.setViewport({ width: 812, height: 375, deviceScaleFactor: 2 });
    await sleep(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_2_mobile_start.png'),
    });
    console.log('Captured verify_2_mobile_start.png');

    // 3. Switch back to Desktop 1440x900 & start Chapter 1 (Intro Dialog)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await sleep(400);
    await page.click('#start-game-btn');
    await sleep(800);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_3_ch1_dialog.png'),
    });
    console.log('Captured verify_3_ch1_dialog.png');

    // 4. Close intro dialog -> Chapter 1 Overworld + Steinzeit Top-HUD + Hotbar
    await page.keyboard.press('Escape');
    await sleep(900);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_4_ch1_overworld.png'),
    });
    console.log('Captured verify_4_ch1_overworld.png');

    // 5. Walk West toward Weser/Rhein river bridge & German nature
    await page.keyboard.down('ArrowLeft');
    await sleep(750);
    await page.keyboard.up('ArrowLeft');
    await sleep(500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_5_river_and_flora.png'),
    });
    console.log('Captured verify_5_river_and_flora.png');

    // 6. Crafting & Smelting Modal ([C])
    await page.keyboard.press('KeyC');
    await sleep(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_6_crafting_modal.png'),
    });
    console.log('Captured verify_6_crafting_modal.png');
    await page.keyboard.press('Escape');
    await sleep(400);

    // 7. Progressive 2-Column Lexicon Modal ([L] - 27 entries)
    await page.keyboard.press('KeyL');
    await sleep(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_7_lexicon_modal.png'),
    });
    console.log('Captured verify_7_lexicon_modal.png');
    await page.keyboard.press('Escape');
    await sleep(400);

    // 8. Interactive Didactic Station (Ackerbau & Dreifelderwirtschaft)
    await page.evaluate(() => {
      if (typeof window.__openStation === 'function') {
        window.__openStation('station_ackerbau');
      }
    });
    await sleep(650);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_8_interactive_station.png'),
    });
    console.log('Captured verify_8_interactive_station.png');
    await page.evaluate(() => {
      const el = document.getElementById('station-modal');
      if (el) el.remove();
    });
    await sleep(400);

    // 9. 360° Artifact Inspector Modal (Pflugschar)
    await page.evaluate(() => {
      if (typeof window.__openArtifactInspector === 'function') {
        window.__openArtifactInspector('relic_pflugschar');
      }
    });
    await sleep(650);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_9_artifact_inspector.png'),
    });
    console.log('Captured verify_9_artifact_inspector.png');
    await page.evaluate(() => {
      const el = document.getElementById('artifact-inspector-modal');
      if (el) el.remove();
    });
    await sleep(400);

    // 10. 7-Tile Pause Dashboard ([P])
    await page.keyboard.press('KeyP');
    await sleep(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_10_pause_dashboard.png'),
    });
    console.log('Captured verify_10_pause_dashboard.png');
    await page.keyboard.press('Escape');
    await sleep(400);

    // 11. Walkable German Interior Scene (Langhaus der Sippe)
    await page.evaluate(() => {
      if (typeof window.__enterSampleInterior === 'function') {
        window.__enterSampleInterior();
      }
    });
    await sleep(900);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_11_interior_scene.png'),
    });
    console.log('Captured verify_11_interior_scene.png');

    console.log('Errors:', errors.length);
    if (errors.length > 0) console.error(errors);
    console.log('Failed URLs:', failedUrls.length);
    if (failedUrls.length > 0) console.error(failedUrls);

    if (errors.length > 0 || failedUrls.length > 0) {
      process.exitCode = 1;
    } else {
      console.log('🏆 ALL 11 BROWSER VERIFICATION SCREENSHOTS CAPTURED WITH 0 ERRORS!');
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

main();
