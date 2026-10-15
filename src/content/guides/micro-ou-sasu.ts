import { defineGuide } from '../../lib/guide-types';
import { enMicro, enSASU } from '../../lib/engine/statuts';
import type { Activite } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples calculés par le moteur : personne seule, sans autre revenu, tout le bénéfice de la SASU distribué.
const fraisBase = 3000;
const paliers = [30000, 50000, 70000, P.micro.plafonds.services].map((ca) => {
  const i = { ca, charges: fraisBase, activite: 'bnc' as const };
  return { ca, m: enMicro(i), s: enSASU(i) };
});
const top = paliers[paliers.length - 1];
/** Frais réels (pas de 500 €) à partir desquels la SASU laisse plus que la micro, pour un chiffre d'affaires donné. */
function fraisBascule(ca: number, activite: Activite, artisan = false): number {
  for (let ch = 0; ch < ca; ch += 500) {
    const i = { ca, charges: ch, activite, artisan };
    if (enSASU(i).net > enMicro(i).net) return ch;
  }
  return 0;
}
const scen = [
  { ca: 60000, act: 'bnc' as const, art: false, fr: 'Consultant, libéral (BNC)', en: 'Consultant, freelance profession (BNC)' },
  { ca: 60000, act: 'bic' as const, art: true, fr: 'Artisan, prestations (BIC)', en: 'Tradesperson, services (BIC)' },
  { ca: 150000, act: 'vente' as const, art: false, fr: 'Vente de marchandises', en: 'Selling goods' },
].map((s) => ({ ...s, seuil: fraisBascule(s.ca, s.act, s.art) }));
const [sBnc, sArt, sVente] = scen;
// Un consultant à 60 000 € avec des frais juste au-dessus du point de bascule.
const lourd = { ca: 60000, charges: sBnc.seuil || 20000, activite: 'bnc' as const };
const mLourd = enMicro(lourd), sLourd = enSASU(lourd);
// SASU qui remplacerait une micro de 60 000 € avec 3 000 € de frais : impôt sur les sociétés payé.
const rempl = enSASU({ ca: 60000, charges: fraisBase, activite: 'bnc' });

