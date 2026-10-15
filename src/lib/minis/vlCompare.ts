/** Versement libératoire ou barème : l'impôt dû à l'activité dans les deux cas, et le seuil de RFR. */
import type { MiniSpec } from '../mini-types';
import { micro, seuilVL } from '../engine/micro';
import { P } from '../engine/params';
import { T, eur, pct, actOpt, actDe, foyerOpt, foyerDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Versement libératoire ou barème ?', 'Flat-rate option or tax scale?'),
  cta: T(l, 'Voir le net complet', 'See full take-home'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 36000, unit: '€', max: 2000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }, { id: 'ar', label: T(l, 'Autres revenus imposables du foyer', 'Other taxable household income'), def: 0, unit: '€', max: 2000000 }, { id: 'f', label: T(l, 'Foyer fiscal', 'Tax household'), def: 0, options: foyerOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act); const fy = foyerDe(v.f);
    const b = micro({ ca: v.ca, activite, artisan, autres: v.ar, foyer: fy });
    const o = micro({ ca: v.ca, activite, artisan, autres: v.ar, foyer: fy, vl: true });
    const gain = b.ir - o.vl;
    return {
      head: [gain > 0 ? T(l, 'Le versement libératoire fait gagner', 'The flat-rate option saves') : T(l, 'Le barème fait gagner', 'The scale saves'), eur(Math.abs(gain), l)],
      rows: [[T(l, 'Impôt au barème dû à l’activité', 'Tax on the scale due to the business'), eur(b.ir, l)], [T(l, `Versement libératoire (${pct(P.micro.vl[activite], l)})`, `Flat-rate option (${pct(P.micro.vl[activite], l)})`), eur(o.vl, l)], [T(l, 'RFR 2024 maximal pour l’option en 2026', 'Max 2024 reference income for 2026'), eur(seuilVL(fy.parts), l)]],
    };
  },
});
