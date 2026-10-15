/** TJM × jours facturés : chiffre d'affaires, plafond micro et net en micro libérale. */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { P } from '../engine/params';
import { T, eur, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Votre TJM transformé en revenu', 'Your day rate turned into income'),
  cta: T(l, 'Comparer les statuts pour ce TJM', 'Compare legal forms for this rate'),
  inputs: [{ id: 'tjm', label: T(l, 'TJM hors taxe', 'Day rate before VAT'), def: 450, unit: '€', max: 10000 }, { id: 'j', label: T(l, 'Jours facturés par an', 'Days billed a year'), def: 200, max: 366 }],
  run: (v) => {
    const ca = v.tjm * Math.min(366, v.j);
    const m = micro({ ca, activite: 'bnc' });
    return {
      head: [T(l, 'Net par mois en micro libérale', 'Monthly take-home, micro (BNC)'), m.depassePlafond ? T(l, 'plafond dépassé', 'over the ceiling') : eur(m.netMensuel, l)],
      rows: [[T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), eur(ca, l)], [T(l, 'Jours avant le plafond micro', 'Days before the micro ceiling'), num(v.tjm > 0 ? Math.floor(P.micro.plafonds.services / v.tjm) : 0, l)], [T(l, 'Jours avant la TVA', 'Days before VAT applies'), num(v.tjm > 0 ? Math.floor(P.tva.services.seuil / v.tjm) : 0, l)]],
    };
  },
});
