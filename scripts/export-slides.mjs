import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import { createExportFilename } from './export-filename.mjs';
import { startStaticServer } from './static-server.mjs';

const WIDTH = 1600;
const HEIGHT = 900;
const root = fileURLToPath(new URL('..', import.meta.url));
const format = process.argv[2];

if (!['pptx', 'pdf'].includes(format)) {
  console.error('Usage: node scripts/export-slides.mjs <pptx|pdf>');
  process.exit(1);
}

async function captureSlides(page, directory) {
  await page.goto(page.url(), { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Reveal?.isReady());
  await page.evaluate(async () => {
    Reveal.configure({ controls: false, progress: false, transition: 'none', backgroundTransition: 'none' });
    await document.fonts.ready;
  });

  const slideIndices = await page.evaluate(() => Reveal.getSlides().map((slide) => Reveal.getIndices(slide)));
  const images = [];
  for (const [index, position] of slideIndices.entries()) {
    await page.evaluate(({ h, v }) => {
      Reveal.slide(h, v);
      const current = Reveal.getCurrentSlide();
      current.querySelectorAll('.fragment').forEach((fragment) => fragment.classList.add('visible'));
    }, position);
    await page.waitForTimeout(50);
    const image = join(directory, `slide-${String(index + 1).padStart(3, '0')}.png`);
    await page.screenshot({ path: image, animations: 'disabled' });
    images.push(image);
    process.stdout.write(`\rCaptured ${index + 1}/${slideIndices.length}`);
  }
  process.stdout.write('\n');
  return images;
}

async function writePptx(images, output) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'kinoko-name-map';
  pptx.subject = 'Reveal.js presentation export';
  pptx.title = 'きのこの和名・分類の変遷';
  pptx.company = '';
  pptx.lang = 'ja-JP';
  for (const image of images) {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };
    slide.addImage({ path: image, x: 0, y: 0, w: 13.333333, h: 7.5 });
  }
  await pptx.writeFile({ fileName: output });
}

async function writePdf(page, images, output) {
  const encodedImages = await Promise.all(images.map(async (image) => (await readFile(image)).toString('base64')));
  const pages = encodedImages.map((image) => `<div class="page"><img src="data:image/png;base64,${image}"></div>`).join('');
  await page.setContent(`<!doctype html><style>
    @page { size: 16in 9in; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    .page { width: 16in; height: 9in; break-after: page; overflow: hidden; }
    .page:last-child { break-after: auto; }
    img { display: block; width: 100%; height: 100%; }
  </style>${pages}`, { waitUntil: 'load' });
  await page.pdf({ path: output, width: '16in', height: '9in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'kinoko-name-map-'));
let server;
let browser;
try {
  await mkdir(join(root, 'dist'), { recursive: true });
  server = await startStaticServer(root);
  const address = server.address();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${address.port}/`);
  const images = await captureSlides(page, temporaryDirectory);
  const output = join(root, 'dist', createExportFilename(format));
  if (format === 'pptx') await writePptx(images, output);
  else await writePdf(page, images, output);
  console.log(`Created ${output}`);
} finally {
  await browser?.close();
  await new Promise((resolveClose) => server?.close(resolveClose) ?? resolveClose());
  await rm(temporaryDirectory, { recursive: true, force: true });
}
