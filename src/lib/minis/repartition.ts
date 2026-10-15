/** Où vont les cotisations d'un auto-entrepreneur : retraite, santé, CSG-CRDS (répartition 2026). */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { P } from '../engine/params';
import { T, eur, pct, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ce que vos cotisations vous ouvrent comme droits', 'What your contributions pay for'),
  cta: T(l, 'Voir le net complet', 'See full take-home'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 30000, unit: '€', max: 2000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const m = micro({ ca: v.ca, activite, artisan });
    const r = P.micro.repartition[activite];
    return {
      head: [T(l, 'Part qui va à votre retraite', 'Share going to your pension'), pct(r.retraite_base + r.retraite_compl, l)],
      rows: [[T(l, 'Retraite de base', 'Basic pension'), eur(m.cotisations * r.retraite_base, l)], [T(l, 'Retraite complémentaire', 'Supplementary pension'), eur(m.cotisations * r.retraite_compl, l)], [T(l, 'Maladie, indemnités journalières', 'Health, sick pay'), eur(m.cotisations * r.maladie, l)], [T(l, 'Invalidité-décès', 'Disability and death'), eur(m.cotisations * r.invalidite, l)]],
      note: T(l, `CSG-CRDS : ${pct(r.csg_crds, l)} des cotisations, sans droit propre.`, `CSG-CRDS: ${pct(r.csg_crds, l)} of contributions, giving no rights of its own.`),
    };
  },
});
