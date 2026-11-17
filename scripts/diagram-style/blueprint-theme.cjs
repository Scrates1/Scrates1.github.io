// Mermaid configuration and the shared classDef block for one colour mode.
// .mmd sources carry structure and semantic class names only; every colour comes from here.

const {MEASURE_FONT} = require('./tokens.cjs');

// Semantic class -> role. The left column is what .mmd files may use.
const CLASS_ROLES = {
  statement: 'statement', // ordinary program point / node
  branch: 'branch',       // condition, fork
  merge: 'merge',         // join point, sink, result
  object: 'object',       // heap object
  field: 'branch',        // field slot of an object
  note: 'note',           // input, output, remark
  aux: 'aux',             // auxiliary fact, excluded path (dashed)
  // 02-* pipeline figures: the article text names these colours (blue / green / orange / grey).
  front: 'object',        // blue-tinted fill, so "蓝色" in the legend reads as blue next to green and orange
  mid: 'merge',
  back: 'branch',
  block: 'statement',
};

// Layout knobs per diagram type (see assets/diagram-manifest.json).
const TYPE_FLOWCHART = {
  overview: {nodeSpacing: 30, rankSpacing: 48},
  process: {nodeSpacing: 35, rankSpacing: 45},
  cfg: {nodeSpacing: 40, rankSpacing: 45},
  lattice: {nodeSpacing: 40, rankSpacing: 50},
  ifds: {nodeSpacing: 40, rankSpacing: 55},
  'points-to': {nodeSpacing: 40, rankSpacing: 60},
};

function mermaidConfig(t, type) {
  const s = t.roles.statement;
  return {
    startOnLoad: false,
    theme: 'base',
    // Plain SVG <text> labels: an <img> cannot reflow or clip them the way it does HTML labels.
    htmlLabels: false,
    fontFamily: MEASURE_FONT,
    themeVariables: {
      darkMode: t.name === 'dark',
      fontFamily: MEASURE_FONT,
      fontSize: '15px',
      background: t.plate,
      primaryColor: s.fill,
      primaryBorderColor: s.stroke,
      primaryTextColor: s.text,
      secondaryColor: t.roles.merge.fill,
      tertiaryColor: t.roles.branch.fill,
      mainBkg: s.fill,
      nodeBorder: s.stroke,
      lineColor: t.line,
      textColor: t.text,
      titleColor: t.line,
      clusterBkg: t.clusterFill,
      clusterBorder: t.clusterStroke,
      edgeLabelBackground: t.plate,
    },
    flowchart: {
      curve: 'linear',
      padding: 18,
      wrappingWidth: 280,
      subGraphTitleMargin: {top: 12, bottom: 22},
      useMaxWidth: false,
      ...TYPE_FLOWCHART[type],
    },
    mindmap: {useMaxWidth: false, padding: 12},
  };
}

function classDefs(t) {
  const def = (name, r, extra = '') =>
    `classDef ${name} fill:${r.fill},stroke:${r.stroke},color:${r.text},stroke-width:1.3px${extra};`;
  const lines = [def('default', t.roles.statement)];
  for (const [name, role] of Object.entries(CLASS_ROLES)) {
    lines.push(def(name, t.roles[role], role === 'aux' ? ',stroke-dasharray:5 3' : ''));
  }
  return lines.join('\n');
}

// Colours are owned by the theme, so a source that sets its own is a mistake.
function assertNoInlineColours(name, code) {
  const bad = code.split(/\r?\n/).filter(l => /^\s*classDef\b/.test(l) || /^\s*(style|linkStyle)\b.*(fill|stroke|color)\s*:\s*#/.test(l));
  if (bad.length) throw new Error(`${name}.mmd sets its own colours; use a semantic class instead:\n  ${bad.join('\n  ')}`);
}

// Mermaid's escape for a double quote inside a label is #quot;. With SVG text labels this
// version prints it literally and sizes the node for the six characters. Swap it for a
// one-character stand-in before layout; the post-processor turns the stand-in into a real quote.
const QUOTE_STAND_IN = '\u00a8';

function withTheme(name, code, t) {
  code = code.replace(/#quot;/g, QUOTE_STAND_IN);
  if (!/^\s*(flowchart|graph)\b/.test(code)) return code;
  assertNoInlineColours(name, code);
  return code.replace(/\s*$/, '') + '\n' + classDefs(t) + '\n';
}

module.exports = {mermaidConfig, withTheme, CLASS_ROLES, QUOTE_STAND_IN};
