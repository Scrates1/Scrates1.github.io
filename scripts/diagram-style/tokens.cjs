// Design tokens for blog diagrams ("warm blueprint") — any technical article on this site.
// Plate, grid and ink colours come from the site's --yuan-* palette in
// src/.vuepress/styles/index.scss, so the figures sit on the page instead of on top of it.
// Each role is a stroke / fill / text triple.

// Readers see FONT. Their first available monospace differs in width (Consolas 0.55em, Menlo and
// DejaVu Sans Mono 0.60em), so Mermaid lays the figure out with MEASURE_FONT, whose Latin glyphs
// are as wide as the widest of them; the family is swapped after layout. Labels are centred SVG
// text, so a narrower font only adds a little padding and nothing is clipped on other systems.
// Family names are unquoted on purpose: the swap is a plain string replace on the serialised SVG.
const FONT = 'Consolas, Menlo, DejaVu Sans Mono, Sarasa Mono SC, Microsoft YaHei, PingFang SC, Noto Sans CJK SC, monospace';
const MEASURE_FONT = 'Courier New, Microsoft YaHei, monospace';
const CJK_FONT = 'Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif';

const light = {
  name: 'light',
  suffix: '',
  page: '#f5f2ec',
  plate: '#fbf8f2',
  grid: '#e9e1d2',
  border: '#d9cfbd',
  text: '#3a2a22',
  line: '#7a6a5c',
  clusterFill: 'rgba(122,106,92,0.05)',
  clusterSolid: '#f5f1eb', // clusterFill composited on plate; halo behind subgraph titles
  clusterStroke: '#bfb29e',
  roles: {
    statement: {stroke: '#3f6480', fill: '#fffdf9', text: '#3a2a22'},
    branch: {stroke: '#b06d44', fill: '#f8ebe0', text: '#6e3d20'},
    merge: {stroke: '#2f4a3f', fill: '#e6eee8', text: '#223a30'},
    object: {stroke: '#3f6480', fill: '#eaf0f4', text: '#3a2a22'},
    note: {stroke: '#9a8c7b', fill: '#f3eee4', text: '#5b4c40'},
    aux: {stroke: '#9a8c7b', fill: '#fbf8f2', text: '#7a6a5c'},
  },
};

const dark = {
  name: 'dark',
  suffix: '.dark',
  page: '#1c1a17',
  plate: '#25221e',
  grid: '#302b25',
  border: '#3a342d',
  text: '#ebe4d6',
  line: '#a89a88',
  clusterFill: 'rgba(168,154,136,0.06)',
  clusterSolid: '#2d2924',
  clusterStroke: '#5c5348',
  roles: {
    statement: {stroke: '#8fb3c9', fill: '#25221e', text: '#ebe4d6'},
    branch: {stroke: '#d9926a', fill: '#33281f', text: '#f0c4a8'},
    merge: {stroke: '#8fb09c', fill: '#243028', text: '#c5d6cb'},
    object: {stroke: '#8fb3c9', fill: '#27323a', text: '#ebe4d6'},
    note: {stroke: '#8a7d6d', fill: '#2d2924', text: '#cfc5b4'},
    aux: {stroke: '#8a7d6d', fill: '#25221e', text: '#a89a88'},
  },
};

module.exports = {FONT, MEASURE_FONT, CJK_FONT, GRID: 14, PAD: 24, modes: [light, dark]};
