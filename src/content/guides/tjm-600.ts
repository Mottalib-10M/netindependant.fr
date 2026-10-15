import { defineGuide } from '../../lib/guide-types';
import { comparer, sasuPart } from '../../lib/engine/statuts';
import { assimileDepuisCout } from '../../lib/engine/assimile';
import { impotSocietes } from '../../lib/engine/societe';
import { P, FR, EN } from '../../lib/fmt';

// Palier de 600 € : la SASU, le partage salaire / dividendes et la marche de l'IS (15 % puis 25 %).
const TJM = 600;
const FRAIS = 0.08;
const JOURS = [160, 180, 200, 220];
const entree = (j: number) => ({ ca: TJM * j, charges: 0, activite: 'bnc' as const, fraisPortage: FRAIS });
const S = Object.fromEntries(JOURS.map((j) => [j, comparer(entree(j))])) as Record<number, ReturnType<typeof comparer>>;
const ca = (j: number) => TJM * j;
const jPlafond = Math.floor(P.micro.plafonds.services / TJM);
// Bénéfice soumis à l'IS dans la SASU au meilleur partage, et sa part taxée à 25 %.
const benefIS = (j: number) => ca(j) - assimileDepuisCout(ca(j) * (S[j].sasu.partRemuneration ?? 0)).cout;
const isDetail = (j: number) => impotSocietes(benefIS(j));
const s200 = S[200].sasu;
const e200 = S[200].eurl;
const toutSalaire = sasuPart(entree(200), 1);
const toutDividendes = sasuPart(entree(200), 0);
const prelevSasu = s200.cotisations + s200.impotSocietes + s200.prelevementsDividendes;
const prelevEurl = e200.cotisations + e200.impotSocietes + e200.prelevementsDividendes + e200.impotRevenu;

