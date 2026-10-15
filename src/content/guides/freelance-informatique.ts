import { defineGuide } from '../../lib/guide-types';
import { micro, plafondProrata } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main). TJM et jours sont des exemples de calcul,
// pas des données de marché. BNC ou BIC dépend de l'activité déclarée : les deux sont présentés.
const missions = [[350, 180], [400, 200], [550, 190]].map(([tjm, j]) => {
  const ca = tjm * j;
  return { tjm, j, ca, bnc: micro({ ca, activite: 'bnc' }), bic: micro({ ca, activite: 'bic' }) };
});
const [m350, m400, m550] = missions;
const paliersTjm = [300, 400, 500, 600].map((tjm) => ({ tjm, tva: Math.floor(P.tva.services.seuil / tjm), plafond: Math.floor(P.micro.plafonds.services / tjm) }));
const jours450 = Math.floor(P.micro.plafonds.services / 450);
const tva450 = Math.floor(P.tva.services.seuil / 450);
// Création le 1er mars 2026 : 306 jours d'activité dans l'année.
const joursMars = 306;
const plafondMars = plafondProrata('bnc', joursMars);
const joursMars450 = Math.floor(plafondMars / 450);
const vl400bnc = micro({ ca: m400.ca, activite: 'bnc', vl: true });
const vl400bic = micro({ ca: m400.ca, activite: 'bic', vl: true });
const ecartCotis400 = m400.bnc.cotisations + m400.bnc.cfp - (m400.bic.cotisations + m400.bic.cfp + m400.bic.tfc);

