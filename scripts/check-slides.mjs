import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/theme.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../js/presentation.js', import.meta.url), 'utf8');
const titleSlide = html.match(/<section class="[^"]*\btitle-slide\b[^"]*">([\s\S]*?)<\/section>/)?.[1] ?? '';
const slides = [...html.matchAll(/<section class="([^"]*\bslide\b[^"]*)">([\s\S]*?)<\/section>/g)];

const assertions = [
  [html.includes('class="reveal"') && html.includes('class="slides"'), 'Reveal container is present'],
  [(html.match(/<section/g) ?? []).length === 28, 'Presentation contains exactly 28 slides'],
  [slides.length === 28 && slides.every(([, , body]) => body.includes('class="slide-header"') && body.includes('class="slide-main"') && body.includes('class="slide-meta')), 'Every slide uses the header/main/meta structure'],
  [slides.every(([, classes]) => /\blayout-[\w-]+\b/.test(classes)), 'Every slide has a layout primitive'],
  [html.includes('Amanita satotamagotake') && html.includes('Lactifluus'), 'Key manuscript examples are present'],
  [html.includes('白水ほか（2018）の解析では') && html.includes('species complex') && html.includes('少なくとも一部の日本産では') && html.includes('適用が<strong>暫定的'), 'Auricularia findings and later uncertainty are appropriately scoped'],
  [html.includes('解析した日本産標本では確認されなかった') && html.includes('子実体で少ない／検出されない ≠ 生合成能力がない'), 'Tricholoma revision and ustalic acid findings are appropriately scoped'],
  [html.includes('参考文献'), 'References are present'],
  [
    html.includes('Moncalvo & Buchanan（2008）*') &&
      html.includes('Buyck et al.（2010）*') &&
      html.includes('Wu et al.（2014）*') &&
      !html.includes('Nuhn et al.（2013）*') &&
      html.includes('丹沢大山総合調査団（編）（2007）†') &&
      !html.includes('服部（2001）*') && !html.includes('服部（2001）†'),
    'Reference verification markers match the confirmed source scope'
  ],
  [html.includes('* 一般公開されているAbstract等で確認（全文未確認）') && html.includes('† 二次資料から確認（原典未確認）'), 'Reference verification legend explains both markers'],
  [html.includes('<strong>2つのITS配列型</strong>') && !html.includes('<strong>2系統</strong>'), 'Ganoderma finding remains scoped to two ITS sequence types'],
  [!html.includes('class="kicker"') && !html.includes('class="eyebrow"'), 'Decorative English headings are absent'],
  [html.includes('事例 01') && html.includes('事例 08 — 次の問い') && !html.includes('class="case-label">CASE '), 'Case labels are presented in Japanese'],
  [
    html.includes('学名には、国際的に共有される命名規約（ICN）がある') &&
      html.includes('日本菌学会は2008年、新たな和名について') &&
      html.includes('「学会推奨和名」</strong>の考え方と決定手順を示した') &&
      !html.includes('「学会推奨和名」</strong>を定める手順を示している'),
    'ICN and the 2008 recommended-Japanese-name procedure are accurately scoped'
  ],
  [
    [...html.matchAll(/CASE (0[1-4]|0[6-8]) refs:/g)].length === 7 &&
      html.includes('CASE 01 refs: 服部（2001）') &&
      html.includes('CASE 08 refs: Nuhn et al.（2013）'),
    'Multi-slide case references are consolidated on case-ending slides'
  ],
  [titleSlide.includes('きのこの') && titleSlide.includes('2026年9月') && titleSlide.includes('渡邉 大輔') && !titleSlide.includes('subtitle'), 'Title slide contains only the requested presentation details'],
  [css.includes('aspect-ratio') || css.includes('1600'), '16:9 presentation styling is present'],
  [css.includes('grid-template-rows: auto minmax(0, 1fr) auto') && css.includes('--type-slide-title') && css.includes('--type-reference'), 'Fixed-canvas layout and typography tokens are present'],
  [![...css.matchAll(/font-size:\s*(\d+)px/g)].some(([, size]) => Number(size) < 17), 'No fixed font size is smaller than 17px'],
  [js.includes('Reveal.initialize') && js.includes('width: 1600') && js.includes('height: 900'), 'Reveal initializes at 16:9']
  ,[js.includes('Reveal.getSlides()') && js.includes("padStart(2, '0')") && css.includes('attr(data-slide-number)'), 'Slide numbers are generated from Reveal order with two-digit padding']
  ,[!css.includes('section::after{display:none}'), 'Slide numbers remain visible in print output']
];

for (const [ok, message] of assertions) {
  if (!ok) throw new Error(message);
  console.log(`✓ ${message}`);
}
