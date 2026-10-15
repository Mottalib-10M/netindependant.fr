import { defineGuide } from '../../lib/guide-types';
import { statsVille, tableauTranches } from '../../lib/cfe-ville';
import { P, FR, EN } from '../../lib/fmt';

const s = statsVille('59350');
const [t1, t2, t3, t4] = s.tranches;

export default defineGuide({
  id: 'cfe-lille',
  group: 'micro',
  order: 66,
  tool: 'cfe',
  miniHref: 'cfe-auto-entrepreneur',
  toolPreset: { dep: '59', com: '59350', ca: 30000 },
  related: ['cfe-auto-entrepreneur', 'cfe-lyon', 'cfe-bordeaux', 'auto-entrepreneur-vente', 'micro-entreprise'],
  sources: ['spCfe', 'rei2025'],
  fr: {
    slug: 'cfe-lille',
    nav: 'CFE à Lille',
    card: 'Une base plafonnée à 1 626 € dès la troisième tranche.',
    title: 'CFE Lille 2026 : montant pour un auto-entrepreneur',
    description: 'CFE à Lille en 2026 : taux global de 34,63 %, base minimum de 581 € à 1 626 €, plafonnée dès 32 601 € de chiffre d’affaires, et CFE annuelle d’un indépendant.',
    h1: 'CFE à Lille : une base minimum qui cesse de monter',
    intro: 'À Lille, la base minimum de CFE est la même pour toutes les tranches à partir de 32 601 € de chiffre d’affaires.',
    resume: `À Lille, la CFE d’un micro-entrepreneur sans local se calcule avec un taux global de ${FR.pct(s.t, 2)}, dont ${FR.pct(s.parts.P32, 2)} votés par l’intercommunalité, plus une taxe spéciale d’équipement et la taxe Gemapi. Particularité lilloise : la base minimum monte de ${FR.eur(s.b[0] ?? 0)} à ${FR.eur(s.b[1] ?? 0)} sur les deux premières tranches, puis reste fixée à ${FR.eur(s.b[2] ?? 0)} pour toutes les tranches suivantes, de ${FR.eur(P.cfe.tranches_ca[1] + 1)} jusqu’au-delà de ${FR.eur(P.cfe.tranches_ca[4])} de chiffre d’affaires. La CFE annuelle, à partir de la troisième année, vaut donc environ ${FR.eur(t1.total)}, ${FR.eur(t2.total)}, puis ${FR.eur(t3.total)} quel que soit le chiffre d’affaires au-delà de ${FR.eur(P.cfe.tranches_ca[1])}. Pour un petit chiffre d’affaires, Lille est parmi les communes chères du Nord (${FR.num(t2.rang)}e sur ${FR.num(t2.nb)} dans la deuxième tranche) ; pour une activité de vente plus importante, elle devient plus clémente (${FR.num(t4.rang)}e dans la quatrième). Chiffres du fichier REI 2025 de la DGFiP.`,
    faqs: [
      { q: 'Ma CFE à Lille augmente-t-elle si mon chiffre d’affaires dépasse 100 000 € ?', a: `Non, pas la base minimum : elle reste à ${FR.eur(s.b[3] ?? 0)} de ${FR.eur(P.cfe.tranches_ca[1] + 1)} à plus de ${FR.eur(P.cfe.tranches_ca[4])} de chiffre d’affaires, soit une CFE d’environ ${FR.eur(t4.total)} par an. C’est rare : la plupart des grandes villes votent une base plus élevée pour chaque tranche.` },
      { q: 'Quelle commune du Nord a la CFE minimum la plus basse ?', a: `Pour un chiffre d’affaires de ${FR.eur(P.cfe.tranches_ca[0] + 1)} à ${FR.eur(P.cfe.tranches_ca[1])}, le fichier REI 2025 donne ${t2.moins.n}, avec environ ${FR.eur(t2.moins.total)} par an, contre ${FR.eur(t2.total)} à Lille. Le département compte ${FR.num(s.nbCommunes)} communes, aux bases et taux très différents.` },
      { q: 'Un vendeur en ligne lillois paie-t-il plus de CFE qu’un consultant ?', a: `Pas à chiffre d’affaires égal : la CFE ne dépend que de la tranche de chiffre d’affaires et de la commune, pas de l’activité. Mais un vendeur atteint plus vite les tranches hautes, et à Lille la base plafonnée à ${FR.eur(s.b[2] ?? 0)} lui est favorable.` },
    ],
    body: (h) => `
<h2>La base minimum lilloise</h2>
<p>Les bases votées s’arrêtent de croître à la troisième tranche (${h.src('rei2025', 'fichier REI 2025')}) : la colonne de rang montre comment Lille glisse dans le classement départemental quand le chiffre d’affaires augmente.</p>
${tableauTranches(h, s)}
<h2>Le taux de ${h.pct(s.t, 2)}</h2>
<p>L’intercommunalité vote ${h.pct(s.parts.P32, 2)} ; la taxe spéciale d’équipement ajoute ${h.pct(s.parts.P52, 3)} et la Gemapi ${h.pct(s.parts.P52gGEMAPI, 3)}. Taxe pour les chambres de commerce et frais en sus (${h.src('spCfe', 'service-public')}).</p>
<h2>Comparer</h2>
<p>À chiffre d’affaires modeste, ${h.a('cfe-paris', 'Paris')} reste le moins cher ; pour un commerce plus important, Lille rivalise avec ${h.a('cfe-lyon', 'Lyon')} et ${h.a('cfe-bordeaux', 'Bordeaux')}. Le simulateur ci-dessous compare les six villes.</p>
<!--mini:cfeVille-->`,
  },
  en: {
    slug: 'cfe-lille',
    nav: 'CFE in Lille',
    card: 'A base capped at €1,626 from the third band.',
    title: 'CFE Lille 2026: what a micro-entrepreneur pays a year',
    description: 'CFE in Lille in 2026: a 34.63% overall rate, minimum bases from €581 to €1,626, capped from €32,601 of turnover, and the yearly CFE of a micro-entrepreneur.',
    h1: 'CFE in Lille: a minimum base that stops rising',
    intro: 'In Lille the minimum CFE base is the same for every band from €32,601 of turnover upwards.',
    resume: `In Lille, the CFE local business tax of a micro-entrepreneur without premises uses an overall rate of ${EN.pct(s.t, 2)}, of which ${EN.pct(s.parts.P32, 2)} is voted by the intercommunal authority, plus a special equipment tax and the Gemapi flood-prevention tax. The Lille twist: the minimum base rises from ${EN.eur(s.b[0] ?? 0)} to ${EN.eur(s.b[1] ?? 0)} over the first two bands, then stays at ${EN.eur(s.b[2] ?? 0)} for every band after that, from ${EN.eur(P.cfe.tranches_ca[1] + 1)} to beyond ${EN.eur(P.cfe.tranches_ca[4])} of turnover. From the third year of trading, the CFE is therefore about ${EN.eur(t1.total)}, ${EN.eur(t2.total)}, then ${EN.eur(t3.total)} whatever the turnover above ${EN.eur(P.cfe.tranches_ca[1])}. On a small turnover, Lille is among the dearer communes of the Nord (${EN.num(t2.rang)} out of ${EN.num(t2.nb)} in the second band); for a larger sales business it becomes more lenient (${EN.num(t4.rang)} in the fourth). Figures from the DGFiP’s 2025 REI file.`,
    faqs: [
      { q: 'Will my Lille CFE rise if turnover passes €100,000?', a: `No, not through the minimum base: it stays at ${EN.eur(s.b[3] ?? 0)} from ${EN.eur(P.cfe.tranches_ca[1] + 1)} to over ${EN.eur(P.cfe.tranches_ca[4])} of turnover, a CFE of about ${EN.eur(t4.total)} a year. That is unusual: most large French cities vote a higher base for each band, so their CFE keeps climbing.` },
      { q: 'Which commune in the Nord has the lowest minimum CFE?', a: `For turnover of ${EN.eur(P.cfe.tranches_ca[0] + 1)} to ${EN.eur(P.cfe.tranches_ca[1])}, the 2025 REI file gives ${t2.moins.n}, at about ${EN.eur(t2.moins.total)} a year, against ${EN.eur(t2.total)} in Lille. The Nord département has ${EN.num(s.nbCommunes)} communes, each with its own bases and rates, so moving a few kilometres can change the bill noticeably.` },
      { q: 'Does an online seller in Lille pay more CFE than a consultant?', a: `Not at equal turnover: the CFE depends only on the turnover band and the commune, not on the activity. But a seller reaches the higher bands sooner, and in Lille the base capped at ${EN.eur(s.b[2] ?? 0)} works clearly in their favour.` },
    ],
    body: (h) => `
<h2>Lille’s minimum base</h2>
<p>The minimum bases voted by Lille stop growing at the third band (${h.src('rei2025', 'REI 2025 file')}): the rank column shows how Lille slides down the département ranking as turnover grows.</p>
${tableauTranches(h, s)}
<h2>The ${h.pct(s.t, 2)} rate</h2>
<p>The intercommunal authority votes ${h.pct(s.parts.P32, 2)}; the special equipment tax adds ${h.pct(s.parts.P52, 3)} and Gemapi ${h.pct(s.parts.P52gGEMAPI, 3)}. Chamber of commerce surcharge and fees on top (${h.src('spCfe', 'service-public')}).</p>
<h2>Compare</h2>
<p>On a modest turnover, ${h.a('cfe-paris', 'Paris')} remains the cheapest; for a larger shop, Lille competes with ${h.a('cfe-lyon', 'Lyon')} and ${h.a('cfe-bordeaux', 'Bordeaux')}. The calculator below compares the six cities. If you plan to sell goods from Lille, remember that the micro-enterprise ceiling for sales is higher than for services, so the capped base can matter for longer before you outgrow the scheme.</p>
<!--mini:cfeVille-->`,
  },
});
