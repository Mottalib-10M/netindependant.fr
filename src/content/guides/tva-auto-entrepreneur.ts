import { defineGuide } from '../../lib/guide-types';
import { micro, type Activite } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

const tv = P.tva;
// Cas calculés par le moteur : statut de TVA selon le chiffre d'affaires encaissé.
const cas: Array<[string, string, number, Activite]> = [
  ['Webdesigner', 'Web designer', 36000, 'bnc'],
  ['Formatrice', 'Trainer', 39500, 'bnc'],
  ['Photographe', 'Photographer', 44000, 'bnc'],
  ['Épicerie en ligne', 'Online grocer', 82000, 'vente'],
  ['Brocanteur', 'Second-hand dealer', 90000, 'vente'],
  ['Torréfacteur', 'Coffee roaster', 97000, 'vente'],
];
const statuts = cas.map(([fr, en, ca, a]) => ({ fr, en, ca, a, m: micro({ ca, activite: a }) }));
const zoneFR = { franchise: 'Franchise, pas de TVA', tolerance: 'TVA au 1er janvier suivant', redevable: 'TVA dès le jour du dépassement' };
const zoneEN = { franchise: 'Exempt, no VAT', tolerance: 'VAT from next 1 January', redevable: 'VAT from the day you cross' };
// Photographe à 44 000 € : redevable, mais toujours sous le plafond du régime micro.
const photo = micro({ ca: 44000, activite: 'bnc' });
const margeMicro = P.micro.plafonds.services - 44000;
// Première année : début le 1er septembre 2026, 13 000 € encaissés, chiffre ramené à l'année.
const joursSept = Math.round((Date.UTC(2027, 0, 1) - Date.UTC(2026, 8, 1)) / 86400000);
const caSept = 13000;
const annualise = (caSept * 365) / joursSept;
// Écart entre le seuil de TVA et le plafond micro en services.
const zoneGrise = P.micro.plafonds.services - tv.services.majore;

