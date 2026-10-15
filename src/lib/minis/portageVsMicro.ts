/** Portage salarial ou micro-entreprise libérale pour un même TJM. */
import type { MiniSpec } from '../mini-types';
import { enPortage, enMicro } from '../engine/statuts';
import { T, eur, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Portage ou micro-entreprise pour votre TJM', 'Umbrella or micro-enterprise for your day rate'),
  cta: T(l, 'Simuler le portage en détail', 'Model umbrella employment in detail'),
  inputs: [{ id: 'tjm', label: T(l, 'TJM hors taxe', 'Day rate before VAT'), def: 400, unit: '€', max: 10000 }, { id: 'j', label: T(l, 'Jours facturés par an', 'Days billed a year'), def: 180, max: 366 }, { id: 'fg', label: T(l, 'Frais de gestion du portage', 'Umbrella fee'), def: 8, unit: '%', max: 30, decimals: 1 }],
  run: (v) => {
    const ca = v.tjm * Math.min(366, v.j);
    const p = enPortage({ ca, charges: 0, activite: 'bnc', fraisPortage: v.fg / 100 }), m = enMicro({ ca, charges: 0, activite: 'bnc' });
    return {
      head: [T(l, 'Écart par mois', 'Monthly gap'), eur(Math.abs(m.netMensuel - p.netMensuel), l)],
      rows: [[T(l, 'Portage, net par mois', 'Umbrella, monthly'), eur(p.netMensuel, l)], [T(l, 'Micro libérale, net par mois', 'Micro (BNC), monthly'), m.possible ? eur(m.netMensuel, l) : T(l, 'plafond dépassé', 'over the ceiling')], [T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), eur(ca, l)]],
      note: T(l, 'Le portage ouvre des droits au chômage et cotise davantage pour la retraite.', 'Umbrella employment gives unemployment rights and pays more into pensions.'),
    };
  },
});
