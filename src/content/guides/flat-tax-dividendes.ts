import { defineGuide } from '../../lib/guide-types';
import { pfu, dividendesSoumisTNS } from '../../lib/engine/societe';
import { impotMarginal } from '../../lib/engine/ir';
import { P, FR, EN } from '../../lib/fmt';

// Montants calculés par le moteur à partir des paramètres 2026.
const D = P.dividendes;
const montants = [5000, 20000, 50000, 100000].map((d) => ({ d, r: pfu(d) }));
const d20 = pfu(20000);
// Bénéfice → dividende encaissé : impôt sur les sociétés puis prélèvement forfaitaire.
const chargeReduit = 1 - (1 - P.is.taux_reduit) * (1 - D.pfu);
const chargeNormal = 1 - (1 - P.is.taux_normal) * (1 - D.pfu);
// Option pour le barème : part impôt sur le revenu seulement, dividende de 20 000 € après abattement de 40 %.
const div = 20000;
const imposableBareme = div * (1 - D.abattement_bareme);
const foyers = [
  { fr: 'Personne seule, aucun autre revenu', en: 'Single, no other income', autres: 0, f: { parts: 1, couple: false } },
  { fr: `Personne seule, ${FR.eur(25000)} d’autres revenus`, en: `Single, ${EN.eur(25000)} of other income`, autres: 25000, f: { parts: 1, couple: false } },
  { fr: `Personne seule, ${FR.eur(60000)} d’autres revenus`, en: `Single, ${EN.eur(60000)} of other income`, autres: 60000, f: { parts: 1, couple: false } },
  { fr: `Couple, 2 enfants, ${FR.eur(50000)} d’autres revenus`, en: `Couple, 2 children, ${EN.eur(50000)} of other income`, autres: 50000, f: { parts: 3, couple: true } },
].map((x) => ({ ...x, bareme: impotMarginal(imposableBareme, x.autres, x.f), forfait: div * D.pfu_ir }));
const effet11 = (1 - D.abattement_bareme) * P.ir.bareme[1][1];
const effet30 = (1 - D.abattement_bareme) * P.ir.bareme[2][1];
// Gérant majoritaire d'EURL : 20 000 € de dividendes avec 5 000 € de capital.
const kEurl = 5000;
const soumis = dividendesSoumisTNS(div, kEurl);
const pEurl = pfu(div, soumis);

