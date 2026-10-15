import { defineGuide } from '../../lib/guide-types';
import { statsVille, tableauTranches } from '../../lib/cfe-ville';
import { P, FR, EN } from '../../lib/fmt';

const s = statsVille('13055');
const [t1, t2, t3, t4] = s.tranches;

export default defineGuide({
  id: 'cfe-marseille',
  group: 'micro',
  order: 63,
  tool: 'cfe',
  miniHref: 'cfe-auto-entrepreneur',
  toolPreset: { dep: '13', com: '13055', ca: 30000 },
  related: ['cfe-auto-entrepreneur', 'cfe-paris', 'cfe-toulouse', 'acre-auto-entrepreneur', 'charges-auto-entrepreneur'],
  sources: ['spCfe', 'rei2025'],
  fr: {
    slug: 'cfe-marseille',
    nav: 'CFE à Marseille',
    card: 'Taux de 34,27 % et bases parmi les plus hautes des Bouches-du-Rhône.',
    title: 'CFE Marseille 2026 : le montant pour un micro-entrepreneur',
    description: 'CFE à Marseille en 2026 : taux global de 34,27 %, base minimum de 585 € à 5 024 €, CFE annuelle selon le chiffre d’affaires et rang dans le département.',
    h1: 'CFE à Marseille : combien selon votre chiffre d’affaires',
    intro: 'Marseille combine un taux intercommunal élevé et des bases minimum parmi les plus hautes des Bouches-du-Rhône.',
    resume: `Un micro-entrepreneur domicilié à Marseille, sans local, paie sa CFE sur une base minimum votée pour sa tranche de chiffre d’affaires, multipliée par un taux global de ${FR.pct(s.t, 2)} : ${FR.pct(s.parts.P32, 2)} votés par l’intercommunalité, plus une taxe spéciale d’équipement et la taxe Gemapi. Avec un chiffre d’affaires de l’avant-dernière année compris entre ${FR.eur(P.cfe.tranches_ca[0] + 1)} et ${FR.eur(P.cfe.tranches_ca[1])}, la base est de ${FR.eur(s.b[1] ?? 0)} et la CFE d’environ ${FR.eur(t2.total)} par an, à partir de la troisième année ; entre ${FR.eur(P.cfe.tranches_ca[1] + 1)} et ${FR.eur(P.cfe.tranches_ca[2])}, elle monte à ${FR.eur(t3.total)}. Pour un petit chiffre d’affaires, jusqu’à ${FR.eur(P.cfe.tranches_ca[0])}, elle reste à ${FR.eur(t1.total)}. Dans les Bouches-du-Rhône, Marseille est ${FR.num(t2.rang)}e sur ${FR.num(t2.nb)} communes pour la deuxième tranche, de la moins chère à la plus chère : un écart réel avec des communes voisines comme Arles. Chiffres du fichier REI 2025 de la DGFiP.`,
    faqs: [
      { q: 'Pourquoi la CFE est-elle plus chère à Marseille qu’à Arles ?', a: `Pour la tranche de ${FR.eur(P.cfe.tranches_ca[0] + 1)} à ${FR.eur(P.cfe.tranches_ca[1])} de chiffre d’affaires, ${t2.moins.n} est la commune la moins chère du département selon le fichier REI 2025, avec environ ${FR.eur(t2.moins.total)} par an, contre ${FR.eur(t2.total)} à Marseille. Les deux dépendent de collectivités différentes, qui votent chacune leurs bases minimum et leur taux.` },
      { q: 'À partir de quel chiffre d’affaires la CFE marseillaise dépasse-t-elle 1 000 € ?', a: `Dans la quatrième tranche, de ${FR.eur(P.cfe.tranches_ca[2] + 1)} à ${FR.eur(P.cfe.tranches_ca[3])} de chiffre d’affaires, où la base minimum atteint ${FR.eur(s.b[3] ?? 0)} : la CFE y est d’environ ${FR.eur(t4.total)}. Ce niveau dépasse le plafond de la micro-entreprise pour les prestations de services, mais pas pour la vente de marchandises.` },
      { q: 'Un artisan marseillais paie-t-il la taxe pour la CCI ?', a: `Non, s’il est inscrit comme entreprise artisanale et non porté sur la liste électorale de la chambre de commerce : il échappe à la taxe additionnelle de ${FR.pct(P.cfe.taxe_additionnelle_cci, 2)} de la base. Sa CFE à Marseille baisse alors légèrement ; le simulateur en tient compte avec l’option « artisan ».` },
    ],
    body: (h) => `
<h2>Le barème de Marseille</h2>
<p>Les six bases minimum votées s’échelonnent de ${h.eur(s.b[0] ?? 0)} à ${h.eur(s.b[5] ?? 0)} (${h.src('rei2025', 'fichier REI 2025')}). La colonne de droite situe Marseille parmi les communes du département pour chaque tranche.</p>
${tableauTranches(h, s)}
<h2>La composition du taux</h2>
<p>Sur ${h.pct(s.t, 2)}, l’intercommunalité vote ${h.pct(s.parts.P32, 2)}, la taxe spéciale d’équipement pèse ${h.pct(s.parts.P52, 3)} et la taxe Gemapi ${h.pct(s.parts.P52gGEMAPI, 3)}. La commune ne lève pas de part propre. La taxe additionnelle pour les chambres de commerce et ${h.pct(P.cfe.frais_gestion, 0)} de frais complètent l’avis (${h.src('spCfe', 'service-public')}).</p>
<h2>Les années de démarrage</h2>
<p>Aucune CFE l’année de création, puis une base réduite de moitié : avec ${h.eur(25000)} de chiffre d’affaires, environ ${h.eur(t2.total / 2)} la deuxième année à Marseille. Pour comparer avec ${h.a('cfe-toulouse', 'Toulouse')} ou ${h.a('cfe-lyon', 'Lyon')}, utilisez le simulateur ci-dessous.</p>
<!--mini:cfeVille-->`,
  },
  en: {
    slug: 'cfe-marseille',
    nav: 'CFE in Marseille',
    card: 'A 34.27% rate and some of the highest bases in its département.',
    title: 'CFE Marseille 2026: what a micro-entrepreneur pays',
    description: 'CFE in Marseille for 2026: a 34.27% overall rate, minimum bases from €585 to €5,024, the yearly CFE by turnover and Marseille’s rank in its département.',
    h1: 'CFE in Marseille: how much for your turnover',
    intro: 'Marseille combines a high intercommunal rate with some of the highest minimum bases in the Bouches-du-Rhône.',
    resume: `A micro-entrepreneur registered in Marseille without business premises pays the CFE local business tax on a minimum base set for their turnover band, multiplied by an overall rate of ${EN.pct(s.t, 2)}: ${EN.pct(s.parts.P32, 2)} voted by the intercommunal authority, plus a special equipment tax and the Gemapi flood-prevention tax. With turnover two years earlier between ${EN.eur(P.cfe.tranches_ca[0] + 1)} and ${EN.eur(P.cfe.tranches_ca[1])}, the base is ${EN.eur(s.b[1] ?? 0)} and the CFE about ${EN.eur(t2.total)} a year from the third year; between ${EN.eur(P.cfe.tranches_ca[1] + 1)} and ${EN.eur(P.cfe.tranches_ca[2])} it rises to ${EN.eur(t3.total)}. On a small turnover, up to ${EN.eur(P.cfe.tranches_ca[0])}, it stays at ${EN.eur(t1.total)}. In the Bouches-du-Rhône département, Marseille ranks ${EN.num(t2.rang)} out of ${EN.num(t2.nb)} communes in the second band, cheapest first: a real gap with nearby communes such as Arles. Figures from the DGFiP’s 2025 REI file.`,
    faqs: [
      { q: 'Why is the CFE higher in Marseille than in Arles?', a: `In the ${EN.eur(P.cfe.tranches_ca[0] + 1)} to ${EN.eur(P.cfe.tranches_ca[1])} turnover band, ${t2.moins.n} is the cheapest commune in the département according to the 2025 REI file, at about ${EN.eur(t2.moins.total)} a year, against ${EN.eur(t2.total)} in Marseille. They belong to different local authorities, each voting its own minimum bases and rates.` },
      { q: 'At what turnover does Marseille’s CFE pass €1,000?', a: `In the fourth band, from ${EN.eur(P.cfe.tranches_ca[2] + 1)} to ${EN.eur(P.cfe.tranches_ca[3])} of turnover, where the minimum base reaches ${EN.eur(s.b[3] ?? 0)}: the CFE there is about ${EN.eur(t4.total)} a year. That level of turnover is above the micro-enterprise ceiling for services, but still within the ceiling for selling goods.` },
      { q: 'Does a craftsperson in Marseille pay the CCI surcharge?', a: `No, if registered as a craft business and not on the chamber of commerce electoral list: they escape the ${EN.pct(P.cfe.taxe_additionnelle_cci, 2)} surcharge on the base. Their CFE in Marseille is then slightly lower; the calculator handles this with the craftsperson option.` },
    ],
    body: (h) => `
<h2>Marseille’s scale</h2>
<p>The six minimum bases range from ${h.eur(s.b[0] ?? 0)} to ${h.eur(s.b[5] ?? 0)} (${h.src('rei2025', 'REI 2025 file')}). The right-hand column places Marseille among the communes of its département for each band.</p>
${tableauTranches(h, s)}
<h2>What makes up the rate</h2>
<p>Of the ${h.pct(s.t, 2)}, the intercommunal authority votes ${h.pct(s.parts.P32, 2)}, the special equipment tax adds ${h.pct(s.parts.P52, 3)} and the Gemapi tax ${h.pct(s.parts.P52gGEMAPI, 3)}. The city levies no share of its own. The chamber of commerce surcharge and ${h.pct(P.cfe.frais_gestion, 0)} of fees complete the notice (${h.src('spCfe', 'service-public')}).</p>
<h2>The first years</h2>
<p>No CFE in the start-up year, then half the base: on ${h.eur(25000)} of turnover, about ${h.eur(t2.total / 2)} in the second year in Marseille. To compare with ${h.a('cfe-toulouse', 'Toulouse')} or ${h.a('cfe-lyon', 'Lyon')}, use the calculator below. If you moved to Marseille from abroad, note that the first notice lands in your professional account on impots.gouv.fr, not in your letterbox.</p>
<!--mini:cfeVille-->`,
  },
});
