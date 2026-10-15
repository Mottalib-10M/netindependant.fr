/** Déclaration mensuelle ou trimestrielle : ce qu'il faut payer à l'Urssaf pour le CA déclaré. */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { T, eur, actOpt, actDe, ouiNon, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ce que vous paierez pour cette déclaration', 'What you will pay for this return'),
  cta: T(l, 'Simuler l’année entière', 'Work out the whole year'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires encaissé sur la période', 'Turnover received in the period'), def: 9000, unit: '€', max: 1000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }, { id: 'vl', label: T(l, 'Versement libératoire', 'Flat-rate income tax'), def: 0, options: ouiNon(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const m = micro({ ca: v.ca, activite, artisan, vl: v.vl === 1 });
    const total = m.cotisations + m.cfp + m.tfc + m.vl;
    return {
      head: [T(l, 'À payer à l’Urssaf', 'Due to the Urssaf'), eur(total, l)],
      rows: [[T(l, 'Cotisations sociales', 'Social contributions'), eur(m.cotisations, l)], [T(l, 'CFP et taxe de chambre', 'Training and chamber levies'), eur(m.cfp + m.tfc, l)], [T(l, 'Versement libératoire', 'Flat-rate income tax'), eur(m.vl, l)]],
      note: T(l, 'Chiffre d’affaires nul : rien à payer, mais la déclaration reste due.', 'Zero turnover: nothing to pay, but you must still file.'),
    };
  },
});
