import { defineGuide } from '../../lib/guide-types';
import { micro, revenuAbattu } from '../../lib/engine/micro';
import { impotRevenu } from '../../lib/engine/ir';
import { P, FR, EN } from '../../lib/fmt';

const ab = P.micro.abattement;
const bareme = P.ir.bareme as Array<[number | null, number]>;
const COUPLE = { parts: 2, couple: true };
// Développeuse libérale seule à 70 000 € : revenu imposable, impôt, taux marginal.
const dev = micro({ ca: 70000, activite: 'bnc' });
const devTmi = impotRevenu(dev.revenuAbattu).tmi;
// Coach à 30 000 € : la décote en action.
const coach = micro({ ca: 30000, activite: 'bnc' });
const coachDetail = impotRevenu(coach.revenuAbattu);
// Même activité à 60 000 €, seul ou en couple sans autre revenu.
const seul60 = micro({ ca: 60000, activite: 'bnc' });
const couple60 = micro({ ca: 60000, activite: 'bnc', foyer: COUPLE });
// Petit chiffre d'affaires : l'abattement minimal joue.
const petit = revenuAbattu(600, 'bnc');
// Chiffre d'affaires libéral à partir duquel une personne seule sans autre revenu paie l'impôt (pas de 100 €).
let seuilImpot = 0;
while (micro({ ca: seuilImpot, activite: 'bnc' }).ir <= 0 && seuilImpot < 100000) seuilImpot += 100;
// Tableau par niveau de chiffre d'affaires (libéral BNC).
const niveaux = [20000, 40000, 60000, 80000].map((ca) => {
  const s = micro({ ca, activite: 'bnc' });
  const c = micro({ ca, activite: 'bnc', foyer: COUPLE });
  return { ca, imposable: s.revenuAbattu, seul: s.ir, couple: c.ir, tmi: impotRevenu(s.revenuAbattu).tmi };
});
// Revenu imposable pour 40 000 € selon l'activité.
const base40 = (a: 'vente' | 'bic' | 'bnc') => revenuAbattu(40000, a).revenu;

