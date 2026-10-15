import { defineGuide } from '../../lib/guide-types';
import { comparer } from '../../lib/engine/statuts';
import { micro } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Palier de 300 € : tout vient du moteur et des paramètres 2026 (frais de portage : hypothèse du mini, 8 %).
const TJM = 300;
const FRAIS = 0.08;
const JOURS = [160, 180, 200, 220];
const S = Object.fromEntries(JOURS.map((j) => [j, comparer({ ca: TJM * j, charges: 0, activite: 'bnc', fraisPortage: FRAIS })])) as Record<number, ReturnType<typeof comparer>>;
const jPlafond = Math.floor(P.micro.plafonds.services / TJM);
const jTva = Math.floor(P.tva.services.seuil / TJM);
const jTvaMaj = Math.floor(P.tva.services.majore / TJM);
const vl160 = micro({ ca: TJM * 160, activite: 'bnc', vl: true });
const ecart160 = S[160].micro.netMensuel - S[160].eurl.netMensuel;
const ecartPortage = S[200].micro.netMensuel - S[200].portage.netMensuel;
const ca = (j: number) => TJM * j;

export default defineGuide({
  id: 'tjm-300',
  group: 'freelance',
  order: 70,
  mini: 'tjmPalier',
  miniDefaults: { tjm: 300 },
  miniHref: 'tjm-freelance',
  related: ['tjm-400', 'tjm-freelance', 'comparateur-statuts', 'tva-auto-entrepreneur', 'versement-liberatoire'],
  sources: ['spFranchiseTva', 'spPlafonds', 'aeEssentiel', 'impotsVL', 'spIs'],
  fr: {
    slug: 'tjm-300',
    nav: 'TJM 300 €',
    card: 'La micro tient toute l’année, mais la franchise de TVA tombe en route.',
    title: 'TJM 300 € en 2026 : la micro tient, TVA après 125 jours',
    description: 'TJM 300 € en 2026 : la micro-entreprise tient jusqu’à 278 jours, mais la franchise de TVA tombe après 125 jours. Net mensuel par statut de 160 à 220 jours.',
    h1: 'TJM de 300 € : la micro-entreprise tient, la TVA arrive avant',
    intro: 'À ce taux, le plafond de la micro-entreprise reste hors d’atteinte, et c’est le seuil de TVA qui se franchit en premier.',
    resume: `À ${FR.eur(TJM)} par jour, un freelance en micro-entreprise libérale garde ${FR.eur(S[160].micro.netMensuel)} par mois après cotisations et impôt sur le revenu s’il facture ${FR.num(160)} jours dans l’année, et ${FR.eur(S[200].micro.netMensuel)} s’il en facture ${FR.num(200)}, pour une personne seule sans autre revenu ni frais. C’est le meilleur résultat des cinq cadres comparés, à chaque volume de jours testé : sur ${FR.num(200)} jours, l’EURL laisse ${FR.eur(S[200].eurl.netMensuel)}, la SASU ${FR.eur(S[200].sasu.netMensuel)} et le portage salarial ${FR.eur(S[200].portage.netMensuel)}. Le plafond de ${FR.eur(P.micro.plafonds.services)} ne serait atteint qu’après ${FR.num(jPlafond)} jours facturés, il ne gêne donc personne. La frontière qui compte est la franchise en base de TVA : ${FR.eur(P.tva.services.seuil)} encaissés, soit ${FR.num(jTva)} jours. Au-delà, la TVA s’applique au 1er janvier suivant ; au-delà de ${FR.eur(P.tva.services.majore)}, atteint au ${FR.num(jTvaMaj + 1)}e jour, elle s’applique le jour même. Ces chiffres sont des estimations : l’Urssaf et l’administration fiscale fixent les montants réels.`,
    faqs: [
      { q: 'Un TJM de 300 € oblige-t-il à facturer la TVA ?', a: `Oui, dès que l’activité dépasse ${FR.num(jTva)} jours facturés dans l’année : le chiffre d’affaires franchit alors ${FR.eur(P.tva.services.seuil)}, et la TVA s’applique au 1er janvier suivant. Si le ${FR.num(jTvaMaj + 1)}e jour est facturé dans la même année, le seuil majoré de ${FR.eur(P.tva.services.majore)} tombe et la TVA est due dès ce jour, selon la fiche F21746 de service-public. En dessous, la facture porte la mention de l’article 293 B du CGI.` },
      { q: 'À 300 € par jour, combien de jours avant le plafond de la micro-entreprise ?', a: `${FR.num(jPlafond)} jours. Le plafond des prestations de services est de ${FR.eur(P.micro.plafonds.services)} de chiffre d’affaires encaissé en 2026, selon service-public. Même en facturant ${FR.num(220)} jours, vous restez à ${FR.eur(ca(220))}, loin du seuil. Seule une année de création démarrée tard serait concernée, car le plafond est alors réduit au prorata des jours d’activité.` },
      { q: 'Quel net mensuel avec un TJM de 300 € sur 180 jours ?', a: `${FR.eur(S[180].micro.netMensuel)} par mois en micro-entreprise libérale, contre ${FR.eur(S[180].eurl.netMensuel)} en EURL, ${FR.eur(S[180].ei.netMensuel)} en entreprise individuelle au réel, ${FR.eur(S[180].sasu.netMensuel)} en SASU et ${FR.eur(S[180].portage.netMensuel)} en portage salarial. Le calcul vaut pour une personne seule, sans frais professionnels ni autre revenu, après cotisations et impôt sur le revenu, aux taux 2026 publiés par l’Urssaf.` },
      { q: 'Le versement libératoire est-il rentable à 300 € par jour ?', a: `Sur ${FR.num(160)} jours, il porte le net à ${FR.eur(vl160.netMensuel)} par mois au lieu de ${FR.eur(S[160].micro.netMensuel)}, car ${FR.pct(P.micro.vl.bnc)} du chiffre d’affaires coûtent moins que le barème à ce niveau. Il faut toutefois un revenu fiscal de référence de 2024 inférieur à ${FR.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part pour l’année 2026, et opter avant le 30 septembre pour l’année suivante (impots.gouv.fr).` },
      { q: 'Une SASU a-t-elle un sens avec un TJM de 300 € ?', a: `Rarement sur le plan du net : sur ${FR.num(160)} jours, elle laisse ${FR.eur(S[160].sasu.netMensuel)} par mois, soit ${FR.eur(S[160].micro.netMensuel - S[160].sasu.netMensuel)} de moins que la micro. Le meilleur partage ne verse que ${FR.pct(S[160].sasu.partRemuneration ?? 0, 0)} du bénéfice en rémunération, le reste en dividendes taxés au prélèvement forfaitaire. Elle se justifie plutôt par un projet d’associés ou des frais importants, que ce calcul ne retient pas.` },
    ],
    body: (h) => `
<h2>Le seuil de ce palier : la TVA à ${h.num(jTva)} jours, pas le plafond</h2>
<p>Un TJM de ${h.eur(TJM)} est le seul palier de cette série où la micro-entreprise ne heurte pas son plafond sur une année pleine : il faudrait facturer ${h.num(jPlafond)} jours pour dépasser ${h.eur(P.micro.plafonds.services)} (${h.src('spPlafonds', 'service-public, fiche F32353')}). Ce qui change la donne à ce niveau, c’est la TVA. Tant que le chiffre d’affaires encaissé reste sous ${h.eur(P.tva.services.seuil)}, la facture porte la mention « TVA non applicable, art. 293 B du CGI » et le prix payé par le client est votre prix. Le ${h.num(jTva + 1)}e jour facturé sur l’année fait perdre la franchise pour l’année suivante ; le ${h.num(jTvaMaj + 1)}e la fait tomber en cours d’année, le jour même du dépassement du seuil majoré de ${h.eur(P.tva.services.majore)} (${h.src('spFranchiseTva', 'service-public, fiche F21746')}). Pour un client entreprise qui récupère la taxe, rien ne bouge vraiment. Pour un particulier ou une association, votre prix grimpe d’un coup, ou votre marge fond si vous gardez le même prix toutes taxes comprises. D’où un réflexe simple : écrire dès le premier devis que le tarif s’entend hors taxe.</p>

<h2>Ce que laissent 160 à 220 jours à ${h.eur(TJM)}</h2>
${h.table(['Jours facturés', 'Chiffre d’affaires', 'Micro libérale', 'EI au réel', 'EURL à l’IS', 'SASU', 'Portage'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), S[j].micro.possible ? h.eur(S[j].micro.netMensuel) : 'plafond dépassé', h.eur(S[j].ei.netMensuel), h.eur(S[j].eurl.netMensuel), h.eur(S[j].sasu.netMensuel), h.eur(S[j].portage.netMensuel)]), `Net mensuel après cotisations et impôt sur le revenu, TJM de ${h.eur(TJM)}, personne seule, sans frais, portage avec ${h.pct(FRAIS, 0)} de frais de gestion`, ['r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>La micro-entreprise arrive en tête sur toutes les lignes. Sur ${h.num(160)} jours, son avance sur l’EURL atteint ${h.eur(ecart160)} par mois : à ce chiffre d’affaires, le taux de ${h.pct(P.micro.taux.bnc)} sur les encaissements (${h.src('aeEssentiel', 'Urssaf')}) et l’abattement fiscal de ${h.pct(P.micro.abattement.bnc, 0)} coûtent moins que les cotisations d’un gérant ou d’un président. Le tableau ignore les frais : si vous louez un bureau ou achetez du matériel coûteux, refaites le calcul avec le ${h.a('comparateur-statuts', 'comparateur de statuts')}.</p>

<h2>Pourquoi la société ne rattrape pas la micro à ce niveau</h2>
<p>En SASU, le moteur cherche la part du bénéfice à verser en salaire qui maximise le net. À ${h.num(160)} jours, il n’en garde que ${h.pct(S[160].sasu.partRemuneration ?? 0, 0)} : le bénéfice laissé dans la société reste ainsi sous ${h.eur(P.is.seuil_reduit)}, imposé au taux réduit de ${h.pct(P.is.taux_reduit, 0)} (${h.src('spIs', 'service-public, fiche F23575')}), puis distribué en dividendes. Malgré ce réglage, la SASU reste derrière. L’EURL, elle, verse presque tout en rémunération du gérant (${h.pct(S[160].eurl.partRemuneration ?? 0, 0)} du bénéfice) et se rapproche de l’entreprise individuelle. Créer une société pour ${h.eur(ca(160))} de chiffre d’affaires ajoute une comptabilité complète et des formalités sans gain de revenu.</p>

<h2>Le versement libératoire, levier propre aux petits TJM</h2>
<p>À ce palier, le revenu imposable reste modeste, et l’option pour le ${h.a('versement-liberatoire', 'versement libératoire')} peut payer : ${h.pct(P.micro.vl.bnc)} du chiffre d’affaires réglés avec les cotisations, à la place du barème. Sur ${h.num(160)} jours, le net passe de ${h.eur(S[160].micro.netMensuel)} à ${h.eur(vl160.netMensuel)} par mois. La condition est de revenu : en 2026, un revenu fiscal de référence de 2024 au plus égal à ${h.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part (${h.src('impotsVL', 'impots.gouv.fr')}).</p>

<h2>Le portage, pour qui veut rester salarié</h2>
<p>Sur ${h.num(200)} jours, le portage salarial laisse ${h.eur(ecartPortage)} de moins par mois que la micro, avec les frais de gestion supposés ici à ${h.pct(FRAIS, 0)} (aucun barème officiel n’existe). L’écart paie des cotisations de salarié cadre, dont l’assurance chômage. Le détail est sur ${h.a('portage-ou-auto-entrepreneur', 'portage ou auto-entrepreneur')}.</p>
<p>Le palier suivant, ${h.a('tjm-400', 'un TJM de 400 €')}, rapproche le plafond de la micro jusqu’à le rendre atteignable. Pour tester votre propre nombre de jours, le ${h.a('tjm-freelance', 'simulateur TJM')} reprend le même moteur. Ces montants restent une estimation, pas un conseil personnalisé.</p>`,
  },
  en: {
    slug: 'day-rate-300',
    nav: 'Day rate €300',
    card: 'Micro-enterprise holds all year, but the VAT exemption goes along the way.',
    title: 'Day rate €300 in 2026: micro holds, VAT after 125 days',
    description: 'Day rate €300 in France 2026: the micro-enterprise holds up to 278 billed days, but the VAT exemption ends after 125 days. Monthly take-home by legal form.',
    h1: 'A €300 day rate: micro-enterprise holds, VAT comes first',
    intro: 'At this rate the micro-enterprise turnover ceiling stays out of reach; the VAT threshold is the line you cross first.',
    resume: `At ${EN.eur(TJM)} a day, a freelancer registered as a micro-entrepreneur (France’s simplified self-employed scheme) keeps ${EN.eur(S[160].micro.netMensuel)} a month after social contributions and income tax when billing ${EN.num(160)} days a year, and ${EN.eur(S[200].micro.netMensuel)} on ${EN.num(200)} days, for a single person with no other income and no expenses. That is the best result of the five set-ups compared, at every number of days tested: on ${EN.num(200)} days an EURL (single-member limited company) leaves ${EN.eur(S[200].eurl.netMensuel)}, a SASU (single-shareholder simplified company) ${EN.eur(S[200].sasu.netMensuel)} and umbrella employment ${EN.eur(S[200].portage.netMensuel)}. The ${EN.eur(P.micro.plafonds.services)} turnover ceiling would only be reached after ${EN.num(jPlafond)} billed days, so it is not a constraint. The line that matters is the VAT exemption: ${EN.eur(P.tva.services.seuil)} received, or ${EN.num(jTva)} days. Above it, VAT applies from the next 1 January; above ${EN.eur(P.tva.services.majore)}, reached on day ${EN.num(jTvaMaj + 1)}, it applies at once. These are estimates: the Urssaf and the tax office set the real amounts.`,
    faqs: [
      { q: 'Do I have to charge VAT at a €300 day rate?', a: `Yes, once you bill more than ${EN.num(jTva)} days in a calendar year: turnover then passes ${EN.eur(P.tva.services.seuil)} and VAT applies from the following 1 January. If day ${EN.num(jTvaMaj + 1)} is billed in the same year, the higher ${EN.eur(P.tva.services.majore)} threshold is crossed and VAT is due from that very day, per service-public sheet F21746. Below it, invoices carry the “TVA non applicable, art. 293 B du CGI” mention.` },
      { q: 'How many days at €300 before the micro-enterprise ceiling?', a: `${EN.num(jPlafond)} days. The ceiling for services is ${EN.eur(P.micro.plafonds.services)} of turnover received in 2026, according to service-public. Even billing ${EN.num(220)} days you stay at ${EN.eur(ca(220))}, well below it. Only a first year that starts late in the calendar could be caught, because the ceiling is then cut in proportion to the days of activity.` },
      { q: 'What is the monthly take-home on €300 a day for 180 days?', a: `${EN.eur(S[180].micro.netMensuel)} a month as a micro-entrepreneur, against ${EN.eur(S[180].eurl.netMensuel)} in an EURL, ${EN.eur(S[180].ei.netMensuel)} as a sole trader on real profit (EI), ${EN.eur(S[180].sasu.netMensuel)} in a SASU and ${EN.eur(S[180].portage.netMensuel)} through umbrella employment. Figures are for a single person with no expenses or other income, after contributions and income tax, at the 2026 Urssaf rates.` },
      { q: 'Is the flat-rate income tax option worth it at €300 a day?', a: `On ${EN.num(160)} days the versement libératoire (income tax paid as a fixed share of turnover) lifts take-home to ${EN.eur(vl160.netMensuel)} a month instead of ${EN.eur(S[160].micro.netMensuel)}, because ${EN.pct(P.micro.vl.bnc)} of turnover costs less than the progressive scale here. Your 2024 reference tax income must be under ${EN.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per household share for 2026, per impots.gouv.fr.` },
      { q: 'Does a SASU make sense on a €300 day rate?', a: `Rarely, on take-home alone: on ${EN.num(160)} days it leaves ${EN.eur(S[160].sasu.netMensuel)} a month, ${EN.eur(S[160].micro.netMensuel - S[160].sasu.netMensuel)} less than micro. The best split pays only ${EN.pct(S[160].sasu.partRemuneration ?? 0, 0)} of profit as salary and the rest as dividends under the flat tax. A SASU is better justified by partners joining or by heavy expenses, which this estimate leaves out.` },
    ],
    body: (h) => `
<h2>The threshold at this level: VAT at ${h.num(jTva)} days, not the ceiling</h2>
<p>A ${h.eur(TJM)} day rate (TJM, taux journalier moyen, the figure French clients negotiate) is the only level in this series where the micro-enterprise never meets its ceiling over a full year: you would need ${h.num(jPlafond)} billed days to pass ${h.eur(P.micro.plafonds.services)} (${h.src('spPlafonds', 'service-public, sheet F32353')}). What changes things here is VAT. While turnover received stays under ${h.eur(P.tva.services.seuil)}, you are in the franchise en base, the small-business exemption: your invoice states “TVA non applicable, art. 293 B du CGI” and the client pays exactly your price. Day ${h.num(jTva + 1)} in a calendar year ends the exemption from the next year; day ${h.num(jTvaMaj + 1)} ends it mid-year, on the day you pass the higher ${h.eur(P.tva.services.majore)} threshold (${h.src('spFranchiseTva', 'service-public, sheet F21746')}). A business client reclaims the tax and barely notices. A private client or a charity sees your price jump overnight, or your margin shrinks if you hold the price including tax. So state from the first quote that your rate is before VAT (hors taxe, HT).</p>

<h2>What 160 to 220 days at ${h.eur(TJM)} leave you</h2>
${h.table(['Days billed', 'Turnover', 'Micro (BNC)', 'EI, real profit', 'EURL, corporate tax', 'SASU', 'Umbrella'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), S[j].micro.possible ? h.eur(S[j].micro.netMensuel) : 'over ceiling', h.eur(S[j].ei.netMensuel), h.eur(S[j].eurl.netMensuel), h.eur(S[j].sasu.netMensuel), h.eur(S[j].portage.netMensuel)]), `Monthly take-home after contributions and income tax, ${h.eur(TJM)} day rate, single, no expenses, umbrella with a ${h.pct(FRAIS, 0)} fee`, ['r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Micro comes out on top on every row. On ${h.num(160)} days it beats the EURL by ${h.eur(ecart160)} a month: at this turnover, the ${h.pct(P.micro.taux.bnc)} rate on receipts (${h.src('aeEssentiel', 'Urssaf')}) and the ${h.pct(P.micro.abattement.bnc, 0)} flat tax allowance cost less than the contributions of a company director. The table assumes no expenses: if you rent an office or buy costly equipment, rerun the numbers in the ${h.a('comparateur-statuts', 'legal form comparison')}.</p>

<h2>Why a company cannot catch up at this level</h2>
<p>For a SASU the engine looks for the share of profit paid as salary that gives the best take-home. On ${h.num(160)} days it keeps only ${h.pct(S[160].sasu.partRemuneration ?? 0, 0)}: the profit left in the company then stays under ${h.eur(P.is.seuil_reduit)}, taxed at the reduced ${h.pct(P.is.taux_reduit, 0)} corporate tax rate (${h.src('spIs', 'service-public, sheet F23575')}), and goes out as dividends. Even tuned that way, the SASU trails. The EURL pays almost everything as the manager’s pay (${h.pct(S[160].eurl.partRemuneration ?? 0, 0)} of profit) and ends up close to the sole trader. Setting up a company for ${h.eur(ca(160))} of turnover adds full bookkeeping and filings with no gain in income.</p>

<h2>The flat-rate tax option, a lever for low rates</h2>
<p>Taxable income stays modest here, so the ${h.a('versement-liberatoire', 'versement libératoire')} can pay off: ${h.pct(P.micro.vl.bnc)} of turnover paid with your contributions instead of income tax on the scale. On ${h.num(160)} days, take-home rises from ${h.eur(S[160].micro.netMensuel)} to ${h.eur(vl160.netMensuel)} a month. The condition is about income: for 2026, a 2024 reference tax income (revenu fiscal de référence, shown on your French tax notice) of at most ${h.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per share (${h.src('impotsVL', 'impots.gouv.fr')}). If you only arrived in France recently and have no French notice, check with your tax office.</p>

<h2>Umbrella employment, if you want to stay an employee</h2>
<p>On ${h.num(200)} days, portage salarial leaves ${h.eur(ecartPortage)} a month less than micro, with the management fee assumed at ${h.pct(FRAIS, 0)} here (there is no official scale). The gap buys employee contributions as an executive, including French unemployment insurance. More on ${h.a('portage-ou-auto-entrepreneur', 'umbrella or micro')}.</p>
<p>The next level, ${h.a('tjm-400', 'a €400 day rate')}, brings the micro ceiling within reach. To test your own number of days, the ${h.a('tjm-freelance', 'day rate calculator')} runs the same engine. These figures are an estimate, not personal advice.</p>`,
  },
});
