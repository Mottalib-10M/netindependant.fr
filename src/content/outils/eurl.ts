import { defineGuide } from '../../lib/guide-types';
import { enEURL, eurlPart, enEI } from '../../lib/engine/statuts';
import { cotisationsTNS } from '../../lib/engine/tns';
import { P, FR, EN } from '../../lib/fmt';

const i = { ca: 90000, charges: 6000, activite: 'bnc' as const };
const best = enEURL(i), tout = eurlPart(i, 1), ir = enEI(i);
const t40 = cotisationsTNS(40000);

export default defineGuide({
  id: 'eurl',
  group: 'statuts',
  order: 30,
  tool: 'eurl',
  related: ['cotisations-tns', 'dividendes-eurl', 'eurl-ou-sasu', 'entrepreneur-individuel', 'impot-sur-les-societes'],
  sources: ['urssafTauxAC', 'urssafReforme', 'decret2024688', 'spIs', 'spDividendes'],
  fr: {
    slug: 'eurl',
    nav: 'EURL : simulateur du gérant',
    card: 'Rémunération TNS, dividendes au-delà de 10 %, IS.',
    title: 'EURL 2026 : simulateur de rémunération du gérant majoritaire',
    description: 'EURL 2026 : net du gérant majoritaire, cotisations TNS après abattement de 26 %, impôt sur les sociétés, dividendes au-delà de 10 % du capital, partage optimal.',
    h1: 'EURL : ce qui reste au gérant en 2026',
    intro: 'Le simulateur partage le bénéfice entre rémunération et dividendes et applique le barème des indépendants réformé en 2026.',
    resume: `Le gérant associé unique d’une EURL est travailleur indépendant : ses cotisations se calculent, depuis la réforme appliquée en 2026, sur sa rémunération augmentée des cotisations prises en charge par la société, diminuée d’un abattement forfaitaire de ${FR.pct(P.tns.abattement, 0)}. Pour ${FR.eur(40000)} de rémunération brute ainsi définie, l’assiette est de ${FR.eur(t40.assiette)} et les cotisations atteignent ${FR.eur(t40.cotisations)}, CSG-CRDS comprise. À l’impôt sur les sociétés, le bénéfice restant est taxé à ${FR.pct(P.is.taux_reduit, 0)} jusqu’à ${FR.eur(P.is.seuil_reduit)}, puis ${FR.pct(P.is.taux_normal, 0)} ; les dividendes qui dépassent ${FR.pct(P.dividendes.seuil_tns_capital, 0)} du capital et des comptes courants supportent les mêmes cotisations, ce qui rend la distribution peu intéressante avec un petit capital. Pour ${FR.eur(90000)} de chiffre d’affaires et ${FR.eur(6000)} de charges, le meilleur partage laisse ${FR.eur(best.net)} par an, contre ${FR.eur(ir.net)} en restant à l’impôt sur le revenu, comme une entreprise individuelle.`,
    faqs: [
      { q: 'Pourquoi les dividendes d’une EURL sont-ils peu intéressants ?', a: `Parce que la part qui dépasse ${FR.pct(P.dividendes.seuil_tns_capital, 0)} du capital social, des primes d’émission et des comptes courants d’associé est soumise aux cotisations de travailleur indépendant, en plus de l’impôt. Avec un capital de ${FR.eur(1000)}, presque tout le dividende est concerné. Un capital plus élevé ou des apports en compte courant augmentent la part qui n’y est pas soumise.` },
      { q: 'L’EURL à l’impôt sur le revenu, c’est comme une entreprise individuelle ?', a: `Pour le calcul, oui : le bénéfice est imposé au nom du gérant et les cotisations portent sur ce bénéfice, comme en EI au réel. Pour ${FR.eur(90000)} de chiffre d’affaires et ${FR.eur(6000)} de charges, cela laisse ${FR.eur(ir.net)} par an. L’option pour l’impôt sur les sociétés change le calcul, ce que fait ce simulateur.` },
      { q: 'Qu’a changé la réforme de 2026 pour un gérant d’EURL ?', a: `Les cotisations et la CSG-CRDS se calculent désormais sur une seule assiette : le revenu brut, cotisations non déduites, moins un abattement de ${FR.pct(P.tns.abattement, 0)}. Les taux ont été relevés en parallèle : maladie jusqu’à ${FR.pct(P.tns.maladie.points[P.tns.maladie.points.length - 1][1])}, retraite complémentaire à ${FR.pct(P.tns.retraite_compl.t1)}. Selon l’Urssaf, le niveau global de prélèvements ne change pas, mais la part qui finance la retraite augmente.` },
    ],
    body: (h) => `
<h2>Comment le simulateur calcule</h2>
<p>Le bénéfice avant rémunération est le chiffre d’affaires moins les charges. La part affectée au gérant couvre sa rémunération et ses cotisations, que la société paie. Le moteur applique le barème 2026 des ${h.src('urssafTauxAC', 'artisans, commerçants et professions libérales non réglementées')} sur l’assiette abattue de ${h.pct(P.tns.abattement, 0)} (${h.src('decret2024688', 'décret n° 2024-688')}) : maladie progressive, indemnités journalières, retraite de base et complémentaire, invalidité-décès, allocations familiales, CSG-CRDS, CFP. La rémunération nette est imposée comme un salaire, après l’abattement de ${h.pct(P.ir.abattement_salaires.taux, 0)}.</p>
<p>Le bénéfice restant paie l’${h.src('spIs', 'impôt sur les sociétés')} ; les dividendes subissent le ${h.src('spDividendes', 'prélèvement forfaitaire unique')}, et la part soumise aux cotisations n’acquitte pas une seconde fois les prélèvements sociaux. Le capital retenu par défaut est de ${h.eur(1000)}, modifiable.</p>
${h.table(['Partage', 'Rémunération nette', 'Dividendes nets', 'Net en poche par an'], [['Tout en rémunération', h.eur(tout.remunerationNette), h.eur(tout.dividendesNets), h.eur(tout.net)], [`${h.pct(best.partRemuneration ?? 0, 0)} en rémunération`, h.eur(best.remunerationNette), h.eur(best.dividendesNets), h.eur(best.net)]], `EURL à l’IS, ${h.eur(90000)} de chiffre d’affaires, ${h.eur(6000)} de charges, personne seule`, ['l', 'r', 'r', 'r'])}
<h2>Limites</h2>
<p>Pas de frais de création ni de comptabilité, pas d’Acre, pas de cotisations de début d’activité calculées sur base forfaitaire : le simulateur donne les cotisations définitives. Le détail des cotisations est sur ${h.a('cotisations-tns', 'les cotisations TNS')} et la règle des 10 % sur ${h.a('dividendes-eurl', 'les dividendes d’EURL')}.</p>`,
  },
  en: {
    slug: 'eurl-company',
    nav: 'EURL manager pay calculator',
    card: 'Self-employed pay, dividends above 10%, corporate tax.',
    title: 'EURL France 2026: manager pay and dividend calculator',
    description: 'EURL calculator 2026: a manager’s take-home in France, self-employed contributions after the 26% allowance, corporate tax and dividends above 10% of capital.',
    h1: 'EURL: what the manager keeps in 2026',
    intro: 'The calculator splits profit between pay and dividends and applies the self-employed scale reformed in 2026.',
    resume: `The sole member-manager of an EURL (a one-member limited liability company) is self-employed for social security: since the reform applied in 2026, contributions are worked out on pay plus the contributions the company covers, less a flat ${EN.pct(P.tns.abattement, 0)} allowance. On ${EN.eur(40000)} of gross pay defined this way, the base is ${EN.eur(t40.assiette)} and contributions reach ${EN.eur(t40.cotisations)}, CSG-CRDS levies included. If the company pays corporate tax, remaining profit is taxed at ${EN.pct(P.is.taux_reduit, 0)} up to ${EN.eur(P.is.seuil_reduit)}, then ${EN.pct(P.is.taux_normal, 0)}; dividends above ${EN.pct(P.dividendes.seuil_tns_capital, 0)} of share capital and partner current accounts bear the same contributions, which makes payouts unattractive with little capital. On ${EN.eur(90000)} of turnover and ${EN.eur(6000)} of costs the best split leaves ${EN.eur(best.net)} a year, against ${EN.eur(ir.net)} if the EURL stays under income tax like a sole trader.`,
    faqs: [
      { q: 'Why are EURL dividends rarely worth it?', a: `Because the part above ${EN.pct(P.dividendes.seuil_tns_capital, 0)} of share capital, share premium and partner current accounts carries self-employed contributions on top of tax. With ${EN.eur(1000)} of capital, nearly the whole dividend is caught. More capital or money lent to the company through a current account raises the part that escapes.` },
      { q: 'Is an EURL under income tax the same as a sole trader?', a: `For the numbers, yes: profit is taxed in the manager’s name and contributions are based on it, as for an EI on real profit. On ${EN.eur(90000)} of turnover and ${EN.eur(6000)} of costs that leaves ${EN.eur(ir.net)} a year. Opting for corporate tax changes the calculation, which this calculator handles.` },
      { q: 'What did the 2026 reform change for an EURL manager?', a: `Contributions and CSG-CRDS are now worked out on a single base: gross income, contributions not deducted, minus a ${EN.pct(P.tns.abattement, 0)} allowance. Rates rose at the same time: health up to ${EN.pct(P.tns.maladie.points[P.tns.maladie.points.length - 1][1])}, supplementary pension at ${EN.pct(P.tns.retraite_compl.t1)}. The Urssaf says total levies stay the same overall, with a larger share going to pensions.` },
    ],
    body: (h) => `
<h2>How the calculator works</h2>
<p>Profit before pay is turnover minus costs. The share allocated to the manager covers pay and contributions, which the company settles. The engine applies the 2026 scale for ${h.src('urssafTauxAC', 'craftspeople, traders and unregulated professions')} to the base after the ${h.pct(P.tns.abattement, 0)} allowance (${h.src('decret2024688', 'decree no. 2024-688')}): progressive health, sick pay, basic and supplementary pension, disability and death, family benefits, CSG-CRDS and the training levy. Net pay is taxed like a salary, after the ${h.pct(P.ir.abattement_salaires.taux, 0)} allowance.</p>
<p>Remaining profit pays ${h.src('spIs', 'corporate tax')}; dividends bear the ${h.src('spDividendes', 'flat tax')}, and the part already subject to contributions does not pay social levies twice. The default share capital is ${h.eur(1000)}, which you can change.</p>
${h.table(['Split', 'Net pay', 'Net dividends', 'Take-home a year'], [['All pay', h.eur(tout.remunerationNette), h.eur(tout.dividendesNets), h.eur(tout.net)], [`${h.pct(best.partRemuneration ?? 0, 0)} as pay`, h.eur(best.remunerationNette), h.eur(best.dividendesNets), h.eur(best.net)]], `EURL under corporate tax, ${h.eur(90000)} turnover, ${h.eur(6000)} costs, single`, ['l', 'r', 'r', 'r'])}
<h2>Limits</h2>
<p>No set-up or accounting costs, no Acre relief, and no provisional start-up contributions on a flat base: the calculator shows final contributions. Contributions are detailed on ${h.a('cotisations-tns', 'self-employed (TNS) contributions')} and the 10% rule on ${h.a('dividendes-eurl', 'EURL dividends')}.</p>`,
  },
});
