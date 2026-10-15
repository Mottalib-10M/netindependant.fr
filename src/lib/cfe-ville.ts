/** Statistiques de CFE d'une grande ville dans son département (pages par ville, lecture au build). */
import villes from '../data/cfe-villes.json';
import { communesDep } from './cfe-data';
import { cfe } from './engine/cfe';

export interface TrancheVille { base: number | null; total: number; rang: number; nb: number; moins: { n: string; total: number }; plus: { n: string; total: number } }
export interface StatsVille { c: string; n: string; dep: string; t: number; parts: Record<string, number>; b: Array<number | null>; tranches: TrancheVille[]; nbCommunes: number }

export function statsVille(code: string): StatsVille {
  const v = villes.villes.find((x) => x.c === code);
  if (!v) throw new Error(`Ville ${code} absente de src/data/cfe-villes.json`);
  const dep = communesDep(v.dep);
  const tranches = v.b.map((base, k) => {
    const liste = dep.filter((x) => x.b[k] != null).map((x) => ({ n: x.n, total: cfe(k === 0 ? 8000 : [10001, 32601, 100001, 250001, 500001][k - 1], x.t, x.b).total })).sort((a, b) => a.total - b.total);
    const ca = k === 0 ? 8000 : [10001, 32601, 100001, 250001, 500001][k - 1];
    const total = base != null ? cfe(ca, v.t, v.b).total : 0;
    return { base, total, rang: liste.findIndex((x) => x.n === v.n) + 1, nb: liste.length, moins: liste[0], plus: liste[liste.length - 1] };
  });
  return { c: v.c, n: v.n, dep: v.dep, t: v.t, parts: v.parts, b: v.b, tranches, nbCommunes: dep.length };
}

import type { Helpers } from './guide-types';
import { P } from './engine/params';
/** Tableau des six tranches pour une ville (données ; exclu de la mesure d'unicité). */
export function tableauTranches(h: Helpers, s: StatsVille): string {
  const fr = h.lang === 'fr';
  const t = P.cfe.tranches_ca;
  const lib = [fr ? `jusqu’à ${h.eur(t[0])}` : `up to ${h.eur(t[0])}`, `${h.eur(t[0] + 1)} – ${h.eur(t[1])}`, `${h.eur(t[1] + 1)} – ${h.eur(t[2])}`, `${h.eur(t[2] + 1)} – ${h.eur(t[3])}`, `${h.eur(t[3] + 1)} – ${h.eur(t[4])}`, fr ? `plus de ${h.eur(t[4])}` : `over ${h.eur(t[4])}`];
  return h.table(
    fr ? ['Chiffre d’affaires N-2', 'Base minimum', 'CFE annuelle', 'Rang dans le département'] : ['Turnover two years earlier', 'Minimum base', 'Annual CFE', 'Rank in the département'],
    s.tranches.map((x, k) => [lib[k], x.base != null ? h.eur(x.base) : '–', x.base != null ? h.eur(x.total) : '–', x.nb > 1 ? `${h.num(x.rang)} / ${h.num(x.nb)}` : '–']),
    fr ? `CFE de ${s.n} sans local, troisième année et suivantes, taux et bases votés pour ${P.cfe.millesime_taux} (rang 1 = la moins chère)` : `CFE in ${s.n} with no premises, year three onwards, rates and bases set for ${P.cfe.millesime_taux} (rank 1 = cheapest)`,
    ['l', 'r', 'r', 'r'],
  );
}
