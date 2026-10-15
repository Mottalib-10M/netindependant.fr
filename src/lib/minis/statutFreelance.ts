/** Statut freelance : le meilleur net parmi micro, EI, EURL, SASU et portage pour un CA. */
import type { MiniSpec } from '../mini-types';
import { comparer, STATUTS } from '../engine/statuts';
import { T, eur, type L } from './_kit';
const NOM = { micro: ['Micro-entreprise', 'Micro-enterprise'], ei: ['EI au réel', 'EI, real profit'], eurl: ['EURL', 'EURL'], sasu: ['SASU', 'SASU'], portage: ['Portage', 'Umbrella'] } as const;
export default (l: L): MiniSpec => ({
  title: T(l, 'Le statut qui vous laisse le plus', 'The legal form that leaves you the most'),
  cta: T(l, 'Ouvrir le comparateur complet', 'Open the full comparison'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires annuel', 'Annual turnover'), def: 65000, unit: '€', max: 5000000 }, { id: 'ch', label: T(l, 'Frais professionnels', 'Business expenses'), def: 4000, unit: '€', max: 5000000 }],
  run: (v) => {
    const r = comparer({ ca: v.ca, charges: v.ch, activite: 'bnc' });
    const ok = STATUTS.filter((s) => r[s].possible).sort((a, b) => r[b].net - r[a].net);
    const n = (s: (typeof STATUTS)[number]) => (l === 'en' ? NOM[s][1] : NOM[s][0]);
    return {
      head: [T(l, `En tête : ${n(ok[0])}`, `Top: ${n(ok[0])}`), eur(r[ok[0]].netMensuel, l)],
      rows: ok.slice(1).map((s) => [n(s), eur(r[s].netMensuel, l)] as [string, string]),
      note: T(l, 'Net par mois, personne seule, frais de comptabilité d’une société non compris.', 'Monthly take-home, single, company accounting costs not included.'),
    };
  },
});
