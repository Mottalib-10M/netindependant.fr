import { defineGuide } from '../../lib/guide-types';
import { plafondProrata } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

const pf = P.micro.plafonds;
/** Jours d'activité en 2026 pour un début au jour `d` du mois `m` (1 à 12), jour de début compris. */
const jours = (m: number, d = 1) => Math.round((Date.UTC(2027, 0, 1) - Date.UTC(2026, m - 1, d)) / 86400000);
// Exemples officiels de service-public, recalculés par le moteur.
const exVente = plafondProrata('vente', jours(1, 31));
const exServices = plafondProrata('bnc', jours(3, 1));
// Une consultante qui démarre le 1er septembre 2026.
const septJours = jours(9);
const septPlafond = plafondProrata('bnc', septJours);
// Tableau de prorata par mois de début (le 1er du mois).
const mois = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const nomFR = (m: number) => new Date(Date.UTC(2026, m - 1, 1)).toLocaleDateString('fr-FR', { month: 'long', timeZone: 'UTC' });
const nomEN = (m: number) => new Date(Date.UTC(2026, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });
// Activité mixte : marge restante en vente quand la part services est au maximum.
const margeVenteMixte = pf.vente - pf.services;

export default defineGuide({
  id: 'plafond-micro-entreprise',
  group: 'micro',
  order: 30,
  mini: 'plafond',
  related: ['micro-entreprise', 'tva-auto-entrepreneur', 'micro-ou-reel', 'creer-micro-entreprise', 'entrepreneur-individuel'],
  sources: ['spPlafonds', 'aeEssentiel', 'spCotisationsMicro', 'spMicroImposition'],
  fr: {
    slug: 'plafond-micro-entreprise',
    nav: 'Plafond de chiffre d’affaires',
    card: 'Les seuils 2026, le prorata de la première année et la règle des deux ans.',
    title: 'Plafond micro-entreprise 2026 : seuils, prorata et sortie',
    description: 'Plafond micro-entreprise 2026 : 203 100 € en vente, 83 600 € en services, proratisé l’année de création. Un dépassement est toléré, pas deux de suite.',
    h1: 'Le plafond de chiffre d’affaires de la micro-entreprise',
    intro: 'Deux chiffres à surveiller, un calcul au prorata la première année, et une année de dépassement tolérée.',
    resume: `Le plafond de la micro-entreprise est fixé pour 2026 à ${FR.eur(pf.vente)} de chiffre d’affaires annuel pour la vente de marchandises et l’hébergement, et à ${FR.eur(pf.services)} pour les prestations de services commerciales, artisanales ou libérales. Les meublés de tourisme non classés ont un plafond à part, ${FR.eur(pf.meubleNonClasse)}. Ces seuils remplacent les anciens montants de ${FR.eur(pf.anciens_vente)} et ${FR.eur(pf.anciens_services)}, encore affichés sur des pages non mises à jour. Le dépassement ne fait pas sortir du régime immédiatement : la micro-entreprise s’applique une année donnée si le chiffre d’affaires de l’une des deux années précédentes est resté sous le seuil. Une seule année au-dessus est donc tolérée ; deux années consécutives entraînent la sortie au 1er janvier suivant. L’année de création, le seuil se calcule au prorata des jours d’activité : une activité de services ouverte le 1er mars 2026 a un plafond de ${FR.eur(exServices)} pour cette première année, d’après l’exemple publié par service-public.`,
    faqs: [
      { q: 'Le plafond de la micro-entreprise est-il apprécié sur le chiffre d’affaires facturé ou encaissé ?', a: `Sur le chiffre d’affaires encaissé de l’année civile, hors taxe, le même que celui que vous déclarez à l’Urssaf. Une facture de décembre réglée en janvier compte pour l’année du paiement. Pour une activité de services, c’est ce total encaissé entre le 1er janvier et le 31 décembre qui se compare à ${FR.eur(pf.services)}, selon service-public (fiche F32353).` },
      { q: 'Que se passe-t-il la deuxième année de dépassement du plafond micro ?', a: `Vous quittez le régime micro-fiscal au 1er janvier suivant et, avec lui, le micro-social : cotisations et impôt se calculent alors sur le bénéfice réel. Avec un chiffre d’affaires de services au-dessus de ${FR.eur(pf.services)} en 2026 puis en 2027, la sortie intervient le 1er janvier 2028, d’après service-public (fiches F32353 et F36232).` },
      { q: 'Faut-il surveiller le plafond dès la première année d’activité ?', a: `Le régime micro s’applique d’office l’année de création et la suivante ; le contrôle commence la troisième année. Mais le chiffre d’affaires de la première année se compare déjà à un seuil proratisé, et il servira à ce contrôle. Exemple officiel : une activité de vente créée le 31 janvier 2026 a un plafond de ${FR.eur(exVente)} pour 2026, selon service-public.` },
      { q: 'Vente et services en même temps : quel plafond s’applique ?', a: `Deux limites à la fois : le chiffre d’affaires total ne doit pas dépasser ${FR.eur(pf.vente)}, et la part de services ne doit pas dépasser ${FR.eur(pf.services)}. Le seuil n’est pas doublé. Avec ${FR.eur(pf.services)} de services, il reste donc ${FR.eur(margeVenteMixte)} de marge pour la vente, d’après service-public. L’abattement fiscal minimal passe alors à ${FR.eur(P.micro.abattement.minimum_mixte)}.` },
      { q: 'Peut-on quitter la micro-entreprise avant d’atteindre le plafond ?', a: `Oui, une option pour un régime réel d’imposition est possible même sous le seuil de ${FR.eur(pf.services)} en services ou de ${FR.eur(pf.vente)} en vente, d’après service-public. Elle se justifie surtout quand les frais réels dépassent l’abattement forfaitaire. Les cotisations sont alors calculées sur le bénéfice, avec des acomptes provisoires régularisés ensuite.` },
    ],
    body: (h) => `
<h2>Les seuils de 2026</h2>
<p>Le plafond ne s’applique pas à vos bénéfices, ni à votre revenu : il porte sur les recettes encaissées dans l’année civile, hors taxe (${h.src('spPlafonds', 'service-public, fiche F32353')}). Il dépend de la nature de l’activité.</p>
${h.table(['Nature de l’activité', 'Plafond 2026', 'Ancien plafond'], [
  ['Vente de marchandises, hébergement', h.eur(pf.vente), h.eur(pf.anciens_vente)],
  ['Prestations de services commerciales ou artisanales (BIC)', h.eur(pf.services), h.eur(pf.anciens_services)],
  ['Activités libérales (BNC), Cipav comprise', h.eur(pf.services), h.eur(pf.anciens_services)],
  ['Meublé de tourisme classé, chambres d’hôtes', h.eur(pf.services), '–'],
  ['Meublé de tourisme non classé', h.eur(pf.meubleNonClasse), '–'],
], 'Plafonds de chiffre d’affaires du régime micro en 2026', ['l', 'r', 'r'])}
<p>Méfiez-vous des simulateurs anciens : un développeur qui croit son plafond à ${h.eur(pf.anciens_services)} se pense hors du régime alors qu’il lui reste ${h.eur(pf.services - pf.anciens_services)} de marge.</p>

<h2>La règle des deux années</h2>
<p>Le régime ne se perd pas au premier euro de trop. Il s’applique une année donnée si le chiffre d’affaires de l’année précédente <strong>ou</strong> celui de l’avant-dernière année n’a pas dépassé le seuil. Concrètement, un dépassement isolé ne change rien ; deux dépassements d’affilée font sortir au 1er janvier qui suit.</p>
<p>Prenons une ergonome qui facture des audits de postes de travail. En 2026, elle encaisse un peu plus de ${h.eur(pf.services)} : rien ne bouge, elle reste micro-entrepreneuse en 2027 parce que son chiffre d’affaires de 2025 était sous le seuil. Si 2027 dépasse aussi le plafond, à seuils inchangés, elle passe au réel le 1er janvier 2028. Si 2027 retombe en dessous, le compteur repart de zéro.</p>
<p>La sortie concerne les deux volets du régime : l’impôt sur le bénéfice réel et, pour les cotisations, le calcul des travailleurs indépendants classiques (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}). Le détail de ce qui change est sur ${h.a('entrepreneur-individuel', 'l’entrepreneur individuel au réel')}.</p>

<h2>La première année : un plafond au prorata</h2>
<p>L’année de création, le seuil se réduit au nombre de jours d’activité : plafond annuel × jours d’activité ÷ 365 (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Service-public donne deux exemples, que le moteur du site retrouve : une activité de vente créée le 31 janvier 2026 a un plafond de ${h.eur(exVente)} pour l’année, une activité de services commencée le 1er mars 2026 un plafond de ${h.eur(exServices)}.</p>
${h.table(['Début d’activité en 2026', 'Jours d’activité', 'Plafond vente', 'Plafond services'], mois.map((m) => [`1er ${nomFR(m)}`, h.num(jours(m)), h.eur(plafondProrata('vente', jours(m))), h.eur(plafondProrata('bnc', jours(m)))]), 'Plafond proratisé de la première année selon la date de début, calculé par le moteur', ['l', 'r', 'r', 'r'])}
<p>Le régime micro reste acquis l’année de création et la suivante quoi qu’il arrive ; la vérification ne commence qu’à la troisième année. Mais le chiffre d’affaires de la première année, comparé à son seuil proratisé, entre dans ce contrôle. Une consultante qui s’installe le 1er septembre 2026 dispose de ${h.num(septJours)} jours d’activité, soit un plafond de ${h.eur(septPlafond)} pour 2026. Si elle signe une grosse mission dès l’automne, ce premier exercice compte déjà comme une année de dépassement.</p>
<p>Le mini-simulateur en haut de page fait ce calcul pour n’importe quel mois de démarrage.</p>

<h2>Activité mixte : deux compteurs, pas un plafond doublé</h2>
<p>Un menuisier qui fabrique et pose des meubles, ou une fleuriste qui vend des bouquets et anime des ateliers, exerce une activité mixte. Deux conditions doivent alors être réunies : le total ne dépasse pas ${h.eur(pf.vente)}, et la part de services ne dépasse pas ${h.eur(pf.services)}. Les deux seuils ne s’additionnent pas. Pour l’impôt, chaque part reçoit son propre abattement, avec un minimum de ${h.eur(P.micro.abattement.minimum_mixte)} au total (${h.src('spMicroImposition', 'service-public, fiche F23267')}).</p>

<h2>Ne pas confondre avec le seuil de TVA</h2>
<p>Le plafond du régime et la franchise de TVA sont deux frontières différentes. En services, la TVA devient due bien avant le plafond : au-delà de ${h.eur(P.tva.services.majore)} de chiffre d’affaires dans l’année, vous facturez la TVA tout en restant micro-entrepreneur. Le calendrier de cette bascule est sur ${h.a('tva-auto-entrepreneur', 'la TVA de l’auto-entrepreneur')}.</p>
<p>Approcher du plafond est aussi le bon moment pour comparer : ${h.a('micro-ou-reel', 'micro ou réel')} montre à partir de quel niveau de frais le réel laisse davantage. Les montants de cette page sont des estimations fondées sur les seuils publiés ; ils ne remplacent pas un conseil personnalisé, et l’administration fiscale reste seule juge de votre régime.</p>`,
  },
  en: {
    slug: 'turnover-ceiling',
    nav: 'Turnover ceiling',
    card: 'The 2026 limits, the first-year pro rata and the two-year rule.',
    title: 'Micro-enterprise turnover ceiling 2026: limits and pro rata',
    description: 'Micro-enterprise turnover ceiling 2026 in France: €203,100 for goods, €83,600 for services, pro-rated in your first year. One year over is still tolerated.',
    h1: 'The turnover ceiling of a French micro-enterprise',
    intro: 'Two numbers to watch, a pro-rated limit in the first year, and one year over the line forgiven.',
    resume: `For 2026 the French micro-enterprise ceiling is ${EN.eur(pf.vente)} of yearly turnover for selling goods and accommodation, and ${EN.eur(pf.services)} for commercial, craft or freelance services. Non-classified furnished holiday lets have their own limit of ${EN.eur(pf.meubleNonClasse)}. These figures replaced the earlier ${EN.eur(pf.anciens_vente)} and ${EN.eur(pf.anciens_services)}, which some outdated websites still quote. Going over does not throw you out at once. The micro scheme applies in a given year if turnover in either of the two previous years stayed below the ceiling, so one year above it is tolerated, while two consecutive years above it end the scheme on the following 1 January. In your first year the ceiling is cut in proportion to the days you actually traded: service-public, the official French administration website, gives the example of a services business starting on 1 March 2026, whose ceiling for that year is ${EN.eur(exServices)}. The limit always refers to money received, before VAT.`,
    faqs: [
      { q: 'Does the French micro ceiling count invoices sent or payments received?', a: `Payments received during the calendar year, before VAT, which is the same figure you declare to the Urssaf. An invoice sent in December and paid in January belongs to the year you are paid. For a services business, that January-to-December total is what gets compared with ${EN.eur(pf.services)}, according to service-public (sheet F32353).` },
      { q: 'What happens if I go over the micro-enterprise ceiling two years running?', a: `You leave the micro tax regime on the following 1 January, and the micro social regime goes with it: contributions and income tax are then based on actual profit. If your services turnover tops ${EN.eur(pf.services)} in 2026 and again in 2027, the switch happens on 1 January 2028, according to service-public (sheets F32353 and F36232).` },
      { q: 'Is the turnover ceiling lower if I start my micro-enterprise mid-year?', a: `Yes. In the year you start, the ceiling is multiplied by the days you trade and divided by 365. The official example: a goods business created on 31 January 2026 has a ceiling of ${EN.eur(exVente)} for 2026. You keep the micro scheme in your first and second years regardless, but that first-year figure counts once checks begin in year three.` },
      { q: 'I sell products and services: which ceiling applies to me?', a: `Both at once. Total turnover must stay under ${EN.eur(pf.vente)}, and the services part under ${EN.eur(pf.services)}. The limits are not added together, so with ${EN.eur(pf.services)} of services you have ${EN.eur(margeVenteMixte)} of room left for sales, according to service-public. For income tax, the minimum flat allowance on a mixed activity becomes ${EN.eur(P.micro.abattement.minimum_mixte)}.` },
      { q: 'Can I move to the real-profit regime while still under the ceiling?', a: `Yes. Service-public confirms you can opt for a real-profit tax regime even below ${EN.eur(pf.services)} for services or ${EN.eur(pf.vente)} for goods. It usually pays when your actual expenses are larger than the flat allowance. Contributions are then based on profit, through provisional instalments that the Urssaf adjusts once your income is known.` },
    ],
    body: (h) => `
<h2>The 2026 limits</h2>
<p>If you come from a country where small-business thresholds are about profit or VAT registration, reset your bearings. The French micro ceiling applies to gross receipts collected in the calendar year, before VAT, not to profit (${h.src('spPlafonds', 'service-public, sheet F32353')}). It depends on what you do.</p>
${h.table(['Type of activity', '2026 ceiling', 'Previous ceiling'], [
  ['Selling goods, accommodation', h.eur(pf.vente), h.eur(pf.anciens_vente)],
  ['Commercial or craft services (BIC)', h.eur(pf.services), h.eur(pf.anciens_services)],
  ['Freelance professions (BNC), Cipav included', h.eur(pf.services), h.eur(pf.anciens_services)],
  ['Classified holiday lets, bed and breakfast', h.eur(pf.services), '–'],
  ['Non-classified holiday lets', h.eur(pf.meubleNonClasse), '–'],
], 'Turnover ceilings of the French micro regime in 2026', ['l', 'r', 'r'])}
<p>BIC means commercial and craft income, BNC non-commercial professional income. An English-speaking developer who relies on an old blog post quoting ${h.eur(pf.anciens_services)} would think he had to leave the scheme when he still has ${h.eur(pf.services - pf.anciens_services)} of headroom.</p>

<h2>The two-year rule</h2>
<p>France gives you one year of grace. The scheme applies in a given year if turnover in the previous year <strong>or</strong> the year before that was within the limit. One isolated overshoot changes nothing; two in a row move you to the real-profit regime on the next 1 January.</p>
<p>Picture a sports coach from Ireland who settled in Lyon. In 2026 she collects slightly more than ${h.eur(pf.services)}. Nothing happens: she stays a micro-entrepreneur in 2027 because her 2025 turnover was below the line. If 2027 is also above the ceiling, assuming the limits are unchanged, she switches regime on 1 January 2028. If 2027 falls back below it, the count starts again.</p>
<p>Because the test uses money received rather than work billed, timing is the one lever you control within the rules. A client who pays on 2 January instead of 30 December moves that sum into the following year’s total. Keep your own running figure of receipts since 1 January rather than waiting for the year-end tax return to find out where you stand.</p>
<p>Leaving covers both halves of the scheme: income tax on real profit and, for contributions, the standard self-employed calculation (${h.src('spCotisationsMicro', 'service-public, sheet F36232')}). What that means in practice is on ${h.a('entrepreneur-individuel', 'the sole trader on real profit')} page.</p>

<h2>Your first year: a pro-rated ceiling</h2>
<p>In the year you start, the limit shrinks to the days you trade: annual ceiling × days of activity ÷ 365 (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). The site’s engine reproduces both official examples: ${h.eur(exVente)} for a goods business created on 31 January 2026 and ${h.eur(exServices)} for a services business starting on 1 March 2026.</p>
${h.table(['Start date in 2026', 'Days trading', 'Goods ceiling', 'Services ceiling'], mois.map((m) => [`1 ${nomEN(m)}`, h.num(jours(m)), h.eur(plafondProrata('vente', jours(m))), h.eur(plafondProrata('bnc', jours(m)))]), 'First-year pro-rated ceiling by start date, computed by the engine', ['l', 'r', 'r', 'r'])}
<p>The micro scheme is guaranteed in your first and second calendar years; checks start in the third. Still, the first year is measured against its reduced ceiling and feeds into that later check. Someone registering on 1 September 2026 has ${h.num(septJours)} days of trading, so a ${h.eur(septPlafond)} ceiling for 2026: one large autumn contract can already make that first year count as an overshoot.</p>
<p>The mini-calculator at the top of the page runs this sum for any starting month.</p>

<h2>Mixed activity: two counters, not a doubled limit</h2>
<p>A carpenter who builds and fits furniture, or a florist who sells bouquets and runs workshops, has a mixed activity. Two conditions apply together: total turnover within ${h.eur(pf.vente)}, and the services share within ${h.eur(pf.services)}. They are never added up. For income tax each part gets its own allowance, with a combined minimum of ${h.eur(P.micro.abattement.minimum_mixte)} (${h.src('spMicroImposition', 'service-public, sheet F23267')}).</p>

<h2>Separate from the VAT threshold</h2>
<p>The ceiling and the VAT exemption are two different borders. For services, VAT kicks in long before the ceiling: above ${h.eur(P.tva.services.majore)} received in a year you add VAT to your invoices while remaining a micro-entrepreneur. The timing is explained on ${h.a('tva-auto-entrepreneur', 'the VAT exemption threshold')} page.</p>
<p>Nearing the ceiling is also a good moment to look at ${h.a('micro-ou-reel', 'micro versus real profit')}. Figures here are estimates based on the published limits, not personal advice; the French tax office decides which regime applies to you.</p>`,
  },
});
