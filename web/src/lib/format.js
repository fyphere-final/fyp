const URDU_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Western digits -> Urdu digits. Used only where the mockups show Urdu digits (dashboard %, Mashq question pills). */
export const urduNum = (n) => String(n).replace(/\d/g, (d) => URDU_DIGITS[d]);
/** "67%" (Latin digits, as in Result / Progress mockups) */
export const pct = (n) => `${Math.round(n ?? 0)}٪`;
/** Dashboard shows "۳۸٪" */
export const pctUrdu = (n) => `${urduNum(Math.round(n ?? 0))}٪`;
export const num = (n) => String(n ?? '');

export function formatDate(iso) {
  try {
    const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
    return d.toLocaleDateString('ur-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}
export const OPTION_LETTERS = ['ا', 'ب', 'ج', 'د', 'ہ', 'و'];

/** Urdu number words 0-100 ("انیس"); the mockups show counts as "19 اسباق · انیس اسباق". */
const WORDS = ["صفر", "ایک", "دو", "تین", "چار", "پانچ", "چھ", "سات", "آٹھ", "نو", "دس", "گیارہ", "بارہ", "تیرہ", "چودہ", "پندرہ", "سولہ", "سترہ", "اٹھارہ", "انیس", "بیس", "اکیس", "بائیس", "تیئس", "چوبیس", "پچیس", "چھبیس", "ستائیس", "اٹھائیس", "انتیس", "تیس", "اکتیس", "بتیس", "تینتیس", "چونتیس", "پینتیس", "چھتیس", "سینتیس", "اڑتیس", "انتالیس", "چالیس", "اکتالیس", "بیالیس", "تینتالیس", "چوالیس", "پینتالیس", "چھیالیس", "سینتالیس", "اڑتالیس", "انچاس", "پچاس", "اکیاون", "باون", "ترپن", "چون", "پچپن", "چھپن", "ستاون", "اٹھاون", "انسٹھ", "ساٹھ", "اکسٹھ", "باسٹھ", "تریسٹھ", "چونسٹھ", "پینسٹھ", "چھیاسٹھ", "سڑسٹھ", "اڑسٹھ", "انہتر", "ستر", "اکہتر", "بہتر", "تہتر", "چوہتر", "پچھتر", "چھہتر", "ستتر", "اٹھہتر", "اناسی", "اسی", "اکیاسی", "بیاسی", "تراسی", "چوراسی", "پچاسی", "چھیاسی", "ستاسی", "اٹھاسی", "نواسی", "نوے", "اکانوے", "بانوے", "ترانوے", "چورانوے", "پچانوے", "چھیانوے", "ستانوے", "اٹھانوے", "ننانوے", "سو"];
export const urduWord = (n) => (Number.isInteger(n) && n >= 0 && n <= 100 ? WORDS[n] : String(n));
