/** Impôt sur les sociétés 2026 : taux réduit de 15 % jusqu'à 42 500 €, 25 % au-delà. */
import type { MiniSpec } from '../mini-types';
import { impotSocietes } from '../engine/societe';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'L’impôt sur les sociétés de votre bénéfice', 'Corporate tax on your profit'),
  cta: T(l, 'Simuler une SASU', 'Model a SASU'),
  inputs: [{ id: 'b', label: T(l, 'Bénéfice imposable', 'Taxable profit'), def: 60000, unit: '€', max: 100000000 }],
  run: (v) => {
    const r = impotSocietes(v.b);
    return {
      head: [T(l, 'Impôt sur les sociétés', 'Corporate tax'), eur(r.is, l)],
      rows: [[T(l, `À ${pct(P.is.taux_reduit, l, 0)} jusqu’à ${eur(P.is.seuil_reduit, l)}`, `At ${pct(P.is.taux_reduit, l, 0)} up to ${eur(P.is.seuil_reduit, l)}`), eur(r.reduit, l)], [T(l, `À ${pct(P.is.taux_normal, l, 0)} au-delà`, `At ${pct(P.is.taux_normal, l, 0)} above`), eur(r.normal, l)], [T(l, 'Taux moyen', 'Average rate'), pct(v.b > 0 ? r.is / v.b : 0, l)], [T(l, 'Bénéfice après impôt', 'Profit after tax'), eur(Math.max(0, v.b) - r.is, l)]],
    };
  },
});