export default defineGuide({
  id: 'micro-ou-sasu',
  group: 'statuts',
  order: 50,
  mini: 'microVsSasu',
  related: ['micro-entreprise', 'sasu', 'plafond-micro-entreprise', 'salaire-ou-dividendes', 'micro-ou-reel', 'charges-sasu'],
  sources: ['spCotisationsMicro', 'spPlafonds', 'spMicroImposition', 'urssafTauxSalarie', 'spIs', 'spDividendes'],
  fr: {
    slug: 'micro-entreprise-ou-sasu',
    nav: 'Micro-entreprise ou SASU',
    card: 'Le niveau de frais qui fait basculer, activité par activité.',
    title: 'Micro-entreprise ou SASU 2026 : le seuil de frais décisif',
    description: 'Micro-entreprise ou SASU en 2026 : cotisations de 25,6 % du CA en libéral contre IS et dividendes à 31,4 %, et le niveau de frais où la SASU laisse plus.',
    h1: 'Micro-entreprise ou SASU : quand la société devient-elle rentable ?',
    intro: 'Ce n’est pas tant le chiffre d’affaires qui décide que la part de vos recettes absorbée par les frais.',
    resume: `Pour un indépendant seul qui a peu de frais, la micro-entreprise laisse en 2026 plus de revenu qu’une SASU jusqu’au plafond du régime : un consultant libéral à ${FR.eur(top.ca)} de chiffre d’affaires et ${FR.eur(fraisBase)} de frais garde ${FR.eur(top.m.net)} par an en micro contre ${FR.eur(top.s.net)} en SASU, selon notre moteur. La micro prélève ${FR.pct(P.micro.taux.bnc)} du chiffre d’affaires encaissé en libéral, ${FR.pct(P.micro.taux.bic)} en prestations commerciales ou artisanales, ${FR.pct(P.micro.taux.vente)} en vente, sans jamais tenir compte des dépenses réelles. La SASU, elle, ne taxe que le bénéfice : impôt sur les sociétés de ${FR.pct(P.is.taux_reduit, 0)} jusqu’à ${FR.eur(P.is.seuil_reduit)}, cotisations sur le salaire du président, prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)} sur les dividendes. Le basculement dépend donc du poids des frais : pour ${FR.eur(sBnc.ca)} de recettes en libéral, la SASU passe devant ${sBnc.seuil ? `à partir de ${FR.eur(sBnc.seuil)} de frais par an, soit ${FR.pct(sBnc.seuil / sBnc.ca, 0)} du chiffre d’affaires` : 'seulement avec des frais très élevés'}, avant même de compter le coût de tenue d’une société. La micro reste par ailleurs limitée à ${FR.eur(P.micro.plafonds.services)} en services et ${FR.eur(P.micro.plafonds.vente)} en vente.`,
    faqs: [
      { q: 'À partir de quel chiffre d’affaires une SASU rapporte-t-elle plus qu’une micro-entreprise ?', a: `Ce n’est pas une affaire de chiffre d’affaires mais de frais. Avec ${FR.eur(fraisBase)} de dépenses par an, un consultant reste mieux en micro jusqu’au plafond de ${FR.eur(P.micro.plafonds.services)} : ${FR.eur(top.m.net)} de revenu annuel contre ${FR.eur(top.s.net)} en SASU. Ce qui fait pencher la balance, c’est la part des recettes que mangent vos frais, car la micro ne les déduit jamais. Calcul NetIndé, barèmes 2026.` },
      { q: 'Avec beaucoup de frais, faut-il quitter la micro-entreprise pour une SASU ?', a: `Souvent, oui. Pour ${FR.eur(sBnc.ca)} de recettes en libéral, la SASU laisse davantage dès ${FR.eur(sBnc.seuil)} de frais annuels. Avec ce niveau de dépenses, le moteur donne ${FR.eur(mLourd.net)} par an en micro et ${FR.eur(sLourd.net)} en SASU. Comparez aussi l’entreprise individuelle au réel, qui déduit les frais sans créer de société, et ajoutez le coût de la comptabilité d’une société.` },
      { q: 'Pourquoi un artisan garde-t-il plus longtemps l’avantage en micro ?', a: `Parce que son taux de cotisations, ${FR.pct(P.micro.taux.bic)}, est plus bas que celui des libéraux, ${FR.pct(P.micro.taux.bnc)}, et que son abattement fiscal est de ${FR.pct(P.micro.abattement.bic, 0)} au lieu de ${FR.pct(P.micro.abattement.bnc, 0)}. Pour ${FR.eur(sArt.ca)} de chiffre d’affaires, la SASU ne passe devant qu’à partir de ${FR.eur(sArt.seuil)} de frais, contre ${FR.eur(sBnc.seuil)} pour un consultant au même chiffre d’affaires.` },
      { q: 'Dépasser le plafond de la micro oblige-t-il à créer une SASU ?', a: `Non. Un seul dépassement de ${FR.eur(P.micro.plafonds.services)} en services, ou de ${FR.eur(P.micro.plafonds.vente)} en vente, est toléré ; c’est après deux années consécutives au-dessus que le régime micro prend fin au 1er janvier suivant (service-public, fiche F32353). L’activité continue alors en entreprise individuelle au réel, sans formalité de société. La SASU reste un choix, pas une obligation.` },
      { q: 'Combien d’impôt sur les sociétés paierait ma SASU à 60 000 € de chiffre d’affaires ?', a: `Pour ${FR.eur(60000)} de recettes et ${FR.eur(fraisBase)} de frais, en suivant le partage optimal du moteur, la SASU verserait ${FR.eur(rempl.impotSocietes)} d’impôt sur les sociétés, au taux de ${FR.pct(P.is.taux_reduit, 0)} puisque le bénéfice reste sous ${FR.eur(P.is.seuil_reduit)}. S’y ajoutent ${FR.eur(rempl.cotisations)} de cotisations sur le salaire du président et ${FR.eur(rempl.prelevementsDividendes)} de prélèvements sur les dividendes.` },
      { q: 'Un président de SASU payé en dividendes est-il mieux couvert qu’un micro-entrepreneur ?', a: `Plutôt moins bien. Le micro-entrepreneur cotise sur chaque euro encaissé et reste rattaché à la CPAM pour la maladie, avec des indemnités calculées sur son chiffre d’affaires abattu (Urssaf). Le président de SASU qui ne se verse pas de salaire ne cotise pas, ne valide aucun trimestre de retraite et n’a jamais d’assurance chômage au titre de son mandat.` },
    ],
    body: (h) => `
<h2>Deux façons de taxer la même activité</h2>
<p>La micro-entreprise ne connaît que le chiffre d’affaires encaissé. Chaque mois ou chaque trimestre, vous déclarez vos recettes et l’Urssaf prélève un pourcentage fixe (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}) : ${h.pct(P.micro.taux.vente)}, ${h.pct(P.micro.taux.bic)} ou ${h.pct(P.micro.taux.bnc)} selon l’activité. Pour l’impôt sur le revenu, un ${h.src('spMicroImposition', 'abattement forfaitaire')} de ${h.pct(P.micro.abattement.vente, 0)}, ${h.pct(P.micro.abattement.bic, 0)} ou ${h.pct(P.micro.abattement.bnc, 0)} remplace vos frais réels. Un logiciel, un loyer de bureau ou un véhicule ne changent rien à la facture.</p>
<p>La SASU raisonne sur le bénéfice. Les dépenses sont déduites, puis le résultat se partage entre le salaire du président, chargé aux ${h.src('urssafTauxSalarie', 'taux du régime général')}, l’${h.src('spIs', 'impôt sur les sociétés')} et les dividendes au ${h.src('spDividendes', 'prélèvement forfaitaire unique')}. Le moteur cherche le partage qui maximise le revenu disponible : à faible bénéfice, il verse peu ou pas de salaire.</p>

<h2>Avec peu de frais, la micro reste devant</h2>
${h.table(['Chiffre d’affaires', 'Micro, revenu / an', 'SASU, revenu / an', 'Écart en faveur de la micro'], paliers.map((p) => [h.eur(p.ca), h.eur(p.m.net), h.eur(p.s.net), h.eur(p.m.net - p.s.net)]), `Libéral (BNC), ${h.eur(fraisBase)} de frais, personne seule, impôt sur le revenu compris, barèmes 2026`, ['l', 'r', 'r', 'r'])}
<p>Sur toute la plage autorisée, l’écart joue pour la micro lorsque les frais sont faibles. La raison tient en une ligne : un consultant qui dépense peu paie ${h.pct(P.micro.taux.bnc)} sur des recettes qui sont presque toutes du revenu, alors que la SASU ajoute une couche d’impôt sur les sociétés et une couche de prélèvement sur les dividendes. La société n’a pas de quoi compenser.</p>

<h2>Le vrai déclencheur : la part des frais</h2>
<p>Dès que les dépenses montent, la micro paie des cotisations sur de l’argent qui ne reste pas dans votre poche. Le moteur cherche, pour trois profils, le niveau de frais annuel à partir duquel la SASU laisse un revenu supérieur.</p>
${h.table(['Profil', 'Chiffre d’affaires', 'Frais à partir desquels la SASU passe devant', 'Part du chiffre d’affaires'], scen.map((s) => [s.fr, h.eur(s.ca), s.seuil ? h.eur(s.seuil) : 'jamais', s.seuil ? h.pct(s.seuil / s.ca, 0) : '–']), 'Recherche par pas de 500 €, personne seule, sans frais de tenue de société', ['l', 'r', 'r', 'r'])}
<p>Le consultant bascule le plus tôt, parce qu’il cumule le taux de cotisations le plus fort et le plus petit abattement. L’artisan tient plus longtemps grâce à un taux plus bas et un abattement plus généreux. Le vendeur de marchandises, qui profite d’un taux de ${h.pct(P.micro.taux.vente)} et d’un abattement de ${h.pct(P.micro.abattement.vente, 0)}, ne bascule qu’avec des achats très lourds${sVente.seuil ? `, à partir de ${h.eur(sVente.seuil)} de frais pour ${h.eur(sVente.ca)} de ventes` : ''}. Ces seuils sont un plancher : le coût de la comptabilité d’une société, que nous ne chiffrons pas, les repousse. Le mini-simulateur en haut de page permet de l’ajouter dans la case prévue.</p>
<p>Avant de sauter jusqu’à la société, regardez l’étape intermédiaire. L’${h.a('entrepreneur-individuel', 'entreprise individuelle au réel')} déduit aussi les frais, sans impôt sur les sociétés ni dividendes ; la comparaison avec la micro est sur ${h.a('micro-ou-reel', 'micro ou réel')}.</p>

<h2>Le plafond, une limite que la SASU n’a pas</h2>
<p>La micro-entreprise s’arrête à ${h.eur(P.micro.plafonds.services)} de chiffre d’affaires annuel pour les services et ${h.eur(P.micro.plafonds.vente)} pour la vente (${h.src('spPlafonds', 'fiche F32353')}). Un dépassement isolé est toléré ; deux années consécutives au-dessus font sortir du régime au 1er janvier suivant. La SASU n’a aucun plafond. Pour quelqu’un dont l’activité décolle, cette marge compte autant que le calcul de l’année : le détail des seuils est sur ${h.a('plafond-micro-entreprise', 'le plafond de la micro-entreprise')}.</p>

<h2>Ce que la SASU optimisée sacrifie</h2>
<p>Le partage qui maximise le revenu en SASU repose sur un petit salaire et beaucoup de dividendes. C’est efficace à court terme, mais une rémunération nulle ne valide aucun trimestre de retraite, et le président n’est jamais couvert par l’assurance chômage au titre de son mandat. Le micro-entrepreneur, lui, cotise sur chaque euro encaissé : ses droits suivent son activité, sans arbitrage à faire. Le réglage fin entre salaire et dividendes se fait sur ${h.a('salaire-ou-dividendes', 'salaire ou dividendes')}, et le coût du salaire du président sur ${h.a('charges-sasu', 'les charges de SASU')}.</p>
<p>Ces chiffres sont des estimations tirées des barèmes 2026, pas un conseil personnalisé ; l’Urssaf et l’administration fiscale arrêtent les montants dus.</p>`,
  },
  en: {
    slug: 'micro-enterprise-or-sasu',
    nav: 'Micro-enterprise or SASU',
    card: 'The level of expenses that tips the balance, by type of activity.',
    title: 'Micro-enterprise or SASU 2026: the cost level that decides',
    description: 'Micro-enterprise or SASU in 2026: 25.6% of turnover for freelancers against corporate tax and 31.4% on dividends, and the costs at which the SASU pays more.',
    h1: 'Micro-enterprise or SASU: when does a company start paying off?',
    intro: 'What decides is less your turnover than the share of it your business expenses swallow.',
    resume: `For someone working alone with few expenses, the French micro-enterprise scheme leaves more income in 2026 than a SASU right up to the scheme’s ceiling: a freelance consultant with ${EN.eur(top.ca)} of turnover and ${EN.eur(fraisBase)} of costs keeps ${EN.eur(top.m.net)} a year as a micro-entrepreneur against ${EN.eur(top.s.net)} through a SASU (société par actions simplifiée unipersonnelle, a one-shareholder company), according to our engine. The micro scheme takes ${EN.pct(P.micro.taux.bnc)} of turnover received for freelance professions, ${EN.pct(P.micro.taux.bic)} for commercial or craft services and ${EN.pct(P.micro.taux.vente)} for selling goods, and ignores your real costs. A SASU only taxes profit: IS, the French corporate tax, at ${EN.pct(P.is.taux_reduit, 0)} up to ${EN.eur(P.is.seuil_reduit)}, contributions on the president’s salary and the ${EN.pct(P.dividendes.pfu)} flat tax on dividends. So the switch depends on costs: on ${EN.eur(sBnc.ca)} of freelance turnover, the SASU pulls ahead ${sBnc.seuil ? `from ${EN.eur(sBnc.seuil)} of annual expenses, ${EN.pct(sBnc.seuil / sBnc.ca, 0)} of turnover` : 'only with very high expenses'}, before counting what running a company costs. The micro scheme is also capped at ${EN.eur(P.micro.plafonds.services)} for services and ${EN.eur(P.micro.plafonds.vente)} for sales.`,
    faqs: [
      { q: 'At what turnover does a SASU beat the micro-enterprise scheme?', a: `Turnover is not really the trigger; expenses are. With ${EN.eur(fraisBase)} of costs a year, a consultant stays better off as a micro-entrepreneur up to the ${EN.eur(P.micro.plafonds.services)} ceiling: ${EN.eur(top.m.net)} of yearly income against ${EN.eur(top.s.net)} through a SASU. What tips the balance is the share of receipts eaten by costs, since the micro scheme never deducts them. NetIndé engine, 2026 rates.` },
      { q: 'My expenses are high: should I move from micro to a SASU?', a: `Often, yes. On ${EN.eur(sBnc.ca)} of freelance turnover, the SASU leaves more from ${EN.eur(sBnc.seuil)} of annual costs. At that level the engine gives ${EN.eur(mLourd.net)} a year as a micro-entrepreneur and ${EN.eur(sLourd.net)} through a SASU. Also look at a sole trader on real profit, which deducts costs without setting up a company, and add the bookkeeping cost a company brings.` },
      { q: 'Why does a tradesperson stay better off in the micro scheme for longer?', a: `Because the craft and commercial services rate, ${EN.pct(P.micro.taux.bic)}, is lower than the freelance rate of ${EN.pct(P.micro.taux.bnc)}, and the income tax allowance is ${EN.pct(P.micro.abattement.bic, 0)} instead of ${EN.pct(P.micro.abattement.bnc, 0)}. On ${EN.eur(sArt.ca)} of turnover the SASU only pulls ahead from ${EN.eur(sArt.seuil)} of costs, against ${EN.eur(sBnc.seuil)} for a consultant on the same turnover.` },
      { q: 'If I go over the micro ceiling, do I have to form a SASU?', a: `No. One year above ${EN.eur(P.micro.plafonds.services)} for services, or ${EN.eur(P.micro.plafonds.vente)} for sales, is tolerated; after two consecutive years above it the micro scheme ends on the following 1 January (service-public, sheet F32353). You then carry on as a sole trader on real profit, with no company to set up. A SASU stays a choice, never an obligation.` },
      { q: 'How much corporate tax would a SASU on €60,000 of turnover pay?', a: `On ${EN.eur(60000)} of turnover and ${EN.eur(fraisBase)} of costs, using the engine’s best split, the SASU would pay ${EN.eur(rempl.impotSocietes)} of corporate tax at the ${EN.pct(P.is.taux_reduit, 0)} rate, since profit stays below ${EN.eur(P.is.seuil_reduit)}. On top come ${EN.eur(rempl.cotisations)} of contributions on the president’s salary and ${EN.eur(rempl.prelevementsDividendes)} of tax and levies on dividends.` },
      { q: 'Is a dividend-paid SASU president better covered than a micro-entrepreneur?', a: `Rather the opposite. A micro-entrepreneur pays contributions on every euro received and is attached to the CPAM, the local health insurance fund, with sick pay based on turnover after the flat allowance (Urssaf). A SASU president who takes no salary pays nothing in, validates no pension quarters and never has unemployment cover for the director role.` },
    ],
    body: (h) => `
<h2>Two ways of taxing the same work</h2>
<p>The micro-enterprise scheme only looks at turnover received. Every month or quarter you declare receipts and the Urssaf, the body collecting social contributions, takes a fixed percentage (${h.src('spCotisationsMicro', 'service-public, sheet F36232')}): ${h.pct(P.micro.taux.vente)}, ${h.pct(P.micro.taux.bic)} or ${h.pct(P.micro.taux.bnc)} depending on the activity. For income tax, a ${h.src('spMicroImposition', 'flat allowance')} of ${h.pct(P.micro.abattement.vente, 0)}, ${h.pct(P.micro.abattement.bic, 0)} or ${h.pct(P.micro.abattement.bnc, 0)} stands in for your real costs. Software, office rent or a car make no difference to the bill.</p>
<p>A SASU works on profit. Costs are deducted, then what is left is shared between the president’s salary, charged at ${h.src('urssafTauxSalarie', 'general-scheme rates')}, ${h.src('spIs', 'corporate tax')} and dividends under the ${h.src('spDividendes', 'PFU flat tax')} (prélèvement forfaitaire unique). The engine looks for the split that leaves the most disposable income; at low profit it pays little or no salary.</p>

<h2>With few expenses, micro stays ahead</h2>
${h.table(['Turnover', 'Micro, income / yr', 'SASU, income / yr', 'Gap in favour of micro'], paliers.map((p) => [h.eur(p.ca), h.eur(p.m.net), h.eur(p.s.net), h.eur(p.m.net - p.s.net)]), `Freelance profession (BNC), ${h.eur(fraisBase)} of costs, single, income tax included, 2026 rates`, ['l', 'r', 'r', 'r'])}
<p>Across the whole range the scheme allows, micro wins when costs are low. The reason is simple: a consultant who spends little pays ${h.pct(P.micro.taux.bnc)} on receipts that are nearly all income, while the SASU adds a layer of corporate tax and a layer of dividend tax. The company has nothing to offset them with.</p>

<h2>The real trigger: how much you spend</h2>
<p>Once expenses rise, the micro scheme charges contributions on money that never reaches you. For three profiles, the engine finds the annual expense level from which a SASU leaves higher income.</p>
${h.table(['Profile', 'Turnover', 'Costs from which the SASU wins', 'Share of turnover'], scen.map((s) => [s.en, h.eur(s.ca), s.seuil ? h.eur(s.seuil) : 'never', s.seuil ? h.pct(s.seuil / s.ca, 0) : '–']), 'Searched in €500 steps, single person, company running costs excluded', ['l', 'r', 'r', 'r'])}
<p>The consultant tips first, combining the highest contribution rate with the smallest allowance. The tradesperson holds out longer thanks to a lower rate and a bigger allowance. The seller of goods, on ${h.pct(P.micro.taux.vente)} and a ${h.pct(P.micro.abattement.vente, 0)} allowance, only tips with very heavy purchases${sVente.seuil ? `, from ${h.eur(sVente.seuil)} of costs on ${h.eur(sVente.ca)} of sales` : ''}. Treat these figures as a minimum: company bookkeeping, which we do not price, pushes them higher. The mini-calculator at the top has a box for it.</p>
<p>Before jumping to a company, look at the middle step. A ${h.a('entrepreneur-individuel', 'sole trader on real profit')} (entreprise individuelle au réel) also deducts costs, with no corporate tax and no dividends; the comparison with micro is on ${h.a('micro-ou-reel', 'micro or real profit')}.</p>

<h2>The ceiling, a limit a SASU does not have</h2>
<p>The micro scheme stops at ${h.eur(P.micro.plafonds.services)} of annual turnover for services and ${h.eur(P.micro.plafonds.vente)} for sales (${h.src('spPlafonds', 'sheet F32353')}). One year over is tolerated; two consecutive years over end the scheme on the next 1 January. A SASU has no ceiling at all. If your business is taking off, that headroom matters as much as this year’s figures; thresholds are covered on ${h.a('plafond-micro-entreprise', 'the micro-enterprise ceiling')}.</p>

<h2>What an optimised SASU gives up</h2>
<p>The split that maximises SASU income relies on a small salary and large dividends. It works in the short run, but a zero salary validates no pension quarters, the units in which French pension rights are counted, and the president never has unemployment cover for the director role. A micro-entrepreneur contributes on every euro received, so cover follows activity with no trade-off to manage. Fine-tune the split on ${h.a('salaire-ou-dividendes', 'salary or dividends')} and see what the president’s pay costs on ${h.a('charges-sasu', 'SASU president pay')}.</p>
<p>If you arrive from abroad, the practical gap is also one of paperwork: a micro-entrepreneur simply files turnover online each month or quarter on autoentrepreneur.urssaf.fr, while a SASU means running a separate legal entity. These figures are estimates from the 2026 scales, not personal advice; the Urssaf and the French tax office set what you actually owe.</p>`,
  },
});
