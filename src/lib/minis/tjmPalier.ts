/** Un TJM donné (pages TJM) : CA, net en micro, en SASU et en portage pour un nombre de jours. */
import type { MiniSpec } from '../mini-types';
import { comparer } from '../engine/statuts';
import { T, eur, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ce TJM selon le statut', 'This day rate by legal form'),
  cta: T(l, 'Simulateur TJM complet', 'Full day-rate calculator'),
  inputs: [{ id: 'tjm', label: T(l, 'TJM hors taxe', 'Day rate before VAT'), def: 500, unit: '€', max: 10000 }, { id: 'j', label: T(l, 'Jours facturés par an', 'Days billed a year'), def: 200, max: 366 }],
  run: (v) => {
    const ca = v.tjm * Math.min(366, v.j);
    const r = comparer({ ca, charges: 0, activite: 'bnc', fraisPortage: 0.08 });
    return {
      head: [T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), eur(ca, l)],
      rows: [[T(l, 'Micro libérale, net par mois', 'Micro (BNC), monthly'), r.micro.possible ? eur(r.micro.netMensuel, l) : T(l, 'plafond dépassé', 'over the ceiling')], [T(l, 'EURL, net par mois', 'EURL, monthly'), eur(r.eurl.netMensuel, l)], [T(l, 'SASU, net par mois', 'SASU, monthly'), eur(r.sasu.netMensuel, l)], [T(l, 'Portage (frais de 8 %), net par mois', 'Umbrella (8% fee), monthly'), eur(r.portage.netMensuel, l)]],
    };
  },
});
