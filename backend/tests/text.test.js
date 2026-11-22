const test = require('node:test');
const assert = require('node:assert');
const { hasText, cleanText, sameAnswer, normalizeAnswer, safeTitle } = require('../src/utils/text');

test('hasText rejects null, blank and "?"-corrupted values', () => {
  assert.equal(hasText(null), false);
  assert.equal(hasText('   '), false);
  assert.equal(hasText('????? ???'), false);
  assert.equal(hasText('قرآن'), true);
});

test('cleanText returns null for bad data and trims good data', () => {
  assert.equal(cleanText('???'), null);
  assert.equal(cleanText('  قرآن   کریم '), 'قرآن کریم');
});

test('sameAnswer ignores harakat, letter variants and spacing', () => {
  assert.ok(sameAnswer('اَلْقُرْآنُ', 'القرآن'));
  assert.ok(sameAnswer('كتاب', 'کتاب')); // Arabic kaf vs Urdu kaf
  assert.ok(sameAnswer('اسلام', 'إسلام'));
  assert.ok(!sameAnswer('کتاب', 'کعبہ'));
  assert.ok(!sameAnswer('', ''));
});

test('normalizeAnswer is stable for null', () => assert.equal(normalizeAnswer(null), ''));
test('safeTitle falls back for corrupted titles', () => assert.equal(safeTitle('???', 'یونٹ 1'), 'یونٹ 1'));
