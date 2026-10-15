/**
 * Format des nombres hors de `body(h)` : paragraphe citable, FAQ. Toute valeur légale vient de P, tout
 * exemple chiffré du moteur, et s'écrit par ces formateurs (RECETTE §4.1, §17.4).
 */
import { formatMoney, formatNumber, formatPercent } from './format';
export { P } from './engine/params';
const mk = (l: 'fr' | 'en') => ({
  eur: (n: number, d = 0) => formatMoney(n, d, l),
  num: (n: number, d = 0) => formatNumber(n, d, l),
  pct: (x: number, d = 1) => formatPercent(x, d, l),
});
export const FR = mk('fr');
export const EN = mk('en');
