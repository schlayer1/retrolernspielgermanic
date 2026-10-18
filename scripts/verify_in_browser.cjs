const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/nicolekeller/.gemini/antigravity/brain/6740cf5c-4a57-4c0b-ad1a-6a9a81a94037';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('Starting Vite preview server on port 4185...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4185', '--strictPort'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => console.log(`[Vite] ${d.toString().trim()}`));
  server.stderr.on('data', (d) => console.error(`[Vite Err] ${d.toString().trim()}`));

  await sleep(2500);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const failedUrls = [];

  try {
    const page = await browser.newPage();

    page.on('pageerror', (err) => {
      console.error('PAGE ERROR:', err.message);
      errors.push(`PAGEERROR: ${err.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
        errors.push(`CONSOLE: ${msg.text()}`);
      }
    });

    page.on('response', (res) => {
      if (res.status() >= 400) {
        console.warn(`FAILED RESOURCE [${res.status()}]: ${res.url()}`);
        failedUrls.push(`${res.status()} ${res.url()}`);
      }
    });

    // 1. Desktop Start Screen (1440x900)
    console.log('Navigating to http://localhost:4185/ ...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4185/', { waitUntil: 'networkidle0' });
    await sleep(1500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_1_desktop_start.png'),
    });
    console.log('✅ Captured verify_1_desktop_start.png');

    // 2. Mobile Landscape Start Screen (812x375)
    await page.setViewport({ width: 812, height: 375, deviceScaleFactor: 2 });
    await sleep(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_2_mobile_start.png'),
    });
    console.log('✅ Captured verify_2_mobile_start.png');

    // 3. Switch back to Desktop 1440x900 & Launch Chapter 1
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await sleep(400);

    // Click launch button
    await page.click('#start-game-btn');
    await sleep(1000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_3_ch1_dialog.png'),
    });
    console.log('✅ Captured verify_3_ch1_dialog.png');

    // Advance dialog or close with Escape
    await page.keyboard.press('Escape');
    await sleep(800);

    // 4. Overworld Chapter 1 view with HUD, Longhouse, and Weidevieh
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_4_ch1_overworld.png'),
    });
    console.log('✅ Captured verify_4_ch1_overworld.png');

    // 5. Walk West toward River Bridge & Flora
    await page.keyboard.down('ArrowLeft');
    await sleep(1400);
    await page.keyboard.up('ArrowLeft');
    await sleep(600);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_5_water_and_infrastructure.png'),
    });
    console.log('✅ Captured verify_5_water_and_infrastructure.png');

    // 6. Teleport / Walk to the Sacred Moor & Thingplatz
    await page.evaluate(() => {
      const g = (window).__GERM_GAME__;
      if (g) {
        const world = g.scene.getScene('World');
        if (world && world.player) {
          world.player.setPosition(50 * 16, 56 * 16); // Thingplatz south approach
        }
      }
    });
    await sleep(800);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_6_evolved_location.png'),
    });
    console.log('✅ Captured verify_6_evolved_location.png');

    // 7. Open 7-Kachel Pause Dashboard
    await page.keyboard.press('KeyP');
    await sleep(800);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_7_pause_dashboard.png'),
    });
    console.log('✅ Captured verify_7_pause_dashboard.png');

    console.log('\n--- VERIFICATION REPORT ---');
    console.log(`Page Errors: ${errors.length}`);
    console.log(`Failed Resources: ${failedUrls.length}`);
    if (errors.length > 0) {
      console.error('Errors found:\n' + errors.join('\n'));
    }
    if (failedUrls.length > 0) {
      console.warn('Failed URLs:\n' + failedUrls.join('\n'));
    }
  } finally {
    await browser.close();
    server.kill();
    console.log('Browser closed and Vite server stopped.');
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
