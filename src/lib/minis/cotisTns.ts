/** Cotisations d'un travailleur indépendant au réel (barème 2026 réformé) pour un revenu donné. */
import type { MiniSpec } from '../mini-types';
import { cotisationsTNS } from '../engine/tns';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Vos cotisations de TNS en 2026', 'Your self-employed (TNS) contributions in 2026'),
  cta: T(l, 'Comparer avec la SASU', 'Compare with a SASU'),
  inputs: [{ id: 'r', label: T(l, 'Revenu avant cotisations', 'Income before contributions'), def: 50000, unit: '€', max: 5000000 }],
  run: (v) => {
    const c = cotisationsTNS(v.r);
    return {
      head: [T(l, 'Total des cotisations', 'Total contributions'), eur(c.cotisations, l)],
      rows: [[T(l, 'Assiette après abattement', 'Base after allowance'), eur(c.assiette, l)], [T(l, 'Retraite (base + complémentaire)', 'Pension (basic + supplementary)'), eur(c.retraiteBase + c.retraiteCompl, l)], [T(l, 'Maladie, indemnités, invalidité', 'Health, sick pay, disability'), eur(c.maladie + c.ij + c.invalidite, l)], [T(l, 'CSG-CRDS', 'CSG-CRDS'), eur(c.csgCrds, l)], [T(l, 'Taux sur le revenu', 'Rate on income'), pct(v.r > 0 ? c.cotisations / v.r : 0, l)]],
    };
  },
});
