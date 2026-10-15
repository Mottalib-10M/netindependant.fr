import { defineGuide } from '../../lib/guide-types';
import { micro } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const coach = micro({ ca: 30000, activite: 'bnc' });
const plombier = micro({ ca: 45000, activite: 'bic', artisan: true });
const eboutique = micro({ ca: 60000, activite: 'vente' });
const archi = micro({ ca: 40000, activite: 'cipav' });
const r = P.micro.repartition;

export default defineGuide({
  id: 'charges-auto-entrepreneur',
  group: 'micro',
  order: 10,
  mini: 'cotisMicro',
  related: ['micro-entreprise', 'impot-auto-entrepreneur', 'cfe-auto-entrepreneur', 'acre-auto-entrepreneur', 'declarer-chiffre-affaires'],
  sources: ['aeEssentiel', 'spCotisationsMicro', 'decret2025943', 'spTaxesChambres'],
  fr: {
    slug: 'charges-auto-entrepreneur',
    nav: 'Charges de l’auto-entrepreneur',
    card: 'Taux 2026 par activité, CFP, taxe de chambre et où va l’argent.',
    title: 'Charges auto-entrepreneur 2026 : taux par activité et calcul',
    description: 'Charges auto-entrepreneur 2026 : 12,3 % en vente, 21,2 % en services, 25,6 % en libéral, plus CFP et taxe de chambre, calculées sur votre chiffre d’affaires.',
    h1: 'Les charges d’un auto-entrepreneur en 2026, activité par activité',
    intro: 'Un taux fixe sur le chiffre d’affaires encaissé, deux petites taxes en plus, et rien à payer si vous n’encaissez rien.',
    resume: `Un auto-entrepreneur paie ses cotisations sociales en pourcentage du chiffre d’affaires qu’il encaisse, déclaré chaque mois ou chaque trimestre à l’Urssaf. En 2026, le taux est de ${FR.pct(P.micro.taux.vente)} pour la vente de marchandises et l’hébergement, ${FR.pct(P.micro.taux.bic)} pour les prestations de services commerciales ou artisanales, ${FR.pct(P.micro.taux.bnc)} pour les professions libérales non réglementées et ${FR.pct(P.micro.taux.cipav)} pour celles qui relèvent de la Cipav. Ce taux couvre l’assurance maladie, les retraites de base et complémentaire, l’invalidité-décès, les allocations familiales et la CSG-CRDS. S’y ajoutent la contribution à la formation professionnelle, de ${FR.pct(P.micro.cfp.commercant)} à ${FR.pct(P.micro.cfp.artisan)} selon l’activité, et une taxe pour frais de chambre pour les commerçants et les artisans. Un coach qui encaisse ${FR.eur(30000)} dans l’année verse ainsi ${FR.eur(coach.cotisations)} de cotisations et ${FR.eur(coach.cfp)} de CFP. Sans chiffre d’affaires, rien n’est dû, mais la déclaration reste obligatoire.`,
    faqs: [
      { q: 'Les charges de l’auto-entrepreneur se calculent-elles sur le bénéfice ?', a: `Non, sur le chiffre d’affaires encaissé, hors taxe. Vos dépenses, loyer, matériel ou déplacements, ne réduisent pas les cotisations : un artisan qui encaisse ${FR.eur(45000)} paie ${FR.eur(plombier.cotisations)} de cotisations même s’il a acheté pour ${FR.eur(15000)} de fournitures. C’est pourquoi le régime réel devient intéressant quand les frais sont élevés.` },
      { q: 'Pourquoi un consultant paie-t-il plus qu’un plombier ?', a: `Le taux des libéraux non réglementés, ${FR.pct(P.micro.taux.bnc)}, a été relevé par paliers depuis juillet 2024 pour financer une meilleure retraite complémentaire, alors que celui des prestations artisanales est resté à ${FR.pct(P.micro.taux.bic)}. Sur ${FR.eur(30000)} de chiffre d’affaires, l’écart représente ${FR.eur(30000 * (P.micro.taux.bnc - P.micro.taux.bic))} de cotisations par an.` },
      { q: 'Qu’est-ce que la taxe pour frais de chambre consulaire ?', a: `Une contribution au financement de la chambre de commerce ou de la chambre des métiers, collectée par l’Urssaf avec vos cotisations. Elle vaut ${FR.pct(P.micro.tfc.commerce_service, 3)} du chiffre d’affaires pour un commerçant prestataire de services et ${FR.pct(P.micro.tfc.artisan_service, 2)} pour un artisan, selon service-public. Les professions libérales n’y sont pas soumises.` },
      { q: 'Que finance chaque euro de cotisation en 2026 ?', a: `Depuis le 1er janvier 2026, pour un libéral non réglementé, ${FR.pct(r.bnc.retraite_base + r.bnc.retraite_compl)} des cotisations vont à la retraite de base et complémentaire, ${FR.pct(r.bnc.csg_crds)} à la CSG-CRDS et le reste à la santé et à l’invalidité-décès, selon le décret du 8 septembre 2025. Pour un commerçant ou un artisan, la retraite reçoit ${FR.pct(r.bic.retraite_base + r.bic.retraite_compl)}.` },
      { q: 'Les charges baissent-elles la première année ?', a: `Avec l’Acre seulement, accordée sur demande depuis 2026 à certains créateurs. Les taux minorés sont publiés par l’Urssaf : par exemple ${FR.pct(P.micro.acre.taux_acre_avant.bnc)} au lieu de ${FR.pct(P.micro.taux.bnc)} en libéral pour une activité commencée avant juillet 2026, ${FR.pct(P.micro.acre.taux_acre_depuis.bnc)} ensuite, jusqu’à la fin du troisième trimestre civil suivant le début d’activité.` },
    ],
    body: (h) => `
<h2>Les taux de cotisations 2026</h2>
<p>Le régime micro-social applique un taux unique à chaque euro encaissé (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}). Le taux dépend de la catégorie de l’activité, pas du métier lui-même : un formateur peut relever des prestations commerciales ou des activités libérales selon la façon dont il exerce, et c’est l’inscription au registre qui tranche. Les taux ci-dessous sont ceux publiés par l’${h.src('aeEssentiel', 'Urssaf sur autoentrepreneur.urssaf.fr')} pour 2026.</p>
${h.table(['Activité', 'Cotisations', 'CFP', 'Taxe de chambre', 'Total sur le CA'], [
  ['Vente de marchandises, hébergement', h.pct(P.micro.taux.vente), h.pct(P.micro.cfp.commercant), h.pct(P.micro.tfc.commerce_vente, 3), h.pct(P.micro.taux.vente + P.micro.cfp.commercant + P.micro.tfc.commerce_vente, 2)],
  ['Prestations commerciales (BIC)', h.pct(P.micro.taux.bic), h.pct(P.micro.cfp.commercant), h.pct(P.micro.tfc.commerce_service, 3), h.pct(P.micro.taux.bic + P.micro.cfp.commercant + P.micro.tfc.commerce_service, 2)],
  ['Prestations artisanales (BIC)', h.pct(P.micro.taux.bic), h.pct(P.micro.cfp.artisan), h.pct(P.micro.tfc.artisan_service, 2), h.pct(P.micro.taux.bic + P.micro.cfp.artisan + P.micro.tfc.artisan_service, 2)],
  ['Libéral non réglementé (BNC)', h.pct(P.micro.taux.bnc), h.pct(P.micro.cfp.liberal), '–', h.pct(P.micro.taux.bnc + P.micro.cfp.liberal, 1)],
  ['Libéral relevant de la Cipav', h.pct(P.micro.taux.cipav), h.pct(P.micro.cfp.liberal), '–', h.pct(P.micro.taux.cipav + P.micro.cfp.liberal, 1)],
], 'Prélèvements sociaux d’un micro-entrepreneur en 2026, hors impôt sur le revenu et CFE', ['l', 'r', 'r', 'r', 'r'])}
<p>Les artisans d’Alsace et de Moselle paient une taxe de chambre des métiers plus élevée, que ce tableau n’intègre pas. Les locations de meublés de tourisme classés ont un taux propre de ${h.pct(P.micro.taux.meubleClasse, 0)}, hors du champ de ce site.</p>

<h2>Quatre exemples chiffrés</h2>
<h3>Un coach en libéral à ${h.eur(30000)}</h3>
<p>Il déclare ses encaissements chaque trimestre. Sur l’année, il verse ${h.eur(coach.cotisations)} de cotisations et ${h.eur(coach.cfp)} de CFP, soit ${h.pct((coach.cotisations + coach.cfp) / 30000, 1)} de son chiffre d’affaires. Il reste ${h.eur(coach.revenuApresCotisations)} avant impôt et avant CFE.</p>
<h3>Un plombier artisan à ${h.eur(45000)}</h3>
<p>Son taux de cotisations est plus bas, mais il paie la CFP la plus élevée et la taxe de la chambre des métiers : ${h.eur(plombier.cotisations)} de cotisations, ${h.eur(plombier.cfp)} de CFP et ${h.eur(plombier.tfc)} de taxe de chambre. Ses fournitures ne réduisent pas ces montants : s’il achète beaucoup de matériel, comparez avec ${h.a('micro-ou-reel', 'le régime réel')}.</p>
<h3>Une boutique en ligne à ${h.eur(60000)}</h3>
<p>La vente de marchandises bénéficie du taux le plus faible : ${h.eur(eboutique.cotisations)} de cotisations pour ${h.eur(60000)} de ventes. Mais ce chiffre d’affaires comprend le prix d’achat des produits revendus ; la marge réelle peut être bien plus mince que ce que suggère le taux.</p>
<h3>Une architecte relevant de la Cipav à ${h.eur(40000)}</h3>
<p>Les professions réglementées affiliées à la Cipav, architectes, psychologues, ostéopathes ou moniteurs de ski, cotisent à ${h.pct(P.micro.taux.cipav)}, soit ${h.eur(archi.cotisations)} sur ${h.eur(40000)}. Leur retraite complémentaire est gérée par la Cipav, et la part de leurs cotisations qui y va est la plus forte : ${h.pct(r.cipav.retraite_compl)}.</p>

<h2>Où va l’argent : la répartition 2026</h2>
<p>Depuis le 1er janvier 2026, la répartition des cotisations entre les risques a changé (${h.src('decret2025943', 'décret n° 2025-943 du 8 septembre 2025')}) : la part de la CSG-CRDS baisse et celle de la retraite augmente, ce qui améliore les droits sans changer le taux global. Le mini-simulateur en haut de page ventile vos propres cotisations.</p>
${h.table(['Part des cotisations', 'Vente et BIC', 'Libéral BNC', 'Cipav'], [
  ['Retraite de base', h.pct(r.bic.retraite_base), h.pct(r.bnc.retraite_base), h.pct(r.cipav.retraite_base)],
  ['Retraite complémentaire', h.pct(r.bic.retraite_compl), h.pct(r.bnc.retraite_compl), h.pct(r.cipav.retraite_compl)],
  ['Maladie et indemnités journalières', h.pct(r.bic.maladie), h.pct(r.bnc.maladie), h.pct(r.cipav.maladie)],
  ['Invalidité-décès', h.pct(r.bic.invalidite), h.pct(r.bnc.invalidite), h.pct(r.cipav.invalidite)],
  ['CSG-CRDS', h.pct(r.bic.csg_crds), h.pct(r.bnc.csg_crds), h.pct(r.cipav.csg_crds)],
], 'Répartition des cotisations des micro-entrepreneurs à partir du 1er janvier 2026', ['l', 'r', 'r', 'r'])}
<p>Concrètement, sur ${h.eur(1000)} de cotisations versées par un libéral, ${h.eur(1000 * (r.bnc.retraite_base + r.bnc.retraite_compl))} financent ses droits à la retraite. Les trimestres validés dépendent toutefois du chiffre d’affaires déclaré sur l’année : un petit chiffre d’affaires cotise peu et valide peu.</p>

<h2>Ce que le taux ne contient pas</h2>
<p>Trois dépenses s’ajoutent aux cotisations. L’impôt sur le revenu, soit au barème après abattement, soit par ${h.a('versement-liberatoire', 'versement libératoire')}. La ${h.a('cfe-auto-entrepreneur', 'cotisation foncière des entreprises')}, due à partir de la deuxième année, dont le montant dépend de la commune. Enfin les frais de l’activité elle-même, que le régime micro ne déduit pas. Le ${h.a('home', 'simulateur auto-entrepreneur')} les additionne pour donner le net en poche.</p>
<h2>Quand et comment payer</h2>
<p>Les cotisations se paient en même temps que la déclaration du chiffre d’affaires, en ligne, chaque mois ou chaque trimestre selon l’option choisie. Elles sont définitives : aucune régularisation l’année suivante, contrairement aux indépendants au réel. Le détail des échéances est sur ${h.a('declarer-chiffre-affaires', 'déclarer son chiffre d’affaires')}.</p>
<h2>Trois erreurs qui faussent le calcul</h2>
<p>La première consiste à appliquer un taux périmé. Beaucoup de pages affichent encore ${h.pct(P.micro.historique_bnc.jusqu_a_2024_06)} pour les libéraux : c’était le taux jusqu’en juin 2024. Sur ${h.eur(40000)} de chiffre d’affaires, l’écart avec le taux de 2026 dépasse ${h.eur(40000 * (P.micro.taux.bnc - P.micro.historique_bnc.jusqu_a_2024_06))} par an.</p>
<p>La deuxième, déclarer le chiffre d’affaires facturé au lieu du chiffre d’affaires encaissé. Une facture émise en décembre et payée en janvier se déclare en janvier, et c’est le taux en vigueur à l’encaissement qui s’applique.</p>
<p>La troisième, oublier que le taux s’applique au chiffre d’affaires hors taxe. Un auto-entrepreneur qui a dépassé le seuil de franchise et facture la TVA ne cotise pas sur la TVA qu’il collecte pour l’État.</p>`,
  },
  en: {
    slug: 'micro-enterprise-contributions',
    nav: 'Micro-enterprise contributions',
    card: '2026 rates by activity, training and chamber levies, and where the money goes.',
    title: 'Micro-enterprise contributions France 2026: rate by activity',
    description: 'French micro-enterprise contributions 2026: 12.3% on sales, 21.2% on services, 25.6% for freelancers, plus training and chamber levies, on your turnover.',
    h1: 'Micro-entrepreneur contributions in 2026, activity by activity',
    intro: 'One fixed rate on the turnover you receive, two small levies on top, and nothing to pay when nothing comes in.',
    resume: `A micro-entrepreneur in France pays social contributions as a percentage of the turnover actually received, declared monthly or quarterly to the Urssaf, the body that collects social security contributions. In 2026 the rate is ${EN.pct(P.micro.taux.vente)} for selling goods and accommodation, ${EN.pct(P.micro.taux.bic)} for commercial or craft services, ${EN.pct(P.micro.taux.bnc)} for unregulated freelance professions and ${EN.pct(P.micro.taux.cipav)} for professions covered by the Cipav pension fund. That single rate pays for health insurance, basic and supplementary pension, disability and death cover, family benefits and the CSG-CRDS social levies. On top come a training levy of ${EN.pct(P.micro.cfp.commercant)} to ${EN.pct(P.micro.cfp.artisan)} depending on the activity, and a chamber levy for traders and craftspeople. A life coach receiving ${EN.eur(30000)} over the year therefore pays ${EN.eur(coach.cotisations)} of contributions and ${EN.eur(coach.cfp)} of training levy. With no turnover, nothing is owed, but you still have to file your return.`,
    faqs: [
      { q: 'Are micro-enterprise contributions based on profit?', a: `No, on turnover received, before VAT. Your costs, rent, equipment or travel, do not reduce contributions: a plumber receiving ${EN.eur(45000)} pays ${EN.eur(plombier.cotisations)} of contributions even after buying ${EN.eur(15000)} of supplies. That is why the real-profit regime becomes attractive when costs are high.` },
      { q: 'Why does a consultant pay more than a plumber?', a: `The rate for unregulated freelance professions, ${EN.pct(P.micro.taux.bnc)}, has been raised in steps since July 2024 to fund a better supplementary pension, while craft services stayed at ${EN.pct(P.micro.taux.bic)}. On ${EN.eur(30000)} of turnover the gap is ${EN.eur(30000 * (P.micro.taux.bnc - P.micro.taux.bic))} of contributions a year.` },
      { q: 'What is the chamber levy on my Urssaf return?', a: `A contribution to the chamber of commerce (CCI) or the trades chamber (CMA), collected by the Urssaf together with your contributions. It is ${EN.pct(P.micro.tfc.commerce_service, 3)} of turnover for a trader selling services and ${EN.pct(P.micro.tfc.artisan_service, 2)} for a craftsperson, according to service-public. Freelance professions do not pay it.` },
      { q: 'What does each euro of contributions pay for in 2026?', a: `Since 1 January 2026, for an unregulated freelancer, ${EN.pct(r.bnc.retraite_base + r.bnc.retraite_compl)} of contributions go to basic and supplementary pension, ${EN.pct(r.bnc.csg_crds)} to the CSG-CRDS levies and the rest to health and disability cover, under the decree of 8 September 2025. For traders and craftspeople, pensions receive ${EN.pct(r.bic.retraite_base + r.bic.retraite_compl)}.` },
      { q: 'Are contributions lower in the first year?', a: `Only with Acre relief, granted on application since 2026 to certain founders. The Urssaf publishes the reduced rates: for example ${EN.pct(P.micro.acre.taux_acre_avant.bnc)} instead of ${EN.pct(P.micro.taux.bnc)} for a freelancer who started before July 2026, ${EN.pct(P.micro.acre.taux_acre_depuis.bnc)} after, until the end of the third calendar quarter after the start.` },
    ],
    body: (h) => `
<h2>The 2026 contribution rates</h2>
<p>The micro-social scheme applies a single rate to every euro received (${h.src('spCotisationsMicro', 'service-public, sheet F36232')}). The rate depends on the category of activity, not on the job title: a trainer can fall under commercial services or freelance professions depending on how they work, and registration decides. The rates below are those the ${h.src('aeEssentiel', 'Urssaf publishes on autoentrepreneur.urssaf.fr')} for 2026.</p>
${h.table(['Activity', 'Contributions', 'Training levy', 'Chamber levy', 'Total on turnover'], [
  ['Selling goods, accommodation', h.pct(P.micro.taux.vente), h.pct(P.micro.cfp.commercant), h.pct(P.micro.tfc.commerce_vente, 3), h.pct(P.micro.taux.vente + P.micro.cfp.commercant + P.micro.tfc.commerce_vente, 2)],
  ['Commercial services (BIC)', h.pct(P.micro.taux.bic), h.pct(P.micro.cfp.commercant), h.pct(P.micro.tfc.commerce_service, 3), h.pct(P.micro.taux.bic + P.micro.cfp.commercant + P.micro.tfc.commerce_service, 2)],
  ['Craft services (BIC)', h.pct(P.micro.taux.bic), h.pct(P.micro.cfp.artisan), h.pct(P.micro.tfc.artisan_service, 2), h.pct(P.micro.taux.bic + P.micro.cfp.artisan + P.micro.tfc.artisan_service, 2)],
  ['Unregulated freelance (BNC)', h.pct(P.micro.taux.bnc), h.pct(P.micro.cfp.liberal), '–', h.pct(P.micro.taux.bnc + P.micro.cfp.liberal, 1)],
  ['Cipav professions', h.pct(P.micro.taux.cipav), h.pct(P.micro.cfp.liberal), '–', h.pct(P.micro.taux.cipav + P.micro.cfp.liberal, 1)],
], 'Social levies of a micro-entrepreneur in 2026, before income tax and CFE', ['l', 'r', 'r', 'r', 'r'])}
<p>Craftspeople in Alsace and Moselle pay a higher trades-chamber levy, not shown here. Classified furnished holiday lets have their own ${h.pct(P.micro.taux.meubleClasse, 0)} rate and are outside the scope of this site.</p>

<h2>Four worked examples</h2>
<h3>A life coach on ${h.eur(30000)}</h3>
<p>She declares receipts every quarter. Over the year she pays ${h.eur(coach.cotisations)} of contributions and ${h.eur(coach.cfp)} of training levy, ${h.pct((coach.cotisations + coach.cfp) / 30000, 1)} of turnover. She keeps ${h.eur(coach.revenuApresCotisations)} before income tax and CFE.</p>
<h3>A plumber on ${h.eur(45000)}</h3>
<p>His contribution rate is lower, but he pays the highest training levy and the trades-chamber levy: ${h.eur(plombier.cotisations)} of contributions, ${h.eur(plombier.cfp)} of training levy and ${h.eur(plombier.tfc)} of chamber levy. Supplies do not reduce these amounts: if he buys a lot of materials, compare with ${h.a('micro-ou-reel', 'the real-profit regime')}.</p>
<h3>An online shop on ${h.eur(60000)}</h3>
<p>Selling goods has the lowest rate: ${h.eur(eboutique.cotisations)} of contributions on ${h.eur(60000)} of sales. But that turnover includes the purchase price of the goods resold; the real margin can be much thinner than the rate suggests.</p>
<h3>An architect under the Cipav on ${h.eur(40000)}</h3>
<p>Regulated professions attached to the Cipav, such as architects, psychologists, osteopaths or ski instructors, pay ${h.pct(P.micro.taux.cipav)}, so ${h.eur(archi.cotisations)} on ${h.eur(40000)}. Their supplementary pension is run by the Cipav, and the share of their contributions going to it is the largest: ${h.pct(r.cipav.retraite_compl)}.</p>

<h2>Where the money goes: the 2026 split</h2>
<p>Since 1 January 2026 the way contributions are split between risks has changed (${h.src('decret2025943', 'decree no. 2025-943 of 8 September 2025')}): the CSG-CRDS share falls and the pension share rises, improving rights without changing the overall rate. The mini-calculator at the top of the page splits your own contributions.</p>
${h.table(['Share of contributions', 'Sales and BIC', 'Freelance BNC', 'Cipav'], [
  ['Basic pension', h.pct(r.bic.retraite_base), h.pct(r.bnc.retraite_base), h.pct(r.cipav.retraite_base)],
  ['Supplementary pension', h.pct(r.bic.retraite_compl), h.pct(r.bnc.retraite_compl), h.pct(r.cipav.retraite_compl)],
  ['Health and sick pay', h.pct(r.bic.maladie), h.pct(r.bnc.maladie), h.pct(r.cipav.maladie)],
  ['Disability and death', h.pct(r.bic.invalidite), h.pct(r.bnc.invalidite), h.pct(r.cipav.invalidite)],
  ['CSG-CRDS levies', h.pct(r.bic.csg_crds), h.pct(r.bnc.csg_crds), h.pct(r.cipav.csg_crds)],
], 'Split of micro-entrepreneur contributions from 1 January 2026', ['l', 'r', 'r', 'r'])}
<p>In practice, out of ${h.eur(1000)} of contributions paid by a freelancer, ${h.eur(1000 * (r.bnc.retraite_base + r.bnc.retraite_compl))} fund pension rights. The pension quarters you validate still depend on the turnover declared over the year: a small turnover pays little and validates little.</p>

<h2>What the rate does not include</h2>
<p>Three costs come on top. Income tax, either on the scale after the flat allowance or through the ${h.a('versement-liberatoire', 'flat-rate option')}. The ${h.a('cfe-auto-entrepreneur', 'CFE local business tax')}, owed from the second year, whose amount depends on your commune. And the running costs of the business itself, which the micro regime does not deduct. The ${h.a('home', 'micro-enterprise calculator')} adds them up to give your take-home pay.</p>
<h2>When and how to pay</h2>
<p>Contributions are paid together with the turnover return, online, monthly or quarterly depending on the option you chose. They are final: unlike self-employed people on real profit, there is no adjustment the following year. Deadlines are on ${h.a('declarer-chiffre-affaires', 'declaring your turnover')}.</p>
<h2>Three mistakes that skew the numbers</h2>
<p>The first is using an out-of-date rate. Many pages still show ${h.pct(P.micro.historique_bnc.jusqu_a_2024_06)} for freelancers: that was the rate until June 2024. On ${h.eur(40000)} of turnover the gap with the 2026 rate is more than ${h.eur(40000 * (P.micro.taux.bnc - P.micro.historique_bnc.jusqu_a_2024_06))} a year.</p>
<p>The second is declaring what you invoiced instead of what you received. An invoice sent in December and paid in January is declared in January, and the rate in force when you are paid applies.</p>
<p>The third is forgetting that the rate applies to turnover before VAT. A micro-entrepreneur above the VAT threshold who charges VAT does not pay contributions on the VAT collected for the State.</p>
<h2>Coming from another country</h2>
<p>If you were self-employed elsewhere in Europe, note two French specifics. Contributions are collected as you go, on each monthly or quarterly return, rather than through an annual assessment. And the micro rate already includes health insurance: once registered, you are covered by the French health system (the CPAM) through these contributions, with no separate premium to pay.</p>`,
  },
});
