import { defineGuide } from '../../lib/guide-types';
import { comparer } from '../../lib/engine/statuts';
import { P, FR, EN } from '../../lib/fmt';

// Palier de 500 € : la micro ne couvre plus une année pleine, le choix se fait entre EI, EURL et SASU.
const TJM = 500;
const FRAIS = 0.08;
const JOURS = [160, 180, 200, 220];
const sim = (j: number) => comparer({ ca: TJM * j, charges: 0, activite: 'bnc', fraisPortage: FRAIS });
const S = Object.fromEntries(JOURS.map((j) => [j, sim(j)])) as Record<number, ReturnType<typeof comparer>>;
const ca = (j: number) => TJM * j;
const jPlafond = Math.floor(P.micro.plafonds.services / TJM);
const auPlafond = sim(jPlafond);
const d = S[200];
const gainAbattement = d.ei.impotRevenu - d.eurl.impotRevenu;

export default defineGuide({
  id: 'tjm-500',
  group: 'freelance',
  order: 90,
  mini: 'tjmPalier',
  miniDefaults: { tjm: 500 },
  miniHref: 'tjm-freelance',
  related: ['tjm-400', 'tjm-600', 'tjm-freelance', 'comparateur-statuts', 'eurl-ou-sasu', 'entrepreneur-individuel'],
  sources: ['spPlafonds', 'urssafTauxAC', 'urssafTauxSalarie', 'spIs', 'spDividendes', 'spFraisPro'],
  fr: {
    slug: 'tjm-500',
    nav: 'TJM 500 €',
    card: 'La micro ne tient plus une année pleine : EI, EURL ou SASU, chiffres à l’appui.',
    title: 'TJM 500 € en 2026 : EI, EURL ou SASU après 167 jours',
    description: 'TJM 500 € en 2026 : au-delà de 167 jours, la micro-entreprise dépasse 83 600 €. EI, EURL ou SASU : net mensuel comparé sur 160 à 220 jours, impôt compris.',
    h1: 'TJM de 500 € : quand la micro ne suffit plus, quelle société ?',
    intro: 'À ce taux, une année pleine sort du plafond de la micro-entreprise ; reste à choisir entre l’entreprise individuelle au réel, l’EURL et la SASU.',
    resume: `À ${FR.eur(TJM)} par jour, la micro-entreprise ne tient plus une année de travail à plein temps : ${FR.num(jPlafond)} jours facturés suffisent à atteindre ${FR.eur(ca(jPlafond))}, juste sous le plafond de ${FR.eur(P.micro.plafonds.services)}, et le ${FR.num(jPlafond + 1)}e le dépasse. Au-delà, le choix se joue entre trois cadres au réel. Sur ${FR.num(200)} jours, soit ${FR.eur(ca(200))} de chiffre d’affaires, le moteur donne ${FR.eur(d.eurl.netMensuel)} par mois en EURL avec tout le bénéfice versé en rémunération, ${FR.eur(d.sasu.netMensuel)} en SASU avec ${FR.pct(d.sasu.partRemuneration ?? 0, 0)} en salaire et le reste en dividendes, et ${FR.eur(d.ei.netMensuel)} en entreprise individuelle au réel. Les trois restent à moins de ${FR.eur(d.eurl.netMensuel - d.ei.netMensuel + 1)} par mois l’un de l’autre, pour une personne seule, sans frais ni autre revenu. L’écart vient surtout de l’impôt sur le revenu, pas des cotisations, identiques en EI et en EURL. Rester en micro reste possible en limitant l’année à ${FR.num(jPlafond)} jours : ${FR.eur(auPlafond.micro.netMensuel)} par mois. Ce sont des estimations, à confronter à votre situation.`,
    faqs: [
      { q: 'À 500 € par jour, la micro-entreprise est-elle encore possible ?', a: `Oui jusqu’à ${FR.num(jPlafond)} jours facturés dans l’année, soit ${FR.eur(ca(jPlafond))}, sous le plafond de ${FR.eur(P.micro.plafonds.services)} fixé pour 2026 par service-public. Au-delà, une première année de dépassement est tolérée, mais deux années consécutives font sortir du régime au 1er janvier suivant. Pour un freelance qui facture ${FR.num(180)} jours ou plus chaque année, la micro n’est donc qu’une solution de transition.` },
      { q: 'EURL ou SASU avec un TJM de 500 € : laquelle laisse le plus ?', a: `L’EURL, de peu. Sur ${FR.num(200)} jours, elle laisse ${FR.eur(d.eurl.netMensuel)} par mois contre ${FR.eur(d.sasu.netMensuel)} en SASU, soit ${FR.eur(d.eurl.netMensuel - d.sasu.netMensuel)} d’écart, après cotisations, impôt sur les sociétés, prélèvement forfaitaire et impôt sur le revenu. Le calcul suppose une personne seule, aucun frais, et tout le bénéfice distribué dans l’année, avec les taux 2026 de l’Urssaf et de service-public.` },
      { q: 'Pourquoi l’EURL bat-elle l’entreprise individuelle à 500 € par jour ?', a: `Les cotisations sont les mêmes, ${FR.eur(d.eurl.cotisations)} sur ${FR.num(200)} jours, car le gérant majoritaire relève du même barème que l’entrepreneur individuel. La différence tient à l’impôt : la rémunération du gérant est imposée comme un salaire, après la déduction forfaitaire de ${FR.pct(P.ir.abattement_salaires.taux, 0)}, ce qui allège l’impôt de ${FR.eur(gainAbattement)} par an dans ce calcul. Le bénéfice d’une EI n’a pas cette déduction.` },
      { q: 'Quel salaire se verser en SASU avec un TJM de 500 € ?', a: `Le moteur trouve le meilleur net en consacrant ${FR.pct(d.sasu.partRemuneration ?? 0, 0)} du bénéfice à la rémunération sur ${FR.num(200)} jours, soit ${FR.eur(d.sasu.remunerationNette)} de salaire net sur l’année. Le reste est soumis à l’impôt sur les sociétés, ${FR.eur(d.sasu.impotSocietes)}, puis distribué en dividendes au prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)}. Un salaire plus élevé coûte davantage en cotisations du régime général qu’il ne rapporte.` },
      { q: 'Vaut-il mieux plafonner ses jours à 500 € pour rester en micro ?', a: `C’est un choix de rythme. Limiter l’année à ${FR.num(jPlafond)} jours en micro laisse ${FR.eur(auPlafond.micro.netMensuel)} par mois ; facturer ${FR.num(200)} jours en EURL en laisse ${FR.eur(d.eurl.netMensuel)}. Les ${FR.num(200 - jPlafond)} jours de travail en plus rapportent donc ${FR.eur(d.eurl.netMensuel - auPlafond.micro.netMensuel)} par mois, avec une comptabilité de société en prime. Personne seule, sans frais, selon les taux 2026.` },
    ],
    body: (h) => `
<h2>${h.num(jPlafond)} jours : la micro ne couvre plus une année pleine</h2>
<p>Le TJM de ${h.eur(TJM)} est le premier palier où la micro-entreprise devient une solution à temps partiel. Le plafond de ${h.eur(P.micro.plafonds.services)} (${h.src('spPlafonds', 'service-public, fiche F32353')}) correspond à ${h.num(jPlafond)} jours facturés, et un freelance en mission continue en facture davantage. La tolérance d’une année de dépassement repousse l’échéance sans la supprimer. Le vrai sujet de ce palier n’est donc plus « micro ou pas », mais le choix du cadre au réel : l’entreprise individuelle, où le bénéfice est directement votre revenu ; l’EURL, société dont vous êtes gérant majoritaire et cotisez comme indépendant ; la SASU, dont vous êtes président assimilé salarié. Les trois aboutissent à des nets proches, et c’est justement ce qui rend le choix délicat : quelques dizaines d’euros par mois séparent les options, alors que les obligations comptables, la protection sociale et la souplesse de rémunération diffèrent nettement. Le tableau suivant donne la mesure, et les paragraphes d’après expliquent d’où viennent les écarts.</p>

<h2>Le classement des trois cadres au réel</h2>
${h.table(['Statut', ...JOURS.map((j) => `${h.num(j)} jours`)], [
  ['Micro libérale', ...JOURS.map((j) => (S[j].micro.possible ? h.eur(S[j].micro.netMensuel) : 'plafond dépassé'))],
  ['EI au réel', ...JOURS.map((j) => h.eur(S[j].ei.netMensuel))],
  ['EURL à l’IS', ...JOURS.map((j) => h.eur(S[j].eurl.netMensuel))],
  ['SASU', ...JOURS.map((j) => h.eur(S[j].sasu.netMensuel))],
  ['Portage salarial', ...JOURS.map((j) => h.eur(S[j].portage.netMensuel))],
  ['Part du bénéfice en salaire (SASU)', ...JOURS.map((j) => h.pct(S[j].sasu.partRemuneration ?? 0, 0))],
], `Net mensuel par statut à ${h.eur(TJM)} par jour, personne seule, sans frais, tout le bénéfice distribué ; portage avec ${h.pct(FRAIS, 0)} de frais de gestion`, ['l', 'r', 'r', 'r', 'r'])}
<p>L’EURL arrive en tête dès que la micro décroche, suivie de près par la SASU puis par l’EI. Le portage salarial reste loin derrière, à ${h.eur(d.eurl.netMensuel - d.portage.netMensuel)} sous l’EURL sur ${h.num(200)} jours. Pour d’autres hypothèses, frais ou foyer, le ${h.a('comparateur-statuts', 'comparateur de statuts')} refait le calcul.</p>

<h2>EURL contre entreprise individuelle : une affaire d’impôt</h2>
<p>Le gérant majoritaire d’une EURL cotise au même barème que l’entrepreneur individuel (${h.src('urssafTauxAC', 'Urssaf, barème 2026 des indépendants')}) : sur ${h.num(200)} jours, ${h.eur(d.eurl.cotisations)} dans les deux cas. Quand toute la marge est versée en rémunération, l’EURL ne paie pas d’impôt sur les sociétés. La différence se fait à la déclaration de revenus, où la rémunération du gérant bénéficie de la déduction forfaitaire de ${h.pct(P.ir.abattement_salaires.taux, 0)} (${h.src('spFraisPro', 'service-public, fiche F1989')}) : ${h.eur(gainAbattement)} d’impôt en moins sur l’année. L’${h.a('entrepreneur-individuel', 'entrepreneur individuel')} garde en contrepartie une gestion plus légère.</p>

<h2>La SASU : moins de cotisations, plus d’impôts de société</h2>
<p>En SASU, le moteur verse un salaire modéré, ${h.eur(d.sasu.remunerationNette)} net sur l’année à ${h.num(200)} jours, car chaque euro de salaire supporte les cotisations du ${h.src('urssafTauxSalarie', 'régime général')}, sans assurance chômage. Le reste du bénéfice paie ${h.eur(d.sasu.impotSocietes)} d’${h.src('spIs', 'impôt sur les sociétés')}, puis ${h.eur(d.sasu.prelevementsDividendes)} de ${h.src('spDividendes', 'prélèvement forfaitaire')} une fois distribué. Le total des cotisations est bien plus bas qu’en EURL, mais l’impôt pris à la société et aux dividendes compense presque tout. La page ${h.a('eurl-ou-sasu', 'EURL ou SASU')} détaille les autres critères.</p>

<h2>Limiter ses jours pour rester en micro</h2>
<p>Certains freelances choisissent de s’arrêter à ${h.num(jPlafond)} jours pour garder la micro. Ce rythme laisse ${h.eur(auPlafond.micro.netMensuel)} par mois, quand ${h.num(200)} jours en EURL en laissent ${h.eur(d.eurl.netMensuel)}. Le choix dépend de la valeur que vous donnez à ces jours libres. À ${h.a('tjm-400', '400 €')}, la micro tenait encore jusqu’à deux cents jours ; à ${h.a('tjm-600', '600 €')}, la question devient le partage entre salaire et dividendes. Le ${h.a('tjm-freelance', 'simulateur TJM')} teste vos propres chiffres. Ces montants sont des estimations, pas un conseil personnalisé.</p>`,
  },
  en: {
    slug: 'day-rate-500',
    nav: 'Day rate €500',
    card: 'Micro no longer covers a full year: sole trader, EURL or SASU, with figures.',
    title: 'Day rate €500 in 2026: EI, EURL or SASU after 167 days',
    description: 'Day rate €500 in 2026: past 167 billed days a micro-enterprise goes over €83,600. Sole trader, EURL or SASU: monthly take-home compared on 160 to 220 days.',
    h1: 'A €500 day rate: when micro is not enough, which company?',
    intro: 'At this rate a full year breaks the micro-enterprise ceiling; the choice is then between a sole trader on real profit, an EURL and a SASU.',
    resume: `At ${EN.eur(TJM)} a day, the micro-enterprise (France’s simplified self-employed scheme) no longer covers a full working year: ${EN.num(jPlafond)} billed days bring you to ${EN.eur(ca(jPlafond))}, just under the ${EN.eur(P.micro.plafonds.services)} ceiling, and day ${EN.num(jPlafond + 1)} takes you over. Beyond that, the choice is between three set-ups taxed on real profit. On ${EN.num(200)} days, or ${EN.eur(ca(200))} of turnover, the engine gives ${EN.eur(d.eurl.netMensuel)} a month in an EURL (single-member limited company) paying all profit as the manager’s pay, ${EN.eur(d.sasu.netMensuel)} in a SASU (single-shareholder simplified company) with ${EN.pct(d.sasu.partRemuneration ?? 0, 0)} as salary and the rest as dividends, and ${EN.eur(d.ei.netMensuel)} as a sole trader (EI, entreprise individuelle). All three are within ${EN.eur(d.eurl.netMensuel - d.ei.netMensuel + 1)} a month of each other, for a single person with no expenses or other income. The gap comes mostly from income tax, not contributions, which are identical for EI and EURL. Staying micro is still possible by capping the year at ${EN.num(jPlafond)} days: ${EN.eur(auPlafond.micro.netMensuel)} a month. These are estimates to test against your own situation.`,
    faqs: [
      { q: 'Is the micro-enterprise still possible at €500 a day?', a: `Yes, up to ${EN.num(jPlafond)} billed days a year, or ${EN.eur(ca(jPlafond))}, under the ${EN.eur(P.micro.plafonds.services)} ceiling set for 2026 per service-public. Above it, one year over is tolerated, but two consecutive years take you out of the scheme on the following 1 January. For a freelancer billing ${EN.num(180)} days or more every year, micro is only a stepping stone.` },
      { q: 'EURL or SASU on a €500 day rate: which leaves more?', a: `The EURL, narrowly. On ${EN.num(200)} days it leaves ${EN.eur(d.eurl.netMensuel)} a month against ${EN.eur(d.sasu.netMensuel)} in a SASU, a gap of ${EN.eur(d.eurl.netMensuel - d.sasu.netMensuel)}, after contributions, corporate tax, dividend flat tax and income tax. The estimate assumes a single person, no expenses and all profit paid out within the year, using the 2026 Urssaf and service-public rates.` },
      { q: 'Why does an EURL beat a sole trader at €500 a day?', a: `Contributions are the same, ${EN.eur(d.eurl.cotisations)} on ${EN.num(200)} days, because a majority manager is on the same self-employed scale as a sole trader. The difference is income tax: the manager’s pay is taxed like a salary, after the ${EN.pct(P.ir.abattement_salaires.taux, 0)} flat deduction for work expenses, which cuts tax by ${EN.eur(gainAbattement)} a year here. A sole trader’s profit gets no such deduction.` },
      { q: 'What salary should I pay myself in a SASU at €500 a day?', a: `The engine finds the best take-home by putting ${EN.pct(d.sasu.partRemuneration ?? 0, 0)} of profit into pay on ${EN.num(200)} days, which is ${EN.eur(d.sasu.remunerationNette)} of net salary over the year. The rest bears ${EN.eur(d.sasu.impotSocietes)} of corporate tax and is paid out as dividends under the ${EN.pct(P.dividendes.pfu)} flat tax. A higher salary costs more in general-scheme contributions than it brings in.` },
      { q: 'Should I cap my days at €500 to stay micro?', a: `It is a choice of pace. Capping the year at ${EN.num(jPlafond)} days as a micro-entrepreneur leaves ${EN.eur(auPlafond.micro.netMensuel)} a month; billing ${EN.num(200)} days through an EURL leaves ${EN.eur(d.eurl.netMensuel)}. The extra ${EN.num(200 - jPlafond)} days of work therefore bring ${EN.eur(d.eurl.netMensuel - auPlafond.micro.netMensuel)} a month, plus company bookkeeping. Single person, no expenses, 2026 rates.` },
    ],
    body: (h) => `
<h2>${h.num(jPlafond)} days: micro no longer covers a full year</h2>
<p>${h.eur(TJM)} is the first day rate (TJM) at which the micro-enterprise becomes a part-time option. The ${h.eur(P.micro.plafonds.services)} ceiling (${h.src('spPlafonds', 'service-public, sheet F32353')}) equals ${h.num(jPlafond)} billed days, and a freelancer on a continuous assignment bills more. The one-year tolerance delays the deadline without removing it. So the real question at this level is no longer micro or not, but which real-profit set-up: the sole trader (EI), whose profit is directly your income; the EURL, a company you run as majority manager while paying self-employed contributions; or the SASU, where you are a president treated like an employee for social security. All three end up close, and that is what makes the choice tricky: a few tens of euros a month separate them, while bookkeeping, social cover and flexibility of pay differ a lot. The table gives the scale, and the sections after it explain where the gaps come from.</p>

<h2>How the three real-profit set-ups rank</h2>
${h.table(['Legal form', ...JOURS.map((j) => `${h.num(j)} days`)], [
  ['Micro (BNC)', ...JOURS.map((j) => (S[j].micro.possible ? h.eur(S[j].micro.netMensuel) : 'over ceiling'))],
  ['EI, real profit', ...JOURS.map((j) => h.eur(S[j].ei.netMensuel))],
  ['EURL, corporate tax', ...JOURS.map((j) => h.eur(S[j].eurl.netMensuel))],
  ['SASU', ...JOURS.map((j) => h.eur(S[j].sasu.netMensuel))],
  ['Umbrella employment', ...JOURS.map((j) => h.eur(S[j].portage.netMensuel))],
  ['Share of profit as salary (SASU)', ...JOURS.map((j) => h.pct(S[j].sasu.partRemuneration ?? 0, 0))],
], `Monthly take-home by legal form at ${h.eur(TJM)} a day, single, no expenses, all profit paid out; umbrella with a ${h.pct(FRAIS, 0)} fee`, ['l', 'r', 'r', 'r', 'r'])}
<p>The EURL leads as soon as micro drops out, closely followed by the SASU and then the EI. Umbrella employment stays well behind, ${h.eur(d.eurl.netMensuel - d.portage.netMensuel)} under the EURL on ${h.num(200)} days. For other assumptions, expenses or household, the ${h.a('comparateur-statuts', 'legal form comparison')} reruns the numbers.</p>

<h2>EURL against sole trader: a matter of income tax</h2>
<p>An EURL’s majority manager pays the same scale as a sole trader (${h.src('urssafTauxAC', 'Urssaf, 2026 self-employed scale')}): on ${h.num(200)} days, ${h.eur(d.eurl.cotisations)} either way. When the whole margin is paid as pay, the EURL owes no corporate tax. The difference shows on your income tax return, where the manager’s pay gets the ${h.pct(P.ir.abattement_salaires.taux, 0)} flat deduction (${h.src('spFraisPro', 'service-public, sheet F1989')}): ${h.eur(gainAbattement)} less tax over the year. The ${h.a('entrepreneur-individuel', 'sole trader')} keeps lighter paperwork in return.</p>

<h2>The SASU: fewer contributions, more company taxes</h2>
<p>In a SASU the engine pays a moderate salary, ${h.eur(d.sasu.remunerationNette)} net over the year on ${h.num(200)} days, because each euro of salary carries ${h.src('urssafTauxSalarie', 'general-scheme')} contributions, with no unemployment cover for a company president. The rest of the profit bears ${h.eur(d.sasu.impotSocietes)} of ${h.src('spIs', 'corporate tax')}, then ${h.eur(d.sasu.prelevementsDividendes)} of ${h.src('spDividendes', 'dividend flat tax')} once paid out. Total contributions are far lower than in the EURL, but tax taken at company and dividend level cancels almost all of it. The ${h.a('eurl-ou-sasu', 'EURL or SASU')} page covers the other criteria.</p>

<h2>Capping your days to stay micro</h2>
<p>Some freelancers stop at ${h.num(jPlafond)} days to keep micro. That pace leaves ${h.eur(auPlafond.micro.netMensuel)} a month, while ${h.num(200)} days in an EURL leave ${h.eur(d.eurl.netMensuel)}. It depends on what those free days are worth to you. At ${h.a('tjm-400', '€400')} micro still lasted up to two hundred days; at ${h.a('tjm-600', '€600')} the question becomes the split between salary and dividends. The ${h.a('tjm-freelance', 'day rate calculator')} tests your own figures. These are estimates, not personal advice.</p>`,
  },
});