export default defineGuide({
  id: 'tjm-600',
  group: 'freelance',
  order: 100,
  mini: 'tjmPalier',
  miniDefaults: { tjm: 600 },
  miniHref: 'tjm-freelance',
  related: ['tjm-500', 'tjm-800', 'tjm-freelance', 'comparateur-statuts', 'salaire-ou-dividendes', 'impot-sur-les-societes'],
  sources: ['spIs', 'spDividendes', 'urssafTauxSalarie', 'urssafTauxAC', 'spPlafonds'],
  fr: {
    slug: 'tjm-600',
    nav: 'TJM 600 €',
    card: 'SASU, salaire et dividendes : l’impôt sur les sociétés passe de 15 à 25 %.',
    title: 'TJM 600 € en 2026 : SASU, dividendes et IS à 15 puis 25 %',
    description: 'TJM 600 € en 2026 : en SASU, le bénéfice dépasse 42 500 € et l’IS passe de 15 à 25 %. Part de salaire optimale, dividendes au PFU et écart avec l’EURL.',
    h1: 'TJM de 600 € : la SASU, ses dividendes et la marche de l’impôt sur les sociétés',
    intro: 'À ce taux, le partage entre salaire et dividendes pèse plus que le statut lui-même, et l’impôt sur les sociétés change de taux en cours de route.',
    resume: `Avec un TJM de ${FR.eur(TJM)} sur ${FR.num(200)} jours, soit ${FR.eur(ca(200))} de chiffre d’affaires, une SASU laisse ${FR.eur(s200.netMensuel)} par mois à son président quand ${FR.pct(s200.partRemuneration ?? 0, 0)} du bénéfice sont versés en salaire et le reste en dividendes, pour une personne seule sans frais. C’est le meilleur partage trouvé par le moteur : tout en salaire, le net tombe à ${FR.eur(toutSalaire.netMensuel)} ; tout en dividendes, il est de ${FR.eur(toutDividendes.netMensuel)}. Le bénéfice laissé dans la société, ${FR.eur(benefIS(200))}, dépasse le seuil de ${FR.eur(P.is.seuil_reduit)} : les premiers euros sont imposés à ${FR.pct(P.is.taux_reduit, 0)}, le reste à ${FR.pct(P.is.taux_normal, 0)}, soit ${FR.eur(s200.impotSocietes)} d’impôt sur les sociétés. Les dividendes supportent ensuite le prélèvement forfaitaire unique de ${FR.pct(P.dividendes.pfu)}. Même bien réglée, la SASU reste derrière l’EURL, qui laisse ${FR.eur(e200.netMensuel)} par mois. La micro-entreprise, elle, n’est plus possible au-delà de ${FR.num(jPlafond)} jours. Ces chiffres sont des estimations, à faire valider pour votre cas.`,
    faqs: [
      { q: 'Quelle part de salaire en SASU avec un TJM de 600 € ?', a: `Le moteur obtient le meilleur net avec ${FR.pct(S[160].sasu.partRemuneration ?? 0, 0)} du bénéfice en salaire sur ${FR.num(160)} jours et ${FR.pct(S[220].sasu.partRemuneration ?? 0, 0)} sur ${FR.num(220)} jours. Le salaire net annuel reste proche de ${FR.eur(s200.remunerationNette)} ; tout le surplus part en dividendes. Ce réglage vaut pour une personne seule sans autre revenu, aux taux 2026 du régime général publiés par l’Urssaf.` },
      { q: 'Combien d’impôt sur les sociétés pour une SASU à 600 € par jour ?', a: `Sur ${FR.num(200)} jours, ${FR.eur(s200.impotSocietes)} : ${FR.eur(isDetail(200).reduit)} au taux de ${FR.pct(P.is.taux_reduit, 0)} sur les premiers ${FR.eur(P.is.seuil_reduit)} de bénéfice, et ${FR.eur(isDetail(200).normal)} à ${FR.pct(P.is.taux_normal, 0)} au-delà. Le taux réduit suppose notamment un capital entièrement libéré, détenu par des personnes physiques dans la proportion fixée, selon les conditions de la fiche F23575 de service-public.` },
      { q: 'Une SASU payée uniquement en dividendes à 600 € par jour, est-ce rentable ?', a: `Presque autant que le meilleur partage : ${FR.eur(toutDividendes.netMensuel)} par mois sur ${FR.num(200)} jours, contre ${FR.eur(s200.netMensuel)}. Mais sans salaire, le président ne cotise pas au régime général et le bénéfice entier subit l’impôt sur les sociétés, en grande partie à ${FR.pct(P.is.taux_normal, 0)}, puis le prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)}. Un petit salaire coûte peu ici et apporte une protection sociale.` },
      { q: 'Pourquoi l’EURL reste-t-elle devant la SASU à 600 € par jour ?', a: `Parce que la somme des prélèvements y est plus faible. Sur ${FR.num(200)} jours, la SASU paie ${FR.eur(prelevSasu)} de cotisations, d’impôt sur les sociétés et de prélèvement sur les dividendes ; l’EURL, qui verse tout en rémunération, paie ${FR.eur(prelevEurl)} de cotisations et d’impôt sur le revenu. L’écart de net atteint ${FR.eur(e200.netMensuel - s200.netMensuel)} par mois, pour une personne seule sans frais.` },
      { q: 'À partir de combien de jours un TJM de 600 € sort-il de la micro ?', a: `Le plafond de ${FR.eur(P.micro.plafonds.services)} est atteint au bout de ${FR.num(jPlafond)} jours facturés, soit à peine plus de six mois de missions continues. Une année isolée au-dessus est tolérée ; deux années consécutives font sortir du régime au 1er janvier suivant, selon service-public. À ce TJM, la micro ne convient donc qu’à une activité réduite ou à un démarrage.` },
    ],
    body: (h) => `
<h2>Au-delà de ${h.eur(P.is.seuil_reduit)} de bénéfice : l’impôt sur les sociétés change de taux</h2>
<p>À ${h.eur(TJM)} par jour, le choix ne se pose plus entre micro et société : la micro s’arrête à ${h.num(jPlafond)} jours. Il se pose à l’intérieur de la société, entre ce que vous vous versez en salaire et ce que vous laissez en bénéfice pour le distribuer en dividendes. En SASU, chaque euro de salaire supporte les cotisations du régime général ; chaque euro laissé dans la société paie l’impôt sur les sociétés, puis le prélèvement forfaitaire unique quand il sort. L’impôt sur les sociétés lui-même a deux marches (${h.src('spIs', 'service-public, fiche F23575')}) : ${h.pct(P.is.taux_reduit, 0)} jusqu’à ${h.eur(P.is.seuil_reduit)} de bénéfice, ${h.pct(P.is.taux_normal, 0)} au-delà. À ${h.a('tjm-500', '500 €')}, le bénéfice taxé restait proche de cette limite ; à ${h.eur(TJM)}, il la dépasse nettement, de ${h.eur(benefIS(160) - P.is.seuil_reduit)} sur ${h.num(160)} jours à ${h.eur(benefIS(220) - P.is.seuil_reduit)} sur ${h.num(220)} jours. Cette part supérieure est taxée à ${h.pct(P.is.taux_normal, 0)}, puis à ${h.pct(P.dividendes.pfu)} à la distribution. Le salaire optimal ne monte pas pour autant : il reste à un niveau où son impôt sur le revenu est presque nul, et c’est la tranche haute de l’IS qui absorbe la croissance du chiffre d’affaires.</p>

<h2>Le partage optimal, jour par jour</h2>
${h.table(['Jours facturés', 'Chiffre d’affaires', 'Part en salaire', 'Bénéfice soumis à l’IS', 'IS total', 'dont à 25 %', 'SASU net/mois', 'EURL net/mois'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), h.pct(S[j].sasu.partRemuneration ?? 0, 0), h.eur(benefIS(j)), h.eur(S[j].sasu.impotSocietes), h.eur(isDetail(j).normal), h.eur(S[j].sasu.netMensuel), h.eur(S[j].eurl.netMensuel)]), `SASU au meilleur partage salaire et dividendes, TJM de ${h.eur(TJM)}, personne seule, sans frais, dividendes au prélèvement forfaitaire unique`, ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>La part du salaire baisse à mesure que le chiffre d’affaires monte : le moteur garde une rémunération à peu près fixe et envoie le surplus en dividendes. Les nets des autres statuts, micro comprise, figurent dans le mini-simulateur en haut de page et dans le ${h.a('comparateur-statuts', 'comparateur de statuts')}.</p>

<h2>Trois réglages de la même SASU</h2>
<p>Sur ${h.num(200)} jours, verser tout le bénéfice en salaire laisse ${h.eur(toutSalaire.netMensuel)} par mois : les cotisations du ${h.src('urssafTauxSalarie', 'régime général')} pèsent trop lourd. Ne rien verser et tout distribuer laisse ${h.eur(toutDividendes.netMensuel)}. Le partage du moteur, ${h.pct(s200.partRemuneration ?? 0, 0)} en salaire, laisse ${h.eur(s200.netMensuel)}. L’écart entre le dernier et le deuxième réglage est faible ; il achète une couverture sociale, sans assurance chômage puisque le président n’y cotise pas. La page ${h.a('salaire-ou-dividendes', 'salaire ou dividendes')} détaille le raisonnement.</p>

<h2>Les dividendes au prélèvement forfaitaire</h2>
<p>Le prélèvement forfaitaire unique de ${h.pct(P.dividendes.pfu)} se compose de ${h.pct(P.dividendes.pfu_ir)} d’impôt sur le revenu et de ${h.pct(P.dividendes.prelevements_sociaux)} de prélèvements sociaux (${h.src('spDividendes', 'service-public, fiche F32963')}). Sur ${h.num(200)} jours, il représente ${h.eur(s200.prelevementsDividendes)} pour ${h.eur(s200.dividendesNets)} de dividendes nets perçus. En EURL, le même bénéfice irait à la rémunération du gérant, soumise au ${h.src('urssafTauxAC', 'barème des indépendants')} ; c’est ce qui lui donne l’avantage à ce palier.</p>
<p>Au palier suivant, ${h.a('tjm-800', 'un TJM de 800 €')}, c’est le taux marginal de l’impôt sur le revenu qui décide du partage. Le ${h.a('tjm-freelance', 'simulateur TJM')} et la page ${h.a('impot-sur-les-societes', 'impôt sur les sociétés')} complètent ce calcul. Il s’agit d’estimations, pas d’un conseil personnalisé.</p>`,
  },
  en: {
    slug: 'day-rate-600',
    nav: 'Day rate €600',
    card: 'SASU, salary and dividends: corporate tax steps up from 15% to 25%.',
    title: 'Day rate €600 in 2026: SASU, dividends, 15% then 25% tax',
    description: 'Day rate €600 in 2026: in a SASU, profit passes €42,500 and corporate tax steps from 15% to 25%. Best salary share, dividends under flat tax, gap with an EURL.',
    h1: 'A €600 day rate: the SASU, its dividends and the corporate tax step',
    intro: 'At this rate, the split between salary and dividends matters more than the legal form itself, and corporate tax changes rate along the way.',
    resume: `With a ${EN.eur(TJM)} day rate over ${EN.num(200)} days, or ${EN.eur(ca(200))} of turnover, a SASU (single-shareholder simplified company) leaves its president ${EN.eur(s200.netMensuel)} a month when ${EN.pct(s200.partRemuneration ?? 0, 0)} of profit is paid as salary and the rest as dividends, for a single person with no expenses. That is the best split the engine finds: all salary, take-home falls to ${EN.eur(toutSalaire.netMensuel)}; all dividends, it is ${EN.eur(toutDividendes.netMensuel)}. The profit left in the company, ${EN.eur(benefIS(200))}, passes the ${EN.eur(P.is.seuil_reduit)} threshold: the first euros of corporate tax (impôt sur les sociétés, IS) are charged at ${EN.pct(P.is.taux_reduit, 0)}, the rest at ${EN.pct(P.is.taux_normal, 0)}, ${EN.eur(s200.impotSocietes)} in all. Dividends then bear the ${EN.pct(P.dividendes.pfu)} flat tax. Even well tuned, the SASU stays behind an EURL (single-member limited company), which leaves ${EN.eur(e200.netMensuel)} a month. The micro-enterprise is no longer possible beyond ${EN.num(jPlafond)} days. These figures are estimates to check for your own case.`,
    faqs: [
      { q: 'What salary share in a SASU on a €600 day rate?', a: `The engine gets the best take-home with ${EN.pct(S[160].sasu.partRemuneration ?? 0, 0)} of profit as salary on ${EN.num(160)} days and ${EN.pct(S[220].sasu.partRemuneration ?? 0, 0)} on ${EN.num(220)} days. Net annual salary stays close to ${EN.eur(s200.remunerationNette)}; everything above goes out as dividends. This holds for a single person with no other income, at the 2026 general-scheme rates published by the Urssaf.` },
      { q: 'How much corporate tax does a SASU pay at €600 a day?', a: `On ${EN.num(200)} days, ${EN.eur(s200.impotSocietes)}: ${EN.eur(isDetail(200).reduit)} at ${EN.pct(P.is.taux_reduit, 0)} on the first ${EN.eur(P.is.seuil_reduit)} of profit, and ${EN.eur(isDetail(200).normal)} at ${EN.pct(P.is.taux_normal, 0)} above it. The reduced rate has conditions, among them fully paid-up share capital held by individuals in the required proportion rather than by other companies, as set out in service-public sheet F23575.` },
      { q: 'Is a dividends-only SASU worth it at €600 a day?', a: `Almost as good as the best split: ${EN.eur(toutDividendes.netMensuel)} a month on ${EN.num(200)} days, against ${EN.eur(s200.netMensuel)}. But with no salary the president pays nothing into the general social security scheme, and all profit bears corporate tax, much of it at ${EN.pct(P.is.taux_normal, 0)}, then the ${EN.pct(P.dividendes.pfu)} flat tax. A small salary costs little here and buys social cover.` },
      { q: 'Why does an EURL still beat a SASU at €600 a day?', a: `Because total levies are lower. On ${EN.num(200)} days, the SASU pays ${EN.eur(prelevSasu)} in contributions, corporate tax and dividend levies; the EURL, paying everything as the manager’s pay, pays ${EN.eur(prelevEurl)} in contributions and income tax. The take-home gap is ${EN.eur(e200.netMensuel - s200.netMensuel)} a month, for a single person with no expenses.` },
      { q: 'After how many days does a €600 rate leave the micro scheme?', a: `The ${EN.eur(P.micro.plafonds.services)} ceiling is reached after ${EN.num(jPlafond)} billed days, barely more than six months of continuous assignments. One isolated year above is tolerated; two consecutive years take you out of the scheme on the next 1 January, per service-public. At this rate, micro only suits part-time work or a first year.` },
    ],
    body: (h) => `
<h2>Above ${h.eur(P.is.seuil_reduit)} of profit, corporate tax changes rate</h2>
<p>At ${h.eur(TJM)} a day, the choice is no longer between micro and a company: micro ends at ${h.num(jPlafond)} days. It is made inside the company, between what you pay yourself as salary and what you leave as profit to pay out as dividends. In a SASU, each euro of salary carries general-scheme social contributions; each euro left in the company pays corporate tax, then the flat tax on the way out. Corporate tax itself has two steps (${h.src('spIs', 'service-public, sheet F23575')}): ${h.pct(P.is.taux_reduit, 0)} up to ${h.eur(P.is.seuil_reduit)} of profit, ${h.pct(P.is.taux_normal, 0)} above. At ${h.a('tjm-500', '€500')} the taxed profit stayed near that limit; at ${h.eur(TJM)} it is well over it, by ${h.eur(benefIS(160) - P.is.seuil_reduit)} on ${h.num(160)} days and ${h.eur(benefIS(220) - P.is.seuil_reduit)} on ${h.num(220)} days. That upper slice is taxed at ${h.pct(P.is.taux_normal, 0)}, then at ${h.pct(P.dividendes.pfu)} when distributed. The best salary does not rise with it: it stays at a level where its income tax is close to nil, and the upper corporate tax band absorbs the growth in turnover.</p>

<h2>The best split, day by day</h2>
${h.table(['Days billed', 'Turnover', 'Salary share', 'Profit taxed as IS', 'Total IS', 'of which at 25%', 'SASU net/month', 'EURL net/month'], JOURS.map((j) => [h.num(j), h.eur(ca(j)), h.pct(S[j].sasu.partRemuneration ?? 0, 0), h.eur(benefIS(j)), h.eur(S[j].sasu.impotSocietes), h.eur(isDetail(j).normal), h.eur(S[j].sasu.netMensuel), h.eur(S[j].eurl.netMensuel)]), `SASU at the best salary and dividend split, ${h.eur(TJM)} day rate, single, no expenses, dividends under the flat tax`, ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>The salary share falls as turnover rises: the engine keeps pay roughly fixed and sends the surplus out as dividends. Take-home under the other set-ups, micro included, is in the mini-calculator at the top and in the ${h.a('comparateur-statuts', 'legal form comparison')}.</p>

<h2>Three settings of the same SASU</h2>
<p>On ${h.num(200)} days, paying all profit as salary leaves ${h.eur(toutSalaire.netMensuel)} a month: ${h.src('urssafTauxSalarie', 'general-scheme')} contributions weigh too much. Paying nothing and distributing everything leaves ${h.eur(toutDividendes.netMensuel)}. The engine’s split, ${h.pct(s200.partRemuneration ?? 0, 0)} as salary, leaves ${h.eur(s200.netMensuel)}. The gap between the last two is small; it buys social cover, though not unemployment insurance, which a company president does not pay into. The ${h.a('salaire-ou-dividendes', 'salary or dividends')} page walks through the reasoning.</p>

<h2>Dividends under the flat tax</h2>
<p>The ${h.pct(P.dividendes.pfu)} flat tax (prélèvement forfaitaire unique, PFU) is ${h.pct(P.dividendes.pfu_ir)} income tax plus ${h.pct(P.dividendes.prelevements_sociaux)} social levies (${h.src('spDividendes', 'service-public, sheet F32963')}). On ${h.num(200)} days it comes to ${h.eur(s200.prelevementsDividendes)} for ${h.eur(s200.dividendesNets)} of net dividends received. In an EURL the same profit would go to the manager’s pay, under the ${h.src('urssafTauxAC', 'self-employed scale')}; that is what gives it the edge at this level.</p>
<p>At the next level, ${h.a('tjm-800', 'a €800 day rate')}, your marginal income tax rate drives the split. The ${h.a('tjm-freelance', 'day rate calculator')} and the ${h.a('impot-sur-les-societes', 'corporate tax')} page complete this estimate. These are estimates, not personal advice.</p>`,
  },
});