export default defineGuide({
  id: 'flat-tax-dividendes',
  group: 'statuts',
  order: 80,
  mini: 'pfu',
  miniHref: 'salaire-ou-dividendes',
  related: ['salaire-ou-dividendes', 'dividendes-eurl', 'sasu', 'impot-sur-les-societes', 'eurl-ou-sasu'],
  sources: ['spDividendes', 'spIs', 'spBareme', 'urssafReforme'],
  fr: {
    slug: 'dividendes-flat-tax',
    nav: 'Flat tax sur les dividendes',
    card: 'Les 31,4 % décomposés, l’acompte de 12,8 % et l’option pour le barème.',
    title: 'Flat tax dividendes 2026 : 31,4 % décomposés, option barème',
    description: 'Flat tax sur les dividendes en 2026 : 31,4 % dont 12,8 % d’impôt et 18,6 % de prélèvements sociaux, montant net calculé et cas où l’option pour le barème gagne.',
    h1: 'La flat tax sur les dividendes : ce qui reste après les 31,4 %',
    intro: 'Un taux unique sur le dividende brut, deux composantes, et une option qui ne profite qu’à certains foyers.',
    resume: `En 2026, un dividende versé par une SASU ou une autre société à l’impôt sur les sociétés supporte le prélèvement forfaitaire unique, dit flat tax, de ${FR.pct(D.pfu)} : ${FR.pct(D.pfu_ir)} au titre de l’impôt sur le revenu et ${FR.pct(D.prelevements_sociaux)} de prélèvements sociaux, d’après service-public. Sur ${FR.eur(20000)} de dividendes bruts, cela représente ${FR.eur(d20.ir)} d’impôt et ${FR.eur(d20.ps)} de prélèvements sociaux, soit ${FR.eur(d20.total)} au total, et ${FR.eur(d20.net)} restent à l’associé. Le taux s’applique dès le premier euro, sans abattement. Un prélèvement de ${FR.pct(D.pfu_ir)} est opéré à la source au moment du versement, à titre d’acompte. L’associé peut à la place opter pour le barème progressif de l’impôt sur le revenu : le dividende n’y est alors retenu que pour ${FR.pct(1 - D.abattement_bareme, 0)} de son montant, grâce à un abattement de ${FR.pct(D.abattement_bareme, 0)}. Cette option devient intéressante pour un foyer dont le taux marginal est faible : à ${FR.pct(P.ir.bareme[1][1], 0)}, l’impôt revient à ${FR.pct(effet11)} du dividende, contre ${FR.pct(D.pfu_ir)} avec la flat tax. Rappel : le dividende sort d’un bénéfice qui a déjà payé l’impôt sur les sociétés.`,
    faqs: [
      { q: 'Combien d’impôt sur 20 000 € de dividendes avec la flat tax ?', a: `${FR.eur(d20.total)} au total : ${FR.eur(d20.ir)} d’impôt sur le revenu au taux de ${FR.pct(D.pfu_ir)} et ${FR.eur(d20.ps)} de prélèvements sociaux à ${FR.pct(D.prelevements_sociaux)}. Il reste ${FR.eur(d20.net)} à l’associé, selon les taux publiés sur service-public (fiche F32963). Le calcul est proportionnel : il ne dépend ni des autres revenus du foyer ni du nombre de parts.` },
      { q: 'Faut-il opter pour le barème plutôt que pour la flat tax sur ses dividendes ?', a: `Seulement si votre taux marginal d’imposition est bas. Avec l’abattement de ${FR.pct(D.abattement_bareme, 0)}, un dividende imposé dans la tranche à ${FR.pct(P.ir.bareme[1][1], 0)} supporte ${FR.pct(effet11)} d’impôt, mieux que les ${FR.pct(D.pfu_ir)} de la flat tax ; dans la tranche à ${FR.pct(P.ir.bareme[2][1], 0)}, il en supporte ${FR.pct(effet30)}, et la flat tax redevient préférable. Le dividende s’ajoute aux autres revenus et peut faire changer de tranche.` },
      { q: 'Pourquoi 12,8 % sont-ils prélevés dès le versement du dividende ?', a: `C’est le prélèvement forfaitaire non libératoire : la société retient ${FR.pct(D.pfu_ir)} du dividende brut au moment du paiement, comme acompte de l’impôt sur le revenu. Sur ${FR.eur(20000)}, cela fait ${FR.eur(d20.ir)}. Avec la flat tax, le montant correspond exactement à l’impôt dû ; si vous optez pour le barème, l’impôt final est recalculé avec l’abattement de ${FR.pct(D.abattement_bareme, 0)}.` },
      { q: 'Quel prélèvement total entre le bénéfice de la société et le dividende encaissé ?', a: `Il faut chaîner deux impôts. Le bénéfice paie d’abord l’impôt sur les sociétés, ${FR.pct(P.is.taux_reduit, 0)} jusqu’à ${FR.eur(P.is.seuil_reduit)} puis ${FR.pct(P.is.taux_normal, 0)}, et ce qui est distribué supporte ensuite les ${FR.pct(D.pfu)}. La charge globale atteint ${FR.pct(chargeReduit)} du bénéfice dans la tranche réduite et ${FR.pct(chargeNormal)} au-delà, sans cotisations sociales pour un président de SASU.` },
      { q: 'Le gérant d’EURL paie-t-il les 18,6 % de prélèvements sociaux sur tous ses dividendes ?', a: `Non. Chez le gérant majoritaire, la part qui dépasse ${FR.pct(D.seuil_tns_capital, 0)} du capital, des primes d’émission et des comptes courants supporte les cotisations de travailleur indépendant ; le moteur ne lui applique pas une seconde fois les prélèvements sociaux. Pour ${FR.eur(div)} avec ${FR.eur(kEurl)} de capital, ${FR.eur(soumis)} sont concernés et les prélèvements de la flat tax tombent à ${FR.eur(pEurl.total)}, impôt compris.` },
      { q: 'La flat tax s’applique-t-elle dès le premier euro de dividende ?', a: `Oui. Le prélèvement forfaitaire unique ne comporte ni franchise ni abattement : ${FR.pct(D.pfu)} du montant brut, quel que soit le dividende. Pour ${FR.eur(5000)}, cela fait ${FR.eur(montants[0].r.total)}. L’abattement de ${FR.pct(D.abattement_bareme, 0)} n’existe qu’avec l’option pour le barème progressif, qui reste au choix de l’associé (service-public, fiche F32963).` },
    ],
    body: (h) => `
<h2>Les 31,4 % en deux morceaux</h2>
<p>Le ${h.src('spDividendes', 'prélèvement forfaitaire unique')} se compose d’un impôt sur le revenu à taux fixe de ${h.pct(D.pfu_ir)} et de prélèvements sociaux de ${h.pct(D.prelevements_sociaux)}. Les deux s’appliquent au dividende brut, celui que la société décide de distribuer. Le tableau donne le détail pour quatre montants ; le mini-simulateur en haut de page le refait pour le vôtre.</p>
${h.table(['Dividende brut', `Impôt (${h.pct(D.pfu_ir)})`, `Prélèvements sociaux (${h.pct(D.prelevements_sociaux)})`, 'Total prélevé', 'Dividende net'], montants.map((m) => [h.eur(m.d), h.eur(m.r.ir), h.eur(m.r.ps), h.eur(m.r.total), h.eur(m.r.net)]), 'Dividendes au prélèvement forfaitaire unique en 2026, associé personne physique', ['l', 'r', 'r', 'r', 'r'])}
<p>Le calcul est strictement proportionnel : ${h.eur(montants[3].d)} de dividendes coûtent vingt fois ce que coûtent ${h.eur(montants[0].d)}. Ni le quotient familial ni les autres revenus n’interviennent, ce qui rend le résultat facile à anticiper au moment de voter une distribution.</p>

<h2>Avant la flat tax, l’impôt sur les sociétés</h2>
<p>Un dividende n’est jamais le premier prélèvement. La société a d’abord payé l’${h.src('spIs', 'impôt sur les sociétés')} sur son bénéfice : ${h.pct(P.is.taux_reduit, 0)} jusqu’à ${h.eur(P.is.seuil_reduit)}, ${h.pct(P.is.taux_normal, 0)} au-delà. Enchaînés, les deux impôts prélèvent ${h.pct(chargeReduit)} d’un bénéfice distribué dans la tranche réduite et ${h.pct(chargeNormal)} dans la tranche normale. C’est cette charge cumulée qu’il faut comparer au coût d’un salaire, ce que fait la page ${h.a('salaire-ou-dividendes', 'salaire ou dividendes')}.</p>

<h2>L’acompte prélevé au versement</h2>
<p>Au moment du paiement, la société retient ${h.pct(D.pfu_ir)} du dividende brut : c’est le prélèvement forfaitaire non libératoire, un acompte sur l’impôt sur le revenu de l’année. Si vous restez à la flat tax, il couvre exactement la part impôt. Si vous choisissez le barème, l’impôt définitif est recalculé et l’acompte vient en déduction. L’option ne touche qu’à cette part d’impôt sur le revenu, la seule que compare le tableau suivant (${h.src('spDividendes', 'fiche F32963')}).</p>

<h2>L’option pour le barème : à qui elle profite</h2>
<p>L’option remplace les ${h.pct(D.pfu_ir)} forfaitaires par le ${h.src('spBareme', 'barème progressif')}, appliqué à ${h.pct(1 - D.abattement_bareme, 0)} seulement du dividende grâce à l’abattement de ${h.pct(D.abattement_bareme, 0)}. Concrètement, le dividende coûte ${h.pct(effet11)} d’impôt s’il tombe dans la tranche à ${h.pct(P.ir.bareme[1][1], 0)}, ${h.pct(effet30)} dans la tranche à ${h.pct(P.ir.bareme[2][1], 0)}. Le tableau compare la part impôt pour ${h.eur(div)} de dividendes selon la situation du foyer.</p>
${h.table(['Foyer', 'Impôt avec la flat tax', 'Impôt avec le barème', 'Le moins cher'], foyers.map((x) => [x.fr, h.eur(x.forfait), h.eur(x.bareme), x.bareme < x.forfait ? 'barème' : 'flat tax']), `Part impôt sur le revenu pour ${h.eur(div)} de dividendes, barème 2026, hors prélèvements sociaux`, ['l', 'r', 'r', 'l'])}
<p>Le barème gagne pour un foyer peu imposé, dont la part de quotient reste dans les premières tranches même après l’ajout du dividende. Il perd dès que le revenu imposable par part atteint la tranche à ${h.pct(P.ir.bareme[2][1], 0)}, qui commence à ${h.eur(P.ir.bareme[1][0] as number)}. Le calcul ne retient que les revenus indiqués dans chaque ligne : en cas d’hésitation, faites tourner les deux hypothèses avec votre déclaration complète.</p>

<h2>Le cas particulier du gérant d’EURL</h2>
<p>Pour un président de SASU, la flat tax est le seul prélèvement sur le dividende. Pour le gérant majoritaire d’une EURL, la part qui dépasse ${h.pct(D.seuil_tns_capital, 0)} du capital, des primes d’émission et des comptes courants entre dans l’assiette de ses cotisations de travailleur indépendant (${h.src('urssafReforme', 'Urssaf')}). Avec ${h.eur(kEurl)} de capital, ${h.eur(soumis)} sur ${h.eur(div)} sont concernés. Le mécanisme complet est sur ${h.a('dividendes-eurl', 'les dividendes d’EURL')}.</p>
<p>Les chiffres de cette page sont des estimations établies à partir des taux publiés ; ils ne remplacent pas un conseil adapté à votre situation, et seule l’administration fiscale arrête l’impôt dû.</p>`,
  },
  en: {
    slug: 'dividend-flat-tax',
    nav: 'Dividend flat tax',
    card: 'The 31.4% split into its parts, the 12.8% prepayment and the progressive-scale option.',
    title: 'Dividend flat tax France 2026: the 31.4% PFU explained',
    description: 'French dividend flat tax 2026: 31.4% made of 12.8% income tax and 18.6% social levies, the net amount worked out, and when the progressive-scale option wins.',
    h1: 'The French flat tax on dividends: what is left after 31.4%',
    intro: 'One rate on the gross dividend, two components, and an option that only helps some households.',
    resume: `In 2026, a dividend paid by a French SASU or any other company subject to corporate tax bears the prélèvement forfaitaire unique (PFU), known in France as the flat tax, of ${EN.pct(D.pfu)}: ${EN.pct(D.pfu_ir)} of income tax and ${EN.pct(D.prelevements_sociaux)} of social levies, according to service-public, the official government information site. On ${EN.eur(20000)} of gross dividends that comes to ${EN.eur(d20.ir)} of income tax and ${EN.eur(d20.ps)} of social levies, ${EN.eur(d20.total)} in all, and the shareholder keeps ${EN.eur(d20.net)}. The rate applies from the first euro, with no allowance. A ${EN.pct(D.pfu_ir)} amount is withheld when the dividend is paid, as a prepayment. Instead, you can opt for the progressive income tax scale: the dividend is then counted at only ${EN.pct(1 - D.abattement_bareme, 0)} of its amount thanks to a ${EN.pct(D.abattement_bareme, 0)} allowance. That option pays off for a household with a low marginal rate: in the ${EN.pct(P.ir.bareme[1][1], 0)} band, the tax works out at ${EN.pct(effet11)} of the dividend against ${EN.pct(D.pfu_ir)} under the flat tax. Remember that a dividend comes out of profit that has already paid corporate tax.`,
    faqs: [
      { q: 'How much tax is due on €20,000 of dividends under the flat tax?', a: `${EN.eur(d20.total)} in total: ${EN.eur(d20.ir)} of income tax at ${EN.pct(D.pfu_ir)} and ${EN.eur(d20.ps)} of social levies at ${EN.pct(D.prelevements_sociaux)}. The shareholder keeps ${EN.eur(d20.net)}, based on the rates published by service-public (sheet F32963). The calculation is proportional: it depends neither on other household income nor on the number of family-quotient shares.` },
      { q: 'Should I choose the progressive scale over the flat tax for my dividends?', a: `Only if your marginal tax rate is low. With the ${EN.pct(D.abattement_bareme, 0)} allowance, a dividend taxed in the ${EN.pct(P.ir.bareme[1][1], 0)} band bears ${EN.pct(effet11)} of tax, better than the flat tax’s ${EN.pct(D.pfu_ir)}; in the ${EN.pct(P.ir.bareme[2][1], 0)} band it bears ${EN.pct(effet30)}, and the flat tax wins again. The dividend is added to your other income and can push you into a higher band.` },
      { q: 'Why is 12.8% withheld as soon as the dividend is paid?', a: `That is the PFNL (prélèvement forfaitaire non libératoire): the company keeps back ${EN.pct(D.pfu_ir)} of the gross dividend when paying it, as a prepayment of income tax. On ${EN.eur(20000)} that is ${EN.eur(d20.ir)}. Under the flat tax the amount matches the tax due exactly; if you opt for the progressive scale, the final tax is recalculated with the ${EN.pct(D.abattement_bareme, 0)} allowance.` },
      { q: 'What is the combined tax rate from company profit to dividend received?', a: `Two taxes stack up. Profit first pays corporate tax, ${EN.pct(P.is.taux_reduit, 0)} up to ${EN.eur(P.is.seuil_reduit)} then ${EN.pct(P.is.taux_normal, 0)}, and what is paid out then bears the ${EN.pct(D.pfu)} flat tax. The combined charge reaches ${EN.pct(chargeReduit)} of profit in the reduced band and ${EN.pct(chargeNormal)} above it, with no social contributions on top for a SASU president.` },
      { q: 'Does an EURL manager pay the 18.6% social levies on every dividend?', a: `No. For a majority manager, the part above ${EN.pct(D.seuil_tns_capital, 0)} of share capital, share premium and current accounts bears self-employed contributions instead, and our engine does not charge social levies on it a second time. On ${EN.eur(div)} with ${EN.eur(kEurl)} of capital, ${EN.eur(soumis)} is affected and the flat-tax charges fall to ${EN.eur(pEurl.total)}, income tax included.` },
      { q: 'Does the flat tax apply from the very first euro of dividend?', a: `Yes. The PFU has no tax-free amount and no allowance: ${EN.pct(D.pfu)} of the gross amount, whatever the size of the dividend. On ${EN.eur(5000)} that is ${EN.eur(montants[0].r.total)}. The ${EN.pct(D.abattement_bareme, 0)} allowance only exists if you opt for the progressive scale, which remains the shareholder’s choice (service-public, sheet F32963).` },
    ],
    body: (h) => `
<h2>The 31.4% in two parts</h2>
<p>The ${h.src('spDividendes', 'PFU flat tax')} is made of a fixed ${h.pct(D.pfu_ir)} income tax and ${h.pct(D.prelevements_sociaux)} of social levies (prélèvements sociaux). Both apply to the gross dividend, the amount the company decides to distribute. The table gives four examples; the mini-calculator at the top redoes it for yours.</p>
${h.table(['Gross dividend', `Income tax (${h.pct(D.pfu_ir)})`, `Social levies (${h.pct(D.prelevements_sociaux)})`, 'Total taken', 'Net dividend'], montants.map((m) => [h.eur(m.d), h.eur(m.r.ir), h.eur(m.r.ps), h.eur(m.r.total), h.eur(m.r.net)]), 'Dividends under the flat tax in 2026, individual shareholder', ['l', 'r', 'r', 'r', 'r'])}
<p>The charge is strictly proportional: ${h.eur(montants[3].d)} of dividends costs twenty times what ${h.eur(montants[0].d)} does. Neither the French family quotient, which divides household income into shares, nor your other income plays any part, so the result is easy to predict when deciding on a payout.</p>

<h2>Before the flat tax comes corporate tax</h2>
<p>A dividend is never the first tax hit. The company has already paid ${h.src('spIs', 'corporate tax')} (impôt sur les sociétés, IS) on its profit: ${h.pct(P.is.taux_reduit, 0)} up to ${h.eur(P.is.seuil_reduit)}, ${h.pct(P.is.taux_normal, 0)} above. Taken together, the two taxes absorb ${h.pct(chargeReduit)} of profit paid out from the reduced band and ${h.pct(chargeNormal)} from the normal band. That combined charge is what you compare with the cost of a salary, as the page on ${h.a('salaire-ou-dividendes', 'salary or dividends')} does.</p>

<h2>The prepayment taken at source</h2>
<p>When paying out, the company keeps back ${h.pct(D.pfu_ir)} of the gross dividend: the PFNL, a prepayment against the year’s income tax. If you stay with the flat tax it covers the income tax part exactly. If you choose the progressive scale, final tax is recalculated and the prepayment is credited against it. The option only changes this income tax part, which is all the next table compares (${h.src('spDividendes', 'sheet F32963')}).</p>

<h2>The progressive-scale option: who gains</h2>
<p>The option swaps the flat ${h.pct(D.pfu_ir)} for the ${h.src('spBareme', 'progressive scale')}, applied to only ${h.pct(1 - D.abattement_bareme, 0)} of the dividend thanks to the ${h.pct(D.abattement_bareme, 0)} allowance. In practice the dividend bears ${h.pct(effet11)} of tax if it falls in the ${h.pct(P.ir.bareme[1][1], 0)} band and ${h.pct(effet30)} in the ${h.pct(P.ir.bareme[2][1], 0)} band. The table compares the income tax part on ${h.eur(div)} of dividends for different households.</p>
${h.table(['Household', 'Tax under flat tax', 'Tax under the scale', 'Cheaper'], foyers.map((x) => [x.en, h.eur(x.forfait), h.eur(x.bareme), x.bareme < x.forfait ? 'scale' : 'flat tax']), `Income tax part on ${h.eur(div)} of dividends, 2026 scale, social levies excluded`, ['l', 'r', 'r', 'l'])}
<p>The scale wins for a lightly taxed household whose income per share stays in the lower bands even after adding the dividend. It loses once taxable income per share reaches the ${h.pct(P.ir.bareme[2][1], 0)} band, which starts at ${h.eur(P.ir.bareme[1][0] as number)}. The comparison only uses the income shown on each row: if in doubt, run both cases with your full tax return.</p>

<h2>The special case of an EURL manager</h2>
<p>For a SASU president the flat tax is the only charge on a dividend. For the majority manager of an EURL, the part above ${h.pct(D.seuil_tns_capital, 0)} of share capital, share premium and current accounts goes into the base for self-employed contributions (${h.src('urssafReforme', 'Urssaf')}). With ${h.eur(kEurl)} of capital, ${h.eur(soumis)} out of ${h.eur(div)} is affected. The full mechanism is on ${h.a('dividendes-eurl', 'EURL dividends')}.</p>
<p>All examples assume you are taxed in France as a resident, with the 2026 rates; if you still have income or ties abroad, check your own position before relying on them. The figures are estimates from published rates, not advice tailored to you, and only the tax office sets the tax due.</p>`,
  },
});
