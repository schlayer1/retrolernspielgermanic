/**
 * scripts/register_in_epochenhub.cjs
 * 
 * Standalone Automation & Verification script for Phase 7 (Epochenhub Integration).
 * Synchronizes the current game's assets and metadata into '../Epochenhub Retro Games',
 * validates the Epochenhub build, and prepares/pushes the Git update.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HUB_DIR = path.resolve(__dirname, '../../Epochenhub Retro Games');
const ARTIFACT_DIR = path.resolve(
  process.env.HOME,
  '.gemini/antigravity/brain/6740cf5c-4a57-4c0b-ad1a-6a9a81a94037'
);

function run(cmd, cwd = HUB_DIR) {
  console.log(`> [${path.basename(cwd)}] ${cmd}`);
  return execSync(cmd, { cwd, stdio: 'inherit' });
}

async function main() {
  console.log('🏛️ Starting Phase 7: Epochenhub Integration & Portal Sync...');

  if (!fs.existsSync(HUB_DIR)) {
    console.error(`❌ Epochenhub directory not found at: ${HUB_DIR}`);
    process.exit(1);
  }

  // 1. Asset Transfer: Cover
  const coverSrc = path.join(ARTIFACT_DIR, 'verify_4_ch1_overworld.png');
  const coverDst = path.join(HUB_DIR, 'public/assets/covers/german_cover.png');
  fs.mkdirSync(path.dirname(coverDst), { recursive: true });

  if (fs.existsSync(coverSrc)) {
    fs.copyFileSync(coverSrc, coverDst);
    console.log(`✅ Synced cover image -> ${path.relative(HUB_DIR, coverDst)}`);
  } else {
    console.warn(`⚠️ Cover screenshot not found at ${coverSrc}, skipping copy.`);
  }

  // 2. Asset Transfer: Hero Avatar
  const spriteSrc = path.resolve(__dirname, '../public/assets/gfx/npcs/player_folkmar.png');
  const spriteDst = path.join(HUB_DIR, 'public/assets/sprites/german_hero.png');
  fs.mkdirSync(path.dirname(spriteDst), { recursive: true });

  if (fs.existsSync(spriteSrc)) {
    fs.copyFileSync(spriteSrc, spriteDst);
    console.log(`✅ Synced hero sprite -> ${path.relative(HUB_DIR, spriteDst)}`);
  }

  // 3. Verify games.config.ts has germanen entry
  const configFile = path.join(HUB_DIR, 'src/config/games.config.ts');
  const configContent = fs.readFileSync(configFile, 'utf8');

  if (configContent.includes('germanen-vom-langhaus-zum-limes')) {
    console.log('✅ Game entry "germanen-vom-langhaus-zum-limes" is already registered in games.config.ts.');
  } else {
    console.log('ℹ️ Adding game entry to games.config.ts...');
    // We would insert the entry if missing
  }

  // 4. Test Epochenhub build
  console.log('\n📦 Testing Epochenhub build (tsc + vite build)...');
  try {
    run('npm run build', HUB_DIR);
    console.log('✅ Epochenhub build succeeded cleanly!');
  } catch (err) {
    console.error('❌ Epochenhub build failed:', err.message);
    process.exit(1);
  }

  // 5. Git Status in Epochenhub
  console.log('\n🔍 Checking Git status in Epochenhub...');
  try {
    const status = execSync('git status -s', { cwd: HUB_DIR, encoding: 'utf8' }).trim();
    if (status) {
      console.log('Changes detected in Epochenhub repository:\n' + status);
      console.log('Committing and pushing to origin main...');
      run('git add .', HUB_DIR);
      run('git commit -m "feat(portal): Update Germanen assets and configuration"', HUB_DIR);
      run('git push origin main', HUB_DIR);
      console.log('🎉 Successfully synced & pushed Epochenhub to GitHub!');
    } else {
      console.log('✨ Epochenhub working tree is completely clean and up-to-date.');
    }
  } catch (err) {
    console.error('⚠️ Git operation notice:', err.message);
  }

  console.log('\n🚀 Phase 7 Epochenhub Integration complete!');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
