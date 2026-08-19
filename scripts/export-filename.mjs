export function createExportFilename(format, date = new Date()) {
  const timestamp = date.toISOString().replace(/[-:]/g, '').replace('.', '-');
  return `kinoko-name-map-${timestamp}.${format}`;
}
