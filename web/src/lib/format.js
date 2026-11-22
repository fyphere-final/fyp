const URDU_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Western digits -> Urdu (Extended Arabic-Indic) digits, matching the mockups. */
export const urduNum = (n) => String(n).replace(/\d/g, (d) => URDU_DIGITS[d]);
export const pct = (n) => `${urduNum(Math.round(n ?? 0))}٪`;

export function formatDate(iso) {
  try {
    const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
    return d.toLocaleDateString('ur-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}
export const OPTION_LETTERS = ['ا', 'ب', 'ج', 'د', 'ہ', 'و'];
