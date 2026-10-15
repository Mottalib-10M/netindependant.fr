import { defineGuide } from '../../lib/guide-types';
import { micro, seuilVL, type Activite } from '../../lib/engine/micro';
import type { Foyer } from '../../lib/engine/ir';
import { P, FR, EN } from '../../lib/fmt';

const vl = P.micro.vl;
const tot = P.micro.taux_vl_total;
const SEUL: Foyer = { parts: 1, couple: false };
const COUPLE: Foyer = { parts: 2, couple: true };
const COUPLE1: Foyer = { parts: 2.5, couple: true };

// Cinq foyers calculés par le moteur, revenus supposés stables d'une année sur l'autre.
interface Cas { fr: string; en: string; ca: number; activite: Activite; artisan?: boolean; autres: number; foyer: Foyer }
const liste: Cas[] = [
  { fr: 'Coach, seul, sans autre revenu', en: 'Coach, single, no other income', ca: 30000, activite: 'bnc', autres: 0, foyer: SEUL },
  { fr: 'Traductrice, seule', en: 'Translator, single', ca: 42000, activite: 'bnc', autres: 0, foyer: SEUL },
  { fr: 'Rédactrice en couple, conjoint à 30 000 € imposables', en: 'Copywriter in a couple, partner on €30,000 taxable', ca: 30000, activite: 'bnc', autres: 30000, foyer: COUPLE },
  { fr: 'Développeur, seul', en: 'Developer, single', ca: 60000, activite: 'bnc', autres: 0, foyer: SEUL },
  { fr: 'Électricien en couple, un enfant', en: 'Electrician in a couple, one child', ca: 45000, activite: 'bic', artisan: true, autres: 0, foyer: COUPLE1 },
];
const calc = liste.map((c) => {
  const bareme = micro({ ca: c.ca, activite: c.activite, artisan: c.artisan, autres: c.autres, foyer: c.foyer });
  const opt = micro({ ca: c.ca, activite: c.activite, artisan: c.artisan, autres: c.autres, foyer: c.foyer, vl: true });
  const rfr = c.autres + bareme.revenuAbattu;
  const plafond = seuilVL(c.foyer.parts, 2026);
  return { ...c, ir: bareme.ir, vl: opt.vl, rfr, plafond, eligible: rfr <= plafond };
});
const [coach, trad, redac, dev] = calc;
const foyers: Array<[string, string, number]> = [['Personne seule', 'Single person', 1], ['Couple', 'Couple', 2], ['Couple, un enfant', 'Couple, one child', 2.5], ['Couple, deux enfants', 'Couple, two children', 3]];
const eurOuDec = (x: number, f: (n: number, d?: number) => string) => f(x, Number.isInteger(x) ? 0 : 2);

