const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Create an HTML page that displays each tile-B sheet with a 48x48 grid overlay
  const dirs = [
    { name: 'Nomad Camp', dir: 'Assets/extracted/Nomad Camp' },
    { name: 'Celtic Druid Village', dir: 'Assets/extracted/Celtic Druid Village' },
    { name: 'Werewolf Village', dir: 'Assets/extracted/Werewolf Village' },
  ];

  let html = `<!DOCTYPE html><html><head><style>
    body { background: #1a1a24; color: #eee; font-family: sans-serif; padding: 20px; }
    h2 { color: #f59e0b; }
    .sheet-box { position: relative; display: inline-block; margin: 15px; background: #262636; border: 2px solid #555; }
    .overlay-grid { position: absolute; top: 0; left: 0; width: 768px; height: 768px; pointer-events: none; }
    svg line { stroke: rgba(255, 255, 255, 0.25); stroke-width: 1; }
    svg text { fill: #facc15; font-size: 10px; font-weight: bold; }
  </style></head><body><h1>Asset Sheets Inspection</h1>`;

  for (const group of dirs) {
    html += `<h2>${group.name}</h2><div style="display: flex; flex-wrap: wrap;">`;
    const files = fs.readdirSync(group.dir).filter(f => f.startsWith('tile-B') && f.endsWith('.png'));
    for (const f of files) {
      const fullPath = path.join(group.dir, f);
      const b64 = fs.readFileSync(fullPath).toString('base64');
      html += `<div class="sheet-box">
        <div style="padding: 4px; background: #333; font-weight: bold;">${f} (${group.name})</div>
        <div style="position: relative; width: 768px; height: 768px;">
          <img src="data:image/png;base64,${b64}" width="768" height="768" style="image-rendering: pixelated; display: block;" />
          <svg class="overlay-grid" viewBox="0 0 768 768">`;
      // Draw 16x16 grid (each cell is 48x48)
      for (let x = 0; x <= 16; x++) {
        html += `<line x1="${x * 48}" y1="0" x2="${x * 48}" y2="768" />`;
      }
      for (let y = 0; y <= 16; y++) {
        html += `<line x1="0" y1="${y * 48}" x2="768" y2="${y * 48}" />`;
      }
      // Label coordinates every 2 cells
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (x % 2 === 0 && y % 2 === 0) {
            html += `<text x="${x * 48 + 4}" y="${y * 48 + 14}">(${x},${y})</text>`;
          }
        }
      }
      html += `</svg></div></div>`;
    }
    html += `</div>`;
  }
  html += `</body></html>`;

  fs.mkdirSync('scratch', { recursive: true });
  fs.writeFileSync('scratch/sheet_overview.html', html);
  console.log('Written scratch/sheet_overview.html');

  // Let us also inspect what is inside Nomad Camp specifically regarding animals
  // Let us render a screenshot of Nomad Camp tile-B-01 to 05
  await page.setContent(html);
  await page.setViewport({ width: 1700, height: 1200 });

  await browser.close();
  console.log('Inspection HTML ready.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
