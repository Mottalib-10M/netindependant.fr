import { defineGuide } from '../../lib/guide-types';
import { micro, seuilVL } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main) : salaire déjà imposable dans le foyer + activité libérale.
const SAL = 30000;
const side = (ca: number, autres = SAL, vl = false) => micro({ ca, activite: 'bnc', autres, vl });
const base = side(12000);
const baseVL = side(12000, SAL, true);
const petit = side(6000);
const gros = side(24000);
const grosVL = side(24000, SAL, true);
const salBas = side(12000, 18000);
const salHaut = side(12000, 45000);
const vendeur = micro({ ca: 15000, activite: 'vente', autres: SAL });
const vl1 = seuilVL(1, 2026), vl2 = seuilVL(2, 2026), vl1b = seuilVL(1, 2027);

export default defineGuide({
  id: 'auto-entrepreneur-salarie',
  group: 'micro',
  order: 100,
  mini: 'cumulSalarie',
  related: ['versement-liberatoire', 'impot-auto-entrepreneur', 'devenir-auto-entrepreneur', 'cfe-auto-entrepreneur', 'auto-entrepreneur-liberal'],
  sources: ['spMicroImposition', 'impotsVL', 'spCotisationsMicro', 'spCfe', 'spBareme'],
  fr: {
    slug: 'auto-entrepreneur-et-salarie',
    nav: 'Auto-entrepreneur et salarié',
    card: 'Ce qu’une activité à côté du salaire rapporte vraiment, impôt du foyer compris.',
    title: 'Auto-entrepreneur et salarié 2026 : impôt, charges et net',
    description: 'Auto-entrepreneur et salarié en 2026 : 25,6 % de cotisations en libéral sur le chiffre d’affaires, puis un impôt calculé au taux du foyer, salaire compris.',
    h1: 'Salarié et auto-entrepreneur en même temps : ce qui reste vraiment',
    intro: 'Le salaire ne change rien aux cotisations de l’activité, mais il décide presque seul de l’impôt qu’elle va coûter.',
    resume: `Un salarié peut ouvrir une micro-entreprise à côté de son emploi : l’activité paie ses propres cotisations sur le chiffre d’affaires encaissé, au même taux que pour n’importe quel micro-entrepreneur, soit ${FR.pct(P.micro.taux.bnc)} en libéral non réglementé, ${FR.pct(P.micro.taux.bic)} pour des prestations commerciales ou artisanales et ${FR.pct(P.micro.taux.vente)} pour la vente. La vraie différence se joue sur l’impôt sur le revenu : après l’abattement forfaitaire, le revenu de l’activité s’ajoute au salaire dans la déclaration du foyer et se trouve taxé à la tranche que le salaire a déjà atteinte. Avec ${FR.eur(SAL)} de salaire imposable et ${FR.eur(12000)} encaissés en libéral, une personne seule paie ${FR.eur(base.cotisations + base.cfp)} de cotisations et CFP puis ${FR.eur(base.ir)} d’impôt supplémentaire : il lui reste ${FR.eur(base.net)} sur l’année, ${FR.eur(base.netMensuel)} par mois. Le versement libératoire porterait ce reste à ${FR.eur(baseVL.net)}, à condition que le revenu fiscal de référence le permette.`,
    faqs: [
      { q: 'Combien d’impôt en plus si j’ajoute une micro-entreprise à mon salaire ?', a: `Tout dépend de la tranche où vous place déjà le salaire. Avec ${FR.eur(12000)} encaissés en libéral, l’abattement de ${FR.pct(P.micro.abattement.bnc, 0)} laisse ${FR.eur(base.revenuAbattu)} imposables. Une personne seule qui gagne ${FR.eur(18000)} paie ${FR.eur(salBas.ir)} de plus ; à ${FR.eur(SAL)} ou ${FR.eur(45000)} de salaire, le supplément passe à ${FR.eur(base.ir)}, au barème 2026 publié par service-public.` },
      { q: 'Un salarié peut-il choisir le versement libératoire ?', a: `Oui, si le revenu fiscal de référence de 2024 du foyer ne dépasse pas ${FR.eur(vl1)} par part pour une option en 2026, soit ${FR.eur(vl2)} pour un couple sans enfant. Le salaire entre dans ce revenu : un cadre bien payé en est souvent exclu. Pour une option qui prend effet en 2027, la limite passe à ${FR.eur(vl1b)} par part selon service-public.` },
      { q: 'Faut-il payer des cotisations Urssaf sur l’activité alors que mon employeur cotise déjà ?', a: `Oui. Les cotisations de la micro-entreprise se calculent sur son seul chiffre d’affaires, sans tenir compte du salaire : ${FR.eur(base.cotisations)} pour ${FR.eur(12000)} encaissés en libéral en 2026. Elles sont définitives, sans régularisation. En contrepartie, un mois sans encaissement ne coûte rien, à condition de déclarer quand même un chiffre d’affaires nul.` },
      { q: 'Une petite activité à côté du salaire paie-t-elle la CFE ?', a: `L’année de création, non, et l’année suivante la base est réduite de moitié. Ensuite, la cotisation foncière n’est pas due si le chiffre d’affaires de l’avant-dernière année n’a pas dépassé ${FR.eur(P.cfe.exoneration_ca)}, selon service-public. Une activité du soir à ${FR.eur(400)} par mois reste donc hors CFE, ce qu’oublient beaucoup de salariés qui craignent une taxe fixe.` },
      { q: `Le versement libératoire vaut-il le coup avec un salaire de ${FR.eur(SAL)} ?`, a: `Pour une personne seule dont le salaire imposable atteint ${FR.eur(SAL)}, chaque euro abattu de l’activité tombe dans la tranche à ${FR.pct(P.ir.bareme[2][1], 0)}. Sur ${FR.eur(24000)} encaissés en libéral, l’impôt au barème coûterait ${FR.eur(gros.ir)}, contre ${FR.eur(grosVL.vl)} avec le versement libératoire. Encore faut-il que le revenu fiscal de référence reste sous ${FR.eur(vl1)} par part.` },
    ],
    body: (h) => `
<h2>Deux revenus, deux circuits</h2>
<p>Le salaire et l’activité indépendante ne passent pas par les mêmes guichets. L’employeur prélève les cotisations sur la fiche de paie ; la micro-entreprise déclare son chiffre d’affaires à l’Urssaf chaque mois ou chaque trimestre, et paie au même moment ses cotisations, au taux de son activité (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}). Aucun des deux ne réduit l’autre. Les deux se retrouvent en revanche au printemps, sur la même déclaration de revenus : le salaire à sa ligne habituelle, le chiffre d’affaires brut de l’activité sur la déclaration complémentaire 2042-C-PRO, sans déduire de frais.</p>
<p>C’est là que le salaire pèse. L’administration retire du chiffre d’affaires un abattement forfaitaire (${h.pct(P.micro.abattement.bnc, 0)} en libéral, ${h.pct(P.micro.abattement.bic, 0)} pour des prestations BIC, ${h.pct(P.micro.abattement.vente, 0)} pour la vente) et ajoute le reste au revenu du foyer (${h.src('spMicroImposition', 'fiche F23267')}). Ce reste ne démarre pas au bas du barème : il s’empile au-dessus du salaire.</p>

<h2>Ce que rapporte l’activité, selon son volume</h2>
<p>Prenons une personne seule, ${h.eur(SAL)} de salaire déjà imposable après la déduction de ${h.pct(P.ir.abattement_salaires.taux, 0)} pour frais, qui ajoute une activité de conseil en libéral.</p>
${h.table(['Encaissé dans l’année', 'Cotisations et CFP', 'Impôt en plus (barème)', 'Reste au barème', 'Reste avec versement libératoire'],
  [[petit, side(6000, SAL, true), 6000], [base, baseVL, 12000], [gros, grosVL, 24000]].map(([m, v, ca]) => {
    const a = m as ReturnType<typeof micro>, b = v as ReturnType<typeof micro>;
    return [h.eur(ca as number), h.eur(a.cotisations + a.cfp), h.eur(a.ir), h.eur(a.net), h.eur(b.net)];
  }),
  `Activité libérale à côté d’un salaire de ${h.eur(SAL)} imposables, personne seule, barème 2026`, ['r', 'r', 'r', 'r', 'r'])}
<p>Avec ce niveau de salaire, chaque euro tiré de l’activité supporte d’abord ${h.pct(P.micro.taux.bnc)} de cotisations, puis l’impôt à ${h.pct(P.ir.bareme[2][1], 0)} sur la part non abattue. Sur ${h.eur(12000)} encaissés, il reste ${h.eur(base.net)}, soit ${h.pct(base.net / 12000, 0)} du chiffre d’affaires.</p>

<h2>Le même projet, trois salaires</h2>
<p>Le chiffre d’affaires et les cotisations ne bougent pas ; seul l’impôt supplémentaire change avec la tranche du salarié (${h.src('spBareme', 'barème 2026, fiche F1419')}).</p>
${h.table(['Salaire imposable', 'Impôt dû à cause de l’activité', 'Reste de l’activité sur l’année', 'Par mois'],
  [[18000, salBas], [SAL, base], [45000, salHaut]].map(([s, m]) => { const a = m as ReturnType<typeof micro>; return [h.eur(s as number), h.eur(a.ir), h.eur(a.net), h.eur(a.netMensuel)]; }),
  `${h.eur(12000)} encaissés en libéral, personne seule, impôt calculé par différence`, ['r', 'r', 'r', 'r'])}
<p>À ${h.eur(18000)}, une partie du revenu de l’activité tombe encore dans la tranche à ${h.pct(P.ir.bareme[1][1], 0)}. À partir d’environ ${h.eur(P.ir.bareme[1][0])} de revenu imposable pour une part, tout passe à ${h.pct(P.ir.bareme[2][1], 0)}, d’où l’égalité entre les deux salaires les plus élevés. Un couple ou une famille répartit ce revenu sur plus de parts : le ${h.a('home', 'simulateur complet')} accepte la composition du foyer.</p>

<h2>Le versement libératoire, une option pour salariés modestes</h2>
<p>L’option remplace l’impôt au barème sur l’activité par un pourcentage fixe du chiffre d’affaires : ${h.pct(P.micro.vl.bnc)} en libéral, ${h.pct(P.micro.vl.bic)} pour des services BIC, ${h.pct(P.micro.vl.vente, 0)} pour la vente (${h.src('impotsVL', 'impots.gouv.fr')}). Pour un salarié déjà taxé à ${h.pct(P.ir.bareme[2][1], 0)}, le gain est net. Le piège tient à la condition d’accès : le revenu fiscal de référence de 2024, qui contient le salaire, ne doit pas dépasser ${h.eur(vl1)} par part pour une option en 2026 (${h.eur(vl2)} pour un couple). Paradoxe : le salarié qui y gagnerait le plus est souvent celui qui n’y a pas droit.</p>
<p>Si vous l’obtenez, deux réflexes : le revenu abattu de l’activité continue de compter pour le taux appliqué au salaire, et il faut supprimer l’acompte de prélèvement à la source sur l’activité dans l’espace particulier, sous peine de payer deux fois. Le détail est sur ${h.a('versement-liberatoire', 'le versement libératoire')}.</p>

<h2>Et si l’activité est de la revente ?</h2>
<p>L’abattement de la vente, ${h.pct(P.micro.abattement.vente, 0)}, change la donne. Un salarié à ${h.eur(SAL)} qui revend pour ${h.eur(15000)} d’objets paie ${h.eur(vendeur.cotisations + vendeur.cfp + vendeur.tfc)} de prélèvements sociaux et ${h.eur(vendeur.ir)} d’impôt supplémentaire. Mais ce chiffre d’affaires comprend le prix d’achat des marchandises, que le moteur ne déduit pas : la page ${h.a('auto-entrepreneur-vente', 'auto-entrepreneur en vente')} fait le calcul avec la marge.</p>

<h2>Ce que le statut de salarié ne donne pas</h2>
<p>L’Acre, la réduction de cotisations des débuts, n’est plus automatique depuis 2026. La liste des bénéficiaires vise les demandeurs d’emploi, les allocataires de minima sociaux, certains jeunes et quelques cas précis ; le simple salarié n’y figure pas, sauf s’il reprend une entreprise en difficulté. Voir ${h.a('acre-auto-entrepreneur', 'l’Acre en 2026')}.</p>
<p>Les plafonds restent ceux de tout micro-entrepreneur : ${h.eur(P.micro.plafonds.services)} pour les services, ${h.eur(P.micro.plafonds.vente)} pour la vente. La franchise de TVA aussi : au-delà de ${h.eur(P.tva.services.seuil)} encaissés en services, la TVA arrive au 1er janvier suivant, et dès le jour du dépassement au-delà de ${h.eur(P.tva.services.majore)}.</p>

<h2>Le calendrier d’un salarié qui se lance</h2>
<p>La première déclaration à l’Urssaf intervient au plus tôt quatre-vingt-dix jours après le début d’activité, puis au rythme choisi. La cotisation foncière des entreprises n’est pas due l’année de création, réduite de moitié l’année suivante, et nulle tant que le chiffre d’affaires de l’avant-dernière année ne dépasse pas ${h.eur(P.cfe.exoneration_ca)} (${h.src('spCfe', 'fiche F23547')}). Une activité du soir ou du week-end y échappe donc souvent.</p>
<p>Les montants de cette page sont des estimations établies avec le barème 2026, pas un conseil personnalisé : l’Urssaf et le service des impôts fixent ce que vous devez.</p>`,
  },
  en: {
    slug: 'side-business-with-a-job',
    nav: 'Side business with a job',
    card: 'What a micro-enterprise alongside your salary really adds, household tax included.',
    title: 'Side business with a job 2026: micro-enterprise and tax',
    description: 'Side business with a job in France, 2026: 25.6% contributions on freelance turnover, then income tax at the rate your salary already reached in the household.',
    h1: 'Running a micro-enterprise alongside a salaried job in France',
    intro: 'Your salary does not change the contributions on your side business, but it largely decides how much income tax the business costs you.',
    resume: `If you work as an employee (salarié) in France, you can also register a micro-enterprise, the simplified self-employed scheme, and invoice clients on the side. The side business pays its own social contributions to the Urssaf, the collection agency, on the turnover it receives, at the same rates as anyone: ${EN.pct(P.micro.taux.bnc)} for unregulated freelance work, ${EN.pct(P.micro.taux.bic)} for commercial or craft services, ${EN.pct(P.micro.taux.vente)} for selling goods. Your job matters for income tax. After a flat allowance, the side income is added to your salary on the household tax return and taxed at the bracket your salary has already reached. A single person with ${EN.eur(SAL)} of taxable salary who receives ${EN.eur(12000)} of freelance fees pays ${EN.eur(base.cotisations + base.cfp)} in contributions and training levy, then ${EN.eur(base.ir)} of extra income tax, keeping ${EN.eur(base.net)} over the year, ${EN.eur(base.netMensuel)} a month. The flat-rate tax option would raise that to ${EN.eur(baseVL.net)}, if household income allows it.`,
    faqs: [
      { q: 'Does my employment contract stop me registering a micro-enterprise in France?', a: `French social and tax rules do not: the micro-enterprise pays its own contributions on its turnover, ${EN.pct(P.micro.taux.bnc)} for freelance work in 2026, whatever your salary. What your contract says about other activities is a matter between you and your employer, which this site cannot check. Read it before registering.` },
      { q: 'How is side-business income taxed when I already earn a salary?', a: `The tax office takes your turnover, removes a flat allowance (${EN.pct(P.micro.abattement.bnc, 0)} for freelance fees) and adds the rest to your household income. On ${EN.eur(12000)} of fees, ${EN.eur(base.revenuAbattu)} becomes taxable. A single person earning ${EN.eur(18000)} pays ${EN.eur(salBas.ir)} more tax; at ${EN.eur(SAL)} the extra is ${EN.eur(base.ir)}, under the 2026 scale.` },
      { q: 'Who can use the flat-rate tax option on side income?', a: `The versement libératoire replaces income tax on the business with ${EN.pct(P.micro.vl.bnc)} of freelance turnover. To use it in 2026, your household’s 2024 reference tax income (revenu fiscal de référence, printed on your tax notice) must not exceed ${EN.eur(vl1)} per share, ${EN.eur(vl2)} for a couple. Your salary counts towards that figure.` },
      { q: 'Will a small evening business have to pay the CFE local business tax?', a: `Not in the year you start, and only half the base the year after. After that, no CFE is due when turnover two years earlier was ${EN.eur(P.cfe.exoneration_ca)} or less, according to service-public. A side activity bringing in a few hundred euros a month therefore often stays out of it.` },
      { q: 'Do I pay contributions in a month when my side business earns nothing?', a: `No. Contributions are a percentage of what you received, so zero turnover means zero to pay. You must still file the monthly or quarterly return on the Urssaf site, showing nil. Contributions are final: unlike self-employed people on real profit, there is no catch-up bill the next year.` },
    ],
    body: (h) => `
<h2>Two incomes, two separate systems</h2>
<p>Your employer deducts contributions from your payslip. Your micro-enterprise does its own thing: you declare its turnover online to the Urssaf every month or quarter and pay contributions at that moment, at the rate for your activity (${h.src('spCotisationsMicro', 'service-public sheet F36232')}). Neither reduces the other. They meet once a year on your income tax return: the salary where it always goes, and the gross turnover of the business on the additional form 2042-C-PRO, with no expenses deducted.</p>
<p>That is where your salary matters. The tax office applies a flat allowance to turnover (${h.pct(P.micro.abattement.bnc, 0)} for freelance fees, ${h.pct(P.micro.abattement.bic, 0)} for BIC services, ${h.pct(P.micro.abattement.vente, 0)} for sales) and adds what is left to your household income (${h.src('spMicroImposition', 'sheet F23267')}). France taxes households, not individuals, using a quotient familial (family quotient) of one share per adult plus extra shares for children. The side income sits on top of your salary in that calculation.</p>

<h2>What the business adds, by size</h2>
<p>Take a single person whose salary leaves ${h.eur(SAL)} of taxable income after the ${h.pct(P.ir.abattement_salaires.taux, 0)} employment-expense deduction, adding freelance consulting on the side.</p>
${h.table(['Received in the year', 'Contributions and training levy', 'Extra income tax (scale)', 'Kept, scale', 'Kept, flat-rate option'],
  [[petit, side(6000, SAL, true), 6000], [base, baseVL, 12000], [gros, grosVL, 24000]].map(([m, v, ca]) => {
    const a = m as ReturnType<typeof micro>, b = v as ReturnType<typeof micro>;
    return [h.eur(ca as number), h.eur(a.cotisations + a.cfp), h.eur(a.ir), h.eur(a.net), h.eur(b.net)];
  }),
  `Freelance side business next to ${h.eur(SAL)} of taxable salary, single person, 2026 scale`, ['r', 'r', 'r', 'r', 'r'])}
<p>At this salary each euro of side income first bears ${h.pct(P.micro.taux.bnc)} of contributions, then tax at ${h.pct(P.ir.bareme[2][1], 0)} on the part left after the allowance. On ${h.eur(12000)} you keep ${h.eur(base.net)}, ${h.pct(base.net / 12000, 0)} of turnover.</p>

<h2>Same side business, three salaries</h2>
${h.table(['Taxable salary', 'Tax caused by the business', 'Kept from the business per year', 'Per month'],
  [[18000, salBas], [SAL, base], [45000, salHaut]].map(([s, m]) => { const a = m as ReturnType<typeof micro>; return [h.eur(s as number), h.eur(a.ir), h.eur(a.net), h.eur(a.netMensuel)]; }),
  `${h.eur(12000)} of freelance fees, single person, tax measured as the difference`, ['r', 'r', 'r', 'r'])}
<p>At ${h.eur(18000)} part of the side income still falls in the ${h.pct(P.ir.bareme[1][1], 0)} band. Above roughly ${h.eur(P.ir.bareme[1][0])} of taxable income per share, all of it is taxed at ${h.pct(P.ir.bareme[2][1], 0)}, which is why the two higher salaries give the same result (${h.src('spBareme', '2026 scale, sheet F1419')}). Couples spread income over more shares; the ${h.a('home', 'full calculator')} lets you set your household.</p>

<h2>The flat-rate option, mostly for modest salaries</h2>
<p>The versement libératoire (flat-rate income tax payment) swaps scale tax on the business for a fixed share of turnover: ${h.pct(P.micro.vl.bnc)} for freelance fees, ${h.pct(P.micro.vl.bic)} for BIC services, ${h.pct(P.micro.vl.vente, 0)} for sales (${h.src('impotsVL', 'impots.gouv.fr')}). For someone already in the ${h.pct(P.ir.bareme[2][1], 0)} band, that is a big saving. The catch is the entry test: the 2024 reference tax income, salary included, must not exceed ${h.eur(vl1)} per share for 2026, ${h.eur(vl2)} for a couple. Those who would gain most are often the ones shut out.</p>
<p>If you do opt in, the side income still counts when setting the tax rate on your salary, and you should cancel the withholding instalment (prélèvement à la source, France’s pay-as-you-earn system) on the business in your online tax account so you do not pay twice. More on ${h.a('versement-liberatoire', 'the flat-rate option')}.</p>

<h2>When the side business resells goods</h2>
<p>Sales get a ${h.pct(P.micro.abattement.vente, 0)} allowance. An employee on ${h.eur(SAL)} reselling ${h.eur(15000)} of goods pays ${h.eur(vendeur.cotisations + vendeur.cfp + vendeur.tfc)} in social levies and ${h.eur(vendeur.ir)} of extra tax. That turnover includes what the goods cost you, so the real margin is thinner; see ${h.a('auto-entrepreneur-vente', 'selling goods as a micro-entrepreneur')}.</p>

<h2>What being an employee does not give you</h2>
<p>Acre, the reduced start-up rate, is no longer automatic from 2026 and its list targets jobseekers, people on minimum income, some young founders and a few other cases. A regular employee is not on it, unless taking over a company in insolvency proceedings; see ${h.a('acre-auto-entrepreneur', 'Acre in 2026')}.</p>
<p>The usual ceilings still apply: ${h.eur(P.micro.plafonds.services)} for services, ${h.eur(P.micro.plafonds.vente)} for sales. So does the VAT exemption: above ${h.eur(P.tva.services.seuil)} of service turnover you charge VAT from the next 1 January, and from the day you pass ${h.eur(P.tva.services.majore)}.</p>

<h2>The first months, in order</h2>
<p>Your first Urssaf return comes at the earliest ninety days after your start date, then at the rhythm you chose. The CFE (cotisation foncière des entreprises, a local business tax) is not due in year one, is halved in year two, and is not due at all while turnover two years earlier stayed at or under ${h.eur(P.cfe.exoneration_ca)} (${h.src('spCfe', 'sheet F23547')}).</p>
<p>The figures on this page are estimates based on the 2026 scale, not personal advice; the Urssaf and the tax office set what you actually owe.</p>`,
  },
});
