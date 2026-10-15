/** Dividendes au prélèvement forfaitaire unique de 31,4 % : impôt, prélèvements sociaux, net. */
import type { MiniSpec } from '../mini-types';
import { pfu } from '../engine/societe';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Vos dividendes après flat tax', 'Your dividends after the flat tax'),
  cta: T(l, 'Optimiser salaire et dividendes', 'Optimise salary and dividends'),
  inputs: [{ id: 'd', label: T(l, 'Dividendes bruts versés', 'Gross dividends paid'), def: 20000, unit: '€', max: 10000000 }],
  run: (v) => {
    const r = pfu(v.d);
    return {
      head: [T(l, 'Dividendes nets', 'Net dividends'), eur(r.net, l)],
      rows: [[T(l, `Impôt (${pct(P.dividendes.pfu_ir, l)})`, `Income tax (${pct(P.dividendes.pfu_ir, l)})`), eur(r.ir, l)], [T(l, `Prélèvements sociaux (${pct(P.dividendes.prelevements_sociaux, l)})`, `Social levies (${pct(P.dividendes.prelevements_sociaux, l)})`), eur(r.ps, l)], [T(l, `Total (${pct(P.dividendes.pfu, l)})`, `Total (${pct(P.dividendes.pfu, l)})`), eur(r.total, l)]],
    };
  },
});
