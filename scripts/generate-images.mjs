// Regenerates the OGP image and touch icons from public/logo_original.png.
//   npm run images
// Text is rendered with locally installed fonts (Yu Mincho / Yu Gothic on Windows,
// Hiragino on macOS), so run it on a desktop machine and commit the resulting PNG/JPEG.
import sharp from 'sharp';
import { ui } from '../src/i18n.ts';

const bg = '#141821'; // the logo's white lettering is drawn for this background
const logo = 'public/logo_original.png';
const serif = "'Yu Mincho', 'Hiragino Mincho ProN', serif";
const sans = "'Yu Gothic', 'Hiragino Sans', sans-serif";

// OGP 1200x630: logo on a dark band, names and tagline below on white.
const band = 270;
const logoW = 1000;
const logoH = Math.round((162 / 990) * logoW);
const logoBuf = await sharp(logo).resize({ width: logoW }).toBuffer();
const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="${band}" fill="${bg}"/>
  <text x="100" y="355" font-family="${serif}" font-size="44" font-weight="700" fill="#1b1f27">${ui.ja.orgName}</text>
  <text x="100" y="420" font-family="${serif}" font-size="38" font-weight="700" fill="#1b1f27">${ui.en.orgName} (KMA)</text>
  <text x="100" y="500" font-family="${sans}" font-size="27" fill="#596070">An independent, not-for-profit research institute in Kyoto, Japan</text>
  <text x="100" y="545" font-family="${sans}" font-size="27" fill="#596070">Open-access research on markets, consumers, and public policy</text>
</svg>`);
const og = sharp(text).composite([{ input: logoBuf, left: 100, top: Math.round((band - logoH) / 2) }]);
await og.clone().png().toFile('public/og.png');
// banner.jpg was the old site's OGP image path; keep serving the same picture there.
await og.clone().jpeg({ quality: 88 }).toFile('public/banner.jpg');

// Touch icons: the bar-chart-and-arrow mark (left part of the logo) on the dark background.
// Lettering starts at x>=192, y>=77, so clear the area right of the arrow shaft below y=60.
const W = 196;
const H = 162;
const { data, info } = await sharp(logo)
  .extract({ left: 0, top: 0, width: W, height: H })
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let y = 60; y < H; y++) for (let x = 186; x < W; x++) data[(y * W + x) * 4 + 3] = 0;
const mark = await sharp(data, { raw: info }).trim().png().toBuffer();
for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['apple-touch-icon-precomposed.png', 180],
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
]) {
  const inner = Math.round(size * 0.7);
  const m = await sharp(mark)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: m, gravity: 'center' }])
    .png()
    .toFile(`public/${name}`);
}
console.log('generated og.png, banner.jpg and touch icons');
