import { defineGuide } from '../../lib/guide-types';
import { comparer, enEI } from '../../lib/engine/statuts';
import { cotisationsTNS, eiReel } from '../../lib/engine/tns';
import { P, FR, EN } from '../../lib/fmt';

// Tous les montants sortent du moteur (barème 2026 des indépendants, personne seule, sans autre revenu).
const PASS = P.pass.annuel;
const T = P.tns;
const grille = [10000, 25000, 40000, 60000, 90000, 150000].map((b) => ({ b, r: eiReel(b), o: enEI({ ca: b, charges: 0, activite: 'bnc' }) }));
const b50 = 50000;
const d50 = eiReel(b50);
const o50 = enEI({ ca: b50, charges: 0, activite: 'bnc' });
const zero = cotisationsTNS(0);
const bAcre = 30000;
const acre = cotisationsTNS(bAcre, { acre: true });
const sansAcre = cotisationsTNS(bAcre);
// Même activité en EI au réel et en EURL à l'IS.
const duo = comparer({ ca: 60000, charges: 15000, activite: 'bnc' });
const plafondAbatt = T.abattement_max_pass * PASS;
const beneficePlafond = plafondAbatt / T.abattement;
const taux = grille.map((g) => g.r.cotisations / g.b);
const tMin = Math.min(...taux), tMax = Math.max(...taux);
const nPlafonds = T.maladie.points[T.maladie.points.length - 1][0];

