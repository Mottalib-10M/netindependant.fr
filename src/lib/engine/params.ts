/** Accès typé à params-2026.json : chaque valeur légale du site vit là, jamais dans les pages ni le code. */
import raw from '../../data/params-2026.json';

export type SourceKey = keyof typeof raw.sources;
export type Params = typeof raw;
export const P: Params = raw;
export const PASS = P.pass.annuel;
/** Arrondi à l'euro (les montants affichés), les calculs gardent les centimes. */
export const r0 = (x: number) => Math.round(x);
export const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
