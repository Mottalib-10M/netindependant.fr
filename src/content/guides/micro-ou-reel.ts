import { defineGuide } from '../../lib/guide-types';
import { enMicro, enEI } from '../../lib/engine/statuts';
import { abattementTaux, type Activite } from '../../lib/engine/micro';
import { cotisationsTNS } from '../../lib/engine/tns';
import { P, FR, EN } from '../../lib/fmt';

/** Frais réels annuels (pas de 250 €) à partir desquels l'EI au réel laisse plus que la micro-entreprise. */
const bascule = (ca: number, activite: Activite, artisan = false) => {
  let c = 0;
  while (c < ca && enEI({ ca, charges: c, activite, artisan }).net <= enMicro({ ca, charges: c, activite, artisan }).net) c += 250;
  return c;
};
// Points de bascule calculés par le moteur, personne seule sans autre revenu.
const profils: Array<{ fr: string; en: string; ca: number; a: Activite; artisan?: boolean }> = [
  { fr: 'Rédacteur (libéral)', en: 'Copywriter (freelance)', ca: 30000, a: 'bnc' },
  { fr: 'Consultante (libéral)', en: 'Consultant (freelance)', ca: 70000, a: 'bnc' },
  { fr: 'Agent commercial (services BIC)', en: 'Sales agent (BIC services)', ca: 50000, a: 'bic' },
  { fr: 'Menuisier (artisan)', en: 'Joiner (craft)', ca: 50000, a: 'bic', artisan: true },
  { fr: 'Boutique en ligne (vente)', en: 'Online shop (goods)', ca: 120000, a: 'vente' },
];
const seuils = profils.map((p) => ({ ...p, frais: bascule(p.ca, p.a, p.artisan) }));
const [redac, consult, , menuisier, boutique] = seuils;
// Le menuisier à 50 000 € selon ses achats.
const grille = [0, 5000, 10000, 15000, 20000, 25000].map((ch) => {
  const i = { ca: 50000, charges: ch, activite: 'bic' as const, artisan: true };
  return { ch, m: enMicro(i), e: enEI(i) };
});
const menu20 = grille.find((g) => g.ch === 20000)!;
// Consultante à 70 000 € avec 12 000 € de frais.
const c12 = { ca: 70000, charges: 12000, activite: 'bnc' as const };
const cm = enMicro(c12), ce = enEI(c12);
// Une année blanche au réel : cotisations minimales calculées par le moteur.
const minimum = cotisationsTNS(0).cotisations;
const pctFR = (x: number) => FR.pct(x, 0);
const pctEN = (x: number) => EN.pct(x, 0);

