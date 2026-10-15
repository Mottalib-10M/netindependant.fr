/** SASU : net selon la part du bénéfice versée en salaire, et le partage optimal. */
import type { MiniSpec } from '../mini-types';
import { sasuPart, enSASU } from '../engine/statuts';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Salaire ou dividendes en SASU', 'Salary or dividends in a SASU'),
  cta: T(l, 'Ouvrir le simulateur SASU', 'Open the SASU calculator'),
  inputs: [{ id: 'b', label: T(l, 'Bénéfice avant rémunération', 'Profit before director pay'), def: 80000, unit: '€', max: 5000000 }, { id: 'p', label: T(l, 'Part versée en salaire', 'Share paid as salary'), def: 50, unit: '%', max: 100 }],
  run: (v) => {
    const i = { ca: v.b, charges: 0, activite: 'bnc' as const };
    const o = sasuPart(i, Math.min(100, Math.max(0, v.p)) / 100); const best = enSASU(i);
    return {
      head: [T(l, 'Net par an avec ce partage', 'Yearly take-home with this split'), eur(o.net, l)],
      rows: [[T(l, 'Salaire net', 'Net salary'), eur(o.remunerationNette, l)], [T(l, 'Dividendes nets', 'Net dividends'), eur(o.dividendesNets, l)], [T(l, 'Meilleur partage', 'Best split'), pct(best.partRemuneration ?? 0, l, 0)], [T(l, 'Net au meilleur partage', 'Take-home at best split'), eur(best.net, l)]],
    };
  },
});
