import { defineGuide } from '../../lib/guide-types';
import { statsVille, tableauTranches } from '../../lib/cfe-ville';
import { P, FR, EN } from '../../lib/fmt';

const s = statsVille('69123');
const [t1, t2, t3] = s.tranches;

export default defineGuide({
  id: 'cfe-lyon',
  group: 'micro',
  order: 62,
  tool: 'cfe',
  miniHref: 'cfe-auto-entrepreneur',
  toolPreset: { dep: '69', com: '69123', ca: 30000 },
  related: ['cfe-auto-entrepreneur', 'cfe-paris', 'cfe-marseille', 'micro-entreprise', 'plafond-micro-entreprise'],
  sources: ['spCfe', 'rei2025'],
  fr: {
    slug: 'cfe-lyon',
    nav: 'CFE à Lyon',
    card: 'Un taux voté par l’intercommunalité, des bases qui doublent.',
    title: 'CFE Lyon 2026 : combien paie un auto-entrepreneur par an',
    description: 'CFE à Lyon en 2026 : taux global de 30,65 %, base minimum de 589 € à 5 189 € selon le chiffre d’affaires, et la CFE annuelle d’un micro-entrepreneur sans local.',
    h1: 'CFE à Lyon : le montant selon votre chiffre d’affaires',
    intro: 'À Lyon, c’est l’intercommunalité qui vote le taux de CFE ; la commune ne lève pas de part propre.',
    resume: `À Lyon, la cotisation foncière des entreprises d’un micro-entrepreneur sans local se calcule avec un taux global de ${FR.pct(s.t, 2)}, voté pour l’essentiel par l’intercommunalité (${FR.pct(s.parts.P32, 2)}), à quoi s’ajoute la taxe Gemapi ; la ville elle-même ne lève pas de taux de CFE et aucune taxe spéciale d’équipement ne s’y ajoute. La base minimum varie fortement avec le chiffre d’affaires de l’avant-dernière année : ${FR.eur(s.b[0] ?? 0)} jusqu’à ${FR.eur(P.cfe.tranches_ca[0])}, ${FR.eur(s.b[1] ?? 0)} jusqu’à ${FR.eur(P.cfe.tranches_ca[1])}, ${FR.eur(s.b[2] ?? 0)} jusqu’à ${FR.eur(P.cfe.tranches_ca[2])}. La CFE annuelle passe ainsi de ${FR.eur(t1.total)} à ${FR.eur(t2.total)} puis ${FR.eur(t3.total)}, taxe additionnelle et frais compris, à partir de la troisième année d’activité. Dans le Rhône, Lyon se classe parmi les communes les plus chères pour un petit chiffre d’affaires : ${FR.num(t2.rang)}e sur ${FR.num(t2.nb)} dans la deuxième tranche. Source : fichier REI 2025 de la DGFiP.`,
    faqs: [
      { q: 'Lyon et Villeurbanne ont-elles la même CFE ?', a: `D’après le fichier REI 2025, oui pour un micro-entrepreneur sans local : les deux communes appliquent le même taux global de ${FR.pct(s.t, 2)} et les mêmes bases minimum, votés au niveau intercommunal. Pour ${FR.eur(25000)} de chiffre d’affaires, la CFE y est donc identique, environ ${FR.eur(t2.total)} à partir de la troisième année.` },
      { q: 'Dans le Rhône, où la CFE minimum est-elle la plus basse ?', a: `Dans la tranche de ${FR.eur(P.cfe.tranches_ca[0] + 1)} à ${FR.eur(P.cfe.tranches_ca[1])} de chiffre d’affaires, la commune la moins chère du département selon le fichier REI 2025 est ${t2.moins.n}, avec environ ${FR.eur(t2.moins.total)} par an, contre ${FR.eur(t2.total)} à Lyon. Ces écarts tiennent aux bases minimum et aux taux votés localement.` },
      { q: 'Combien de CFE la deuxième année à Lyon ?', a: `La base est réduite de moitié l’année qui suit la création. Avec ${FR.eur(25000)} de chiffre d’affaires, cela donne environ ${FR.eur(t2.total / 2)} au lieu de ${FR.eur(t2.total)}. L’année de création, la CFE n’est pas due, et elle disparaît si le chiffre d’affaires de référence ne dépasse pas ${FR.eur(P.cfe.exoneration_ca)}.` },
    ],
    body: (h) => `
<h2>Six tranches, six montants</h2>
<p>Contrairement à Paris, Lyon a voté une base différente pour chaque tranche de chiffre d’affaires, de ${h.eur(s.b[0] ?? 0)} à ${h.eur(s.b[5] ?? 0)} (${h.src('rei2025', 'fichier REI 2025')}). Passer de ${h.eur(P.cfe.tranches_ca[0])} à ${h.eur(P.cfe.tranches_ca[0] + 1)} de chiffre d’affaires double donc presque la CFE de l’année N+2.</p>
${tableauTranches(h, s)}
<h2>D’où vient le taux de ${h.pct(s.t, 2)}</h2>
<p>La part intercommunale atteint ${h.pct(s.parts.P32, 2)} ; la taxe pour la gestion des milieux aquatiques et la prévention des inondations ajoute ${h.pct(s.parts.P52gGEMAPI, 3)}. Le fichier ne mentionne pas de taxe spéciale d’équipement à Lyon. S’ajoutent ensuite la taxe pour la chambre de commerce, ${h.pct(P.cfe.taxe_additionnelle_cci, 2)} de la base (pas pour les artisans inscrits seulement à la chambre des métiers), et ${h.pct(P.cfe.frais_gestion, 0)} de frais (${h.src('spCfe', 'service-public')}).</p>
<h2>Et ailleurs</h2>
<p>Comparez avec ${h.a('cfe-paris', 'Paris')}, ${h.a('cfe-marseille', 'Marseille')} ou ${h.a('cfe-lille', 'Lille')} dans le petit simulateur ci-dessous, ou cherchez n’importe quelle commune du Rhône dans celui du haut de page.</p>
<!--mini:cfeVille-->`,
  },
  en: {
    slug: 'cfe-lyon',
    nav: 'CFE in Lyon',
    card: 'A rate voted by the intercommunal authority, bases that double.',
    title: 'CFE Lyon 2026: what a micro-entrepreneur pays a year',
    description: 'CFE in Lyon for 2026: a 30.65% overall rate, minimum bases from €589 to €5,189 by turnover, and the yearly CFE of a micro-entrepreneur without premises.',
    h1: 'CFE in Lyon: the amount by turnover',
    intro: 'In Lyon the CFE rate is voted by the intercommunal authority; the city levies no rate of its own.',
    resume: `In Lyon, the CFE local business tax of a micro-entrepreneur without premises is worked out with an overall rate of ${EN.pct(s.t, 2)}, set almost entirely by the intercommunal authority (${EN.pct(s.parts.P32, 2)}), plus the Gemapi flood-prevention tax; the city itself levies no CFE rate and no special equipment tax is added. The minimum base depends heavily on turnover two years earlier: ${EN.eur(s.b[0] ?? 0)} up to ${EN.eur(P.cfe.tranches_ca[0])}, ${EN.eur(s.b[1] ?? 0)} up to ${EN.eur(P.cfe.tranches_ca[1])}, ${EN.eur(s.b[2] ?? 0)} up to ${EN.eur(P.cfe.tranches_ca[2])}. From the third year of trading, the CFE therefore rises from ${EN.eur(t1.total)} to ${EN.eur(t2.total)} and then ${EN.eur(t3.total)} a year, chamber surcharge and fees included. Within the Rhône département, Lyon is among the most expensive communes for a small business: ${EN.num(t2.rang)} out of ${EN.num(t2.nb)} in the second band. Source: the DGFiP’s 2025 REI file of local tax rates.`,
    faqs: [
      { q: 'Do Lyon and Villeurbanne have the same CFE?', a: `According to the 2025 REI file, yes for a micro-entrepreneur without premises: both communes apply the same overall rate of ${EN.pct(s.t, 2)} and the same minimum bases, voted at intercommunal level. On ${EN.eur(25000)} of turnover the CFE is therefore identical, about ${EN.eur(t2.total)} from the third year.` },
      { q: 'Where in the Rhône is the minimum CFE lowest?', a: `In the ${EN.eur(P.cfe.tranches_ca[0] + 1)} to ${EN.eur(P.cfe.tranches_ca[1])} turnover band, the cheapest commune in the département according to the 2025 REI file is ${t2.moins.n}, at about ${EN.eur(t2.moins.total)} a year, against ${EN.eur(t2.total)} in Lyon. The gap comes from the minimum bases and rates each authority votes.` },
      { q: 'How much CFE in my second year in Lyon?', a: `By law the base is halved in the year after you start. On ${EN.eur(25000)} of turnover that means about ${EN.eur(t2.total / 2)} instead of ${EN.eur(t2.total)}. In the start-up year no CFE is due, and it disappears if reference turnover is at most ${EN.eur(P.cfe.exoneration_ca)}.` },
    ],
    body: (h) => `
<h2>Six bands, six amounts</h2>
<p>Unlike Paris, Lyon has voted a different base for each turnover band, from ${h.eur(s.b[0] ?? 0)} to ${h.eur(s.b[5] ?? 0)} (${h.src('rei2025', 'REI 2025 file')}). Going from ${h.eur(P.cfe.tranches_ca[0])} to ${h.eur(P.cfe.tranches_ca[0] + 1)} of turnover therefore almost doubles the CFE two years later.</p>
${tableauTranches(h, s)}
<h2>Where the ${h.pct(s.t, 2)} rate comes from</h2>
<p>The intercommunal share is ${h.pct(s.parts.P32, 2)}; the tax for water management and flood prevention adds ${h.pct(s.parts.P52gGEMAPI, 3)}. The file shows no special equipment tax in Lyon. Then come the chamber of commerce surcharge, ${h.pct(P.cfe.taxe_additionnelle_cci, 2)} of the base (not for craftspeople registered only with the trades chamber), and ${h.pct(P.cfe.frais_gestion, 0)} of fees (${h.src('spCfe', 'service-public')}).</p>
<h2>And elsewhere</h2>
<p>Compare with ${h.a('cfe-paris', 'Paris')}, ${h.a('cfe-marseille', 'Marseille')} or ${h.a('cfe-lille', 'Lille')} in the small calculator below, or look up any commune of the Rhône in the one at the top of the page.</p>
<!--mini:cfeVille-->`,
  },
});
