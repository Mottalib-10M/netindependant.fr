import { defineGuide } from '../../lib/guide-types';
import { micro, plafondProrata } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const lib = (ca: number, extra: Partial<Parameters<typeof micro>[0]> = {}) => micro({ ca, activite: 'bnc', ...extra });
const NIVEAUX = [20000, 40000, 60000, 80000];
const consultant = lib(40000);
const consultantVL = lib(40000, { vl: true });
const dev = lib(60000);
const cipav40 = micro({ ca: 40000, activite: 'cipav' });
const H = P.micro.historique_bnc;
const HISTO: Array<[string, string, number]> = [
  ['jusqu’en juin 2024', 'until June 2024', H.jusqu_a_2024_06],
  ['de juillet à décembre 2024', 'July to December 2024', H.depuis_2024_07],
  ['2025', '2025', H.y2025],
  ['2026', '2026', P.micro.taux.bnc],
];
const hausse = 40000 * (P.micro.taux.bnc - H.jusqu_a_2024_06);
const JOURS_1ER_MARS = 306; // du 1er mars au 31 décembre 2026 inclus
const prorata = plafondProrata('bnc', JOURS_1ER_MARS);
const rn = P.micro.repartition.bnc;
const tvaS = P.tva.services;

export default defineGuide({
  id: 'auto-entrepreneur-liberal',
  group: 'micro',
  order: 130,
  mini: 'netActivite',
  miniDefaults: { act: 3 },
  related: ['auto-entrepreneur-cipav', 'freelance-informatique', 'prestation-de-service', 'versement-liberatoire', 'tva-auto-entrepreneur', 'micro-ou-sasu'],
  sources: ['aeEssentiel', 'monEntreprise', 'decret2025943', 'spPlafonds', 'spMicroImposition'],
  fr: {
    slug: 'auto-entrepreneur-profession-liberale',
    nav: 'Auto-entrepreneur en libéral (BNC)',
    card: 'Le taux BNC de 2026, sa hausse depuis 2024 et ce qu’il reste à un consultant.',
    title: 'Auto-entrepreneur profession libérale 2026 : taux BNC et net',
    description: 'Auto-entrepreneur en profession libérale en 2026 : 25,6 % de cotisations BNC, abattement fiscal de 34 %, aucune taxe de chambre, TVA à partir de 37 500 €.',
    h1: 'Prestations intellectuelles en micro-entreprise : le régime BNC en 2026',
    intro: 'Le taux le plus élevé du régime, relevé trois fois depuis l’été 2024, et un abattement fiscal plus faible que celui des artisans.',
    resume: `Un auto-entrepreneur qui exerce une profession libérale non réglementée, consultant, développeur, graphiste, formateur, coach ou traducteur, déclare des bénéfices non commerciaux (BNC) et cotise en 2026 à ${FR.pct(P.micro.taux.bnc)} de son chiffre d’affaires encaissé, contre ${FR.pct(H.jusqu_a_2024_06)} jusqu’en juin 2024. S’y ajoute une contribution à la formation professionnelle de ${FR.pct(P.micro.cfp.liberal)}, sans taxe de chambre consulaire. Pour l’impôt, l’abattement forfaitaire n’est que de ${FR.pct(P.micro.abattement.bnc, 0)}, le plus faible du régime, et le versement libératoire coûte ${FR.pct(P.micro.vl.bnc)} du chiffre d’affaires. Le plafond est de ${FR.eur(P.micro.plafonds.services)}, la franchise de TVA s’arrête à ${FR.eur(tvaS.seuil)}. Un consultant seul qui encaisse ${FR.eur(40000)} paie ${FR.eur(consultant.cotisations)} de cotisations, ${FR.eur(consultant.cfp)} de CFP et ${FR.eur(consultant.ir)} d’impôt au barème : il lui reste ${FR.eur(consultant.net)}, soit ${FR.eur(consultant.netMensuel)} par mois avant CFE et frais. Les métiers rattachés à la Cipav, comme les architectes ou les psychologues, ont un taux distinct.`,
    faqs: [
      { q: 'Quel est le taux de cotisation d’un consultant auto-entrepreneur en 2026 ?', a: `${FR.pct(P.micro.taux.bnc)} du chiffre d’affaires encaissé pour un libéral non réglementé, plus ${FR.pct(P.micro.cfp.liberal)} de CFP, selon l’Urssaf. Sur ${FR.eur(40000)} encaissés, cela représente ${FR.eur(consultant.cotisations + consultant.cfp)}. Le taux était de ${FR.pct(H.y2025)} en 2025 : la hausse au 1er janvier 2026 coûte ${FR.eur(40000 * (P.micro.taux.bnc - H.y2025))} de plus par an à ce niveau d’activité.` },
      { q: 'Où partent les cotisations d’un libéral BNC en micro-entreprise ?', a: `Depuis le 1er janvier 2026, ${FR.pct(rn.retraite_base)} vont à la retraite de base et ${FR.pct(rn.retraite_compl)} à la complémentaire, soit ${FR.pct(rn.retraite_base + rn.retraite_compl)} au total, selon le décret du 8 septembre 2025. La CSG-CRDS prend ${FR.pct(rn.csg_crds)}, l’invalidité-décès ${FR.pct(rn.invalidite)} et la maladie seulement ${FR.pct(rn.maladie)}. La part de la CSG-CRDS a baissé au profit de la retraite.` },
      { q: `Un développeur freelance en micro doit-il facturer la TVA à ${FR.eur(40000)} ?`, a: `Pas forcément tout de suite. Le seuil de franchise est de ${FR.eur(tvaS.seuil)} sur l’année précédente : au-dessus, la TVA s’applique au 1er janvier suivant. Entre ${FR.eur(tvaS.seuil)} et ${FR.eur(tvaS.majore)} en cours d’année, la franchise tient encore ; au-delà du second seuil, la TVA est due dès le jour du dépassement, selon service-public.` },
      { q: `Le versement libératoire est-il rentable pour un libéral à ${FR.eur(40000)} ?`, a: `Pour une personne seule sans autre revenu, oui : ${FR.eur(consultantVL.vl)} de versement libératoire à ${FR.pct(P.micro.vl.bnc)}, contre ${FR.eur(consultant.ir)} d’impôt au barème après l’abattement de ${FR.pct(P.micro.abattement.bnc, 0)}. Il faut toutefois que le revenu fiscal de référence 2024 ne dépasse pas ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part pour une option en 2026.` },
      { q: 'Un formateur indépendant paie-t-il la CFE ?', a: `Le professeur qui dispense lui-même son enseignement, à domicile ou dans un local sans enseigne, figure parmi les exonérations de plein droit listées par service-public. Les autres libéraux paient la CFE à partir de la deuxième année, sauf si le chiffre d’affaires de l’avant-dernière année n’a pas dépassé ${FR.eur(P.cfe.exoneration_ca)}. Les traducteurs percevant des droits d’auteur sont aussi exonérés.` },
    ],
    body: (h) => `
<h2>Qui relève du régime BNC</h2>
<p>Le libéral non réglementé vend une prestation intellectuelle, conseil, développement informatique, design, rédaction, formation, accompagnement, sans figurer sur la liste des professions affiliées à la Cipav. Pour la maladie, il dépend de la CPAM comme tous les micro-entrepreneurs. Une liste fermée de professions, de l’architecte au moniteur de ski, relève au contraire de la Cipav, avec un taux de ${h.pct(P.micro.taux.cipav)} : voir ${h.a('auto-entrepreneur-cipav', 'les métiers de la Cipav')}. C’est l’activité déclarée lors de l’immatriculation qui détermine la caisse, pas le titre choisi sur le site web.</p>

<h2>Un taux relevé trois fois</h2>
<p>Aucune autre catégorie n’a autant bougé. Les pages qui affichent encore l’ancien taux se trompent de plusieurs centaines d’euros par an (${h.src('monEntreprise', 'Urssaf, mon-entreprise')}).</p>
${h.table(['Période', 'Taux BNC', `Cotisations sur ${h.eur(40000)}`],
  HISTO.map(([fr, , t]) => [fr, h.pct(t), h.eur(40000 * t)]),
  'Évolution du taux de cotisations des libéraux non réglementés en micro-entreprise', ['l', 'r', 'r'])}
<p>Depuis l’été 2024, un consultant à ${h.eur(40000)} verse ${h.eur(hausse)} de plus chaque année. La contrepartie se lit dans la répartition 2026 (${h.src('decret2025943', 'décret n° 2025-943')}) : ${h.pct(rn.retraite_base)} des cotisations à la retraite de base, ${h.pct(rn.retraite_compl)} à la complémentaire, seulement ${h.pct(rn.maladie)} à la maladie, ${h.pct(rn.invalidite)} à l’invalidité-décès et ${h.pct(rn.csg_crds)} à la CSG-CRDS.</p>

<h2>Ce qu’il reste, de ${h.eur(NIVEAUX[0])} à ${h.eur(NIVEAUX[NIVEAUX.length - 1])} encaissés</h2>
${h.table(['Encaissé', 'Cotisations et CFP', 'Impôt au barème', 'Reste annuel', 'Par mois', 'TVA'],
  NIVEAUX.map((ca) => { const m = lib(ca); return [h.eur(ca), h.eur(m.cotisations + m.cfp), h.eur(m.ir), h.eur(m.net), h.eur(m.netMensuel), m.tvaStatut === 'franchise' ? 'franchise' : m.tvaStatut === 'tolerance' ? 'franchise jusqu’au seuil majoré' : 'redevable'] }),
  'Libéral non réglementé en micro-entreprise, personne seule sans autre revenu, 2026', ['r', 'r', 'r', 'r', 'r', 'l'])}
<p>Le reste ne tient compte ni de la CFE ni des frais réels, ordinateur, logiciels, coworking, déplacements, que le régime micro ne déduit pas. Un développeur à ${h.eur(60000)} garde ainsi ${h.eur(dev.netMensuel)} par mois avant ces dépenses. À ce niveau, la comparaison avec une société devient utile : voir ${h.a('micro-ou-sasu', 'micro-entreprise ou SASU')}.</p>

<h2>Un abattement faible, un impôt plus lourd</h2>
<p>L’administration suppose qu’un libéral dépense ${h.pct(P.micro.abattement.bnc, 0)} de ses recettes (${h.src('spMicroImposition', 'fiche F23267')}), contre ${h.pct(P.micro.abattement.bic, 0)} pour un artisan. Sur ${h.eur(40000)}, ${h.eur(consultant.revenuAbattu)} entrent donc dans le revenu imposable. Pour une personne seule, l’impôt atteint ${h.eur(consultant.ir)} au barème, alors que le versement libératoire à ${h.pct(P.micro.vl.bnc)} coûterait ${h.eur(consultantVL.vl)}. L’option se demande à la création ou avant le 30 septembre pour l’année suivante, sous condition de revenu fiscal de référence : voir ${h.a('versement-liberatoire', 'le versement libératoire')}.</p>
<p>Le même abattement réduit les indemnités journalières : elles se calculent sur le chiffre d’affaires abattu de ${h.pct(P.micro.abattement.bnc, 0)}, et la maladie ne reçoit que ${h.pct(rn.maladie)} des cotisations BNC. Un libéral qui dépend de son seul revenu a intérêt à le savoir avant un arrêt.</p>

<h2>Seuils : TVA d’abord, plafond ensuite</h2>
<p>La franchise de TVA s’arrête à ${h.eur(tvaS.seuil)} de recettes, avec une tolérance jusqu’à ${h.eur(tvaS.majore)} en cours d’année. Un consultant qui travaille pour des entreprises récupérant la TVA y perd peu ; un coach dont les clients sont des particuliers, beaucoup. Le plafond du régime, ${h.eur(P.micro.plafonds.services)}, se proratise l’année de création : un début d’activité le 1er mars 2026 donne ${h.eur(prorata)}, exemple repris par ${h.src('spPlafonds', 'service-public')}. Voir ${h.a('tva-auto-entrepreneur', 'la TVA de l’auto-entrepreneur')}.</p>

<h2>Exonérations de CFE à connaître</h2>
<p>Certains libéraux ne paient jamais la cotisation foncière des entreprises : les professeurs qui donnent eux-mêmes leurs cours, à domicile ou dans un local sans enseigne, les traducteurs, auteurs et compositeurs qui perçoivent des droits d’auteur, les photographes auteurs et les dessinateurs artistes. Pour les autres, la CFE commence la deuxième année, à moitié. Le ${h.a('cfe-auto-entrepreneur', 'calcul par commune')} donne le montant.</p>

<h2>Libéral BNC ou Cipav : l’écart en euros</h2>
<p>À chiffre d’affaires égal, ${h.eur(40000)}, un consultant BNC verse ${h.eur(consultant.cotisations)} de cotisations, une ostéopathe relevant de la Cipav ${h.eur(cipav40.cotisations)}. La CFP de ${h.pct(P.micro.cfp.liberal)}, l’abattement et le versement libératoire sont identiques. Seuls le taux et la répartition entre risques diffèrent (${h.src('aeEssentiel', 'Urssaf')}).</p>
<p>Les montants affichés sont des estimations à partir des taux 2026, pas un conseil personnalisé : l’Urssaf et le service des impôts fixent ce qui est dû. Pour un développeur, la page ${h.a('freelance-informatique', 'développeur freelance')} compare les statuts.</p>`,
  },
  en: {
    slug: 'freelance-professions-bnc',
    nav: 'Freelance professions (BNC)',
    card: 'The 2026 BNC rate, how it rose since 2024 and what a consultant keeps.',
    title: 'Freelance professions BNC 2026: micro-enterprise rate, net',
    description: 'Freelance professions under the French micro scheme, 2026: 25.6% BNC contributions, a 34% tax allowance, no chamber levy and VAT from €37,500 of fees.',
    h1: 'Consultants, developers and designers on the French micro scheme',
    intro: 'The highest rate in the scheme, raised three times since mid-2024, with the smallest tax allowance.',
    resume: `Most freelancers who move to France and sell know-how, consulting, software development, design, copywriting, training or coaching, fall into the BNC category (bénéfices non commerciaux, non-commercial profits) as unregulated professionals. Under the micro-enterprise scheme they pay social contributions of ${EN.pct(P.micro.taux.bnc)} on fees received in 2026, up from ${EN.pct(H.jusqu_a_2024_06)} until June 2024, plus a ${EN.pct(P.micro.cfp.liberal)} training levy and no chamber levy. For income tax the State assumes only ${EN.pct(P.micro.abattement.bnc, 0)} of fees are costs, the smallest allowance in the scheme, and the flat-rate tax option costs ${EN.pct(P.micro.vl.bnc)} of fees. The ceiling is ${EN.eur(P.micro.plafonds.services)}; VAT exemption stops at ${EN.eur(tvaS.seuil)}. A single consultant receiving ${EN.eur(40000)} pays ${EN.eur(consultant.cotisations)} of contributions, ${EN.eur(consultant.cfp)} of training levy and ${EN.eur(consultant.ir)} of income tax, keeping ${EN.eur(consultant.net)}, or ${EN.eur(consultant.netMensuel)} a month before the CFE local business tax and costs. Some regulated professions belong to the Cipav fund and have their own rate.`,
    faqs: [
      { q: 'What contribution rate does a freelance consultant pay in France in 2026?', a: `${EN.pct(P.micro.taux.bnc)} of fees received for an unregulated profession, plus a ${EN.pct(P.micro.cfp.liberal)} training levy, according to the Urssaf. On ${EN.eur(40000)} that is ${EN.eur(consultant.cotisations + consultant.cfp)}. The rate was ${EN.pct(H.y2025)} in 2025, so the January 2026 rise costs an extra ${EN.eur(40000 * (P.micro.taux.bnc - H.y2025))} a year at that level.` },
      { q: `Why do some websites still show ${EN.pct(H.jusqu_a_2024_06)} for freelancers?`, a: `Because they were not updated. ${EN.pct(H.jusqu_a_2024_06)} applied until June 2024; the rate then rose to ${EN.pct(H.depuis_2024_07)}, ${EN.pct(H.y2025)} in 2025 and ${EN.pct(P.micro.taux.bnc)} from 1 January 2026. On ${EN.eur(40000)} of fees, using the old rate understates contributions by ${EN.eur(hausse)} a year, per Urssaf figures.` },
      { q: 'How much of a BNC freelancer’s contributions goes to pension?', a: `Since 1 January 2026, ${EN.pct(rn.retraite_base)} goes to basic pension and ${EN.pct(rn.retraite_compl)} to supplementary pension, ${EN.pct(rn.retraite_base + rn.retraite_compl)} in all, under the decree of 8 September 2025. The CSG-CRDS levies take ${EN.pct(rn.csg_crds)}, disability and death cover ${EN.pct(rn.invalidite)}, and health only ${EN.pct(rn.maladie)}. The pension share grew as the CSG-CRDS share shrank.` },
      { q: `Is the flat-rate income tax worth it for a freelancer earning ${EN.eur(40000)}?`, a: `For a single person with no other income, yes: ${EN.eur(consultantVL.vl)} at ${EN.pct(P.micro.vl.bnc)} against ${EN.eur(consultant.ir)} on the scale after the ${EN.pct(P.micro.abattement.bnc, 0)} allowance. To opt in for 2026, your 2024 reference tax income must not exceed ${EN.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per share; newcomers should check what the tax office holds for that year.` },
      { q: 'Are freelance teachers and translators exempt from CFE?', a: `Service-public lists teachers who give lessons themselves, at home or in premises without a sign, among automatic CFE exemptions, along with translators, authors and composers paid in copyright royalties. Other freelancers pay the CFE local business tax from year two, unless turnover two years earlier was ${EN.eur(P.cfe.exoneration_ca)} or less.` },
    ],
    body: (h) => `
<h2>Who falls under BNC</h2>
<p>An unregulated professional sells intellectual services, consulting, software, design, writing, training, coaching, and is not on the list of professions attached to the Cipav pension fund. Health cover comes from the CPAM, France’s public health insurer. A closed list of professions, from architects to ski instructors, belongs to the Cipav instead, at ${h.pct(P.micro.taux.cipav)}: see ${h.a('auto-entrepreneur-cipav', 'Cipav professions')}. What decides is the activity you declare when registering, not the job title on your website.</p>

<h2>A rate raised three times</h2>
<p>No other category moved as much (${h.src('monEntreprise', 'Urssaf, mon-entreprise')}).</p>
${h.table(['Period', 'BNC rate', `Contributions on ${h.eur(40000)}`],
  HISTO.map(([, en, t]) => [en, h.pct(t), h.eur(40000 * t)]),
  'Contribution rate for unregulated freelance professions under the micro scheme', ['l', 'r', 'r'])}
<p>Since mid-2024, a consultant on ${h.eur(40000)} pays ${h.eur(hausse)} more each year. What it buys shows in the 2026 split (${h.src('decret2025943', 'decree no. 2025-943')}): ${h.pct(rn.retraite_base)} to basic pension, ${h.pct(rn.retraite_compl)} to supplementary pension, only ${h.pct(rn.maladie)} to health, ${h.pct(rn.invalidite)} to disability and death cover, and ${h.pct(rn.csg_crds)} to the CSG-CRDS social levies.</p>

<h2>What you keep, from ${h.eur(NIVEAUX[0])} to ${h.eur(NIVEAUX[NIVEAUX.length - 1])}</h2>
${h.table(['Fees received', 'Contributions and CFP', 'Income tax (scale)', 'Kept per year', 'Per month', 'VAT'],
  NIVEAUX.map((ca) => { const m = lib(ca); return [h.eur(ca), h.eur(m.cotisations + m.cfp), h.eur(m.ir), h.eur(m.net), h.eur(m.netMensuel), m.tvaStatut === 'franchise' ? 'exempt' : m.tvaStatut === 'tolerance' ? 'exempt up to upper limit' : 'VAT due'] }),
  'Unregulated freelance profession, single person with no other income, 2026', ['r', 'r', 'r', 'r', 'r', 'l'])}
<p>These figures leave out the CFE and real costs, laptop, software, coworking, travel, which the micro scheme never deducts. A developer on ${h.eur(60000)} keeps ${h.eur(dev.netMensuel)} a month before those. At that level a company may be worth a look: see ${h.a('micro-ou-sasu', 'micro-enterprise or SASU')}.</p>

<h2>A small allowance means more tax</h2>
<p>The tax office assumes a freelancer spends ${h.pct(P.micro.abattement.bnc, 0)} of fees (${h.src('spMicroImposition', 'sheet F23267')}), against ${h.pct(P.micro.abattement.bic, 0)} for a tradesperson. On ${h.eur(40000)}, ${h.eur(consultant.revenuAbattu)} becomes taxable. For a single person that means ${h.eur(consultant.ir)} on the scale, while the versement libératoire (flat-rate tax paid with contributions) at ${h.pct(P.micro.vl.bnc)} would cost ${h.eur(consultantVL.vl)}. You choose it when registering or before 30 September for the next year, subject to an income test: see ${h.a('versement-liberatoire', 'the flat-rate option')}.</p>
<p>The same allowance shapes sick pay, which is based on fees after the ${h.pct(P.micro.abattement.bnc, 0)} cut. With only ${h.pct(rn.maladie)} of BNC contributions going to health, cover during illness is thin.</p>

<h2>Thresholds: VAT first, ceiling later</h2>
<p>VAT exemption ends at ${h.eur(tvaS.seuil)} of fees, with leeway up to ${h.eur(tvaS.majore)} during the year. Business clients who reclaim VAT barely notice; private clients do. The ${h.eur(P.micro.plafonds.services)} ceiling is pro-rated in year one: starting on 1 March 2026 gives ${h.eur(prorata)}, the example ${h.src('spPlafonds', 'service-public')} uses. See ${h.a('tva-auto-entrepreneur', 'the VAT threshold')}.</p>

<h2>CFE exemptions worth knowing</h2>
<p>Some freelancers never pay the CFE: teachers who give their own lessons at home or in unsigned premises, translators, authors and composers earning copyright royalties, author-photographers and artist illustrators. For others it starts in year two at half rate; the ${h.a('cfe-auto-entrepreneur', 'commune-by-commune calculator')} gives the figure.</p>

<h2>BNC or Cipav: the gap in euros</h2>
<p>On the same ${h.eur(40000)}, a BNC consultant pays ${h.eur(consultant.cotisations)} of contributions and a Cipav osteopath ${h.eur(cipav40.cotisations)}. Training levy, allowance and flat-rate option are the same; only the rate and the split between risks differ (${h.src('aeEssentiel', 'Urssaf')}).</p>
<h2>Your first year as a freelancer in France</h2>
<p>If you qualify for Acre, the start-up relief that now has to be claimed within ${h.P.micro.acre.delai_demande_jours} days, your BNC rate drops to ${h.pct(P.micro.acre.taux_acre_depuis.bnc)} for a start from 1 July 2026 (${h.pct(P.micro.acre.taux_acre_avant.bnc)} for earlier starts) until the end of the third calendar quarter after you begin; see ${h.a('acre-auto-entrepreneur', 'Acre')}. Your first Urssaf return comes at least ninety days after your start date. Low earners sometimes worry about thin pension rights: the Urssaf lets you ask for minimum contributions, before 31 December for the following year or within three months of starting, which moves you to the standard self-employed calculation. This site does not model that option. Finally, keep invoices and bank receipts apart from personal spending: you declare what you actually received in each period, and that figure drives everything above.</p>
<p>All figures are estimates from 2026 rates, not personal advice; the Urssaf and the tax office set what is due. Developers can compare legal forms on ${h.a('freelance-informatique', 'freelance developer')}.</p>`,
  },
});
