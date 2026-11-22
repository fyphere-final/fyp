/**
 * Roman-Urdu -> Urdu suggestions for the Sabaq typing box (student side only).
 * Works by comparing consonant "skeletons": what the student types in Roman
 * (e.g. "isl") is matched against the lesson's known meanings (e.g. "اسلام").
 */
const URDU = {
  'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's', 'ج': 'j', 'چ': 'C', 'ح': 'h', 'خ': 'X', 'د': 'd', 'ڈ': 'd',
  'ذ': 'z', 'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'z', 'س': 's', 'ش': 'S', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
  'غ': 'G', 'ف': 'f', 'ق': 'k', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n', 'ہ': 'h', 'ھ': 'h', 'ۃ': 'h', 'ة': 'h',
};
const TASHKEEL = /[ً-ٰٟ]/g;

export function urduSkeleton(text) {
  return [...text.replace(TASHKEEL, '')].map((c) => URDU[c] || '').join('');
}

export function romanSkeleton(text) {
  let s = text.toLowerCase().replace(/[^a-z]/g, '');
  s = s.replace(/kh/g, 'X').replace(/gh/g, 'G').replace(/sh/g, 'S').replace(/ch/g, 'C').replace(/ph/g, 'f');
  s = s.replace(/c/g, 'k').replace(/q/g, 'k').replace(/v/g, 'w').replace(/x/g, 'k');
  return [...s].map((c) => ('aeiouyw'.includes(c) ? '' : c)).join('').replace(/./g, (c) => ({ w: '' }[c] ?? c));
}

/** Greedy letter-by-letter fallback when nothing in the lesson matches. */
const LETTERS = { a: 'ا', b: 'ب', p: 'پ', t: 'ت', j: 'ج', h: 'ہ', d: 'د', r: 'ر', z: 'ز', s: 'س', f: 'ف', q: 'ق', k: 'ک', g: 'گ', l: 'ل', m: 'م', n: 'ن', w: 'و', y: 'ی', i: 'ی', u: 'و', o: 'و', e: 'ے', v: 'و', c: 'ک', x: 'کس' };
const DIGRAPHS = { kh: 'خ', gh: 'غ', sh: 'ش', ch: 'چ', ph: 'پھ', th: 'تھ' };
export function transliterate(input) {
  const s = input.toLowerCase().replace(/[^a-z]/g, '');
  let out = '';
  for (let i = 0; i < s.length; ) {
    const two = s.slice(i, i + 2);
    if (DIGRAPHS[two]) { out += DIGRAPHS[two]; i += 2; } else { out += LETTERS[s[i]] || ''; i += 1; }
  }
  return out;
}

/** Returns up to `max` Urdu suggestions for a Roman (or already-Urdu) string. */
export function suggest(input, candidates, max = 3) {
  const v = input.trim();
  if (!v || /[؀-ۿ]/.test(v)) return [];
  const key = romanSkeleton(v);
  const unique = [...new Set(candidates.filter(Boolean))];
  const hits = key
    ? unique.filter((m) => urduSkeleton(m).startsWith(key)).sort((a, b) => a.length - b.length).slice(0, max)
    : [];
  if (hits.length) return hits;
  const fallback = transliterate(v);
  return fallback ? [fallback] : [];
}
