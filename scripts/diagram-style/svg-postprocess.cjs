// Runs inside the browser page (Playwright serialises the function), on the SVG Mermaid just
// rendered into #diagram. It never moves nodes or renames ids: scripts/check_series.py reads
// node coordinates from the committed SVGs.

function postprocess({t, grid, pad, font, measureFont, cjkFont, quoteStandIn}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector('#diagram svg');
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };

  // Mindmap: Mermaid colours each branch from a rainbow scale. Repaint every section with one
  // of the series' roles so the overview speaks the same colour language as the other figures.
  const mindmap = svg.getAttribute('aria-roledescription') === 'mindmap';
  let css = '';
  if (mindmap) {
    const cycle = [t.roles.statement, t.roles.merge, t.roles.branch, t.roles.note];
    const sections = new Set();
    svg.querySelectorAll('[class*="section-"]').forEach(e => {
      const m = /section-(-?\d+)/.exec(e.getAttribute('class'));
      if (m) sections.add(Number(m[1]));
    });
    for (const n of [...sections].sort((a, b) => a - b)) {
      const root = n < 0;
      const r = root ? t.roles.merge : cycle[n % cycle.length];
      const sel = `#${svg.id} .section-${n}`;
      css += `${sel} rect,${sel} path,${sel} circle,${sel} polygon{fill:${r.fill};stroke:${r.stroke};stroke-width:1.3px;}`;
      css += `${sel} line{stroke:${r.stroke};stroke-width:1.3px;}`;
      css += `${sel} text,${sel} tspan{fill:${r.text};stroke:none;}`;
      css += `#${svg.id} .edge.section-edge-${n},#${svg.id} path.section-edge-${n}{stroke:${root ? t.line : r.stroke};fill:none;}`;
    }
    css += `#${svg.id} .edge{stroke-width:1.6px;}`;
    css += `#${svg.id} .mindmap-node line{stroke:none;}`; // the default shape's heavy underline
  } else {
    svg.querySelectorAll('.node rect.label-container, .node rect.basic').forEach(r => {
      r.setAttribute('rx', 2); r.setAttribute('ry', 2);
    });
    css += `#${svg.id} .edge-thickness-normal{stroke-width:1.3px;}`;
    css += `#${svg.id} .edge-thickness-thick{stroke-width:2.8px;}`;
    css += `#${svg.id} .edge-pattern-dotted{stroke-dasharray:4 4;}`;
    css += `#${svg.id} .edgeLabel text,#${svg.id} .edgeLabel tspan{fill:${t.line};}`;
    css += `#${svg.id} .edgeLabel rect,#${svg.id} .labelBkg{fill:${t.plate};opacity:1;}`;
    css += `#${svg.id} .cluster rect{fill:${t.clusterFill};stroke:${t.clusterStroke};stroke-width:1px;rx:2px;}`;
    css += `#${svg.id} .cluster-label text,#${svg.id} .cluster-label tspan{fill:${t.line};}`;

    // An edge label's backing rectangle hides the line behind the text. Inside a subgraph it
    // has to take the subgraph's colour, or it shows up as a patch.
    const clusters = [...svg.querySelectorAll('.cluster rect')].map(r => r.getBoundingClientRect());
    svg.querySelectorAll('.edgeLabel rect').forEach(r => {
      const b = r.getBoundingClientRect();
      if (!b.width) return;
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      if (clusters.some(c => cx > c.left && cx < c.right && cy > c.top && cy < c.bottom)) r.style.fill = t.clusterSolid;
    });

    // Subgraph titles are drawn under the edges, so an edge entering a subgraph strikes through
    // its title. Lift the titles into a top layer (same position) and give the glyphs a
    // halo in the subgraph's own colour, which breaks the line around the text.
    css += `#${svg.id} .cluster-label text{paint-order:stroke;stroke:${t.clusterSolid};stroke-width:5px;stroke-linejoin:round;}`;
    const titles = el('g', {class: 'cluster-titles'});
    const toRoot = svg.getScreenCTM().inverse();
    svg.querySelectorAll('.cluster-label').forEach(label => {
      const m = toRoot.multiply(label.getScreenCTM());
      label.setAttribute('transform', `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map(v => +v.toFixed(3)).join(' ')})`);
      titles.append(label);
    });
    svg.append(titles);
  }
  const style = document.createElementNS(NS, 'style');
  style.textContent = css;
  svg.querySelector('style').after(style);

  // Some labels (mindmap nodes, subgraph titles) are left-anchored at "centre minus half the
  // measured width". Anchor every label at its centre instead, so it stays centred whatever
  // font the reader's system picks. The mindmap root is placed at its centre already.
  const rowsOf = text => [...text.children].filter(c => c.classList.contains('text-outer-tspan'));
  svg.querySelectorAll('text').forEach(text => {
    if (getComputedStyle(text).textAnchor === 'middle') return;
    const b = text.getBBox();
    if (!b.width) return;
    const cx = text.closest('.section-root') ? 0 : b.x + b.width / 2;
    text.setAttribute('text-anchor', 'middle');
    rowsOf(text).forEach(row => row.setAttribute('x', cx));
  });

  // Mermaid stacks SVG text rows 1.1em apart, which is tight for mixed Chinese and code.
  // Re-space the rows around the same centre, then refit the label's backing rectangle.
  const LINE = 1.35;
  svg.querySelectorAll('text').forEach(text => {
    const rows = rowsOf(text);
    if (rows.length < 2) return;
    const lift = (rows.length - 1) * (LINE - 1.1) / 2;
    rows.forEach((row, i) => row.setAttribute('y', `${(i * LINE - 0.1 - lift).toFixed(3)}em`));
    const bg = text.previousElementSibling;
    if (bg && bg.matches('rect.background') && bg.hasAttribute('width')) {
      const b = text.getBBox();
      bg.setAttribute('x', b.x - 2); bg.setAttribute('y', b.y - 2);
      bg.setAttribute('width', b.width + 4); bg.setAttribute('height', b.height + 4);
    }
  });

  // Consolas draws the circled digits ①–⑳ as half-width miniatures. The 02-* figures number the
  // compiler stages with them, so give those characters to the CJK font, where they are full size.
  const CIRCLED = /([\u2460-\u2473]+)/;
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) if (walker.currentNode.parentElement.closest('text')) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    node.data = node.data.split(quoteStandIn).join('"'); // see QUOTE_STAND_IN in blueprint-theme.cjs
    if (!CIRCLED.test(node.data)) continue;
    const parts = node.data.split(CIRCLED).filter(Boolean).map(part => {
      if (!CIRCLED.test(part)) return part;
      const span = el('tspan', {style: `font-family:${cjkFont}`});
      span.textContent = part;
      return span;
    });
    node.replaceWith(...parts);
  }

  // Plate: grow the canvas to a whole number of grid cells and centre the drawing on it.
  const bb = svg.getBBox();
  const W = Math.ceil((bb.width + 2 * pad) / grid) * grid;
  const H = Math.ceil((bb.height + 2 * pad) / grid) * grid;
  const x0 = Math.round(bb.x - (W - bb.width) / 2);
  const y0 = Math.round(bb.y - (H - bb.height) / 2);
  svg.removeAttribute('style');
  svg.setAttribute('viewBox', `${x0} ${y0} ${W} ${H}`);
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);

  const gridId = svg.id + '-grid';
  const defs = el('defs', {});
  const pattern = el('pattern', {id: gridId, x: x0, y: y0, width: grid, height: grid, patternUnits: 'userSpaceOnUse'});
  pattern.append(el('path', {d: `M${grid} 0H0V${grid}`, fill: 'none', stroke: t.grid, 'stroke-width': 0.6}));
  defs.append(pattern);
  const plate = el('g', {class: 'blueprint-plate'});
  plate.append(
    el('rect', {x: x0, y: y0, width: W, height: H, rx: 2, fill: t.plate}),
    el('rect', {x: x0, y: y0, width: W, height: H, rx: 2, fill: `url(#${gridId})`}),
    el('rect', {x: x0 + 0.5, y: y0 + 0.5, width: W - 1, height: H - 1, rx: 2, fill: 'none', stroke: t.border, 'stroke-width': 1}),
  );
  style.after(defs, plate);

  // Layout is done; hand the text over to the fonts readers actually have (see tokens.cjs).
  // Mermaid minifies its CSS, so the list may come back with or without spaces after the commas.
  const measured = new RegExp(measureFont.split(/\s*,\s*/).join('\\s*,\\s*'), 'g');
  const out = new XMLSerializer().serializeToString(svg).replace(measured, font);
  document.querySelector('#diagram').innerHTML = out; // so the PNG preview shows the final figure
  return out;
}

module.exports = {postprocess};
