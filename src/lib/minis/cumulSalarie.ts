/** Auto-entrepreneur et salarié : ce que l'activité ajoute au revenu, impôt du foyer compris. */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { T, eur, pct, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ce que l’activité ajoute à votre salaire', 'What the side business adds to your salary'),
  cta: T(l, 'Simulation complète', 'Full calculation'),
  inputs: [{ id: 'sal', label: T(l, 'Salaire net imposable annuel', 'Annual taxable salary'), def: 30000, unit: '€', max: 2000000 }, { id: 'ca', label: T(l, 'Chiffre d’affaires de l’activité', 'Side-business turnover'), def: 12000, unit: '€', max: 2000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const m = micro({ ca: v.ca, activite, artisan, autres: v.sal });
    const vl = micro({ ca: v.ca, activite, artisan, autres: v.sal, vl: true });
    return {
      head: [T(l, 'Gain net par mois', 'Extra take-home a month'), eur(m.netMensuel, l)],
      rows: [[T(l, 'Cotisations de l’activité', 'Business contributions'), eur(m.cotisations + m.cfp + m.tfc, l)], [T(l, 'Impôt en plus pour le foyer', 'Extra household tax'), eur(m.ir, l)], [T(l, 'Avec le versement libératoire', 'With the flat-rate option'), eur(vl.vl, l)], [T(l, 'Ce qui reste du chiffre d’affaires', 'Share of turnover kept'), pct(v.ca > 0 ? m.net / v.ca : 0, l, 0)]],
    };
  },
});