export default defineGuide({
  id: 'micro-ou-reel',
  group: 'micro',
  order: 90,
  mini: 'microOuReel',
  related: ['entrepreneur-individuel', 'micro-entreprise', 'cotisations-tns', 'impot-auto-entrepreneur', 'micro-ou-sasu', 'plafond-micro-entreprise'],
  sources: ['spPlafonds', 'spMicroImposition', 'urssafReforme', 'urssafTauxAC', 'decret2024688'],
  fr: {
    slug: 'micro-entreprise-ou-reel',
    nav: 'Micro ou réel',
    card: 'Cinq métiers, cinq seuils de dépenses : quand l’entreprise individuelle au réel laisse plus que la micro.',
    title: 'Micro ou réel 2026 : à partir de quels frais le réel gagne',
    description: 'Micro ou réel 2026 : la micro taxe le chiffre d’affaires, le réel le bénéfice abattu de 26 %. Le seuil de frais où le réel gagne, calculé pour cinq métiers.',
    h1: 'Micro-entreprise ou régime réel : à partir de quels frais changer',
    intro: 'La micro taxe ce que vous encaissez, le réel ce que vous gagnez vraiment : tout se joue sur le poids de vos dépenses.',
    resume: `Le choix entre micro-entreprise et régime réel se joue sur les frais. En micro, les cotisations sont un pourcentage du chiffre d’affaires, ${FR.pct(P.micro.taux.bnc)} en libéral en 2026, et l’impôt porte sur ce chiffre d’affaires après un abattement forfaitaire, quelles que soient les dépenses. Au réel, en entreprise individuelle, cotisations et impôt se calculent sur le bénéfice : depuis la réforme de l’assiette des indépendants, les cotisations portent sur ce bénéfice diminué de ${pctFR(P.tns.abattement)}. Le point de bascule arrive plus tôt qu’on ne le croit. D’après le moteur du site, pour une personne seule sans autre revenu, une consultante libérale qui encaisse ${FR.eur(70000)} laisse davantage au réel dès ${FR.eur(consult.frais)} de frais annuels, soit ${pctFR(consult.frais / 70000)} de son chiffre d’affaires, bien moins que l’abattement fiscal de ${pctFR(abattementTaux('bnc'))}. Un menuisier à ${FR.eur(50000)} bascule vers ${FR.eur(menuisier.frais)} d’achats. Une boutique en ligne, avec son taux de ${FR.pct(P.micro.taux.vente)}, reste en micro jusqu’à des frais très élevés.`,
    faqs: [
      { q: 'Quel montant de frais rend le régime réel plus avantageux que la micro-entreprise ?', a: `Cela dépend de l’activité et du chiffre d’affaires. Pour un libéral seul sans autre revenu, le moteur du site situe la bascule à ${FR.eur(redac.frais)} de frais pour ${FR.eur(30000)} encaissés et à ${FR.eur(consult.frais)} pour ${FR.eur(70000)}. En vente de marchandises, avec un taux de ${FR.pct(P.micro.taux.vente)}, il faut ${FR.eur(boutique.frais)} de frais sur ${FR.eur(120000)}, d’après les barèmes 2026 de l’Urssaf.` },
      { q: 'Pourquoi le réel peut-il l’emporter avec des frais inférieurs à l’abattement de la micro ?', a: `Parce que l’abattement ne vaut que pour l’impôt. Les cotisations de la micro, ${FR.pct(P.micro.taux.bnc)} en libéral, s’appliquent au chiffre d’affaires entier, alors qu’au réel elles portent sur le bénéfice diminué de ${pctFR(P.tns.abattement)}, selon l’Urssaf. Chaque euro de frais réduit donc les cotisations au réel, jamais en micro : la consultante à ${FR.eur(70000)} bascule dès ${pctFR(consult.frais / 70000)} de frais, quand l’abattement fiscal atteint ${pctFR(abattementTaux('bnc'))}.` },
      { q: 'Un artisan qui achète beaucoup de matériaux a-t-il intérêt à passer au réel ?', a: `Souvent, oui. Un menuisier qui encaisse ${FR.eur(50000)} et dépense ${FR.eur(20000)} en bois et quincaillerie garderait ${FR.eur(menu20.m.net)} en micro et ${FR.eur(menu20.e.net)} au réel, d’après le moteur du site pour une personne seule. La bascule se situe vers ${FR.eur(menuisier.frais)} d’achats par an. En dessous, la micro reste devant malgré la CFP et la taxe de chambre des métiers.` },
      { q: 'Une boutique en ligne a-t-elle intérêt à quitter la micro pour le réel ?', a: `Rarement. La vente cumule le taux de cotisations le plus bas, ${FR.pct(P.micro.taux.vente)}, et l’abattement fiscal le plus fort, ${pctFR(abattementTaux('vente'))}. Pour ${FR.eur(120000)} de ventes, le moteur du site ne voit le réel l’emporter qu’à partir de ${FR.eur(boutique.frais)} d’achats et de frais, soit ${pctFR(boutique.frais / 120000)} du chiffre d’affaires. Une marge très faible sur les produits peut toutefois y conduire.` },
      { q: 'Une consultante à 70 000 € avec 12 000 € de frais gagne-t-elle plus au réel ?', a: `Oui, d’environ ${FR.eur(ce.net - cm.net)} par an d’après le moteur du site, pour une personne seule. Ses cotisations sont presque identiques, ${FR.eur(cm.cotisations)} en micro et ${FR.eur(ce.cotisations)} au réel, mais l’impôt passe de ${FR.eur(cm.impotRevenu)} à ${FR.eur(ce.impotRevenu)}, car le bénéfice imposable tient compte des frais réels. Le coût de la tenue des comptes au réel n’est pas déduit.` },
    ],
    body: (h) => `
<h2>Deux façons de mesurer le revenu</h2>
<p>La micro-entreprise ne connaît que le chiffre d’affaires encaissé. Les cotisations en sont un pourcentage fixe, et l’impôt porte sur ce chiffre d’affaires après un abattement forfaitaire de ${h.pct(abattementTaux('vente'), 0)}, ${h.pct(abattementTaux('bic'), 0)} ou ${h.pct(abattementTaux('bnc'), 0)} selon l’activité (${h.src('spMicroImposition', 'service-public, fiche F23267')}). Vos dépenses réelles n’apparaissent nulle part.</p>
<p>Le régime réel part du bénéfice : recettes moins frais. Pour les cotisations sociales, ce bénéfice est réduit d’un abattement de ${h.pct(P.tns.abattement, 0)}, borné entre ${h.pct(P.tns.abattement_min_pass, 2)} et ${h.pct(P.tns.abattement_max_pass, 0)} du plafond de la sécurité sociale, puis soumis au barème des indépendants (${h.src('urssafReforme', 'Urssaf, réforme de l’assiette')} ; ${h.src('decret2024688', 'décret n° 2024-688')}). Pour l’impôt, le bénéfice rejoint le revenu du foyer. La différence fondamentale tient en une phrase : au réel, chaque euro dépensé pour l’activité allège à la fois les cotisations et l’impôt ; en micro, il n’allège rien.</p>

<h2>Le point de bascule, métier par métier</h2>
<p>Le moteur du site cherche, pour chaque profil, le montant de frais annuels au-delà duquel l’entreprise individuelle au réel laisse plus en poche que la micro-entreprise, impôt compris, pour une personne seule sans autre revenu.</p>
${h.table(['Profil', 'Chiffre d’affaires', 'Frais de bascule', 'En part du CA', 'Abattement fiscal micro'], seuils.map((s) => [s.fr, h.eur(s.ca), h.eur(s.frais), h.pct(s.frais / s.ca, 0), h.pct(abattementTaux(s.a), 0)]), 'Frais réels à partir desquels le réel l’emporte en 2026, calculés par le moteur', ['l', 'r', 'r', 'r', 'r'])}
<p>Deux enseignements. En libéral, la bascule survient à une part de frais très inférieure à l’abattement de ${h.pct(abattementTaux('bnc'), 0)} : le taux de cotisations de la micro, ${h.pct(P.micro.taux.bnc)}, est lourd, et le réel en efface une partie dès les premiers frais. En vente, c’est l’inverse : le taux de ${h.pct(P.micro.taux.vente)} et l’abattement de ${h.pct(abattementTaux('vente'), 0)} protègent la micro jusqu’à des frais considérables. Les professions relevant de la Cipav ne figurent pas dans ce tableau : leur régime réel dépend de leur caisse et sort du champ du simulateur.</p>

<h2>Un menuisier face à ses achats</h2>
<p>Un menuisier artisan encaisse ${h.eur(50000)} par an. Selon ce qu’il dépense en bois, quincaillerie et outillage, voici ce qu’il garde dans chaque régime.</p>
${h.table(['Frais réels', 'Net en micro', 'Net au réel', 'Cotisations micro', 'Cotisations réel', 'Écart réel moins micro'], grille.map((g) => [h.eur(g.ch), h.eur(g.m.net), h.eur(g.e.net), h.eur(g.m.cotisations), h.eur(g.e.cotisations), h.eur(g.e.net - g.m.net)]), 'Menuisier à ' + h.eur(50000) + ' de chiffre d’affaires : net annuel après impôt selon les frais, calculé par le moteur', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Les cotisations de la micro ne bougent pas, quelle que soit la dépense ; celles du réel fondent à mesure que le bénéfice baisse. Sans achats, le réel coûte cher : le menuisier y perdrait ${h.eur(grille[0].m.net - grille[0].e.net)}. À ${h.eur(20000)} de frais, il y gagne ${h.eur(menu20.e.net - menu20.m.net)}. Le point d’équilibre se situe vers ${h.eur(menuisier.frais)}.</p>

<h2>Ce que le tableau ne montre pas</h2>
<p>Le réel demande une tenue de comptes plus complète, dont le coût n’est pas retranché ici : à vous de le comparer à l’écart obtenu. Le calendrier change aussi. En micro, les cotisations versées avec chaque déclaration sont définitives. Au réel, l’Urssaf appelle des cotisations provisoires, puis les régularise une fois le revenu connu (${h.src('urssafTauxAC', 'Urssaf, taux 2026 des indépendants')}). Et une année blanche n’est pas gratuite : avec un bénéfice nul, le moteur compte ${h.eur(minimum)} de cotisations minimales, dont ${h.eur(P.tns.minimums_publies.retraite_base)} pour la retraite de base, quand la micro ne demande rien sans chiffre d’affaires.</p>
<p>Le détail des cotisations au réel est sur ${h.a('cotisations-tns', 'les cotisations TNS')} et le fonctionnement complet sur ${h.a('entrepreneur-individuel', 'l’entrepreneur individuel')}.</p>

<h2>Comment passer au réel</h2>
<p>On peut opter pour un régime réel d’imposition sans attendre de dépasser le plafond de la micro (${h.src('spPlafonds', 'service-public, fiche F32353')}). La sortie devient obligatoire après deux années consécutives au-dessus de ${h.eur(P.micro.plafonds.services)} en services ou ${h.eur(P.micro.plafonds.vente)} en vente, comme l’explique ${h.a('plafond-micro-entreprise', 'le plafond de la micro-entreprise')}. Avant de choisir, faites tourner le mini-simulateur en haut de page avec vos frais de l’an dernier, puis avec ceux que vous prévoyez : une décision prise sur une seule année exceptionnelle peut coûter cher les suivantes. Si une société vous tente, ${h.a('micro-ou-sasu', 'micro-entreprise ou SASU')} pose la même question avec un autre statut.</p>
<p>Ces comparaisons sont des estimations faites avec les barèmes 2026 publiés ; elles ne remplacent pas un conseil personnalisé, et l’Urssaf comme le service des impôts fixent seuls les montants dus.</p>`,
  },
  en: {
    slug: 'micro-or-real-profit',
    nav: 'Micro or real profit',
    card: 'Five jobs, five spending thresholds: when a sole trader on real profit keeps more than under micro.',
    title: 'Micro or real profit 2026: the cost level where real wins',
    description: 'Micro or real profit in France for 2026: micro taxes turnover, real profit taxes earnings less a 26% allowance. Where real profit wins, for five jobs.',
    h1: 'Micro-enterprise or real profit: the expense level where you should switch',
    intro: 'Micro taxes what you receive, real profit taxes what you actually earn: your costs decide which is better.',
    resume: `Choosing between the French micro-enterprise scheme and the real-profit regime (régime réel) comes down to expenses. Under micro, contributions are a share of turnover, ${EN.pct(P.micro.taux.bnc)} for freelance professions in 2026, and income tax applies to turnover after a flat allowance, whatever you spend. On real profit, as an entreprise individuelle (sole trader), contributions and income tax are based on profit: since the reform of the self-employed contribution base, contributions apply to that profit less ${pctEN(P.tns.abattement)}. The break-even point comes sooner than most people expect. According to the site’s engine, for a single person with no other income, a freelance consultant receiving ${EN.eur(70000)} keeps more on real profit once yearly costs reach ${EN.eur(consult.frais)}, only ${pctEN(consult.frais / 70000)} of turnover and far below the ${pctEN(abattementTaux('bnc'))} tax allowance. A joiner on ${EN.eur(50000)} switches at about ${EN.eur(menuisier.frais)} of purchases. An online shop, with its ${EN.pct(P.micro.taux.vente)} rate, stays better off in micro until costs are very high.`,
    faqs: [
      { q: 'How much in expenses makes real profit beat the micro scheme in France?', a: `It depends on your activity and turnover. For a single freelancer with no other income, the site’s engine puts the switch at ${EN.eur(redac.frais)} of costs on ${EN.eur(30000)} of turnover and ${EN.eur(consult.frais)} on ${EN.eur(70000)}. Selling goods, with a ${EN.pct(P.micro.taux.vente)} contribution rate, you need ${EN.eur(boutique.frais)} of costs on ${EN.eur(120000)}, using the Urssaf’s 2026 rates.` },
      { q: 'Why can real profit win when my costs are below the micro flat allowance?', a: `Because the allowance only applies to income tax. Micro contributions, ${EN.pct(P.micro.taux.bnc)} for freelancers, apply to your whole turnover, whereas on real profit they apply to profit less ${pctEN(P.tns.abattement)}, according to the Urssaf. Every euro of costs cuts contributions on real profit and never under micro, so the consultant on ${EN.eur(70000)} switches at ${pctEN(consult.frais / 70000)} of costs while the tax allowance is ${pctEN(abattementTaux('bnc'))}.` },
      { q: 'I am a joiner buying lots of timber: is real profit better for me?', a: `Often, yes. A joiner receiving ${EN.eur(50000)} who spends ${EN.eur(20000)} on timber and fittings would keep ${EN.eur(menu20.m.net)} under micro and ${EN.eur(menu20.e.net)} on real profit, according to the site’s engine for a single person. The break-even sits at about ${EN.eur(menuisier.frais)} of purchases a year. Below that, micro stays ahead despite the training and trades-chamber levies.` },
      { q: 'Is real profit worth it for an online shop selling goods?', a: `Rarely. Selling goods combines the lowest contribution rate, ${EN.pct(P.micro.taux.vente)}, with the highest tax allowance, ${pctEN(abattementTaux('vente'))}. On ${EN.eur(120000)} of sales, the site’s engine only sees real profit winning from ${EN.eur(boutique.frais)} of purchases and costs, ${pctEN(boutique.frais / 120000)} of turnover. Very thin product margins can still get you there.` },
      { q: 'Does a consultant on €70,000 with €12,000 of costs keep more on real profit?', a: `Yes, about ${EN.eur(ce.net - cm.net)} a year more according to the site’s engine, for a single person. Contributions are almost the same, ${EN.eur(cm.cotisations)} under micro and ${EN.eur(ce.cotisations)} on real profit, but income tax falls from ${EN.eur(cm.impotRevenu)} to ${EN.eur(ce.impotRevenu)}, because taxable profit reflects actual costs. The cost of keeping full accounts on real profit is not deducted.` },
    ],
    body: (h) => `
<h2>Two ways of measuring income</h2>
<p>The micro scheme only looks at turnover received. Contributions are a fixed share of it, and income tax applies to it after a flat allowance of ${h.pct(abattementTaux('vente'), 0)}, ${h.pct(abattementTaux('bic'), 0)} or ${h.pct(abattementTaux('bnc'), 0)} depending on the activity (${h.src('spMicroImposition', 'service-public, sheet F23267')}). Your real costs appear nowhere.</p>
<p>The real-profit regime starts from profit: receipts minus costs. For social contributions, that profit is reduced by a ${h.pct(P.tns.abattement, 0)} allowance, kept between ${h.pct(P.tns.abattement_min_pass, 2)} and ${h.pct(P.tns.abattement_max_pass, 0)} of the Pass (the French social security ceiling), then run through the self-employed scale (${h.src('urssafReforme', 'Urssaf, contribution base reform')}; ${h.src('decret2024688', 'decree no. 2024-688')}). For income tax, profit joins household income. The key point: on real profit, every euro spent on the business lowers both contributions and tax; under micro it lowers neither.</p>

<h2>The break-even point, job by job</h2>
<p>For each profile the site’s engine searches for the yearly expense level above which a sole trader on real profit keeps more than a micro-entrepreneur, income tax included, for a single person with no other income.</p>
${h.table(['Profile', 'Turnover', 'Break-even costs', 'Share of turnover', 'Micro tax allowance'], seuils.map((s) => [s.en, h.eur(s.ca), h.eur(s.frais), h.pct(s.frais / s.ca, 0), h.pct(abattementTaux(s.a), 0)]), 'Real costs above which real profit wins in 2026, computed by the engine', ['l', 'r', 'r', 'r', 'r'])}
<p>For freelancers the switch comes at a share of costs well below the ${h.pct(abattementTaux('bnc'), 0)} allowance: the micro rate of ${h.pct(P.micro.taux.bnc)} is heavy, and real profit removes part of it with the very first costs. Selling goods works the other way: the ${h.pct(P.micro.taux.vente)} rate and the ${h.pct(abattementTaux('vente'), 0)} allowance protect the micro scheme up to large expenses. Cipav professions are not in the table, because their real-profit contributions depend on their own fund and fall outside the calculator.</p>

<h2>A joiner and his purchases</h2>
<p>A self-employed joiner receives ${h.eur(50000)} a year. Depending on what he spends on timber, fittings and tools, here is what he keeps under each regime.</p>
${h.table(['Real costs', 'Net under micro', 'Net on real profit', 'Micro contributions', 'Real-profit contributions', 'Real profit minus micro'], grille.map((g) => [h.eur(g.ch), h.eur(g.m.net), h.eur(g.e.net), h.eur(g.m.cotisations), h.eur(g.e.cotisations), h.eur(g.e.net - g.m.net)]), 'Joiner on ' + h.eur(50000) + ' of turnover: yearly take-home after tax by level of costs, computed by the engine', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Micro contributions never move; real-profit contributions shrink as profit falls. With no purchases, real profit is expensive: the joiner would lose ${h.eur(grille[0].m.net - grille[0].e.net)}. At ${h.eur(20000)} of costs he gains ${h.eur(menu20.e.net - menu20.m.net)}. The break-even is near ${h.eur(menuisier.frais)}.</p>

<h2>What the table leaves out</h2>
<p>Real profit requires fuller bookkeeping, whose cost is not deducted here: weigh it against the gain. The timing also changes. Under micro, contributions paid with each return are final. On real profit, the Urssaf collects provisional contributions and adjusts them once your income is known (${h.src('urssafTauxAC', 'Urssaf, 2026 self-employed rates')}). And a blank year is not free: with zero profit the engine counts ${h.eur(minimum)} of minimum contributions, including ${h.eur(P.tns.minimums_publies.retraite_base)} for the basic pension, while micro charges nothing without turnover.</p>
<p>Details are on ${h.a('cotisations-tns', 'self-employed contributions (TNS)')} and ${h.a('entrepreneur-individuel', 'the sole trader on real profit')}.</p>

<h2>Making the switch</h2>
<p>You can opt for a real-profit tax regime without waiting to exceed the micro ceiling (${h.src('spPlafonds', 'service-public, sheet F32353')}). Leaving becomes compulsory after two consecutive years above ${h.eur(P.micro.plafonds.services)} for services or ${h.eur(P.micro.plafonds.vente)} for goods, as explained on ${h.a('plafond-micro-entreprise', 'the turnover ceiling')} page. Before deciding, run the mini-calculator at the top of this page with last year’s costs and with those you expect: a choice made on one exceptional year can cost you in the next ones. If a company appeals to you, ${h.a('micro-ou-sasu', 'micro-enterprise or SASU')} asks the same question about another legal form.</p>
<p>These comparisons are estimates made with the published 2026 scales, not personal advice; the Urssaf and the French tax office alone set what you owe.</p>`,
  },
});