export default defineGuide({
  id: 'freelance-informatique',
  group: 'freelance',
  order: 50,
  mini: 'tjmJours',
  miniHref: 'tjm-freelance',
  related: ['statut-freelance', 'tjm-freelance', 'auto-entrepreneur-liberal', 'tva-auto-entrepreneur', 'plafond-micro-entreprise', 'tjm-500'],
  sources: ['aeEssentiel', 'spCotisationsMicro', 'spMicroImposition', 'spPlafonds', 'spFranchiseTva', 'impotsVL'],
  fr: {
    slug: 'developpeur-freelance',
    nav: 'Développeur freelance',
    card: 'BNC ou BIC, TJM, jours facturés, TVA et plafond : les règles du développeur indépendant.',
    title: 'Développeur freelance 2026 : statut, BNC ou BIC et TJM',
    description: 'Développeur freelance 2026 : micro-entreprise en BNC à 25,6 % ou en BIC à 21,2 %, TJM converti en net, jours avant la TVA et avant le plafond de 83 600 €.',
    h1: 'Développeur freelance : statut, cotisations et TJM',
    intro: 'Code, intégration, conseil technique : la règle qui s’applique dépend de l’activité déclarée, et le TJM décide du reste.',
    resume: `Un développeur qui se met à son compte commence le plus souvent en micro-entreprise. Son taux de cotisations dépend de la catégorie sous laquelle son activité est déclarée : ${FR.pct(P.micro.taux.bnc)} du chiffre d’affaires s’il relève des professions libérales non réglementées (BNC), ${FR.pct(P.micro.taux.bic)} s’il exerce une prestation de services commerciale (BIC). L’abattement pour l’impôt suit la même logique : ${FR.pct(P.micro.abattement.bnc, 0)} en BNC, ${FR.pct(P.micro.abattement.bic, 0)} en BIC. Ce site ne tranche pas cette question de classement, qui relève de l’inscription. Dans les deux cas, le plafond de la micro-entreprise est de ${FR.eur(P.micro.plafonds.services)} et la franchise de TVA s’arrête au-delà de ${FR.eur(P.tva.services.seuil)}. À ${FR.eur(400)} par jour sur ${FR.num(200)} jours, soit ${FR.eur(m400.ca)}, un développeur seul garde ${FR.eur(m400.bnc.netMensuel)} par mois après impôt en BNC et ${FR.eur(m400.bic.netMensuel)} en BIC, selon notre moteur. À ${FR.eur(450)} par jour, il atteint le seuil de TVA au bout de ${FR.num(tva450)} jours facturés et le plafond au bout de ${FR.num(jours450)}. Au-delà, une société ou le régime réel prend le relais.`,
    faqs: [
      { q: 'Un développeur freelance relève-t-il du BNC ou du BIC ?', a: `Cela dépend de l’activité déclarée lors de l’immatriculation, pas du titre de développeur. En micro-entreprise, le classement libéral (BNC) entraîne ${FR.pct(P.micro.taux.bnc)} de cotisations et un abattement fiscal de ${FR.pct(P.micro.abattement.bnc, 0)} ; le classement en prestation commerciale (BIC), ${FR.pct(P.micro.taux.bic)} et ${FR.pct(P.micro.abattement.bic, 0)}. En cas de doute, interrogez l’Urssaf avant de déclarer l’activité.` },
      { q: 'Combien de jours un développeur à 450 € par jour peut-il facturer en micro ?', a: `${FR.num(jours450)} jours dans l’année avant d’atteindre le plafond de ${FR.eur(P.micro.plafonds.services)}, en BNC comme en BIC. Un dépassement isolé est toléré ; deux années consécutives au-dessus font sortir du régime micro au 1er janvier suivant, selon service-public. La TVA arrive bien plus tôt : au-delà de ${FR.num(tva450)} jours, soit ${FR.eur(P.tva.services.seuil)}.` },
      { q: 'Un développeur freelance doit-il facturer la TVA dès sa première mission ?', a: `Non, tant qu’il bénéficie de la franchise en base : ses factures portent alors la mention « TVA non applicable, art. 293 B du CGI ». Pour des prestations de services, la franchise vaut jusqu’à ${FR.eur(P.tva.services.seuil)} sur l’année précédente ; si ${FR.eur(P.tva.services.majore)} sont dépassés en cours d’année, la TVA s’applique dès ce jour. À ${FR.eur(350)} par jour, cela représente ${FR.num(Math.floor(P.tva.services.seuil / 350))} jours.` },
      { q: 'Le versement libératoire convient-il à un développeur indépendant ?', a: `Il ajoute ${FR.pct(P.micro.vl.bnc)} du chiffre d’affaires en BNC, ${FR.pct(P.micro.vl.bic)} en BIC, à la place de l’impôt au barème. Il n’est ouvert que si le revenu fiscal de référence de 2024 ne dépasse pas ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part pour 2026. Sur ${FR.eur(m400.ca)} en BNC, il coûte ${FR.eur(vl400bnc.vl)} ; comparez avec l’impôt au barème de votre foyer avant d’opter.` },
      { q: 'Quel plafond micro pour un développeur qui démarre en cours d’année ?', a: `La première année, le plafond est proratisé selon le nombre de jours d’activité. Pour un début le 1er mars 2026, il tombe à ${FR.eur(plafondMars)} au lieu de ${FR.eur(P.micro.plafonds.services)}, d’après service-public. À ${FR.eur(450)} par jour, cela représente ${FR.num(joursMars450)} jours facturables sur les dix mois restants avant de dépasser.` },
    ],
    body: (h) => `
<h2>BNC ou BIC : deux jeux de règles pour le même métier</h2>
<p>Le droit ne connaît pas de statut propre au développeur. En micro-entreprise, tout dépend de la catégorie retenue lors de la déclaration d’activité : profession libérale non réglementée, imposée dans la catégorie des bénéfices non commerciaux (BNC), ou prestation de services commerciale, dans celle des bénéfices industriels et commerciaux (BIC). Ce site ne décide pas à votre place lequel s’applique ; il calcule les deux. Les taux viennent de l’${h.src('aeEssentiel', 'Urssaf')} et de ${h.src('spCotisationsMicro', 'service-public')}.</p>
${h.table(['Règle 2026', 'Activité libérale (BNC)', 'Prestation commerciale (BIC)'], [
  ['Cotisations sociales', h.pct(P.micro.taux.bnc), h.pct(P.micro.taux.bic)],
  ['Formation professionnelle', h.pct(P.micro.cfp.liberal), h.pct(P.micro.cfp.commercant)],
  ['Taxe pour frais de chambre', '–', h.pct(P.micro.tfc.commerce_service, 3)],
  ['Abattement pour l’impôt', h.pct(P.micro.abattement.bnc, 0), h.pct(P.micro.abattement.bic, 0)],
  ['Versement libératoire', h.pct(P.micro.vl.bnc), h.pct(P.micro.vl.bic)],
  ['Plafond de chiffre d’affaires', h.eur(P.micro.plafonds.services), h.eur(P.micro.plafonds.services)],
  ['Franchise de TVA', h.eur(P.tva.services.seuil), h.eur(P.tva.services.seuil)],
], 'Micro-entreprise : ce qui change selon le classement de l’activité de développement', ['l', 'r', 'r'])}
<p>Le classement libéral coûte plus cher en cotisations, et son abattement fiscal est plus faible. Sur ${h.eur(m400.ca)} de chiffre d’affaires, l’écart de prélèvements sociaux atteint ${h.eur(ecartCotis400)} par an au détriment du BNC. Les plafonds et seuils de TVA, eux, sont identiques : ce sont ceux des prestations de services. Le détail du régime libéral figure sur ${h.a('auto-entrepreneur-liberal', 'auto-entrepreneur en profession libérale')}.</p>

<h2>Le TJM converti en revenu, trois missions de calcul</h2>
<p>Les taux journaliers et les nombres de jours ci-dessous sont des hypothèses de calcul, pas des prix constatés. Le moteur en tire le chiffre d’affaires annuel, puis le net mensuel après cotisations et impôt sur le revenu pour une personne seule, sans versement libératoire ni autre revenu.</p>
${h.table(['Hypothèse', 'Chiffre d’affaires', 'Net mensuel en BNC', 'Net mensuel en BIC'], missions.map((x) => [`${h.eur(x.tjm)} × ${h.num(x.j)} jours`, h.eur(x.ca), x.bnc.depassePlafond ? 'plafond dépassé' : h.eur(x.bnc.netMensuel), x.bic.depassePlafond ? 'plafond dépassé' : h.eur(x.bic.netMensuel)]), 'Développeur en micro-entreprise en 2026 : net après cotisations et impôt, personne seule', ['l', 'r', 'r', 'r'])}
<p>À ${h.eur(350)} sur ${h.num(180)} jours, la différence entre les deux classements atteint ${h.eur(m350.bic.netMensuel - m350.bnc.netMensuel)} par mois. La troisième hypothèse, ${h.eur(m550.ca)}, dépasse le plafond : une année passe, deux années de suite imposent de changer de cadre.</p>
<p>Pourquoi le BIC laisse-t-il plus ? Deux effets s’additionnent : des cotisations plus basses, et un abattement plus large qui réduit le revenu soumis au barème. Sur ${h.eur(m400.ca)}, l’impôt d’une personne seule atteint ${h.eur(m400.bnc.ir)} en BNC contre ${h.eur(m400.bic.ir)} en BIC. Aucun de ces montants ne permet de choisir son classement : c’est l’activité réellement exercée qui le fixe.</p>

<h2>Combien de jours avant la TVA et avant le plafond</h2>
<p>Pour un développeur, les deux seuils arrivent vite. Celui de la ${h.src('spFranchiseTva', 'franchise de TVA')} se franchit bien avant le ${h.src('spPlafonds', 'plafond de la micro-entreprise')}, si bien qu’une activité à temps plein facture presque toujours la TVA.</p>
${h.table(['TJM hors taxe', 'Jours avant le seuil de TVA', 'Jours avant le plafond micro'], paliersTjm.map((x) => [h.eur(x.tjm), h.num(x.tva), h.num(x.plafond)]), `Nombre de jours facturables avant ${h.eur(P.tva.services.seuil)} et ${h.eur(P.micro.plafonds.services)} de chiffre d’affaires annuel`, ['r', 'r', 'r'])}
<p>Passer la TVA ne fait pas quitter la micro-entreprise : on reste micro-entrepreneur, mais on ajoute la TVA à ses factures, on obtient un numéro de TVA intracommunautaire et on déclare la TVA collectée et déductible. Les détails sont sur ${h.a('tva-auto-entrepreneur', 'la TVA de l’auto-entrepreneur')}.</p>
<h3>L’année de création</h3>
<p>Le plafond se calcule au prorata des jours d’activité la première année. Un développeur qui démarre le 1er mars 2026 dispose de ${h.eur(plafondMars)} au lieu de ${h.eur(P.micro.plafonds.services)}, soit ${h.num(joursMars450)} jours à ${h.eur(450)}. Le régime micro reste acquis l’année de création et la suivante ; la vérification commence ensuite (${h.a('plafond-micro-entreprise', 'plafond de la micro-entreprise')}).</p>

<h2>L’impôt : barème ou versement libératoire</h2>
<p>Par défaut, le chiffre d’affaires diminué de l’abattement s’ajoute aux autres revenus du foyer et suit le barème. L’option pour le ${h.src('impotsVL', 'versement libératoire')} remplace ce calcul par un pourcentage payé avec les cotisations : sur ${h.eur(m400.ca)}, ${h.eur(vl400bnc.vl)} en BNC, ${h.eur(vl400bic.vl)} en BIC. Elle suppose un revenu fiscal de référence modeste, au plus ${h.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part pour 2026 (${h.src('spMicroImposition', 'service-public, fiche F23267')}). Pour un développeur seul sans autre revenu, notre moteur donne un impôt au barème de ${h.eur(m400.bnc.ir)} en BNC sur ce même chiffre d’affaires.</p>

<h2>Quand la micro-entreprise ne suffit plus</h2>
<p>Au-delà du plafond, ou quand les frais (matériel, logiciels, déplacements) pèsent lourd, d’autres cadres deviennent intéressants : entreprise individuelle au réel, EURL, SASU ou portage salarial. Le ${h.a('statut-freelance', 'guide du statut freelance')} les compare sur trois profils, le ${h.a('tjm-freelance', 'simulateur de TJM')} part directement de votre taux journalier, et la page ${h.a('tjm-500', 'TJM de 500 €')} détaille un palier précis.</p>
<p>Ces calculs sont des estimations construites sur les règles 2026 publiées. Ils ne remplacent ni la décision de l’Urssaf sur votre classement, ni celle de l’administration fiscale sur votre impôt, ni un conseil adapté à votre situation.</p>`,
  },
  en: {
    slug: 'freelance-developer',
    nav: 'Freelance developer',
    card: 'BNC or BIC, day rate, billed days, VAT and the ceiling: the rules for self-employed developers.',
    title: 'Freelance developer France 2026: BNC or BIC, day rate',
    description: 'Freelance developer in France 2026: micro-enterprise at 25.6% (BNC) or 21.2% (BIC), day rate into take-home, days before VAT and the €83,600 turnover ceiling.',
    h1: 'Freelance developer in France: status, contributions and day rate',
    intro: 'Coding, integration, technical consulting: the rules depend on how your activity is registered, and your day rate does the rest.',
    resume: `Most developers who go freelance in France start as micro-entrepreneurs (auto-entrepreneurs), the simplified scheme where contributions are a share of turnover. The rate depends on how the activity is classified when you register: ${EN.pct(P.micro.taux.bnc)} of turnover as an unregulated liberal profession, taxed as BNC (bénéfices non commerciaux, non-commercial profits), or ${EN.pct(P.micro.taux.bic)} as a commercial service, taxed as BIC (bénéfices industriels et commerciaux). The flat allowance used for income tax follows suit: ${EN.pct(P.micro.abattement.bnc, 0)} for BNC, ${EN.pct(P.micro.abattement.bic, 0)} for BIC. This site does not decide which applies to you; registration does. Either way, the micro ceiling is ${EN.eur(P.micro.plafonds.services)} and the VAT exemption ends above ${EN.eur(P.tva.services.seuil)}. At ${EN.eur(400)} a day for ${EN.num(200)} days, ${EN.eur(m400.ca)}, a single developer keeps ${EN.eur(m400.bnc.netMensuel)} a month after income tax under BNC and ${EN.eur(m400.bic.netMensuel)} under BIC, according to our engine. At ${EN.eur(450)} a day, the VAT threshold comes after ${EN.num(tva450)} billed days and the ceiling after ${EN.num(jours450)}.`,
    faqs: [
      { q: 'Is a freelance developer in France taxed as BNC or BIC?', a: `It depends on the activity declared at registration, not on the job title. Under the micro scheme, a liberal-profession classification (BNC) means ${EN.pct(P.micro.taux.bnc)} contributions and a ${EN.pct(P.micro.abattement.bnc, 0)} tax allowance; a commercial-service classification (BIC) means ${EN.pct(P.micro.taux.bic)} and ${EN.pct(P.micro.abattement.bic, 0)}. If unsure, ask the Urssaf before you declare the activity.` },
      { q: 'How many days can a developer bill at €450 a day as a micro-entrepreneur?', a: `${EN.num(jours450)} days in the year before reaching the ${EN.eur(P.micro.plafonds.services)} ceiling, under BNC or BIC alike. One year over is tolerated; two consecutive years over take you out of the micro scheme from the following 1 January, according to service-public. VAT arrives much sooner, after ${EN.num(tva450)} days, at ${EN.eur(P.tva.services.seuil)}.` },
      { q: 'Does a freelance developer charge VAT from the very first contract?', a: `No, not while the franchise en base, France’s small-business VAT exemption, applies; invoices then carry the line “TVA non applicable, art. 293 B du CGI”. For services the exemption holds up to ${EN.eur(P.tva.services.seuil)} in the previous year; pass ${EN.eur(P.tva.services.majore)} during the year and VAT applies from that day. At ${EN.eur(350)} a day that is ${EN.num(Math.floor(P.tva.services.seuil / 350))} days.` },
      { q: 'Is the flat-rate income tax option worth it for a self-employed developer?', a: `The versement libératoire adds ${EN.pct(P.micro.vl.bnc)} of turnover under BNC, ${EN.pct(P.micro.vl.bic)} under BIC, instead of income tax on the scale. It is only open if your 2024 reference taxable income was no more than ${EN.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per household share for 2026. On ${EN.eur(m400.ca)} under BNC it costs ${EN.eur(vl400bnc.vl)}; compare with your household’s scale tax first.` },
      { q: 'What is the micro ceiling for a developer starting mid-year?', a: `In the first year the ceiling is prorated by days of activity. Starting on 1 March 2026, it falls to ${EN.eur(plafondMars)} instead of ${EN.eur(P.micro.plafonds.services)}, according to service-public. At ${EN.eur(450)} a day, that leaves room for ${EN.num(joursMars450)} billed days over the remaining ten months before you go over.` },
    ],
    body: (h) => `
<h2>BNC or BIC: two rulebooks for one job</h2>
<p>French law has no special status for developers. Under the micro scheme everything follows from the category chosen when you declare your activity: an unregulated liberal profession, taxed as non-commercial profits (BNC), or a commercial service, taxed as industrial and commercial profits (BIC). This site does not choose for you; it works out both. Rates come from the ${h.src('aeEssentiel', 'Urssaf')}, the body that collects social contributions, and from ${h.src('spCotisationsMicro', 'service-public')}.</p>
${h.table(['2026 rule', 'Liberal activity (BNC)', 'Commercial service (BIC)'], [
  ['Social contributions', h.pct(P.micro.taux.bnc), h.pct(P.micro.taux.bic)],
  ['Training levy', h.pct(P.micro.cfp.liberal), h.pct(P.micro.cfp.commercant)],
  ['Chamber of commerce levy', '–', h.pct(P.micro.tfc.commerce_service, 3)],
  ['Income tax allowance', h.pct(P.micro.abattement.bnc, 0), h.pct(P.micro.abattement.bic, 0)],
  ['Flat-rate income tax option', h.pct(P.micro.vl.bnc), h.pct(P.micro.vl.bic)],
  ['Turnover ceiling', h.eur(P.micro.plafonds.services), h.eur(P.micro.plafonds.services)],
  ['VAT exemption threshold', h.eur(P.tva.services.seuil), h.eur(P.tva.services.seuil)],
], 'Micro-enterprise: what changes with the classification of a development business', ['l', 'r', 'r'])}
<p>The liberal classification costs more in contributions and comes with a smaller tax allowance. On ${h.eur(m400.ca)} of turnover the gap in social levies is ${h.eur(ecartCotis400)} a year against BNC. Ceilings and VAT thresholds are the same, those for services. The liberal regime is covered in more depth on ${h.a('auto-entrepreneur-liberal', 'freelance professions under the micro scheme')}.</p>

<h2>Day rate into income: three worked assumptions</h2>
<p>The day rates and day counts below are calculation assumptions, not observed prices. The engine turns them into annual turnover, then into monthly take-home after contributions and income tax for a single person, with no flat-rate option and no other income.</p>
${h.table(['Assumption', 'Turnover', 'Monthly take-home, BNC', 'Monthly take-home, BIC'], missions.map((x) => [`${h.eur(x.tjm)} × ${h.num(x.j)} days`, h.eur(x.ca), x.bnc.depassePlafond ? 'over the ceiling' : h.eur(x.bnc.netMensuel), x.bic.depassePlafond ? 'over the ceiling' : h.eur(x.bic.netMensuel)]), 'Developer as a micro-entrepreneur in 2026: take-home after contributions and income tax, single person', ['l', 'r', 'r', 'r'])}
<p>At ${h.eur(350)} over ${h.num(180)} days, the two classifications differ by ${h.eur(m350.bic.netMensuel - m350.bnc.netMensuel)} a month. The third assumption, ${h.eur(m550.ca)}, exceeds the ceiling: one year can pass, two in a row force a change of set-up.</p>
<p>Why is BIC take-home higher? Two effects add up. Contributions are lower, and the larger allowance shrinks the income the tax office sees: on ${h.eur(m400.ca)}, scale income tax comes to ${h.eur(m400.bnc.ir)} under BNC but ${h.eur(m400.bic.ir)} under BIC for a single person. Neither figure is a reason to pick a classification; the activity you actually carry out decides it.</p>

<h2>How many days before VAT and before the ceiling</h2>
<p>For a developer, both thresholds come quickly. The ${h.src('spFranchiseTva', 'VAT exemption')} runs out well before the ${h.src('spPlafonds', 'micro-enterprise ceiling')}, so a full-time practice almost always ends up charging VAT.</p>
${h.table(['Day rate before VAT', 'Days before the VAT threshold', 'Days before the micro ceiling'], paliersTjm.map((x) => [h.eur(x.tjm), h.num(x.tva), h.num(x.plafond)]), `Billable days before ${h.eur(P.tva.services.seuil)} and ${h.eur(P.micro.plafonds.services)} of annual turnover`, ['r', 'r', 'r'])}
<p>Crossing the VAT line does not end the micro scheme. You stay a micro-entrepreneur, add VAT to invoices, get an intra-EU VAT number from your business tax office (the SIE) and declare the VAT you collect and the VAT you can deduct. Details are on ${h.a('tva-auto-entrepreneur', 'the micro-entrepreneur VAT threshold')}.</p>
<h3>The year you start</h3>
<p>In the first year the ceiling is prorated by days of activity. A developer starting on 1 March 2026 has ${h.eur(plafondMars)} instead of ${h.eur(P.micro.plafonds.services)}, or ${h.num(joursMars450)} days at ${h.eur(450)}. The micro scheme is guaranteed in the year of creation and the next; checks start after that (${h.a('plafond-micro-entreprise', 'micro-enterprise ceiling')}).</p>

<h2>Income tax: scale or flat-rate option</h2>
<p>By default, turnover minus the allowance is added to the rest of your household’s income and taxed on the progressive scale. Choosing the ${h.src('impotsVL', 'versement libératoire')} replaces that with a percentage paid alongside contributions: on ${h.eur(m400.ca)}, ${h.eur(vl400bnc.vl)} under BNC or ${h.eur(vl400bic.vl)} under BIC. It requires a modest reference taxable income (revenu fiscal de référence), at most ${h.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per household share for 2026 (${h.src('spMicroImposition', 'service-public, sheet F23267')}). For a single developer with no other income, our engine gives scale income tax of ${h.eur(m400.bnc.ir)} under BNC on the same turnover.</p>

<h2>When the micro scheme is no longer enough</h2>
<p>Above the ceiling, or when costs such as hardware, software and travel weigh heavily, other set-ups become worth a look: sole trader on real profit, EURL, SASU or umbrella employment. The ${h.a('statut-freelance', 'freelance legal status guide')} compares them on three profiles, the ${h.a('tjm-freelance', 'day rate calculator')} starts straight from your rate, and the ${h.a('tjm-500', '€500 day rate page')} looks at one level in detail.</p>
<p>These are estimates built on the published 2026 rules. They replace neither the Urssaf’s decision on your classification, nor the tax office’s assessment, nor advice tailored to your situation.</p>`,
  },
});
