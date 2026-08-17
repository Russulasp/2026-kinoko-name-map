import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/theme.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../js/presentation.js', import.meta.url), 'utf8');
const titleSlide = html.match(/<section class="title-slide">([\s\S]*?)<\/section>/)?.[1] ?? '';

const assertions = [
  [html.includes('class="reveal"') && html.includes('class="slides"'), 'Reveal container is present'],
  [(html.match(/<section/g) ?? []).length >= 25, 'Presentation contains at least 25 slides'],
  [html.includes('Amanita satotamagotake') && html.includes('Lactifluus'), 'Key manuscript examples are present'],
  [html.includes('白水ほか（2018）の解析では') && html.includes('species complex') && html.includes('日本産の扱いも') && html.includes('暫定的'), 'Auricularia findings and later uncertainty are appropriately scoped'],
  [html.includes('解析した日本産標本では確認されなかった') && html.includes('子実体で少ない／検出されない ≠ 生合成能力がない'), 'Tricholoma revision and ustalic acid findings are appropriately scoped'],
  [html.includes('参考文献'), 'References are present'],
  [!html.includes('class="kicker"') && !html.includes('class="eyebrow"'), 'Decorative English headings are absent'],
  [html.includes('事例 01') && html.includes('事例 08 — 次の問い') && !html.includes('>CASE '), 'Case labels are presented in Japanese'],
  [titleSlide.includes('きのこの') && titleSlide.includes('2026年9月') && titleSlide.includes('渡邉 大輔') && !titleSlide.includes('subtitle'), 'Title slide contains only the requested presentation details'],
  [css.includes('aspect-ratio') || css.includes('1600'), '16:9 presentation styling is present'],
  [js.includes('Reveal.initialize') && js.includes('width: 1600') && js.includes('height: 900'), 'Reveal initializes at 16:9']
];

for (const [ok, message] of assertions) {
  if (!ok) throw new Error(message);
  console.log(`✓ ${message}`);
}
