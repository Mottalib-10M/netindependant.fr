import { defineGuide } from '../../lib/guide-types';
import { comparer } from '../../lib/engine/statuts';
import { P, FR, EN } from '../../lib/fmt';

const c50 = comparer({ ca: 50000, charges: 3000, activite: 'bnc' });
const c90 = comparer({ ca: 90000, charges: 6000, activite: 'bnc' });
const c150 = comparer({ ca: 150000, charges: 10000, activite: 'bnc' });

export default defineGuide({
  id: 'comparateur-statuts',
  group: 'statuts',
  order: 10,
  tool: 'statuts',
  related: ['eurl-ou-sasu', 'micro-ou-sasu', 'entrepreneur-individuel', 'salaire-ou-dividendes', 'statut-freelance'],
  sources: ['urssafTauxAC', 'urssafReforme', 'urssafTauxSalarie', 'spIs', 'spDividendes', 'spBareme'],
  fr: {
    slug: 'comparateur-statuts-juridiques',
    nav: 'Comparateur de statuts',
    card: 'Micro, EI, EURL, SASU et portage pour le même chiffre d’affaires.',
    title: 'Statut juridique 2026 : comparateur micro, EURL, SASU',
    description: 'Comparateur de statut juridique 2026 : net en poche en micro-entreprise, EI, EURL, SASU et portage pour votre chiffre d’affaires, sans e-mail et sans compte.',
    h1: 'Quel statut juridique vous laisse le plus en 2026 ?',
    intro: 'Un chiffre d’affaires, vos frais, votre foyer : les cinq statuts sont calculés côte à côte, impôts compris.',
    resume: `Le comparateur calcule, pour le même chiffre d’affaires, ce qui reste en poche dans cinq cadres : micro-entreprise (cotisations sur le chiffre d’affaires, ${FR.pct(P.micro.taux.bnc)} en libéral), entreprise individuelle au réel (cotisations de travailleur indépendant sur le bénéfice, barème 2026 réformé avec un abattement de ${FR.pct(P.tns.abattement, 0)}), EURL à l’impôt sur les sociétés avec un gérant travailleur indépendant, SASU avec un président assimilé salarié, et portage salarial. Pour l’EURL et la SASU, il cherche le partage entre rémunération et dividendes qui laisse le plus, avec l’impôt sur les sociétés à ${FR.pct(P.is.taux_reduit, 0)} jusqu’à ${FR.eur(P.is.seuil_reduit)} puis ${FR.pct(P.is.taux_normal, 0)}, et des dividendes au prélèvement forfaitaire de ${FR.pct(P.dividendes.pfu)}. Exemple pour un consultant à ${FR.eur(90000)} de chiffre d’affaires et ${FR.eur(6000)} de frais : ${FR.eur(c90.micro.possible ? c90.micro.netMensuel : 0)} par mois en micro si le plafond le permettait, ${FR.eur(c90.eurl.netMensuel)} en EURL, ${FR.eur(c90.sasu.netMensuel)} en SASU. Les frais de comptabilité d’une société sont à saisir à part.`,
    faqs: [
      { q: 'Pourquoi la SASU sort-elle souvent avec une rémunération faible ?', a: `Parce que le salaire d’un président coûte cher en cotisations, alors que les dividendes ne supportent que l’impôt sur les sociétés et le prélèvement de ${FR.pct(P.dividendes.pfu)}. Le moteur maximise le net immédiat ; il ne valorise pas la retraite, les indemnités journalières ni la prévoyance qu’ouvre un salaire. Un président sans salaire ne valide aucun trimestre de retraite.` },
      { q: 'Le comparateur tient-il compte des frais d’expert-comptable ?', a: 'Seulement si vous les saisissez dans les options, sous « frais propres à une société ». Ils ne pèsent alors que sur l’EURL et la SASU, puisque la micro-entreprise n’impose pas de comptabilité complète. Les tarifs variant fortement d’un cabinet à l’autre, le simulateur ne met aucun montant par défaut.' },
      { q: 'Quel net pour 150 000 € de chiffre d’affaires ?', a: `Avec ${FR.eur(10000)} de frais, en libéral, pour une personne seule : ${FR.eur(c150.ei.netMensuel)} par mois en entreprise individuelle au réel, ${FR.eur(c150.eurl.netMensuel)} en EURL et ${FR.eur(c150.sasu.netMensuel)} en SASU. La micro-entreprise n’est plus possible au-delà de ${FR.eur(P.micro.plafonds.services)} de chiffre d’affaires en services, deux années de suite.` },
      { q: 'Et pour un petit chiffre d’affaires de 50 000 € ?', a: `Avec ${FR.eur(3000)} de frais : ${FR.eur(c50.micro.netMensuel)} par mois en micro-entreprise, ${FR.eur(c50.ei.netMensuel)} en entreprise individuelle au réel, ${FR.eur(c50.eurl.netMensuel)} en EURL, ${FR.eur(c50.sasu.netMensuel)} en SASU et ${FR.eur(c50.portage.netMensuel)} en portage. À ce niveau, les frais de tenue d’une société suffisent souvent à faire basculer le choix.` },
    ],
    body: (h) => `
<h2>Ce que le comparateur calcule</h2>
<p>Pour chaque statut, le net en poche est ce qui arrive sur votre compte personnel après toutes les cotisations, l’impôt sur les sociétés, les prélèvements sur dividendes et l’impôt sur le revenu dû à l’activité. Le tableau donne aussi les cotisations et les impôts de chaque ligne, pour voir d’où vient l’écart. Les barèmes sont ceux de 2026 : ${h.src('urssafTauxAC', 'taux des indépendants')} après la réforme de l’assiette, ${h.src('urssafTauxSalarie', 'taux du régime général')} pour le président de SASU, ${h.src('spIs', 'impôt sur les sociétés')} et ${h.src('spDividendes', 'prélèvement forfaitaire unique')}.</p>
<h2>Les hypothèses à connaître</h2>
<p>En EURL et en SASU, tout le bénéfice qui reste après la rémunération et l’impôt sur les sociétés est distribué la même année. Le gérant d’EURL est majoritaire : la part de ses dividendes qui dépasse ${h.pct(P.dividendes.seuil_tns_capital, 0)} du capital supporte des cotisations, et le comparateur retient un capital de ${h.eur(1000)}. Le portage applique les frais de gestion que vous indiquez. Pour la micro-entreprise, l’activité choisie fixe le taux et l’abattement ; au-delà du plafond, la ligne est marquée comme impossible.</p>
<p>Les détails par statut se lisent sur ${h.a('sasu', 'la SASU')}, ${h.a('eurl', 'l’EURL')}, ${h.a('entrepreneur-individuel', 'l’entreprise individuelle')} et ${h.a('portage-salarial', 'le portage salarial')}. Pour un duel précis, voir ${h.a('eurl-ou-sasu', 'EURL ou SASU')} et ${h.a('micro-ou-sasu', 'micro-entreprise ou SASU')}.</p>
${h.table(['Chiffre d’affaires', 'Micro', 'EI au réel', 'EURL', 'SASU', 'Portage'], [[h.eur(50000), h.eur(c50.micro.netMensuel), h.eur(c50.ei.netMensuel), h.eur(c50.eurl.netMensuel), h.eur(c50.sasu.netMensuel), h.eur(c50.portage.netMensuel)], [h.eur(90000), c90.micro.possible ? h.eur(c90.micro.netMensuel) : 'plafond dépassé', h.eur(c90.ei.netMensuel), h.eur(c90.eurl.netMensuel), h.eur(c90.sasu.netMensuel), h.eur(c90.portage.netMensuel)]], `Net par mois, libéral, personne seule, frais de ${h.eur(3000)} et ${h.eur(6000)}`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<h2>Ce qu’il ne fait pas</h2>
<p>Il ne chiffre ni la valeur de la protection sociale (retraite, indemnités journalières, chômage en portage), ni la responsabilité sur vos biens, ni les frais de création d’une société. Il ne remplace pas l’avis d’un expert-comptable pour une situation précise. La ${h.a('method', 'méthode de calcul')} détaille chaque formule.</p>`,
  },
  en: {
    slug: 'compare-legal-forms',
    nav: 'Compare legal forms',
    card: 'Micro, EI, EURL, SASU and umbrella for the same turnover.',
    title: 'Legal forms France 2026: micro, EURL, SASU compared',
    description: 'Compare French business legal forms for 2026: take-home pay as a micro-enterprise, EI, EURL, SASU or under umbrella employment, no email, no account needed.',
    h1: 'Which French legal form leaves you the most in 2026?',
    intro: 'One turnover, your expenses, your household: all five options are worked out side by side, taxes included.',
    resume: `The comparison works out, for the same turnover, what you keep under five set-ups: micro-enterprise (contributions on turnover, ${EN.pct(P.micro.taux.bnc)} for freelance professions), sole trader on real profit (EI, self-employed contributions on profit under the reformed 2026 scale with a ${EN.pct(P.tns.abattement, 0)} allowance), EURL paying corporate tax with a self-employed manager, SASU with a president treated as an employee, and umbrella employment (portage salarial). For the EURL and SASU it searches for the salary and dividend split that leaves the most, with corporate tax at ${EN.pct(P.is.taux_reduit, 0)} up to ${EN.eur(P.is.seuil_reduit)} then ${EN.pct(P.is.taux_normal, 0)}, and dividends under the ${EN.pct(P.dividendes.pfu)} flat tax. Example for a consultant billing ${EN.eur(90000)} with ${EN.eur(6000)} of expenses: ${EN.eur(c90.eurl.netMensuel)} a month in an EURL and ${EN.eur(c90.sasu.netMensuel)} in a SASU, while the micro-enterprise is closed above its ${EN.eur(P.micro.plafonds.services)} ceiling. Company accounting fees are entered separately.`,
    faqs: [
      { q: 'Why does the SASU often come out with a low salary?', a: `Because a president’s salary carries heavy contributions, while dividends only bear corporate tax and the ${EN.pct(P.dividendes.pfu)} flat tax. The engine maximises take-home today; it puts no value on the pension, sick pay or cover that a salary brings. A president with no salary earns no French pension quarters at all.` },
      { q: 'Does the comparison include accountant fees?', a: 'Only if you enter them in the options, as company running costs. They then weigh only on the EURL and SASU, since a micro-enterprise does not need full accounts. Fees vary widely between firms, so the calculator does not assume any amount.' },
      { q: 'What do I keep on €150,000 of turnover?', a: `Assuming you are ${EN.eur(10000)} of expenses as a freelancer, single: ${EN.eur(c150.ei.netMensuel)} a month as a sole trader on real profit, ${EN.eur(c150.eurl.netMensuel)} in an EURL and ${EN.eur(c150.sasu.netMensuel)} in a SASU. The micro-enterprise is closed above ${EN.eur(P.micro.plafonds.services)} of service turnover two years running.` },
      { q: 'And on a smaller €50,000 turnover?', a: `Still single, with ${EN.eur(3000)} of expenses: ${EN.eur(c50.micro.netMensuel)} a month as a micro-enterprise, ${EN.eur(c50.ei.netMensuel)} as a sole trader on real profit, ${EN.eur(c50.eurl.netMensuel)} in an EURL, ${EN.eur(c50.sasu.netMensuel)} in a SASU and ${EN.eur(c50.portage.netMensuel)} under umbrella employment. At this level, company running costs often decide.` },
    ],
    body: (h) => `
<h2>What the comparison works out</h2>
<p>For each legal form, take-home pay is what reaches your personal account after all social contributions, corporate tax, dividend levies and the income tax caused by the business. The table also shows contributions and taxes for each line, so you can see where the gap comes from. Scales are the 2026 ones: ${h.src('urssafTauxAC', 'self-employed rates')} after the base reform, ${h.src('urssafTauxSalarie', 'general scheme rates')} for a SASU president, ${h.src('spIs', 'corporate tax')} and the ${h.src('spDividendes', 'flat tax on dividends')}.</p>
<h2>Assumptions to know</h2>
<p>In the EURL and SASU, all profit left after pay and corporate tax is paid out the same year. The EURL manager holds the majority: dividends above ${h.pct(P.dividendes.seuil_tns_capital, 0)} of share capital bear contributions, and the comparison assumes ${h.eur(1000)} of capital. Umbrella employment uses the management fee you enter. For the micro-enterprise, the activity you pick sets the rate and allowance; above the ceiling the line is marked as not possible.</p>
<p>Each legal form is explained on its own page: ${h.a('sasu', 'SASU')}, ${h.a('eurl', 'EURL')}, ${h.a('entrepreneur-individuel', 'sole trader (EI)')} and ${h.a('portage-salarial', 'umbrella employment')}. For a head-to-head, see ${h.a('eurl-ou-sasu', 'EURL or SASU')} and ${h.a('micro-ou-sasu', 'micro-enterprise or SASU')}.</p>
${h.table(['Turnover', 'Micro', 'EI', 'EURL', 'SASU', 'Umbrella'], [[h.eur(50000), h.eur(c50.micro.netMensuel), h.eur(c50.ei.netMensuel), h.eur(c50.eurl.netMensuel), h.eur(c50.sasu.netMensuel), h.eur(c50.portage.netMensuel)], [h.eur(90000), c90.micro.possible ? h.eur(c90.micro.netMensuel) : 'over ceiling', h.eur(c90.ei.netMensuel), h.eur(c90.eurl.netMensuel), h.eur(c90.sasu.netMensuel), h.eur(c90.portage.netMensuel)]], `Monthly take-home, freelance profession, single, expenses of ${h.eur(3000)} and ${h.eur(6000)}`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<h2>What it does not do</h2>
<p>It puts no value on social cover (pension, sick pay, unemployment rights under umbrella employment), on liability for your personal assets or on company set-up costs, and it does not replace an accountant’s advice for a specific case. Every formula is on ${h.a('method', 'how we calculate')}.</p>`,
  },
});
