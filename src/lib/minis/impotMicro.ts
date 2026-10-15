/** Impôt sur le revenu dû à une micro-entreprise : abattement, barème du foyer, taux marginal. */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { impotRevenu } from '../engine/ir';
import { T, eur, pct, actOpt, actDe, foyerOpt, foyerDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'L’impôt sur votre activité', 'Income tax on your business'),
  cta: T(l, 'Voir le net complet', 'See full take-home'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 50000, unit: '€', max: 2000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }, { id: 'ar', label: T(l, 'Autres revenus imposables du foyer', 'Other taxable household income'), def: 0, unit: '€', max: 2000000 }, { id: 'f', label: T(l, 'Foyer fiscal', 'Tax household'), def: 0, options: foyerOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act); const fy = foyerDe(v.f);
    const m = micro({ ca: v.ca, activite, artisan, autres: v.ar, foyer: fy });
    const tot = impotRevenu(v.ar + m.revenuAbattu, fy);
    return {
      head: [T(l, 'Impôt dû à l’activité', 'Tax due to the business'), eur(m.ir, l)],
      rows: [[T(l, 'Abattement forfaitaire', 'Flat allowance'), eur(m.abattement, l)], [T(l, 'Revenu imposable de l’activité', 'Taxable business income'), eur(m.revenuAbattu, l)], [T(l, 'Taux marginal du foyer', 'Household marginal rate'), pct(tot.tmi, l, 0)], [T(l, 'Part du chiffre d’affaires', 'Share of turnover'), pct(v.ca > 0 ? m.ir / v.ca : 0, l)]],
    };
  },
});
