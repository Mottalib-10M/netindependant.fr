/** Net d'un auto-entrepreneur pour un CA et une activité (cotisations, CFP, taxe de chambre, impôt au barème). */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { T, eur, pct, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Votre net en micro-entreprise', 'Your take-home as a micro-entrepreneur'),
  cta: T(l, 'Ajouter la CFE de votre commune', 'Add your commune’s CFE'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 40000, unit: '€', max: 2000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const m = micro({ ca: v.ca, activite, artisan });
    return {
      head: [T(l, 'Net par mois, avant CFE', 'Monthly take-home, before CFE'), eur(m.netMensuel, l)],
      rows: [[T(l, `Cotisations (${pct(m.taux, l)})`, `Contributions (${pct(m.taux, l)})`), eur(m.cotisations, l)], [T(l, 'CFP et taxe de chambre', 'Training and chamber levies'), eur(m.cfp + m.tfc, l)], [T(l, 'Impôt (personne seule)', 'Income tax (single)'), eur(m.ir, l)], [T(l, 'Net sur l’année', 'Net for the year'), eur(m.net, l)]],
      note: m.depassePlafond ? T(l, `Plafond de ${eur(m.plafond, l)} dépassé.`, `Above the ${eur(m.plafond, l)} ceiling.`) : undefined,
    };
  },
});
