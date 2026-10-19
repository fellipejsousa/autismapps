import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePictogramKeyword } from '../../src/lib/arasaac/search-normalize.js';

test('ARASAAC keyword matching ignores Portuguese accents', () => {
	for (const [query, label] of [['cafe', 'café'], ['agua', 'água'], ['onibus', 'ônibus']]) {
		assert.equal(normalizePictogramKeyword(query), normalizePictogramKeyword(label));
	}
});

test('keyword normalization retains case folding and surrounding whitespace behavior', () => {
	assert.equal(normalizePictogramKeyword('  CAFÉ  '), normalizePictogramKeyword('cafe'));
});
