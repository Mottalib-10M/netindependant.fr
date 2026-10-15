/** Acre : économie de cotisations selon la date de début d'activité (avant ou depuis le 1er juillet 2026). */
import type { MiniSpec } from '../mini-types';
import { micro, type Acre } from '../engine/micro';
import { P } from '../engine/params';
import { T, eur, pct, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ce que l’Acre vous fait économiser', 'What Acre relief saves you'),
  cta: T(l, 'Simuler avec l’Acre', 'Run the calculator with Acre'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires sur la période d’Acre', 'Turnover during the Acre period'), def: 24000, unit: '€', max: 2000000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 1, options: actOpt(l) }, { id: 'd', label: T(l, 'Début d’activité', 'Start date'), def: 1, options: [{ value: '0', label: T(l, 'Jusqu’au 30 juin 2026', 'Up to 30 June 2026') }, { value: '1', label: T(l, 'Depuis le 1er juillet 2026', 'From 1 July 2026') }] }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    const acre: Acre = v.d === 0 ? 'avant' : 'depuis';
    const s = micro({ ca: v.ca, activite, artisan }); const a = micro({ ca: v.ca, activite, artisan, acre });
    return {
      head: [T(l, 'Cotisations économisées', 'Contributions saved'), eur(s.cotisations - a.cotisations, l)],
      rows: [[T(l, 'Taux normal', 'Standard rate'), pct(s.taux, l)], [T(l, 'Taux avec l’Acre', 'Rate with Acre'), pct(a.taux, l)], [T(l, 'Cotisations avec l’Acre', 'Contributions with Acre'), eur(a.cotisations, l)]],
      note: T(l, `Jusqu’à la fin du 3e trimestre civil qui suit le début d’activité, sur demande dans les ${P.micro.acre.delai_demande_jours} jours.`, `Until the end of the third calendar quarter after you start, if you apply within ${P.micro.acre.delai_demande_jours} days.`),
    };
  },
});
