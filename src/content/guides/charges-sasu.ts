import { defineGuide } from '../../lib/guide-types';
import { assimileDepuisBrut, assimileDepuisNet } from '../../lib/engine/assimile';
import { cotisationsTNS } from '../../lib/engine/tns';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const E = P.assimile.employeur, S = P.assimile.salarie, C = P.assimile.csg;
const niveaux = [24000, 36000, P.pass.annuel, 70000].map((b) => ({ b, a: assimileDepuisBrut(b) }));
const m3 = assimileDepuisBrut(36000);                 // 3 000 € brut par mois
const charges3 = m3.cout - m3.net;                     // tout ce qui sépare le coût du net
const vise = assimileDepuisNet(24000);                 // 2 000 € net par mois
// Même budget confié à un gérant d'EURL (travailleur indépendant).
const tnsMemeBudget = cotisationsTNS(m3.cout);
const netTns = m3.cout - tnsMemeBudget.cotisations;
const retraiteEmp = E.agirc_t1 + E.ceg_t1, retraiteSal = S.agirc_t1 + S.ceg_t1;
const csgTotal = C.deductible + C.non_deductible + C.crds;

export default defineGuide({
  id: 'charges-sasu',
  group: 'statuts',
  order: 110,
  mini: 'chargesSasu',
  related: ['sasu', 'salaire-ou-dividendes', 'eurl-ou-sasu', 'micro-ou-sasu', 'cotisations-tns', 'impot-sur-les-societes'],
  sources: ['urssafTauxSalarie', 'monEntreprise', 'urssafTauxAC', 'urssafAcre2026'],
  fr: {
    slug: 'charges-sasu',
    nav: 'Charges sociales en SASU',
    card: 'Les cotisations du président ligne par ligne, du brut au coût total.',
    title: 'Charges SASU 2026 : cotisations du président, brut et net',
    description: 'Charges SASU 2026 : cotisations du président ligne par ligne, maladie 13 %, vieillesse, Agirc-Arrco, CSG-CRDS, sans chômage, et coût total pour 3 000 € brut.',
    h1: 'Les charges sociales du président de SASU, ligne par ligne',
    intro: 'Un salaire de président passe par les mêmes taux qu’un salaire de cadre, l’assurance chômage en moins : voici ce que chacun coûte.',
    resume: `Le président d’une SASU qui se verse ${FR.eur(3000)} brut par mois coûte ${FR.eur(m3.cout / 12)} par mois à sa société et touche ${FR.eur(m3.net / 12)} net avant impôt sur le revenu, selon les taux 2026 du secteur privé publiés par l’Urssaf. Sur ce coût total, ${FR.pct(charges3 / m3.cout)} partent en cotisations et contributions : ${FR.eur(m3.employeur / 12)} de part patronale, ${FR.eur(m3.salarie / 12)} de part salariale et ${FR.eur(m3.csgCrds / 12)} de CSG-CRDS. La raison tient à son régime : comme mandataire social, il relève du régime général des salariés, avec l’assurance maladie à ${FR.pct(E.maladie, 0)} côté société, la vieillesse, les allocations familiales et la retraite complémentaire Agirc-Arrco, mais sans assurance chômage ni cotisation AGS puisqu’il n’a pas de contrat de travail. Il ne bénéficie pas non plus de la réduction générale des cotisations, réservée aux salariés. À budget égal, un gérant majoritaire d’EURL garde davantage en net, avec une protection sociale de travailleur indépendant. Pour toucher ${FR.eur(2000)} net par mois, il faut un brut de ${FR.eur(vise.brut / 12)}.`,
    faqs: [
      { q: 'Quel pourcentage de charges sur le salaire d’un président de SASU ?', a: `Rapportées au coût total, les cotisations et la CSG-CRDS représentent ${FR.pct(charges3 / m3.cout)} pour un salaire de ${FR.eur(3000)} brut par mois : la société dépense ${FR.eur(m3.cout / 12)} et le président reçoit ${FR.eur(m3.net / 12)}. Rapportées au net, elles en font ${FR.pct(charges3 / m3.net, 0)}. Le ratio bouge peu avec le niveau de salaire, car aucune réduction de cotisations ne s’applique.` },
      { q: 'Quel brut verser pour toucher 2 000 € net par mois en SASU ?', a: `Environ ${FR.eur(vise.brut / 12)} brut mensuel, selon nos calculs avec les taux 2026 de l’Urssaf. La société supporte alors ${FR.eur(vise.cout / 12)} par mois, part patronale comprise, soit ${FR.eur(vise.cout)} sur l’année à déduire de son bénéfice. L’impôt sur le revenu reste à prélever sur ce net : le président le déclare sur un net imposable de ${FR.eur(vise.netImposable / 12)} par mois.` },
      { q: 'Pourquoi un président de SASU coûte-t-il plus cher qu’un gérant d’EURL ?', a: `Parce que les taux du régime général dépassent ceux des indépendants. Avec le même budget de ${FR.eur(m3.cout)} par an, le président de SASU touche ${FR.eur(m3.net)} net, le gérant majoritaire d’EURL ${FR.eur(netTns)} après ses cotisations de travailleur indépendant. L’écart finance des lignes que le gérant ne paie pas sous cette forme, comme l’Agirc-Arrco et la prévoyance cadre.` },
      { q: 'La réduction générale de cotisations s’applique-t-elle au président de SASU ?', a: `Non. Elle vise les salariés titulaires d’un contrat de travail ; le président est un mandataire social. Ses cotisations se calculent donc au taux plein dès le premier euro, comme le fait le simulateur de l’Urssaf sur mon-entreprise. C’est pourquoi un petit salaire de président garde un coût proche de ${FR.pct(m3.cout / m3.brut - 1, 0)} au-dessus du brut.` },
      { q: 'Que cotise un président de SASU pour sa retraite ?', a: `Deux étages. La vieillesse de base : ${FR.pct(E.vieillesse_plafonnee, 2)} côté société et ${FR.pct(S.vieillesse_plafonnee, 1)} côté président jusqu’au plafond de ${FR.eur(P.pass.annuel)}, plus une part sur la totalité du salaire. La complémentaire Agirc-Arrco : ${FR.pct(retraiteEmp + retraiteSal, 2)} en tranche 1, CEG compris. Sur ${FR.eur(36000)} brut par an, la retraite complémentaire absorbe ${FR.eur(m3.lignes.retraiteCompl)}.` },
    ],
    body: (h) => `
<h2>Les taux 2026 appliqués au salaire du président</h2>
<p>Le président de SASU n’a pas de contrat de travail : il est mandataire social. Pour la sécurité sociale, il est pourtant rattaché au régime général, et sa rémunération supporte les taux du ${h.src('urssafTauxSalarie', 'secteur privé publiés par l’Urssaf pour 2026')}. Deux lignes disparaissent par rapport à une fiche de paie classique : l’assurance chômage et la cotisation AGS. Les taux réduits et la réduction générale, réservés aux salariés, ne s’appliquent pas non plus.</p>
${h.table(['Cotisation', 'Part société', 'Part président', 'Assiette'], [
  ['Maladie, maternité, invalidité', h.pct(E.maladie, 0), '–', 'totalité du brut'],
  ['Vieillesse plafonnée', h.pct(E.vieillesse_plafonnee, 2), h.pct(S.vieillesse_plafonnee, 2), `jusqu’à ${h.eur(P.pass.annuel)}`],
  ['Vieillesse déplafonnée', h.pct(E.vieillesse_deplafonnee, 2), h.pct(S.vieillesse_deplafonnee, 2), 'totalité du brut'],
  ['Allocations familiales', h.pct(E.alloc_familiales, 2), '–', 'totalité du brut'],
  ['Agirc-Arrco, tranche 1', h.pct(E.agirc_t1, 2), h.pct(S.agirc_t1, 2), `jusqu’à ${h.eur(P.pass.annuel)}`],
  ['Contribution d’équilibre général, tranche 1', h.pct(E.ceg_t1, 2), h.pct(S.ceg_t1, 2), `jusqu’à ${h.eur(P.pass.annuel)}`],
  ['Accidents du travail (taux moyen)', h.pct(E.atmp, 2), '–', 'totalité du brut'],
  ['CSA, FNAL, formation, apprentissage', h.pct(E.csa + E.fnal + E.formation + E.taxe_apprentissage, 2), '–', 'totalité du brut'],
  ['Prévoyance cadre (hypothèse Urssaf)', h.pct(E.prevoyance_cadre_t1, 1), '–', `jusqu’à ${h.eur(P.pass.annuel)}`],
  ['CSG et CRDS', '–', h.pct(csgTotal, 1), `${h.pct(C.assiette, 2)} du brut`],
], 'Taux de cotisations 2026 sur la rémunération d’un président de SAS ou de SASU, entreprise de moins de 11 salariés', ['l', 'r', 'r', 'l'])}
<p>Le plafond annuel de la sécurité sociale, ${h.eur(P.pass.annuel)} en 2026, sépare la tranche 1 du reste : au-dessus, la vieillesse plafonnée s’arrête et l’Agirc-Arrco passe à ${h.pct(E.agirc_t2 + S.agirc_t2, 2)} au total. La CSG se divise en ${h.pct(C.deductible, 1)} déductible et ${h.pct(C.non_deductible, 1)} imposable, auxquels s’ajoute ${h.pct(C.crds, 1)} de CRDS.</p>

<h2>Quatre niveaux de salaire chiffrés</h2>
<p>Le tableau suivant reprend le calcul du moteur, aligné sur le ${h.src('monEntreprise', 'modèle publié par l’Urssaf')} : il s’en écarte de moins de trois millièmes dans nos tests. Les montants sont annuels.</p>
${h.table(['Brut annuel', 'Part patronale', 'Part salariale et CSG-CRDS', 'Net avant impôt', 'Coût pour la société', 'Net / coût'], niveaux.map(({ b, a }) => [h.eur(b), h.eur(a.employeur), h.eur(a.salarie + a.csgCrds), h.eur(a.net), h.eur(a.cout), h.pct(a.net / a.cout, 1)]), 'Président de SASU en 2026 : du salaire brut au coût total, sans mutuelle ni réduction de cotisations', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Le rapport entre net et coût reste stable : autour de ${h.pct(m3.net / m3.cout, 0)}. Au-delà du plafond, il bouge à peine : la vieillesse plafonnée cesse, mais la tranche 2 de l’Agirc-Arrco, plus chère, prend le relais. À ${h.eur(70000)} brut, la retraite complémentaire coûte ${h.eur(niveaux[3].a.lignes.retraiteCompl)} sur l’année, part du président comprise.</p>

<h2>Où partent les ${h.eur(charges3)} d’un salaire de ${h.eur(36000)}</h2>
<p>Pour un président payé ${h.eur(3000)} brut par mois, la société verse ${h.eur(m3.cout)} sur l’année et le président en garde ${h.eur(m3.net)}. La différence se ventile ainsi : ${h.eur(m3.lignes.maladie)} pour l’assurance maladie, ${h.eur(m3.lignes.vieillesse)} pour la vieillesse de base, ${h.eur(m3.lignes.retraiteCompl)} pour l’Agirc-Arrco, ${h.eur(m3.lignes.allocations)} pour les allocations familiales, ${h.eur(m3.lignes.csg)} de CSG-CRDS, et ${h.eur(m3.lignes.autres)} pour les contributions diverses, accidents du travail et prévoyance compris.</p>
<p>Toutes ces sommes sont des charges de la société : elles diminuent le bénéfice soumis à l’${h.a('impot-sur-les-societes', 'impôt sur les sociétés')}. Le président, lui, déclare à l’impôt sur le revenu un net imposable de ${h.eur(m3.netImposable)}, plus élevé que le net versé parce que la CSG non déductible et la CRDS y sont réintégrées.</p>

<h2>SASU ou EURL : le même budget, deux nets</h2>
<p>Confiez ${h.eur(m3.cout)} à un gérant majoritaire d’EURL plutôt qu’à un président de SASU. Le gérant est travailleur indépendant : ses cotisations suivent le ${h.src('urssafTauxAC', 'barème des indépendants')}, calculé sur une assiette abattue de ${h.pct(P.tns.abattement, 0)}. Il garde ${h.eur(netTns)}, contre ${h.eur(m3.net)} pour le président. Le surcoût de la SASU paie l’Agirc-Arrco des salariés et la prévoyance cadre, absentes du barème du gérant. Le choix complet, dividendes compris, est développé sur ${h.a('eurl-ou-sasu', 'EURL ou SASU')} ; le détail des cotisations du gérant sur ${h.a('cotisations-tns', 'les cotisations TNS')}.</p>

<h2>Trois situations à connaître</h2>
<h3>Pas de salaire du tout</h3>
<p>Sans rémunération, la ligne des charges sociales du président reste vide dans les comptes de la SASU, et ses droits sociaux attachés au mandat aussi. Le partage entre rémunération et dividendes est l’objet de la page ${h.a('salaire-ou-dividendes', 'salaire ou dividendes')}.</p>
<h3>Un démarrage avec l’Acre</h3>
<p>Depuis 2026, l’Acre se demande à l’Urssaf dans les ${h.num(P.micro.acre.delai_demande_jours)} jours qui suivent le début d’activité, et le président doit contrôler la société (${h.src('urssafAcre2026', 'conditions de l’Urssaf')}). Le mini-simulateur ne l’intègre pas.</p>
<h3>La mutuelle et les avantages en nature</h3>
<p>Le moteur ne compte ni complémentaire santé, ni véhicule, ni logement fourni par la société. Ils modifient le brut soumis à cotisations et doivent être ajoutés à part.</p>
<p>Les montants de cette page sont des estimations fondées sur les taux publiés ; l’Urssaf calcule seule les cotisations dues, et un professionnel peut seul vérifier votre situation précise.</p>`,
  },
  en: {
    slug: 'sasu-president-pay',
    nav: 'SASU president pay costs',
    card: 'The president’s contributions line by line, from gross pay to total cost.',
    title: 'SASU president pay 2026: social charges, gross and net',
    description: 'SASU president pay in France 2026: each contribution on a director’s salary, health at 13%, pensions, CSG-CRDS, no unemployment cover, cost of €3,000 gross.',
    h1: 'What a SASU president’s salary really costs',
    intro: 'A French company president is paid like an executive employee, minus unemployment insurance. Here is what each contribution takes.',
    resume: `If you run a SASU (société par actions simplifiée unipersonnelle, a one-shareholder simplified company) and pay yourself ${EN.eur(3000)} gross a month, the company spends ${EN.eur(m3.cout / 12)} a month and you receive ${EN.eur(m3.net / 12)} net before income tax, using the 2026 private-sector rates published by the Urssaf, the body that collects French social contributions. Of that total cost, ${EN.pct(charges3 / m3.cout)} goes on contributions: ${EN.eur(m3.employeur / 12)} on the employer side, ${EN.eur(m3.salarie / 12)} on the employee side and ${EN.eur(m3.csgCrds / 12)} of CSG-CRDS, two social levies charged on top of contributions. The reason is your status. As a company officer you join the régime général, the employee social security scheme: health insurance at ${EN.pct(E.maladie, 0)} paid by the company, old-age pension, family benefits and Agirc-Arrco supplementary pension, but no unemployment insurance and no AGS wage-guarantee levy, since you have no employment contract. The general reduction in employer contributions, meant for employees, does not apply either. Net pay of ${EN.eur(2000)} a month needs ${EN.eur(vise.brut / 12)} gross.`,
    faqs: [
      { q: 'What percentage goes in charges on a SASU president’s salary?', a: `Measured against total cost, contributions and CSG-CRDS take ${EN.pct(charges3 / m3.cout)} of a ${EN.eur(3000)} gross monthly salary: the company spends ${EN.eur(m3.cout / 12)} and you receive ${EN.eur(m3.net / 12)}. Measured against net pay, they add ${EN.pct(charges3 / m3.net, 0)}. The ratio barely moves with the salary level, because no contribution relief applies to a company president.` },
      { q: 'What gross salary gives €2,000 net a month as a SASU president?', a: `About ${EN.eur(vise.brut / 12)} gross a month with the Urssaf’s 2026 rates. The company then bears ${EN.eur(vise.cout / 12)} a month including employer contributions, ${EN.eur(vise.cout)} over the year, all deductible from its profit. Income tax still comes out of that net: you declare taxable pay of ${EN.eur(vise.netImposable / 12)} a month, slightly above what you receive.` },
      { q: 'Why does a SASU president cost more than an EURL manager?', a: `Because employee-scheme rates are higher than self-employed ones. With the same ${EN.eur(m3.cout)} a year, a SASU president nets ${EN.eur(m3.net)}, while the majority manager of an EURL keeps ${EN.eur(netTns)} after self-employed contributions. The gap pays for lines the manager does not have in that form, such as Agirc-Arrco and executive provident cover.` },
      { q: 'Does the general contribution reduction apply to a SASU president?', a: `No. The réduction générale, France’s main cut in employer contributions on lower salaries, targets employees with an employment contract. A president is a company officer, so contributions run at the full rate from the first euro, as in the Urssaf’s own calculator on mon-entreprise. Even a small salary costs about ${EN.pct(m3.cout / m3.brut - 1, 0)} more than its gross amount.` },
      { q: 'What does a SASU president pay towards a French pension?', a: `Two layers. Basic old-age pension: ${EN.pct(E.vieillesse_plafonnee, 2)} from the company and ${EN.pct(S.vieillesse_plafonnee, 1)} from you up to the ${EN.eur(P.pass.annuel)} social security ceiling, plus a slice on the whole salary. Agirc-Arrco supplementary pension: ${EN.pct(retraiteEmp + retraiteSal, 2)} in band 1, balancing levy included. On ${EN.eur(36000)} gross a year, supplementary pension takes ${EN.eur(m3.lignes.retraiteCompl)}.` },
    ],
    body: (h) => `
<h2>The 2026 rates on a president’s salary</h2>
<p>A SASU president has no employment contract: legally you are a mandataire social, a company officer. Social security nevertheless places you in the employee scheme, so your pay bears the ${h.src('urssafTauxSalarie', '2026 private-sector rates published by the Urssaf')}. Two lines from a normal French payslip are missing: unemployment insurance and the AGS wage-guarantee levy. Reduced rates and the general contribution reduction, both reserved for employees, do not apply.</p>
${h.table(['Contribution', 'Company share', 'President share', 'Base'], [
  ['Health, maternity, disability', h.pct(E.maladie, 0), '–', 'whole gross salary'],
  ['Old age, capped', h.pct(E.vieillesse_plafonnee, 2), h.pct(S.vieillesse_plafonnee, 2), `up to ${h.eur(P.pass.annuel)}`],
  ['Old age, uncapped', h.pct(E.vieillesse_deplafonnee, 2), h.pct(S.vieillesse_deplafonnee, 2), 'whole gross salary'],
  ['Family benefits', h.pct(E.alloc_familiales, 2), '–', 'whole gross salary'],
  ['Agirc-Arrco, band 1', h.pct(E.agirc_t1, 2), h.pct(S.agirc_t1, 2), `up to ${h.eur(P.pass.annuel)}`],
  ['Balancing levy (CEG), band 1', h.pct(E.ceg_t1, 2), h.pct(S.ceg_t1, 2), `up to ${h.eur(P.pass.annuel)}`],
  ['Work accidents (average rate)', h.pct(E.atmp, 2), '–', 'whole gross salary'],
  ['CSA, FNAL, training, apprenticeship', h.pct(E.csa + E.fnal + E.formation + E.taxe_apprentissage, 2), '–', 'whole gross salary'],
  ['Executive provident cover (Urssaf assumption)', h.pct(E.prevoyance_cadre_t1, 1), '–', `up to ${h.eur(P.pass.annuel)}`],
  ['CSG and CRDS', '–', h.pct(csgTotal, 1), `${h.pct(C.assiette, 2)} of gross`],
], '2026 contribution rates on the pay of a SAS or SASU president, company with fewer than 11 employees', ['l', 'r', 'r', 'l'])}
<p>The annual social security ceiling, known as the Pass (${h.eur(P.pass.annuel)} in 2026), divides band 1 from the rest. Above it, the capped old-age line stops and Agirc-Arrco rises to ${h.pct(E.agirc_t2 + S.agirc_t2, 2)} in total. CSG splits into ${h.pct(C.deductible, 1)} deductible from taxable income and ${h.pct(C.non_deductible, 1)} not deductible, with ${h.pct(C.crds, 1)} of CRDS on top.</p>

<h2>Four salary levels worked out</h2>
<p>The engine behind this table follows the ${h.src('monEntreprise', 'calculation model the Urssaf publishes')} and stays within three thousandths of it in our tests. Amounts are yearly.</p>
${h.table(['Gross a year', 'Employer share', 'Employee share and CSG-CRDS', 'Net before tax', 'Cost to the company', 'Net / cost'], niveaux.map(({ b, a }) => [h.eur(b), h.eur(a.employeur), h.eur(a.salarie + a.csgCrds), h.eur(a.net), h.eur(a.cout), h.pct(a.net / a.cout, 1)]), 'SASU president in 2026: from gross salary to total cost, no health top-up, no contribution relief', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Net pay stays at roughly ${h.pct(m3.net / m3.cout, 0)} of what the company spends. Above the ceiling it hardly moves: the capped old-age line stops, but the dearer band 2 of Agirc-Arrco takes over. At ${h.eur(70000)} gross, supplementary pension costs ${h.eur(niveaux[3].a.lignes.retraiteCompl)} a year, both shares included.</p>

<h2>Where ${h.eur(charges3)} goes on a ${h.eur(36000)} salary</h2>
<p>Paid ${h.eur(3000)} gross a month, a president costs the company ${h.eur(m3.cout)} a year and keeps ${h.eur(m3.net)}. The gap breaks down into ${h.eur(m3.lignes.maladie)} of health insurance, ${h.eur(m3.lignes.vieillesse)} of basic pension, ${h.eur(m3.lignes.retraiteCompl)} of Agirc-Arrco, ${h.eur(m3.lignes.allocations)} of family benefits, ${h.eur(m3.lignes.csg)} of CSG-CRDS and ${h.eur(m3.lignes.autres)} of smaller levies, work-accident and provident cover included.</p>
<p>All of it is a company expense that lowers the profit subject to ${h.a('impot-sur-les-societes', 'corporate tax')}. On your personal return you declare taxable pay of ${h.eur(m3.netImposable)}, higher than the net you receive because non-deductible CSG and CRDS are added back.</p>

<h2>SASU or EURL: one budget, two nets</h2>
<p>Hand the same ${h.eur(m3.cout)} to the majority manager of an EURL instead. That manager is a travailleur non salarié (TNS), self-employed for social security, with contributions on the ${h.src('urssafTauxAC', 'self-employed scale')} applied after a ${h.pct(P.tns.abattement, 0)} allowance. The manager keeps ${h.eur(netTns)}, against ${h.eur(m3.net)} for the president. The SASU premium pays for employee-style Agirc-Arrco and executive provident cover, which the manager’s scale does not include. The whole choice, dividends included, is on ${h.a('eurl-ou-sasu', 'EURL or SASU')}; the manager’s side is on ${h.a('cotisations-tns', 'self-employed contributions')}.</p>

<h2>Three situations worth knowing</h2>
<h3>No salary at all</h3>
<p>An unpaid president pays no contributions and the company owes nothing for them, but the role then builds no social rights. How to split pay and dividends is covered on ${h.a('salaire-ou-dividendes', 'salary or dividends')}.</p>
<h3>Starting with Acre relief</h3>
<p>Since 2026, Acre, the French start-up contribution relief, must be requested from the Urssaf within ${h.num(P.micro.acre.delai_demande_jours)} days of starting, and the president must control the company (${h.src('urssafAcre2026', 'Urssaf conditions')}). The mini-calculator leaves it out.</p>
<h3>Health top-up and benefits in kind</h3>
<p>The engine counts no mutuelle (top-up health insurance), company car or housing. These change the gross pay subject to contributions and need adding separately.</p>
<h2>Reading a French payslip as a president</h2>
<p>Your pay is worked out like an employee’s, with the company and president columns shown above, and three French terms matter. The brut is the gross figure agreed for your role. The net à payer is what lands in your bank account. The net imposable is the figure the tax office uses, and it sits above the net paid because ${h.pct(C.non_deductible, 1)} of CSG and the ${h.pct(C.crds, 1)} CRDS cannot be deducted from income. If you are used to a system where the employer pays almost everything, note that in France the employee side is substantial: on ${h.eur(36000)} gross, ${h.eur(m3.salarie + m3.csgCrds)} comes off your own share.</p>
<p>All amounts here are estimates from published rates. The Urssaf alone sets the contributions actually owed, and only a professional can check your particular case.</p>`,
  },
});
