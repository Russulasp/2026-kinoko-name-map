import { chromium } from 'playwright';
import { startStaticServer } from './static-server.mjs';

const root = new URL('..', import.meta.url).pathname;
let server;
let browser;

try {
  server = await startStaticServer(root);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Reveal?.isReady());
  await page.evaluate(async () => document.fonts.ready);

  const report = await page.evaluate(() => Reveal.getSlides().map((slide, index) => {
    const elements = [slide, ...slide.querySelectorAll('*')];
    const overflowing = elements.filter((element) => {
      const style = getComputedStyle(element);
      const clips = ['hidden', 'clip'].includes(style.overflow) ||
        ['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY);
      return clips && (element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1);
    }).map((element) => element.className || element.tagName.toLowerCase());
    const textSizes = elements.filter((element) => {
      const style = getComputedStyle(element);
      return element.childNodes.length === 1 && element.firstChild?.nodeType === Node.TEXT_NODE &&
        element.textContent.trim() && style.display !== 'none' && style.visibility !== 'hidden';
    }).map((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    const bounds = slide.getBoundingClientRect();
    const outOfBounds = elements.filter((element) => {
      if (!element.textContent.trim() || getComputedStyle(element).display === 'none') return false;
      const rect = element.getBoundingClientRect();
      return rect.left < bounds.left - 1 || rect.top < bounds.top - 1 ||
        rect.right > bounds.right + 1 || rect.bottom > bounds.bottom + 1;
    }).map((element) => element.className || element.tagName.toLowerCase());
    return {
      slide: index + 1,
      scrollFits: slide.scrollHeight <= slide.clientHeight && slide.scrollWidth <= slide.clientWidth,
      minTextPx: Math.min(...textSizes),
      overflowing: [...new Set(overflowing)],
      outOfBounds: [...new Set(outOfBounds)]
    };
  }));

  for (const result of report) console.log(JSON.stringify(result));
  const failures = report.filter((result) => !result.scrollFits || result.overflowing.length || result.outOfBounds.length);
  if (failures.length) throw new Error(`Visual audit failed on slide(s): ${failures.map(({ slide }) => slide).join(', ')}`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve) ?? resolve());
}
