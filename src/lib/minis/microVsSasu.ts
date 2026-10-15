/** Micro-entreprise ou SASU : net de chaque statut et seuil où la SASU passe devant. */
import type { MiniSpec } from '../mini-types';
import { enMicro, enSASU } from '../engine/statuts';
import { T, eur, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Micro-entreprise ou SASU ?', 'Micro-enterprise or SASU?'),
  cta: T(l, 'Comparer tous les statuts', 'Compare all legal forms'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 60000, unit: '€', max: 5000000 }, { id: 'ch', label: T(l, 'Frais réels', 'Actual expenses'), def: 5000, unit: '€', max: 5000000 }, { id: 'fs', label: T(l, 'Frais de société (comptable…)', 'Company running costs'), def: 0, unit: '€', max: 100000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const m = enMicro({ ca: v.ca, charges: v.ch, activite, artisan }), s = enSASU({ ca: v.ca, charges: v.ch + v.fs, activite, artisan });
    return {
      head: [T(l, 'Écart par mois', 'Monthly gap'), eur(Math.abs(m.netMensuel - s.netMensuel), l)],
      rows: [[T(l, 'Micro-entreprise, net par mois', 'Micro-enterprise, monthly'), m.possible ? eur(m.netMensuel, l) : T(l, 'plafond dépassé', 'over the ceiling')], [T(l, 'SASU, net par mois', 'SASU, monthly'), eur(s.netMensuel, l)], [T(l, 'Le plus favorable', 'Better option'), !m.possible || s.net > m.net ? 'SASU' : T(l, 'Micro-entreprise', 'Micro-enterprise')]],
    };
  },
});
