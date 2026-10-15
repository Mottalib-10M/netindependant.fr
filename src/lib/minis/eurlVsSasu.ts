/** EURL ou SASU pour un même bénéfice : net optimisé de chaque forme et écart. */
import type { MiniSpec } from '../mini-types';
import { enEURL, enSASU } from '../engine/statuts';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'EURL ou SASU avec votre chiffre d’affaires', 'EURL or SASU with your turnover'),
  cta: T(l, 'Comparer les cinq statuts', 'Compare all five legal forms'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 90000, unit: '€', max: 5000000 }, { id: 'ch', label: T(l, 'Charges de la société', 'Company expenses'), def: 6000, unit: '€', max: 5000000 }],
  run: (v) => {
    const i = { ca: v.ca, charges: v.ch, activite: 'bnc' as const };
    const e = enEURL(i), s = enSASU(i);
    return {
      head: [e.net >= s.net ? T(l, 'L’EURL laisse en plus par an', 'The EURL leaves extra a year') : T(l, 'La SASU laisse en plus par an', 'The SASU leaves extra a year'), eur(Math.abs(e.net - s.net), l)],
      rows: [[T(l, 'EURL, net par mois', 'EURL, monthly take-home'), eur(e.netMensuel, l)], [T(l, `EURL, part en rémunération`, 'EURL, share paid as salary'), pct(e.partRemuneration ?? 0, l, 0)], [T(l, 'SASU, net par mois', 'SASU, monthly take-home'), eur(s.netMensuel, l)], [T(l, 'SASU, part en rémunération', 'SASU, share paid as salary'), pct(s.partRemuneration ?? 0, l, 0)]],
    };
  },
});
