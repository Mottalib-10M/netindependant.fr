/** Net mensuel par niveau de chiffre d'affaires pour une activité donnée (pages par activité). */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { T, eur, pct, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Votre activité en chiffres', 'Your activity in figures'),
  cta: T(l, 'Ajouter la CFE et l’impôt du foyer', 'Add CFE and household tax'),
  inputs: [{ id: 'act', label: T(l, 'Activité', 'Activity'), def: 0, options: actOpt(l) }, { id: 'ca', label: T(l, 'Chiffre d’affaires mensuel', 'Monthly turnover'), def: 4000, unit: '€', max: 200000 }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const m = micro({ ca: v.ca * 12, activite, artisan });
    return {
      head: [T(l, 'Net par mois, personne seule', 'Monthly take-home, single'), eur(m.netMensuel, l)],
      rows: [[T(l, 'Taux de cotisations', 'Contribution rate'), pct(m.taux, l)], [T(l, 'CFP + taxe de chambre par mois', 'Training + chamber levy a month'), eur((m.cfp + m.tfc) / 12, l)], [T(l, 'Impôt par mois', 'Income tax a month'), eur(m.ir / 12, l)], [T(l, 'Plafond annuel de l’activité', 'Annual ceiling for this activity'), eur(m.plafond, l)]],
    };
  },
});
