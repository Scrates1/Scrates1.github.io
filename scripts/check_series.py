"""Validate the static-analysis course: structure, links, figures and the worked examples.

Run from anywhere:  python scripts/check_series.py
Writes a JSON report to the system temp directory and prints a summary.
"""
from pathlib import Path
import re, itertools, xml.etree.ElementTree as ET, json, tempfile

root = Path(__file__).resolve().parents[1]
series = root / 'src' / 'static-analysis'
notes = root / 'notes' / 'static-analysis'
examples = root / 'examples' / 'static-analysis'
articles = sorted(p for p in series.glob('[0-9][0-9]-*.md') if not p.name.startswith('99'))
assert len(articles) == 11, [p.name for p in articles]
assert {p.name for p in series.glob('*.md')} == {
    *(p.name for p in articles), 'README.md', '99-glossary.md'
}, 'Unexpected standalone article'
assert (series / '03-dataflow-and-lattice.md') in articles
assert (series / '04-worklist-and-fixed-point.md') in articles
issues = []
link_count = 0
docs = [*sorted(notes.rglob('*.md')), *sorted(series.rglob('*.md')), examples / 'README.md']
assert (series / 'README.md').is_file(), 'Missing series entry'
assert (series / '99-glossary.md').is_file(), 'Missing glossary'
for p in docs:
    s = p.read_text(encoding='utf-8-sig')
    assert s.count('```') % 2 == 0, f'Unclosed fence: {p}'
    assert '\ufffd' not in s, f'Encoding: {p}'
    for target in re.findall(r'\]\(([^)\s]+)\)', s):
        if target.startswith(('http://', 'https://', '#')): continue
        path = target.split('#')[0]
        link_count += 1
        if not (p.parent / path).exists(): issues.append(f'{p}: missing {target}')
    lines = s.splitlines(); in_code = False
    for i, line in enumerate(lines):
        if line.startswith('```'): in_code = not in_code; continue
        if not in_code and re.match(r'^(?:- |\d+\. )', line) and i:
            prior = lines[i - 1]
            if prior and not re.match(r'^(?:- |\d+\. |\s{2,})', prior):
                issues.append(f'{p}:{i + 1}: missing list separator')

# Site-facing conventions for the lessons (see notes/static-analysis/静态分析系列规划.md §6.0).
for p in articles:
    s = p.read_text(encoding='utf-8')
    assert s.startswith('---\n') and re.search(r'^title: ', s, re.M), f'Frontmatter: {p}'
    assert '::: tip 读前须知' not in s, f'Obsolete 读前须知 tip: {p}'
    assert '<!-- more -->' in s, f'Missing excerpt marker: {p}'
    more_pos = s.index('<!-- more -->')
    assert s.index('\n---\n') < more_pos, f'Excerpt marker before frontmatter end: {p}'
    assert not s[s.index('\n---\n') + 5:more_pos].lstrip().startswith('#'), f'Excerpt should follow opening prose: {p}'
    assert '## 本篇要点' in s, f'Missing 本篇要点: {p}'
    assert '检查是否读懂' not in s, f'Obsolete mandatory quiz: {p}'
    assert '系列总览' in s, p
    assert 'https://' in s, p
for p in (series / 'assets').glob('*.svg'): ET.parse(p)

# Check actual layout coordinates, not just Mermaid source direction.
tree = ET.parse(series / 'assets/04-series-1.svg')
coords = {}
for e in tree.iter():
    m = re.search(r'flowchart-(M0|MXY|UXY|U0)-', e.get('id', ''))
    if m:
        xy = re.search(r'translate\(([^,]+),\s*([^\)]+)\)', e.get('transform', ''))
        coords[m[1]] = (float(xy[1]), float(xy[2]))
assert coords['MXY'][1] < coords['M0'][1], coords
assert coords['U0'][1] < coords['UXY'][1], coords

