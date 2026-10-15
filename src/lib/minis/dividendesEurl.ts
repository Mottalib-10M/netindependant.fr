/** Dividendes d'un gérant majoritaire d'EURL : part soumise aux cotisations au-delà de 10 % du capital. */
import type { MiniSpec } from '../mini-types';
import { dividendesSoumisTNS, pfu } from '../engine/societe';
import { cotisationsTNS } from '../engine/tns';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Dividendes d’EURL : la part qui supporte des cotisations', 'EURL dividends: the part that bears contributions'),
  cta: T(l, 'Simuler une EURL', 'Model an EURL'),
  inputs: [{ id: 'd', label: T(l, 'Dividendes versés', 'Dividends paid'), def: 20000, unit: '€', max: 10000000 }, { id: 'k', label: T(l, 'Capital et comptes courants', 'Share capital and current account'), def: 5000, unit: '€', max: 10000000 }, { id: 'r', label: T(l, 'Rémunération du gérant (budget)', 'Manager pay (budget)'), def: 30000, unit: '€', max: 10000000 }],
  run: (v) => {
    const ds = dividendesSoumisTNS(v.d, v.k);
    const extra = cotisationsTNS(v.r + ds).cotisations - cotisationsTNS(v.r).cotisations;
    const p = pfu(v.d, ds);
    return {
      head: [T(l, 'Dividendes nets en poche', 'Net dividends in hand'), eur(v.d - p.total - extra, l)],
      rows: [[T(l, `Part au-delà de ${pct(P.dividendes.seuil_tns_capital, l, 0)} du capital`, `Part above ${pct(P.dividendes.seuil_tns_capital, l, 0)} of capital`), eur(ds, l)], [T(l, 'Cotisations sur cette part', 'Contributions on that part'), eur(extra, l)], [T(l, 'Impôt et prélèvements sociaux', 'Income tax and social levies'), eur(p.total, l)]],
    };
  },
});
