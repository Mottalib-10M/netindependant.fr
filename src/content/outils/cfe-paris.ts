import { defineGuide } from '../../lib/guide-types';
import { statsVille, tableauTranches } from '../../lib/cfe-ville';
import { P, FR, EN } from '../../lib/fmt';

const s = statsVille('75056');
const [t1, , t3, t4] = s.tranches;

export default defineGuide({
  id: 'cfe-paris',
  group: 'micro',
  order: 61,
  tool: 'cfe',
  miniHref: 'cfe-auto-entrepreneur',
  toolPreset: { dep: '75', com: '75056', ca: 30000 },
  related: ['cfe-auto-entrepreneur', 'cfe-lyon', 'cfe-marseille', 'charges-auto-entrepreneur', 'creer-micro-entreprise'],
  sources: ['spCfe', 'rei2025'],
  fr: {
    slug: 'cfe-paris',
    nav: 'CFE à Paris',
    card: 'La CFE la plus basse des grandes villes, jusqu’à 100 000 €.',
    title: 'CFE Paris 2026 : montant pour un auto-entrepreneur',
    description: 'CFE à Paris en 2026 : base minimum de 416 € jusqu’à 100 000 € de chiffre d’affaires, taux de 17,83 %, environ 80 € par an pour un indépendant sans local.',
    h1: 'CFE à Paris : ce que paie un micro-entrepreneur',
    intro: 'Paris applique une base minimum unique jusqu’à 100 000 € de chiffre d’affaires et le taux de CFE le plus bas des grandes villes.',
    resume: `À Paris, un micro-entrepreneur sans local paie l’une des CFE les plus faibles de France pour une grande ville : la Ville a voté une base minimum de ${FR.eur(s.b[0] ?? 0)} pour les trois premières tranches, c’est-à-dire jusqu’à ${FR.eur(P.cfe.tranches_ca[2])} de chiffre d’affaires, et le taux global de CFE y est de ${FR.pct(s.t, 2)}. Résultat, à partir de la troisième année, la CFE tourne autour de ${FR.eur(t1.total)} par an, taxe additionnelle pour la chambre de commerce et frais compris, quel que soit votre chiffre d’affaires jusqu’à ce seuil. Au-delà, la base saute à ${FR.eur(s.b[3] ?? 0)} et la CFE à ${FR.eur(t4.total)}. Paris est à la fois commune et département : aucune intercommunalité ne vote de taux en plus, mais s’ajoutent une taxe spéciale d’équipement, la taxe Gemapi et une taxe additionnelle au profit de la région Île-de-France. Ces chiffres viennent du fichier REI 2025 de la DGFiP, le dernier publié.`,
    faqs: [
      { q: 'Pourquoi la CFE est-elle si basse à Paris pour un petit chiffre d’affaires ?', a: `Parce que la base minimum votée par Paris, ${FR.eur(s.b[0] ?? 0)}, est proche du plancher légal de ${FR.eur(P.cfe.base_min_bornes[0][0])}, et qu’elle reste la même jusqu’à ${FR.eur(P.cfe.tranches_ca[2])} de chiffre d’affaires. Avec un taux global de ${FR.pct(s.t, 2)}, cela donne environ ${FR.eur(t3.total)} par an, contre plusieurs centaines d’euros dans la plupart des métropoles.` },
      { q: 'Une domiciliation parisienne change-t-elle ma CFE ?', a: 'La CFE sans local se calcule dans la commune où l’entreprise est domiciliée : votre domicile, ou l’adresse fournie par une société de domiciliation. Une adresse à Paris applique donc la base et le taux parisiens. Le simulateur ci-dessus permet de comparer avec votre commune de résidence, sans préjuger de la pertinence d’un tel choix.' },
      { q: 'Que se passe-t-il au-delà de 100 000 € de chiffre d’affaires à Paris ?', a: `La base minimum passe à ${FR.eur(s.b[3] ?? 0)} pour les trois tranches supérieures, et la CFE annuelle à ${FR.eur(t4.total)} environ. Ce niveau de chiffre d’affaires dépasse le plafond de la micro-entreprise pour les services : il concerne surtout la vente de marchandises ou une société.` },
    ],
    body: (h) => `
<h2>Le barème parisien tranche par tranche</h2>
<p>Le tableau applique la base minimum votée par Paris et son taux global à chaque tranche de chiffre d’affaires (${h.src('rei2025', 'fichier REI 2025')}). La plateforme de base unique jusqu’à ${h.eur(P.cfe.tranches_ca[2])} est rare : dans la plupart des grandes villes, chaque tranche a sa propre base, qui double presque d’une tranche à l’autre.</p>
${tableauTranches(h, s)}
<h2>Ce qui compose le taux de ${h.pct(s.t, 2)}</h2>
<p>La part communale est de ${h.pct(s.parts.P12, 2)}. S’y ajoutent une taxe spéciale d’équipement de ${h.pct(s.parts.P52, 2)}, la taxe Gemapi pour la gestion des milieux aquatiques (${h.pct(s.parts.P52gGEMAPI, 3)}) et une taxe additionnelle spéciale annuelle au profit de la région Île-de-France (${h.pct(s.parts.P52TASA, 2)}). La taxe additionnelle pour les chambres de commerce, ${h.pct(P.cfe.taxe_additionnelle_cci, 2)} de la base, et ${h.pct(P.cfe.frais_gestion, 0)} de frais s’appliquent ensuite (${h.src('spCfe', 'service-public')}).</p>
<h2>Comparer avec une autre grande ville</h2>
<p>Pour le même chiffre d’affaires, la CFE est plusieurs fois plus élevée à ${h.a('cfe-lyon', 'Lyon')}, ${h.a('cfe-marseille', 'Marseille')} ou ${h.a('cfe-toulouse', 'Toulouse')}. Le petit simulateur ci-dessous fait la comparaison ; pour toute autre commune, voir ${h.a('cfe-auto-entrepreneur', 'la CFE de l’auto-entrepreneur')}. Rappel : aucune CFE l’année de création, base divisée par deux l’année suivante.</p>
<!--mini:cfeVille-->`,
  },
  en: {
    slug: 'cfe-paris',
    nav: 'CFE in Paris',
    card: 'The lowest CFE of any large city, up to €100,000.',
    title: 'CFE Paris 2026: what a micro-entrepreneur pays each year',
    description: 'CFE in Paris in 2026: a €416 minimum base up to €100,000 of turnover and a 17.83% rate, so about €80 a year for a micro-entrepreneur working without premises.',
    h1: 'CFE in Paris: what a micro-entrepreneur pays',
    intro: 'Paris sets one minimum base up to €100,000 of turnover and the lowest CFE rate of France’s large cities.',
    resume: `In Paris, a micro-entrepreneur without business premises pays one of the lowest CFE bills of any large French city. The CFE (cotisation foncière des entreprises) is the local business tax every self-employed person owes from the second year. Paris has set a minimum base of ${EN.eur(s.b[0] ?? 0)} for the first three bands, meaning up to ${EN.eur(P.cfe.tranches_ca[2])} of turnover, and its overall CFE rate is ${EN.pct(s.t, 2)}. From year three, the CFE therefore comes to about ${EN.eur(t1.total)} a year, chamber of commerce surcharge and fees included, whatever your turnover up to that level. Above it, the base jumps to ${EN.eur(s.b[3] ?? 0)} and the CFE to ${EN.eur(t4.total)}. Paris is both a commune and a département, so no intercommunal authority adds a rate, but a special equipment tax, the Gemapi flood-prevention tax and a surcharge for the Île-de-France region come on top. Figures come from the DGFiP’s 2025 REI file, the latest published.`,
    faqs: [
      { q: 'Why is the CFE so low in Paris on a small turnover?', a: `Because the minimum base Paris has voted, ${EN.eur(s.b[0] ?? 0)}, sits close to the legal floor of ${EN.eur(P.cfe.base_min_bornes[0][0])} and stays the same up to ${EN.eur(P.cfe.tranches_ca[2])} of turnover. With an overall rate of ${EN.pct(s.t, 2)}, that means about ${EN.eur(t3.total)} a year, against several hundred euros in most other big cities.` },
      { q: 'Does a Paris business address change my CFE?', a: 'Without premises, the CFE is worked out in the commune where the business is registered: your home, or the address provided by a business address service. A Paris address therefore applies the Paris base and rate. The calculator above lets you compare with the commune where you live, without saying whether such a choice makes sense for you.' },
      { q: 'What happens above €100,000 of turnover in Paris?', a: `In that case the minimum base rises to ${EN.eur(s.b[3] ?? 0)} for the three upper bands, and the annual CFE to about ${EN.eur(t4.total)}. That turnover is above the micro-enterprise ceiling for services, so it mainly concerns people selling goods or running a company.` },
    ],
    body: (h) => `
<h2>The Paris scale band by band</h2>
<p>The table applies the minimum base voted by Paris and its overall rate to each turnover band (${h.src('rei2025', 'REI 2025 file')}). A single base all the way to ${h.eur(P.cfe.tranches_ca[2])} is unusual: in most large cities each band has its own base, which nearly doubles from one band to the next.</p>
${tableauTranches(h, s)}
<h2>What makes up the ${h.pct(s.t, 2)} rate</h2>
<p>The city’s own share is ${h.pct(s.parts.P12, 2)}. On top come a special equipment tax of ${h.pct(s.parts.P52, 2)}, the Gemapi tax for water management and flood prevention (${h.pct(s.parts.P52gGEMAPI, 3)}) and a special annual surcharge for the Île-de-France region (${h.pct(s.parts.P52TASA, 2)}). The chamber of commerce surcharge, ${h.pct(P.cfe.taxe_additionnelle_cci, 2)} of the base, and ${h.pct(P.cfe.frais_gestion, 0)} of fees are then added (${h.src('spCfe', 'service-public')}).</p>
<h2>Compare with another large city</h2>
<p>For the same turnover, the CFE is several times higher in ${h.a('cfe-lyon', 'Lyon')}, ${h.a('cfe-marseille', 'Marseille')} or ${h.a('cfe-toulouse', 'Toulouse')}. The small calculator below compares them; for any other commune, see ${h.a('cfe-auto-entrepreneur', 'the CFE local business tax')}. Remember: no CFE in the start-up year, half the base the year after.</p>
<!--mini:cfeVille-->`,
  },
});
