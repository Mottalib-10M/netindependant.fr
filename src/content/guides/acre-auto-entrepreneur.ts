import { defineGuide } from '../../lib/guide-types';
import { micro, ACTIVITES } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const A = P.micro.acre;
const elecSans = micro({ ca: 24000, activite: 'bic', artisan: true });
const elecAcre = micro({ ca: 24000, activite: 'bic', artisan: true, acre: 'depuis' });
const graphSans = micro({ ca: 20000, activite: 'bnc' });
const graphAcre = micro({ ca: 20000, activite: 'bnc', acre: 'avant' });
const gainElec = elecSans.cotisations - elecAcre.cotisations;
const gainGraph = graphSans.cotisations - graphAcre.cotisations;
const seuilReel = P.tns.acre.seuil_pass * P.pass.annuel;
const plafondReel = P.tns.acre.plafond_pass * P.pass.annuel;
const partPayee = A.taux_paye_depuis_2026_07;

/** Fin de l'Acre : dernier jour du 3e trimestre civil qui suit celui du début d'activité (service-public F11677). */
function finAcre(mois: number, annee = 2026) {
  const t = Math.floor((mois - 1) / 3);
  const finIdx = (t + 3) * 3 + 2; // index de mois (0 = janvier de l'année de départ)
  const y = annee + Math.floor(finIdx / 12);
  const m = (finIdx % 12) + 1;
  const dernier = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { iso: `${y}-${String(m).padStart(2, '0')}-${String(dernier).padStart(2, '0')}`, mois: finIdx - (mois - 1) + 1 };
}
const dateEN = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
const DEPARTS = [1, 3, 6, 7, 9, 12];
const finSept = finAcre(9);
const finJuil = finAcre(7);

