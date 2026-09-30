// Render src/static-analysis/assets/<name>.mmd to <name>.svg (plus a PNG preview in %TEMP%).
// Usage: node scripts/render_named_diagrams.cjs 05-series-1 07-series-2
//
// Uses playwright + mermaid from the local npx cache and headless Edge; the SVGs are
// committed, so this only needs to run when a .mmd changes. Inspect the PNG before committing.
const fs = require('fs');
const path = require('path');
const {chromium} = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const assets = path.resolve(__dirname, '..', 'src', 'static-analysis', 'assets');
const mermaidPath = path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/668c188756b835f3/node_modules/.mermaid-lyaZkmqu/dist/mermaid.min.js');
const names = process.argv.slice(2);
if (!names.length) { console.error('no diagram names given'); process.exit(2); }
(async () => {
  const browser = await chromium.launch({executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1800, height: 1400}});
    await page.setContent('<html><meta charset="utf-8"><body style="margin:20px;background:white"><div id="diagram" style="display:inline-block"></div></body></html>');
    await page.addScriptTag({path: mermaidPath});
    await page.evaluate(() => mermaid.initialize({startOnLoad: false, theme: 'base', fontFamily: 'Microsoft YaHei, sans-serif', themeVariables: {fontSize: '17px', fontFamily: 'Microsoft YaHei, sans-serif'}, flowchart: {htmlLabels: false, curve: 'linear', nodeSpacing: 35, rankSpacing: 45, padding: 20, wrappingWidth: 260, subGraphTitleMargin: {top: 14, bottom: 24}, useMaxWidth: false}}));
    let i = 0;
    for (const name of names) {
      const code = fs.readFileSync(path.join(assets, name + '.mmd'), 'utf8');
      const svg = await page.evaluate(async ({code, id}) => {
        const r = await mermaid.render(id, code);
        document.querySelector('#diagram').innerHTML = r.svg;
        return new XMLSerializer().serializeToString(document.querySelector('#diagram svg'));
      }, {code, id: 'named' + (i++)});
      fs.writeFileSync(path.join(assets, name + '.svg'), svg);
      await page.locator('#diagram').screenshot({path: path.join(process.env.TEMP, name + '.png')});
      console.log(name + ': rendered');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
