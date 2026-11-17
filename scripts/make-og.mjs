// Renders scripts/og.html and scripts/icon.html to PNGs in public/ with a
// headless Chromium-family browser. Run: npm run og
// Set CHROME_PATH if your browser is not found automatically.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  // Playwright's cached headless shell, newest first.
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse()) {
      for (const sub of readdirSync(join(cache, dir))) {
        const bin = join(cache, dir, sub, sub.replace(/-mac.*|-linux.*/, ''));
        candidates.push(bin, join(cache, dir, sub, 'headless_shell'), join(cache, dir, sub, 'chrome-headless-shell'));
      }
    }
  }
  return candidates.find((c) => existsSync(c));
}

const browser = findBrowser();
if (!browser) throw new Error('No Chromium-family browser found. Set CHROME_PATH to one.');

function render(source, target, width, height) {
  const out = join(root, 'public', target);
  execFileSync(
    browser,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      '--virtual-time-budget=4000',
      `--window-size=${width},${height}`,
      `--screenshot=${out}`,
      pathToFileURL(join(here, source)).href,
    ],
    { stdio: 'ignore' },
  );
  console.log(`${out} (${statSync(out).size} bytes)`);
}

render('og.html', 'og.png', 1200, 630);
render('icon.html', 'apple-touch-icon.png', 180, 180);
