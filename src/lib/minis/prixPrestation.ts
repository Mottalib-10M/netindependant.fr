/** Prix à facturer pour obtenir un net voulu sur une prestation, en micro libérale ou commerciale. */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Le prix à facturer pour garder un net voulu', 'The price to charge to keep a target net'),
  cta: T(l, 'Simuler l’année', 'Work out the year'),
  inputs: [{ id: 'net', label: T(l, 'Net voulu sur la prestation', 'Target net on the job'), def: 1000, unit: '€', max: 1000000 }, { id: 's', label: T(l, 'Nature de la prestation', 'Type of service'), def: 1, options: [{ value: '0', label: T(l, 'Service commercial ou artisanal (BIC)', 'Commercial or craft service (BIC)') }, { value: '1', label: T(l, 'Prestation libérale (BNC)', 'Freelance professional service (BNC)') }] }],
  run: (v) => {
    const a = v.s === 0 ? 'bic' : 'bnc';
    const m = micro({ ca: 1, activite: a });
    const taux = m.taux + (m.cfp + m.tfc);
    const prix = v.net / (1 - taux);
    return {
      head: [T(l, 'Prix hors taxe à facturer', 'Price to charge before VAT'), eur(prix, l)],
      rows: [[T(l, 'Cotisations, CFP et taxe incluses', 'Contributions and levies included'), pct(taux, l)], [T(l, 'Part prélevée sur la prestation', 'Amount taken on the job'), eur(prix - v.net, l)]],
      note: T(l, 'Avant impôt sur le revenu, qui dépend de votre foyer.', 'Before income tax, which depends on your household.'),
    };
  },
});
