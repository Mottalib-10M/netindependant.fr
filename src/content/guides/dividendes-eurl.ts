import { defineGuide } from '../../lib/guide-types';
import { enEURL } from '../../lib/engine/statuts';
import { cotisationsTNS } from '../../lib/engine/tns';
import { dividendesSoumisTNS, pfu } from '../../lib/engine/societe';
import { P, FR, EN } from '../../lib/fmt';

// Gérant majoritaire d'EURL à l'IS : tous les montants viennent du moteur.
const S = P.dividendes.seuil_tns_capital;
const div = 20000, remu = 30000;
/** Dividende versé avec un capital (et comptes courants) donné, à côté d'une rémunération fixe. */
function verse(d: number, k: number, r = remu) {
  const soumis = dividendesSoumisTNS(d, k);
  const cotis = cotisationsTNS(r + soumis).cotisations - cotisationsTNS(r).cotisations;
  const p = pfu(d, soumis);
  return { k, soumis, cotis, p, net: d - p.total - cotis };
}
const grille = [1000, 5000, 20000, 50000, 100000, 200000].map((k) => verse(div, k));
const v5 = verse(div, 5000);
const v1 = grille[0];
const tauxCotisDiv = v5.soumis > 0 ? v5.cotis / v5.soumis : 0;
const libre = (k: number) => S * k;
const capitalPour = (d: number) => d / S;
// Apport en compte courant : 5 000 € de capital, puis 45 000 € apportés en plus.
const apport = verse(div, 50000);
// Partage optimal du moteur selon le capital, pour 200 000 € de bénéfice.
const benef = 200000;
const parCapital = [1000, 20000, 100000].map((k) => ({ k, o: enEURL({ ca: benef, charges: 0, activite: 'bnc', capital: k }) }));
const petit = enEURL({ ca: 60000, charges: 0, activite: 'bnc' });

