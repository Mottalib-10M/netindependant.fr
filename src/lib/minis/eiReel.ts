/** Entreprise individuelle au réel : cotisations TNS 2026 sur le bénéfice et net avant et après impôt. */
import type { MiniSpec } from '../mini-types';
import { enEI } from '../engine/statuts';
import { eiReel } from '../engine/tns';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Votre net en entreprise individuelle au réel', 'Your take-home as a sole trader on real profit'),
  cta: T(l, 'Comparer avec la micro et les sociétés', 'Compare with micro and companies'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 80000, unit: '€', max: 5000000 }, { id: 'ch', label: T(l, 'Charges déductibles', 'Deductible expenses'), def: 20000, unit: '€', max: 5000000 }],
  run: (v) => {
    const r = eiReel(Math.max(0, v.ca - v.ch)); const o = enEI({ ca: v.ca, charges: v.ch, activite: 'bnc' });
    return {
      head: [T(l, 'Net par mois après impôt', 'Monthly take-home after tax'), eur(o.netMensuel, l)],
      rows: [[T(l, 'Bénéfice avant cotisations', 'Profit before contributions'), eur(r.brutSocial, l)], [T(l, 'Cotisations et CSG-CRDS', 'Contributions and CSG-CRDS'), eur(r.cotisations, l)], [T(l, 'Taux sur le bénéfice', 'Rate on profit'), pct(r.brutSocial > 0 ? r.cotisations / r.brutSocial : 0, l)], [T(l, 'Impôt (personne seule)', 'Income tax (single)'), eur(o.impotRevenu, l)]],
    };
  },
});