const NOMS = {
  fr: { vente: 'Vente de marchandises', bic: 'Prestations BIC (commerciales, artisanales)', bnc: 'Libéral non réglementé (BNC)', cipav: 'Libéral relevant de la Cipav' },
  en: { vente: 'Selling goods', bic: 'BIC services (commercial, craft)', bnc: 'Unregulated freelance (BNC)', cipav: 'Cipav professions' },
} as const;
const MOIS_FR = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_EN = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default defineGuide({
  id: 'acre-auto-entrepreneur',
  group: 'micro',
  order: 70,
  mini: 'acreGain',
  related: ['creer-micro-entreprise', 'charges-auto-entrepreneur', 'devenir-auto-entrepreneur', 'micro-entreprise', 'cotisations-tns'],
  sources: ['urssafAcre2026', 'spAcre', 'aeEssentiel', 'urssafTauxAC'],
  fr: {
    slug: 'acre-auto-entrepreneur',
    nav: 'Acre de l’auto-entrepreneur',
    card: 'Qui y a droit en 2026, comment la demander et ce qu’elle fait gagner.',
    title: 'Acre auto-entrepreneur 2026 : demande, taux et durée',
    description: 'Acre auto-entrepreneur 2026 : demande à faire dans les 60 jours, taux réduit de 15,9 % au lieu de 21,2 % en BIC, durée jusqu’à la fin du troisième trimestre.',
    h1: 'L’Acre du micro-entrepreneur en 2026 : droits, demande et gain réel',
    intro: 'L’aide n’arrive plus toute seule : il faut cocher une case de la liste, puis la réclamer à l’Urssaf avant l’échéance.',
    resume: `L’Acre réduit les cotisations sociales d’un micro-entrepreneur pendant ses premiers trimestres, mais depuis le 1er janvier 2026 elle n’est plus accordée d’office : il faut la demander à l’Urssaf dans les ${A.delai_demande_jours} jours qui suivent le début d’activité et appartenir à l’un des publics prévus par la loi de financement de la Sécurité sociale pour 2026, comme les demandeurs d’emploi indemnisés, les bénéficiaires du RSA ou de l’ASS, certains jeunes ou les créateurs installés en quartier prioritaire. Pour une activité démarrée à partir du 1er juillet 2026, le créateur paie ${FR.pct(partPayee, 0)} du taux normal : ${FR.pct(A.taux_acre_depuis.bic)} au lieu de ${FR.pct(P.micro.taux.bic)} pour une prestation de services artisanale ou commerciale, ${FR.pct(A.taux_acre_depuis.bnc)} au lieu de ${FR.pct(P.micro.taux.bnc)} en libéral. Un électricien qui encaisse ${FR.eur(24000)} pendant sa période d’Acre économise ainsi ${FR.eur(gainElec)}. L’avantage court jusqu’à la fin du troisième trimestre civil qui suit celui du démarrage.`,
    faqs: [
      { q: 'Dans quel délai faut-il demander l’Acre en 2026 ?', a: `La demande se dépose auprès de l’Urssaf dans les ${A.delai_demande_jours} jours qui suivent le début d’activité, selon l’Urssaf. Passé ce délai, l’aide est perdue pour cette création. Si l’Urssaf ne répond pas dans le mois, son silence vaut acceptation. Une demande faite trop tôt n’a pas de sens non plus : il faut une date de début d’activité, celle qui figure sur votre immatriculation.` },
      { q: 'Je suis au chômage indemnisé, ai-je droit à l’Acre ?', a: `Oui, le demandeur d’emploi indemnisé figure en tête des publics retenus depuis 2026, tout comme le demandeur non indemnisé inscrit six mois au cours des dix-huit derniers mois, et les bénéficiaires du RSA ou de l’ASS. Vous payez alors par exemple ${FR.pct(A.taux_acre_depuis.vente)} au lieu de ${FR.pct(P.micro.taux.vente)} en vente si vous démarrez après le 30 juin 2026. La demande reste à faire vous-même.` },
      { q: 'L’Acre est-elle perdue si je n’encaisse rien les premiers mois ?', a: `La période court dès la date de début d’activité, que vous facturiez ou non. Selon l’Urssaf, avoir demandé l’Acre la consomme même sans chiffre d’affaires, et on ne peut pas la redemander si on l’a déjà obtenue au cours des trois années précédentes. Un créateur qui démarre en septembre 2026 sans client avant décembre aura donc profité du taux réduit sur peu de mois.` },
      { q: 'Pourquoi le taux de l’Acre change-t-il au 1er juillet 2026 ?', a: `Les taux publiés par l’Urssaf dépendent de la date de début d’activité. Jusqu’au 30 juin 2026, un libéral non réglementé payait ${FR.pct(A.taux_acre_avant.bnc)} ; à partir du 1er juillet, il paie ${FR.pct(A.taux_acre_depuis.bnc)}, soit ${FR.pct(partPayee, 0)} du taux normal de ${FR.pct(P.micro.taux.bnc)}. Sur ${FR.eur(20000)} encaissés, l’écart entre les deux régimes atteint ${FR.eur(micro({ ca: 20000, activite: 'bnc', acre: 'depuis' }).cotisations - graphAcre.cotisations)}.` },
      { q: 'L’Acre donne-t-elle accès au versement de l’Arce par France Travail ?', a: `Oui, l’Arce est réservée aux bénéficiaires de l’Acre : France Travail verse alors en capital, en deux fois, une partie des droits à l’allocation chômage qui restent. L’autre voie consiste à garder une partie de l’allocation chaque mois en complément du chiffre d’affaires. Le choix se fait avec France Travail ; ce site ne calcule pas le montant de l’allocation.` },
      { q: 'Un indépendant au réel a-t-il la même Acre qu’un micro-entrepreneur ?', a: `Non. Au réel, l’Acre exonère un quart des cotisations maladie, indemnités journalières, allocations familiales, retraite de base et invalidité-décès, à condition que le revenu ne dépasse pas ${FR.eur(seuilReel)}, soit ${FR.pct(P.tns.acre.seuil_pass, 0)} du plafond de la Sécurité sociale. L’exonération diminue ensuite et disparaît à ${FR.eur(plafondReel)}, selon le barème 2026 de l’Urssaf.` },
    ],
    body: (h) => `
<h2>Ce que change la réforme de 2026</h2>
<p>Jusqu’en 2025, le créateur d’une micro-entreprise recevait l’aide sans rien faire. Ce n’est plus le cas : la loi de financement de la Sécurité sociale pour 2026 l’a transformée en droit à réclamer, réservé à des situations précises (${h.src('urssafAcre2026', 'Urssaf, nouvelles règles de l’Acre en 2026')}). Celui qui oublie de déposer sa demande dans les ${A.delai_demande_jours} jours cotise au taux plein dès le premier euro, même s’il remplissait toutes les conditions.</p>
<p>Le second changement porte sur l’ampleur de la réduction. Pour une activité commencée jusqu’au 30 juin 2026, les taux publiés par l’Urssaf restent très bas. À partir du 1er juillet 2026, service-public décrit un taux égal à ${h.pct(partPayee, 0)} du taux normal, autrement dit une exonération de ${h.pct(1 - partPayee, 0)} (${h.src('spAcre', 'fiche F11677')}).</p>

<h2>Les taux réduits, activité par activité</h2>
${h.table(['Activité', 'Taux normal', 'Acre, début jusqu’au 30 juin 2026', 'Acre, début depuis le 1er juillet 2026'],
  ACTIVITES.map((a) => [NOMS.fr[a], h.pct(P.micro.taux[a]), h.pct(A.taux_acre_avant[a]), h.pct(A.taux_acre_depuis[a])]),
  'Taux de cotisations d’un micro-entrepreneur bénéficiaire de l’Acre, hors CFP et taxe de chambre (Urssaf, 2026)', ['l', 'r', 'r', 'r'])}
<p>La contribution à la formation professionnelle et la taxe pour frais de chambre ne bénéficient d’aucune réduction : elles restent dues au taux habituel sur tout le chiffre d’affaires déclaré.</p>

<h2>Qui peut encore la demander</h2>
<p>La liste de l’Urssaf est fermée. En dehors d’elle, pas d’Acre, quel que soit le projet.</p>
<ul>
<li>demandeur d’emploi indemnisé, ou non indemnisé mais inscrit six mois au cours des dix-huit derniers mois ;</li>
<li>bénéficiaire du RSA ou de l’ASS ;</li>
<li>jeune de 18 à 25 ans révolus (jusqu’à 29 ans en situation de handicap), jeune de moins de 30 ans non indemnisé ou reconnu handicapé ;</li>
<li>salarié qui reprend une entreprise en sauvegarde, en redressement ou en liquidation judiciaire ;</li>
<li>titulaire d’un contrat d’appui au projet d’entreprise (Cape) ou bénéficiaire de la PreParE ;</li>
<li>créateur installé dans un quartier prioritaire de la ville (QPV) ou en zone France ruralités revitalisation (ZFRR ou ZFRR+).</li>
</ul>
<p>Une condition s’ajoute pour tout le monde : ne pas avoir obtenu l’Acre dans les trois années précédentes. Pour une société, le demandeur doit en plus en détenir le contrôle effectif, selon des règles de répartition du capital détaillées par l’Urssaf ; une micro-entreprise n’est pas concernée par ce point.</p>

<h2>Combien de mois dure le taux réduit</h2>
<p>L’Acre s’arrête au dernier jour du troisième trimestre civil qui suit le trimestre de démarrage. La durée réelle varie donc selon le mois de début : l’exemple officiel d’un démarrage le 3 septembre 2026 mène au ${h.date(finSept.iso)}, soit ${finSept.mois} mois, contre ${finJuil.mois} mois pour un démarrage en juillet.</p>
${h.table(['Début d’activité en 2026', 'Fin de l’Acre', 'Mois couverts, mois de début compris'],
  DEPARTS.map((m) => { const f = finAcre(m); return [MOIS_FR[m], h.date(f.iso), String(f.mois)]; }),
  'Durée de l’Acre selon le mois de début d’activité (règle de service-public, fiche F11677)', ['l', 'l', 'r'])}
<p>Démarrer au premier mois d’un trimestre donne la période la plus longue. Ce calendrier n’a d’intérêt que si les premières factures tombent vite : chaque mois sans encaissement est un mois d’Acre perdu.</p>

<h2>Deux créateurs, deux calculs</h2>
<h3>Un électricien qui démarre en septembre</h3>
<p>C’est le cas cité par service-public : une prestation artisanale en BIC, ${h.pct(A.taux_acre_depuis.bic)} au lieu de ${h.pct(P.micro.taux.bic)}. S’il encaisse ${h.eur(24000)} avant la fin de son Acre, ses cotisations tombent de ${h.eur(elecSans.cotisations)} à ${h.eur(elecAcre.cotisations)}, soit ${h.eur(gainElec)} de gagnés. Sa CFP de ${h.eur(elecAcre.cfp)} et sa taxe de chambre des métiers de ${h.eur(elecAcre.tfc)} ne changent pas.</p>
<h3>Une graphiste qui a démarré au printemps</h3>
<p>Installée en libéral avant le 30 juin 2026, elle relève de l’ancien barème : ${h.pct(A.taux_acre_avant.bnc)} au lieu de ${h.pct(P.micro.taux.bnc)}. Sur ${h.eur(20000)} encaissés pendant sa période d’Acre, elle verse ${h.eur(graphAcre.cotisations)} au lieu de ${h.eur(graphSans.cotisations)} : ${h.eur(gainGraph)} de moins. Une consœur qui ouvre en octobre, avec le même chiffre d’affaires, gagnera nettement moins.</p>

<h2>La démarche, pas à pas</h2>
<ol>
<li>Immatriculez l’activité sur le guichet unique : la date de début d’activité fixe le point de départ du délai. Le détail est sur ${h.a('creer-micro-entreprise', 'créer sa micro-entreprise')}.</li>
<li>Rassemblez la pièce qui prouve votre situation (attestation de France Travail, de RSA, de QPV…).</li>
<li>Déposez la demande à l’Urssaf avant le ${A.delai_demande_jours}<sup>e</sup> jour.</li>
<li>Sans réponse au bout d’un mois, considérez la demande comme acceptée, selon l’${h.src('aeEssentiel', 'Urssaf, autoentrepreneur.urssaf.fr')}.</li>
<li>Déclarez ensuite votre chiffre d’affaires comme d’habitude : le taux réduit s’applique sur l’échéance.</li>
</ol>

<h2>Au réel, une autre mécanique</h2>
<p>Un créateur en entreprise individuelle au réel ou gérant d’EURL ne reçoit pas un taux réduit sur son chiffre d’affaires mais une exonération d’un quart de certaines cotisations, totale jusqu’à ${h.eur(seuilReel)} de revenu, dégressive jusqu’à ${h.eur(plafondReel)} (${h.src('urssafTauxAC', 'barème Urssaf 2026')}). Le calcul complet se fait sur ${h.a('cotisations-tns', 'les cotisations TNS')}.</p>
<p>Ces montants restent des estimations ; l’Urssaf seule accorde l’aide et fixe ce que vous devez. Pour voir ce que donne votre première année entière, Acre comprise, passez par le ${h.a('home', 'simulateur auto-entrepreneur')}.</p>`,
  },
  en: {
    slug: 'acre-start-up-relief',
    nav: 'Acre start-up relief',
    card: 'Who still qualifies in 2026, how to apply and what it saves.',
    title: 'Acre start-up relief 2026: who qualifies and the rates',
    description: 'Acre start-up relief 2026 in France: apply within 60 days, then pay 15.9% instead of 21.2% on BIC services until the third calendar quarter after you start.',
    h1: 'Acre relief for new micro-entrepreneurs in 2026',
    intro: 'France no longer hands this relief to every new business: you must fit one of the listed situations and claim it yourself.',
    resume: `Acre (aide à la création ou à la reprise d’entreprise) is a temporary cut in the social contributions a new micro-entrepreneur pays to the Urssaf, the agency that collects them. Since 1 January 2026 it is no longer automatic: you have to apply within ${A.delai_demande_jours} days of your official start date and belong to one of the groups set by the 2026 social security budget law, for example jobseekers receiving unemployment benefit, people on RSA or ASS income support, some young founders, or people setting up in a priority urban neighbourhood. If your business starts on or after 1 July 2026 you pay ${EN.pct(partPayee, 0)} of the normal rate: ${EN.pct(A.taux_acre_depuis.bic)} instead of ${EN.pct(P.micro.taux.bic)} for craft or commercial services, ${EN.pct(A.taux_acre_depuis.bnc)} instead of ${EN.pct(P.micro.taux.bnc)} for freelance work. An electrician receiving ${EN.eur(24000)} during the relief period saves ${EN.eur(gainElec)}. The relief ends on the last day of the third calendar quarter after the quarter in which you started.`,
    faqs: [
      { q: 'I just moved to France and registered a micro-enterprise: can I get Acre?', a: `Only if you fit one of the situations on the Urssaf list, such as being registered with France Travail (the public employment service) and receiving benefit, or receiving RSA. Arriving in France is not a ground on its own. If you qualify, apply within ${A.delai_demande_jours} days of your start date; a month of silence from the Urssaf counts as approval.` },
      { q: 'How much lower are Acre contributions on freelance income?', a: `For an unregulated freelance activity (BNC) started on or after 1 July 2026, you pay ${EN.pct(A.taux_acre_depuis.bnc)} of turnover instead of ${EN.pct(P.micro.taux.bnc)}. A business started before that date paid ${EN.pct(A.taux_acre_avant.bnc)}. On ${EN.eur(20000)} received during the relief period, the newer rate saves ${EN.eur(graphSans.cotisations - micro({ ca: 20000, activite: 'bnc', acre: 'depuis' }).cotisations)}, according to Urssaf figures.` },
      { q: 'When does Acre stop if I start in September 2026?', a: `On ${dateEN(finSept.iso)}, the official service-public example: the relief runs to the end of the third calendar quarter after the one you start in, which is ${finSept.mois} months counting September. A July start also ends on ${dateEN(finJuil.iso)} and gives ${finJuil.mois} months. Your start date is the one on your registration, not your first invoice.` },
      { q: 'Does Acre reduce the training levy and chamber levy too?', a: `No. Acre only lowers the social contribution rate. The training levy (CFP, ${EN.pct(P.micro.cfp.artisan)} for a craftsperson) and the trades-chamber levy stay at their usual rates on all turnover. For an electrician on ${EN.eur(24000)}, those two levies still come to ${EN.eur(elecAcre.cfp + elecAcre.tfc)} over the period.` },
      { q: 'Can I lose Acre by applying too early in the year?', a: `In a sense, yes. The Urssaf states that once Acre is granted it is used up, even if you invoice nothing. The clock runs from your start date, and you cannot claim it again within three years. Registering months before your first client arrives therefore wastes part of the relief.` },
      { q: 'Is there a cash grant from France Travail with Acre?', a: `Yes, the Arce: France Travail pays part of your remaining unemployment benefit rights as a lump sum in two instalments, and only Acre recipients can choose it. The alternative is to keep receiving part of your monthly benefit alongside your turnover. This site does not estimate benefit amounts; France Travail sets them.` },
    ],
    body: (h) => `
<h2>From automatic to on request</h2>
<p>Until 2025, every new micro-entrepreneur got the relief without asking. The 2026 social security budget law ended that (${h.src('urssafAcre2026', 'Urssaf, Acre rules from 2026')}). Now the relief is a claim you file with the Urssaf within ${A.delai_demande_jours} days of starting, and only certain profiles are eligible. Miss the deadline and you pay the full rate from the first euro, even if you met every condition.</p>
<p>The size of the cut also changed mid-year. Businesses started up to 30 June 2026 keep the very low rates the Urssaf published for them. From 1 July 2026, service-public describes a rate equal to ${h.pct(partPayee, 0)} of the normal one, which is a ${h.pct(1 - partPayee, 0)} exemption (${h.src('spAcre', 'service-public sheet F11677')}).</p>

<h2>Reduced rates by type of activity</h2>
${h.table(['Activity', 'Normal rate', 'Acre, start up to 30 June 2026', 'Acre, start from 1 July 2026'],
  ACTIVITES.map((a) => [NOMS.en[a], h.pct(P.micro.taux[a]), h.pct(A.taux_acre_avant[a]), h.pct(A.taux_acre_depuis[a])]),
  'Micro-entrepreneur contribution rates with Acre, excluding training and chamber levies (Urssaf, 2026)', ['l', 'r', 'r', 'r'])}
<p>BIC (bénéfices industriels et commerciaux) covers commercial and craft services; BNC (bénéfices non commerciaux) covers unregulated freelance work such as consulting or design. The Cipav is the pension fund for a list of regulated professions, explained on ${h.a('auto-entrepreneur-cipav', 'the Cipav page')}.</p>

<h2>The eligible groups</h2>
<p>The Urssaf list is closed: if you are not on it, there is no Acre.</p>
<ul>
<li>jobseekers receiving benefit, or registered without benefit for six of the last eighteen months;</li>
<li>people receiving RSA (minimum income) or ASS (specific solidarity allowance);</li>
<li>young people aged 18 to 25 (29 with a disability), under-30s without benefit or with a recognised disability;</li>
<li>employees taking over a company in safeguard, receivership or liquidation proceedings;</li>
<li>holders of a Cape business support contract or recipients of PreParE parental benefit;</li>
<li>founders based in a priority urban neighbourhood (QPV) or a rural revitalisation zone (ZFRR or ZFRR+).</li>
</ul>
<p>Everyone must also not have had Acre in the previous three years. For companies, the applicant must hold effective control; that test does not concern a micro-enterprise, which is you as an individual.</p>

<h2>How long the relief lasts</h2>
<p>The relief ends on the last day of the third calendar quarter after your starting quarter, so its length depends on the month you start. The official example, a start on 3 September 2026, runs to ${h.date(finSept.iso)}: ${finSept.mois} months. A July start gives ${finJuil.mois} months.</p>
${h.table(['Start month in 2026', 'Acre ends', 'Months covered, start month included'],
  DEPARTS.map((m) => { const f = finAcre(m); return [MOIS_EN[m], h.date(f.iso), String(f.mois)]; }),
  'Length of Acre by start month (service-public rule, sheet F11677)', ['l', 'l', 'r'])}
<p>Starting in the first month of a quarter gives the longest window, but only helps if invoices come in early.</p>

<h2>Two founders, two results</h2>
<h3>An electrician starting in September</h3>
<p>This is the case service-public uses: a craft service under BIC, ${h.pct(A.taux_acre_depuis.bic)} instead of ${h.pct(P.micro.taux.bic)}. Receiving ${h.eur(24000)} before the relief ends, his contributions drop from ${h.eur(elecSans.cotisations)} to ${h.eur(elecAcre.cotisations)}, a saving of ${h.eur(gainElec)}. His training levy of ${h.eur(elecAcre.cfp)} and trades-chamber levy of ${h.eur(elecAcre.tfc)} are unchanged.</p>
<h3>A graphic designer who started in spring</h3>
<p>Registered as a freelancer before 30 June 2026, she keeps the earlier rate: ${h.pct(A.taux_acre_avant.bnc)} instead of ${h.pct(P.micro.taux.bnc)}. On ${h.eur(20000)} received during her relief period she pays ${h.eur(graphAcre.cotisations)} rather than ${h.eur(graphSans.cotisations)}, keeping ${h.eur(gainGraph)} more.</p>

<h2>Applying, step by step</h2>
<ol>
<li>Register on the guichet unique, the single online business registration portal; see ${h.a('creer-micro-entreprise', 'registering a micro-enterprise')}. Your start date there starts the clock.</li>
<li>Gather proof of your situation: a France Travail or RSA certificate, a QPV address, and so on.</li>
<li>File the Acre request with the Urssaf before day ${A.delai_demande_jours}.</li>
<li>No answer within a month means approval, says the ${h.src('aeEssentiel', 'Urssaf micro-entrepreneur site')}.</li>
<li>File your monthly or quarterly turnover returns as usual; the reduced rate is applied automatically.</li>
</ol>

<h2>On real profit, a different relief</h2>
<p>If you trade as a sole trader on real profit or as a managing partner of an EURL, Acre does not cut a turnover rate. It exempts a quarter of some contributions in full up to ${h.eur(seuilReel)} of income, tapering to nothing at ${h.eur(plafondReel)} (${h.src('urssafTauxAC', 'Urssaf 2026 rates')}). See ${h.a('cotisations-tns', 'self-employed contributions')}.</p>
<p>All figures here are estimates, not personal advice; only the Urssaf grants Acre and sets what you owe. To see your whole first year with the relief included, use the ${h.a('home', 'micro-enterprise calculator')}.</p>`,
  },
});
