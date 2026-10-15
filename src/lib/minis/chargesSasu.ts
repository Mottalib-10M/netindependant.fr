/** Président de SASU : du salaire brut au net et au coût total, avec les taux 2026. */
import type { MiniSpec } from '../mini-types';
import { assimileDepuisBrut } from '../engine/assimile';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Charges sur le salaire du président', 'Charges on the president’s salary'),
  cta: T(l, 'Ajouter les dividendes', 'Add dividends'),
  inputs: [{ id: 'b', label: T(l, 'Salaire brut mensuel', 'Monthly gross salary'), def: 3000, unit: '€', max: 100000 }],
  run: (v) => {
    const a = assimileDepuisBrut(v.b * 12);
    return {
      head: [T(l, 'Net mensuel avant impôt', 'Monthly net before tax'), eur(a.net / 12, l)],
      rows: [[T(l, 'Coût total pour la société', 'Total cost to the company'), eur(a.cout / 12, l)], [T(l, 'Cotisations patronales', 'Employer contributions'), eur(a.employeur / 12, l)], [T(l, 'Cotisations salariales et CSG-CRDS', 'Employee contributions and CSG-CRDS'), eur((a.salarie + a.csgCrds) / 12, l)], [T(l, 'Net / coût total', 'Net / total cost'), pct(a.cout > 0 ? a.net / a.cout : 0, l)]],
    };
  },
});