# Exhaustively check the finite fact-domain claims used by chapters 03/04/07.
D = {'x', 'y', 'z'}
sets = [set(c) for n in range(4) for c in itertools.combinations(sorted(D), n)]
copy = lambda s: (s - {'y'}) | ({'y'} if 'x' in s else set())
kill = lambda s: s - {'y'}
source = lambda s: s | {'x'}
for a, b in itertools.product(sets, repeat=2):
    for f in [copy, kill, source]:
        assert f(a | b) == f(a) | f(b)
        if a <= b: assert f(a) <= f(b)
    # Least upper bounds in subset and reverse-subset order.
    assert all(not (a <= u and b <= u) or a | b <= u for u in sets)
    assert all(not (a >= u and b >= u) or a & b >= u for u in sets)
g = lambda s: s | ({'r'} if {'p', 'q'} <= s else set())
assert g({'p', 'q'}) != g({'p'}) | g({'q'})

# Independently simulate the reduced FIFO worklist in chapter 04.
successors = {'H': ['Z', 'S'], 'Z': ['Y'], 'Y': ['C'], 'C': ['H'], 'S': []}
state = {'H': {'x'}}; out = {}; queue = ['H']; trace = []
propagation_rows = []
def facts_text(facts):
    return '未可达' if facts is None else '{' + ','.join(sorted(facts)) + '}'
while queue:
    n = queue.pop(0); s = state[n]; t = set(s)
    old_inputs = {next_node: state.get(next_node) for next_node in successors[n]}
    enqueued = set()
    if n == 'Z': t = (s - {'z'}) | ({'z'} if 'y' in s else set())
    if n == 'Y': t = (s - {'y'}) | ({'y'} if 'x' in s else set())
    if n not in out or out[n] != t:
        out[n] = t
        for next_node in successors[n]:
            old = state.get(next_node); merged = (old or set()) | t
            if old is None or old != merged:
                state[next_node] = merged
                if next_node not in queue:
                    queue.append(next_node)
                    enqueued.add(next_node)
    trace.append((n, sorted(s), list(queue)))
    queue_text = '[' + ','.join(queue) + ']'
    for next_node, old_input in old_inputs.items():
        propagation_rows.append([n, facts_text(s), next_node, facts_text(old_input),
                                 facts_text(state[next_node]),
                                 '是' if next_node in enqueued else '否', queue_text])
    if not successors[n]:
        propagation_rows.append([n, facts_text(s), '—', '—', '—', '否', queue_text])
assert [x[0] for x in trace] == ['H', 'Z', 'S', 'Y', 'C', 'H', 'Z', 'S', 'Y', 'C', 'H', 'Z', 'S']
assert state['S'] == {'x', 'y', 'z'}

# Preserve the author's 8-column, 16-row table; H's two successor rows share one dequeue.
worklist_text = (series / '04-worklist-and-fixed-point.md').read_text(encoding='utf-8')
rows = [[cell.strip().strip('`') for cell in line.split('|')[1:-1]]
        for line in worklist_text.splitlines() if re.match(r'^\| [HZYCS] \|', line)]
assert len(rows) == len(propagation_rows) == 16, 'Worklist table row count'
for row_number, (row, expected) in enumerate(zip(rows, propagation_rows), 1):
    assert len(row) == 8 and row[:2] + row[3:] == expected, (row_number, row, expected)

# Constant, IDE and symbolic examples; these are example checks, not a general proof.
# Chapter 01: same observation space for both approximation directions.
universe = {(flag, tag) for flag in [False, True] for tag in ['safe', 'tainted']}
real = {(True, 'tainted'), (False, 'safe')}
under = {(False, 'safe')}
bad = {s for s in universe if s[1] == 'tainted'}
assert under <= real <= universe
assert not under & bad and real & bad
filtered_real = {s for s in real if not s[0]}
filtered_over = {s for s in universe if not s[0]}
assert not filtered_real & bad and filtered_over & bad

BOTTOM = object(); TOP = object()
def join(a, b):
    if a is BOTTOM: return b
    if b is BOTTOM: return a
    return a if a == b else TOP
def affine(v, m, b):
    if v is BOTTOM or v is TOP: return v
    return m * v + b
vals = [BOTTOM, TOP, *range(-5, 6)]
for a, b in itertools.product(vals, repeat=2):
    for m, k in [(1, 2), (5, 0)]:
        assert affine(join(a, b), m, k) == join(affine(a, m, k), affine(b, m, k))
