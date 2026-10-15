import { defineGuide } from '../../lib/guide-types';
import { impotSocietes, pfu } from '../../lib/engine/societe';
import { assimileDepuisBrut } from '../../lib/engine/assimile';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const paliers = [15000, 42500, 70000, 120000].map((b) => {
  const r = impotSocietes(b);
  const apres = b - r.is;
  return { b, is: r.is, moyen: r.is / b, apres, div: pfu(apres).net };
});
const b70 = impotSocietes(70000);
const b120 = impotSocietes(120000);
// Ce qui reste d'un euro de bénéfice distribué, selon la tranche d'IS.
const resteReduit = (1 - P.is.taux_reduit) * (1 - P.dividendes.pfu);
const resteNormal = (1 - P.is.taux_normal) * (1 - P.dividendes.pfu);
// SASU : 80 000 € de bénéfice avant rémunération, président payé 30 000 € brut.
const avantPaie = 80000;
const paie = assimileDepuisBrut(30000);
const isSansPaie = impotSocietes(avantPaie).is;
const isAvecPaie = impotSocietes(avantPaie - paie.cout).is;
// Distribution de 10 000 € de bénéfice imposé au taux réduit.
const dix = 10000;
const dixIs = impotSocietes(dix).is;
const dixDiv = pfu(dix - dixIs);
const pfnl = (dix - dixIs) * P.dividendes.pfu_ir;

