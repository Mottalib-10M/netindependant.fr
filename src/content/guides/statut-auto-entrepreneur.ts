import { defineGuide } from '../../lib/guide-types';
import { micro, revenuAbattu, type Activite } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Ce que finance un même chiffre d'affaires de 30 000 € selon la catégorie (moteur + répartition 2026).
const CA = 30000;
const r = P.micro.repartition;
const CATS: Array<{ a: Activite; fr: string; en: string }> = [
  { a: 'vente', fr: 'Vente', en: 'Sales' },
  { a: 'bic', fr: 'Services BIC', en: 'BIC services' },
  { a: 'bnc', fr: 'Libéral BNC', en: 'Liberal BNC' },
  { a: 'cipav', fr: 'Cipav', en: 'Cipav' },
];
const droits = CATS.map((c) => {
  const m = micro({ ca: CA, activite: c.a });
  const q = r[c.a];
  return { ...c, cot: m.cotisations, retraite: m.cotisations * (q.retraite_base + q.retraite_compl), maladie: m.cotisations * q.maladie, inval: m.cotisations * q.invalidite, csg: m.cotisations * q.csg_crds, ij: revenuAbattu(CA, c.a).revenu };
});
const [venteD, bicD, bncD, cipavD] = droits;
// Un même consultant libéral à 30 000 € : part qui va à la retraite et part sans droit propre.
const partRetraiteBnc = r.bnc.retraite_base + r.bnc.retraite_compl;
const plafS = P.micro.plafonds.services;

