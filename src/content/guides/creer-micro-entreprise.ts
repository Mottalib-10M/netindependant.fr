import { defineGuide } from '../../lib/guide-types';
import { micro, plafondProrata, seuilVL } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Calendrier de la première année, tiré du moteur (plafond proratisé, fin d'Acre).
const JOUR = 86400000;
const joursDepuis = (an: number, mois: number, jour = 1) => Math.round((Date.UTC(2027, 0, 1) - Date.UTC(an, mois - 1, jour)) / JOUR);
/** Fin de l'Acre : dernier jour du 3e trimestre civil suivant celui du début (service-public F11677). */
function finAcre(mois: number): string {
  const tFin = Math.floor((mois - 1) / 3) + 3;
  const an = 2026 + Math.floor(tFin / 4);
  const m = (tFin % 4) * 3 + 3;
  const j = new Date(Date.UTC(an, m, 0)).getUTCDate();
  return `${an}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
}
const MOIS = [1, 3, 5, 7, 9, 11];
const lignes = MOIS.map((m) => {
  const j = joursDepuis(2026, m);
  return { m, j, vente: plafondProrata('vente', j), services: plafondProrata('bnc', j), acre: finAcre(m) };
});
// Exemples officiels de service-public (F32353) : 31 janvier en vente, 1er mars en services.
const exVente = plafondProrata('vente', joursDepuis(2026, 1, 31));
const exServ = plafondProrata('bnc', joursDepuis(2026, 3, 1));
// Une graphiste en libéral qui démarre le 1er septembre 2026 et encaisse 12 000 € d'ici au 31 décembre.
const joursSept = joursDepuis(2026, 9, 1);
const caSept = 12000;
const caAnnualise = (caSept * 365) / joursSept;
const sousSeuilTva = caAnnualise <= P.tva.services.seuil;
const sansAcre = micro({ ca: caSept, activite: 'bnc' });
const avecAcre = micro({ ca: caSept, activite: 'bnc', acre: 'depuis' });
const gainAcre = sansAcre.cotisations - avecAcre.cotisations;
const avecVL = micro({ ca: caSept, activite: 'bnc', vl: true });
const vl1 = seuilVL(1, 2026);
const vl2027 = seuilVL(1, 2027);

export default defineGuide({
  id: 'creer-micro-entreprise',
  group: 'creation',
  order: 10,
  mini: 'premiereAnnee',
  related: ['devenir-auto-entrepreneur', 'acre-auto-entrepreneur', 'declarer-chiffre-affaires', 'plafond-micro-entreprise', 'versement-liberatoire', 'cfe-auto-entrepreneur'],
  sources: ['aeEssentiel', 'spPlafonds', 'spAcre', 'urssafAcre2026', 'spMicroImposition', 'spCfe'],
  fr: {
    slug: 'creer-sa-micro-entreprise',
    nav: 'Créer sa micro-entreprise',
    card: 'Les démarches de création, les choix à faire dès l’inscription et le calendrier de la première année.',
    title: 'Créer sa micro-entreprise en 2026 : démarches et calendrier',
    description: 'Créer sa micro-entreprise en 2026 : inscription au guichet unique, Acre à demander sous 60 jours, plafond proratisé la première année, CFE nulle l’an un.',
    h1: 'Créer sa micro-entreprise : les démarches et la première année',
    intro: 'Une inscription en ligne, deux options à trancher tout de suite et un calendrier de première année qui ne ressemble à aucun autre.',
    resume: `Créer sa micro-entreprise en 2026 passe par une déclaration de début d’activité en ligne sur le guichet unique des formalités des entreprises, à l’issue de laquelle vous recevez un justificatif d’immatriculation. Trois décisions se prennent au moment de l’inscription ou juste après. L’Acre, l’allègement de cotisations du début d’activité, n’est plus automatique : il faut la demander à l’Urssaf dans les ${P.micro.acre.delai_demande_jours} jours qui suivent le démarrage, et seuls certains profils y ont droit. Le versement libératoire de l’impôt se choisit à la création ou jusqu’au dernier jour du troisième mois qui suit. Enfin, la fréquence des déclarations, mensuelle ou trimestrielle. La première année a ses propres règles : le plafond de chiffre d’affaires est calculé au prorata des jours d’activité, ${FR.eur(exServ)} pour des services commencés le 1er mars 2026 au lieu de ${FR.eur(P.micro.plafonds.services)}, et la cotisation foncière des entreprises n’est pas due l’année de création. Ces montants sont des estimations : l’Urssaf et l’administration fiscale fixent ce que vous devez réellement.`,
    faqs: [
      { q: 'Combien de jours ai-je pour demander l’Acre après avoir créé ma micro-entreprise ?', a: `${P.micro.acre.delai_demande_jours} jours à compter du début d’activité, depuis la loi de financement de la Sécurité sociale pour 2026. Passé ce délai, l’allègement est perdu. Il est réservé à certains profils, par exemple un demandeur d’emploi indemnisé ou une personne de 18 à 25 ans. Un mois de silence de l’Urssaf vaut acceptation, et la demande consomme le droit même si vous n’encaissez rien ensuite.` },
      { q: 'Quel plafond de chiffre d’affaires s’applique si je crée en cours d’année ?', a: `Le plafond annuel est réduit au prorata des jours d’activité : seuil multiplié par le nombre de jours, divisé par 365. Service-public donne deux exemples : création le 31 janvier 2026 en vente, ${FR.eur(exVente)} ; début le 1er mars 2026 en services, ${FR.eur(exServ)}. Les années suivantes, le seuil plein revient, ${FR.eur(P.micro.plafonds.services)} pour les services.` },
      { q: 'Peut-on choisir le versement libératoire après l’inscription ?', a: `Oui, jusqu’au dernier jour du troisième mois qui suit la création. Au-delà, l’option ne prend effet que l’année suivante, à condition de la demander avant le 30 septembre. Il faut aussi que le revenu fiscal de référence de 2024 ne dépasse pas ${FR.eur(vl1)} par part pour une option en 2026, selon le simulateur de l’Urssaf, et ${FR.eur(vl2027)} pour une option prenant effet en 2027.` },
      { q: 'Paie-t-on la CFE l’année où l’on crée sa micro-entreprise ?', a: `Non. La cotisation foncière des entreprises n’est pas due l’année de création. L’année suivante, sa base est réduite de ${FR.pct(P.cfe.reduction_annee_2, 0)}. Ensuite, si le chiffre d’affaires de l’avant-dernière année ne dépasse pas ${FR.eur(P.cfe.exoneration_ca)}, vous en êtes exonéré, ce seuil étant proratisé si vous avez créé en cours d’année. L’avis arrive dans l’espace professionnel du site impots.gouv.fr.` },
      { q: 'Quand tombe la toute première déclaration de chiffre d’affaires ?', a: `Au plus tôt quatre-vingt-dix jours après le début d’activité, selon l’Urssaf. Les déclarations suivantes reviennent chaque mois ou chaque trimestre selon votre choix, en ligne. Si vous n’avez rien encaissé, vous déclarez quand même un montant nul et ne payez rien. Les cotisations calculées sont définitives : aucune régularisation n’arrive l’année suivante.` },
      { q: 'Mon nouveau statut de micro-entrepreneur peut-il être remis en cause dès la deuxième année ?', a: `Non. Le régime micro s’applique automatiquement l’année de création et l’année suivante. La vérification des seuils commence la troisième année : il faut alors que le chiffre d’affaires de l’une des deux années précédentes soit resté sous le plafond, ${FR.eur(P.micro.plafonds.services)} en services ou ${FR.eur(P.micro.plafonds.vente)} en vente. Deux dépassements consécutifs font sortir du régime au 1er janvier suivant.` },
    ],
    body: (h) => `
<h2>Les démarches, dans l’ordre</h2>
<p>La création se fait entièrement en ligne. On déclare le début d’activité sur le guichet unique des formalités des entreprises, le point d’entrée en ligne commun à toutes les entreprises. On y indique la nature de l’activité, ce qui détermine la catégorie fiscale et sociale : vente de marchandises, prestation commerciale ou artisanale, activité libérale. À la fin, un justificatif d’immatriculation est délivré, avec le numéro qui identifiera l’entreprise sur les factures et auprès de l’administration.</p>
<p>Le choix de la catégorie n’est pas un détail administratif : il fixe le taux de cotisations pour toute la durée de l’activité. En 2026, ${h.pct(P.micro.taux.vente)} pour la vente, ${h.pct(P.micro.taux.bic)} pour les prestations commerciales ou artisanales, ${h.pct(P.micro.taux.bnc)} pour le libéral non réglementé (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Si votre activité mélange plusieurs natures, le détail des seuils est sur ${h.a('plafond-micro-entreprise', 'la page des plafonds')}.</p>
<ol>
<li>Déclarer le début d’activité sur le guichet unique et conserver le justificatif.</li>
<li>Si vous remplissez l’une des conditions, demander l’Acre à l’Urssaf dans les ${h.num(P.micro.acre.delai_demande_jours)} jours.</li>
<li>Décider du versement libératoire avant la fin du troisième mois suivant la création.</li>
<li>Choisir une déclaration mensuelle ou trimestrielle.</li>
<li>Porter sur chaque facture la mention « TVA non applicable, art. 293 B du CGI » tant que vous restez en franchise.</li>
</ol>

<h2>Le calendrier de la première année selon le mois de démarrage</h2>
<p>Commencer en janvier ou en novembre ne donne pas les mêmes limites. Le plafond se calcule sur les jours réellement couverts (${h.src('spPlafonds', 'service-public, fiche F32353')}), et la période d’Acre court jusqu’à la fin du troisième trimestre civil qui suit celui du début (${h.src('spAcre', 'service-public, fiche F11677')}). Le tableau suppose un démarrage le premier jour du mois.</p>
${h.table(['Début d’activité', 'Jours en 2026', 'Plafond vente', 'Plafond services', 'Acre éventuelle jusqu’au'], lignes.map((x) => [h.date(`2026-${String(x.m).padStart(2, '0')}-01`), h.num(x.j), h.eur(x.vente), h.eur(x.services), h.date(x.acre)]), 'Plafonds proratisés de la micro-entreprise en 2026 et fin de la période d’Acre, selon la date de début', ['l', 'r', 'r', 'r', 'r'])}
<p>Un démarrage tardif réduit fortement le plafond de l’année : il faut en tenir compte si un gros contrat est déjà signé. À l’inverse, l’Acre dure plus longtemps en mois pour une activité lancée en début de trimestre. L’exemple officiel : début le 3 septembre 2026, allègement jusqu’au ${h.date('2027-06-30')}, soit dix mois.</p>

<h2>Un cas complet : une graphiste qui se lance le 1er septembre</h2>
<p>Elle exerce en libéral et encaisse ${h.eur(caSept)} entre septembre et décembre. Sa première déclaration ne pourra pas intervenir avant quatre-vingt-dix jours d’activité. Sans Acre, ses cotisations sur la période atteignent ${h.eur(sansAcre.cotisations)}. Si elle remplit une condition et dépose sa demande à temps, le taux minoré applicable aux débuts d’activité depuis le 1er juillet 2026, ${h.pct(P.micro.acre.taux_acre_depuis.bnc)}, ramène ce montant à ${h.eur(avecAcre.cotisations)}, soit ${h.eur(gainAcre)} d’économie sur quatre mois.</p>
<p>Pour la TVA, son chiffre d’affaires se ramène à une année pleine : ${h.eur(caSept)} × 365 / ${h.num(joursSept)} jours donne ${h.eur(caAnnualise)}, ${sousSeuilTva ? 'sous le' : 'au-dessus du'} seuil de franchise des services de ${h.eur(P.tva.services.seuil)}. ${sousSeuilTva ? 'Elle reste donc en franchise et facture sans TVA.' : 'Elle doit donc vérifier sa situation au regard de la TVA.'} Si elle opte pour le versement libératoire, elle ajoute ${h.eur(avecVL.vl)} d’impôt à ses paiements de la période, au taux de ${h.pct(P.micro.vl.bnc)}. Enfin, aucune CFE pour 2026.</p>

<h2>L’Acre : à demander, plus à attendre</h2>
<p>Jusqu’en 2025, beaucoup de créateurs la recevaient sans rien faire. Depuis le 1er janvier 2026, elle se demande, et seulement si l’on fait partie des publics visés : demandeur d’emploi indemnisé, demandeur non indemnisé inscrit six mois au cours des dix-huit derniers, bénéficiaire du RSA ou de l’ASS, jeune de 18 à 25 ans révolus (29 ans en cas de handicap), créateur installé dans un quartier prioritaire ou en zone France ruralités revitalisation, entre autres (${h.src('urssafAcre2026', 'Urssaf, nouvelles règles de l’Acre')}). Il ne faut pas en avoir bénéficié dans les trois années précédentes. Le détail des taux est sur ${h.a('acre-auto-entrepreneur', 'la page consacrée à l’Acre')}.</p>

<h2>Le versement libératoire : une fenêtre courte</h2>
<p>Cette option remplace l’impôt sur le revenu calculé au barème par un pourcentage du chiffre d’affaires payé avec les cotisations. Elle se choisit à l’inscription ou dans les trois mois qui suivent (${h.src('spMicroImposition', 'service-public, fiche F23267')}). Elle n’est ouverte que si le revenu fiscal de référence ne dépasse pas ${h.eur(vl1)} par part pour 2026. Pour savoir si elle vous fait gagner quelque chose, la comparaison chiffrée est sur ${h.a('versement-liberatoire', 'versement libératoire')}.</p>

<h2>La CFE, deux ans de répit partiel</h2>
<p>La cotisation foncière des entreprises vise tous les entrepreneurs, y compris ceux qui travaillent chez eux. L’année de création, elle n’est pas due ; la suivante, la base est réduite de ${h.pct(P.cfe.reduction_annee_2, 0)} (${h.src('spCfe', 'service-public, fiche F23547')}). Le montant dépend de la commune : ${h.a('cfe-auto-entrepreneur', 'l’outil CFE')} le calcule pour la vôtre.</p>

<h2>Les cotisations minimales, une option à connaître</h2>
<p>Par défaut, un petit chiffre d’affaires donne de petites cotisations, et donc peu de droits. On peut demander à l’Urssaf, avant la fin du troisième mois suivant la création, à cotiser sur une base minimale : le calcul bascule alors sur celui d’un travailleur indépendant classique. Ce site ne modélise pas cette option.</p>
<p>Tous ces montants sont des estimations établies avec les paramètres publiés pour 2026. Ils ne remplacent pas un conseil personnalisé ; l’Urssaf et le service des impôts fixent les sommes dues. Pour la suite, voyez ${h.a('declarer-chiffre-affaires', 'comment déclarer son chiffre d’affaires')} et ${h.a('devenir-auto-entrepreneur', 'quel chiffre d’affaires viser')}.</p>`,
  },
  en: {
    slug: 'register-a-micro-enterprise',
    nav: 'Registering a micro-enterprise',
    card: 'How registration works, the options to settle early and what your first year looks like.',
    title: 'Register a micro-enterprise in 2026: steps and first year',
    description: 'Register a micro-enterprise in France in 2026: online filing, Acre relief to request within 60 days, a pro-rated turnover ceiling and no CFE in year one.',
    h1: 'Registering a micro-enterprise: the steps and your first year',
    intro: 'One online filing, two options you must settle almost at once, and a first year that follows its own rules.',
    resume: `To register as a micro-entrepreneur in France in 2026, the simplified self-employed status also called auto-entrepreneur, you file a start-of-business declaration online on the guichet unique, the single government portal for business formalities, and receive proof of registration with your company number, the Siret. A few choices follow almost immediately. Acre, the start-up relief on social contributions, is no longer automatic: you must apply to the Urssaf, the body that collects contributions, within ${P.micro.acre.delai_demande_jours} days of starting, and only certain profiles qualify. The versement libératoire, a flat-rate income tax paid with your contributions, must be chosen at registration or by the last day of the third month afterwards. You also pick monthly or quarterly returns. The first year has its own ceiling, pro-rated to the days you trade: ${EN.eur(exServ)} for services started on 1 March 2026 instead of ${EN.eur(P.micro.plafonds.services)}. No CFE, the local business tax, is charged for the year you start. These figures are estimates; the Urssaf and the tax office set what you actually owe.`,
    faqs: [
      { q: 'What is the deadline to apply for Acre relief after registering?', a: `${P.micro.acre.delai_demande_jours} days from the start of trading, under the 2026 social security financing act. Miss it and the relief is gone. Only certain people qualify, for example a jobseeker receiving benefits or someone aged 18 to 25. If the Urssaf does not reply within a month, the application is accepted, and applying uses up your entitlement even if you then earn nothing.` },
      { q: 'Is the turnover ceiling lower if I start part-way through 2026?', a: `Yes. The annual ceiling is multiplied by your days of trading and divided by 365. Service-public gives two examples: a sales business started on 31 January 2026 gets ${EN.eur(exVente)}; services started on 1 March 2026 get ${EN.eur(exServ)}. From the following year the full ceiling applies, ${EN.eur(P.micro.plafonds.services)} for services.` },
      { q: 'Can a new micro-entrepreneur opt into the flat-rate tax after registration?', a: `Yes, until the last day of the third month after you start. Later than that, the option only applies from the next year and must be requested before 30 September. Your household reference income for 2024 must also be at most ${EN.eur(vl1)} per tax share for 2026, according to the Urssaf calculator, and ${EN.eur(vl2027)} for an option starting in 2027.` },
      { q: 'Do I owe the CFE local business tax in my first year of trading?', a: `No. The CFE is not charged for the year the business starts. The following year its base is cut by ${EN.pct(P.cfe.reduction_annee_2, 0)}. After that, if turnover two years earlier was ${EN.eur(P.cfe.exoneration_ca)} or less, you are exempt, with that limit pro-rated if you started mid-year. The tax notice appears in your professional account on impots.gouv.fr, the French tax website.` },
      { q: 'When is my very first Urssaf turnover return due?', a: `No earlier than ninety days after you start trading, according to the Urssaf. After that, returns come monthly or quarterly as you chose, filed online. If nothing came in, you still file a zero return and pay nothing. The contributions calculated are final: unlike other self-employed regimes, there is no adjustment the following year.` },
      { q: 'Could I be pushed out of the micro scheme in my second year?', a: `No. The micro scheme applies automatically in the year you start and the year after. Thresholds are checked from the third year: turnover in one of the two previous years must have stayed under the ceiling, ${EN.eur(P.micro.plafonds.services)} for services or ${EN.eur(P.micro.plafonds.vente)} for sales. Going over two years in a row takes you out on the following 1 January.` },
    ],
    body: (h) => `
<h2>The registration steps, in order</h2>
<p>Everything happens online. You declare the start of your business on the guichet unique des formalités des entreprises, the single online portal for all business formalities. You describe what you do, and that description sets your tax and social category: selling goods, commercial or craft services, or a liberal profession (the French term for independent professional services such as consulting, design or coaching). At the end you get proof of registration and the Siret number that identifies the business on invoices and in dealings with the authorities.</p>
<p>That category matters more than it looks, because it fixes your contribution rate for as long as you trade. In 2026 it is ${h.pct(P.micro.taux.vente)} for sales, ${h.pct(P.micro.taux.bic)} for commercial or craft services and ${h.pct(P.micro.taux.bnc)} for unregulated liberal professions (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). If you mix several kinds of work, see ${h.a('plafond-micro-entreprise', 'the turnover ceilings page')}.</p>
<ol>
<li>File the start of business on the guichet unique and keep the proof of registration.</li>
<li>If you meet one of the conditions, apply to the Urssaf for Acre within ${h.num(P.micro.acre.delai_demande_jours)} days.</li>
<li>Decide on the flat-rate income tax before the end of the third month.</li>
<li>Choose monthly or quarterly turnover returns.</li>
<li>Write « TVA non applicable, art. 293 B du CGI » on every invoice while you stay below the VAT threshold. It tells clients you are exempt from charging VAT.</li>
</ol>

<h2>Your first-year calendar by start month</h2>
<p>Starting in January or in November leads to different limits. The ceiling covers only the days you actually trade (${h.src('spPlafonds', 'service-public, sheet F32353')}), and any Acre relief runs to the end of the third calendar quarter after the one in which you start (${h.src('spAcre', 'service-public, sheet F11677')}). The table assumes you start on the first day of the month.</p>
${h.table(['Start of trading', 'Days in 2026', 'Sales ceiling', 'Services ceiling', 'Any Acre until'], lignes.map((x) => [h.date(`2026-${String(x.m).padStart(2, '0')}-01`), h.num(x.j), h.eur(x.vente), h.eur(x.services), h.date(x.acre)]), 'Pro-rated micro-enterprise ceilings in 2026 and end of the Acre period, by start date', ['l', 'r', 'r', 'r', 'r'])}
<p>A late start shrinks the first-year ceiling a lot, which matters if you already have a large contract lined up. The relief, on the other hand, lasts more months when you start early in a quarter. The official example: starting on 3 September 2026 gives relief until ${h.date('2027-06-30')}, ten months in all.</p>

<h2>A worked case: a graphic designer starting on 1 September</h2>
<p>She works as a liberal profession and receives ${h.eur(caSept)} between September and December. Her first return cannot be filed before ninety days of trading. Without Acre, her contributions for the period come to ${h.eur(sansAcre.cotisations)}. If she qualifies and applies in time, the reduced rate for businesses started from 1 July 2026, ${h.pct(P.micro.acre.taux_acre_depuis.bnc)}, brings that down to ${h.eur(avecAcre.cotisations)}, a saving of ${h.eur(gainAcre)} over four months.</p>
<p>For VAT (TVA in French), her turnover is scaled up to a full year: ${h.eur(caSept)} × 365 / ${h.num(joursSept)} days gives ${h.eur(caAnnualise)}, ${sousSeuilTva ? 'below' : 'above'} the services exemption threshold of ${h.eur(P.tva.services.seuil)}. ${sousSeuilTva ? 'She therefore stays exempt and invoices without VAT.' : 'She therefore needs to check her VAT position.'} If she chooses the flat-rate income tax, she adds ${h.eur(avecVL.vl)} of tax to her payments for the period, at ${h.pct(P.micro.vl.bnc)}. And she owes no CFE for 2026.</p>

<h2>Acre: you now have to ask for it</h2>
<p>Until 2025 many founders received it without doing anything. Since 1 January 2026 you must apply, and only if you belong to one of the groups listed: jobseekers receiving unemployment benefit, unpaid jobseekers registered for six of the last eighteen months, people on RSA or ASS (French minimum income benefits), people aged 18 to 25 (29 with a disability), founders in a priority urban district or a designated rural revitalisation zone, among others (${h.src('urssafAcre2026', 'Urssaf, the new Acre rules')}). You must not have had Acre in the previous three years. Rates are on ${h.a('acre-auto-entrepreneur', 'the Acre page')}.</p>

<h2>The flat-rate tax option: a narrow window</h2>
<p>This option swaps income tax on the progressive scale for a percentage of turnover, paid with your contributions. It can be chosen at registration or within three months (${h.src('spMicroImposition', 'service-public, sheet F23267')}), and only if your household reference income, the revenu fiscal de référence shown on your French tax notice, is at most ${h.eur(vl1)} per share for 2026. If you have just arrived and have no French tax notice yet, check your position with the tax office before opting. The figures are compared on ${h.a('versement-liberatoire', 'the flat-rate tax page')}.</p>

<h2>CFE: two years of partial relief</h2>
<p>The CFE, cotisation foncière des entreprises, applies to every business owner, even one working from home. It is not charged for the year you start; the following year the base is halved (${h.src('spCfe', 'service-public, sheet F23547')}). The amount depends on your commune, the local authority: ${h.a('cfe-auto-entrepreneur', 'the CFE tool')} estimates it for yours.</p>

<h2>Minimum contributions, an option worth knowing</h2>
<p>By default, low turnover means low contributions and therefore few benefit rights. You can ask the Urssaf, before the end of the third month after you start, to pay on a minimum base instead; your contributions are then calculated like those of other self-employed people. This site does not model that option.</p>
<p>All amounts here are estimates built on the published 2026 parameters, not personal advice; the Urssaf and the tax office decide what is due. Next, read ${h.a('declarer-chiffre-affaires', 'how turnover returns work')} and ${h.a('devenir-auto-entrepreneur', 'how much turnover you need')}.</p>`,
  },
});