export default defineGuide({
  id: 'dividendes-eurl',
  group: 'statuts',
  order: 90,
  mini: 'dividendesEurl',
  miniHref: 'eurl',
  related: ['eurl', 'cotisations-tns', 'eurl-ou-sasu', 'flat-tax-dividendes', 'impot-sur-les-societes'],
  sources: ['spDividendes', 'urssafReforme', 'urssafTauxAC', 'spIs'],
  fr: {
    slug: 'dividendes-eurl',
    nav: 'Dividendes d’EURL',
    card: 'La règle des 10 % du capital, les cotisations sur le surplus et le net en poche.',
    title: 'Dividendes EURL 2026 : la règle des 10 % du capital chiffrée',
    description: 'Dividendes d’EURL en 2026 : au-delà de 10 % du capital et des comptes courants, cotisations TNS en plus de la flat tax de 31,4 %. Net calculé selon le capital.',
    h1: 'Dividendes d’EURL : ce que la règle des 10 % prélève vraiment',
    intro: 'Pour le gérant majoritaire, un dividende peut supporter à la fois l’impôt et les cotisations d’indépendant ; tout se joue sur le montant du capital.',
    resume: `Le gérant majoritaire d’une EURL soumise à l’impôt sur les sociétés paie en 2026 des cotisations de travailleur indépendant sur la part de ses dividendes qui dépasse ${FR.pct(S, 0)} du capital social, des primes d’émission et des sommes laissées en compte courant d’associé, en plus de l’impôt. Avec ${FR.eur(5000)} de capital, seuls ${FR.eur(libre(5000))} de dividendes y échappent : sur ${FR.eur(div)} distribués à côté d’une rémunération de ${FR.eur(remu)}, ${FR.eur(v5.soumis)} entrent dans l’assiette sociale et coûtent ${FR.eur(v5.cotis)} de cotisations supplémentaires, selon notre moteur. L’impôt de ${FR.pct(P.dividendes.pfu_ir)} de la flat tax reste dû sur tout le dividende ; les prélèvements sociaux de ${FR.pct(P.dividendes.prelevements_sociaux)} ne portent que sur la part non soumise aux cotisations. Au final, il reste ${FR.eur(v5.net)} au gérant, contre ${FR.eur(pfu(div).net)} pour un président de SASU au même dividende. Plus le capital et les comptes courants sont élevés, plus la part libre de cotisations grandit : il faudrait ${FR.eur(capitalPour(div))} de capital et d’apports pour distribuer ${FR.eur(div)} sans aucune cotisation. C’est pourquoi un gérant d’EURL se rémunère surtout par sa rémunération de gérance.`,
    faqs: [
      { q: 'Quelle part des dividendes d’EURL supporte des cotisations sociales ?', a: `Celle qui dépasse ${FR.pct(S, 0)} du capital social, des primes d’émission et des comptes courants d’associé, pour un gérant majoritaire (service-public, fiche F32963). Avec ${FR.eur(5000)} de capital et ${FR.eur(div)} de dividendes, ${FR.eur(v5.soumis)} sont soumis aux cotisations de travailleur indépendant. Le reste, ${FR.eur(div - v5.soumis)}, ne supporte que la flat tax de ${FR.pct(P.dividendes.pfu)}.` },
      { q: 'Quel capital faut-il pour verser 20 000 € de dividendes d’EURL sans cotisations ?', a: `${FR.eur(capitalPour(div))} de capital, primes d’émission et comptes courants réunis, puisque seuls ${FR.pct(S, 0)} de cette somme échappent aux cotisations. Pour ${FR.eur(10000)} de dividendes, il en faudrait ${FR.eur(capitalPour(10000))}. La plupart des EURL ont un capital bien plus faible : avec ${FR.eur(1000)}, la franchise ne dépasse pas ${FR.eur(libre(1000))}.` },
      { q: 'Un apport en compte courant d’associé réduit-il les cotisations sur les dividendes ?', a: `Oui, car les comptes courants comptent dans la base des ${FR.pct(S, 0)}. Un gérant qui laisse ${FR.eur(45000)} sur son compte courant en plus de ${FR.eur(5000)} de capital fait passer la part soumise de ${FR.eur(v5.soumis)} à ${FR.eur(apport.soumis)} pour ${FR.eur(div)} de dividendes. Ses cotisations supplémentaires baissent de ${FR.eur(v5.cotis)} à ${FR.eur(apport.cotis)}, selon le moteur.` },
      { q: 'Combien coûtent 20 000 € de dividendes d’EURL en cotisations, avec 30 000 € de rémunération ?', a: `Avec ${FR.eur(5000)} de capital, le moteur ajoute ${FR.eur(v5.cotis)} de cotisations, soit ${FR.pct(tauxCotisDiv)} de la part soumise : elle s’additionne à la rémunération dans le revenu brut social, puis subit l’abattement de ${FR.pct(P.tns.abattement, 0)} et le barème 2026. S’y ajoutent ${FR.eur(v5.p.total)} d’impôt et de prélèvements sociaux. Le gérant garde ${FR.eur(v5.net)}.` },
      { q: 'Gérant d’EURL : se payer en dividendes ou en rémunération ?', a: `Surtout en rémunération, tant que le capital est faible. Pour ${FR.eur(60000)} de bénéfice et ${FR.eur(1000)} de capital, le moteur verse ${FR.pct(petit.partRemuneration ?? 0, 0)} du bénéfice en rémunération. À ${FR.eur(benef)}, il distribue davantage, ${FR.pct(1 - (parCapital[0].o.partRemuneration ?? 0), 0)} du bénéfice, parce que l’impôt sur les sociétés à ${FR.pct(P.is.taux_reduit, 0)} sur les premiers ${FR.eur(P.is.seuil_reduit)} rend la distribution rentable malgré les cotisations.` },
      { q: 'Les dividendes d’EURL soumis aux cotisations paient-ils aussi la flat tax ?', a: `En partie. Les ${FR.pct(P.dividendes.pfu_ir)} d’impôt sur le revenu s’appliquent à tout le dividende ; les ${FR.pct(P.dividendes.prelevements_sociaux)} de prélèvements sociaux ne visent, dans le moteur, que la part non soumise aux cotisations, la CSG-CRDS étant déjà prélevée avec celles-ci. Pour ${FR.eur(div)} et ${FR.eur(1000)} de capital, la flat tax tombe ainsi à ${FR.eur(v1.p.total)} au lieu de ${FR.eur(pfu(div).total)}.` },
    ],
    body: (h) => `
<h2>La règle des ${h.pct(S, 0)} en une phrase</h2>
<p>Pour un gérant majoritaire d’EURL ou de SARL soumise à l’impôt sur les sociétés, le revenu soumis aux cotisations comprend sa rémunération et les dividendes qui dépassent ${h.pct(S, 0)} du capital social, des primes d’émission et des comptes courants d’associé (${h.src('urssafReforme', 'Urssaf, réforme de l’assiette')} ; ${h.src('spDividendes', 'service-public, fiche F32963')}). La part en dessous de ce seuil est un dividende ordinaire, taxé à la flat tax. La part au-dessus est traitée, pour l’Urssaf, comme un complément de rémunération.</p>
<p>Le seuil dépend de ce qui figure au bilan : ${h.eur(1000)} de capital ouvrent ${h.eur(libre(1000))} de dividendes libres de cotisations, ${h.eur(50000)} en ouvrent ${h.eur(libre(50000))}. Il ne s’agit pas d’un plafond de distribution, mais de la limite au-delà de laquelle le dividende change de régime social.</p>

<h2>Ce que coûtent ${h.eur(div)} de dividendes selon le capital</h2>
${h.table(['Capital et comptes courants', 'Part soumise aux cotisations', 'Cotisations en plus', 'Impôt et prélèvements sociaux', 'Net en poche'], grille.map((g) => [h.eur(g.k), h.eur(g.soumis), h.eur(g.cotis), h.eur(g.p.total), h.eur(g.net)]), `${h.eur(div)} de dividendes, gérant déjà rémunéré ${h.eur(remu)} par an, barème ${h.src('urssafTauxAC', 'Urssaf 2026')}`, ['l', 'r', 'r', 'r', 'r'])}
<p>La différence entre la première et la dernière ligne, ${h.eur(grille[grille.length - 1].net - v1.net)}, vient uniquement du capital. Les cotisations supplémentaires suivent le barème des indépendants appliqué à la rémunération augmentée de la part soumise, après l’abattement de ${h.pct(P.tns.abattement, 0)} ; leur poids dépend donc aussi du niveau de rémunération déjà versé. Le mini-simulateur en haut de page fait varier les trois paramètres.</p>

<h2>Pourquoi les prélèvements sociaux baissent</h2>
<p>La flat tax de ${h.pct(P.dividendes.pfu)} associe ${h.pct(P.dividendes.pfu_ir)} d’impôt et ${h.pct(P.dividendes.prelevements_sociaux)} de prélèvements sociaux. Sur la fraction déjà soumise aux cotisations de gérant, qui incluent la CSG-CRDS, le moteur ne compte pas une seconde fois les prélèvements sociaux. L’impôt de ${h.pct(P.dividendes.pfu_ir)}, lui, s’applique à tout le dividende. Résultat : avec un petit capital, la ligne « impôt et prélèvements » est faible, mais la ligne « cotisations » la dépasse largement.</p>

<h2>Le capital, levier principal</h2>
<p>Pour distribuer ${h.eur(div)} sans aucune cotisation, il faudrait ${h.eur(capitalPour(div))} de capital, de primes d’émission et de comptes courants. Le compte courant d’associé, c’est-à-dire l’argent que le gérant prête à sa société, compte dans cette base au même titre que le capital. Un gérant qui laisse ${h.eur(45000)} en compte courant à côté de ${h.eur(5000)} de capital ramène la part soumise à ${h.eur(apport.soumis)} et ses cotisations supplémentaires à ${h.eur(apport.cotis)}.</p>
<p>Sur l’année, le moteur intègre cette règle quand il cherche le meilleur partage. Pour ${h.eur(benef)} de bénéfice :</p>
${h.table(['Capital', 'Part en rémunération', 'Rémunération nette', 'Dividendes nets', 'Revenu disponible / an'], parCapital.map((c) => [h.eur(c.k), h.pct(c.o.partRemuneration ?? 0, 0), h.eur(c.o.remunerationNette), h.eur(c.o.dividendesNets), h.eur(c.o.net)]), `EURL à l’IS, ${h.eur(benef)} de bénéfice, personne seule, tout distribué`, ['l', 'r', 'r', 'r', 'r'])}
<p>À ce niveau de bénéfice, le moteur distribue quand même une partie, car le bénéfice laissé dans la société profite de l’${h.src('spIs', 'impôt sur les sociétés')} à ${h.pct(P.is.taux_reduit, 0)} jusqu’à ${h.eur(P.is.seuil_reduit)}. Un capital plus élevé améliore le résultat, mais l’effet reste limité face au poids de la rémunération.</p>

<h2>EURL ou SASU pour qui veut des dividendes</h2>
<p>Le président de SASU n’a pas de règle des ${h.pct(S, 0)} : ses dividendes ne supportent que la flat tax, quel que soit le capital. Pour ${h.eur(div)} de dividendes, il garde ${h.eur(pfu(div).net)}, contre ${h.eur(v5.net)} pour le gérant d’EURL au capital de ${h.eur(5000)}. Cet avantage se paie ailleurs, par un salaire plus coûteux en cotisations : le bilan complet est sur ${h.a('eurl-ou-sasu', 'EURL ou SASU')}, la décomposition de la flat tax sur ${h.a('flat-tax-dividendes', 'la flat tax des dividendes')} et le détail du barème sur ${h.a('cotisations-tns', 'les cotisations TNS')}. Le calcul complet se fait dans le ${h.a('eurl', 'simulateur d’EURL')}.</p>
<p>Ces montants sont des estimations à partir des barèmes 2026 et ne constituent pas un conseil : l’Urssaf calcule les cotisations dues et l’administration fiscale l’impôt.</p>`,
  },
  en: {
    slug: 'eurl-dividends',
    nav: 'EURL dividends',
    card: 'The 10% of capital rule, contributions on the excess and what you actually keep.',
    title: 'EURL dividends France 2026: the 10% capital rule in numbers',
    description: 'EURL dividends in France, 2026: above 10% of capital and current accounts, self-employed contributions on top of the 31.4% flat tax. Take-home by capital level.',
    h1: 'EURL dividends: what the 10% rule really takes',
    intro: 'For a majority manager, one dividend can bear both tax and self-employed contributions; the size of your share capital decides how much.',
    resume: `If you run an EURL (entreprise unipersonnelle à responsabilité limitée, a French one-member limited company) that pays corporate tax and you are its majority manager, in 2026 you pay self-employed contributions on the part of your dividends above ${EN.pct(S, 0)} of share capital, share premium and money left in your partner current account, on top of tax. With ${EN.eur(5000)} of capital, only ${EN.eur(libre(5000))} of dividends escape: on ${EN.eur(div)} paid out alongside ${EN.eur(remu)} of manager pay, ${EN.eur(v5.soumis)} enters the social contribution base and costs ${EN.eur(v5.cotis)} in extra contributions, according to our engine. The ${EN.pct(P.dividendes.pfu_ir)} income tax part of the flat tax still applies to the whole dividend; the ${EN.pct(P.dividendes.prelevements_sociaux)} social levies only hit the part not subject to contributions. You end up with ${EN.eur(v5.net)}, against ${EN.eur(pfu(div).net)} for a SASU president receiving the same dividend. The more capital and current-account money you have, the larger the contribution-free share: you would need ${EN.eur(capitalPour(div))} to pay out ${EN.eur(div)} with no contributions at all. That is why EURL managers are mostly paid through manager pay rather than dividends.`,
    faqs: [
      { q: 'Which part of my EURL dividends bears social contributions?', a: `The part above ${EN.pct(S, 0)} of share capital, share premium and partner current accounts, for a majority manager (service-public, sheet F32963). With ${EN.eur(5000)} of capital and ${EN.eur(div)} of dividends, ${EN.eur(v5.soumis)} is subject to self-employed contributions. The remaining ${EN.eur(div - v5.soumis)} only bears the ${EN.pct(P.dividendes.pfu)} flat tax.` },
      { q: 'How much capital do I need to pay €20,000 of EURL dividends contribution-free?', a: `${EN.eur(capitalPour(div))} of capital, share premium and current accounts combined, since only ${EN.pct(S, 0)} of that total escapes contributions. For ${EN.eur(10000)} of dividends you would need ${EN.eur(capitalPour(10000))}. Most EURLs have far less: with ${EN.eur(1000)} of capital the contribution-free amount is no more than ${EN.eur(libre(1000))}.` },
      { q: 'Does lending money to my EURL through a current account cut contributions on dividends?', a: `Yes, because current accounts count towards the ${EN.pct(S, 0)} base. A manager who leaves ${EN.eur(45000)} in the current account alongside ${EN.eur(5000)} of capital brings the part subject to contributions down from ${EN.eur(v5.soumis)} to ${EN.eur(apport.soumis)} on ${EN.eur(div)} of dividends. Extra contributions fall from ${EN.eur(v5.cotis)} to ${EN.eur(apport.cotis)}, according to the engine.` },
      { q: 'What do €20,000 of EURL dividends cost in contributions alongside €30,000 of pay?', a: `With ${EN.eur(5000)} of capital the engine adds ${EN.eur(v5.cotis)} of contributions, ${EN.pct(tauxCotisDiv)} of the part caught: it is added to pay in the gross social income, then goes through the ${EN.pct(P.tns.abattement, 0)} allowance and the 2026 scale. On top come ${EN.eur(v5.p.total)} of income tax and social levies. The manager keeps ${EN.eur(v5.net)}.` },
      { q: 'As an EURL manager, should I take dividends or manager pay?', a: `Mostly pay, as long as capital is small. On ${EN.eur(60000)} of profit and ${EN.eur(1000)} of capital, the engine puts ${EN.pct(petit.partRemuneration ?? 0, 0)} of profit into pay. At ${EN.eur(benef)} it pays out more, ${EN.pct(1 - (parCapital[0].o.partRemuneration ?? 0), 0)} of profit, because corporate tax at ${EN.pct(P.is.taux_reduit, 0)} on the first ${EN.eur(P.is.seuil_reduit)} makes distribution worthwhile despite the contributions.` },
      { q: 'Do EURL dividends caught by contributions also pay the flat tax?', a: `Partly. The ${EN.pct(P.dividendes.pfu_ir)} income tax applies to the whole dividend; in our engine the ${EN.pct(P.dividendes.prelevements_sociaux)} social levies only apply to the part not subject to contributions, since CSG-CRDS is already collected with them. On ${EN.eur(div)} with ${EN.eur(1000)} of capital, the flat tax drops to ${EN.eur(v1.p.total)} instead of ${EN.eur(pfu(div).total)}.` },
    ],
    body: (h) => `
<h2>The ${h.pct(S, 0)} rule in one sentence</h2>
<p>For the majority manager of an EURL or SARL (the multi-member version) paying corporate tax, income subject to contributions includes manager pay and any dividends above ${h.pct(S, 0)} of share capital, share premium and partner current accounts (${h.src('urssafReforme', 'Urssaf, contribution base reform')}; ${h.src('spDividendes', 'service-public, sheet F32963')}). Below that line, a dividend is ordinary investment income taxed under the flat tax. Above it, the Urssaf, which collects social contributions, treats it as extra pay.</p>
<p>The threshold depends on the balance sheet: ${h.eur(1000)} of capital frees ${h.eur(libre(1000))} of contribution-free dividends, ${h.eur(50000)} frees ${h.eur(libre(50000))}. It is not a cap on what you may pay out, only the point beyond which a dividend changes social treatment.</p>

<h2>What ${h.eur(div)} of dividends costs, by capital</h2>
${h.table(['Capital and current accounts', 'Part subject to contributions', 'Extra contributions', 'Income tax and social levies', 'Take-home'], grille.map((g) => [h.eur(g.k), h.eur(g.soumis), h.eur(g.cotis), h.eur(g.p.total), h.eur(g.net)]), `${h.eur(div)} of dividends, manager already paid ${h.eur(remu)} a year, ${h.src('urssafTauxAC', '2026 Urssaf scale')}`, ['l', 'r', 'r', 'r', 'r'])}
<p>The gap between the first and last rows, ${h.eur(grille[grille.length - 1].net - v1.net)}, comes from capital alone. Extra contributions follow the self-employed scale applied to pay plus the part caught, after the ${h.pct(P.tns.abattement, 0)} allowance, so their weight also depends on how much pay you already draw. The mini-calculator at the top lets you vary all three inputs.</p>

<h2>Why social levies go down</h2>
<p>The ${h.pct(P.dividendes.pfu)} flat tax combines ${h.pct(P.dividendes.pfu_ir)} income tax and ${h.pct(P.dividendes.prelevements_sociaux)} social levies. On the slice already subject to manager contributions, which include CSG-CRDS, the engine does not charge social levies again. The ${h.pct(P.dividendes.pfu_ir)} income tax still applies to the whole dividend. So with little capital, the “tax and levies” column looks light, but the “contributions” column more than makes up for it.</p>

<h2>Capital is the main lever</h2>
<p>Paying out ${h.eur(div)} with no contributions would take ${h.eur(capitalPour(div))} of capital, share premium and current accounts. A partner current account (compte courant d’associé), the money a manager lends to the company, counts in that base just like capital. A manager who leaves ${h.eur(45000)} in the current account next to ${h.eur(5000)} of capital brings the part caught down to ${h.eur(apport.soumis)} and extra contributions to ${h.eur(apport.cotis)}.</p>
<p>Over a full year, the engine builds this rule into its search for the best split. On ${h.eur(benef)} of profit:</p>
${h.table(['Capital', 'Share as pay', 'Net pay', 'Net dividends', 'Disposable income / yr'], parCapital.map((c) => [h.eur(c.k), h.pct(c.o.partRemuneration ?? 0, 0), h.eur(c.o.remunerationNette), h.eur(c.o.dividendesNets), h.eur(c.o.net)]), `EURL under corporate tax, ${h.eur(benef)} of profit, single, everything paid out`, ['l', 'r', 'r', 'r', 'r'])}
<p>At this profit level the engine still pays some dividends, because profit kept in the company benefits from ${h.src('spIs', 'corporate tax')} at ${h.pct(P.is.taux_reduit, 0)} up to ${h.eur(P.is.seuil_reduit)}. More capital improves the result, but the effect stays small next to the weight of manager pay.</p>

<h2>EURL or SASU if you want dividends</h2>
<p>Many founders arriving in France assume dividends are taxed the same whatever the company. Not here: a SASU president has no ${h.pct(S, 0)} rule, and dividends bear only the flat tax whatever the capital. On ${h.eur(div)} of dividends the president keeps ${h.eur(pfu(div).net)}, against ${h.eur(v5.net)} for an EURL manager with ${h.eur(5000)} of capital. That advantage is paid for elsewhere, through a salary that costs more in contributions: the full picture is on ${h.a('eurl-ou-sasu', 'EURL or SASU')}, the flat tax breakdown on ${h.a('flat-tax-dividendes', 'the dividend flat tax')} and the contribution scale on ${h.a('cotisations-tns', 'TNS contributions')}. Run your own figures in the ${h.a('eurl', 'EURL calculator')}.</p>
<p>These amounts are estimates based on the 2026 scales and are not advice: the Urssaf works out the contributions due and the tax office the tax.</p>`,
  },
});
