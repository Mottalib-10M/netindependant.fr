import { defineGuide } from '../../lib/guide-types';
import { statsVille, tableauTranches } from '../../lib/cfe-ville';
import { P, FR, EN } from '../../lib/fmt';

const s = statsVille('31555');
const [t1, t2, t3, t4] = s.tranches;
const speciales = s.parts.P52 + s.parts.P52TSC + s.parts.P52gGEMAPI;

export default defineGuide({
  id: 'cfe-toulouse',
  group: 'micro',
  order: 64,
  tool: 'cfe',
  miniHref: 'cfe-auto-entrepreneur',
  toolPreset: { dep: '31', com: '31555', ca: 30000 },
  related: ['cfe-auto-entrepreneur', 'cfe-bordeaux', 'cfe-marseille', 'tva-auto-entrepreneur', 'impot-auto-entrepreneur'],
  sources: ['spCfe', 'rei2025'],
  fr: {
    slug: 'cfe-toulouse',
    nav: 'CFE à Toulouse',
    card: 'Le taux le plus élevé des six grandes villes, taxe SGPSO comprise.',
    title: 'CFE Toulouse 2026 : montant pour un auto-entrepreneur',
    description: 'CFE à Toulouse en 2026 : taux global de 39,50 % avec la taxe spéciale complémentaire SGPSO, bases minimum de 589 € à 7 599 € et CFE selon le chiffre d’affaires.',
    h1: 'CFE à Toulouse : ce que coûte la base minimum',
    intro: 'Toulouse a le taux global de CFE le plus élevé des grandes villes étudiées ici, en partie à cause de deux taxes spéciales.',
    resume: `À Toulouse, le taux global de CFE atteint ${FR.pct(s.t, 2)}, le plus élevé des six grandes villes suivies par ce site. Il additionne la part de l’intercommunalité, ${FR.pct(s.parts.P32, 2)}, une taxe spéciale d’équipement de ${FR.pct(s.parts.P52, 2)}, la taxe Gemapi et une taxe spéciale complémentaire de ${FR.pct(s.parts.P52TSC, 2)} au profit de la Société du grand projet du Sud-Ouest (SGPSO). Pour un micro-entrepreneur sans local, la base minimum est de ${FR.eur(s.b[0] ?? 0)} jusqu’à ${FR.eur(P.cfe.tranches_ca[0])} de chiffre d’affaires, puis ${FR.eur(s.b[1] ?? 0)}, ${FR.eur(s.b[2] ?? 0)} et ${FR.eur(s.b[3] ?? 0)}. La CFE annuelle, à partir de la troisième année, va donc de ${FR.eur(t1.total)} à ${FR.eur(t2.total)} pour un chiffre d’affaires de ${FR.eur(P.cfe.tranches_ca[1])}, et ${FR.eur(t3.total)} jusqu’à ${FR.eur(P.cfe.tranches_ca[2])}. En Haute-Garonne, Toulouse est ${FR.num(t2.rang)}e sur ${FR.num(t2.nb)} communes dans la deuxième tranche. Chiffres du fichier REI 2025 de la DGFiP.`,
    faqs: [
      { q: 'Qu’est-ce que la taxe spéciale complémentaire sur l’avis de CFE toulousain ?', a: `Une taxe additionnelle à la CFE perçue au profit de la Société du grand projet du Sud-Ouest, indiquée dans le fichier REI 2025. À Toulouse, son taux est de ${FR.pct(s.parts.P52TSC, 2)} de la base : pour une base minimum de ${FR.eur(s.b[1] ?? 0)}, elle représente environ ${FR.eur((s.b[1] ?? 0) * s.parts.P52TSC)} par an. Bordeaux la paie aussi.` },
      { q: 'Où payer moins de CFE en Haute-Garonne ?', a: `Pour un chiffre d’affaires de ${FR.eur(P.cfe.tranches_ca[0] + 1)} à ${FR.eur(P.cfe.tranches_ca[1])}, la commune la moins chère du département selon le fichier REI 2025 est ${t2.moins.n}, autour de ${FR.eur(t2.moins.total)} par an, contre ${FR.eur(t2.total)} à Toulouse. Les communes rurales votent souvent des bases plus basses.` },
      { q: 'La CFE toulousaine grimpe-t-elle fort au-delà de 100 000 € ?', a: `Oui : la base passe à ${FR.eur(s.b[3] ?? 0)} dans la quatrième tranche, soit environ ${FR.eur(t4.total)} de CFE par an, puis ${FR.eur(s.b[5] ?? 0)} au-delà de ${FR.eur(P.cfe.tranches_ca[4])}. Ces niveaux concernent surtout la vente de marchandises ou les sociétés.` },
    ],
    body: (h) => `
<h2>La base minimum à Toulouse</h2>
<p>Le tableau reprend les six bases votées et la CFE qui en résulte avec le taux global (${h.src('rei2025', 'fichier REI 2025')}).</p>
${tableauTranches(h, s)}
<h2>Pourquoi le taux dépasse ${h.pct(s.t, 0)}</h2>
<p>La part intercommunale, ${h.pct(s.parts.P32, 2)}, est déjà élevée. Les taxes spéciales ajoutent ensemble ${h.pct(speciales, 2)} : taxe spéciale d’équipement, Gemapi et taxe spéciale complémentaire du Grand projet du Sud-Ouest. La taxe additionnelle pour les chambres de commerce et les frais de gestion s’ajoutent au total (${h.src('spCfe', 'service-public')}).</p>
<h2>Comparer</h2>
<p>${h.a('cfe-bordeaux', 'Bordeaux')} supporte la même taxe complémentaire ; ${h.a('cfe-paris', 'Paris')} reste bien moins cher. Le simulateur ci-dessous compare les six villes pour votre chiffre d’affaires.</p>
<!--mini:cfeVille-->`,
  },
  en: {
    slug: 'cfe-toulouse',
    nav: 'CFE in Toulouse',
    card: 'The highest rate of the six cities, SGPSO tax included.',
    title: 'CFE Toulouse 2026: what a micro-entrepreneur pays yearly',
    description: 'CFE in Toulouse in 2026: a 39.50% overall rate including the SGPSO special tax, minimum bases from €589 to €7,599 and the yearly CFE by turnover band.',
    h1: 'CFE in Toulouse: the cost of the minimum base',
    intro: 'Toulouse has the highest overall CFE rate of the large cities covered here, partly because of two special taxes.',
    resume: `In Toulouse the overall CFE rate reaches ${EN.pct(s.t, 2)}, the highest of the six large cities this site follows. It adds up the intercommunal share, ${EN.pct(s.parts.P32, 2)}, a special equipment tax of ${EN.pct(s.parts.P52, 2)}, the Gemapi flood-prevention tax and a supplementary special tax of ${EN.pct(s.parts.P52TSC, 2)} for the Société du grand projet du Sud-Ouest (SGPSO), as listed in the tax administration’s file. For a micro-entrepreneur without premises, the minimum base is ${EN.eur(s.b[0] ?? 0)} up to ${EN.eur(P.cfe.tranches_ca[0])} of turnover, then ${EN.eur(s.b[1] ?? 0)}, ${EN.eur(s.b[2] ?? 0)} and ${EN.eur(s.b[3] ?? 0)}. From the third year the CFE local business tax therefore runs from ${EN.eur(t1.total)} to ${EN.eur(t2.total)} on turnover of ${EN.eur(P.cfe.tranches_ca[1])}, and ${EN.eur(t3.total)} up to ${EN.eur(P.cfe.tranches_ca[2])}. In the Haute-Garonne département, Toulouse ranks ${EN.num(t2.rang)} out of ${EN.num(t2.nb)} communes in the second band. Figures from the DGFiP’s 2025 REI file.`,
    faqs: [
      { q: 'What is the supplementary special tax on a Toulouse CFE notice?', a: `A surcharge on the CFE collected for the Société du grand projet du Sud-Ouest, shown in the 2025 REI file. In Toulouse its rate is ${EN.pct(s.parts.P52TSC, 2)} of the base: on a ${EN.eur(s.b[1] ?? 0)} minimum base it comes to about ${EN.eur((s.b[1] ?? 0) * s.parts.P52TSC)} a year. Bordeaux pays it too.` },
      { q: 'Where is the CFE lower in Haute-Garonne?', a: `Taking the band for turnover of ${EN.eur(P.cfe.tranches_ca[0] + 1)} to ${EN.eur(P.cfe.tranches_ca[1])}, the cheapest commune in the département according to the 2025 REI file is ${t2.moins.n}, at around ${EN.eur(t2.moins.total)} a year, against ${EN.eur(t2.total)} in Toulouse. Smaller communes in the département often vote lower bases or lower rates.` },
      { q: 'Does the Toulouse CFE climb steeply above €100,000?', a: `Yes: the base rises to ${EN.eur(s.b[3] ?? 0)} in the fourth band, about ${EN.eur(t4.total)} of CFE a year, then ${EN.eur(s.b[5] ?? 0)} above ${EN.eur(P.cfe.tranches_ca[4])}. Those levels mostly concern people selling goods or running a company, since a micro-enterprise selling services must stay under ${EN.eur(P.micro.plafonds.services)} of turnover.` },
    ],
    body: (h) => `
<h2>The minimum base in Toulouse</h2>
<p>The table shows the six bases voted and the resulting CFE at the overall rate (${h.src('rei2025', 'REI 2025 file')}).</p>
${tableauTranches(h, s)}
<h2>Why the rate is above ${h.pct(s.t, 0)}</h2>
<p>The intercommunal share, ${h.pct(s.parts.P32, 2)}, is already high. The special taxes add ${h.pct(speciales, 2)} together: special equipment tax, Gemapi and the SGPSO supplementary tax. The chamber of commerce surcharge and management fees come on top of the total (${h.src('spCfe', 'service-public')}).</p>
<h2>Compare</h2>
<p>${h.a('cfe-bordeaux', 'Bordeaux')} carries the same supplementary tax; ${h.a('cfe-paris', 'Paris')} is far cheaper. The calculator below compares the six cities for your turnover. Keep in mind that the CFE is not collected by the Urssaf with your contributions: it is a separate local tax, billed once a year by the tax administration, and the reference turnover is the one from two years earlier.</p>
<!--mini:cfeVille-->`,
  },
});
