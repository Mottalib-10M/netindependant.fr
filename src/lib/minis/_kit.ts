/** Outils communs des mini-simulateurs (ignoré par le registre : préfixe « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
export type L = 'fr' | 'en';
export const T = <A>(l: L, fr: A, en: A) => (l === 'en' ? en : fr);
export const eur = (x: number, l: L, d?: number) => formatMoney(x, d ?? 0, l);
export const pct = (x: number, l: L, d = 1) => formatPercent(x, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
export const ouiNon = (l: L) => [{ value: '0', label: T(l, 'Non', 'No') }, { value: '1', label: T(l, 'Oui', 'Yes') }];
/** Activités de la micro-entreprise, codées 0 à 4 (les mini-simulateurs ne manipulent que des nombres). */
export const ACT = ['vente', 'bic', 'bic', 'bnc', 'cipav'] as const;
export const actOpt = (l: L) => [
  { value: '0', label: T(l, 'Vente de marchandises', 'Selling goods') },
  { value: '1', label: T(l, 'Services commerciaux (BIC)', 'Commercial services (BIC)') },
  { value: '2', label: T(l, 'Artisanat (BIC)', 'Skilled trade (BIC)') },
  { value: '3', label: T(l, 'Profession libérale (BNC)', 'Freelance profession (BNC)') },
  { value: '4', label: T(l, 'Libéral relevant de la Cipav', 'Cipav-regulated profession') },
];
export const actDe = (v: number) => ({ activite: ACT[Math.max(0, Math.min(4, Math.round(v)))], artisan: Math.round(v) === 2 });
/** Foyers fiscaux proposés, codés 0 à 4. */
export const FOYERS = [{ parts: 1, couple: false }, { parts: 2, couple: true }, { parts: 2.5, couple: true }, { parts: 3, couple: true }, { parts: 4, couple: true }];
export const foyerOpt = (l: L) => [
  { value: '0', label: T(l, 'Seul(e), 1 part', 'Single, 1 share') },
  { value: '1', label: T(l, 'Couple, 2 parts', 'Couple, 2 shares') },
  { value: '2', label: T(l, 'Couple, 1 enfant', 'Couple, 1 child') },
  { value: '3', label: T(l, 'Couple, 2 enfants', 'Couple, 2 children') },
  { value: '4', label: T(l, 'Couple, 3 enfants', 'Couple, 3 children') },
];
export const foyerDe = (v: number) => FOYERS[Math.max(0, Math.min(4, Math.round(v)))];
export type Rows = [string, string][];
