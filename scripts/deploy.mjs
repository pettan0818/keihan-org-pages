// Build, verify and publish dist/ to Cloudflare Pages (Direct Upload), then verify production.
//   npm run deploy
// Refuses to run unless the working tree is a clean `main` that matches origin/main,
// so what is live is always a commit that exists on GitHub.
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const PROJECT = 'keihan-or-jp';
const SITE = 'https://www.keihan.or.jp';

const env = { ...process.env };
// Cloudflare account that holds the keihan.or.jp zone and the Pages project.
env.CLOUDFLARE_ACCOUNT_ID ??= '6bd594a46ebd21fc2ce87924ab107aa3';
// Keep the KMA wrangler login separate from any other Cloudflare login on this machine.
if (!env.XDG_CONFIG_HOME && env.APPDATA) env.XDG_CONFIG_HOME = join(env.APPDATA, 'wrangler-kma');

const run = (cmd) => execSync(cmd, { stdio: 'inherit', env });
const read = (cmd) => execSync(cmd, { env }).toString().trim();
const fail = (msg) => {
  console.error(`deploy: ${msg}`);
  process.exit(1);
};

read('git fetch --quiet origin main');
if (read('git rev-parse --abbrev-ref HEAD') !== 'main') fail('switch to the main branch first.');
if (read('git status --porcelain')) fail('commit or discard local changes first.');
if (read('git rev-parse HEAD') !== read('git rev-parse origin/main')) fail('main must match origin/main (pull or push first).');

run('npm run build');
run('npm run verify');
const sha = read('git rev-parse HEAD');
run(`npx -y wrangler@4 pages deploy dist --project-name ${PROJECT} --branch main --commit-hash ${sha} --commit-dirty=false`);
run(`node scripts/verify.mjs ${SITE}`);
