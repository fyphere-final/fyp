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