export default defineGuide({
  id: 'tva-auto-entrepreneur',
  group: 'micro',
  order: 40,
  mini: 'tvaFranchise',
  related: ['plafond-micro-entreprise', 'micro-entreprise', 'charges-auto-entrepreneur', 'prestation-de-service', 'declarer-chiffre-affaires'],
  sources: ['spFranchiseTva', 'aeEssentiel', 'spPlafonds'],
  fr: {
    slug: 'tva-auto-entrepreneur',
    nav: 'TVA de l’auto-entrepreneur',
    card: 'Seuils de franchise 2026, seuil majoré, mention sur facture et passage à la TVA.',
    title: 'TVA auto-entrepreneur 2026 : seuils de franchise et bascule',
    description: 'TVA auto-entrepreneur 2026 : franchise jusqu’à 37 500 € en services et 85 000 € en vente, TVA due dès le jour où le seuil majoré de 41 250 € est franchi.',
    h1: 'La TVA de l’auto-entrepreneur : franchise, seuils et bascule',
    intro: 'Tant que vous restez sous le seuil, vos factures sont hors TVA ; au-dessus, tout change, même en micro-entreprise.',
    resume: `En 2026, un auto-entrepreneur ne facture pas la TVA tant que son chiffre d’affaires annuel reste sous ${FR.eur(tv.services.seuil)} pour des prestations de services ou ${FR.eur(tv.vente.seuil)} pour la vente de marchandises et l’hébergement : c’est la franchise en base de TVA. Au-dessus de ce seuil sans franchir le seuil majoré, ${FR.eur(tv.services.majore)} en services et ${FR.eur(tv.vente.majore)} en vente, la franchise tient jusqu’à la fin de l’année et la TVA s’applique au 1er janvier suivant. Au-delà du seuil majoré, la TVA est due dès le jour du dépassement. Le seuil unique de ${FR.eur(tv.seuil_unique_abandonne)} prévu par la loi de finances pour 2025 a été abandonné, confirme service-public. Ces seuils de TVA sont bien plus bas que le plafond de la micro-entreprise : un graphiste peut facturer la TVA tout en restant micro-entrepreneur jusqu’à ${FR.eur(P.micro.plafonds.services)}. Ses cotisations restent alors calculées sur le chiffre d’affaires hors taxe, jamais sur la TVA collectée.`,
    faqs: [
      { q: 'Quelle mention écrire sur une facture d’auto-entrepreneur sans TVA ?', a: `La formule « TVA non applicable, art. 293 B du CGI », qui signale au client que vous bénéficiez de la franchise en base. Elle vaut tant que votre chiffre d’affaires reste sous ${FR.eur(tv.services.seuil)} en services ou ${FR.eur(tv.vente.seuil)} en vente sur l’année, selon l’Urssaf et service-public. Le jour où la franchise prend fin, la mention disparaît et la TVA apparaît sur chaque facture.` },
      { q: 'Le seuil de TVA à 25 000 € s’applique-t-il aux auto-entrepreneurs en 2026 ?', a: `Non. La loi de finances pour 2025 prévoyait un seuil unique de ${FR.eur(tv.seuil_unique_abandonne)} pour toutes les activités, mais il a été abandonné : service-public, vérifié le 1er janvier 2026, maintient ${FR.eur(tv.services.seuil)} pour les services et ${FR.eur(tv.vente.seuil)} pour la vente, avec des seuils majorés de ${FR.eur(tv.services.majore)} et ${FR.eur(tv.vente.majore)}.` },
      { q: 'Je dépasse le seuil de TVA en novembre : dois-je facturer la TVA tout de suite ?', a: `Cela dépend du seuil franchi. Pour des services, si votre chiffre d’affaires de l’année passe ${FR.eur(tv.services.seuil)} sans atteindre ${FR.eur(tv.services.majore)}, vous finissez l’année en franchise et facturez la TVA à partir du 1er janvier suivant. S’il dépasse ${FR.eur(tv.services.majore)}, la TVA s’applique dès l’opération qui fait franchir ce seuil, selon service-public (fiche F21746).` },
      { q: 'Un avocat micro-entrepreneur a-t-il le même seuil de TVA ?', a: `Non, les avocats ont un seuil propre pour leurs activités réglementées : ${FR.eur(tv.avocat_reglemente.seuil)}, avec un seuil majoré de ${FR.eur(tv.avocat_reglemente.majore)} en 2026, d’après service-public (fiche F21746). Pour leurs autres prestations, un seuil plus bas s’applique. Ces montants ne changent rien au plafond du régime micro, fixé à ${FR.eur(P.micro.plafonds.services)} pour les activités libérales.` },
      { q: 'Une fois redevable de la TVA, que faut-il faire en micro-entreprise ?', a: `Demander un numéro de TVA intracommunautaire au service des impôts des entreprises (SIE), ajouter la TVA à vos prix hors taxe, puis reverser la TVA collectée en déduisant celle payée sur vos achats professionnels, d’après l’Urssaf. Vous restez micro-entrepreneur tant que vous ne dépassez pas ${FR.eur(P.micro.plafonds.services)} en services, et vos cotisations portent toujours sur le chiffre d’affaires hors taxe.` },
    ],
    body: (h) => `
<h2>Les seuils de franchise en 2026</h2>
<p>La franchise en base dispense de facturer la TVA, et donc de la reverser, tant que le chiffre d’affaires de l’année civile reste sous un seuil qui dépend de l’activité (${h.src('spFranchiseTva', 'service-public, fiche F21746')}). Deux chiffres comptent pour chaque catégorie : le seuil, et le seuil majoré qui sert de limite absolue en cours d’année.</p>
${h.table(['Activité', 'Seuil de franchise', 'Seuil majoré', 'Plafond micro'], [
  ['Prestations de services, activités libérales', h.eur(tv.services.seuil), h.eur(tv.services.majore), h.eur(P.micro.plafonds.services)],
  ['Vente de marchandises, hébergement', h.eur(tv.vente.seuil), h.eur(tv.vente.majore), h.eur(P.micro.plafonds.vente)],
  ['Avocats, activités réglementées', h.eur(tv.avocat_reglemente.seuil), h.eur(tv.avocat_reglemente.majore), h.eur(P.micro.plafonds.services)],
], 'Franchise en base de TVA et plafond du régime micro en 2026', ['l', 'r', 'r', 'r'])}
<p>La dernière colonne montre l’écart qui surprend tant de prestataires : en services, ${h.eur(zoneGrise)} séparent le seuil majoré de TVA du plafond du régime. Dans cette zone, on reste micro-entrepreneur, avec les mêmes cotisations et la même déclaration à l’Urssaf, mais on facture la TVA.</p>
<p>Le seuil unique de ${h.eur(tv.seuil_unique_abandonne)}, voté pour 2025 puis abandonné, n’existe pas : si un article vous l’annonce, il date.</p>

<h2>Trois zones, trois conséquences</h2>
<p>Sous le seuil, rien à faire. Entre le seuil et le seuil majoré, vous terminez l’année sans TVA et la facturez à partir du 1er janvier suivant. Au-delà du seuil majoré, la TVA est due dès le jour du dépassement, sur l’opération qui fait franchir la limite et sur toutes les suivantes. Le moteur du site range ainsi six activités selon leur chiffre d’affaires encaissé en 2026.</p>
${h.table(['Activité', 'Chiffre d’affaires 2026', 'Seuil applicable', 'Situation'], statuts.map((s) => [s.fr, h.eur(s.ca), h.eur(s.m.tvaSeuil), zoneFR[s.m.tvaStatut]]), 'Situation au regard de la TVA selon le chiffre d’affaires, calculée par le moteur', ['l', 'r', 'r', 'l'])}
<p>La formatrice illustre la zone de tolérance : ${h.eur(39500)} encaissés, c’est plus que ${h.eur(tv.services.seuil)} mais moins que ${h.eur(tv.services.majore)}. Elle n’a rien à changer avant le 31 décembre. Le photographe, lui, a franchi le seuil majoré : la TVA s’applique dès la facture qui l’y fait passer, alors qu’il garde ${h.eur(margeMicro)} de marge avant le plafond de la micro-entreprise.</p>

<h2>L’année de création : on raisonne en année pleine</h2>
<p>Pour une activité commencée en cours d’année, le chiffre d’affaires se ramène à une année entière avant d’être comparé aux seuils : chiffre d’affaires × 365 ÷ jours d’activité. C’est l’inverse du plafond de la micro-entreprise, où l’on réduit le seuil plutôt que d’augmenter le chiffre d’affaires. Un consultant qui démarre le 1er septembre 2026 et encaisse ${h.eur(caSept)} d’ici au 31 décembre a ${h.num(joursSept)} jours d’activité : son chiffre d’affaires annualisé est de ${h.eur(annualise)}, à comparer à ${h.eur(tv.services.seuil)} et ${h.eur(tv.services.majore)}. Quatre mois d’activité suffisent donc à franchir un seuil quand les débuts sont rapides.</p>

<h2>Ce qui change quand la TVA devient due</h2>
<p>La mention « TVA non applicable, art. 293 B du CGI » disparaît de vos factures. Il faut obtenir un numéro de TVA intracommunautaire auprès du service des impôts des entreprises, ajouter la TVA au prix hors taxe, puis déclarer la TVA collectée et celle que vous pouvez déduire sur vos achats (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Le taux à appliquer dépend de la nature de la prestation ; vérifiez-le sur impots.gouv.fr avant la première facture.</p>
<p>Pour le photographe à ${h.eur(44000)}, la vie sociale ne change pas : ses cotisations restent de ${h.eur(photo.cotisations)}, calculées sur le hors-taxe. Ce qui change, c’est le prix vu par le client. Si le tarif hors taxe reste le même, la facture finale grossit du montant de la TVA ; si le photographe veut garder le même prix toutes taxes comprises, c’est sa recette hors taxe qui diminue. La TVA qu’il peut désormais déduire sur ses achats professionnels, boîtiers, objectifs ou logiciels, compense une partie de l’effort.</p>

<h2>Anticiper plutôt que subir</h2>
<p>Suivez votre chiffre d’affaires encaissé mois par mois et regardez-le à l’aune des deux seuils. À l’approche de ${h.eur(tv.services.seuil)}, décidez si vous intégrez la TVA dans vos prix ou si vous la répercutez ; prévenez vos clients particuliers avant, pas après. Le mini-simulateur en haut de page indique dans quelle zone vous êtes et la marge restante. Pour la facturation en général, voyez ${h.a('prestation-de-service', 'la prestation de service')}, et pour la frontière du régime lui-même, ${h.a('plafond-micro-entreprise', 'le plafond de la micro-entreprise')}.</p>
<p>Les situations décrites ici sont des estimations à partir des seuils publiés ; elles ne remplacent pas un conseil personnalisé, et votre service des impôts reste l’interlocuteur pour toute question sur votre cas.</p>`,
  },
  en: {
    slug: 'vat-exemption-threshold',
    nav: 'VAT exemption threshold',
    card: 'The 2026 VAT limits, the upper threshold, invoice wording and what changes when VAT starts.',
    title: 'VAT exemption threshold 2026 for French micro-entrepreneurs',
    description: 'VAT exemption threshold 2026 in France: no VAT up to €37,500 for services and €85,000 for goods; VAT applies the day turnover passes the €41,250 upper limit.',
    h1: 'VAT and the French micro-entrepreneur: exemption, thresholds and switching over',
    intro: 'Below the threshold your invoices carry no VAT; above it they do, even if you stay in the micro scheme.',
    resume: `In 2026 a French micro-entrepreneur does not charge VAT (TVA in French) as long as yearly turnover stays under ${EN.eur(tv.services.seuil)} for services or ${EN.eur(tv.vente.seuil)} for selling goods and accommodation. The French call this the franchise en base de TVA, a basic VAT exemption. If turnover passes that threshold but stays below the upper threshold, ${EN.eur(tv.services.majore)} for services and ${EN.eur(tv.vente.majore)} for goods, the exemption lasts until the end of the year and VAT starts on the following 1 January. Above the upper threshold, VAT is due from the day you cross it. A single ${EN.eur(tv.seuil_unique_abandonne)} threshold planned in the 2025 budget was dropped, service-public confirms. These VAT limits sit well below the micro-enterprise ceiling, so a consultant can charge VAT while remaining a micro-entrepreneur up to ${EN.eur(P.micro.plafonds.services)}. Social contributions are still worked out on turnover before VAT, never on the VAT you collect for the State.`,
    faqs: [
      { q: 'What do I write on a French invoice when I do not charge VAT?', a: `The sentence “TVA non applicable, art. 293 B du CGI”, which tells the client you use the basic exemption under the French tax code. It stays valid while your yearly turnover remains below ${EN.eur(tv.services.seuil)} for services or ${EN.eur(tv.vente.seuil)} for goods, according to the Urssaf and service-public. When the exemption ends, the wording goes and VAT appears on every invoice.` },
      { q: 'Did France cut the micro-entrepreneur VAT threshold to €25,000?', a: `No. The 2025 budget planned a single ${EN.eur(tv.seuil_unique_abandonne)} threshold for every activity, but it was abandoned. Service-public, checked on 1 January 2026, keeps ${EN.eur(tv.services.seuil)} for services and ${EN.eur(tv.vente.seuil)} for goods, with upper thresholds of ${EN.eur(tv.services.majore)} and ${EN.eur(tv.vente.majore)}. If a source quotes the lower figure, check its date before you rely on it.` },
      { q: 'I passed the VAT threshold in November: do I start charging VAT now?', a: `It depends which line you crossed. For services, if this year’s turnover is above ${EN.eur(tv.services.seuil)} but below ${EN.eur(tv.services.majore)}, you finish the year exempt and add VAT from the next 1 January. If it goes above ${EN.eur(tv.services.majore)}, VAT applies from the transaction that takes you over, according to service-public (sheet F21746).` },
      { q: 'How is the VAT threshold applied when I register in the autumn?', a: `Your first-year turnover is scaled up to a full year: turnover × 365 ÷ days of activity, then compared with the thresholds. Starting on 1 September 2026 and receiving ${EN.eur(caSept)} by 31 December gives ${EN.eur(annualise)} on a full-year basis, against ${EN.eur(tv.services.seuil)} and ${EN.eur(tv.services.majore)} for services, according to service-public (sheet F21746).` },
      { q: 'Once VAT applies, what paperwork changes for a micro-entrepreneur?', a: `You request an intra-EU VAT number from your SIE, the business tax office, add VAT to your prices before tax, and pay over the VAT collected after deducting the VAT on your business purchases, according to the Urssaf. You remain a micro-entrepreneur up to ${EN.eur(P.micro.plafonds.services)} for services, and contributions stay based on turnover before VAT.` },
    ],
    body: (h) => `
<h2>The 2026 exemption limits</h2>
<p>Many newcomers assume that a small business either registers for VAT or does not, once and for all. In France the basic exemption follows your turnover year by year: no VAT to charge or pay over while the calendar year’s receipts stay below a limit set by activity (${h.src('spFranchiseTva', 'service-public, sheet F21746')}). Each category has two numbers, the threshold and an upper threshold that acts as a hard stop during the year.</p>
${h.table(['Activity', 'Exemption threshold', 'Upper threshold', 'Micro ceiling'], [
  ['Services, freelance professions', h.eur(tv.services.seuil), h.eur(tv.services.majore), h.eur(P.micro.plafonds.services)],
  ['Selling goods, accommodation', h.eur(tv.vente.seuil), h.eur(tv.vente.majore), h.eur(P.micro.plafonds.vente)],
  ['Lawyers, regulated activities', h.eur(tv.avocat_reglemente.seuil), h.eur(tv.avocat_reglemente.majore), h.eur(P.micro.plafonds.services)],
], 'French basic VAT exemption and micro-enterprise ceiling in 2026', ['l', 'r', 'r', 'r'])}
<p>The last column shows the gap that catches people out: for services, ${h.eur(zoneGrise)} separate the upper VAT threshold from the micro ceiling. In that band you are still a micro-entrepreneur, with the same contributions and the same Urssaf return, but you charge VAT. The single ${h.eur(tv.seuil_unique_abandonne)} threshold voted for 2025 and then dropped is not in force.</p>

<h2>Three bands, three outcomes</h2>
<p>Below the threshold, nothing to do. Between the threshold and the upper threshold, you finish the year without VAT and start charging it on 1 January. Above the upper threshold, VAT is due from the day you cross it, on the sale that pushes you over and every one after. The site’s engine sorts six businesses by their 2026 receipts.</p>
${h.table(['Business', '2026 turnover', 'Threshold', 'Position'], statuts.map((s) => [s.en, h.eur(s.ca), h.eur(s.m.tvaSeuil), zoneEN[s.m.tvaStatut]]), 'VAT position by turnover, computed by the engine', ['l', 'r', 'r', 'l'])}
<p>The trainer sits in the tolerance band: ${h.eur(39500)} received is more than ${h.eur(tv.services.seuil)} but less than ${h.eur(tv.services.majore)}, so nothing changes before 31 December. The photographer has passed the upper threshold: VAT applies from the invoice that takes him over, although he still has ${h.eur(margeMicro)} of room before the micro ceiling.</p>

<h2>Your first year: scaled up to twelve months</h2>
<p>If you start mid-year, turnover is scaled up to a full year before the comparison: turnover × 365 ÷ days of activity. This works the other way round from the micro ceiling, where the limit is reduced instead. A consultant who registers on 1 September 2026 and receives ${h.eur(caSept)} by 31 December has ${h.num(joursSept)} days of activity, so a full-year figure of ${h.eur(annualise)}. Four busy months can be enough to reach a threshold.</p>

<h2>When VAT becomes due</h2>
<p>The exemption wording leaves your invoices. You obtain an intra-EU VAT number from the SIE (service des impôts des entreprises, the business tax office), add VAT to your prices before tax, then declare the VAT you collected and the VAT you can deduct on purchases (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). The rate depends on what you sell; check it on impots.gouv.fr before the first invoice.</p>
<p>For the photographer on ${h.eur(44000)}, social contributions stay at ${h.eur(photo.cotisations)}, worked out before VAT. What changes is the price the client sees. Keep the pre-tax rate and the final invoice grows by the VAT; keep the all-in price and your own pre-tax income shrinks. The VAT you can now deduct on business purchases, camera bodies, lenses or software, offsets part of the hit.</p>

<h2>Lawyers and authors</h2>
<p>Lawyers are the one profession with a distinct published threshold for their regulated work: ${h.eur(tv.avocat_reglemente.seuil)}, with an upper threshold of ${h.eur(tv.avocat_reglemente.majore)}. Their other services fall under a lower limit. None of this moves the micro ceiling, which stays at ${h.eur(P.micro.plafonds.services)} for freelance professions. Authors paid for their works and rights also have specific limits, listed on the same service-public sheet; if your situation is unusual, ask your business tax office before your first invoice.</p>
<h2>Plan ahead</h2>
<p>Track your receipts month by month against both limits. As you approach ${h.eur(tv.services.seuil)}, decide whether VAT goes on top of your prices or comes out of them, and tell private clients early. The mini-calculator at the top of this page shows your band and the room left. For invoicing in general see ${h.a('prestation-de-service', 'invoicing services')}, and for the scheme’s own limit see ${h.a('plafond-micro-entreprise', 'the turnover ceiling')}.</p>
<p>The situations described here are estimates based on published thresholds, not personal advice; your local tax office is the authority on your own case.</p>`,
  },
});
