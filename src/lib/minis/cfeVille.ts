/** CFE dans six grandes villes (fichier REI 2025) pour un chiffre d'affaires et une année d'activité. */
import type { MiniSpec } from '../mini-types';
import villes from '../../data/cfe-villes.json';
import { cfe } from '../engine/cfe';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'La CFE dans votre grande ville', 'The CFE in your city'),
  cta: T(l, 'Toutes les communes de France', 'Every commune in France'),
  inputs: [
    { id: 'v', label: T(l, 'Ville', 'City'), def: 0, options: villes.villes.map((x, i) => ({ value: String(i), label: x.n })) },
    { id: 'ca', label: T(l, 'Chiffre d’affaires deux ans plus tôt', 'Turnover two years earlier'), def: 25000, unit: '€', max: 10000000 },
    { id: 'an', label: T(l, 'Année d’activité', 'Year of activity'), def: 3, options: [{ value: '1', label: T(l, 'Création', 'Start-up year') }, { value: '2', label: T(l, 'Deuxième année', 'Second year') }, { value: '3', label: T(l, 'Ensuite', 'Later years') }] },
  ],
  run: (v) => {
    const x = villes.villes[Math.max(0, Math.min(villes.villes.length - 1, Math.round(v.v)))];
    const r = cfe(v.ca, x.t, x.b, Math.round(v.an));
    return {
      head: [T(l, `CFE à ${x.n}`, `CFE in ${x.n}`), eur(r.total, l)],
      rows: [[T(l, 'Base minimum retenue', 'Minimum base used'), eur(r.base ?? 0, l)], [T(l, 'Taux global', 'Overall rate'), pct(x.t, l, 2)], [T(l, 'Taxe CCI et frais', 'CCI surcharge and fees'), eur(r.taxeCci + r.frais, l)]],
      note: r.exoneree ? T(l, 'Exonération : année de création ou chiffre d’affaires trop faible.', 'Exempt: start-up year or turnover too low.') : undefined,
    };
  },
});