export default defineGuide({
  id: 'impot-auto-entrepreneur',
  group: 'micro',
  order: 80,
  mini: 'impotMicro',
  related: ['versement-liberatoire', 'micro-entreprise', 'auto-entrepreneur-salarie', 'declarer-chiffre-affaires', 'micro-ou-reel'],
  sources: ['spMicroImposition', 'spBareme', 'spCalculImpot', 'spQuotient', 'aeEssentiel'],
  fr: {
    slug: 'impot-auto-entrepreneur',
    nav: 'Impôt de l’auto-entrepreneur',
    card: 'Abattement forfaitaire, barème du foyer, décote et quotient familial, chiffres à l’appui.',
    title: 'Impôt auto-entrepreneur 2026 : abattement et barème du foyer',
    description: 'Impôt auto-entrepreneur 2026 : abattement de 71 %, 50 % ou 34 % sur le chiffre d’affaires, puis barème du foyer. Exemples chiffrés seul, en couple, avec décote.',
    h1: 'L’impôt sur le revenu de l’auto-entrepreneur, du chiffre d’affaires au montant dû',
    intro: 'Le fisc ne regarde pas vos dépenses : il retire un pourcentage fixe, puis applique le barème de tout le foyer.',
    resume: `Un auto-entrepreneur paie l’impôt sur le revenu sur son chiffre d’affaires diminué d’un abattement forfaitaire : ${FR.pct(ab.vente, 0)} pour la vente de marchandises et l’hébergement, ${FR.pct(ab.bic, 0)} pour les prestations de services commerciales ou artisanales, ${FR.pct(ab.bnc, 0)} pour les activités libérales, avec un minimum de ${FR.eur(ab.minimum)}. Le reste s’ajoute aux autres revenus du foyer et passe au barème progressif, tranches, quotient familial et décote compris. En 2026, une développeuse libérale seule, sans autre revenu, qui encaisse ${FR.eur(70000)} déclare ${FR.eur(dev.revenuAbattu)} de revenu imposable et doit ${FR.eur(dev.ir)} d’impôt, avec un taux marginal de ${FR.pct(devTmi, 0)}. Ses frais réels n’entrent pas dans le calcul : l’abattement est le même qu’elle ait dépensé ${FR.eur(0)} ou ${FR.eur(20000)}. Pour les petits chiffres d’affaires, la décote efface souvent l’essentiel de l’impôt ; en couple, le quotient familial le divise fortement. La seule alternative au barème est le versement libératoire, réservé aux foyers sous un plafond de revenu fiscal de référence.`,
    faqs: [
      { q: 'Comment calcule-t-on le revenu imposable d’un auto-entrepreneur en libéral ?', a: `On retire ${FR.pct(ab.bnc, 0)} du chiffre d’affaires encaissé, sans regarder les dépenses réelles, avec un abattement d’au moins ${FR.eur(ab.minimum)}, selon service-public (fiche F23267). Sur ${FR.eur(70000)} de recettes, il reste ${FR.eur(dev.revenuAbattu)} imposables. Ce montant rejoint les autres revenus du foyer et c’est l’ensemble qui passe au barème de l’impôt sur le revenu.` },
      { q: 'Un micro-entrepreneur peut-il déduire ses frais réels de son impôt ?', a: `Non. L’abattement forfaitaire de ${FR.pct(ab.bnc, 0)}, ${FR.pct(ab.bic, 0)} ou ${FR.pct(ab.vente, 0)} selon l’activité tient lieu de frais, quel que soit leur montant réel, d’après service-public. Une libérale à ${FR.eur(40000)} de recettes est imposée sur ${FR.eur(base40('bnc'))}, même si elle a dépensé davantage que l’abattement. Au-delà, seule une option pour le régime réel permet de déduire les frais.` },
      { q: 'Pourquoi un auto-entrepreneur à 30 000 € de chiffre d’affaires paie-t-il si peu d’impôt ?', a: `À cause de la décote, qui allège l’impôt des foyers modestes. Un coach libéral seul à ${FR.eur(30000)} a ${FR.eur(coach.revenuAbattu)} de revenu imposable et un impôt brut de ${FR.eur(coachDetail.brutAvantDecote)}. La décote, égale à ${FR.eur(P.ir.decote.seul.forfait)} moins ${FR.pct(P.ir.decote.taux, 2)} de l’impôt brut, retire ${FR.eur(coachDetail.decote)} : il reste ${FR.eur(coachDetail.impot)}, selon le barème publié par service-public.` },
      { q: 'L’impôt d’un auto-entrepreneur baisse-t-il quand on déclare en couple ?', a: `Souvent beaucoup, grâce au quotient familial qui divise le revenu entre les parts. Une libérale à ${FR.eur(60000)} de recettes, sans autre revenu dans le foyer, paierait ${FR.eur(seul60.ir)} seule et ${FR.eur(couple60.ir)} en couple, soit deux parts, d’après le moteur du site appliquant le barème 2026. L’avantage par demi-part d’enfant est plafonné à ${FR.eur(P.ir.plafond_demi_part)}.` },
      { q: 'Où trouver le chiffre d’affaires à reporter sur sa déclaration de revenus ?', a: `L’Urssaf met à disposition, en février, une attestation fiscale dans votre espace en ligne sur autoentrepreneur.urssaf.fr. Elle récapitule le chiffre d’affaires déclaré sur l’année, à reporter brut, sans déduire aucune charge, sur la déclaration complémentaire 2042-C-PRO. L’administration applique ensuite elle-même l’abattement de ${FR.pct(ab.bnc, 0)} à ${FR.pct(ab.vente, 0)} selon la catégorie cochée.` },
      { q: 'À partir de quel chiffre d’affaires un libéral seul commence-t-il à payer l’impôt ?', a: `Pour une personne seule sans autre revenu, le moteur du site trouve un premier euro d’impôt vers ${FR.eur(seuilImpot)} de chiffre d’affaires libéral en 2026. En dessous, le revenu après abattement reste dans la tranche à ${FR.pct(bareme[0][1], 0)} ou la décote efface l’impôt, et un impôt inférieur à ${FR.eur(P.ir.seuil_recouvrement)} n’est pas recouvré, selon service-public.` },
    ],
    body: (h) => `
<h2>Du chiffre d’affaires au revenu imposable</h2>
<p>Le régime micro-fiscal ne demande aucun compte de résultat. L’administration part du chiffre d’affaires que vous déclarez et en retire un pourcentage fixé par la loi selon la catégorie d’activité (${h.src('spMicroImposition', 'service-public, fiche F23267')}). L’abattement ne peut pas descendre sous ${h.eur(ab.minimum)}, ni dépasser le chiffre d’affaires lui-même.</p>
${h.table(['Activité', 'Abattement', 'Revenu imposable pour ' + h.eur(40000) + ' encaissés'], [
  ['Vente de marchandises, hébergement (BIC)', h.pct(ab.vente, 0), h.eur(base40('vente'))],
  ['Prestations de services commerciales ou artisanales (BIC)', h.pct(ab.bic, 0), h.eur(base40('bic'))],
  ['Activités libérales (BNC), Cipav comprise', h.pct(ab.bnc, 0), h.eur(base40('bnc'))],
], 'Abattements forfaitaires du régime micro-fiscal en 2026', ['l', 'r', 'r'])}
<p>Le minimum ne joue que pour de très petits montants : une libérale qui encaisse ${h.eur(600)} sur l’année bénéficie d’un abattement de ${h.eur(petit.abattement)} au lieu de ${h.eur(600 * ab.bnc)}, et ne déclare que ${h.eur(petit.revenu)} imposables. En activité mixte, le minimum passe à ${h.eur(ab.minimum_mixte)}.</p>
<p>Le revenu imposable obtenu n’a rien à voir avec ce que vous avez réellement gagné. Pour une activité sans frais, il sous-estime le revenu ; pour une activité à forte dépense, il le surestime. C’est la contrepartie de la simplicité.</p>

<h2>Le barème du foyer s’applique ensuite</h2>
<p>Ce revenu imposable rejoint les salaires, pensions ou autres revenus du foyer fiscal. L’ensemble est divisé par le nombre de parts, taxé par tranches, puis multiplié à nouveau (${h.src('spBareme', 'service-public, fiche F1419')}). Le barème en vigueur est celui de la loi de finances pour 2026, qui porte sur les revenus 2025.</p>
${h.table(['Revenu par part', 'Taux'], bareme.map(([plafond, taux], i) => {
  const bas = i === 0 ? 0 : (bareme[i - 1][0] as number) + 1;
  return [plafond === null ? `au-delà de ${h.eur(bas - 1)}` : `de ${h.eur(bas)} à ${h.eur(plafond)}`, h.pct(taux, 0)];
}), 'Barème progressif de l’impôt sur le revenu (loi de finances pour 2026)', ['l', 'r'])}
<p>Deux correctifs comptent beaucoup pour un auto-entrepreneur. La décote d’abord : quand l’impôt brut d’une personne seule ne dépasse pas ${h.eur(P.ir.decote.seul.plafond)}, on en retire ${h.eur(P.ir.decote.seul.forfait)} moins ${h.pct(P.ir.decote.taux, 2)} de cet impôt (${h.src('spCalculImpot', 'service-public, fiche F34328')}). Le plafonnement du quotient familial ensuite : chaque demi-part liée à un enfant ne peut réduire l’impôt de plus de ${h.eur(P.ir.plafond_demi_part)} (${h.src('spQuotient', 'service-public, fiche F2705')}). Enfin, un impôt inférieur à ${h.eur(P.ir.seuil_recouvrement)} n’est pas mis en recouvrement.</p>

<h2>Quatre niveaux de recettes en libéral</h2>
<p>Le moteur calcule l’impôt imputable à l’activité pour une personne seule sans autre revenu, puis pour un couple dont c’est le seul revenu.</p>
${h.table(['Chiffre d’affaires', 'Revenu imposable', 'Impôt, seul', 'Impôt, couple', 'Taux marginal, seul'], niveaux.map((n) => [h.eur(n.ca), h.eur(n.imposable), h.eur(n.seul), h.eur(n.couple), h.pct(n.tmi, 0)]), 'Impôt sur le revenu d’un micro-entrepreneur libéral en 2026, calculé par le moteur', ['r', 'r', 'r', 'r', 'r'])}
<p>La progression n’est pas linéaire. Entre ${h.eur(40000)} et ${h.eur(60000)} de recettes, l’impôt de la personne seule fait plus que tripler, parce que le revenu imposable entre dans la tranche à ${h.pct(bareme[2][1], 0)} et que la décote disparaît. Le couple, lui, reste longtemps dans la tranche à ${h.pct(bareme[1][1], 0)}.</p>
<p>Si le foyer a d’autres revenus, tout se décale vers le haut : l’activité est taxée à partir du taux marginal que les salaires ont déjà atteint. Le mini-simulateur en haut de page permet d’ajouter ces revenus ; pour le cas fréquent d’une activité à côté d’un emploi, voyez ${h.a('auto-entrepreneur-salarie', 'auto-entrepreneur et salarié')}.</p>

<h2>La déclaration annuelle</h2>
<p>Chaque printemps, le chiffre d’affaires brut de l’année précédente se reporte sur la déclaration complémentaire 2042-C-PRO, dans la case de votre catégorie, sans rien déduire. L’Urssaf fournit en février une attestation fiscale dans votre espace en ligne, qui reprend les montants déclarés (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Le calendrier complet est sur ${h.a('declarer-chiffre-affaires', 'déclarer son chiffre d’affaires')}.</p>

<h2>Barème ou versement libératoire</h2>
<p>Le barème n’est pas la seule voie. Sous condition de revenu fiscal de référence, le ${h.a('versement-liberatoire', 'versement libératoire')} remplace cet impôt par ${h.pct(P.micro.vl.vente, 0)} à ${h.pct(P.micro.vl.bnc)} du chiffre d’affaires, payés avec les cotisations. Il avantage les foyers déjà imposés dans les tranches à ${h.pct(bareme[1][1], 0)} ou plus ; il pénalise ceux que la décote protège. Et si vos frais réels dépassent nettement l’abattement, c’est ${h.a('micro-ou-reel', 'le passage au réel')} qu’il faut étudier.</p>
<p>Ces montants sont des estimations calculées sur le barème publié ; ils ne remplacent pas un conseil personnalisé, et seul le service des impôts établit votre imposition.</p>`,
  },
  en: {
    slug: 'income-tax-micro-enterprise',
    nav: 'Income tax for micro-entrepreneurs',
    card: 'Flat allowance, household tax scale, low-tax discount and family quotient, with figures.',
    title: 'Income tax micro-entrepreneur 2026: allowance and tax scale',
    description: 'Income tax for French micro-entrepreneurs in 2026: a 71%, 50% or 34% flat allowance on turnover, then the household scale. Examples single and as a couple.',
    h1: 'Income tax on a French micro-enterprise, from turnover to the amount due',
    intro: 'The tax office ignores your actual costs: it removes a fixed percentage, then applies the scale to your whole household.',
    resume: `A French micro-entrepreneur pays income tax on turnover minus a flat allowance (abattement) that replaces actual business costs: ${EN.pct(ab.vente, 0)} for selling goods and accommodation, ${EN.pct(ab.bic, 0)} for commercial or craft services, ${EN.pct(ab.bnc, 0)} for freelance professions, with a minimum of ${EN.eur(ab.minimum)}. What remains is added to the rest of the household’s income and taxed on the progressive scale. France taxes the foyer fiscal, the tax household, not the individual: income is divided by a number of shares (one per adult, half or more per child), taxed band by band, then multiplied back. In 2026 a single freelance developer with no other income who receives ${EN.eur(70000)} reports ${EN.eur(dev.revenuAbattu)} of taxable income and owes ${EN.eur(dev.ir)}, with a marginal rate of ${EN.pct(devTmi, 0)}. Her real costs play no part. At low turnover a discount called the décote removes much of the bill; for a couple, the family quotient cuts it sharply. The only alternative is the flat-rate option, open to households under an income limit.`,
    faqs: [
      { q: 'How does France work out taxable income for a freelance micro-entrepreneur?', a: `It removes ${EN.pct(ab.bnc, 0)} from the turnover you received, without looking at actual costs, with an allowance of at least ${EN.eur(ab.minimum)}, according to service-public (sheet F23267). On ${EN.eur(70000)} of receipts, ${EN.eur(dev.revenuAbattu)} is taxable. That amount joins the rest of your household’s income, and the total goes through the French income tax scale.` },
      { q: 'Can I deduct my actual business costs from French income tax as a micro-entrepreneur?', a: `No. The flat allowance of ${EN.pct(ab.bnc, 0)}, ${EN.pct(ab.bic, 0)} or ${EN.pct(ab.vente, 0)} depending on your activity stands in for costs, whatever they really are, according to service-public. A freelancer receiving ${EN.eur(40000)} is taxed on ${EN.eur(base40('bnc'))} even if she spent more than the allowance. To deduct real costs, you need to opt for a real-profit regime.` },
      { q: 'Why does a micro-entrepreneur on €30,000 pay so little income tax?', a: `Because of the décote, a discount for modest tax bills. A single freelance coach on ${EN.eur(30000)} has ${EN.eur(coach.revenuAbattu)} of taxable income and a gross tax of ${EN.eur(coachDetail.brutAvantDecote)}. The discount, ${EN.eur(P.ir.decote.seul.forfait)} minus ${EN.pct(P.ir.decote.taux, 2)} of the gross tax, removes ${EN.eur(coachDetail.decote)}, leaving ${EN.eur(coachDetail.impot)}, under the scale published by service-public.` },
      { q: 'Does filing jointly as a couple lower tax on micro-enterprise income?', a: `Usually by a lot, because the family quotient spreads income over the household’s shares. A freelancer receiving ${EN.eur(60000)}, with no other household income, would pay ${EN.eur(seul60.ir)} as a single person and ${EN.eur(couple60.ir)} as a couple filing jointly with two shares, according to the site’s engine using the 2026 scale. The benefit of each child’s half share is capped at ${EN.eur(P.ir.plafond_demi_part)}.` },
      { q: 'Where do I find the turnover figure for my French tax return?', a: `Every February the Urssaf posts a tax certificate (attestation fiscale) in your online account on autoentrepreneur.urssaf.fr. It sums up the turnover you declared over the year, which you copy, gross and with no costs deducted, onto the supplementary return form 2042-C-PRO. The tax office then applies the ${EN.pct(ab.bnc, 0)} to ${EN.pct(ab.vente, 0)} allowance itself, depending on the category you tick.` },
      { q: 'At what turnover does a single freelancer start paying French income tax?', a: `For a single person with no other income, the site’s engine finds the first euro of tax at around ${EN.eur(seuilImpot)} of freelance turnover in 2026. Below that, income after the allowance stays in the ${EN.pct(bareme[0][1], 0)} band or the décote cancels the tax, and any tax under ${EN.eur(P.ir.seuil_recouvrement)} is not collected, according to service-public.` },
    ],
    body: (h) => `
<h2>From turnover to taxable income</h2>
<p>Under the micro tax regime you never prepare a profit and loss account. The tax office starts from the turnover you report and removes a percentage set by law for your category of activity (${h.src('spMicroImposition', 'service-public, sheet F23267')}). The allowance cannot be lower than ${h.eur(ab.minimum)} or larger than the turnover itself.</p>
${h.table(['Activity', 'Allowance', 'Taxable income on ' + h.eur(40000) + ' received'], [
  ['Selling goods, accommodation (BIC)', h.pct(ab.vente, 0), h.eur(base40('vente'))],
  ['Commercial or craft services (BIC)', h.pct(ab.bic, 0), h.eur(base40('bic'))],
  ['Freelance professions (BNC), Cipav included', h.pct(ab.bnc, 0), h.eur(base40('bnc'))],
], 'Flat allowances of the micro tax regime in 2026', ['l', 'r', 'r'])}
<p>The minimum only matters for tiny amounts: a freelancer who receives ${h.eur(600)} in the year gets a ${h.eur(petit.abattement)} allowance rather than ${h.eur(600 * ab.bnc)}, leaving ${h.eur(petit.revenu)} taxable. With a mixed activity, the minimum becomes ${h.eur(ab.minimum_mixte)}.</p>
<p>The resulting figure is a legal construct, not what you actually earned. For a business with no costs it understates income; for one with heavy costs it overstates it.</p>

<h2>Then the household scale</h2>
<p>If you come from a country that taxes each person separately, this is the big adjustment. In France, a couple taxed together files one return and pools its income. Your taxable micro income joins salaries, pensions and any other income of the household; the total is divided by the number of shares, taxed band by band, then multiplied back (${h.src('spBareme', 'service-public, sheet F1419')}). The scale in force is the one set by the 2026 budget for 2025 income.</p>
${h.table(['Income per share', 'Rate'], bareme.map(([plafond, taux], i) => {
  const bas = i === 0 ? 0 : (bareme[i - 1][0] as number) + 1;
  return [plafond === null ? `above ${h.eur(bas - 1)}` : `${h.eur(bas)} to ${h.eur(plafond)}`, h.pct(taux, 0)];
}), 'French progressive income tax scale (2026 budget)', ['l', 'r'])}
<p>Two adjustments matter for small businesses. The décote: when a single person’s gross tax is no more than ${h.eur(P.ir.decote.seul.plafond)}, ${h.eur(P.ir.decote.seul.forfait)} minus ${h.pct(P.ir.decote.taux, 2)} of that tax is taken off (${h.src('spCalculImpot', 'service-public, sheet F34328')}). The quotient cap: each half share for a child cannot cut tax by more than ${h.eur(P.ir.plafond_demi_part)} (${h.src('spQuotient', 'service-public, sheet F2705')}). Any tax under ${h.eur(P.ir.seuil_recouvrement)} is not collected.</p>

<h2>Four turnover levels for a freelancer</h2>
<p>The engine works out the tax due to the business for a single person with no other income, then for a couple for whom it is the only income.</p>
${h.table(['Turnover', 'Taxable income', 'Tax, single', 'Tax, couple', 'Marginal rate, single'], niveaux.map((n) => [h.eur(n.ca), h.eur(n.imposable), h.eur(n.seul), h.eur(n.couple), h.pct(n.tmi, 0)]), 'Income tax of a freelance micro-entrepreneur in 2026, computed by the engine', ['r', 'r', 'r', 'r', 'r'])}
<p>The curve is steep. Between ${h.eur(40000)} and ${h.eur(60000)} of receipts the single person’s tax more than triples, as taxable income enters the ${h.pct(bareme[2][1], 0)} band and the décote disappears. The couple stays in the ${h.pct(bareme[1][1], 0)} band much longer.</p>
<p>With other household income, everything shifts upwards: the business is taxed from whatever marginal rate the salaries have already reached. The mini-calculator at the top lets you add that income; for a business run alongside a job see ${h.a('auto-entrepreneur-salarie', 'a side business with a job')}.</p>

<h2>The yearly return</h2>
<p>Each spring the previous year’s gross turnover goes on the supplementary return 2042-C-PRO, in the box for your category, with nothing deducted. The Urssaf provides a tax certificate in February in your online account that repeats the amounts you declared (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). The full calendar is on ${h.a('declarer-chiffre-affaires', 'declaring your turnover')}.</p>

<h2>Scale or flat-rate option</h2>
<p>Subject to a reference income test, the ${h.a('versement-liberatoire', 'versement libératoire')} replaces this tax with ${h.pct(P.micro.vl.vente, 0)} to ${h.pct(P.micro.vl.bnc)} of turnover, paid alongside contributions. It suits households already taxed at ${h.pct(bareme[1][1], 0)} or more and penalises those the décote protects. And if your real costs clearly exceed the allowance, look at ${h.a('micro-ou-reel', 'moving to real profit')}.</p>
<p>These amounts are estimates computed on the published scale, not personal advice; only the French tax office sets your tax.</p>`,
  },
});
