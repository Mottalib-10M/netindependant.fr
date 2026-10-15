import { defineGuide } from '../../lib/guide-types';
import { enPortage, enMicro } from '../../lib/engine/statuts';
import { portage } from '../../lib/engine/portage';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main). Les frais de gestion du portage n'ont aucun
// barème officiel : 5 % et 10 % sont deux hypothèses de saisie, pas des moyennes.
const FG_BAS = 0.05, FG_HAUT = 0.1;
const cas = [[300, 160], [400, 180], [500, 180]].map(([tjm, j]) => {
  const ca = tjm * j;
  const m = enMicro({ ca, charges: 0, activite: 'bnc' });
  return { tjm, j, ca, m, bas: enPortage({ ca, charges: 0, activite: 'bnc', fraisPortage: FG_BAS }), haut: enPortage({ ca, charges: 0, activite: 'bnc', fraisPortage: FG_HAUT }) };
});
const [c300, c400, c500] = cas;
// Chiffre d'affaires annuel à partir duquel le salaire porté atteint le minimum légal (pas de 100 €).
const caMinimum = (fg: number) => { let ca = 0; while (ca < 200000 && (ca === 0 || portage(ca, fg).sousMinimum)) ca += 100; return ca; };
const minBas = caMinimum(FG_BAS), minHaut = caMinimum(FG_HAUT);
// Coût d'un point de frais de gestion sur 72 000 € de chiffre d'affaires.
const p7 = enPortage({ ca: c400.ca, charges: 0, activite: 'bnc', fraisPortage: 0.07 });
const p8 = enPortage({ ca: c400.ca, charges: 0, activite: 'bnc', fraisPortage: 0.08 });
const unPoint = (p7.netMensuel - p8.netMensuel) * 12;
const joursPlafond400 = Math.floor(P.micro.plafonds.services / 400);
const ecart300 = c300.m.netMensuel - c300.bas.netMensuel, ecart400 = c400.m.netMensuel - c400.bas.netMensuel;

