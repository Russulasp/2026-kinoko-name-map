import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/theme.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../js/presentation.js', import.meta.url), 'utf8');

const assertions = [
  [html.includes('class="reveal"') && html.includes('class="slides"'), 'Reveal container is present'],
  [(html.match(/<section/g) ?? []).length >= 25, 'Presentation contains at least 25 slides'],
  [html.includes('Amanita satotamagotake') && html.includes('Lactifluus'), 'Key manuscript examples are present'],
  [html.includes('参考文献'), 'References are present'],
  [css.includes('aspect-ratio') || css.includes('1600'), '16:9 presentation styling is present'],
  [js.includes('Reveal.initialize') && js.includes('width: 1600') && js.includes('height: 900'), 'Reveal initializes at 16:9']
];

for (const [ok, message] of assertions) {
  if (!ok) throw new Error(message);
  console.log(`✓ ${message}`);
}
