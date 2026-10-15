import { defineGuide } from '../../lib/guide-types';
import { statsVille, tableauTranches } from '../../lib/cfe-ville';
import { P, FR, EN } from '../../lib/fmt';

const s = statsVille('33063');
const [t1, t2, t3] = s.tranches;

export default defineGuide({
  id: 'cfe-bordeaux',
  group: 'micro',
  order: 65,
  tool: 'cfe',
  miniHref: 'cfe-auto-entrepreneur',
  toolPreset: { dep: '33', com: '33063', ca: 40000 },
  related: ['cfe-auto-entrepreneur', 'cfe-toulouse', 'cfe-lille', 'plafond-micro-entreprise', 'micro-ou-reel'],
  sources: ['spCfe', 'rei2025'],
  fr: {
    slug: 'cfe-bordeaux',
    nav: 'CFE à Bordeaux',
    card: 'Une base qui double entre 32 600 et 32 601 € de chiffre d’affaires.',
    title: 'CFE Bordeaux 2026 : montant pour un micro-entrepreneur',
    description: 'CFE à Bordeaux en 2026 : taux global de 37,45 %, base minimum de 2 353 € dès 32 601 € de chiffre d’affaires et CFE annuelle d’un auto-entrepreneur sans local.',
    h1: 'CFE à Bordeaux : le saut de la troisième tranche',
    intro: 'À Bordeaux, la troisième tranche de chiffre d’affaires fait presque doubler la base minimum de CFE.',
    resume: `À Bordeaux, la CFE d’un micro-entrepreneur sans local repose sur un taux global de ${FR.pct(s.t, 2)}, dont ${FR.pct(s.parts.P32, 2)} votés par l’intercommunalité, auxquels s’ajoutent une taxe spéciale d’équipement, la taxe Gemapi et la taxe spéciale complémentaire de la Société du grand projet du Sud-Ouest, déjà présente à Toulouse. Ce qui distingue Bordeaux, c’est la marche entre deux tranches : la base minimum est de ${FR.eur(s.b[1] ?? 0)} pour un chiffre d’affaires de l’avant-dernière année compris entre ${FR.eur(P.cfe.tranches_ca[0] + 1)} et ${FR.eur(P.cfe.tranches_ca[1])}, puis de ${FR.eur(s.b[2] ?? 0)} dès ${FR.eur(P.cfe.tranches_ca[1] + 1)}. La CFE passe alors de ${FR.eur(t2.total)} à ${FR.eur(t3.total)} par an, à partir de la troisième année. Un libéral qui encaisse un peu plus de ${FR.eur(P.cfe.tranches_ca[1])} voit donc sa CFE de l’année N+2 presque doubler. En Gironde, Bordeaux est ${FR.num(t3.rang)}e sur ${FR.num(t3.nb)} communes pour cette troisième tranche, selon le fichier REI 2025 de la DGFiP.`,
    faqs: [
      { q: 'Pourquoi ma CFE bordelaise double-t-elle d’une année sur l’autre ?', a: `Le plus souvent parce que le chiffre d’affaires de référence, celui de deux ans plus tôt, a franchi ${FR.eur(P.cfe.tranches_ca[1])} : la base minimum passe de ${FR.eur(s.b[1] ?? 0)} à ${FR.eur(s.b[2] ?? 0)} et la CFE de ${FR.eur(t2.total)} à ${FR.eur(t3.total)}. Autre cause possible : la fin de la réduction de moitié appliquée l’année qui suit la création.` },
      { q: 'Quelle commune de Gironde a la CFE minimum la plus haute ?', a: `Pour un chiffre d’affaires de ${FR.eur(P.cfe.tranches_ca[1] + 1)} à ${FR.eur(P.cfe.tranches_ca[2])}, le fichier REI 2025 place ${t3.plus.n} en tête, avec environ ${FR.eur(t3.plus.total)} par an, et ${t3.moins.n} en bas, autour de ${FR.eur(t3.moins.total)}. Bordeaux, à ${FR.eur(t3.total)}, se situe près du haut.` },
      { q: 'Combien de CFE pour un petit chiffre d’affaires à Bordeaux ?', a: `Jusqu’à ${FR.eur(P.cfe.tranches_ca[0])} de chiffre d’affaires, la base minimum est de ${FR.eur(s.b[0] ?? 0)} et la CFE d’environ ${FR.eur(t1.total)} par an. Sous ${FR.eur(P.cfe.exoneration_ca)} de chiffre d’affaires de référence, aucune CFE n’est due, comme partout en France, et l’année de création reste exonérée.` },
    ],
    body: (h) => `
<h2>Le barème bordelais</h2>
<p>Les bases minimum de Bordeaux vont de ${h.eur(s.b[0] ?? 0)} à ${h.eur(s.b[5] ?? 0)} (${h.src('rei2025', 'fichier REI 2025')}). La troisième tranche, la plus fréquente chez les libéraux à temps plein, est la plus sensible.</p>
${tableauTranches(h, s)}
<h2>Le taux de ${h.pct(s.t, 2)} en détail</h2>
<p>Intercommunalité ${h.pct(s.parts.P32, 2)}, taxe spéciale d’équipement ${h.pct(s.parts.P52, 3)}, Gemapi ${h.pct(s.parts.P52gGEMAPI, 3)}, taxe spéciale complémentaire ${h.pct(s.parts.P52TSC, 2)}. La taxe pour les chambres de commerce et les frais de gestion s’y ajoutent (${h.src('spCfe', 'service-public')}).</p>
<h2>Voir aussi</h2>
<p>La même taxe complémentaire s’applique à ${h.a('cfe-toulouse', 'Toulouse')}. Pour savoir si un chiffre d’affaires plus élevé vaut la peine malgré la CFE, simulez votre net complet sur ${h.a('home', 'le simulateur auto-entrepreneur')}, ou comparez les grandes villes ci-dessous.</p>
<!--mini:cfeVille-->`,
  },
  en: {
    slug: 'cfe-bordeaux',
    nav: 'CFE in Bordeaux',
    card: 'A base that nearly doubles between €32,600 and €32,601 of turnover.',
    title: 'CFE Bordeaux 2026: what a micro-entrepreneur pays yearly',
    description: 'CFE in Bordeaux in 2026: a 37.45% overall rate, a €2,353 minimum base from €32,601 of turnover, and the yearly CFE of a micro-entrepreneur with no premises.',
    h1: 'CFE in Bordeaux: the jump in the third band',
    intro: 'In Bordeaux, the third turnover band almost doubles the minimum CFE base.',
    resume: `In Bordeaux, the CFE local business tax of a micro-entrepreneur without premises rests on an overall rate of ${EN.pct(s.t, 2)}, of which ${EN.pct(s.parts.P32, 2)} is voted by the intercommunal authority, plus a special equipment tax, the Gemapi flood-prevention tax and the supplementary special tax of the Société du grand projet du Sud-Ouest, also found in Toulouse. What sets Bordeaux apart is the step between two bands: the minimum base is ${EN.eur(s.b[1] ?? 0)} for turnover two years earlier between ${EN.eur(P.cfe.tranches_ca[0] + 1)} and ${EN.eur(P.cfe.tranches_ca[1])}, then ${EN.eur(s.b[2] ?? 0)} from ${EN.eur(P.cfe.tranches_ca[1] + 1)}. The CFE then rises from ${EN.eur(t2.total)} to ${EN.eur(t3.total)} a year, from the third year of trading. A freelancer billing just over ${EN.eur(P.cfe.tranches_ca[1])} therefore sees the CFE two years later nearly double. In the Gironde département, Bordeaux ranks ${EN.num(t3.rang)} out of ${EN.num(t3.nb)} communes for that third band, according to the DGFiP’s 2025 REI file.`,
    faqs: [
      { q: 'Why did my Bordeaux CFE double from one year to the next?', a: `Most often because reference turnover, the one from two years earlier, crossed ${EN.eur(P.cfe.tranches_ca[1])}: the minimum base goes from ${EN.eur(s.b[1] ?? 0)} to ${EN.eur(s.b[2] ?? 0)} and the CFE from ${EN.eur(t2.total)} to ${EN.eur(t3.total)}. Another possible reason is the end of the half-base reduction granted in the year after you start.` },
      { q: 'Which commune in the Gironde has the highest minimum CFE?', a: `For turnover of ${EN.eur(P.cfe.tranches_ca[1] + 1)} to ${EN.eur(P.cfe.tranches_ca[2])}, the 2025 REI file puts ${t3.plus.n} at the top, at about ${EN.eur(t3.plus.total)} a year, and ${t3.moins.n} at the bottom, around ${EN.eur(t3.moins.total)}. Bordeaux, at ${EN.eur(t3.total)}, sits near the top of that list, well above most rural communes.` },
      { q: 'How much CFE on a small turnover in Bordeaux?', a: `Up to ${EN.eur(P.cfe.tranches_ca[0])} of turnover, the minimum base is ${EN.eur(s.b[0] ?? 0)} and the CFE about ${EN.eur(t1.total)} a year. Below ${EN.eur(P.cfe.exoneration_ca)} of reference turnover no CFE is due at all, as everywhere in France, and the year you start is always exempt, whatever your turnover.` },
    ],
    body: (h) => `
<h2>The Bordeaux scale</h2>
<p>Bordeaux’s minimum bases run from ${h.eur(s.b[0] ?? 0)} to ${h.eur(s.b[5] ?? 0)} (${h.src('rei2025', 'REI 2025 file')}). The third band, the most common for full-time freelancers, is the most sensitive.</p>
${tableauTranches(h, s)}
<h2>The ${h.pct(s.t, 2)} rate in detail</h2>
<p>Intercommunal authority ${h.pct(s.parts.P32, 2)}, special equipment tax ${h.pct(s.parts.P52, 3)}, Gemapi ${h.pct(s.parts.P52gGEMAPI, 3)}, supplementary special tax ${h.pct(s.parts.P52TSC, 2)}. The chamber of commerce surcharge and management fees are added (${h.src('spCfe', 'service-public')}).</p>
<h2>See also</h2>
<p>The same supplementary tax applies in ${h.a('cfe-toulouse', 'Toulouse')}. To see whether higher turnover is worth it despite the CFE, work out your full take-home with ${h.a('home', 'the micro-enterprise calculator')}, or compare the large cities below. Note that the turnover that sets your band is the one from two years earlier: a strong year 2026 shows on the CFE notice of 2028.</p>
<!--mini:cfeVille-->`,
  },
});