export default defineGuide({
  id: 'portage-ou-auto-entrepreneur',
  group: 'freelance',
  order: 30,
  mini: 'portageVsMicro',
  miniHref: 'portage-salarial',
  related: ['portage-salarial', 'statut-freelance', 'micro-entreprise', 'auto-entrepreneur-liberal', 'tjm-freelance', 'plafond-micro-entreprise'],
  sources: ['spPortage', 'monEntreprise', 'aeEssentiel', 'spPlafonds'],
  fr: {
    slug: 'portage-salarial-ou-auto-entrepreneur',
    nav: 'Portage ou auto-entrepreneur',
    card: 'Même TJM, deux nets : l’écart chiffré et ce qu’il achète.',
    title: 'Portage salarial ou auto-entrepreneur 2026 : quel net garder',
    description: 'Portage salarial ou auto-entrepreneur 2026 : net mensuel comparé pour un même TJM, frais de gestion à saisir, plafond de 83 600 € et salaire minimum du porté.',
    h1: 'Portage salarial ou micro-entreprise : le même TJM, deux revenus',
    intro: 'Le portage transforme votre chiffre d’affaires en salaire de cadre ; la micro-entreprise le taxe directement. Voici l’écart, mission par mission.',
    resume: `À tarif égal, la micro-entreprise laisse plus d’argent que le portage salarial, parce que le salaire porté supporte les cotisations patronales et salariales d’un cadre, en plus des frais de gestion de la société de portage. À ${FR.eur(400)} par jour sur ${FR.num(180)} jours, soit ${FR.eur(c400.ca)} de chiffre d’affaires, un consultant seul garde ${FR.eur(c400.m.netMensuel)} par mois après impôt en micro-entreprise libérale, contre ${FR.eur(c400.bas.netMensuel)} en portage avec ${FR.pct(FG_BAS, 0)} de frais de gestion et ${FR.eur(c400.haut.netMensuel)} avec ${FR.pct(FG_HAUT, 0)}. Ces taux de frais sont des hypothèses : chaque société de portage fixe les siens par contrat et aucun barème officiel n’existe. L’écart achète un statut de salarié, des cotisations de retraite plus fortes et l’assurance chômage. Il a aussi des limites dans l’autre sens : la micro-entreprise ne tient que sous le plafond de ${FR.eur(P.micro.plafonds.services)} de chiffre d’affaires, et le portage exige un salaire brut d’au moins ${FR.eur(P.portage.minimum_brut_mensuel, 2)} par mois, que la mission doit financer.`,
    faqs: [
      { q: 'À partir de quel chiffre d’affaires le portage salarial devient-il possible ?', a: `Il faut que la mission finance le salaire brut minimal de ${FR.eur(P.portage.minimum_brut_mensuel, 2)} par mois fixé pour les portés. Selon nos calculs, cela demande environ ${FR.eur(minBas)} de chiffre d’affaires annuel avec ${FR.pct(FG_BAS, 0)} de frais de gestion, et ${FR.eur(minHaut)} avec ${FR.pct(FG_HAUT, 0)}. En dessous, la micro-entreprise reste la seule des deux formules ouverte.` },
      { q: 'Combien coûte un point de frais de gestion en portage salarial ?', a: `Sur ${FR.eur(c400.ca)} facturés dans l’année, passer de ${FR.pct(0.07, 0)} à ${FR.pct(0.08, 0)} de frais retire environ ${FR.eur(unPoint)} de revenu net après impôt au salarié porté, soit ${FR.eur(unPoint / 12)} par mois. Les frais étant libres, comparez les contrats sur ce qu’ils incluent et sur leur taux, sans vous fier à un taux présenté comme habituel.` },
      { q: 'Le portage prend-il le relais quand on dépasse le plafond micro ?', a: `Il peut. Le plafond de ${FR.eur(P.micro.plafonds.services)} est une règle de la micro-entreprise : le dépasser deux années de suite fait sortir du régime, selon service-public. Le portage salarial ne dépend pas de ce seuil. À ${FR.eur(400)} par jour, le plafond correspond à ${FR.num(joursPlafond400)} jours facturés ; au-delà, portage, entreprise individuelle au réel ou société deviennent les options.` },
      { q: 'Pourquoi l’écart entre portage et micro grandit-il avec le TJM ?', a: `Parce que les cotisations du salarié porté et les frais de gestion sont proportionnels au chiffre d’affaires, alors que la micro-entreprise libérale cotise à ${FR.pct(P.micro.taux.bnc)}. À ${FR.eur(300)} par jour sur ${FR.num(160)} jours, l’écart mensuel est de ${FR.eur(ecart300)} avec ${FR.pct(FG_BAS, 0)} de frais ; à ${FR.eur(400)} sur ${FR.num(180)} jours, il atteint ${FR.eur(ecart400)}.` },
      { q: 'Peut-on comparer portage et micro sans connaître ses frais de gestion ?', a: `Seulement par fourchette. Aucun texte ne fixe ces frais, ils figurent dans chaque contrat de portage. Le mini-simulateur part de ${FR.pct(0.08, 0)} pour illustrer ; testez plusieurs valeurs. À ${FR.eur(400)} par jour sur ${FR.num(180)} jours, passer de ${FR.pct(FG_BAS, 0)} à ${FR.pct(FG_HAUT, 0)} change le net mensuel de ${FR.eur(c400.bas.netMensuel - c400.haut.netMensuel)}.` },
    ],
    body: (h) => `
<h2>Deux mécaniques opposées</h2>
<p>En micro-entreprise, vous facturez vous-même, et l’Urssaf prélève un pourcentage du chiffre d’affaires encaissé : ${h.pct(P.micro.taux.bnc)} pour une activité libérale non réglementée en 2026 (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Le reste, après impôt, est à vous. En portage salarial, c’est la société de portage qui facture votre client. Elle retient ses frais de gestion, puis consacre le solde à votre salaire : cotisations patronales, cotisations salariales, et enfin le net (${h.src('spPortage', 'service-public, fiche F31620')}). Le salarié porté relève toujours de la catégorie cadre.</p>
<p>La différence de net vient donc de deux postes : les frais de gestion, qui n’existent pas en micro, et des cotisations sociales plus lourdes, car le salaire d’un cadre finance davantage de risques. L’impôt sur le revenu joue aussi : le salaire bénéficie d’un abattement de ${h.pct(P.ir.abattement_salaires.taux, 0)}, le chiffre d’affaires libéral de ${h.pct(P.micro.abattement.bnc, 0)}.</p>

<h2>Trois missions comparées</h2>
<p>Les chiffres ci-dessous sont calculés par le moteur pour une personne seule sans autre revenu, sans frais professionnels. Le passage du salaire au net suit une grille calculée avec le ${h.src('monEntreprise', 'modèle publié par l’Urssaf')}. Les deux taux de frais de gestion sont des hypothèses de saisie, choisies pour encadrer le calcul : aucun barème officiel ne les fixe.</p>
${h.table(['Mission', 'Chiffre d’affaires', 'Portage, frais ' + h.pct(FG_BAS, 0), 'Portage, frais ' + h.pct(FG_HAUT, 0), 'Micro-entreprise libérale'], cas.map((c) => [`${h.eur(c.tjm)} × ${h.num(c.j)} jours`, h.eur(c.ca), h.eur(c.bas.netMensuel), h.eur(c.haut.netMensuel), c.m.possible ? h.eur(c.m.netMensuel) : 'plafond dépassé']), 'Net mensuel après impôt sur le revenu en 2026, personne seule', ['l', 'r', 'r', 'r', 'r'])}
<p>À ${h.eur(500)} par jour sur ${h.num(180)} jours, le chiffre d’affaires de ${h.eur(c500.ca)} dépasse le ${h.a('plafond-micro-entreprise', 'plafond de la micro-entreprise')} : une année isolée est tolérée, deux années consécutives font basculer au régime réel (${h.src('spPlafonds', 'service-public, fiche F32353')}). Le portage, lui, continue de fonctionner, avec ${h.eur(c500.bas.netMensuel)} par mois dans l’hypothèse basse de frais.</p>

<h2>Ce que l’écart achète</h2>
<p>Le salarié porté n’est pas un indépendant. Son salaire supporte les contributions d’assurance chômage, une retraite complémentaire de cadre et la prévoyance, que la micro-entreprise ne finance pas. Sur une mission à ${h.eur(400)} par jour, la protection supplémentaire coûte ${h.eur(ecart400)} de net par mois avec ${h.pct(FG_BAS, 0)} de frais. C’est ce montant qu’il faut mettre en regard de la valeur que vous accordez à ces garanties.</p>
<p>Le contrat de portage prévoit aussi, en CDI, une réserve financière égale à ${h.pct(P.portage.reserve_financiere, 0)} du salaire de base de la dernière mission, destinée aux périodes sans client, et la rémunération inclut une prime d’apport d’affaires de ${h.pct(P.portage.apport_affaires, 0)}. Ces mécanismes lissent un peu les creux, ce que la micro-entreprise ne fait pas : sans encaissement, rien n’est dû, mais rien n’est versé non plus.</p>

<h2>Le seuil d’entrée du portage</h2>
<p>Le portage salarial n’est pas ouvert à tout chiffre d’affaires. La rémunération brute du porté ne peut pas descendre sous ${h.eur(P.portage.minimum_brut_mensuel, 2)} par mois. Avec nos deux hypothèses de frais, la mission doit rapporter au moins ${h.eur(minBas)} par an à ${h.pct(FG_BAS, 0)}, ${h.eur(minHaut)} à ${h.pct(FG_HAUT, 0)}. Une activité qui démarre doucement, avec quelques jours par mois, ne remplit pas cette condition et relève plutôt de la ${h.a('micro-entreprise', 'micro-entreprise')}.</p>
<p>Le porté doit également justifier d’une qualification ou d’une expérience minimale et trouver lui-même ses clients ; les conditions détaillées et le chemin complet de l’argent sont sur le ${h.a('portage-salarial', 'simulateur de portage salarial')}.</p>

<h2>Choisir selon votre situation</h2>
<p>Le portage convient à qui veut tester une activité d’indépendant sans quitter le salariat, avec un chiffre d’affaires suffisant pour atteindre le salaire minimal. La micro-entreprise convient à un démarrage progressif ou à une activité dont le chiffre d’affaires reste sous le plafond, et elle laisse davantage de net. Entre les deux, d’autres cadres existent : le ${h.a('statut-freelance', 'guide du statut freelance')} les met côte à côte, et la page ${h.a('auto-entrepreneur-liberal', 'auto-entrepreneur en profession libérale')} détaille le régime micro des consultants.</p>
<p>Les montants affichés sont des estimations, établies avec des frais de gestion supposés : ni l’Urssaf, ni une société de portage, ni l’administration fiscale ne sont engagées par ce calcul, qui ne remplace pas un conseil adapté à votre contrat.</p>`,
  },
  en: {
    slug: 'umbrella-or-micro',
    nav: 'Umbrella or micro-enterprise',
    card: 'Same day rate, two take-homes: the gap in euros and what it buys.',
    title: 'Umbrella or micro-enterprise 2026: your take-home compared',
    description: 'Umbrella or micro-enterprise in France, 2026: monthly take-home for one day rate, your own management fee, the €83,600 ceiling and the minimum salary.',
    h1: 'Umbrella employment or micro-enterprise: one day rate, two incomes',
    intro: 'An umbrella company turns your turnover into an executive’s salary; the micro-enterprise scheme taxes it directly. Here is the gap, assignment by assignment.',
    resume: `If you want to freelance in France without setting up a company, two routes are common. As an auto-entrepreneur (micro-entrepreneur), you invoice clients yourself and pay contributions as a share of turnover. Under portage salarial, French umbrella employment, an umbrella company invoices the client and pays you a salary. For the same rate, the micro-enterprise leaves more money, because a salary carries an executive’s employer and employee contributions plus the umbrella company’s management fee. At ${EN.eur(400)} a day for ${EN.num(180)} days, ${EN.eur(c400.ca)} of turnover, a single consultant keeps ${EN.eur(c400.m.netMensuel)} a month after income tax as a micro-entrepreneur, against ${EN.eur(c400.bas.netMensuel)} under umbrella employment with a ${EN.pct(FG_BAS, 0)} fee and ${EN.eur(c400.haut.netMensuel)} with ${EN.pct(FG_HAUT, 0)}. Those fees are assumptions: each umbrella company sets its own by contract and no official scale exists. The micro route stops at ${EN.eur(P.micro.plafonds.services)} of turnover; the umbrella route needs enough turnover to fund a gross salary of at least ${EN.eur(P.portage.minimum_brut_mensuel, 2)} a month.`,
    faqs: [
      { q: 'How much turnover do I need before umbrella employment works in France?', a: `Enough to fund the minimum gross salary of ${EN.eur(P.portage.minimum_brut_mensuel, 2)} a month set for umbrella employees. By our calculation that takes about ${EN.eur(minBas)} of annual turnover with a ${EN.pct(FG_BAS, 0)} fee and ${EN.eur(minHaut)} with ${EN.pct(FG_HAUT, 0)}. Below that, the micro-enterprise is the only one of the two routes open to you.` },
      { q: 'What does one extra point of umbrella fee cost me?', a: `On ${EN.eur(c400.ca)} invoiced over the year, moving from a ${EN.pct(0.07, 0)} to an ${EN.pct(0.08, 0)} fee takes about ${EN.eur(unPoint)} off your take-home after income tax, ${EN.eur(unPoint / 12)} a month. Fees are not regulated, so compare contracts on what they include and on the rate, rather than trusting any figure presented as standard.` },
      { q: 'Can umbrella employment take over once I pass the micro ceiling?', a: `It can. The ${EN.eur(P.micro.plafonds.services)} ceiling is a micro-enterprise rule: exceeding it two years running takes you out of the scheme, according to service-public. Umbrella employment does not depend on that threshold. At ${EN.eur(400)} a day, the ceiling equals ${EN.num(joursPlafond400)} billed days; beyond it, umbrella employment, a sole trader on real profit or a company are the options.` },
      { q: 'Why does the umbrella gap widen as my day rate rises?', a: `Because umbrella fees and salary contributions both grow with turnover, while the micro-enterprise charges a flat ${EN.pct(P.micro.taux.bnc)} for freelance professions. At ${EN.eur(300)} a day over ${EN.num(160)} days, the monthly gap is ${EN.eur(ecart300)} with a ${EN.pct(FG_BAS, 0)} fee; at ${EN.eur(400)} over ${EN.num(180)} days, it reaches ${EN.eur(ecart400)}.` },
      { q: 'Can I compare the two routes before I have an umbrella quote?', a: `Only as a range. No rule sets the fee; it is written into each umbrella contract. The mini-calculator starts at ${EN.pct(0.08, 0)} for illustration, so try several values. At ${EN.eur(400)} a day over ${EN.num(180)} days, moving from ${EN.pct(FG_BAS, 0)} to ${EN.pct(FG_HAUT, 0)} changes monthly take-home by ${EN.eur(c400.bas.netMensuel - c400.haut.netMensuel)}.` },
    ],
    body: (h) => `
<h2>Two opposite mechanisms</h2>
<p>As a micro-entrepreneur you invoice clients yourself, and the Urssaf, the body that collects French social contributions, takes a percentage of the turnover you receive: ${h.pct(P.micro.taux.bnc)} for an unregulated freelance profession in 2026 (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). What remains after income tax is yours. Under portage salarial the umbrella company invoices your client, keeps its management fee and spends the balance on your salary: employer contributions, employee contributions, then net pay (${h.src('spPortage', 'service-public, sheet F31620')}). An umbrella employee always has executive (cadre) status.</p>
<p>The take-home gap therefore has two sources: the management fee, which does not exist in the micro scheme, and heavier social contributions, since an executive’s salary funds more risks. Income tax plays a part too. French income tax is not charged on the full amount: salary gets a ${h.pct(P.ir.abattement_salaires.taux, 0)} flat allowance for work expenses, while freelance micro turnover gets a ${h.pct(P.micro.abattement.bnc, 0)} one standing in for all business costs. The engine applies both before working out the tax.</p>

<h2>Three assignments compared</h2>
<p>The figures below come from the engine for a single person with no other income and no business expenses. The step from salary cost to net pay uses a grid computed with the ${h.src('monEntreprise', 'model the Urssaf publishes')}. The two fee levels are input assumptions chosen to bracket the result: no official scale sets them.</p>
${h.table(['Assignment', 'Turnover', 'Umbrella, ' + h.pct(FG_BAS, 0) + ' fee', 'Umbrella, ' + h.pct(FG_HAUT, 0) + ' fee', 'Micro-enterprise (BNC)'], cas.map((c) => [`${h.eur(c.tjm)} × ${h.num(c.j)} days`, h.eur(c.ca), h.eur(c.bas.netMensuel), h.eur(c.haut.netMensuel), c.m.possible ? h.eur(c.m.netMensuel) : 'over the ceiling']), 'Monthly take-home after income tax in 2026, single person', ['l', 'r', 'r', 'r', 'r'])}
<p>At ${h.eur(500)} a day for ${h.num(180)} days, turnover of ${h.eur(c500.ca)} exceeds the ${h.a('plafond-micro-entreprise', 'micro-enterprise ceiling')}. One year over is tolerated; two consecutive years move you to the real-profit regime (${h.src('spPlafonds', 'service-public, sheet F32353')}). Umbrella employment carries on regardless, paying ${h.eur(c500.bas.netMensuel)} a month on the low fee assumption.</p>
<p>The smallest assignment, ${h.eur(300)} a day over ${h.num(160)} days, sits in the zone where both routes are open: ${h.eur(c300.ca)} is above the umbrella entry threshold worked out below and well under the micro ceiling. There the micro-enterprise keeps ${h.eur(ecart300)} a month more than umbrella employment at a ${h.pct(FG_BAS, 0)} fee. Moving up to ${h.eur(400)} a day, the gap grows to ${h.eur(ecart400)}, because both the fee and the salary contributions scale with what you bill.</p>

<h2>What the gap buys</h2>
<p>An umbrella employee is not self-employed. The salary carries unemployment insurance contributions, an executive’s supplementary pension and provident cover, none of which the micro scheme funds. On a ${h.eur(400)} day rate, that extra protection costs ${h.eur(ecart400)} of monthly take-home with a ${h.pct(FG_BAS, 0)} fee. Weigh that sum against how much those guarantees matter to you.</p>
<p>On a permanent umbrella contract, a financial reserve of ${h.pct(P.portage.reserve_financiere, 0)} of the last assignment’s base salary is built up for periods without a client, and pay includes a ${h.pct(P.portage.apport_affaires, 0)} business-introduction bonus. These smooth the gaps a little. The micro scheme does nothing of the kind: with no money coming in nothing is owed, but nothing is paid to you either.</p>

<h2>The entry threshold for umbrella employment</h2>
<p>Umbrella employment is not open at any turnover. Gross pay cannot fall below ${h.eur(P.portage.minimum_brut_mensuel, 2)} a month. With our two fee assumptions, the assignment must bring in at least ${h.eur(minBas)} a year at ${h.pct(FG_BAS, 0)}, or ${h.eur(minHaut)} at ${h.pct(FG_HAUT, 0)}. A business starting slowly, with a few days a month, will not reach that and fits the ${h.a('micro-entreprise', 'micro-enterprise scheme')} better.</p>
<p>You also need a minimum qualification or experience and must find your own clients; the detailed conditions and the full money trail are on the ${h.a('portage-salarial', 'umbrella employment calculator')}.</p>

<h2>Arriving in France: which route first</h2>
<p>Umbrella employment suits someone who wants to test freelancing while staying an employee on paper, with enough turnover to reach the minimum salary. The micro-enterprise suits a gradual start or an activity that stays under the ceiling, and it leaves more take-home. Other set-ups sit in between: the ${h.a('statut-freelance', 'freelance legal status guide')} puts them side by side, and ${h.a('auto-entrepreneur-liberal', 'freelance professions under the micro scheme')} covers how consultants are treated as micro-entrepreneurs.</p>
<p>These amounts are estimates using assumed management fees. They bind neither the Urssaf, nor any umbrella company, nor the tax office, and do not replace advice on your own contract.</p>`,
  },
});
