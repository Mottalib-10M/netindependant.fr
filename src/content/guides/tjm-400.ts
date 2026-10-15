import { defineGuide } from '../../lib/guide-types';
import { comparer } from '../../lib/engine/statuts';
import { micro, plafondProrata } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Palier de 400 € : le plafond de la micro tombe dans la plage des jours réalistes (moteur + paramètres 2026).
const TJM = 400;
const FRAIS = 0.08;
const JOURS = [160, 180, 200, 220];
const S = Object.fromEntries(JOURS.map((j) => [j, comparer({ ca: TJM * j, charges: 0, activite: 'bnc', fraisPortage: FRAIS })])) as Record<number, ReturnType<typeof comparer>>;
const ca = (j: number) => TJM * j;
const jPlafond = Math.floor(P.micro.plafonds.services / TJM);
const jTva = Math.floor(P.tva.services.seuil / TJM);
const jTvaMaj = Math.floor(P.tva.services.majore / TJM);
// Année de dépassement toléré : le calcul micro reste possible une fois.
const tolere = micro({ ca: ca(220), activite: 'bnc' });
const depassement = ca(220) - P.micro.plafonds.services;
// Création au 1er mars : 306 jours d'activité, exemple officiel de service-public.
const plafondMars = plafondProrata('bnc', 306);
const jMars = Math.floor(plafondMars / TJM);

