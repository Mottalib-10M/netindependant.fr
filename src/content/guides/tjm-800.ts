import { defineGuide } from '../../lib/guide-types';
import { comparer } from '../../lib/engine/statuts';
import { eiReel } from '../../lib/engine/tns';
import { impotRevenu } from '../../lib/engine/ir';
import { P, FR, EN } from '../../lib/fmt';

// Palier de 800 € : le taux marginal de l'impôt sur le revenu, le plafonnement du quotient familial et le PFU.
const TJM = 800;
const FRAIS = 0.08;
const JOURS = [160, 180, 200, 220];
const S = Object.fromEntries(JOURS.map((j) => [j, comparer({ ca: TJM * j, charges: 0, activite: 'bnc', fraisPortage: FRAIS })])) as Record<number, ReturnType<typeof comparer>>;
const ca = (j: number) => TJM * j;
const jPlafond = Math.floor(P.micro.plafonds.services / TJM);
const bareme = P.ir.bareme as Array<[number | null, number]>;
const limite30 = bareme[2][0] as number; // fin de la tranche à 30 %
const taux30 = bareme[2][1];
const taux41 = bareme[3][1];
const ei = (j: number) => eiReel(ca(j));
const tmiEI = (j: number) => impotRevenu(ei(j).imposable).tmi;
const imposable200 = ei(200).imposable;
const seul = impotRevenu(imposable200, { parts: 1, couple: false });
const parent = impotRevenu(imposable200, { parts: 1.5, couple: false });
const e200 = S[200].eurl;
// Dividendes au barème : abattement de 40 %, puis taux marginal.
const divBareme41 = (1 - P.dividendes.abattement_bareme) * taux41;

