/** Plafond de chiffre d'affaires de la micro-entreprise, proratisé l'année de création. */
import type { MiniSpec } from '../mini-types';
import { plafondProrata, plafondCA } from '../engine/micro';
import { T, eur, num, type L } from './_kit';
const mois = (l: L) => Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(Date.UTC(2026, i, 1)).toLocaleDateString(l === 'en' ? 'en-GB' : 'fr-FR', { month: 'long', timeZone: 'UTC' }) }));
export default (l: L): MiniSpec => ({
  title: T(l, 'Votre plafond la première année', 'Your ceiling in the first year'),
  cta: T(l, 'Calculer le net avec ce chiffre d’affaires', 'Work out take-home on this turnover'),
  inputs: [{ id: 'm', label: T(l, 'Début d’activité en 2026 (le 1er du mois)', 'Start in 2026 (1st of the month)'), def: 3, options: mois(l) }, { id: 's', label: T(l, 'Activité', 'Activity'), def: 1, options: [{ value: '0', label: T(l, 'Vente de marchandises', 'Selling goods') }, { value: '1', label: T(l, 'Services, libéral', 'Services, freelance') }] }],
  run: (v) => {
    const a = v.s === 0 ? 'vente' : 'bnc';
    const debut = Date.UTC(2026, Math.max(1, Math.min(12, Math.round(v.m))) - 1, 1);
    const jours = Math.round((Date.UTC(2027, 0, 1) - debut) / 86400000);
    const p = plafondProrata(a, jours);
    return {
      head: [T(l, 'Plafond proratisé 2026', 'Pro-rated 2026 ceiling'), eur(p, l)],
      rows: [[T(l, 'Plafond annuel', 'Annual ceiling'), eur(plafondCA(a), l)], [T(l, 'Jours d’activité en 2026', 'Days trading in 2026'), num(jours, l)], [T(l, 'Par mois d’activité', 'Per month trading'), eur(p / (jours / 30.4167), l)]],
      note: T(l, 'Calcul : plafond × jours d’activité ÷ 365 (service-public, fiche F32353).', 'Rule: ceiling × days trading ÷ 365 (service-public, sheet F32353).'),
    };
  },
});