export default defineGuide({
  id: 'tjm-400',
  group: 'freelance',
  order: 80,
  mini: 'tjmPalier',
  miniDefaults: { tjm: 400 },
  miniHref: 'tjm-freelance',
  related: ['tjm-300', 'tjm-500', 'tjm-freelance', 'comparateur-statuts', 'plafond-micro-entreprise'],
  sources: ['spPlafonds', 'spFranchiseTva', 'aeEssentiel', 'urssafTauxAC', 'spCotisationsMicro'],
  fr: {
    slug: 'tjm-400',
    nav: 'TJM 400 €',
    card: 'Le plafond de la micro tombe à 209 jours : une année de dépassement est tolérée.',
    title: 'TJM 400 € en 2026 : plafond micro à 209 jours, et après',
    description: 'TJM 400 € en 2026 : le plafond de 83 600 € de la micro-entreprise tombe au 210e jour facturé. Une année de dépassement est tolérée, pas deux. Net par statut.',
    h1: 'TJM de 400 € : le plafond de la micro à portée de calendrier',
    intro: 'À ce taux, le plafond de la micro-entreprise se joue à quelques jours près, et une seule année de dépassement passe sans sortie du régime.',
    resume: `Avec un TJM de ${FR.eur(TJM)}, le plafond de ${FR.eur(P.micro.plafonds.services)} de la micro-entreprise de services est atteint au bout de ${FR.num(jPlafond)} jours facturés : le ${FR.num(jPlafond + 1)}e le fait dépasser. Jusqu’à ${FR.num(200)} jours, la micro-entreprise libérale reste le cadre qui laisse le plus, ${FR.eur(S[200].micro.netMensuel)} par mois contre ${FR.eur(S[200].eurl.netMensuel)} en EURL, pour une personne seule sans frais ni autre revenu. À ${FR.num(220)} jours, le chiffre d’affaires atteint ${FR.eur(ca(220))}. La règle de service-public tolère un dépassement isolé : le régime s’applique encore l’année suivante si l’une des deux années précédentes est restée sous le seuil. Cette année-là, la micro laisse ${FR.eur(tolere.netMensuel)} par mois. Deux années de suite au-dessus, et la sortie intervient au 1er janvier suivant ; l’EURL, la meilleure option du moteur à ce niveau, laisse alors ${FR.eur(S[220].eurl.netMensuel)}. La franchise de TVA, elle, est perdue dès le ${FR.num(jTva + 1)}e jour. Ces montants sont des estimations, pas un avis personnalisé.`,
    faqs: [
      { q: 'Que se passe-t-il si je facture 220 jours à 400 € ?', a: `Votre chiffre d’affaires atteint ${FR.eur(ca(220))}, soit ${FR.eur(depassement)} au-dessus du plafond de ${FR.eur(P.micro.plafonds.services)}. Si l’année précédente était sous le seuil, rien ne change tout de suite : vous restez en micro, avec un net estimé à ${FR.eur(tolere.netMensuel)} par mois. Le dépassement compte comme le premier ; un second consécutif ferait sortir du régime, selon la fiche F32353 de service-public.` },
      { q: 'À 400 € par jour, peut-on dépasser le plafond deux années de suite ?', a: `Non sans changer de régime. Le régime micro s’applique une année si le chiffre d’affaires de l’une des deux années précédentes n’a pas dépassé ${FR.eur(P.micro.plafonds.services)}. Deux années à plus de ${FR.num(jPlafond)} jours font basculer au réel le 1er janvier suivant, sur le plan fiscal et, d’après service-public, aussi pour les cotisations, qui suivent alors le barème des indépendants.` },
      { q: 'Avec un TJM de 400 €, quand la franchise de TVA s’arrête-t-elle ?', a: `Après ${FR.num(jTva)} jours facturés dans l’année, le seuil de ${FR.eur(P.tva.services.seuil)} est franchi : la TVA s’applique au 1er janvier suivant. Le ${FR.num(jTvaMaj + 1)}e jour fait passer le seuil majoré de ${FR.eur(P.tva.services.majore)}, et la TVA est due dès ce jour. À ${FR.eur(TJM)}, un freelance à plein temps est donc presque toujours redevable, selon la fiche F21746 de service-public.` },
      { q: 'Quel statut après la micro pour un TJM de 400 € ?', a: `Sur ${FR.num(220)} jours, le moteur place l’EURL devant, avec ${FR.eur(S[220].eurl.netMensuel)} par mois, puis la SASU à ${FR.eur(S[220].sasu.netMensuel)} et l’entreprise individuelle au réel à ${FR.eur(S[220].ei.netMensuel)}. Les écarts restent faibles, moins de ${FR.eur(S[220].eurl.netMensuel - S[220].ei.netMensuel + 1)} par mois : la protection sociale, le coût comptable et vos frais réels pèsent autant que ce calcul, fait sans frais pour une personne seule.` },
      { q: 'Que rapporte le portage salarial à 400 € par jour ?', a: `Sur ${FR.num(200)} jours, ${FR.eur(S[200].portage.netMensuel)} par mois après impôt, avec des frais de gestion supposés à ${FR.pct(FRAIS, 0)}, qui n’ont aucun barème officiel. C’est ${FR.eur(S[200].micro.netMensuel - S[200].portage.netMensuel)} de moins que la micro. Le portage n’a pas de plafond de chiffre d’affaires et ouvre des droits au chômage, ce qui peut compter si vous dépassez ${FR.num(jPlafond)} jours chaque année.` },
    ],
    body: (h) => `
<h2>${h.num(jPlafond)} jours : là où le plafond de la micro se referme</h2>
<p>À ${h.eur(TJM)} par jour, le plafond n’est plus une abstraction. ${h.num(jPlafond)} jours facturés font exactement ${h.eur(P.micro.plafonds.services)}, la limite des prestations de services en 2026 (${h.src('spPlafonds', 'service-public, fiche F32353')}) ; le jour suivant la dépasse. Or ${h.num(jPlafond)} jours, c’est un volume qu’un freelance en mission longue atteint sans forcer, alors qu’à ${h.a('tjm-300', '300 €')} il restait hors de portée. Le régime prévoit une soupape : une année de dépassement ne fait pas sortir. Il faut que le chiffre d’affaires de l’année précédente ou de celle d’avant soit resté sous le seuil pour que la micro s’applique. Concrètement, une grosse année isolée passe ; deux grosses années de suite font basculer au réel au 1er janvier suivant. L’enjeu n’est donc pas de savoir si vous dépasserez une fois, mais si ce rythme va durer. Une mission reconduite d’année en année, à plein temps, pousse vers une société avant la deuxième année ; une pointe ponctuelle se gère en restant micro.</p>

<h2>Le net jour par jour, année tolérée comprise</h2>
${h.table(['Jours facturés', 'Chiffre d’affaires', 'Micro libérale', 'EI au réel', 'EURL à l’IS', 'SASU', 'Portage'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), S[j].micro.possible ? h.eur(S[j].micro.netMensuel) : `${h.eur(tolere.netMensuel)} (année tolérée)`, h.eur(S[j].ei.netMensuel), h.eur(S[j].eurl.netMensuel), h.eur(S[j].sasu.netMensuel), h.eur(S[j].portage.netMensuel)]), `Net mensuel estimé à ${h.eur(TJM)} par jour, après cotisations et impôt, personne seule, sans frais ; portage avec ${h.pct(FRAIS, 0)} de frais de gestion`, ['r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Jusqu’à ${h.num(200)} jours, la micro garde l’avantage, de ${h.eur(S[200].micro.netMensuel - S[200].eurl.netMensuel)} par mois sur l’EURL. La ligne de ${h.num(220)} jours montre la micro dans son année de tolérance : ${h.eur(tolere.netMensuel)}, encore au-dessus de toute autre option. C’est l’année suivante qui coûte, si le rythme se maintient : il faut alors comparer avec la colonne EURL, la mieux placée dans le ${h.a('comparateur-statuts', 'comparateur de statuts')}.</p>

<h2>Ce qui compte vraiment dans le calcul du plafond</h2>
<p>Le plafond porte sur le chiffre d’affaires encaissé dans l’année civile, hors taxe. Une facture de décembre réglée en janvier compte pour l’année de l’encaissement. Pour un TJM de ${h.eur(TJM)}, quelques jours facturés en fin d’année et payés en janvier peuvent faire la différence entre ${h.num(jPlafond)} et ${h.num(jPlafond + 5)} jours comptés. L’année de création, le plafond est proratisé : une activité commencée le 1er mars dispose de ${h.eur(plafondMars)}, soit ${h.num(jMars)} jours à ce tarif (${h.src('aeEssentiel', 'Urssaf')}). La page ${h.a('plafond-micro-entreprise', 'plafond de la micro-entreprise')} détaille les cas mixtes.</p>

<h2>Préparer la sortie avant la deuxième année</h2>
<p>Si deux années pleines s’annoncent, la sortie de la micro n’est pas une sanction mais un changement de calcul. Au réel, en entreprise individuelle, les cotisations suivent le barème 2026 des indépendants (${h.src('urssafTauxAC', 'Urssaf')}) et se régularisent l’année suivante, contrairement à la micro où elles sont définitives (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}). Sur ${h.num(220)} jours, l’EURL arrive devant avec ${h.eur(S[220].eurl.netMensuel)}, la SASU suit à ${h.eur(S[220].sasu.netMensuel)}. La TVA, elle, s’applique déjà depuis longtemps : à ce TJM, le seuil de ${h.eur(P.tva.services.seuil)} est franchi au ${h.num(jTva + 1)}e jour (${h.src('spFranchiseTva', 'service-public, fiche F21746')}).</p>
<p>Au palier suivant, ${h.a('tjm-500', 'un TJM de 500 €')}, la micro ne passe plus une année pleine. Le ${h.a('tjm-freelance', 'simulateur TJM')} permet de tester votre propre nombre de jours. Ces montants sont des estimations : l’Urssaf et l’administration fiscale arrêtent les chiffres définitifs.</p>`,
  },
  en: {
    slug: 'day-rate-400',
    nav: 'Day rate €400',
    card: 'The micro ceiling hits at 209 days: one year above it is tolerated.',
    title: 'Day rate €400 in 2026: micro ceiling at 209 days, then what',
    description: 'Day rate €400 in 2026: the €83,600 micro-enterprise ceiling is crossed on day 210. One year above it is tolerated, two in a row are not. Take-home by form.',
    h1: 'A €400 day rate: the micro ceiling comes within reach',
    intro: 'At this rate the micro-enterprise ceiling is a matter of a few days, and one year above it passes without leaving the scheme.',
    resume: `On a ${EN.eur(TJM)} day rate, the ${EN.eur(P.micro.plafonds.services)} turnover ceiling of a micro-enterprise (France’s simplified self-employed scheme) for services is reached after ${EN.num(jPlafond)} billed days, and day ${EN.num(jPlafond + 1)} takes you over. Up to ${EN.num(200)} days, the micro-enterprise still leaves the most: ${EN.eur(S[200].micro.netMensuel)} a month against ${EN.eur(S[200].eurl.netMensuel)} in an EURL (single-member limited company), for a single person with no expenses or other income. At ${EN.num(220)} days turnover reaches ${EN.eur(ca(220))}. French rules tolerate an isolated overshoot: the scheme still applies in a year if either of the two previous years stayed under the ceiling. That year, micro leaves ${EN.eur(tolere.netMensuel)} a month. Two years running above it and you leave on the following 1 January; the EURL, the engine’s best option at that level, then leaves ${EN.eur(S[220].eurl.netMensuel)}. The VAT exemption is gone much earlier, on day ${EN.num(jTva + 1)}. These figures are estimates, not personal advice.`,
    faqs: [
      { q: 'What happens if I bill 220 days at €400?', a: `Your turnover reaches ${EN.eur(ca(220))}, ${EN.eur(depassement)} over the ${EN.eur(P.micro.plafonds.services)} ceiling. If the previous year was under it, nothing changes yet: you remain a micro-entrepreneur, with an estimated ${EN.eur(tolere.netMensuel)} a month. This counts as the first overshoot; a second one in a row would take you out of the scheme, per service-public sheet F32353.` },
      { q: 'Can I stay above the ceiling two years running at €400 a day?', a: `Not without changing regime. The micro scheme applies in a given year only if turnover in one of the two previous years stayed at or under ${EN.eur(P.micro.plafonds.services)}. Two years above ${EN.num(jPlafond)} days move you to the real-profit regime on the following 1 January, for tax and, per service-public, for contributions too, which then follow the standard self-employed scale.` },
      { q: 'At a €400 day rate, when does the VAT exemption end?', a: `After ${EN.num(jTva)} billed days in a year you pass ${EN.eur(P.tva.services.seuil)}, and VAT applies from the next 1 January. Day ${EN.num(jTvaMaj + 1)} takes you over the higher ${EN.eur(P.tva.services.majore)} threshold, and VAT is due from that day. At ${EN.eur(TJM)}, a full-time freelancer is therefore nearly always VAT-registered, per service-public sheet F21746.` },
      { q: 'Which legal form after micro on a €400 day rate?', a: `On ${EN.num(220)} days the engine puts the EURL first at ${EN.eur(S[220].eurl.netMensuel)} a month, then the SASU (single-shareholder simplified company) at ${EN.eur(S[220].sasu.netMensuel)} and the sole trader on real profit (EI) at ${EN.eur(S[220].ei.netMensuel)}. Gaps are small, under ${EN.eur(S[220].eurl.netMensuel - S[220].ei.netMensuel + 1)} a month, so social cover, accounting costs and your real expenses matter as much as this estimate.` },
      { q: 'What does umbrella employment pay at €400 a day?', a: `On ${EN.num(200)} days, ${EN.eur(S[200].portage.netMensuel)} a month after tax, with a management fee assumed at ${EN.pct(FRAIS, 0)}, for which there is no official scale. That is ${EN.eur(S[200].micro.netMensuel - S[200].portage.netMensuel)} less than micro. Umbrella employment (portage salarial) has no turnover ceiling and gives French unemployment rights, which can matter if you bill over ${EN.num(jPlafond)} days every year.` },
    ],
    body: (h) => `
<h2>${h.num(jPlafond)} days: where the micro ceiling closes</h2>
<p>At ${h.eur(TJM)} a day, the ceiling stops being theoretical. ${h.num(jPlafond)} billed days come to exactly ${h.eur(P.micro.plafonds.services)}, the 2026 limit for services (${h.src('spPlafonds', 'service-public, sheet F32353')}); the next day takes you over. ${h.num(jPlafond)} days is a volume a freelancer on a long assignment reaches without trying, whereas at ${h.a('tjm-300', '€300')} it stayed out of reach. The scheme has a safety valve: one year above does not push you out. Micro applies as long as turnover in the previous year, or the year before, stayed under the ceiling. In practice, one big isolated year passes; two big years in a row move you to the real-profit regime (régime réel, where tax and contributions are based on actual profit) on the next 1 January. The question is not whether you will cross once, but whether that pace will last. A full-time contract renewed year after year points to a company before the second year; a one-off peak is handled by staying micro.</p>

<h2>Take-home by days billed, tolerated year included</h2>
${h.table(['Days billed', 'Turnover', 'Micro (BNC)', 'EI, real profit', 'EURL, corporate tax', 'SASU', 'Umbrella'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), S[j].micro.possible ? h.eur(S[j].micro.netMensuel) : `${h.eur(tolere.netMensuel)} (tolerated year)`, h.eur(S[j].ei.netMensuel), h.eur(S[j].eurl.netMensuel), h.eur(S[j].sasu.netMensuel), h.eur(S[j].portage.netMensuel)]), `Estimated monthly take-home at ${h.eur(TJM)} a day, after contributions and income tax, single, no expenses; umbrella with a ${h.pct(FRAIS, 0)} fee`, ['r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Up to ${h.num(200)} days, micro keeps its lead, ${h.eur(S[200].micro.netMensuel - S[200].eurl.netMensuel)} a month over the EURL. The ${h.num(220)}-day row shows micro in its tolerated year: ${h.eur(tolere.netMensuel)}, still above every other option. The cost comes the year after, if the pace holds: then compare with the EURL column, the best placed in the ${h.a('comparateur-statuts', 'legal form comparison')}.</p>

<h2>What actually counts towards the ceiling</h2>
<p>The ceiling applies to turnover received in the calendar year, before VAT. A December invoice paid in January counts in the year you are paid. On ${h.eur(TJM)} a day, a few days billed in late December and settled in January can make the difference between ${h.num(jPlafond)} and ${h.num(jPlafond + 5)} days counted. In your first year the ceiling is prorated: a business started on 1 March has ${h.eur(plafondMars)}, or ${h.num(jMars)} days at this rate (${h.src('aeEssentiel', 'Urssaf')}). The ${h.a('plafond-micro-entreprise', 'turnover ceiling')} page covers mixed activities.</p>

<h2>Preparing the exit before year two</h2>
<p>If two full years are coming, leaving micro is not a penalty but a change of method. As a sole trader on real profit, contributions follow the 2026 self-employed scale (${h.src('urssafTauxAC', 'Urssaf')}) and are adjusted the following year, unlike micro contributions, which are final (${h.src('spCotisationsMicro', 'service-public, sheet F36232')}). On ${h.num(220)} days the EURL comes first at ${h.eur(S[220].eurl.netMensuel)}, with the SASU at ${h.eur(S[220].sasu.netMensuel)}. VAT has applied for a while by then: at this rate, the ${h.eur(P.tva.services.seuil)} threshold goes on day ${h.num(jTva + 1)} (${h.src('spFranchiseTva', 'service-public, sheet F21746')}).</p>
<p>At the next level, ${h.a('tjm-500', 'a €500 day rate')}, micro no longer lasts a full year. The ${h.a('tjm-freelance', 'day rate calculator')} tests your own number of days. These are estimates: the Urssaf and the tax office set the final figures.</p>`,
  },
});
