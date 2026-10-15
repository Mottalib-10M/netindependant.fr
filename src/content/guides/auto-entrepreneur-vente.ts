import { defineGuide } from '../../lib/guide-types';
import { micro, plafondProrata } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const v = (ca: number, extra: Partial<Parameters<typeof micro>[0]> = {}) => micro({ ca, activite: 'vente', ...extra });
const NIVEAUX = [30000, 60000, 120000, 200000];
const boutique = v(60000);
const ACHATS = 36000;
const boutiqueMarge = v(60000, { charges: ACHATS });
const margeBrute = 60000 - ACHATS;
const prelevBoutique = boutique.cotisations + boutique.cfp + boutique.tfc;
const grossiste = v(120000);
const grossisteVL = v(120000, { vl: true });
const petitVL = v(60000, { vl: true });
const boulanger = v(50000, { artisan: true });
const JOURS_31_JANVIER = 335; // du 31 janvier au 31 décembre 2026 inclus
const prorata = plafondProrata('vente', JOURS_31_JANVIER);
const tvaV = P.tva.vente;

export default defineGuide({
  id: 'auto-entrepreneur-vente',
  group: 'micro',
  order: 110,
  mini: 'netActivite',
  miniDefaults: { act: 0 },
  related: ['plafond-micro-entreprise', 'tva-auto-entrepreneur', 'versement-liberatoire', 'micro-ou-reel', 'auto-entrepreneur-artisan'],
  sources: ['aeEssentiel', 'spPlafonds', 'spFranchiseTva', 'spTaxesChambres', 'impotsVL'],
  fr: {
    slug: 'auto-entrepreneur-vente-marchandises',
    nav: 'Auto-entrepreneur en vente',
    card: 'Le taux le plus bas, le plafond le plus haut, et une marge à surveiller.',
    title: 'Auto-entrepreneur vente 2026 : taux, plafond et vraie marge',
    description: 'Auto-entrepreneur en vente de marchandises en 2026 : 12,3 % de cotisations, abattement de 71 %, plafond de 203 100 €, franchise de TVA jusqu’à 85 000 €.',
    h1: 'Vendre des marchandises en micro-entreprise : taux, plafond et marge',
    intro: 'Le revendeur cotise sur ce qu’il encaisse, achats compris : un taux bas sur un montant qui n’est pas son bénéfice.',
    resume: `Un auto-entrepreneur qui revend des marchandises, vend sa propre production ou fournit un hébergement cotise en 2026 au taux de ${FR.pct(P.micro.taux.vente)} sur son chiffre d’affaires encaissé, le plus bas du régime. S’y ajoutent ${FR.pct(P.micro.cfp.commercant)} de contribution à la formation professionnelle et ${FR.pct(P.micro.tfc.commerce_vente, 3)} de taxe pour la chambre de commerce. Le plafond annuel atteint ${FR.eur(P.micro.plafonds.vente)}, la franchise de TVA tient jusqu’à ${FR.eur(tvaV.seuil)} et l’impôt, au barème, ne porte que sur ${FR.pct(1 - P.micro.abattement.vente, 0)} des ventes grâce à l’abattement de ${FR.pct(P.micro.abattement.vente, 0)}. Le piège tient au prix d’achat : il fait partie du chiffre d’affaires et rien ne le déduit. Une boutique en ligne qui vend pour ${FR.eur(60000)} et a payé ${FR.eur(ACHATS)} de stock verse ${FR.eur(prelevBoutique)} de prélèvements sociaux, soit ${FR.pct(prelevBoutique / margeBrute, 0)} de sa marge, et garde ${FR.eur(boutiqueMarge.net)} sur l’année.`,
    faqs: [
      { q: 'Les cotisations d’un revendeur se calculent-elles sur la marge ou sur le prix de vente ?', a: `Sur le prix de vente encaissé, hors TVA. Le coût d’achat des marchandises ne se déduit pas. Pour ${FR.eur(60000)} de ventes et ${FR.eur(ACHATS)} de stock, les ${FR.pct(P.micro.taux.vente)} de cotisations représentent ${FR.eur(boutique.cotisations)}, soit ${FR.pct(boutique.cotisations / margeBrute, 0)} de la marge réelle. Plus la marge est faible, plus le régime micro devient cher, selon les taux de l’Urssaf.` },
      { q: 'Jusqu’à combien peut-on vendre en micro-entreprise en 2026 ?', a: `${FR.eur(P.micro.plafonds.vente)} de chiffre d’affaires annuel pour la vente de marchandises et l’hébergement, contre ${FR.eur(P.micro.plafonds.anciens_vente)} avant. L’année de création, le seuil se proratise : une boutique ouverte le 31 janvier 2026 a droit à ${FR.eur(prorata)}, exemple officiel de service-public. Un seul dépassement est toléré ; deux années consécutives font sortir du régime au 1er janvier suivant.` },
      { q: 'À partir de quel montant de ventes faut-il facturer la TVA ?', a: `La franchise de TVA couvre les ventes jusqu’à ${FR.eur(tvaV.seuil)} sur l’année précédente. Au-delà, la TVA s’applique au 1er janvier suivant ; si les ventes de l’année en cours dépassent ${FR.eur(tvaV.majore)}, elle s’applique dès le jour du dépassement, selon service-public. Avant, chaque facture porte la mention « TVA non applicable, art. 293 B du CGI ».` },
      { q: `Le versement libératoire de ${FR.pct(P.micro.vl.vente, 0)} est-il intéressant pour un commerçant ?`, a: `Seulement si l’impôt au barème coûterait plus. Une personne seule qui vend pour ${FR.eur(60000)} n’a, avec l’abattement de ${FR.pct(P.micro.abattement.vente, 0)}, aucun impôt au barème, alors que l’option lui prendrait ${FR.eur(petitVL.vl)}. À ${FR.eur(120000)}, c’est l’inverse : ${FR.eur(grossisteVL.vl)} de versement libératoire contre ${FR.eur(grossiste.ir)} d’impôt au barème.` },
      { q: 'Un artisan qui vend ce qu’il fabrique paie-t-il les mêmes taxes qu’un commerçant ?', a: `Le taux de cotisations est le même, ${FR.pct(P.micro.taux.vente)}, mais la contribution à la formation monte à ${FR.pct(P.micro.cfp.artisan)} et la taxe de la chambre des métiers à ${FR.pct(P.micro.tfc.artisan_vente, 2)} pour la part vente, selon service-public. Sur ${FR.eur(50000)} de ventes, cela fait ${FR.eur(boulanger.cfp + boulanger.tfc)} au lieu de ${FR.eur(v(50000).cfp + v(50000).tfc)} pour un commerçant.` },
    ],
    body: (h) => `
<h2>Ce qui relève de la vente</h2>
<p>La catégorie couvre la revente de produits achetés, la vente de ce qu’on fabrique et la fourniture de logement. Les meublés de tourisme et les chambres d’hôtes ont toutefois leurs propres plafonds (${h.eur(P.micro.plafonds.services)} pour un meublé classé ou des chambres d’hôtes, ${h.eur(P.micro.plafonds.meubleNonClasse)} pour un meublé non classé) et ne sont pas traités ici. Dès qu’une part de l’activité consiste à vendre du temps ou un savoir-faire, réparation, installation ou conseil, cette part bascule dans les prestations de services, avec un autre taux et un autre plafond.</p>

<h2>Les prélèvements d’un vendeur en 2026</h2>
<p>Trois lignes figurent sur la déclaration Urssaf d’un commerçant (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}, ${h.src('spTaxesChambres', 'service-public, taxes de chambres')}) : les cotisations à ${h.pct(P.micro.taux.vente)}, la contribution à la formation professionnelle à ${h.pct(P.micro.cfp.commercant)} et la taxe pour frais de chambre de commerce à ${h.pct(P.micro.tfc.commerce_vente, 3)}. Le tableau en tire le net pour une personne seule sans autre revenu, avant achats, avant CFE.</p>
${h.table(['Ventes encaissées', 'Cotisations, CFP et taxe CCI', 'Impôt au barème', 'Reste avant achats', 'TVA'],
  NIVEAUX.map((ca) => { const m = v(ca); return [h.eur(ca), h.eur(m.cotisations + m.cfp + m.tfc), h.eur(m.ir), h.eur(m.revenuApresCotisations - m.ir), m.tvaStatut === 'franchise' ? 'franchise' : m.tvaStatut === 'tolerance' ? 'franchise, sous le seuil majoré' : 'redevable'] }),
  'Vente de marchandises en micro-entreprise, personne seule sans autre revenu, barème 2026', ['r', 'r', 'r', 'r', 'l'])}
<p>La dernière colonne compte : au-delà de ${h.eur(tvaV.seuil)}, le vendeur devient redevable de la TVA et ses prix publics doivent l’inclure, ce qui rogne la marge si la concurrence ne suit pas.</p>

<h2>Le taux sur le chiffre d’affaires, le coût sur la marge</h2>
<p>Un revendeur ne gagne pas ce qu’il encaisse. Prenons une boutique en ligne qui vend pour ${h.eur(60000)} et a acheté ${h.eur(ACHATS)} de marchandises : sa marge brute est de ${h.eur(margeBrute)}. Elle paie ${h.eur(prelevBoutique)} de prélèvements sociaux, calculés sur les ${h.eur(60000)}. Rapportés à la marge, ils pèsent ${h.pct(prelevBoutique / margeBrute, 1)}, bien loin des ${h.pct(P.micro.taux.vente)} affichés. Après achats, il lui reste ${h.eur(boutiqueMarge.net)}, frais d’emballage, d’expédition et de plateforme non compris.</p>
<p>La règle se retourne pour un artisan qui vend sa propre production avec peu de matière première : la marge est large et le taux de ${h.pct(P.micro.taux.vente)} devient très doux. Pour un revendeur à faible marge, le calcul au réel, où l’on cotise sur le bénéfice, mérite d’être posé : voir ${h.a('micro-ou-reel', 'micro ou réel')}.</p>

<h2>L’abattement de ${h.pct(P.micro.abattement.vente, 0)}, un avantage pour l’impôt</h2>
<p>L’administration fiscale suppose qu’un vendeur dépense ${h.pct(P.micro.abattement.vente, 0)} de son chiffre d’affaires pour acheter et produire (${h.src('spMicroImposition', 'fiche F23267')}). Sur ${h.eur(60000)} de ventes, seuls ${h.eur(boutique.revenuAbattu)} entrent dans le revenu imposable. Pour une personne seule sans autre revenu, la décote et le seuil de recouvrement ramènent alors l’impôt à zéro. Le versement libératoire, à ${h.pct(P.micro.vl.vente, 0)} des ventes (${h.src('impotsVL', 'impots.gouv.fr')}), n’a d’intérêt qu’au-delà : à ${h.eur(120000)}, il coûte ${h.eur(grossisteVL.vl)} contre ${h.eur(grossiste.ir)} au barème. Le détail est sur ${h.a('versement-liberatoire', 'le versement libératoire')}.</p>

<h2>Plafond et première année</h2>
<p>Le régime tient jusqu’à ${h.eur(P.micro.plafonds.vente)} de ventes annuelles en 2026, contre ${h.eur(P.micro.plafonds.anciens_vente)} auparavant (${h.src('spPlafonds', 'service-public, fiche F32353')}). L’année de création, ce seuil se calcule au prorata des jours d’activité : une boutique ouverte le 31 janvier 2026 a droit à ${h.eur(prorata)}. La franchise de TVA se proratise elle aussi, dans l’autre sens : on ramène les ventes à une année pleine (${h.src('spFranchiseTva', 'fiche F21746')}).</p>
<p>Le commerçant qui ajoute des services, installation ou réparation, reste sous le seuil global de ${h.eur(P.micro.plafonds.vente)}, mais la part services ne doit pas dépasser ${h.eur(P.micro.plafonds.services)}. Les deux seuils ne s’additionnent pas, et l’abattement minimum passe à ${h.eur(P.micro.abattement.minimum_mixte)}. Voir ${h.a('plafond-micro-entreprise', 'le plafond de la micro-entreprise')}.</p>

<h2>Quand on fabrique ce qu’on vend</h2>
<p>Un artisan inscrit au répertoire des métiers qui vend sa production reste au taux de ${h.pct(P.micro.taux.vente)}, mais sa CFP passe à ${h.pct(P.micro.cfp.artisan)} et la taxe de la chambre des métiers à ${h.pct(P.micro.tfc.artisan_vente, 2)}. Sur ${h.eur(50000)} de ventes, il verse ${h.eur(boulanger.cotisations)} de cotisations et ${h.eur(boulanger.cfp + boulanger.tfc)} de CFP et de taxe de chambre. Ses autres règles sont sur ${h.a('auto-entrepreneur-artisan', 'auto-entrepreneur artisan')}.</p>

<h2>Trois erreurs fréquentes chez les vendeurs</h2>
<p>Déclarer la marge au lieu des ventes : l’Urssaf attend le chiffre d’affaires encaissé, pas ce qu’il reste après achats. Oublier les remboursements : seul ce qui a été réellement encaissé sur la période se déclare. Laisser filer la TVA : un dépassement du seuil majoré en cours d’année rend la TVA exigible dès ce jour-là, sur des ventes déjà conclues à un prix qui ne la prévoyait pas. La page ${h.a('tva-auto-entrepreneur', 'TVA de l’auto-entrepreneur')} détaille les seuils.</p>
<p>Les montants sont des estimations calculées avec les taux 2026 ; l’Urssaf et les impôts fixent seuls ce que vous devez.</p>`,
  },
  en: {
    slug: 'selling-goods-micro',
    nav: 'Selling goods (micro)',
    card: 'The lowest rate, the highest ceiling, and a margin you need to watch.',
    title: 'Selling goods as a micro-entrepreneur 2026: rates, margin',
    description: 'Selling goods as a micro-entrepreneur in France, 2026: 12.3% contributions, a 71% tax allowance, a €203,100 ceiling and no VAT until €85,000 of sales.',
    h1: 'Selling goods through a French micro-enterprise',
    intro: 'Resellers pay contributions on everything they take in, including what the stock cost them.',
    resume: `If you sell goods in France as a micro-entrepreneur, the simplified self-employed scheme often called auto-entrepreneur, you pay social contributions of ${EN.pct(P.micro.taux.vente)} on sales received in 2026, the lowest rate in the scheme. The same category covers selling what you make and supplying accommodation. Two small levies come on top, collected by the Urssaf (the social contributions agency): ${EN.pct(P.micro.cfp.commercant)} for vocational training and ${EN.pct(P.micro.tfc.commerce_vente, 3)} for the chamber of commerce (CCI). You can sell up to ${EN.eur(P.micro.plafonds.vente)} a year, you charge no VAT up to ${EN.eur(tvaV.seuil)}, and for income tax the State assumes ${EN.pct(P.micro.abattement.vente, 0)} of sales are costs. The trap is stock: what you paid for the goods is part of your turnover and is never deducted. An online shop selling ${EN.eur(60000)} after buying ${EN.eur(ACHATS)} of stock pays ${EN.eur(prelevBoutique)} of social levies, ${EN.pct(prelevBoutique / margeBrute, 0)} of its margin, and keeps ${EN.eur(boutiqueMarge.net)} for the year.`,
    faqs: [
      { q: 'Can I deduct the cost of my stock from turnover as a micro-entrepreneur?', a: `No. Contributions are charged on sales received, before VAT, and purchases are not deducted. On ${EN.eur(60000)} of sales with ${EN.eur(ACHATS)} of stock, the ${EN.pct(P.micro.taux.vente)} rate costs ${EN.eur(boutique.cotisations)}, which is ${EN.pct(boutique.cotisations / margeBrute, 0)} of the actual margin. With thin margins, the real-profit regime may work out cheaper.` },
      { q: 'What is the annual sales limit for a French micro-enterprise selling goods?', a: `${EN.eur(P.micro.plafonds.vente)} of turnover in 2026, up from ${EN.eur(P.micro.plafonds.anciens_vente)}. In the first year it is cut in proportion to days trading: a shop opened on 31 January 2026 may take ${EN.eur(prorata)}, the official service-public example. You may go over once; two years in a row and you leave the scheme on the next 1 January.` },
      { q: 'When must an online shop in France start charging VAT?', a: `Once the previous year’s sales exceed ${EN.eur(tvaV.seuil)}, VAT applies from 1 January; if sales in the current year pass ${EN.eur(tvaV.majore)}, it applies from that day, according to service-public. Until then, every invoice must state “TVA non applicable, art. 293 B du CGI” (VAT not applicable under the tax code).` },
      { q: `Should a reseller choose the ${EN.pct(P.micro.vl.vente, 0)} flat-rate income tax?`, a: `It depends on volume. A single person selling ${EN.eur(60000)} with no other income pays no scale tax at all after the ${EN.pct(P.micro.abattement.vente, 0)} allowance, so the option would cost ${EN.eur(petitVL.vl)} for nothing. At ${EN.eur(120000)} it saves money: ${EN.eur(grossisteVL.vl)} instead of ${EN.eur(grossiste.ir)} of scale tax.` },
      { q: 'I make and sell my own products: am I a trader or a craftsperson?', a: `If you are on the trades register (répertoire des métiers), you are a craftsperson selling goods: contributions stay at ${EN.pct(P.micro.taux.vente)}, but the training levy rises to ${EN.pct(P.micro.cfp.artisan)} and the trades-chamber levy to ${EN.pct(P.micro.tfc.artisan_vente, 2)}. On ${EN.eur(50000)} of sales those two levies come to ${EN.eur(boulanger.cfp + boulanger.tfc)}.` },
    ],
    body: (h) => `
<h2>What counts as selling goods</h2>
<p>In French tax terms this is the first BIC category (bénéfices industriels et commerciaux, commercial profits): reselling products you bought, selling what you make, and supplying accommodation. Furnished holiday lets and bed-and-breakfast rooms follow their own ceilings (${h.eur(P.micro.plafonds.services)} for classified lets and B&amp;Bs, ${h.eur(P.micro.plafonds.meubleNonClasse)} for unclassified lets) and are not covered here. Anything where you sell time or skill, such as repairs, fitting or advice, is a service, with a different rate and ceiling.</p>

<h2>What a seller pays in 2026</h2>
<p>A trader’s Urssaf return has three lines (${h.src('aeEssentiel', 'Urssaf, key facts')}, ${h.src('spTaxesChambres', 'service-public, chamber levies')}): contributions at ${h.pct(P.micro.taux.vente)}, the training levy (CFP) at ${h.pct(P.micro.cfp.commercant)} and the CCI levy at ${h.pct(P.micro.tfc.commerce_vente, 3)}. The table shows the result for a single person with no other income, before stock purchases and before CFE local business tax.</p>
${h.table(['Sales received', 'Contributions, CFP and CCI levy', 'Income tax (scale)', 'Kept before stock', 'VAT'],
  NIVEAUX.map((ca) => { const m = v(ca); return [h.eur(ca), h.eur(m.cotisations + m.cfp + m.tfc), h.eur(m.ir), h.eur(m.revenuApresCotisations - m.ir), m.tvaStatut === 'franchise' ? 'exempt' : m.tvaStatut === 'tolerance' ? 'exempt, under the upper limit' : 'VAT due'] }),
  'Selling goods as a micro-entrepreneur, single person with no other income, 2026 scale', ['r', 'r', 'r', 'r', 'l'])}
<p>Watch the last column. Above ${h.eur(tvaV.seuil)} you must add VAT to your prices; if competitors are VAT-exempt, that eats into your margin.</p>

<h2>A low rate on turnover, a heavier one on margin</h2>
<p>A reseller does not earn what comes in. Picture an online shop that sells ${h.eur(60000)} of goods it bought for ${h.eur(ACHATS)}: gross margin ${h.eur(margeBrute)}. It pays ${h.eur(prelevBoutique)} of social levies, calculated on the full ${h.eur(60000)}. Measured against the margin, that is ${h.pct(prelevBoutique / margeBrute, 1)}, far from the headline ${h.pct(P.micro.taux.vente)}. After stock it keeps ${h.eur(boutiqueMarge.net)}, before packaging, postage and marketplace fees.</p>
<p>The opposite holds for a maker selling their own work with cheap raw materials: the margin is wide and the low rate is very gentle. For thin-margin resellers, compare with the real-profit regime, where contributions follow profit: see ${h.a('micro-ou-reel', 'micro or real profit')}.</p>

<h2>The ${h.pct(P.micro.abattement.vente, 0)} allowance and income tax</h2>
<p>For income tax the State assumes ${h.pct(P.micro.abattement.vente, 0)} of a seller’s turnover goes on costs (${h.src('spMicroImposition', 'sheet F23267')}). On ${h.eur(60000)} of sales only ${h.eur(boutique.revenuAbattu)} is taxable; for a single person with no other income, the décote (the low-tax discount) then wipes out the tax. The versement libératoire, a flat ${h.pct(P.micro.vl.vente, 0)} of sales paid with contributions (${h.src('impotsVL', 'impots.gouv.fr')}), only pays off higher up: at ${h.eur(120000)} it costs ${h.eur(grossisteVL.vl)} against ${h.eur(grossiste.ir)} on the scale. See ${h.a('versement-liberatoire', 'the flat-rate option')}.</p>

<h2>Ceiling and first year</h2>
<p>The scheme allows up to ${h.eur(P.micro.plafonds.vente)} of sales in 2026, previously ${h.eur(P.micro.plafonds.anciens_vente)} (${h.src('spPlafonds', 'service-public sheet F32353')}). In your first year the ceiling is pro-rated to days of trading: opening on 31 January 2026 gives ${h.eur(prorata)}. For VAT it works the other way round: first-year sales are scaled up to a full year (${h.src('spFranchiseTva', 'sheet F21746')}).</p>
<p>If you also sell services such as installation or repairs, total turnover stays under ${h.eur(P.micro.plafonds.vente)} and the service part under ${h.eur(P.micro.plafonds.services)}; the two do not add up, and the minimum allowance becomes ${h.eur(P.micro.abattement.minimum_mixte)}. Details on ${h.a('plafond-micro-entreprise', 'the turnover ceiling')}.</p>

<h2>Makers on the trades register</h2>
<p>A craftsperson who sells their own production pays the same ${h.pct(P.micro.taux.vente)}, but a training levy of ${h.pct(P.micro.cfp.artisan)} and a trades-chamber (CMA) levy of ${h.pct(P.micro.tfc.artisan_vente, 2)}. On ${h.eur(50000)} of sales: ${h.eur(boulanger.cotisations)} of contributions plus ${h.eur(boulanger.cfp + boulanger.tfc)} of levies. More on ${h.a('auto-entrepreneur-artisan', 'craft trades')}.</p>

<h2>Mistakes new sellers make</h2>
<p>Declaring margin instead of sales: the Urssaf wants turnover received, not what is left after buying stock. Declaring orders rather than payments: only money actually received in the period counts. Ignoring VAT until too late: passing the upper limit mid-year makes VAT due from that day, on sales already priced without it. See ${h.a('tva-auto-entrepreneur', 'the VAT threshold')}.</p>
<h2>The local business tax arrives in year two</h2>
<p>Even a shop run from a spare room owes the CFE (cotisation foncière des entreprises), a local tax set by each commune. Nothing is due in the calendar year you open, the base is halved the year after, and you are exempt whenever sales two years earlier were ${h.eur(P.cfe.exoneration_ca)} or less. With no business premises, the commune taxes a minimum base that depends on your turnover band. Our ${h.a('cfe-auto-entrepreneur', 'CFE calculator')} reads the rate voted where you live.</p>
<p>These figures are estimates based on 2026 rates, not personal advice; the Urssaf and the tax office decide what you owe.</p>`,
  },
});
