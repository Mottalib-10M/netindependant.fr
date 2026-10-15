import { defineGuide } from '../../lib/guide-types';
import { enSASU, sasuPart } from '../../lib/engine/statuts';
import { assimileDepuisBrut } from '../../lib/engine/assimile';
import { P, FR, EN } from '../../lib/fmt';

const i = { ca: 90000, charges: 6000, activite: 'bnc' as const };
const best = enSASU(i), tout = sasuPart(i, 1), zero = sasuPart(i, 0);
const a3 = assimileDepuisBrut(36000);

export default defineGuide({
  id: 'sasu',
  group: 'statuts',
  order: 20,
  tool: 'sasu',
  related: ['salaire-ou-dividendes', 'charges-sasu', 'flat-tax-dividendes', 'eurl-ou-sasu', 'impot-sur-les-societes'],
  sources: ['urssafTauxSalarie', 'monEntreprise', 'spIs', 'spDividendes', 'urssafAcre2026'],
  fr: {
    slug: 'sasu',
    nav: 'SASU : simulateur de rémunération',
    card: 'Salaire du président, dividendes, IS : le net en poche.',
    title: 'SASU 2026 : simulateur salaire, dividendes et net en poche',
    description: 'SASU 2026 : simulateur du net du président, salaire assimilé salarié, impôt sur les sociétés à 15 % puis 25 %, dividendes à 31,4 % et meilleur partage calculé.',
    h1: 'SASU : combien vous reste-t-il en tant que président ?',
    intro: 'Votre chiffre d’affaires et vos charges : le simulateur répartit le bénéfice entre salaire et dividendes et cherche le partage qui rapporte le plus.',
    resume: `Le président d’une SASU est assimilé salarié : son salaire supporte les cotisations du régime général, patronales et salariales, sans assurance chômage puisqu’il n’a pas de contrat de travail. Pour ${FR.eur(36000)} de salaire brut annuel, la société paie ${FR.eur(a3.cout)} et le président touche ${FR.eur(a3.net)} net avant impôt. Le bénéfice qui reste supporte l’impôt sur les sociétés, ${FR.pct(P.is.taux_reduit, 0)} jusqu’à ${FR.eur(P.is.seuil_reduit)} puis ${FR.pct(P.is.taux_normal, 0)}, et peut être distribué en dividendes, taxés au prélèvement forfaitaire unique de ${FR.pct(P.dividendes.pfu)} sans cotisations sociales. Pour ${FR.eur(90000)} de chiffre d’affaires et ${FR.eur(6000)} de charges, tout verser en salaire laisse ${FR.eur(tout.net)} par an, tout en dividendes ${FR.eur(zero.net)}, et le meilleur partage, ${FR.pct(best.partRemuneration ?? 0, 0)} du bénéfice en salaire, ${FR.eur(best.net)}. Le dividende rapporte davantage aujourd’hui ; le salaire ouvre des droits à la retraite et aux indemnités journalières.`,
    faqs: [
      { q: 'Un président de SASU sans salaire paie-t-il des cotisations ?', a: `Non. Sans rémunération, il ne paie aucune cotisation sociale, et les dividendes n’en supportent pas en SASU : seulement le prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)}, dont ${FR.pct(P.dividendes.prelevements_sociaux)} de prélèvements sociaux. En contrepartie, il ne valide aucun trimestre de retraite et n’a pas d’indemnités journalières. C’est le principal point à peser avant de tout prendre en dividendes.` },
      { q: 'Le président de SASU a-t-il droit au chômage ?', a: 'Non, pas au titre de son mandat : il n’a pas de contrat de travail et ne cotise pas à l’assurance chômage, ce que le simulateur reflète. Un cumul avec un vrai contrat de travail dans la société suppose des fonctions techniques distinctes et un lien de subordination, ce qui est rarement le cas dans une société à associé unique.' },
      { q: 'L’Acre est-elle possible en SASU ?', a: `Oui, si le président entre dans une des situations prévues et contrôle la société : il doit détenir, avec sa famille, plus de la moitié du capital dont au moins 35 % personnellement, ou au moins un tiers dont 25 % personnellement s’il dirige la société. Depuis 2026, la demande se fait à l’Urssaf dans les ${P.micro.acre.delai_demande_jours} jours suivant le début d’activité. Le simulateur ne l’applique pas.` },
    ],
    body: (h) => `
<h2>Comment le simulateur calcule</h2>
<p>Le bénéfice avant rémunération est le chiffre d’affaires moins les charges de la société. La part que vous affectez à la rémunération en est le coût total : salaire brut et cotisations patronales. Le moteur en tire le brut, puis le net avec les ${h.src('urssafTauxSalarie', 'taux 2026 du secteur privé')} : maladie ${h.pct(P.assimile.employeur.maladie, 0)}, vieillesse, allocations familiales, retraite complémentaire Agirc-Arrco, CSG-CRDS sur ${h.pct(P.assimile.csg.assiette, 2)} du brut. Il suit les mêmes hypothèses que le ${h.src('monEntreprise', 'simulateur de l’Urssaf')} (taux AT/MP moyen, prévoyance cadre) et s’en écarte de moins de ${h.pct(0.003, 1)} dans nos tests.</p>
<p>Le reste du bénéfice paie l’impôt sur les sociétés (${h.src('spIs', 'fiche F23575')}), puis part en dividendes au ${h.src('spDividendes', 'prélèvement forfaitaire unique')}. L’impôt sur le revenu du président est calculé sur son salaire net imposable après l’abattement de ${h.pct(P.ir.abattement_salaires.taux, 0)}.</p>
${h.table(['Partage', 'Salaire net', 'Dividendes nets', 'Net en poche par an'], [['Tout en salaire', h.eur(tout.remunerationNette), h.eur(tout.dividendesNets), h.eur(tout.net)], [`${h.pct(best.partRemuneration ?? 0, 0)} en salaire`, h.eur(best.remunerationNette), h.eur(best.dividendesNets), h.eur(best.net)], ['Tout en dividendes', h.eur(zero.remunerationNette), h.eur(zero.dividendesNets), h.eur(zero.net)]], `SASU, ${h.eur(90000)} de chiffre d’affaires, ${h.eur(6000)} de charges, personne seule`, ['l', 'r', 'r', 'r'])}
<h2>Ce que le simulateur laisse de côté</h2>
<p>Les frais de création et de comptabilité, la mutuelle, l’Acre, les avantages en nature et les dividendes mis en réserve plutôt que distribués. Le détail du partage est sur ${h.a('salaire-ou-dividendes', 'salaire ou dividendes')}, et la comparaison avec l’EURL sur ${h.a('eurl-ou-sasu', 'EURL ou SASU')}.</p>`,
  },
  en: {
    slug: 'sasu-company',
    nav: 'SASU pay calculator',
    card: 'President’s salary, dividends, corporate tax: what you keep.',
    title: 'SASU France 2026: salary, dividends and take-home calculator',
    description: 'SASU calculator 2026: a president’s take-home in France, employee-style salary, corporate tax at 15% then 25%, dividends at 31.4%, best split worked out.',
    h1: 'SASU: what do you keep as the company president?',
    intro: 'Enter turnover and costs: the calculator splits profit between salary and dividends and finds the split that pays most.',
    resume: `The president of a SASU (a one-shareholder simplified joint-stock company) is treated like an employee for social security: the salary carries general-scheme employer and employee contributions, without unemployment insurance since there is no employment contract. On ${EN.eur(36000)} of gross salary a year, the company pays ${EN.eur(a3.cout)} and the president receives ${EN.eur(a3.net)} net before tax. Profit left over bears corporate tax, ${EN.pct(P.is.taux_reduit, 0)} up to ${EN.eur(P.is.seuil_reduit)} then ${EN.pct(P.is.taux_normal, 0)}, and can be paid out as dividends, taxed at the ${EN.pct(P.dividendes.pfu)} flat rate with no social contributions. With ${EN.eur(90000)} of turnover and ${EN.eur(6000)} of costs, paying everything as salary leaves ${EN.eur(tout.net)} a year, everything as dividends ${EN.eur(zero.net)}, and the best split, ${EN.pct(best.partRemuneration ?? 0, 0)} of profit as salary, ${EN.eur(best.net)}. Dividends pay more today; salary earns pension and sick-pay rights.`,
    faqs: [
      { q: 'Does a SASU president with no salary pay contributions?', a: `No. With no pay there are no social contributions, and SASU dividends carry none either: only the ${EN.pct(P.dividendes.pfu)} flat tax, of which ${EN.pct(P.dividendes.prelevements_sociaux)} is social levies. In return the president earns no French pension quarters and gets no sick pay. That is the main point to weigh before taking everything as dividends.` },
      { q: 'Can a SASU president claim French unemployment benefit?', a: 'Not for the director role: there is no employment contract and no unemployment insurance contribution, which the calculator reflects. Holding a genuine employment contract in the same company requires separate technical duties and a real subordinate relationship, which is rarely the case when you are the sole shareholder.' },
      { q: 'Can I get Acre relief in a SASU?', a: `Yes, if the president fits one of the listed situations and controls the company: holding, with family, more than half of the capital including at least 35% personally, or at least a third including 25% personally while running it. Since 2026 you apply to the Urssaf within ${P.micro.acre.delai_demande_jours} days of starting. The calculator does not apply it.` },
    ],
    body: (h) => `
<h2>How the calculator works</h2>
<p>Profit before pay is turnover minus company costs. The share you allocate to pay is its total cost: gross salary plus employer contributions. The engine works out gross, then net, with the ${h.src('urssafTauxSalarie', '2026 private-sector rates')}: health ${h.pct(P.assimile.employeur.maladie, 0)}, old age, family benefits, Agirc-Arrco supplementary pension, and CSG-CRDS levies on ${h.pct(P.assimile.csg.assiette, 2)} of gross. It uses the same assumptions as the ${h.src('monEntreprise', 'Urssaf calculator')} (average work-accident rate, executive provident cover) and stays within ${h.pct(0.003, 1)} of it in our tests.</p>
<p>The rest of the profit pays corporate tax (${h.src('spIs', 'sheet F23575')}), then goes out as dividends under the ${h.src('spDividendes', 'flat tax')}. The president’s income tax is worked out on taxable net salary after the ${h.pct(P.ir.abattement_salaires.taux, 0)} allowance.</p>
${h.table(['Split', 'Net salary', 'Net dividends', 'Take-home a year'], [['All salary', h.eur(tout.remunerationNette), h.eur(tout.dividendesNets), h.eur(tout.net)], [`${h.pct(best.partRemuneration ?? 0, 0)} as salary`, h.eur(best.remunerationNette), h.eur(best.dividendesNets), h.eur(best.net)], ['All dividends', h.eur(zero.remunerationNette), h.eur(zero.dividendesNets), h.eur(zero.net)]], `SASU, ${h.eur(90000)} turnover, ${h.eur(6000)} costs, single`, ['l', 'r', 'r', 'r'])}
<h2>What the calculator leaves out</h2>
<p>Set-up and accounting costs, health insurance top-up, Acre relief, benefits in kind and profits kept in the company rather than paid out. The split is explored on ${h.a('salaire-ou-dividendes', 'salary or dividends')}, and the comparison with an EURL on ${h.a('eurl-ou-sasu', 'EURL or SASU')}.</p>`,
  },
});
