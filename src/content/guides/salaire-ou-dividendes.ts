import { defineGuide } from '../../lib/guide-types';
import { enSASU, sasuPart } from '../../lib/engine/statuts';
import { assimileDepuisCout } from '../../lib/engine/assimile';
import { P, FR, EN } from '../../lib/fmt';

// SASU, bénéfice avant rémunération, libéral, personne seule sans autre revenu : tout vient du moteur.
const cas = (b: number) => ({ ca: b, charges: 0, activite: 'bnc' as const });
const B = 80000;
const parts = [0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => ({ p, o: sasuPart(cas(B), p) }));
const best = enSASU(cas(B));
const tout = parts[parts.length - 1].o, rien = parts[0].o;
const niveaux = [50000, 80000, 120000, 200000].map((b) => ({ b, o: enSASU(cas(b)) }));
const hauts = niveaux.filter((n) => n.b >= 80000).map((n) => n.o.remunerationNette);
const salMin = Math.min(...hauts), salMax = Math.max(...hauts);
// Ce que devient 1 000 € de bénéfice selon la voie de sortie (avant impôt sur le revenu pour le salaire).
const mille = 1000;
const sal = assimileDepuisCout(mille * 20);
const ratioSal = sal.net / sal.cout;
const divReduit = (1 - P.is.taux_reduit) * (1 - P.dividendes.pfu);
const divNormal = (1 - P.is.taux_normal) * (1 - P.dividendes.pfu);

