/** Chiffre d'affaires nécessaire pour atteindre un net mensuel voulu, selon l'activité. */
import type { MiniSpec } from '../mini-types';
import { micro } from '../engine/micro';
import { T, eur, actOpt, actDe, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Quel chiffre d’affaires pour vivre de votre activité ?', 'What turnover do you need to live on it?'),
  cta: T(l, 'Vérifier dans le simulateur', 'Check in the calculator'),
  inputs: [{ id: 'net', label: T(l, 'Net voulu par mois', 'Target take-home a month'), def: 2000, unit: '€', max: 50000 }, { id: 'act', label: T(l, 'Activité', 'Activity'), def: 3, options: actOpt(l) }],
  run: (v) => {
    const { activite, artisan } = actDe(v.act);
    let lo = 0, hi = Math.max(1000, v.net * 48);
    for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (micro({ ca: mid, activite, artisan }).netMensuel < v.net) lo = mid; else hi = mid; }
    const m = micro({ ca: hi, activite, artisan });
    return {
      head: [T(l, 'Chiffre d’affaires à encaisser par mois', 'Monthly turnover to bill'), eur(hi / 12, l)],
      rows: [[T(l, 'Par an', 'Per year'), eur(hi, l)], [T(l, 'Dont cotisations et taxes', 'Of which contributions and levies'), eur(m.cotisations + m.cfp + m.tfc, l)], [T(l, 'Dont impôt (personne seule)', 'Of which income tax (single)'), eur(m.ir, l)]],
      note: m.depassePlafond ? T(l, `Au-delà du plafond de ${eur(m.plafond, l)} : la micro ne suffit plus.`, `Above the ${eur(m.plafond, l)} ceiling: micro no longer fits.`) : undefined,
    };
  },
});