export default defineGuide({
  id: 'entrepreneur-individuel',
  group: 'statuts',
  order: 60,
  mini: 'eiReel',
  related: ['micro-ou-reel', 'cotisations-tns', 'eurl', 'micro-entreprise', 'eurl-ou-sasu', 'statut-freelance'],
  sources: ['urssafTauxAC', 'urssafReforme', 'decret2024688', 'spBareme', 'urssafAcre2026'],
  fr: {
    slug: 'entrepreneur-individuel',
    nav: 'Entrepreneur individuel au réel',
    card: 'Cotisations sur le bénéfice, minimum annuel et impôt de l’EI au réel.',
    title: 'Entrepreneur individuel 2026 : cotisations et net au réel',
    description: 'Entrepreneur individuel au réel en 2026 : cotisations sur le bénéfice après abattement de 26 %, minimum dû sans bénéfice, impôt au barème et net calculé.',
    h1: 'Entrepreneur individuel au réel : ce que coûte et rapporte le bénéfice',
    intro: 'Sans société et sans plafond, l’entreprise individuelle au réel cotise sur ce que vous gagnez vraiment, frais déduits.',
    resume: `Un entrepreneur individuel au réel paie en 2026 environ ${FR.pct(d50.cotisations / b50, 0)} de son bénéfice en cotisations sociales et CSG-CRDS : pour ${FR.eur(b50)} de bénéfice avant cotisations, le moteur compte ${FR.eur(d50.cotisations)} de prélèvements sociaux, ${FR.eur(o50.impotRevenu)} d’impôt sur le revenu pour une personne seule, et laisse ${FR.eur(o50.net)} dans l’année. Contrairement au micro-entrepreneur, il déduit ses frais réels et cotise sur le résultat, pas sur le chiffre d’affaires. Depuis la réforme appliquée en 2026, l’Urssaf calcule toutes les cotisations et la CSG-CRDS sur une seule assiette : le bénéfice avant cotisations diminué d’un abattement de ${FR.pct(T.abattement, 0)}. Le barème est progressif pour la maladie et les allocations familiales, la retraite de base vaut ${FR.pct(T.retraite_base.t1, 2)} jusqu’au plafond de la Sécurité sociale de ${FR.eur(PASS)}, la complémentaire ${FR.pct(T.retraite_compl.t1)}. Même sans aucun bénéfice, des cotisations minimales restent dues, soit ${FR.eur(zero.cotisations)} par an selon le moteur. Le bénéfice est ensuite imposé au barème progressif, au nom de l’entrepreneur, sans impôt sur les sociétés.`,
    faqs: [
      { q: 'Combien de cotisations sur 50 000 € de bénéfice en entreprise individuelle ?', a: `Le moteur compte ${FR.eur(d50.cotisations)} pour une activité commerciale ou libérale non réglementée, CSG-CRDS et formation professionnelle comprises, soit ${FR.pct(d50.cotisations / b50)} du bénéfice. L’assiette retenue est de ${FR.eur(d50.assiette)} après l’abattement de ${FR.pct(T.abattement, 0)}. Le revenu disponible ressort à ${FR.eur(o50.net)} après ${FR.eur(o50.impotRevenu)} d’impôt pour une personne seule. Barème Urssaf 2026.` },
      { q: 'Une entreprise individuelle sans bénéfice doit-elle quand même des cotisations ?', a: `Oui, des minimums s’appliquent : ${FR.eur(T.minimums_publies.retraite_base)} pour la retraite de base, ${FR.eur(T.minimums_publies.ij)} pour les indemnités journalières, ${FR.eur(T.minimums_publies.invalidite_deces)} pour l’invalidité-décès et ${FR.eur(T.minimums_publies.cfp_commercant)} de formation professionnelle (${FR.eur(T.minimums_publies.cfp_artisan)} pour un artisan), d’après l’Urssaf. Ils ne s’appliquent pas aux bénéficiaires du RSA ou de la prime d’activité. Le moteur en tire ${FR.eur(zero.cotisations)} pour un bénéfice nul.` },
      { q: 'Que paie un entrepreneur individuel au réel pendant ses premiers mois ?', a: `Au démarrage, l’Urssaf ne connaît pas encore le revenu : elle appelle des cotisations provisoires calculées sur des bases forfaitaires, exprimées en fraction du plafond de la Sécurité sociale de ${FR.eur(PASS)}, puis les régularise une fois le premier bénéfice déclaré. Les premiers paiements ne tombent pas dès l’immatriculation mais après un délai fixé par l’Urssaf. Prévoyez une réserve : la régularisation peut être lourde si l’année a bien marché.` },
      { q: 'Le bénéfice imposable d’une EI se calcule-t-il après cotisations ?', a: `Presque entièrement. Les cotisations sociales se déduisent du bénéfice imposable, sauf la part non déductible de la CSG-CRDS, ${FR.pct(T.csg_crds.non_deductible)} de l’assiette sur un total de ${FR.pct(T.csg_crds.total)}. Pour ${FR.eur(b50)} de bénéfice avant cotisations, le moteur retient ${FR.eur(d50.imposable)} de revenu imposable, ensuite soumis au barème de l’impôt sur le revenu 2026 avec le reste du foyer.` },
      { q: 'L’Acre allège-t-elle les cotisations d’un entrepreneur individuel au réel ?', a: `Oui, au démarrage, pour les créateurs éligibles qui la demandent à l’Urssaf dans les ${P.micro.acre.delai_demande_jours} jours. L’exonération porte sur le quart des cotisations maladie, indemnités journalières, allocations familiales, retraite de base et invalidité-décès, entière jusqu’à ${FR.eur(T.acre.seuil_pass * PASS)} de revenu puis dégressive jusqu’à ${FR.eur(PASS)}. Sur ${FR.eur(bAcre)} de bénéfice, le moteur l’évalue à ${FR.eur(acre.exonerationAcre)}.` },
      { q: 'Entreprise individuelle au réel ou EURL à l’impôt sur les sociétés : quel écart ?', a: `Modeste. Pour ${FR.eur(60000)} de recettes et ${FR.eur(15000)} de frais en libéral, le moteur donne ${FR.eur(duo.ei.net)} par an en EI au réel et ${FR.eur(duo.eurl.net)} en EURL à l’IS, le gérant étant alors payé surtout en rémunération, imposée comme un salaire après abattement de ${FR.pct(P.ir.abattement_salaires.taux, 0)}. Les cotisations sont les mêmes : dans les deux cas, l’entrepreneur est travailleur indépendant.` },
    ],
    body: (h) => `
<h2>Ce que coûte un bénéfice, palier par palier</h2>
<p>Le tableau suit un entrepreneur individuel au réel, commerçant ou libéral non réglementé, du petit bénéfice à l’activité bien installée. « Bénéfice » s’entend avant cotisations, frais déduits. Le net est ce qui reste après cotisations et impôt sur le revenu pour une personne seule sans autre revenu.</p>
${h.table(['Bénéfice avant cotisations', 'Cotisations et CSG-CRDS', 'Taux sur le bénéfice', 'Impôt sur le revenu', 'Net par an'], grille.map((g) => [h.eur(g.b), h.eur(g.r.cotisations), h.pct(g.r.cotisations / g.b), h.eur(g.o.impotRevenu), h.eur(g.o.net)]), 'Entreprise individuelle au réel, barèmes 2026, personne seule', ['l', 'r', 'r', 'r', 'r'])}
<p>Le taux global reste compris entre ${h.pct(tMin)} et ${h.pct(tMax)} sur toute la plage. Il grimpe au milieu du tableau, à mesure que le taux maladie progresse et que les allocations familiales entrent en jeu au-delà de ${h.pct(T.alloc_familiales.seuil_pass, 0)} du plafond, puis il redescend pour les gros bénéfices, une fois dépassé le plafond où la retraite de base passe à ${h.pct(T.retraite_base.t2, 2)}.</p>

<h2>L’assiette unique depuis la réforme</h2>
<p>Jusqu’en 2025, les cotisations et la CSG-CRDS d’un indépendant avaient chacune leur propre base. La ${h.src('urssafReforme', 'réforme de l’Urssaf')}, prévue par le ${h.src('decret2024688', 'décret n° 2024-688 du 5 juillet 2024')}, les a fondues en une seule : le revenu professionnel, cotisations non déduites, moins ${h.pct(T.abattement, 0)}. Cet abattement ne peut pas descendre sous ${h.pct(T.abattement_min_pass, 2)} du plafond annuel ni dépasser ${h.pct(T.abattement_max_pass, 0)} de ce plafond, soit ${h.eur(plafondAbatt)} : il cesse donc de croître au-delà d’environ ${h.eur(beneficePlafond)} de bénéfice. La réforme s’applique depuis la régularisation des revenus 2025, réalisée en 2026.</p>
<h3>Le détail pour ${h.eur(b50)} de bénéfice</h3>
${h.table(['Poste', 'Montant'], [
  ['Assiette après abattement', h.eur(d50.assiette)],
  ['Maladie-maternité (taux progressif)', h.eur(d50.maladie)],
  [`Indemnités journalières (${h.pct(T.ij.taux)})`, h.eur(d50.ij)],
  [`Retraite de base (${h.pct(T.retraite_base.t1, 2)})`, h.eur(d50.retraiteBase)],
  [`Retraite complémentaire (${h.pct(T.retraite_compl.t1)})`, h.eur(d50.retraiteCompl)],
  [`Invalidité-décès (${h.pct(T.invalidite_deces.taux)})`, h.eur(d50.invalidite)],
  ['Allocations familiales', h.eur(d50.allocations)],
  [`CSG-CRDS (${h.pct(T.csg_crds.total)})`, h.eur(d50.csgCrds)],
  ['Formation professionnelle', h.eur(d50.cfp)],
  ['Total', h.eur(d50.cotisations)],
], `Cotisations d’un commerçant ou libéral non réglementé, barème ${h.src('urssafTauxAC', 'Urssaf 2026')}`, ['l', 'r'])}
<p>La cotisation maladie est nulle sous ${h.pct(T.maladie.points[1][0], 0)} du plafond annuel, puis monte par paliers jusqu’à ${h.pct(T.maladie.points[T.maladie.points.length - 1][1])} à ${h.num(nPlafonds)} fois ce plafond. Les allocations familiales suivent la même logique : rien sous ${h.pct(T.alloc_familiales.seuil_pass, 0)} du plafond, ${h.pct(T.alloc_familiales.taux)} à partir de ${h.pct(T.alloc_familiales.plein_pass, 0)}. Sur la CSG-CRDS de ${h.pct(T.csg_crds.total)}, ${h.pct(T.csg_crds.deductible)} se déduisent du revenu imposable.</p>

<h2>Le calendrier : provisoire, puis régularisé</h2>
<p>C’est la différence qui surprend le plus les anciens micro-entrepreneurs. En micro, la cotisation est définitive le jour où vous déclarez vos recettes. Au réel, l’Urssaf appelle des montants provisoires puis les ajuste lorsque le bénéfice définitif est connu. Au tout début, faute d’historique, elle se fonde sur des bases forfaitaires (${h.src('urssafTauxAC', 'Urssaf')}), et les premiers prélèvements n’arrivent qu’après un délai de démarrage. Une première année rentable se paie donc en partie plus tard : mettre de côté une part de chaque encaissement évite la mauvaise surprise de la régularisation.</p>

<h2>L’impôt : le bénéfice au nom de l’entrepreneur</h2>
<p>L’entreprise individuelle ne paie pas d’impôt sur les sociétés. Son bénéfice, cotisations déduites sauf la CSG-CRDS non déductible, s’ajoute aux autres revenus du foyer et passe au ${h.src('spBareme', 'barème progressif 2026')} : ${h.pct(P.ir.bareme[1][1], 0)} à partir de ${h.eur(P.ir.bareme[0][0] as number)} par part, ${h.pct(P.ir.bareme[2][1], 0)} au-delà de ${h.eur(P.ir.bareme[1][0] as number)}. Pour ${h.eur(b50)} de bénéfice, le revenu imposable retenu par le moteur est de ${h.eur(d50.imposable)}. Le mini-simulateur en haut de page refait ce calcul avec votre chiffre d’affaires et vos charges.</p>

<h2>Quand l’EI au réel est le bon choix</h2>
<p>Elle convient à qui a des frais importants mais ne veut pas créer de société : un artisan qui achète du matériel, un consultant qui loue un bureau, un commerçant dont les achats pèsent lourd. Elle n’a pas de plafond de chiffre d’affaires. Face à la micro-entreprise, le calcul se fait sur ${h.a('micro-ou-reel', 'micro ou réel')}. Face à une société, l’${h.a('eurl', 'EURL')} à l’impôt sur les sociétés garde le même régime social : pour ${h.eur(60000)} de recettes et ${h.eur(15000)} de frais, le moteur donne ${h.eur(duo.ei.net)} en EI et ${h.eur(duo.eurl.net)} en EURL, un écart qui doit couvrir les frais propres à une société. Le détail du barème est sur ${h.a('cotisations-tns', 'les cotisations TNS')}.</p>
<p>Deux limites du calcul. Les professions libérales réglementées affiliées à la Cipav ou à une autre caisse ont un barème de retraite propre, que ce simulateur ne traite pas. Le mini-simulateur n’applique pas l’${h.src('urssafAcre2026', 'Acre')}, dont l’effet est chiffré plus haut dans la FAQ. Ces montants sont des estimations, pas un conseil personnalisé : l’Urssaf et le service des impôts fixent ce que vous devez.</p>`,
  },
  en: {
    slug: 'sole-trader-ei',
    nav: 'Sole trader on real profit',
    card: 'Contributions on profit, the yearly minimum and tax for a French sole trader.',
    title: 'Sole trader EI 2026: real-profit contributions and take-home',
    description: 'French sole trader (EI) on real profit in 2026: contributions on profit after a 26% allowance, a minimum owed even at zero profit, income tax and take-home.',
    h1: 'Sole trader on real profit: what your profit costs and leaves',
    intro: 'No company and no turnover ceiling: a French entreprise individuelle on real profit pays contributions on what you actually earn, after costs.',
    resume: `A sole trader in France, an entrepreneur individuel or EI taxed on real profit (au réel) rather than under the micro scheme, pays about ${EN.pct(d50.cotisations / b50, 0)} of profit in social contributions and CSG-CRDS levies in 2026: on ${EN.eur(b50)} of profit before contributions, our engine finds ${EN.eur(d50.cotisations)} of social charges, ${EN.eur(o50.impotRevenu)} of income tax for a single person, and ${EN.eur(o50.net)} left over the year. Unlike a micro-entrepreneur, you deduct real business costs and pay on the result, not on turnover. Since the reform applied in 2026, the Urssaf, which collects social contributions, works everything out on a single base: profit before contributions minus a ${EN.pct(T.abattement, 0)} allowance. Health and family-benefit rates rise with income, the basic pension rate is ${EN.pct(T.retraite_base.t1, 2)} up to the social security ceiling (Pass) of ${EN.eur(PASS)}, and the supplementary pension ${EN.pct(T.retraite_compl.t1)}. Even with no profit at all, minimum contributions apply, ${EN.eur(zero.cotisations)} a year in our engine. Profit is then taxed on the progressive scale in your own name, with no corporate tax.`,
    faqs: [
      { q: 'How much do I pay on €50,000 of profit as a French sole trader?', a: `Our engine finds ${EN.eur(d50.cotisations)} for a trader or unregulated freelancer, CSG-CRDS levies and training levy included, ${EN.pct(d50.cotisations / b50)} of profit. The base used is ${EN.eur(d50.assiette)} after the ${EN.pct(T.abattement, 0)} allowance. You keep ${EN.eur(o50.net)} after ${EN.eur(o50.impotRevenu)} of income tax as a single person. 2026 Urssaf scale.` },
      { q: 'Do I owe contributions in a year with zero profit?', a: `Yes, minimums apply: ${EN.eur(T.minimums_publies.retraite_base)} for basic pension, ${EN.eur(T.minimums_publies.ij)} for sick pay, ${EN.eur(T.minimums_publies.invalidite_deces)} for disability and death cover and ${EN.eur(T.minimums_publies.cfp_commercant)} of training levy (${EN.eur(T.minimums_publies.cfp_artisan)} for a craftsperson), according to the Urssaf. They do not apply if you receive the RSA or the prime d’activité, two French income-support benefits. Our engine gives ${EN.eur(zero.cotisations)} at zero profit.` },
      { q: 'What does a new sole trader pay in the first months?', a: `At the start the Urssaf does not yet know your income, so it calls provisional contributions on flat bases, expressed as fractions of the ${EN.eur(PASS)} social security ceiling, then adjusts them once your first profit is declared. The first payments do not fall due on registration but after a waiting period set by the Urssaf. Keep money aside: the adjustment can be heavy if the year went well.` },
      { q: 'Is a sole trader taxed on profit after contributions?', a: `Almost entirely. Contributions are deducted from taxable profit, except the non-deductible part of the CSG-CRDS levies, ${EN.pct(T.csg_crds.non_deductible)} of the base out of ${EN.pct(T.csg_crds.total)}. On ${EN.eur(b50)} of profit before contributions, the engine keeps ${EN.eur(d50.imposable)} of taxable income, which then goes through the 2026 income tax scale together with the rest of your household.` },
      { q: 'Does Acre relief cut a sole trader’s contributions?', a: `Yes, at the start, for eligible founders who apply to the Urssaf within ${P.micro.acre.delai_demande_jours} days. It waives a quarter of health, sick pay, family benefit, basic pension and disability contributions, in full up to ${EN.eur(T.acre.seuil_pass * PASS)} of income and tapering off up to ${EN.eur(PASS)}. On ${EN.eur(bAcre)} of profit, our engine puts it at ${EN.eur(acre.exonerationAcre)}.` },
      { q: 'Sole trader or EURL under corporate tax: how big is the gap?', a: `Small. On ${EN.eur(60000)} of freelance turnover and ${EN.eur(15000)} of costs, the engine gives ${EN.eur(duo.ei.net)} a year as a sole trader and ${EN.eur(duo.eurl.net)} through an EURL paying corporate tax, the manager being paid mostly through pay taxed like a salary after a ${EN.pct(P.ir.abattement_salaires.taux, 0)} allowance. Contributions are the same: in both cases you are self-employed.` },
    ],
    body: (h) => `
<h2>What profit costs, level by level</h2>
<p>The table follows a sole trader on real profit, either a trader or an unregulated freelancer, from a small profit to an established business. “Profit” means before contributions, after business costs. Take-home is what remains after contributions and income tax for a single person with no other income.</p>
${h.table(['Profit before contributions', 'Contributions and CSG-CRDS', 'Rate on profit', 'Income tax', 'Take-home / yr'], grille.map((g) => [h.eur(g.b), h.eur(g.r.cotisations), h.pct(g.r.cotisations / g.b), h.eur(g.o.impotRevenu), h.eur(g.o.net)]), 'Sole trader on real profit, 2026 scales, single person', ['l', 'r', 'r', 'r', 'r'])}
<p>The overall rate stays between ${h.pct(tMin)} and ${h.pct(tMax)} across the whole range. It climbs in the middle, as the sliding health rate rises and family benefits kick in above ${h.pct(T.alloc_familiales.seuil_pass, 0)} of the ceiling, then eases off for large profits once you pass the ceiling above which basic pension drops to ${h.pct(T.retraite_base.t2, 2)}.</p>

<h2>One base since the reform</h2>
<p>Until 2025, a self-employed person’s contributions and CSG-CRDS each had their own base. The ${h.src('urssafReforme', 'Urssaf reform')}, set by ${h.src('decret2024688', 'decree no. 2024-688 of 5 July 2024')}, merged them: business income before contributions, minus ${h.pct(T.abattement, 0)}. The allowance cannot fall below ${h.pct(T.abattement_min_pass, 2)} of the annual ceiling nor exceed ${h.pct(T.abattement_max_pass, 0)} of it, ${h.eur(plafondAbatt)}, so it stops growing beyond about ${h.eur(beneficePlafond)} of profit. The reform has applied since the adjustment of 2025 income, carried out in 2026.</p>
<h3>The breakdown on ${h.eur(b50)} of profit</h3>
${h.table(['Item', 'Amount'], [
  ['Base after allowance', h.eur(d50.assiette)],
  ['Health and maternity (sliding rate)', h.eur(d50.maladie)],
  [`Sick pay (${h.pct(T.ij.taux)})`, h.eur(d50.ij)],
  [`Basic pension (${h.pct(T.retraite_base.t1, 2)})`, h.eur(d50.retraiteBase)],
  [`Supplementary pension (${h.pct(T.retraite_compl.t1)})`, h.eur(d50.retraiteCompl)],
  [`Disability and death (${h.pct(T.invalidite_deces.taux)})`, h.eur(d50.invalidite)],
  ['Family benefits', h.eur(d50.allocations)],
  [`CSG-CRDS (${h.pct(T.csg_crds.total)})`, h.eur(d50.csgCrds)],
  ['Training levy', h.eur(d50.cfp)],
  ['Total', h.eur(d50.cotisations)],
], `Contributions of a trader or unregulated freelancer, ${h.src('urssafTauxAC', '2026 Urssaf scale')}`, ['l', 'r'])}
<p>Health contributions are zero below ${h.pct(T.maladie.points[1][0], 0)} of the annual ceiling, then climb in steps up to ${h.pct(T.maladie.points[T.maladie.points.length - 1][1])} at ${h.num(nPlafonds)} times the ceiling. Family benefits work the same way: nothing below ${h.pct(T.alloc_familiales.seuil_pass, 0)} of the ceiling, ${h.pct(T.alloc_familiales.taux)} from ${h.pct(T.alloc_familiales.plein_pass, 0)}. Of the ${h.pct(T.csg_crds.total)} CSG-CRDS, ${h.pct(T.csg_crds.deductible)} comes off taxable income.</p>

<h2>The timing: provisional first, adjusted later</h2>
<p>This is what most surprises people coming from the micro scheme, or from countries where the self-employed settle up once a year. Under micro, the contribution is final the day you declare receipts. On real profit, the Urssaf calls provisional amounts and corrects them once final profit is known. At the very start, with no history, it uses flat bases (${h.src('urssafTauxAC', 'Urssaf')}), and the first direct debits only arrive after a start-up delay. A profitable first year is therefore partly paid for later: setting aside a share of every payment you receive avoids a nasty adjustment bill.</p>

<h2>Income tax: profit in your own name</h2>
<p>A sole trader pays no corporate tax. Profit, after contributions other than the non-deductible CSG-CRDS, is added to the rest of the household’s income and taxed on the ${h.src('spBareme', '2026 progressive scale')}: ${h.pct(P.ir.bareme[1][1], 0)} from ${h.eur(P.ir.bareme[0][0] as number)} per share of the French family quotient, ${h.pct(P.ir.bareme[2][1], 0)} above ${h.eur(P.ir.bareme[1][0] as number)}. On ${h.eur(b50)} of profit, the engine’s taxable income is ${h.eur(d50.imposable)}. The mini-calculator at the top reruns this with your own turnover and costs.</p>

<h2>When a sole trader on real profit makes sense</h2>
<p>It suits people with significant costs who do not want a company: a craftsperson buying equipment, a consultant renting an office, a shopkeeper with heavy purchases. There is no turnover ceiling. Against the micro scheme, the sums are on ${h.a('micro-ou-reel', 'micro or real profit')}. Against a company, an ${h.a('eurl', 'EURL')} (one-member limited company) paying corporate tax keeps the same social security status: on ${h.eur(60000)} of turnover and ${h.eur(15000)} of costs the engine gives ${h.eur(duo.ei.net)} as a sole trader and ${h.eur(duo.eurl.net)} through an EURL, a gap that has to cover the running costs of a company. The full scale is on ${h.a('cotisations-tns', 'TNS contributions')}.</p>
<p>Two limits. Regulated professions attached to the Cipav or another professional fund have their own pension scale, which this calculator does not cover. The mini-calculator leaves out ${h.src('urssafAcre2026', 'Acre')} relief, whose effect is worked out in the FAQ. These amounts are estimates, not personal advice: the Urssaf and the tax office decide what you owe.</p>`,
  },
});