export default defineGuide({
  id: 'tjm-800',
  group: 'freelance',
  order: 110,
  mini: 'tjmPalier',
  miniDefaults: { tjm: 800 },
  miniHref: 'tjm-freelance',
  related: ['tjm-600', 'tjm-freelance', 'comparateur-statuts', 'flat-tax-dividendes', 'dividendes-eurl'],
  sources: ['spBareme', 'spQuotient', 'spDividendes', 'urssafTauxAC', 'spIs'],
  fr: {
    slug: 'tjm-800',
    nav: 'TJM 800 €',
    card: 'Tranche à 41 %, plafonnement du quotient familial et prélèvement forfaitaire.',
    title: 'TJM 800 € en 2026 : tranche à 41 %, PFU et net par statut',
    description: 'TJM 800 € en 2026 : le revenu d’un EI entre dans la tranche à 41 % dès 160 jours. L’EURL bascule alors vers les dividendes au PFU de 31,4 %. Net par statut.',
    h1: 'TJM de 800 € : le taux marginal d’impôt décide du montage',
    intro: 'À ce taux, chaque euro de revenu supplémentaire est imposé à 41 % en entreprise individuelle, et la façon de se payer change tout.',
    resume: `Avec un TJM de ${FR.eur(TJM)}, la micro-entreprise est hors jeu au-delà de ${FR.num(jPlafond)} jours facturés, et la question devient fiscale. En entreprise individuelle au réel, ${FR.num(200)} jours, soit ${FR.eur(ca(200))}, donnent ${FR.eur(imposable200)} de revenu imposable pour une personne seule : la dernière tranche atteinte est celle à ${FR.pct(taux41, 0)}, qui commence à ${FR.eur(limite30)}. Le net tombe à ${FR.eur(S[200].ei.netMensuel)} par mois. En EURL, le moteur verse ${FR.pct(e200.partRemuneration ?? 0, 0)} du bénéfice en rémunération, juste assez pour rester dans la tranche à ${FR.pct(taux30, 0)}, et distribue le reste en dividendes : ${FR.eur(e200.netMensuel)} par mois, le meilleur résultat. La SASU suit avec ${FR.eur(S[200].sasu.netMensuel)}. Les dividendes supportent le prélèvement forfaitaire unique de ${FR.pct(P.dividendes.pfu)}, dont ${FR.pct(P.dividendes.pfu_ir)} d’impôt, bien moins que la tranche à ${FR.pct(taux41, 0)}. Avec des enfants, le gain du quotient familial est plafonné à ${FR.eur(P.ir.plafond_demi_part)} par demi-part. Ces montants sont des estimations, pas un conseil fiscal.`,
    faqs: [
      { q: 'Quel taux marginal d’impôt avec un TJM de 800 € ?', a: `${FR.pct(taux41, 0)} pour une personne seule en entreprise individuelle, dès ${FR.num(160)} jours facturés. Sur ${FR.num(200)} jours, le revenu imposable atteint ${FR.eur(imposable200)}, au-dessus de ${FR.eur(limite30)}, limite de la tranche à ${FR.pct(taux30, 0)} du barème 2026 publié par service-public. Chaque euro gagné en plus y perd ${FR.pct(taux41, 0)} d’impôt, après les cotisations des indépendants, ce qui pousse à revoir le mode de rémunération.` },
      { q: 'Pourquoi l’EURL limite-t-elle la rémunération du gérant à 800 € par jour ?', a: `Parce qu’au-delà, la rémunération entrerait dans la tranche à ${FR.pct(taux41, 0)}. Sur ${FR.num(200)} jours, le moteur s’arrête à ${FR.eur(e200.remunerationNette)} de rémunération nette, puis laisse le reste du bénéfice en société : ${FR.eur(e200.impotSocietes)} d’impôt sur les sociétés au taux réduit, puis distribution. Le net atteint ${FR.eur(e200.netMensuel)} par mois, contre ${FR.eur(S[200].ei.netMensuel)} en entreprise individuelle, pour une personne seule sans frais.` },
      { q: 'Prélèvement forfaitaire ou barème pour des dividendes à 800 € par jour ?', a: `Le prélèvement forfaitaire, dans ce cas. Il prend ${FR.pct(P.dividendes.pfu_ir)} d’impôt plus ${FR.pct(P.dividendes.prelevements_sociaux)} de prélèvements sociaux. Au barème, le dividende bénéficie d’un abattement de ${FR.pct(P.dividendes.abattement_bareme, 0)}, mais le reste est imposé au taux marginal : à ${FR.pct(taux41, 0)}, cela fait ${FR.pct(divBareme41)} d’impôt, presque le double. Le moteur retient donc le prélèvement forfaitaire pour tous les dividendes, selon les taux de service-public.` },
      { q: 'Un enfant réduit-il l’impôt d’un freelance à 800 € par jour ?', a: `Oui, mais l’avantage est plafonné. En entreprise individuelle sur ${FR.num(200)} jours, un parent seul avec un enfant paie ${FR.eur(parent.impot)} d’impôt au lieu de ${FR.eur(seul.impot)} sans enfant : la demi-part supplémentaire rapporte ${FR.eur(seul.impot - parent.impot)}, soit exactement le plafond de ${FR.eur(P.ir.plafond_demi_part)} par demi-part fixé pour 2026. Dans ce calcul, le plafonnement joue donc pleinement.` },
      { q: 'Quel écart entre portage et EURL à 800 € par jour ?', a: `Sur ${FR.num(200)} jours, le portage salarial laisse ${FR.eur(S[200].portage.netMensuel)} par mois, l’EURL ${FR.eur(e200.netMensuel)} : ${FR.eur(e200.netMensuel - S[200].portage.netMensuel)} d’écart, avec des frais de gestion de portage supposés à ${FR.pct(FRAIS, 0)}, faute de barème officiel. Le salaire porté supporte toutes les cotisations salariales et patronales et ne peut pas basculer vers les dividendes ; il reste imposé à votre taux marginal.` },
    ],
    body: (h) => `
<h2>La tranche à ${h.pct(taux41, 0)} : le seuil qui commande le montage</h2>
<p>Le barème 2026 de l’impôt sur le revenu (${h.src('spBareme', 'service-public, fiche F1419')}) passe de ${h.pct(taux30, 0)} à ${h.pct(taux41, 0)} au-delà de ${h.eur(limite30)} par part. À ${h.eur(TJM)} par jour, un entrepreneur individuel seul franchit cette limite dès ${h.num(160)} jours facturés. À partir de là, chaque jour de plus est taxé à ${h.pct(taux41, 0)} après cotisations, et le revenu tiré de l’activité n’a plus intérêt à passer tout entier par la déclaration de revenus. C’est la différence avec ${h.a('tjm-600', 'un TJM de 600 €')}, où la question portait sur l’impôt sur les sociétés : ici, c’est l’impôt personnel qui fixe la frontière. Une société à l’IS permet de payer une rémunération jusqu’au haut de la tranche à ${h.pct(taux30, 0)}, puis de laisser le surplus en société, imposé à ${h.pct(P.is.taux_reduit, 0)} jusqu’à ${h.eur(P.is.seuil_reduit)} de bénéfice (${h.src('spIs', 'service-public, fiche F23575')}), avant de le sortir en dividendes au prélèvement forfaitaire. Le montage ne fait pas disparaître l’impôt ; il remplace une tranche à ${h.pct(taux41, 0)} par un empilement plus léger, et il suppose de distribuer le bénéfice ou de le laisser dans la société.</p>

<h2>Taux marginal et net, de 160 à 220 jours</h2>
${h.table(['Jours facturés', 'Chiffre d’affaires', 'Taux marginal en EI', 'EI net/mois', 'EURL : part en rémunération', 'EURL net/mois', 'SASU net/mois', 'Portage net/mois'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), h.pct(tmiEI(j), 0), h.eur(S[j].ei.netMensuel), h.pct(S[j].eurl.partRemuneration ?? 0, 0), h.eur(S[j].eurl.netMensuel), h.eur(S[j].sasu.netMensuel), h.eur(S[j].portage.netMensuel)]), `TJM de ${h.eur(TJM)}, personne seule, sans frais, dividendes au prélèvement forfaitaire ; portage avec ${h.pct(FRAIS, 0)} de frais de gestion ; la micro est fermée au-delà de ${h.num(jPlafond)} jours`, ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>À ${h.num(160)} jours, l’EURL verse encore tout en rémunération. Dès ${h.num(180)} jours, la part baisse : le moteur garde une rémunération à peu près constante, calée sous la limite de ${h.eur(limite30)}, et tout le reste devient dividende. L’écart avec l’EI grandit à chaque ligne. Pour d’autres foyers ou des frais réels, le ${h.a('comparateur-statuts', 'comparateur de statuts')} refait le calcul.</p>

<h2>Le prélèvement forfaitaire face au barème</h2>
<p>Les dividendes sont imposés par défaut au prélèvement forfaitaire unique de ${h.pct(P.dividendes.pfu)} : ${h.pct(P.dividendes.pfu_ir)} d’impôt et ${h.pct(P.dividendes.prelevements_sociaux)} de prélèvements sociaux (${h.src('spDividendes', 'service-public, fiche F32963')}). L’option pour le barème accorde un abattement de ${h.pct(P.dividendes.abattement_bareme, 0)}, mais dans la tranche à ${h.pct(taux41, 0)} il reste ${h.pct(divBareme41)} d’impôt : le forfait l’emporte nettement. En EURL, attention à une particularité : la part des dividendes qui dépasse ${h.pct(P.dividendes.seuil_tns_capital, 0)} du capital et des comptes courants supporte les cotisations des indépendants (${h.src('urssafTauxAC', 'Urssaf')}), ce que le moteur intègre avec un capital de ${h.eur(1000)}. La page ${h.a('dividendes-eurl', 'dividendes en EURL')} détaille ce point, et ${h.a('flat-tax-dividendes', 'la flat tax')} le prélèvement lui-même.</p>

<h2>Le plafonnement du quotient familial</h2>
<p>Un enfant ajoute une demi-part, mais l’économie d’impôt qu’elle procure est plafonnée à ${h.eur(P.ir.plafond_demi_part)} (${h.src('spQuotient', 'service-public, fiche F2705')}). En EI sur ${h.num(200)} jours, un parent seul paie ${h.eur(parent.impot)} au lieu de ${h.eur(seul.impot)} : le plafond est atteint. À ce niveau de TJM, la situation familiale réduit l’impôt d’un montant fixe, sans faire baisser le taux marginal de ${h.pct(taux41, 0)} sur la tranche haute.</p>
<p>Le palier précédent, ${h.a('tjm-600', '600 €')}, montre le partage vu du côté de la SASU, et le ${h.a('tjm-freelance', 'simulateur TJM')} teste votre propre volume de jours. Ces résultats sont des estimations : l’administration fiscale et l’Urssaf fixent les montants définitifs.</p>`,
  },
  en: {
    slug: 'day-rate-800',
    nav: 'Day rate €800',
    card: 'The 41% tax band, the family quotient cap and the dividend flat tax.',
    title: 'Day rate €800 in 2026: 41% tax band, flat tax, take-home',
    description: 'Day rate €800 in 2026: a sole trader’s income hits the 41% band from 160 days. An EURL then shifts to dividends under the 31.4% flat tax. Take-home by form.',
    h1: 'A €800 day rate: your marginal tax rate shapes the set-up',
    intro: 'At this rate every extra euro is taxed at 41% as a sole trader, and how you pay yourself changes everything.',
    resume: `On an ${EN.eur(TJM)} day rate, the micro-enterprise (France’s simplified self-employed scheme) is out beyond ${EN.num(jPlafond)} billed days, and the question becomes one of tax. As a sole trader on real profit (EI), ${EN.num(200)} days, or ${EN.eur(ca(200))}, give ${EN.eur(imposable200)} of taxable income for a single person: the top band reached is the ${EN.pct(taux41, 0)} band, which starts at ${EN.eur(limite30)}. Take-home falls to ${EN.eur(S[200].ei.netMensuel)} a month. In an EURL (single-member limited company), the engine pays ${EN.pct(e200.partRemuneration ?? 0, 0)} of profit as the manager’s pay, just enough to stay in the ${EN.pct(taux30, 0)} band, and pays the rest out as dividends: ${EN.eur(e200.netMensuel)} a month, the best result. A SASU follows at ${EN.eur(S[200].sasu.netMensuel)}. Dividends bear the ${EN.pct(P.dividendes.pfu)} flat tax (PFU), of which ${EN.pct(P.dividendes.pfu_ir)} is income tax, far less than the ${EN.pct(taux41, 0)} band. With children, the benefit of the family quotient is capped at ${EN.eur(P.ir.plafond_demi_part)} per half share. These figures are estimates, not tax advice.`,
    faqs: [
      { q: 'What is my marginal tax rate on an €800 day rate?', a: `${EN.pct(taux41, 0)} for a single sole trader, from ${EN.num(160)} billed days. On ${EN.num(200)} days, taxable income reaches ${EN.eur(imposable200)}, above ${EN.eur(limite30)}, the top of the ${EN.pct(taux30, 0)} band in the 2026 scale published by service-public. Each extra euro there loses ${EN.pct(taux41, 0)} in income tax after self-employed contributions, which is the cue to rethink how you pay yourself.` },
      { q: 'Why does an EURL cap the manager’s pay at €800 a day?', a: `Because beyond that point, pay would fall into the ${EN.pct(taux41, 0)} band. On ${EN.num(200)} days the engine stops at ${EN.eur(e200.remunerationNette)} of net pay and leaves the rest of the profit in the company: ${EN.eur(e200.impotSocietes)} of corporate tax at the reduced rate, then a payout. Take-home reaches ${EN.eur(e200.netMensuel)} a month, against ${EN.eur(S[200].ei.netMensuel)} as a sole trader, for a single person with no expenses.` },
      { q: 'Flat tax or tax scale for dividends at €800 a day?', a: `The flat tax, in this case. It takes ${EN.pct(P.dividendes.pfu_ir)} income tax plus ${EN.pct(P.dividendes.prelevements_sociaux)} social levies. On the scale, dividends get a ${EN.pct(P.dividendes.abattement_bareme, 0)} allowance, but the rest is taxed at your marginal rate: at ${EN.pct(taux41, 0)}, that is ${EN.pct(divBareme41)} income tax, nearly double. The engine therefore applies the flat tax to all dividends, using the service-public rates.` },
      { q: 'Does a child cut a freelancer’s tax at €800 a day?', a: `Yes, but the benefit is capped. As a sole trader on ${EN.num(200)} days, a single parent with one child pays ${EN.eur(parent.impot)} instead of ${EN.eur(seul.impot)} without: the extra half share (French tax counts household members in shares, the quotient familial) is worth ${EN.eur(seul.impot - parent.impot)}, exactly the ${EN.eur(P.ir.plafond_demi_part)} cap per half share for 2026.` },
      { q: 'How far is umbrella employment behind an EURL at €800 a day?', a: `On ${EN.num(200)} days, umbrella employment leaves ${EN.eur(S[200].portage.netMensuel)} a month and the EURL ${EN.eur(e200.netMensuel)}: a ${EN.eur(e200.netMensuel - S[200].portage.netMensuel)} gap, with an umbrella fee assumed at ${EN.pct(FRAIS, 0)}, since there is no official scale. Umbrella pay carries every employee and employer contribution and cannot be shifted to dividends; it stays taxed at your marginal rate.` },
    ],
    body: (h) => `
<h2>The ${h.pct(taux41, 0)} band: the threshold that shapes the set-up</h2>
<p>The 2026 French income tax scale (${h.src('spBareme', 'service-public, sheet F1419')}) moves from ${h.pct(taux30, 0)} to ${h.pct(taux41, 0)} above ${h.eur(limite30)} per share. At ${h.eur(TJM)} a day, a single sole trader crosses that line from ${h.num(160)} billed days. From there, every extra day is taxed at ${h.pct(taux41, 0)} after contributions, and it no longer pays to put all business income through your personal tax return. That is the difference with ${h.a('tjm-600', 'a €600 day rate')}, where the issue was corporate tax: here personal income tax sets the line. A company paying corporate tax (IS) lets you draw pay up to the top of the ${h.pct(taux30, 0)} band, then leave the surplus in the company, taxed at ${h.pct(P.is.taux_reduit, 0)} up to ${h.eur(P.is.seuil_reduit)} of profit (${h.src('spIs', 'service-public, sheet F23575')}), before taking it out as dividends under the flat tax. The set-up does not make tax disappear; it swaps a ${h.pct(taux41, 0)} band for a lighter stack of levies, and it means paying the profit out or leaving it in the company.</p>

<h2>Marginal rate and take-home, 160 to 220 days</h2>
${h.table(['Days billed', 'Turnover', 'Marginal rate as EI', 'EI net/month', 'EURL: share as pay', 'EURL net/month', 'SASU net/month', 'Umbrella net/month'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), h.pct(tmiEI(j), 0), h.eur(S[j].ei.netMensuel), h.pct(S[j].eurl.partRemuneration ?? 0, 0), h.eur(S[j].eurl.netMensuel), h.eur(S[j].sasu.netMensuel), h.eur(S[j].portage.netMensuel)]), `${h.eur(TJM)} day rate, single, no expenses, dividends under the flat tax; umbrella with a ${h.pct(FRAIS, 0)} fee; micro closed beyond ${h.num(jPlafond)} days`, ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>At ${h.num(160)} days the EURL still pays everything as pay. From ${h.num(180)} days the share drops: the engine keeps pay roughly constant, set below the ${h.eur(limite30)} line, and everything else becomes dividends. The gap with the EI widens on every row. For other households or real expenses, the ${h.a('comparateur-statuts', 'legal form comparison')} reruns the numbers.</p>

<h2>Flat tax against the scale</h2>
<p>By default dividends bear the ${h.pct(P.dividendes.pfu)} flat tax (prélèvement forfaitaire unique): ${h.pct(P.dividendes.pfu_ir)} income tax and ${h.pct(P.dividendes.prelevements_sociaux)} social levies (${h.src('spDividendes', 'service-public, sheet F32963')}). Opting for the scale gives a ${h.pct(P.dividendes.abattement_bareme, 0)} allowance, but in the ${h.pct(taux41, 0)} band ${h.pct(divBareme41)} income tax remains: the flat tax wins clearly. One EURL quirk: the part of dividends above ${h.pct(P.dividendes.seuil_tns_capital, 0)} of share capital and shareholder loans bears self-employed contributions (${h.src('urssafTauxAC', 'Urssaf')}), which the engine includes with ${h.eur(1000)} of capital. See ${h.a('dividendes-eurl', 'EURL dividends')} and ${h.a('flat-tax-dividendes', 'the dividend flat tax')}.</p>

<h2>The family quotient cap</h2>
<p>A child adds half a share, but the tax saving it brings is capped at ${h.eur(P.ir.plafond_demi_part)} (${h.src('spQuotient', 'service-public, sheet F2705')}). As a sole trader on ${h.num(200)} days, a single parent pays ${h.eur(parent.impot)} instead of ${h.eur(seul.impot)}: the cap is reached. At this day rate, family situation cuts tax by a fixed amount without lowering the ${h.pct(taux41, 0)} rate on the top slice.</p>
<p>The previous level, ${h.a('tjm-600', '€600')}, shows the split from the SASU side, and the ${h.a('tjm-freelance', 'day rate calculator')} tests your own number of days. These are estimates: the tax office and the Urssaf set the final amounts.</p>`,
  },
});
