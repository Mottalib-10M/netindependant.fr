/** Cotisations d'un auto-entrepreneur, ventilées par risque (répartition 2026, décret n° 2025-943). */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { P } from '../engine/params';
import { T, eur, pct, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Vos cotisations et ce qu’elles financent', 'Your contributions and what they fund'),
  cta: T(l, 'Voir le net complet', 'See full take-home'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires du mois', 'Turnover this month'), def: 3000, unit: '€', max: 500000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const m = micro({ ca: v.ca, activite, artisan });
    const r = P.micro.repartition[activite];
    return {
      head: [T(l, `Cotisations du mois (${pct(m.taux, l)})`, `Contributions this month (${pct(m.taux, l)})`), eur(m.cotisations, l)],
      rows: [[T(l, 'Retraite de base et complémentaire', 'Basic and supplementary pension'), eur(m.cotisations * (r.retraite_base + r.retraite_compl), l)], [T(l, 'CSG-CRDS', 'CSG-CRDS levies'), eur(m.cotisations * r.csg_crds, l)], [T(l, 'Maladie, invalidité-décès', 'Health, disability and death'), eur(m.cotisations * (r.maladie + r.invalidite), l)], [T(l, 'En plus : CFP et taxe de chambre', 'On top: training and chamber levies'), eur(m.cfp + m.tfc, l)]],
    };
  },
});
