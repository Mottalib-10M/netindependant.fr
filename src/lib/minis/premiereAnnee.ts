/** Première année : plafond proratisé, fin de la période d'Acre, première déclaration, CFE. */
import type { MiniSpec } from '../mini-types';
import { plafondProrata } from '../engine/micro';
import { T, eur, num, type L } from './_kit';
const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export default (l: L): MiniSpec => ({
  title: T(l, 'Votre calendrier si vous démarrez en 2026', 'Your timeline if you start in 2026'),
  cta: T(l, 'Simuler votre net', 'Work out your take-home'),
  inputs: [{ id: 'm', label: T(l, 'Mois de début d’activité (2026)', 'Start month (2026)'), def: 9, options: MOIS_FR.map((x, i) => ({ value: String(i + 1), label: l === 'en' ? MOIS_EN[i] : x })) }, { id: 's', label: T(l, 'Activité', 'Activity'), def: 1, options: [{ value: '0', label: T(l, 'Vente', 'Sales') }, { value: '1', label: T(l, 'Services, libéral', 'Services, freelance') }] }],
  run: (v) => {
    const m = Math.max(1, Math.min(12, Math.round(v.m)));
    const jours = Math.round((Date.UTC(2027, 0, 1) - Date.UTC(2026, m - 1, 1)) / 86400000);
    const p = plafondProrata(v.s === 0 ? 'vente' : 'bnc', jours);
    // Fin de l'Acre : dernier jour du 3e trimestre civil suivant celui du début.
    const tDebut = Math.floor((m - 1) / 3);
    const tFin = tDebut + 3; const anFin = 2026 + Math.floor(tFin / 4); const moisFin = (tFin % 4) * 3 + 3;
    const finAcre = l === 'en' ? `${MOIS_EN[moisFin - 1]} ${anFin}` : `${MOIS_FR[moisFin - 1]} ${anFin}`;
    return {
      head: [T(l, 'Plafond de chiffre d’affaires 2026', '2026 turnover ceiling'), eur(p, l)],
      rows: [[T(l, 'Jours d’activité en 2026', 'Days trading in 2026'), num(jours, l)], [T(l, 'Acre éventuelle jusqu’à fin', 'Any Acre relief until end of'), finAcre], [T(l, 'CFE', 'CFE'), T(l, '0 € en 2026, base divisée par deux en 2027', '€0 in 2026, base halved in 2027')]],
    };
  },
});
