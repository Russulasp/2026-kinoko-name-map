import assert from 'node:assert/strict';
import test from 'node:test';

import { createExportFilename } from './export-filename.mjs';

test('creates a timestamped export filename in UTC', () => {
  const date = new Date('2026-08-19T13:24:56.789Z');

  assert.equal(createExportFilename('pptx', date), 'kinoko-name-map-20260819T132456-789Z.pptx');
});

test('uses the requested extension', () => {
  const date = new Date('2026-01-02T03:04:05.006Z');

  assert.equal(createExportFilename('pdf', date), 'kinoko-name-map-20260102T030405-006Z.pdf');
});
