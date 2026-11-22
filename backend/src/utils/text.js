/**
 * Text helpers for Arabic / Urdu content.
 * All DB text is NVARCHAR; these helpers only deal with data anomalies
 * (NULL / empty / '?'-corrupted values) and lenient answer comparison.
 */

/** True if a string carries real content (not null, blank or only '?' artifacts). */
function hasText(s) {
  if (s === null || s === undefined) return false;
  return String(s).replace(/[?�\s]/g, '').length > 0;
}

function cleanText(s) {
  return hasText(s) ? String(s).replace(/\s+/g, ' ').trim() : null;
}

const TASHKEEL = /[ً-ٰٟۖ-ۭـ]/g;
const PUNCT = /[۔،؟؛.,!?'"()\-:;]/g;
const CHAR_MAP = {
  'ك': 'ک', // ك -> ک
  'ي': 'ی', // ي -> ی
  'ى': 'ی', // ى -> ی
  'ے': 'ی', // ے -> ی
  'ۓ': 'ی',
  'ئ': 'ی', // ئ -> ی
  'أ': 'ا', // أ
  'إ': 'ا', // إ
  'آ': 'ا', // آ
  'ٱ': 'ا', // ٱ
  'ؤ': 'و', // ؤ -> و
  'ة': 'ہ', // ة -> ہ
  'ۃ': 'ہ', // ۃ -> ہ
  'ه': 'ہ', // ه -> ہ
  'ھ': 'ہ', // ھ -> ہ
  'ۂ': 'ہ',
};

/** Normalise Urdu/Arabic text for lenient equality (ignores airab, letter variants, spacing). */
function normalizeAnswer(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .normalize('NFC')
    .replace(TASHKEEL, '')
    .replace(PUNCT, '')
    .replace(/[​-‏‪-‮]/g, '')
    .replace(/./gu, (c) => CHAR_MAP[c] || c)
    .replace(/\s+/g, '')
    .trim();
}

function sameAnswer(a, b) {
  const x = normalizeAnswer(a);
  return x.length > 0 && x === normalizeAnswer(b);
}

/** Exact comparison for multiple-choice values (options are served verbatim). */
function sameOption(a, b) {
  return String(a ?? '').trim() === String(b ?? '').trim() && String(a ?? '').trim() !== '';
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Unique values by normalised key, preserving first occurrence. */
function uniqueBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((v) => {
    const k = keyFn(v);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Title with graceful fallback when the DB value is NULL or corrupted ('???'). */
function safeTitle(value, fallback) {
  return cleanText(value) || fallback;
}

module.exports = { hasText, cleanText, normalizeAnswer, sameAnswer, sameOption, shuffle, uniqueBy, safeTitle };
