// Render warm-blueprint diagrams for any blog assets directory (day + night SVG).
//   <name>.svg       day figure    (preview: %TEMP%/<name>.png)
//   <name>.dark.svg  night figure  (preview: %TEMP%/<name>.dark.png)
// Usage:
//   node scripts/render_named_diagrams.cjs 05-series-1 07-series-2
//   node scripts/render_named_diagrams.cjs --all
//   node scripts/render_named_diagrams.cjs --dir src/tips/assets overview
//
// Default --dir is src/static-analysis/assets. Every diagram must be listed in that
// directory's diagram-manifest.json (name -> type). Colours and fonts live in
// scripts/diagram-style/; .mmd files only carry structure and semantic class names.
// Uses playwright + mermaid from the local npx cache and headless Edge; commit the SVGs.
const fs = require('fs');
const path = require('path');
const {chromium} = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const {modes, GRID, PAD, FONT, MEASURE_FONT, CJK_FONT} = require('./diagram-style/tokens.cjs');
const {mermaidConfig, withTheme, QUOTE_STAND_IN} = require('./diagram-style/blueprint-theme.cjs');
const {postprocess} = require('./diagram-style/svg-postprocess.cjs');

const root = path.resolve(__dirname, '..');
const mermaidPath = path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/668c188756b835f3/node_modules/.mermaid-lyaZkmqu/dist/mermaid.min.js');

const rawArgs = process.argv.slice(2);
let dirArg = 'src/static-analysis/assets';
const args = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === '--dir') {
    if (!rawArgs[i + 1]) { console.error('--dir needs a path'); process.exit(2); }
    dirArg = rawArgs[++i];
    continue;
  }
  args.push(rawArgs[i]);
}
const assets = path.resolve(root, dirArg);
if (!fs.existsSync(assets)) { console.error('assets directory not found: ' + assets); process.exit(2); }
const manifestPath = path.join(assets, 'diagram-manifest.json');
if (!fs.existsSync(manifestPath)) { console.error('missing diagram-manifest.json in ' + assets); process.exit(2); }
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const names = args.includes('--all') ? Object.keys(manifest) : args.filter(a => a !== '--all');
if (!names.length) { console.error('no diagram names given (or use --all)'); process.exit(2); }
const unknown = names.filter(n => !manifest[n]);
if (unknown.length) { console.error('not in diagram-manifest.json: ' + unknown.join(', ')); process.exit(2); }
const sources = fs.readdirSync(assets).filter(f => f.endsWith('.mmd')).map(f => f.slice(0, -4));
const unlisted = sources.filter(n => !manifest[n]);
if (unlisted.length) { console.error('missing from diagram-manifest.json: ' + unlisted.join(', ')); process.exit(2); }

(async () => {
  const browser = await chromium.launch({executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true});
  try {
    for (const t of modes) {
      for (const name of names) {
        // A fresh page per figure: Mermaid keeps the first configuration it is initialised with.
        const page = await browser.newPage({viewport: {width: 1800, height: 1400}});
        await page.setContent(`<html><meta charset="utf-8"><body style="margin:24px;background:${t.page}"><div id="diagram" style="display:inline-block"></div></body></html>`);
        await page.addScriptTag({path: mermaidPath});
        const code = withTheme(name, fs.readFileSync(path.join(assets, name + '.mmd'), 'utf8'), t);
        await page.evaluate(async ({code, id, config}) => {
          mermaid.initialize(config);
          await document.fonts.ready;
          const r = await mermaid.render(id, code);
          document.querySelector('#diagram').innerHTML = r.svg;
        }, {code, id: 'sa-' + name + (t.name === 'dark' ? '-dark' : ''), config: mermaidConfig(t, manifest[name])});
        const svg = await page.evaluate(postprocess, {t, type: manifest[name], grid: GRID, pad: PAD, font: FONT, measureFont: MEASURE_FONT, cjkFont: CJK_FONT, quoteStandIn: QUOTE_STAND_IN});
        if (svg.includes('<foreignObject') || svg.includes(MEASURE_FONT.split(',')[0])) throw new Error(`${name}: HTML label or layout font left in the output`);
        // SVG text labels do not decode HTML entities. Only #quot; is handled (see QUOTE_STAND_IN).
        if (/&amp;(#?\w+);/.test(svg)) throw new Error(`${name}: an HTML entity such as &quot; shows up literally in a label; for a double quote write #quot; in the .mmd`);
        fs.writeFileSync(path.join(assets, name + t.suffix + '.svg'), svg);
        await page.locator('#diagram').screenshot({path: path.join(process.env.TEMP, name + t.suffix + '.png')});
        await page.close();
        console.log(`${name}${t.suffix}: rendered`);
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