export default defineGuide({
  id: 'salaire-ou-dividendes',
  group: 'statuts',
  order: 70,
  mini: 'salaireDividendes',
  miniHref: 'sasu',
  related: ['sasu', 'charges-sasu', 'flat-tax-dividendes', 'eurl-ou-sasu', 'impot-sur-les-societes'],
  sources: ['urssafTauxSalarie', 'monEntreprise', 'spIs', 'spDividendes', 'spFraisPro'],
  fr: {
    slug: 'salaire-ou-dividendes',
    nav: 'Salaire ou dividendes en SASU',
    card: 'Le partage qui maximise le revenu du président, et ce qu’il coûte en droits.',
    title: 'Salaire ou dividendes SASU 2026 : le partage optimal chiffré',
    description: 'Salaire ou dividendes en SASU 2026 : pour 80 000 € de bénéfice, net selon la part versée en salaire, IS à 15 % puis 25 %, flat tax de 31,4 % et partage optimal.',
    h1: 'Salaire ou dividendes : comment le président de SASU se paie le mieux',
    intro: 'Chaque euro de bénéfice peut sortir en salaire ou en dividende ; les deux chemins ne laissent pas la même somme, ni les mêmes droits.',
    resume: `Pour un président de SASU seul, le meilleur partage en 2026 associe un salaire modeste et des dividendes : avec ${FR.eur(B)} de bénéfice avant rémunération, le moteur trouve l’optimum à ${FR.pct(best.partRemuneration ?? 0, 0)} du bénéfice consacré au salaire, coût patronal compris, ce qui laisse ${FR.eur(best.net)} par an après tous prélèvements. Tout verser en salaire ne laisse que ${FR.eur(tout.net)} ; tout verser en dividendes, ${FR.eur(rien.net)}. La raison tient au coût du salaire d’un assimilé salarié : sur ${FR.eur(sal.cout)} de budget, il arrive ${FR.eur(sal.net)} net sur le compte du président, soit ${FR.pct(ratioSal, 0)}, avant impôt sur le revenu. Un euro de bénéfice distribué en dividende paie d’abord l’impôt sur les sociétés, ${FR.pct(P.is.taux_reduit, 0)} jusqu’à ${FR.eur(P.is.seuil_reduit)}, puis le prélèvement forfaitaire unique de ${FR.pct(P.dividendes.pfu)} : il en reste ${FR.pct(divReduit)}, et ${FR.pct(divNormal)} quand l’impôt sur les sociétés passe à ${FR.pct(P.is.taux_normal, 0)}. Le salaire garde un atout que le dividende n’a pas : il ouvre des droits à la retraite, alors qu’une rémunération nulle ne valide aucun trimestre.`,
    faqs: [
      { q: 'Quel partage entre salaire et dividendes pour 80 000 € de bénéfice en SASU ?', a: `Le moteur retient ${FR.pct(best.partRemuneration ?? 0, 0)} du bénéfice en coût de salaire : ${FR.eur(best.remunerationNette)} de salaire net et ${FR.eur(best.dividendesNets)} de dividendes nets, soit ${FR.eur(best.net)} par an pour une personne seule. L’impôt sur les sociétés tombe alors à ${FR.eur(best.impotSocietes)}. Calcul avec les taux 2026 de l’Urssaf et le prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)}, tout le reste étant distribué.` },
      { q: 'Pourquoi se verser un salaire en SASU si les dividendes rapportent plus ?', a: `Pour les droits sociaux. Les dividendes de SASU ne supportent aucune cotisation et n’ouvrent donc ni trimestre de retraite ni indemnités journalières ; une rémunération nulle ne valide rien. Le salaire du président cotise au régime général, retraite de base et Agirc-Arrco comprises. En revanche, même avec un salaire, le président n’a pas d’assurance chômage, faute de contrat de travail (Urssaf).` },
      { q: 'Combien reste-t-il de 1 000 € de bénéfice versés en dividendes plutôt qu’en salaire ?', a: `En dividende, ${FR.eur(mille * divReduit)} si le bénéfice est taxé à ${FR.pct(P.is.taux_reduit, 0)}, ${FR.eur(mille * divNormal)} à ${FR.pct(P.is.taux_normal, 0)}, après prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)}. En salaire, environ ${FR.eur(mille * ratioSal)} net avant impôt sur le revenu, selon le moteur pour une rémunération modeste, l’impôt sur les sociétés n’étant pas dû puisque le salaire est une charge.` },
      { q: 'Le meilleur partage change-t-il au-delà de 42 500 € de bénéfice restant ?', a: `Oui. Au-delà de ${FR.eur(P.is.seuil_reduit)}, le bénéfice laissé dans la société paie ${FR.pct(P.is.taux_normal, 0)} d’impôt sur les sociétés au lieu de ${FR.pct(P.is.taux_reduit, 0)}, ce qui rend chaque euro de salaire relativement plus intéressant. Le moteur donne ainsi ${FR.pct(niveaux[1].o.partRemuneration ?? 0, 0)} en salaire pour ${FR.eur(80000)} de bénéfice, mais ${FR.pct(niveaux[3].o.partRemuneration ?? 0, 0)} pour ${FR.eur(200000)}, le salaire net restant proche d’un même montant.` },
      { q: 'Tout prendre en salaire dans une SASU, combien cela coûte-t-il ?', a: `Pour ${FR.eur(B)} de bénéfice, tout verser en salaire laisse ${FR.eur(tout.net)} par an, contre ${FR.eur(best.net)} au meilleur partage : ${FR.eur(best.net - tout.net)} de moins. Les cotisations atteignent alors ${FR.eur(tout.cotisations)} et l’impôt sur le revenu ${FR.eur(tout.impotRevenu)}. C’est le choix qui construit le plus de droits à la retraite, au prix d’un revenu disponible plus faible.` },
      { q: 'Le salaire du président fait-il baisser l’impôt sur les sociétés ?', a: `Oui, son coût total, brut et cotisations patronales, se déduit du bénéfice. Pour ${FR.eur(B)} de bénéfice sans aucun salaire, la SASU paie ${FR.eur(rien.impotSocietes)} d’impôt sur les sociétés ; au partage optimal, ${FR.eur(best.impotSocietes)}. Le taux réduit de ${FR.pct(P.is.taux_reduit, 0)} s’applique jusqu’à ${FR.eur(P.is.seuil_reduit)} de bénéfice (service-public, fiche F23575).` },
    ],
    body: (h) => `
<h2>La courbe du revenu selon la part en salaire</h2>
<p>Le tableau fait varier, pour ${h.eur(B)} de bénéfice avant rémunération, la part du bénéfice affectée au salaire du président, cotisations patronales comprises. Le reste paie l’impôt sur les sociétés puis part intégralement en dividendes. Le revenu final intègre l’impôt sur le revenu d’une personne seule.</p>
${h.table(['Part en salaire', 'Salaire net', 'Dividendes nets', 'Impôt sur le revenu', 'Revenu disponible / an'], [...parts.map((x) => [h.pct(x.p, 0), h.eur(x.o.remunerationNette), h.eur(x.o.dividendesNets), h.eur(x.o.impotRevenu), h.eur(x.o.net)]), [`Optimum : ${h.pct(best.partRemuneration ?? 0, 0)}`, h.eur(best.remunerationNette), h.eur(best.dividendesNets), h.eur(best.impotRevenu), h.eur(best.net)]], `SASU, ${h.eur(B)} de bénéfice, libéral, personne seule, barèmes 2026`, ['l', 'r', 'r', 'r', 'r'])}
<p>La courbe monte d’abord, culmine puis redescend. Les premiers euros de salaire profitent de l’abattement de ${h.pct(P.ir.abattement_salaires.taux, 0)} pour frais professionnels (${h.src('spFraisPro', 'fiche F1989')}) et des tranches basses de l’impôt sur le revenu ; passé un certain niveau, chaque euro supplémentaire de salaire coûte plus en cotisations et en impôt qu’il ne rapporterait sous forme de dividende. L’écart entre le pire et le meilleur partage dépasse ${h.eur(best.net - Math.min(tout.net, rien.net))} par an.</p>

<h2>Ce que devient un euro de bénéfice</h2>
${h.table(['Voie de sortie', 'Prélèvements', 'Reste pour 1 000 €'], [
  ['Salaire du président (net avant impôt sur le revenu)', 'cotisations patronales et salariales, CSG-CRDS', h.eur(mille * ratioSal)],
  [`Dividende, bénéfice taxé à ${h.pct(P.is.taux_reduit, 0)}`, `IS puis prélèvement forfaitaire de ${h.pct(P.dividendes.pfu)}`, h.eur(mille * divReduit)],
  [`Dividende, bénéfice taxé à ${h.pct(P.is.taux_normal, 0)}`, `IS puis prélèvement forfaitaire de ${h.pct(P.dividendes.pfu)}`, h.eur(mille * divNormal)],
], `Rendement de chaque voie, rémunération modeste, taux ${h.src('urssafTauxSalarie', 'Urssaf 2026')}`, ['l', 'l', 'r'])}
<p>Le salaire semble presque à égalité avec le dividende, mais il supporte en plus l’impôt sur le revenu au barème, alors que le prélèvement forfaitaire de ${h.pct(P.dividendes.pfu)} contient déjà ${h.pct(P.dividendes.pfu_ir)} d’impôt (${h.src('spDividendes', 'fiche F32963')}). Le tableau se lit donc ainsi : un euro de salaire bat un dividende prélevé sur un bénéfice taxé à ${h.pct(P.is.taux_normal, 0)}, mais pas un dividende issu de la tranche à ${h.pct(P.is.taux_reduit, 0)}, et seulement tant qu’il échappe presque entièrement à l’impôt sur le revenu. Au partage optimal pour ${h.eur(B)}, l’impôt sur le revenu du président est de ${h.eur(best.impotRevenu)} : le moteur arrête le salaire là où il commencerait à être vraiment imposé.</p>

<h2>L’optimum selon le niveau de bénéfice</h2>
${h.table(['Bénéfice', 'Part en salaire', 'Salaire net', 'Impôt sur le revenu', 'Revenu disponible / an'], niveaux.map((n) => [h.eur(n.b), h.pct(n.o.partRemuneration ?? 0, 0), h.eur(n.o.remunerationNette), h.eur(n.o.impotRevenu), h.eur(n.o.net)]), 'Partage optimal trouvé par le moteur, pas de 1 %', ['l', 'r', 'r', 'r', 'r'])}
<p>À partir de ${h.eur(80000)} de bénéfice, le salaire net optimal reste compris entre ${h.eur(salMin)} et ${h.eur(salMax)} ; c’est la part qui baisse à mesure que le bénéfice grimpe. Sur un petit bénéfice, le moteur verse peu de salaire, car l’impôt sur les sociétés au taux réduit de ${h.pct(P.is.taux_reduit, 0)} rend le dividende plus efficace. Ces partages maximisent le revenu de l’année et rien d’autre.</p>

<h2>Le prix des droits sociaux</h2>
<p>Le président de SASU est assimilé salarié : son salaire cotise au régime général et finance sa retraite de base et complémentaire, mais jamais l’assurance chômage, réservée aux titulaires d’un contrat de travail. Les dividendes, eux, ne cotisent à rien. Une rémunération nulle ne valide aucun trimestre de retraite. Celui qui veut construire des droits accepte un revenu disponible plus bas : le tableau du haut chiffre ce renoncement année par année. Nous ne publions pas d’estimation de pension.</p>
<p>Deux réglages complètent ce calcul. Le coût d’un salaire donné, brut, cotisations et net, est détaillé sur ${h.a('charges-sasu', 'les charges de SASU')} ; la fiscalité des dividendes, prélèvement forfaitaire ou option pour le barème, sur ${h.a('flat-tax-dividendes', 'la flat tax sur les dividendes')}. Pour comparer avec un gérant d’EURL, dont les dividendes obéissent à d’autres règles, voir ${h.a('eurl-ou-sasu', 'EURL ou SASU')}. Les montants sont des estimations calculées sur les barèmes publiés, sans valeur de conseil : l’Urssaf et l’administration fiscale établissent les sommes dues.</p>`,
  },
  en: {
    slug: 'salary-or-dividends',
    nav: 'Salary or dividends in a SASU',
    card: 'The split that maximises a SASU president’s income, and what it costs in rights.',
    title: 'Salary or dividends SASU 2026: the best split, worked out',
    description: 'Salary or dividends in a French SASU, 2026: on €80,000 of profit, take-home by salary share, corporate tax at 15% then 25%, 31.4% flat tax and the best split.',
    h1: 'Salary or dividends: how a SASU president pays themselves best',
    intro: 'Every euro of profit can leave the company as salary or as a dividend; the two routes do not leave the same amount, or the same rights.',
    resume: `For a SASU president working alone (SASU: société par actions simplifiée unipersonnelle, a French one-shareholder company), the best mix in 2026 combines a modest salary with dividends: on ${EN.eur(B)} of profit before the president’s pay, our engine finds the optimum at ${EN.pct(best.partRemuneration ?? 0, 0)} of profit spent on salary, employer contributions included, leaving ${EN.eur(best.net)} a year after every tax and levy. Taking everything as salary leaves only ${EN.eur(tout.net)}; everything as dividends, ${EN.eur(rien.net)}. The reason is what salary costs for a president treated like an employee: out of a ${EN.eur(sal.cout)} budget, ${EN.eur(sal.net)} reaches the president’s account, ${EN.pct(ratioSal, 0)}, before income tax. A euro paid out as a dividend first bears IS, French corporate tax, at ${EN.pct(P.is.taux_reduit, 0)} up to ${EN.eur(P.is.seuil_reduit)}, then the ${EN.pct(P.dividendes.pfu)} PFU flat tax: ${EN.pct(divReduit)} is left, or ${EN.pct(divNormal)} once corporate tax rises to ${EN.pct(P.is.taux_normal, 0)}. Salary has one advantage dividends lack: it builds pension rights, while a zero salary validates no pension quarters.`,
    faqs: [
      { q: 'What is the best salary and dividend mix on €80,000 of SASU profit?', a: `The engine settles on ${EN.pct(best.partRemuneration ?? 0, 0)} of profit as salary cost: ${EN.eur(best.remunerationNette)} of net salary and ${EN.eur(best.dividendesNets)} of net dividends, ${EN.eur(best.net)} a year for a single person. Corporate tax falls to ${EN.eur(best.impotSocietes)}. Worked out with 2026 Urssaf rates and the ${EN.pct(P.dividendes.pfu)} flat tax, with everything else paid out.` },
      { q: 'Why pay myself a salary if SASU dividends leave more?', a: `For social rights. SASU dividends carry no social contributions, so they earn neither pension quarters nor sick pay; a zero salary validates nothing. The president’s salary pays into the general scheme, including basic pension and Agirc-Arrco, the private-sector supplementary pension. Even with a salary, though, the president has no unemployment insurance, as there is no employment contract (Urssaf).` },
      { q: 'How much of €1,000 of profit reaches me as a dividend versus salary?', a: `As a dividend, ${EN.eur(mille * divReduit)} if profit is taxed at ${EN.pct(P.is.taux_reduit, 0)}, ${EN.eur(mille * divNormal)} at ${EN.pct(P.is.taux_normal, 0)}, after the ${EN.pct(P.dividendes.pfu)} flat tax. As salary, roughly ${EN.eur(mille * ratioSal)} net before income tax according to the engine for modest pay, with no corporate tax since salary is a deductible cost for the company.` },
      { q: 'Does the best split shift once profit left in the company passes €42,500?', a: `Yes. Above ${EN.eur(P.is.seuil_reduit)}, profit left in the company pays ${EN.pct(P.is.taux_normal, 0)} corporate tax instead of ${EN.pct(P.is.taux_reduit, 0)}, which makes salary relatively more attractive. The engine gives ${EN.pct(niveaux[1].o.partRemuneration ?? 0, 0)} as salary on ${EN.eur(80000)} of profit but ${EN.pct(niveaux[3].o.partRemuneration ?? 0, 0)} on ${EN.eur(200000)}, with net salary staying close to the same amount.` },
      { q: 'What does taking everything as salary cost a SASU president?', a: `On ${EN.eur(B)} of profit, paying it all as salary leaves ${EN.eur(tout.net)} a year, against ${EN.eur(best.net)} at the best split: ${EN.eur(best.net - tout.net)} less. Contributions then reach ${EN.eur(tout.cotisations)} and income tax ${EN.eur(tout.impotRevenu)}. It is the option that builds the most pension rights, at the cost of lower disposable income.` },
      { q: 'Does the president’s salary reduce the company’s corporate tax?', a: `Yes, its full cost, gross pay plus employer contributions, comes off profit. On ${EN.eur(B)} of profit with no salary at all, the SASU pays ${EN.eur(rien.impotSocietes)} of corporate tax; at the best split, ${EN.eur(best.impotSocietes)}. The reduced ${EN.pct(P.is.taux_reduit, 0)} rate applies up to ${EN.eur(P.is.seuil_reduit)} of profit (service-public, sheet F23575).` },
    ],
    body: (h) => `
<h2>Take-home as the salary share changes</h2>
<p>On ${h.eur(B)} of profit before the president’s pay, the table varies the share of profit spent on salary, employer contributions included. The rest pays corporate tax and is then paid out in full as dividends. The final figure includes income tax for a single person.</p>
${h.table(['Salary share', 'Net salary', 'Net dividends', 'Income tax', 'Disposable income / yr'], [...parts.map((x) => [h.pct(x.p, 0), h.eur(x.o.remunerationNette), h.eur(x.o.dividendesNets), h.eur(x.o.impotRevenu), h.eur(x.o.net)]), [`Best: ${h.pct(best.partRemuneration ?? 0, 0)}`, h.eur(best.remunerationNette), h.eur(best.dividendesNets), h.eur(best.impotRevenu), h.eur(best.net)]], `SASU, ${h.eur(B)} of profit, freelance activity, single, 2026 rates`, ['l', 'r', 'r', 'r', 'r'])}
<p>The curve rises, peaks, then falls. The first euros of salary benefit from the ${h.pct(P.ir.abattement_salaires.taux, 0)} allowance for work expenses (${h.src('spFraisPro', 'sheet F1989')}) and from the low income tax bands; beyond a certain level, each extra euro of salary costs more in contributions and tax than it would leave as a dividend. The gap between the worst and the best split exceeds ${h.eur(best.net - Math.min(tout.net, rien.net))} a year.</p>

<h2>What happens to one euro of profit</h2>
${h.table(['Route out', 'Charges', 'Left from €1,000'], [
  ['President’s salary (net before income tax)', 'employer and employee contributions, CSG-CRDS', h.eur(mille * ratioSal)],
  [`Dividend, profit taxed at ${h.pct(P.is.taux_reduit, 0)}`, `corporate tax, then ${h.pct(P.dividendes.pfu)} flat tax`, h.eur(mille * divReduit)],
  [`Dividend, profit taxed at ${h.pct(P.is.taux_normal, 0)}`, `corporate tax, then ${h.pct(P.dividendes.pfu)} flat tax`, h.eur(mille * divNormal)],
], `Yield of each route, modest pay, ${h.src('urssafTauxSalarie', '2026 Urssaf rates')}`, ['l', 'l', 'r'])}
<p>Salary looks almost level with dividends, but it still bears income tax on the progressive scale, whereas the ${h.pct(P.dividendes.pfu)} flat tax already includes ${h.pct(P.dividendes.pfu_ir)} of income tax (${h.src('spDividendes', 'sheet F32963')}). So the table reads like this: a euro of salary beats a dividend drawn from profit taxed at ${h.pct(P.is.taux_normal, 0)}, but not one drawn from the ${h.pct(P.is.taux_reduit, 0)} band, and only while it escapes income tax almost entirely. At the best split on ${h.eur(B)}, the president’s income tax is ${h.eur(best.impotRevenu)}: the engine stops the salary where it would start being taxed in earnest.</p>
<p>A word on vocabulary if you are new to French company accounts. The “cost” of the salary is what the company pays out in total: gross salary plus employer contributions. Net salary is what lands in your personal account before income tax, which the engine then works out on the progressive scale. Dividends come out of profit left after corporate tax, and the ${h.pct(P.dividendes.pfu_ir)} income tax part of the flat tax is taken at source when they are paid, as a prepayment called the PFNL (prélèvement forfaitaire non libératoire).</p>

<h2>The best split at each profit level</h2>
${h.table(['Profit', 'Salary share', 'Net salary', 'Income tax', 'Disposable income / yr'], niveaux.map((n) => [h.eur(n.b), h.pct(n.o.partRemuneration ?? 0, 0), h.eur(n.o.remunerationNette), h.eur(n.o.impotRevenu), h.eur(n.o.net)]), 'Best split found by the engine, in 1% steps', ['l', 'r', 'r', 'r', 'r'])}
<p>From ${h.eur(80000)} of profit upwards, the best net salary stays between ${h.eur(salMin)} and ${h.eur(salMax)}; it is the share that shrinks as profit grows. On a small profit, the engine pays little salary, because corporate tax at the reduced ${h.pct(P.is.taux_reduit, 0)} rate makes dividends more efficient. These splits maximise this year’s income and nothing else.</p>

<h2>The price of social rights</h2>
<p>If you come from a country where a company owner’s dividends and salary count the same for social security, French rules will surprise you. A SASU president is treated like an employee: salary pays into the general scheme and funds basic and supplementary pension, but never unemployment insurance, which is reserved for people with an employment contract. Dividends pay into nothing. A zero salary validates no pension quarters, the units French pension rights are counted in. Building rights means accepting lower disposable income; the first table shows that trade-off year by year. We do not publish pension estimates.</p>
<p>Two further settings complete the picture. What a given salary costs, gross, contributions and net, is on ${h.a('charges-sasu', 'SASU president pay')}; dividend taxation, flat tax or the option for the progressive scale, on ${h.a('flat-tax-dividendes', 'the dividend flat tax')}. To compare with an EURL manager, whose dividends follow other rules, see ${h.a('eurl-ou-sasu', 'EURL or SASU')}. These amounts are estimates from published scales, not advice: the Urssaf and the French tax office set what is due.</p>`,
  },
});