export default defineGuide({
  id: 'impot-sur-les-societes',
  group: 'statuts',
  order: 100,
  mini: 'is',
  related: ['sasu', 'eurl', 'salaire-ou-dividendes', 'flat-tax-dividendes', 'eurl-ou-sasu', 'dividendes-eurl'],
  sources: ['spIs', 'spDividendes', 'urssafTauxSalarie', 'urssafReforme'],
  fr: {
    slug: 'impot-sur-les-societes',
    nav: 'Impôt sur les sociétés',
    card: 'Deux tranches, la condition du taux réduit et ce qui reste après distribution.',
    title: 'Impôt sur les sociétés 2026 : taux de 15 % et 25 %, exemples',
    description: 'Impôt sur les sociétés 2026 : 15 % jusqu’à 42 500 € de bénéfice, 25 % au-delà, condition du taux réduit, IS d’une SASU ou d’une EURL et effet des dividendes.',
    h1: 'L’impôt sur les sociétés d’une petite société, tranche par tranche',
    intro: 'Deux taux, un seuil de bénéfice, une condition de capital : l’IS d’une société unipersonnelle se calcule en quelques lignes.',
    resume: `En 2026, une petite société paie l’impôt sur les sociétés à ${FR.pct(P.is.taux_reduit, 0)} sur la fraction de son bénéfice qui ne dépasse pas ${FR.eur(P.is.seuil_reduit)}, puis à ${FR.pct(P.is.taux_normal, 0)} sur le surplus. Le taux réduit suppose un capital entièrement libéré et détenu pour les trois quarts au moins par des personnes physiques, ce qui est le cas de la plupart des SASU et EURL créées par un indépendant. Sur ${FR.eur(70000)} de bénéfice, l’impôt atteint ${FR.eur(b70.is)}, soit un taux moyen de ${FR.pct(b70.is / 70000)} ; sur ${FR.eur(120000)}, il monte à ${FR.eur(b120.is)}. L’IS se calcule sur le bénéfice après déduction de la rémunération du dirigeant et de ses cotisations, si bien que chaque euro versé en salaire sort de la base imposable. Ce qui reste peut être distribué : les dividendes supportent alors le prélèvement forfaitaire unique de ${FR.pct(P.dividendes.pfu)}. Un euro de bénéfice taxé au taux réduit puis distribué laisse ${FR.eur(resteReduit, 2)} à l’associé, contre ${FR.eur(resteNormal, 2)} dans la tranche à ${FR.pct(P.is.taux_normal, 0)}.`,
    faqs: [
      { q: 'À partir de quel bénéfice l’IS passe-t-il à 25 % ?', a: `Au-delà de ${FR.eur(P.is.seuil_reduit)} de bénéfice imposable sur l’exercice. Le taux plein ne s’applique qu’à la part qui dépasse ce seuil : les premiers ${FR.eur(P.is.seuil_reduit)} restent à ${FR.pct(P.is.taux_reduit, 0)}. Une société qui dégage ${FR.eur(70000)} paie donc ${FR.eur(b70.reduit)} sur la première tranche et ${FR.eur(b70.normal)} sur la seconde, selon la fiche F23575 de service-public.` },
      { q: 'Qui a droit au taux réduit d’impôt sur les sociétés à 15 % ?', a: `Une société dont le capital est entièrement libéré et appartient pour les trois quarts au moins à des personnes physiques, directement ou par une société qui remplit elle-même cette condition. Un fondateur seul qui a versé tout son apport y a accès. Si une partie du capital reste à libérer, le bénéfice entier est imposé à ${FR.pct(P.is.taux_normal, 0)}.` },
      { q: 'Le salaire du dirigeant fait-il baisser l’impôt sur les sociétés ?', a: `Oui, car il est déductible du bénéfice, cotisations comprises. Une SASU qui gagne ${FR.eur(avantPaie)} avant de payer son président doit ${FR.eur(isSansPaie)} d’IS ; si elle lui verse ${FR.eur(30000)} brut, soit ${FR.eur(paie.cout)} de coût total, l’impôt tombe à ${FR.eur(isAvecPaie)}. Le président paie ensuite l’impôt sur le revenu sur son salaire net imposable.` },
      { q: 'Que reste-t-il de 10 000 € de bénéfice versés en dividendes ?', a: `La société paie d’abord ${FR.eur(dixIs)} d’IS au taux de ${FR.pct(P.is.taux_reduit, 0)}. Les ${FR.eur(dix - dixIs)} distribués subissent ensuite ${FR.eur(dixDiv.total)} de prélèvement forfaitaire unique, impôt et prélèvements sociaux réunis. L’associé d’une SASU encaisse ${FR.eur(dixDiv.net)}, avant l’éventuelle option pour le barème avec abattement de ${FR.pct(P.dividendes.abattement_bareme, 0)}.` },
      { q: 'Faut-il payer l’IS sur un bénéfice que l’on ne distribue pas ?', a: `Oui. L’impôt sur les sociétés frappe tout le bénéfice de l’exercice, qu’il reste en réserve ou parte en dividendes. C’est le prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)} qui attend la distribution : un bénéfice laissé dans la société ne supporte que l’IS, ce qui laisse ${FR.eur(1 - P.is.taux_reduit, 2)} par euro disponible pour investir dans la tranche réduite.` },
    ],
    body: (h) => `
<h2>Le barème 2026 en deux lignes</h2>
<p>L’impôt sur les sociétés, souvent abrégé en IS, se calcule par tranches comme l’impôt sur le revenu, mais avec deux tranches seulement (${h.src('spIs', 'service-public, fiche F23575')}). La première, jusqu’à ${h.eur(P.is.seuil_reduit)} de bénéfice, est taxée à ${h.pct(P.is.taux_reduit, 0)}. La seconde, sans limite, à ${h.pct(P.is.taux_normal, 0)}. Le seuil ne fonctionne pas comme une marche d’escalier : franchir ${h.eur(P.is.seuil_reduit)} d’un euro ne fait pas basculer tout le bénéfice au taux plein, seul l’euro supplémentaire l’est.</p>
<p>La tranche réduite est la même pour toutes les sociétés éligibles, quelle que soit leur taille. Elle procure donc un avantage maximal de ${h.eur(P.is.seuil_reduit * (P.is.taux_normal - P.is.taux_reduit))} par exercice par rapport à une imposition intégrale au taux plein. Pour une structure unipersonnelle qui dégage un bénéfice modeste, c’est souvent l’essentiel de son impôt.</p>
${h.table(['Bénéfice imposable', 'IS dû', 'Taux moyen', 'Bénéfice après IS', 'Dividendes nets après PFU'], paliers.map((x) => [h.eur(x.b), h.eur(x.is), h.pct(x.moyen, 1), h.eur(x.apres), h.eur(x.div)]), 'Impôt sur les sociétés 2026 d’une société éligible au taux réduit, puis distribution intégrale au prélèvement forfaitaire unique', ['r', 'r', 'r', 'r', 'r'])}
<p>Le taux moyen grimpe lentement : il reste à ${h.pct(P.is.taux_reduit, 0)} jusqu’au seuil, puis tend vers ${h.pct(P.is.taux_normal, 0)} sans jamais l’atteindre. À ${h.eur(120000)} de bénéfice, il vaut ${h.pct(b120.is / 120000, 1)}.</p>

<h2>La condition qui ouvre le taux réduit</h2>
<p>Deux exigences cumulées. D’abord, le capital doit être <strong>entièrement libéré</strong> : les associés ont versé la totalité des apports promis. Ensuite, il doit être détenu pour les trois quarts au moins par des personnes physiques, ou par une société qui respecte elle-même cette règle. Une SASU dont le fondateur a souscrit et payé tout le capital remplit les deux conditions. Le piège classique concerne la libération partielle : tant qu’une fraction des apports reste due, la société paie ${h.pct(P.is.taux_normal, 0)} dès le premier euro.</p>

<h2>Ce qui entre dans la base imposable</h2>
<p>Le bénéfice soumis à l’IS est le chiffre d’affaires moins les charges de la société. Parmi ces charges figure la rémunération du dirigeant, avec les cotisations qui s’y rattachent. Dans une SASU, le président est assimilé salarié et son coût total comprend les ${h.src('urssafTauxSalarie', 'cotisations patronales du régime général')}. Dans une EURL à l’IS, la société prend en charge la rémunération du gérant et ses cotisations de travailleur indépendant, calculées sur l’${h.src('urssafReforme', 'assiette réformée en 2026')}.</p>
<h3>Un exemple en SASU</h3>
<p>Une SASU de conseil dégage ${h.eur(avantPaie)} avant de rémunérer sa présidente. Sans salaire, l’impôt sur les sociétés s’élève à ${h.eur(isSansPaie)}. Si elle se verse ${h.eur(30000)} brut sur l’année, la société débourse ${h.eur(paie.cout)} charges patronales comprises ; le bénéfice tombe à ${h.eur(avantPaie - paie.cout)} et l’IS à ${h.eur(isAvecPaie)}. La présidente touche ${h.eur(paie.net)} net avant impôt sur le revenu, et ce salaire lui ouvre des droits sociaux que le dividende ne donne pas. L’arbitrage complet se trouve sur ${h.a('salaire-ou-dividendes', 'salaire ou dividendes')}.</p>

<h2>Après l’IS, la distribution</h2>
<p>Le bénéfice net d’impôt peut rester en réserve ou être distribué. Distribué, il devient un dividende soumis au ${h.src('spDividendes', 'prélèvement forfaitaire unique de ' + h.pct(P.dividendes.pfu))} : ${h.pct(P.dividendes.pfu_ir)} d’impôt sur le revenu et ${h.pct(P.dividendes.prelevements_sociaux)} de prélèvements sociaux. L’associé peut préférer le barème progressif, avec un abattement de ${h.pct(P.dividendes.abattement_bareme, 0)} sur le dividende. Au moment du versement, la société retient un acompte de ${h.pct(P.dividendes.pfu_ir)} au titre de l’impôt.</p>
<p>Mis bout à bout, IS et prélèvement forfaitaire laissent à l’associé ${h.pct(resteReduit, 1)} d’un bénéfice taxé dans la tranche réduite et ${h.pct(resteNormal, 1)} d’un bénéfice taxé à ${h.pct(P.is.taux_normal, 0)}. D’où l’intérêt d’examiner, chaque année, une rémunération qui ramène le bénéfice restant sous ${h.eur(P.is.seuil_reduit)}.</p>
<h3>Le cas particulier du gérant majoritaire d’EURL</h3>
<p>En EURL, les dividendes du gérant associé unique qui dépassent ${h.pct(P.dividendes.seuil_tns_capital, 0)} du capital social, des primes d’émission et des comptes courants d’associé supportent en plus les cotisations de travailleur indépendant. L’IS est le même qu’en SASU ; c’est la sortie de l’argent qui diffère. Le détail figure sur ${h.a('dividendes-eurl', 'les dividendes d’EURL')}.</p>

<h2>Lire le mini-simulateur</h2>
<p>Saisissez le bénéfice imposable de l’exercice, après salaire du dirigeant et cotisations. Le calcul affiche la part taxée à chaque taux, le taux moyen et le bénéfice qui reste. Il suppose la société éligible au taux réduit. Pour partir du chiffre d’affaires et laisser le moteur chercher le meilleur partage, utilisez le ${h.a('sasu', 'simulateur SASU')} ou le ${h.a('eurl', 'simulateur EURL')}.</p>
<p>Ces montants sont des estimations établies à partir des règles publiées : ils n’engagent pas l’administration fiscale, qui reste seule à liquider l’impôt, et ne remplacent pas l’avis d’un professionnel sur votre situation.</p>`,
  },
  en: {
    slug: 'corporate-tax',
    nav: 'Corporate tax (IS)',
    card: 'Two bands, the reduced-rate condition and what is left once profit is paid out.',
    title: 'Corporate tax France 2026: 15% and 25% rates explained',
    description: 'French corporate tax 2026: 15% on profit up to €42,500, 25% above, who qualifies for the reduced rate, and what is left of profit once dividends are paid out.',
    h1: 'Corporate tax for a small French company, band by band',
    intro: 'Two rates, one profit threshold and one capital condition: that is the whole corporate tax bill of a one-person company.',
    resume: `If you trade through a French company such as a SASU or an EURL, its profit pays impôt sur les sociétés, or IS, France’s corporate tax. In 2026 the first ${EN.eur(P.is.seuil_reduit)} of taxable profit is taxed at ${EN.pct(P.is.taux_reduit, 0)} and anything above at ${EN.pct(P.is.taux_normal, 0)}. The lower band requires share capital that is fully paid up and at least three-quarters owned by individuals, which a founder who paid in all of their contribution normally meets. A company making ${EN.eur(70000)} owes ${EN.eur(b70.is)}, an average rate of ${EN.pct(b70.is / 70000)}; at ${EN.eur(120000)} the bill reaches ${EN.eur(b120.is)}. Your own pay and the contributions on it are deducted before the tax is worked out. Profit left after IS can be kept in the company or paid out as dividends, which then bear the ${EN.pct(P.dividendes.pfu)} flat tax. One euro of profit taxed in the lower band and then distributed leaves you ${EN.eur(resteReduit, 2)}; in the upper band, ${EN.eur(resteNormal, 2)}.`,
    faqs: [
      { q: 'At what profit does French corporate tax rise to 25%?', a: `Above ${EN.eur(P.is.seuil_reduit)} of taxable profit for the financial year, and only on the part above it. The first ${EN.eur(P.is.seuil_reduit)} stays at ${EN.pct(P.is.taux_reduit, 0)}. A company with ${EN.eur(70000)} of profit pays ${EN.eur(b70.reduit)} on the lower band and ${EN.eur(b70.normal)} on the upper one, as set out on service-public sheet F23575.` },
      { q: 'Does my company qualify for the 15% corporate tax band?', a: `It does if its share capital is fully paid up and at least three-quarters held by individuals, directly or through a company that meets the same test. A single founder who has paid in every euro promised is fine. If part of the capital is still unpaid, the whole profit is taxed at ${EN.pct(P.is.taux_normal, 0)} from the first euro.` },
      { q: 'Does paying myself a salary cut the corporate tax bill?', a: `Yes, because salary and the contributions on it are business costs. A SASU earning ${EN.eur(avantPaie)} before paying its president owes ${EN.eur(isSansPaie)} of IS. Paying ${EN.eur(30000)} gross, which costs the company ${EN.eur(paie.cout)} in total, brings the bill down to ${EN.eur(isAvecPaie)}. You then pay personal income tax on the taxable part of that salary instead.` },
      { q: 'How much of €10,000 of company profit reaches my pocket as dividends?', a: `The company first pays ${EN.eur(dixIs)} of corporate tax at ${EN.pct(P.is.taux_reduit, 0)}. The ${EN.eur(dix - dixIs)} paid out then bears ${EN.eur(dixDiv.total)} of flat tax, income tax and social levies together. A SASU shareholder ends up with ${EN.eur(dixDiv.net)}, unless they opt for the progressive scale with its ${EN.pct(P.dividendes.abattement_bareme, 0)} dividend allowance.` },
      { q: 'Is corporate tax due on profit I leave in the company?', a: `Yes. IS applies to the whole profit of the year, whether it is kept as reserves or paid out. Only the ${EN.pct(P.dividendes.pfu)} flat tax waits for a distribution. Profit left in the company bears corporate tax alone, so in the lower band ${EN.eur(1 - P.is.taux_reduit, 2)} of every euro stays available to invest.` },
    ],
    body: (h) => `
<h2>The 2026 scale on two lines</h2>
<p>French corporate tax works in bands, like income tax, but there are only two (${h.src('spIs', 'service-public, sheet F23575')}). Profit up to ${h.eur(P.is.seuil_reduit)} is taxed at ${h.pct(P.is.taux_reduit, 0)}; the rest, with no upper limit, at ${h.pct(P.is.taux_normal, 0)}. Crossing the threshold by one euro does not drag the whole profit into the higher rate: only that extra euro is taxed at ${h.pct(P.is.taux_normal, 0)}.</p>
<p>Every qualifying company gets the same lower band, whatever its size. Compared with paying the full rate on everything, it is worth at most ${h.eur(P.is.seuil_reduit * (P.is.taux_normal - P.is.taux_reduit))} a year. For a freelancer’s company with modest profit, that band is most of the bill.</p>
${h.table(['Taxable profit', 'Corporate tax', 'Average rate', 'Profit after tax', 'Net dividends after flat tax'], paliers.map((x) => [h.eur(x.b), h.eur(x.is), h.pct(x.moyen, 1), h.eur(x.apres), h.eur(x.div)]), 'French corporate tax in 2026 for a company qualifying for the reduced rate, then full payout under the flat tax', ['r', 'r', 'r', 'r', 'r'])}
<p>The average rate climbs slowly: ${h.pct(P.is.taux_reduit, 0)} up to the threshold, then edging towards ${h.pct(P.is.taux_normal, 0)} without ever reaching it. On ${h.eur(120000)} of profit it is ${h.pct(b120.is / 120000, 1)}.</p>

<h2>Who gets the reduced rate</h2>
<p>Two tests, both required. The share capital must be <strong>fully paid up</strong>: shareholders have actually transferred everything they committed to. And at least three-quarters of it must belong to individuals, or to a company that passes the same test. A SASU (a single-shareholder simplified company) whose founder subscribed and paid all the capital qualifies. The trap is partial payment: as long as some of the capital is still owed, profit is taxed at ${h.pct(P.is.taux_normal, 0)} from the first euro.</p>

<h2>What the tax is worked out on</h2>
<p>Taxable profit is turnover minus the company’s costs, and those costs include what you pay yourself. As president of a SASU you are treated like an employee, so your total cost includes the ${h.src('urssafTauxSalarie', 'employer contributions of the general scheme')}. As manager of an EURL (a single-member limited company) taxed under IS, the company covers your pay and your self-employed contributions, worked out on the ${h.src('urssafReforme', 'base reformed in 2026')}.</p>
<h3>A SASU worked through</h3>
<p>A consulting SASU makes ${h.eur(avantPaie)} before paying its president. With no salary, corporate tax is ${h.eur(isSansPaie)}. If she pays herself ${h.eur(30000)} gross for the year, the company spends ${h.eur(paie.cout)} including employer contributions; profit drops to ${h.eur(avantPaie - paie.cout)} and the tax to ${h.eur(isAvecPaie)}. She receives ${h.eur(paie.net)} net before income tax, and that salary earns social rights a dividend does not. The full trade-off is on ${h.a('salaire-ou-dividendes', 'salary or dividends')}.</p>

<h2>After corporate tax: paying it out</h2>
<p>Profit after tax can stay in the company or be distributed. Once distributed it is a dividend, taxed under the ${h.src('spDividendes', 'flat tax (PFU) of ' + h.pct(P.dividendes.pfu))}: ${h.pct(P.dividendes.pfu_ir)} income tax plus ${h.pct(P.dividendes.prelevements_sociaux)} social levies. You may instead choose the progressive income tax scale with a ${h.pct(P.dividendes.abattement_bareme, 0)} allowance on the dividend. When the dividend is paid, the company withholds ${h.pct(P.dividendes.pfu_ir)} as an advance on income tax.</p>
<p>Put together, corporate tax and the flat tax leave you ${h.pct(resteReduit, 1)} of profit taxed in the lower band and ${h.pct(resteNormal, 1)} of profit taxed at ${h.pct(P.is.taux_normal, 0)}. Hence the case for checking each year whether a salary would bring the remaining profit under ${h.eur(P.is.seuil_reduit)}.</p>
<h3>EURL managers: one more layer</h3>
<p>In an EURL, dividends paid to the managing sole member above ${h.pct(P.dividendes.seuil_tns_capital, 0)} of share capital, share premium and partner current accounts also carry self-employed contributions. Corporate tax is identical to a SASU; what changes is the cost of taking the money out. See ${h.a('dividendes-eurl', 'EURL dividends')}.</p>

<h2>Using the mini-calculator</h2>
<p>Enter the year’s taxable profit, after your pay and contributions. It shows the part taxed at each rate, the average rate and the profit left. It assumes the company qualifies for the lower band. To start from turnover and let the engine find the best pay split, use the ${h.a('sasu', 'SASU calculator')} or the ${h.a('eurl', 'EURL calculator')}.</p>
<p>These figures are estimates built from the published rules. The French tax office alone sets the tax actually due, and nothing here replaces advice on your own situation.</p>`,
  },
});
