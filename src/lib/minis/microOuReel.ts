/** Micro-entreprise ou entreprise individuelle au réel : à partir de quels frais réels le réel rapporte plus. */
import type { MiniSpec } from '../mini-types';
import { enMicro, enEI } from '../engine/statuts';
import { T, eur, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Micro ou réel avec vos frais', 'Micro or real profit with your expenses'),
  cta: T(l, 'Comparer tous les statuts', 'Compare all legal forms'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 60000, unit: '€', max: 2000000 }, { id: 'ch', label: T(l, 'Frais réels annuels', 'Actual annual expenses'), def: 15000, unit: '€', max: 2000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const i = { ca: v.ca, charges: v.ch, activite, artisan };
    const m = enMicro(i), e = enEI(i);
    const mieux = e.net > m.net;
    return {
      head: [mieux ? T(l, 'Le réel rapporte en plus', 'Real profit leaves extra') : T(l, 'La micro rapporte en plus', 'Micro leaves extra'), eur(Math.abs(e.net - m.net), l)],
      rows: [[T(l, 'Net micro-entreprise', 'Micro-enterprise take-home'), eur(m.net, l)], [T(l, 'Net EI au réel', 'Real-profit EI take-home'), eur(e.net, l)], [T(l, 'Cotisations au réel', 'Contributions on real profit'), eur(e.cotisations, l)]],
      note: T(l, 'Hors frais de comptabilité du réel, à retrancher de son net.', 'Excludes bookkeeping costs on real profit, to deduct from its figure.'),
    };
  },
});
