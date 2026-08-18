function updateSlideNumbers() {
  Reveal.getSlides().forEach((slide, index) => {
    slide.dataset.slideNumber = String(index).padStart(2, '0');
  });
}

Reveal.on('ready', updateSlideNumbers);
Reveal.on('slidechanged', updateSlideNumbers);

Reveal.initialize({
  hash: true,
  history: true,
  controls: true,
  progress: true,
  center: false,
  width: 1600,
  height: 900,
  margin: 0,
  transition: 'fade',
  transitionSpeed: 'fast',
  pdfSeparateFragments: false
});
