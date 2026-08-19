import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/theme.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../js/presentation.js', import.meta.url), 'utf8');
const titleSlide = html.match(/<section class="title-slide">([\s\S]*?)<\/section>/)?.[1] ?? '';

const assertions = [
  [html.includes('class="reveal"') && html.includes('class="slides"'), 'Reveal container is present'],
  [(html.match(/<section/g) ?? []).length === 28, 'Presentation contains exactly 28 slides'],
  [html.includes('Amanita satotamagotake') && html.includes('Lactifluus'), 'Key manuscript examples are present'],
  [html.includes('白水ほか（2018）の解析では') && html.includes('species complex') && html.includes('少なくとも一部の日本産では') && html.includes('適用が<strong>暫定的'), 'Auricularia findings and later uncertainty are appropriately scoped'],
  [html.includes('解析した日本産標本では確認されなかった') && html.includes('子実体で少ない／検出されない ≠ 生合成能力がない'), 'Tricholoma revision and ustalic acid findings are appropriately scoped'],
  [html.includes('参考文献'), 'References are present'],
  [!html.includes('class="kicker"') && !html.includes('class="eyebrow"'), 'Decorative English headings are absent'],
  [html.includes('事例 01') && html.includes('事例 08 — 次の問い') && !html.includes('class="case-label">CASE '), 'Case labels are presented in Japanese'],
  [!html.includes('完全に統一・網羅したリストは存在しない') && html.includes('和名そのものに学名のような命名規約や拘束力はない'), 'Name-list wording avoids an unsupported nonexistence claim'],
  [
    [...html.matchAll(/CASE (0[1-4]|0[6-8]) refs:/g)].length === 7 &&
      html.includes('CASE 01 refs: 服部（2001）') &&
      html.includes('CASE 08 refs: Nuhn et al.（2013）'),
    'Multi-slide case references are consolidated on case-ending slides'
  ],
  [titleSlide.includes('きのこの') && titleSlide.includes('2026年9月') && titleSlide.includes('渡邉 大輔') && !titleSlide.includes('subtitle'), 'Title slide contains only the requested presentation details'],
  [css.includes('aspect-ratio') || css.includes('1600'), '16:9 presentation styling is present'],
  [js.includes('Reveal.initialize') && js.includes('width: 1600') && js.includes('height: 900'), 'Reveal initializes at 16:9']
  ,[js.includes('Reveal.getSlides()') && js.includes("padStart(2, '0')") && css.includes('attr(data-slide-number)'), 'Slide numbers are generated from Reveal order with two-digit padding']
  ,[!css.includes('section::after{display:none}'), 'Slide numbers remain visible in print output']
];

for (const [ok, message] of assertions) {
  if (!ok) throw new Error(message);
  console.log(`✓ ${message}`);
}