assert [5 * (v + 2) for v in [1, 4]] == [15, 30]
assert [5 * v + 2 for v in [1, 4]] == [7, 22]
assert join(2 + 3, 3 + 2) == 5 and join(2, 3) is TOP
assert not any(b and not b for b in [False, True])
assert any(b and not b2 for b, b2 in itertools.product([False, True], repeat=2))

# Chapter 11: Andersen-style constraint solving (flow-insensitive, field-sensitive, context-insensitive).
def andersen(news, copies, stores, loads):
    pts = {}; edges = {}
    for x, o in news: pts.setdefault(x, set()).add(o)
    for x, y in copies: edges.setdefault(y, set()).add(x)
    work = [x for x, _ in news]; trace = []
    while work:
        n = work.pop(0); trace.append(n); sources = [n]
        for x, f, y in stores:          # x.f = y: connect y -> o.f for every o in pts(x)
            if x == n:
                for o in pts.get(n, ()): edges.setdefault(y, set()).add((o, f)); sources.append(y)
        for y, x, f in loads:           # y = x.f: connect o.f -> y for every o in pts(x)
            if x == n:
                for o in pts.get(n, ()): edges.setdefault((o, f), set()).add(y); sources.append((o, f))
        for src in sources:
            for m in edges.get(src, ()):
                before = set(pts.get(m, set())); pts[m] = before | pts.get(src, set())
                if pts[m] != before and m not in work: work.append(m)
    return pts, trace
alias, alias_trace = andersen([('a', 'o1'), ('t1', 's')], [('b', 'a')], [('a', 'f', 't1')], [('t2', 'b', 'f')])
assert alias['b'] == {'o1'} and alias[('o1', 'f')] == {'s'} and alias['t2'] == {'s'}, alias
assert alias_trace == ['a', 't1', 'b', ('o1', 'f'), 't2'], alias_trace
separate, _ = andersen([('a', 'o1'), ('b', 'o2'), ('t1', 's')], [], [('a', 'f', 't1')], [('t2', 'b', 'f')])
assert separate.get('t2', set()) == set() and separate[('o1', 'f')] == {'s'}, separate
factory, _ = andersen([('ret', 'o3'), ('t1', 's')], [('h1', 'ret'), ('h2', 'ret')],
                      [('h1', 'f', 't1')], [('t2', 'h2', 'f')])
assert factory['h1'] == factory['h2'] == {'o3'} and factory['t2'] == {'s'}, factory
# Context-sensitive heap: the two returns carry distinct allocation labels.
heap_ctx, _ = andersen([('retA', 'o3A'), ('retB', 'o3B'), ('t1', 's')], [('h1', 'retA'), ('h2', 'retB')],
                       [('h1', 'f', 't1')], [('t2', 'h2', 'f')])
assert heap_ctx.get('t2', set()) == set(), heap_ctx
# set example: one shared copy of set (insensitive) versus a copy per receiver (object-sensitive).
shared, _ = andersen([('p', 'o4'), ('q', 'o5'), ('t1', 's'), ('c0', 'c')],
                     [('this', 'p'), ('this', 'q'), ('v', 't1'), ('v', 'c0')], [('this', 'f', 'v')], [('t2', 'q', 'f')])
assert shared['t2'] == {'s', 'c'}, shared
per_recv, _ = andersen([('p', 'o4'), ('q', 'o5'), ('t1', 's'), ('c0', 'c')],
                       [('this4', 'p'), ('this5', 'q'), ('v4', 't1'), ('v5', 'c0')],
                       [('this4', 'f', 'v4'), ('this5', 'f', 'v5')], [('t2', 'q', 'f')])
assert per_recv['t2'] == {'c'}, per_recv
assert not issues, '\n'.join(issues)
report = {'articles': len(articles), 'worklist_table_rows': len(rows),
          'markdown_files_checked': len(docs), 'local_links': link_count,
          'svg_files': len(list((series / 'assets').glob('*.svg'))), 'lattice_layout': 'PASS',
          'finite_domain_checks': 'PASS', 'loop_table_trace': trace, 'example_calculations': 'PASS'}
Path(tempfile.gettempdir(), 'series-validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'loop_table_trace'}, ensure_ascii=False))