export default defineGuide({
  id: 'versement-liberatoire',
  group: 'micro',
  order: 50,
  mini: 'vlCompare',
  related: ['impot-auto-entrepreneur', 'micro-entreprise', 'charges-auto-entrepreneur', 'declarer-chiffre-affaires', 'auto-entrepreneur-salarie'],
  sources: ['impotsVL', 'spMicroImposition', 'spCotisationsMicro', 'monEntreprise'],
  fr: {
    slug: 'versement-liberatoire',
    nav: 'Versement libératoire',
    card: `Les taux de ${FR.pct(vl.vente, 0)} à ${FR.pct(vl.bnc)}, la condition de revenu fiscal et les cas où il coûte plus cher.`,
    title: 'Versement libératoire 2026 : taux, RFR maximal et calcul',
    description: 'Versement libératoire 2026 : 1 %, 1,7 % ou 2,2 % du chiffre d’affaires, si le RFR ne dépasse pas 29 315 € par part. Quand il fait gagner, quand il coûte.',
    h1: 'Le versement libératoire de l’impôt sur le revenu en micro-entreprise',
    intro: 'Un petit pourcentage du chiffre d’affaires qui solde l’impôt de l’activité, avantageux pour certains foyers et coûteux pour d’autres.',
    resume: `Le versement libératoire permet à un micro-entrepreneur de régler l’impôt sur le revenu de son activité en même temps que ses cotisations, par un pourcentage fixe de son chiffre d’affaires : ${FR.pct(vl.vente, 0)} pour la vente de marchandises et l’hébergement, ${FR.pct(vl.bic)} pour les prestations de services commerciales ou artisanales, ${FR.pct(vl.bnc)} pour les activités libérales. L’option est réservée aux foyers dont le revenu fiscal de référence de l’avant-dernière année ne dépasse pas, par part, la limite de la deuxième tranche du barème : ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2026)} pour 2026 selon le simulateur de l’Urssaf, ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2027)} pour une option prenant effet en 2027. Elle n’est pas toujours gagnante : un coach seul qui encaisse ${FR.eur(30000)} paierait ${FR.eur(coach.vl)} par versement libératoire contre ${FR.eur(coach.ir)} au barème, grâce à la décote. Une traductrice seule à ${FR.eur(42000)}, elle, économise ${FR.eur(trad.ir - trad.vl)} par an. Tout dépend des autres revenus du foyer et de son taux marginal.`,
    faqs: [
      { q: 'Jusqu’à quand opter pour le versement libératoire en 2027 ?', a: `Hors création, l’option se demande avant le 30 septembre pour l’année suivante : pour 2027, la date limite était donc le 30 septembre 2026, et la prochaine fenêtre se ferme le 30 septembre 2027, pour 2028. Un créateur peut opter dès l’immatriculation ou jusqu’au dernier jour du troisième mois suivant, d’après impots.gouv.fr, à condition que son RFR ne dépasse pas ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2027)} par part.` },
      { q: 'Le versement libératoire modifie-t-il l’impôt sur le salaire de mon conjoint ?', a: `Indirectement, oui. Le chiffre d’affaires de l’activité, après abattement, reste pris en compte pour fixer le taux d’imposition des autres revenus du foyer, et il entre dans le revenu fiscal de référence, selon service-public et impots.gouv.fr. Le salaire du conjoint peut donc être taxé à un taux un peu plus élevé qu’en l’absence d’activité, même si l’activité elle-même ne paie que ${FR.pct(vl.bnc)} en libéral.` },
      { q: 'Quel revenu fiscal de référence maximum pour un couple avec deux enfants en versement libératoire ?', a: `Pour une option qui prend effet en 2027, service-public indique ${eurOuDec(seuilVL(3, 2027), FR.eur)} de revenu fiscal de référence 2025 pour un couple avec deux enfants, soit trois parts à ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2027)}. Pour 2026, sur le RFR 2024, le simulateur de l’Urssaf retient ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part, soit ${FR.eur(seuilVL(3, 2026))} pour ce foyer.` },
      { q: 'Comment sortir du versement libératoire ?', a: `En le dénonçant avant le 30 septembre pour l’année suivante, d’après impots.gouv.fr. Il prend aussi fin de lui-même si vous dépassez les seuils de la micro-entreprise, ${FR.eur(P.micro.plafonds.services)} en services, ou si votre revenu fiscal de référence dépasse la limite par part. Vous revenez alors à l’impôt au barème, calculé après abattement sur la déclaration annuelle.` },
      { q: 'Le versement libératoire se paie-t-il avec les cotisations Urssaf ?', a: `Oui, il s’ajoute aux cotisations et se règle avec chaque déclaration mensuelle ou trimestrielle de chiffre d’affaires. Service-public affiche les taux cumulés hors formation professionnelle : ${FR.pct(tot.vente)} en vente, ${FR.pct(tot.bic)} en services commerciaux ou artisanaux, ${FR.pct(tot.bnc)} en libéral non réglementé et ${FR.pct(tot.cipav)} pour la Cipav. Aucun solde d’impôt sur l’activité n’arrive ensuite.` },
      { q: 'Un développeur seul à 60 000 € peut-il choisir le versement libératoire ?', a: `Le calcul y pousse, puisque l’option coûterait ${FR.eur(dev.vl)} contre ${FR.eur(dev.ir)} au barème. Mais avec un revenu stable, son revenu fiscal de référence atteint ${FR.eur(dev.rfr)}, au-dessus des ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2026)} autorisés pour une part en 2026. Il n’y a droit que si son RFR de l’avant-dernière année était plus bas, par exemple l’année du démarrage.` },
    ],
    body: (h) => `
<h2>Les taux et ce qu’ils remplacent</h2>
<p>Le versement libératoire remplace l’impôt sur le revenu dû sur l’activité, et seulement celui-là (${h.src('impotsVL', 'impots.gouv.fr, le versement libératoire')}). Il se paie à l’Urssaf avec les cotisations, au même rythme, sur le même chiffre d’affaires encaissé.</p>
${h.table(['Activité', 'Versement libératoire', 'Cotisations', 'Total payé à chaque échéance'], [
  ['Vente de marchandises, hébergement', h.pct(vl.vente), h.pct(P.micro.taux.vente), h.pct(tot.vente)],
  ['Services commerciaux ou artisanaux (BIC)', h.pct(vl.bic), h.pct(P.micro.taux.bic), h.pct(tot.bic)],
  ['Libéral non réglementé (BNC)', h.pct(vl.bnc), h.pct(P.micro.taux.bnc), h.pct(tot.bnc)],
  ['Libéral relevant de la Cipav', h.pct(vl.cipav), h.pct(P.micro.taux.cipav), h.pct(tot.cipav)],
], 'Taux du versement libératoire en 2026, hors contribution à la formation professionnelle', ['l', 'r', 'r', 'r'])}
<p>Comparé à l’impôt au barème, le versement libératoire a un trait singulier : il est dû dès le premier euro encaissé. Le barème, lui, ne taxe rien sous ${h.eur(P.ir.bareme[0][0] as number)} de revenu par part et ménage les petits revenus par la décote. C’est ce qui rend l’option perdante pour beaucoup de foyers modestes.</p>

<h2>La condition de revenu</h2>
<p>Peut opter le foyer dont le revenu fiscal de référence de l’avant-dernière année ne dépasse pas la limite de la deuxième tranche du barème, par part de quotient familial. La limite augmente de moitié par demi-part supplémentaire et d’un quart par quart de part (${h.src('spMicroImposition', 'service-public, fiche F23267')}). Pour 2026, c’est le RFR 2024 qui compte, avec ${h.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part d’après le ${h.src('monEntreprise', 'simulateur de l’Urssaf')} ; pour une option en 2027, le RFR 2025, avec ${h.eur(P.micro.vl_seuil_rfr_par_part.y2027)} par part.</p>
${h.table(['Foyer', 'Parts', 'RFR maximal, option 2026', 'RFR maximal, option 2027'], foyers.map(([fr, , parts]) => [fr, h.num(parts, Number.isInteger(parts) ? 0 : 1), eurOuDec(seuilVL(parts, 2026), h.eur), eurOuDec(seuilVL(parts, 2027), h.eur)]), 'Revenu fiscal de référence à ne pas dépasser, calculé avec la fonction du moteur', ['l', 'r', 'r', 'r'])}
<p>Le décalage de deux ans a une conséquence pratique : l’année où l’activité décolle, on peut encore être éligible grâce à un RFR ancien et modeste ; deux ans plus tard, le succès de l’activité ferme la porte.</p>

<h2>Cinq foyers, cinq verdicts</h2>
<p>Le moteur compare l’impôt au barème imputable à l’activité et le versement libératoire, puis vérifie la condition de RFR en supposant des revenus stables d’une année sur l’autre.</p>
${h.table(['Foyer', 'Chiffre d’affaires', 'Impôt au barème', 'Versement libératoire', 'RFR estimé', 'Option ouverte'], calc.map((c) => [c.fr, h.eur(c.ca), h.eur(c.ir), h.eur(c.vl), h.eur(c.rfr), c.eligible ? 'oui' : 'non']), 'Impôt dû sur l’activité selon le mode de paiement, calculé par le moteur', ['l', 'r', 'r', 'r', 'r', 'l'])}
<p>Le coach seul paie moins au barème : son revenu après abattement reste dans la zone où la décote efface une bonne partie de l’impôt. La traductrice, avec ${h.eur(42000)} de recettes, gagne ${h.eur(trad.ir - trad.vl)} avec l’option. La rédactrice est le cas d’école : le salaire de son conjoint place le foyer dans la tranche à ${h.pct(P.ir.bareme[1][1] as number, 0)}, et le versement libératoire lui fait économiser ${h.eur(redac.ir - redac.vl)}. Le développeur gagnerait encore davantage, mais son revenu dépasse la limite. Quant à l’électricien, le quotient familial ramène son impôt au barème à ${h.eur(calc[4].ir)} : l’option lui coûterait ${h.eur(calc[4].vl)} pour rien.</p>
<p>Le mini-simulateur en haut de page refait ce calcul avec vos chiffres et vos autres revenus.</p>

<h2>Calendrier de l’option</h2>
<p>À la création, l’option se demande avec l’immatriculation ou au plus tard le dernier jour du troisième mois qui suit. Ensuite, elle se demande avant le 30 septembre pour l’année suivante, et se dénonce avant la même date (${h.src('impotsVL', 'impots.gouv.fr')}). Le 15 octobre 2026, il est donc trop tard pour 2027 si vous êtes déjà installé : la prochaine décision vaut pour 2028.</p>

<h2>Ce que l’option ne supprime pas</h2>
<p>Le chiffre d’affaires brut se déclare toujours sur la déclaration de revenus, formulaire 2042-C-PRO, sans déduire aucune charge. Après abattement, il s’ajoute au revenu fiscal de référence, celui-là même qui conditionne l’option deux ans plus tard, et il sert à fixer le taux qui s’applique aux autres revenus du foyer (${h.src('spMicroImposition', 'service-public')}). Supprimez enfin l’acompte de prélèvement à la source de l’activité dans votre espace particulier sur impots.gouv.fr, pour éviter de payer deux fois. Pour l’impôt au barème lui-même, voyez ${h.a('impot-auto-entrepreneur', 'l’impôt de l’auto-entrepreneur')} ; pour cumuler avec un salaire, ${h.a('auto-entrepreneur-salarie', 'auto-entrepreneur et salarié')}.</p>
<p>Les montants présentés sont des estimations établies sur les barèmes publiés ; ils ne remplacent pas un conseil personnalisé, et l’administration fiscale fixe seule l’impôt dû.</p>`,
  },
  en: {
    slug: 'flat-rate-income-tax',
    nav: 'Flat-rate income tax option',
    card: `Rates of ${EN.pct(vl.vente, 0)} to ${EN.pct(vl.bnc)}, the household income test and when it costs you more.`,
    title: 'Flat-rate income tax 2026 (versement libératoire) in France',
    description: 'Flat-rate income tax 2026 for French micro-entrepreneurs: 1%, 1.7% or 2.2% of turnover, open if reference income stays under €29,315 per share. Who gains?',
    h1: 'The versement libératoire: paying income tax as a share of turnover',
    intro: 'A small percentage of each payment received that settles the income tax on your business, a bargain for some households and a loss for others.',
    resume: `The versement libératoire is an option that lets a French micro-entrepreneur pay the income tax on business earnings together with social contributions, as a fixed share of turnover: ${EN.pct(vl.vente, 0)} for selling goods and accommodation, ${EN.pct(vl.bic)} for commercial or craft services and ${EN.pct(vl.bnc)} for freelance professions. It is only open to households whose revenu fiscal de référence (RFR, the reference taxable income printed on every French tax notice) two years earlier did not exceed the upper limit of the second band of the income tax scale per share: ${EN.eur(P.micro.vl_seuil_rfr_par_part.y2026)} for 2026 in the Urssaf simulator, ${EN.eur(P.micro.vl_seuil_rfr_par_part.y2027)} for an option starting in 2027. A share (part) is the French family-quotient unit: one for a single adult, two for a couple, more with children. The option does not always win. A single coach receiving ${EN.eur(30000)} would pay ${EN.eur(coach.vl)} this way against ${EN.eur(coach.ir)} on the normal scale, while a single translator on ${EN.eur(42000)} saves ${EN.eur(trad.ir - trad.vl)} a year.`,
    faqs: [
      { q: 'Is it too late to choose the French flat-rate income tax for 2027?', a: `If you are already registered, yes: the request had to reach the tax office before 30 September 2026 for 2027, so the next window closes on 30 September 2027, for 2028. A new business can opt at registration or up to the last day of the third month after it, according to impots.gouv.fr, provided reference income stays under ${EN.eur(P.micro.vl_seuil_rfr_par_part.y2027)} per share.` },
      { q: 'Does the flat-rate option change the tax on my partner’s salary?', a: `Indirectly, yes. Your business turnover after the flat allowance is still used to set the tax rate applied to the household’s other income, and it counts in your reference income, according to service-public and impots.gouv.fr. Your partner’s salary can therefore be taxed at a slightly higher rate than if you had no business, even though the business itself only pays ${EN.pct(vl.bnc)} as a freelancer.` },
      { q: 'What reference income limit applies to a couple with one child?', a: `A couple with one child has two and a half shares. For an option taking effect in 2027, service-public gives ${eurOuDec(seuilVL(2.5, 2027), EN.eur)} of 2025 reference income. For 2026, based on 2024 income, the Urssaf simulator uses ${EN.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per share, which gives ${eurOuDec(seuilVL(2.5, 2026), EN.eur)} for that household. The limit rises by half for each extra half share.` },
      { q: 'How do I cancel the versement libératoire?', a: `By withdrawing the option before 30 September for the following year, according to impots.gouv.fr. It also ends automatically if you exceed the micro-enterprise ceilings, ${EN.eur(P.micro.plafonds.services)} for services, or if your reference income goes above the per-share limit. You then return to income tax on the progressive scale, worked out after the flat allowance on your annual return.` },
      { q: 'Is the flat-rate tax collected by the Urssaf with my contributions?', a: `Yes. It is added to your contributions and paid with each monthly or quarterly turnover return. Service-public shows the combined rates before the training levy: ${EN.pct(tot.vente)} for goods, ${EN.pct(tot.bic)} for commercial or craft services, ${EN.pct(tot.bnc)} for unregulated freelancers and ${EN.pct(tot.cipav)} for Cipav professions. No further tax bill on that business income follows.` },
      { q: 'My partner earns a salary: does the flat-rate option make sense for me?', a: `Often, because the salary pushes the household into a higher band. A copywriter receiving ${EN.eur(30000)} whose partner has ${EN.eur(30000)} of taxable income would pay ${EN.eur(redac.ir)} on the scale for her business, against ${EN.eur(redac.vl)} with the option. With two shares, their reference income of ${EN.eur(redac.rfr)} stays under the ${EN.eur(seuilVL(2, 2026))} limit.` },
    ],
    body: (h) => `
<h2>The rates and what they replace</h2>
<p>If you come from a country where self-employed people pay income tax once a year on profit, this option will feel unusual. The versement libératoire replaces the French income tax due on your micro-business, and only that (${h.src('impotsVL', 'impots.gouv.fr, the flat-rate payment')}). It is paid to the Urssaf alongside contributions, on the same turnover and at the same rhythm.</p>
${h.table(['Activity', 'Flat-rate tax', 'Contributions', 'Total paid each return'], [
  ['Selling goods, accommodation', h.pct(vl.vente), h.pct(P.micro.taux.vente), h.pct(tot.vente)],
  ['Commercial or craft services (BIC)', h.pct(vl.bic), h.pct(P.micro.taux.bic), h.pct(tot.bic)],
  ['Unregulated freelance (BNC)', h.pct(vl.bnc), h.pct(P.micro.taux.bnc), h.pct(tot.bnc)],
  ['Cipav professions', h.pct(vl.cipav), h.pct(P.micro.taux.cipav), h.pct(tot.cipav)],
], 'Flat-rate income tax rates in 2026, before the training levy', ['l', 'r', 'r', 'r'])}
<p>The key difference from the normal scale: the flat rate applies from the first euro. The progressive scale charges nothing on the first ${h.eur(P.ir.bareme[0][0] as number)} of income per share and softens small tax bills with the décote, a discount for low-tax households. That is why the option loses money for many modest households.</p>

<h2>The household income test</h2>
<p>You can opt if your household’s reference income from two years earlier does not exceed the upper limit of the second tax band, per share. The limit rises by half for each extra half share and by a quarter for each quarter share (${h.src('spMicroImposition', 'service-public, sheet F23267')}). For 2026 the 2024 income counts, against ${h.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per share in the ${h.src('monEntreprise', 'Urssaf simulator')}; for 2027, the 2025 income, against ${h.eur(P.micro.vl_seuil_rfr_par_part.y2027)} per share.</p>
${h.table(['Household', 'Shares', 'Max RFR, 2026 option', 'Max RFR, 2027 option'], foyers.map(([, en, parts]) => [en, h.num(parts, Number.isInteger(parts) ? 0 : 1), eurOuDec(seuilVL(parts, 2026), h.eur), eurOuDec(seuilVL(parts, 2027), h.eur)]), 'Reference taxable income ceiling, computed with the engine function', ['l', 'r', 'r', 'r'])}
<p>The two-year lag also means that the year your business takes off, you may still qualify on old, modest income; two years later, success closes the door.</p>

<h2>Five households, five answers</h2>
<p>The engine compares the income tax your business adds on the scale with the flat-rate amount, then checks the income test assuming earnings stay stable from year to year.</p>
${h.table(['Household', 'Turnover', 'Tax on the scale', 'Flat-rate tax', 'Estimated RFR', 'Option open'], calc.map((c) => [c.en, h.eur(c.ca), h.eur(c.ir), h.eur(c.vl), h.eur(c.rfr), c.eligible ? 'yes' : 'no']), 'Income tax on the business by payment method, computed by the engine', ['l', 'r', 'r', 'r', 'r', 'l'])}
<p>The single coach pays less on the scale, because the low-tax discount wipes out much of his bill. The translator saves ${h.eur(trad.ir - trad.vl)} with the option. The copywriter shows the classic case: her partner’s salary places the household in the ${h.pct(P.ir.bareme[1][1] as number, 0)} band, and the option saves ${h.eur(redac.ir - redac.vl)}. The developer would save even more but his income is over the limit. As for the electrician, the family quotient brings his tax on the scale down to ${h.eur(calc[4].ir)}, so the option would cost him ${h.eur(calc[4].vl)} for nothing.</p>
<p>The mini-calculator at the top of the page runs the same comparison with your own numbers.</p>

<h2>Deadlines</h2>
<p>A new business can opt at registration or up to the last day of the third month after it. After that, the request goes in before 30 September for the next year, and the option is withdrawn by the same date (${h.src('impotsVL', 'impots.gouv.fr')}). If you are already trading, it is too late for 2027 now: the next decision applies to 2028.</p>

<h2>What the option does not remove</h2>
<p>Your gross turnover still appears on the income tax return, form 2042-C-PRO, with no costs deducted. After the allowance it counts in your reference income, the very figure that decides your eligibility two years later, and it sets the rate applied to the household’s other income (${h.src('spMicroImposition', 'service-public')}). Remember to cancel the withholding instalment (prélèvement à la source) for the business in your personal space on impots.gouv.fr. For the standard method see ${h.a('impot-auto-entrepreneur', 'income tax for micro-entrepreneurs')}; for combining with a job, ${h.a('auto-entrepreneur-salarie', 'a side business with a job')}.</p>
<p>Amounts shown are estimates based on the published scales, not personal advice; the French tax office alone sets the tax you owe.</p>`,
  },
});