export default defineGuide({
  id: 'statut-auto-entrepreneur',
  group: 'creation',
  order: 40,
  mini: 'repartition',
  related: ['charges-auto-entrepreneur', 'micro-entreprise', 'auto-entrepreneur-cipav', 'plafond-micro-entreprise', 'statut-freelance', 'creer-micro-entreprise'],
  sources: ['aeEssentiel', 'decret2025943', 'urssafReforme', 'spCotisationsMicro', 'spPlafonds'],
  fr: {
    slug: 'statut-auto-entrepreneur',
    nav: 'Statut et protection sociale',
    card: 'Ce que le statut d’auto-entrepreneur couvre : santé, indemnités, retraite, et ce qu’il laisse de côté.',
    title: 'Statut auto-entrepreneur 2026 : protection sociale et droits',
    description: 'Statut auto-entrepreneur 2026 : en libéral, 67,4 % des cotisations vont à la retraite, la CPAM couvre la santé et les indemnités se calculent sur le CA abattu.',
    h1: 'Le statut d’auto-entrepreneur : ce que vos cotisations vous ouvrent',
    intro: 'Un taux unique sur le chiffre d’affaires, mais derrière lui une protection sociale précise, avec ses forces et ses angles morts.',
    resume: `Le statut d’auto-entrepreneur, ou micro-entrepreneur, réunit deux régimes simplifiés : le micro-social, où les cotisations sont un pourcentage du chiffre d’affaires encaissé, et le micro-fiscal, où l’impôt porte sur ce chiffre d’affaires diminué d’un abattement forfaitaire. Ces cotisations ouvrent une vraie protection. L’assurance maladie relève de la CPAM, et les indemnités journalières de maladie, de maternité et de paternité se calculent sur le chiffre d’affaires abattu, c’est-à-dire après ${FR.pct(P.micro.abattement.vente, 0)}, ${FR.pct(P.micro.abattement.bic, 0)} ou ${FR.pct(P.micro.abattement.bnc, 0)} d’abattement selon l’activité. Depuis le 1er janvier 2026, la répartition a changé sans toucher au taux global : pour un libéral non réglementé, ${FR.pct(partRetraiteBnc)} des cotisations financent la retraite de base et complémentaire, et ${FR.pct(r.bnc.csg_crds)} vont à la CSG-CRDS, qui n’ouvre aucun droit propre. Sur ${FR.eur(CA)} encaissés en libéral, cela fait ${FR.eur(bncD.retraite)} pour la retraite. Ces chiffres sont des estimations, sans valeur de conseil personnalisé ; l’Urssaf fixe les montants.`,
    faqs: [
      { q: 'Sur quel revenu sont calculées les indemnités journalières d’un auto-entrepreneur ?', a: `Sur le chiffre d’affaires abattu, pas sur le chiffre d’affaires brut. L’abattement est de ${FR.pct(P.micro.abattement.vente, 0)} en vente, ${FR.pct(P.micro.abattement.bic, 0)} en services commerciaux ou artisanaux et ${FR.pct(P.micro.abattement.bnc, 0)} en libéral, selon l’Urssaf. Pour ${FR.eur(CA)} encaissés, le revenu retenu va donc de ${FR.eur(venteD.ij)} en vente à ${FR.eur(bncD.ij)} en libéral. La règle vaut pour la maladie, la maternité et la paternité.` },
      { q: 'À quelle caisse d’assurance maladie l’auto-entrepreneur est-il rattaché ?', a: `À la CPAM, la caisse primaire d’assurance maladie, d’après l’Urssaf. La part maladie de ses cotisations, ${FR.pct(r.bic.maladie)} pour un commerçant ou un artisan et ${FR.pct(r.bnc.maladie)} pour un libéral non réglementé en 2026, finance ses soins et ses indemnités journalières. Il n’a pas de cotisation séparée à payer : tout passe par la déclaration de chiffre d’affaires.` },
      { q: 'La CSG-CRDS prélevée sur un auto-entrepreneur lui ouvre-t-elle des droits ?', a: `Non, elle ne crée aucun droit propre : c’est une contribution qui finance la protection sociale dans son ensemble. Elle représente ${FR.pct(r.bnc.csg_crds)} des cotisations d’un libéral en 2026, ${FR.pct(r.bic.csg_crds)} pour un commerçant ou un artisan, selon le décret du 8 septembre 2025. Sur ${FR.eur(CA)} encaissés en libéral, ${FR.eur(bncD.csg)} y sont consacrés.` },
      { q: 'La nouvelle répartition des cotisations en 2026 a-t-elle augmenté le taux de l’auto-entrepreneur ?', a: `Non. Le taux global reste celui de l’activité, ${FR.pct(P.micro.taux.bnc)} en libéral non réglementé ou ${FR.pct(P.micro.taux.bic)} en services BIC. Ce qui change au 1er janvier 2026, c’est la ventilation : la part de CSG-CRDS baisse au profit des cotisations de retraite, qui ouvrent des droits. Pour un libéral, la retraite reçoit désormais ${FR.pct(partRetraiteBnc)} des sommes versées, selon l’Urssaf.` },
      { q: 'Un auto-entrepreneur peut-il choisir de cotiser plus pour être mieux protégé ?', a: `Oui, en demandant les cotisations minimales à l’Urssaf, avant le 31 décembre pour l’année suivante ou avant la fin du troisième mois après la création. Le calcul bascule alors sur celui d’un travailleur indépendant classique, avec des montants planchers. Le simulateur de ce site ne modélise pas cette option ; il applique le taux de ${FR.pct(P.micro.taux.bnc)} ou celui de votre activité.` },
      { q: 'Dans quels cas perd-on le statut d’auto-entrepreneur ?', a: `Quand le chiffre d’affaires dépasse le plafond deux années de suite, ${FR.eur(plafS)} pour les services ou ${FR.eur(P.micro.plafonds.vente)} pour la vente : la sortie a lieu au 1er janvier suivant, et le régime micro-social suit le micro-fiscal. Un seul dépassement est toléré. On peut aussi en sortir volontairement en optant pour un régime réel, selon service-public.` },
    ],
    body: (h) => `
<h2>Un statut, deux régimes simplifiés</h2>
<p>On parle de statut d’auto-entrepreneur, mais il s’agit surtout d’un mode de calcul. Côté social, le régime micro-social : un taux fixe sur chaque euro encaissé, déclaré au mois ou au trimestre (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}). Côté fiscal, le régime micro-fiscal : un abattement forfaitaire tient lieu de frais réels. Les deux vont ensemble. Le seuil du micro-fiscal, ${h.eur(plafS)} en services et ${h.eur(P.micro.plafonds.vente)} en vente, commande aussi le micro-social : le dépasser deux années consécutives fait sortir des deux (${h.src('spPlafonds', 'service-public, fiche F32353')}). Les chiffres d’affaires et leurs limites sont détaillés sur ${h.a('plafond-micro-entreprise', 'les plafonds de la micro-entreprise')}.</p>
<p>Cette page s’intéresse à l’autre face : ce que les cotisations achètent. Les taux eux-mêmes sont expliqués sur ${h.a('charges-auto-entrepreneur', 'les charges de l’auto-entrepreneur')}.</p>

<h2>Ce que finance un chiffre d’affaires de ${h.eur(CA)}</h2>
<p>Le tableau applique la répartition entrée en vigueur au 1er janvier 2026 (${h.src('decret2025943', 'décret n° 2025-943 du 8 septembre 2025')}) aux cotisations calculées par le moteur pour un même chiffre d’affaires annuel. La dernière ligne donne le revenu sur lequel l’assurance maladie calcule les indemnités journalières.</p>
${h.table(['Pour ' + h.eur(CA) + ' encaissés', ...droits.map((d) => d.fr)], [
  ['Cotisations totales', ...droits.map((d) => h.eur(d.cot))],
  ['Retraite de base et complémentaire', ...droits.map((d) => h.eur(d.retraite))],
  ['Maladie et indemnités journalières', ...droits.map((d) => h.eur(d.maladie))],
  ['Invalidité-décès', ...droits.map((d) => h.eur(d.inval))],
  ['CSG-CRDS, sans droit propre', ...droits.map((d) => h.eur(d.csg))],
  ['Revenu servant aux indemnités', ...droits.map((d) => h.eur(d.ij))],
], `Destination des cotisations d’un micro-entrepreneur pour un chiffre d’affaires de ${h.eur(CA)} en 2026, selon la catégorie`, ['l', 'r', 'r', 'r', 'r'])}
<p>Deux constats. La vente cotise peu, ${h.eur(venteD.cot)}, et finance donc peu de retraite en euros, même si la part est élevée en pourcentage. Et c’est en vente que le revenu servant aux indemnités est le plus faible, ${h.eur(venteD.ij)}, parce que l’abattement de ${h.pct(P.micro.abattement.vente, 0)} y est le plus fort : un commerçant en arrêt maladie touche des indemnités calculées sur un revenu bien inférieur à son chiffre d’affaires.</p>

<h2>La santé : CPAM et indemnités journalières</h2>
<p>Le micro-entrepreneur relève de la CPAM pour l’assurance maladie (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Ses cotisations ouvrent droit à des indemnités journalières en cas de maladie, de maternité ou de paternité. Le point faible tient à leur base : le chiffre d’affaires abattu. Un libéral à ${h.eur(CA)} est indemnisé sur ${h.eur(bncD.ij)}, un prestataire commercial sur ${h.eur(bicD.ij)}. Plus le chiffre d’affaires est modeste, plus ces indemnités le sont aussi.</p>

<h2>La retraite : la part qui grossit</h2>
<p>La réforme de 2026 n’a pas changé le taux affiché, elle a déplacé l’argent. La CSG-CRDS, qui ne crée aucun droit, recule ; la retraite de base et la retraite complémentaire, qui en créent, progressent (${h.src('urssafReforme', 'Urssaf, réforme des cotisations des indépendants')}). Pour un libéral non réglementé, ${h.pct(r.bnc.retraite_base)} des cotisations vont désormais à la retraite de base et ${h.pct(r.bnc.retraite_compl)} à la complémentaire. Le taux des libéraux avait déjà été relevé par étapes, de ${h.pct(P.micro.historique_bnc.jusqu_a_2024_06)} jusqu’en juin 2024 à ${h.pct(P.micro.historique_bnc.y2025)} en 2025, puis ${h.pct(P.micro.taux.bnc)} en 2026.</p>
<p>Ce que ces euros valent en droits dépend du chiffre d’affaires déclaré sur l’année entière ; ce site ne chiffre pas les trimestres validés. Retenez simplement qu’un chiffre d’affaires faible donne des cotisations faibles, donc des droits faibles.</p>

<h2>Le cas des professions de la Cipav</h2>
<p>Architectes, ingénieurs conseils, ostéopathes, psychologues, moniteurs de ski, guides-conférenciers et quelques autres professions réglementées relèvent de la Cipav pour leur retraite. Leur taux est de ${h.pct(P.micro.taux.cipav)}, et leur répartition diffère : ${h.pct(r.cipav.retraite_compl)} pour la complémentaire, plus que la retraite de base (${h.pct(r.cipav.retraite_base)}), et ${h.pct(r.cipav.maladie)} pour la maladie. La liste complète et ses conséquences sont sur ${h.a('auto-entrepreneur-cipav', 'l’auto-entrepreneur Cipav')}.</p>

<h2>Cotiser plus : l’option des cotisations minimales</h2>
<p>Un micro-entrepreneur qui démarre doucement peut trouver ses droits trop maigres. Il peut demander à l’Urssaf de cotiser sur une base minimale, avant le 31 décembre pour l’année suivante ou dans les trois mois de la création. Il quitte alors le calcul proportionnel pour celui d’un travailleur indépendant classique. Le choix se discute : il augmente les sommes versées les petites années. Ce site ne le simule pas.</p>

<h2>Quand le statut ne suffit plus</h2>
<p>Le statut repose sur un chiffre d’affaires plafonné et des frais forfaitisés. Quand l’activité grandit ou que l’on veut une protection construite autrement, les alternatives sont l’entreprise individuelle au réel, la société ou le portage salarial, comparés sur ${h.a('statut-freelance', 'le statut freelance')}. En outre-mer, des taux réduits s’appliquent pendant trois ans, non modélisés ici. Comme toujours sur ce site, les montants sont des estimations : l’Urssaf et l’assurance maladie fixent vos droits réels. Le récapitulatif général du régime est sur ${h.a('micro-entreprise', 'la micro-entreprise')}.</p>`,
  },
  en: {
    slug: 'social-cover',
    nav: 'Status and social cover',
    card: 'What the micro-entrepreneur status covers: health, sick pay, pension, and what it leaves out.',
    title: 'Micro-entrepreneur status 2026: social cover and benefits',
    description: 'Micro-entrepreneur status in France 2026: for freelancers 67.4% of contributions fund pensions, the CPAM covers health, sick pay uses turnover after allowance.',
    h1: 'The micro-entrepreneur status: what your contributions buy you',
    intro: 'One rate on turnover, but behind it a defined package of social cover, with its strengths and its blind spots.',
    resume: `The French micro-entrepreneur status, also called auto-entrepreneur, combines two simplified regimes: the micro-social regime, where social contributions are a percentage of the turnover you receive, and the micro-fiscal regime, where income tax applies to turnover minus a flat allowance. Those contributions buy real cover. Health insurance is handled by the CPAM, the local branch of the French state health insurance, and sick pay, maternity and paternity benefits are calculated on turnover after the allowance of ${EN.pct(P.micro.abattement.vente, 0)}, ${EN.pct(P.micro.abattement.bic, 0)} or ${EN.pct(P.micro.abattement.bnc, 0)} depending on the activity. Since 1 January 2026 the split has changed without touching the overall rate: for an unregulated liberal profession (independent professional services such as consulting), ${EN.pct(partRetraiteBnc)} of contributions fund basic and supplementary pensions, and ${EN.pct(r.bnc.csg_crds)} go to the CSG-CRDS social levies, which give no rights of their own. On ${EN.eur(CA)} of liberal turnover, that is ${EN.eur(bncD.retraite)} for pensions. These are estimates, not personal advice; the Urssaf sets the amounts.`,
    faqs: [
      { q: 'What income is French sick pay based on for a micro-entrepreneur?', a: `On turnover after the flat allowance, not on gross turnover. The allowance is ${EN.pct(P.micro.abattement.vente, 0)} for sales, ${EN.pct(P.micro.abattement.bic, 0)} for commercial or craft services and ${EN.pct(P.micro.abattement.bnc, 0)} for liberal professions, according to the Urssaf. On ${EN.eur(CA)} received, the income used therefore ranges from ${EN.eur(venteD.ij)} for sales to ${EN.eur(bncD.ij)} for liberal work. The rule covers sickness, maternity and paternity.` },
      { q: 'Which health insurance fund covers a micro-entrepreneur in France?', a: `The CPAM, the caisse primaire d’assurance maladie, the local branch of French state health insurance, according to the Urssaf. The health share of your contributions, ${EN.pct(r.bic.maladie)} for traders and craftspeople and ${EN.pct(r.bnc.maladie)} for unregulated liberal professions in 2026, funds your care and sick pay. There is no separate premium: everything goes through the turnover return.` },
      { q: 'Does the CSG-CRDS I pay as a micro-entrepreneur give me any rights?', a: `No, it creates no rights of its own: it is a levy that funds social protection as a whole. It makes up ${EN.pct(r.bnc.csg_crds)} of a liberal professional’s contributions in 2026 and ${EN.pct(r.bic.csg_crds)} for traders and craftspeople, under the decree of 8 September 2025. On ${EN.eur(CA)} of liberal turnover, ${EN.eur(bncD.csg)} goes to it.` },
      { q: 'Did the 2026 contribution split raise the micro-entrepreneur rate?', a: `No. The overall rate stays that of your activity, ${EN.pct(P.micro.taux.bnc)} for unregulated liberal professions or ${EN.pct(P.micro.taux.bic)} for BIC services. What changed on 1 January 2026 is the split: the CSG-CRDS share falls in favour of pension contributions, which do build rights. For a liberal professional, pensions now receive ${EN.pct(partRetraiteBnc)} of what is paid, according to the Urssaf.` },
      { q: 'Can a micro-entrepreneur choose to pay more for better cover?', a: `Yes, by asking the Urssaf for minimum contributions, before 31 December for the following year or before the end of the third month after starting. Your contributions are then calculated like those of other self-employed people, with floor amounts. This site’s calculator does not model that option; it applies ${EN.pct(P.micro.taux.bnc)} or the rate of your activity.` },
      { q: 'When do you lose micro-entrepreneur status in France?', a: `When turnover exceeds the ceiling two years in a row, ${EN.eur(plafS)} for services or ${EN.eur(P.micro.plafonds.vente)} for sales: you leave on the following 1 January, and the micro-social regime follows the micro-fiscal one. Going over once is tolerated. You can also leave voluntarily by opting for a real-profit regime, according to service-public.` },
    ],
    body: (h) => `
<h2>One status, two simplified regimes</h2>
<p>People speak of the auto-entrepreneur status, but it is mainly a way of calculating. On the social side sits the micro-social regime: a fixed rate on every euro received, declared monthly or quarterly (${h.src('spCotisationsMicro', 'service-public, sheet F36232')}). On the tax side, the micro-fiscal regime: a flat allowance stands in for real costs. The two go together. The micro-fiscal ceiling, ${h.eur(plafS)} for services and ${h.eur(P.micro.plafonds.vente)} for sales, also governs the micro-social regime: going over it two years running takes you out of both (${h.src('spPlafonds', 'service-public, sheet F32353')}). Turnover limits are detailed on ${h.a('plafond-micro-entreprise', 'the turnover ceilings page')}.</p>
<p>This page looks at the other side: what the contributions buy. The rates themselves are explained on ${h.a('charges-auto-entrepreneur', 'micro-enterprise contributions')}.</p>

<h2>What ${h.eur(CA)} of turnover pays for</h2>
<p>The table applies the split in force since 1 January 2026 (${h.src('decret2025943', 'decree no. 2025-943 of 8 September 2025')}) to the contributions the engine calculates for the same yearly turnover. The last row shows the income the health insurance uses to calculate sick pay.</p>
${h.table(['For ' + h.eur(CA) + ' received', ...droits.map((d) => d.en)], [
  ['Total contributions', ...droits.map((d) => h.eur(d.cot))],
  ['Basic and supplementary pension', ...droits.map((d) => h.eur(d.retraite))],
  ['Health and sick pay', ...droits.map((d) => h.eur(d.maladie))],
  ['Disability and death', ...droits.map((d) => h.eur(d.inval))],
  ['CSG-CRDS, no rights of its own', ...droits.map((d) => h.eur(d.csg))],
  ['Income used for sick pay', ...droits.map((d) => h.eur(d.ij))],
], `Where a micro-entrepreneur’s contributions go on ${h.eur(CA)} of turnover in 2026, by category`, ['l', 'r', 'r', 'r', 'r'])}
<p>Two things stand out. Sales pay little, ${h.eur(venteD.cot)}, and so fund little pension in euros, even if the share is high in percentage terms. And sales also have the lowest income for sick pay, ${h.eur(venteD.ij)}, because the ${h.pct(P.micro.abattement.vente, 0)} allowance is the largest: a shopkeeper off sick is paid on an income far below turnover.</p>

<h2>Health: the CPAM and sick pay</h2>
<p>Micro-entrepreneurs belong to the CPAM for health insurance (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). Contributions open rights to daily allowances, the French indemnités journalières, during sickness, maternity or paternity leave. The weak point is the base: turnover after the allowance. A liberal professional on ${h.eur(CA)} is covered on ${h.eur(bncD.ij)}, a commercial service provider on ${h.eur(bicD.ij)}. The lower the turnover, the lower those benefits.</p>

<h2>Pensions: the growing share</h2>
<p>The 2026 reform did not change the headline rate; it moved the money. The CSG-CRDS, which creates no rights, shrinks; the basic and supplementary pensions, which do, grow (${h.src('urssafReforme', 'Urssaf, reform of self-employed contributions')}). For an unregulated liberal profession, ${h.pct(r.bnc.retraite_base)} of contributions now go to the basic pension and ${h.pct(r.bnc.retraite_compl)} to the supplementary one. The liberal rate had already risen in steps, from ${h.pct(P.micro.historique_bnc.jusqu_a_2024_06)} until June 2024 to ${h.pct(P.micro.historique_bnc.y2025)} in 2025, then ${h.pct(P.micro.taux.bnc)} in 2026.</p>
<p>What those euros are worth in pension rights depends on the turnover declared over the whole year; this site does not estimate the quarters validated. The simple rule: low turnover means low contributions and therefore thin rights.</p>

<h2>Cipav professions</h2>
<p>Architects, consulting engineers, osteopaths, psychologists, ski instructors, tour guides and some other regulated professions belong to the Cipav, a separate pension fund. Their rate is ${h.pct(P.micro.taux.cipav)} and the split differs: ${h.pct(r.cipav.retraite_compl)} for the supplementary pension, more than for the basic pension (${h.pct(r.cipav.retraite_base)}), and ${h.pct(r.cipav.maladie)} for health. The full list is on ${h.a('auto-entrepreneur-cipav', 'the Cipav professions page')}.</p>

<h2>Paying more: the minimum contributions option</h2>
<p>A micro-entrepreneur who starts slowly may find the resulting rights too thin. You can ask the Urssaf to contribute on a minimum base, before 31 December for the following year or within three months of starting. You then leave the proportional calculation for the one used for other self-employed people. It is a trade-off: it raises what you pay in lean years. This site does not simulate it.</p>

<h2>When the status is no longer enough</h2>
<p>The status rests on capped turnover and flat-rate costs. When the business grows, or you want cover built differently, the alternatives are a sole trader on real profit, a company or portage salarial (umbrella employment), compared on ${h.a('statut-freelance', 'choosing a freelance legal status')}. In the French overseas territories, reduced rates apply for three years; they are not modelled here. As everywhere on this site, the figures are estimates: the Urssaf and the health insurance set your actual rights. The overview of the scheme is on ${h.a('micro-entreprise', 'the micro-enterprise scheme')}.</p>`,
  },
});
