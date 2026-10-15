import { defineGuide } from '../../lib/guide-types';
import { cfe } from '../../lib/engine/cfe';
import { P, FR, EN } from '../../lib/fmt';
import { commune } from '../../lib/cfe-data';
import deps from '../../data/cfe-departements.json';

const NB = deps.departements.reduce((s, d) => s + d.k, 0);
const paris = commune('75', '75056');
const lyon = commune('69', '69123');
const toulouse = commune('31', '31555');
const exP = cfe(25000, paris.t, paris.b), exL = cfe(25000, lyon.t, lyon.b), exT = cfe(25000, toulouse.t, toulouse.b);
const exL2 = cfe(25000, lyon.t, lyon.b, 2);

export default defineGuide({
  id: 'cfe-auto-entrepreneur',
  group: 'micro',
  order: 60,
  tool: 'cfe',
  related: ['charges-auto-entrepreneur', 'creer-micro-entreprise', 'micro-entreprise', 'plafond-micro-entreprise', 'declarer-chiffre-affaires'],
  sources: ['spCfe', 'rei2025', 'inseeCog'],
  fr: {
    slug: 'cfe-auto-entrepreneur',
    nav: 'CFE de l’auto-entrepreneur',
    card: 'La CFE votée dans votre commune, tranche par tranche.',
    title: 'CFE auto-entrepreneur 2026 : montant dans votre commune',
    description: 'CFE auto-entrepreneur 2026 : base minimum et taux votés par votre commune, exonération la première année, moitié la deuxième, calcul sans local professionnel.',
    h1: 'CFE de l’auto-entrepreneur : combien dans votre commune ?',
    intro: 'Choisissez votre commune et votre chiffre d’affaires : la CFE se calcule avec la base minimum et le taux qu’elle a votés.',
    resume: `La cotisation foncière des entreprises est due par tout micro-entrepreneur, même sans local, à partir de la deuxième année : l’année de création, rien ; l’année suivante, la base est réduite de moitié ; et aucune CFE si le chiffre d’affaires de l’avant-dernière année n’a pas dépassé ${FR.eur(P.cfe.exoneration_ca)}. Sans local, elle porte sur une base minimum que la commune vote pour six tranches de chiffre d’affaires, entre ${FR.eur(P.cfe.base_min_bornes[0][0])} et ${FR.eur(P.cfe.base_min_bornes[5][1])}, multipliée par le taux de CFE de la commune et de son intercommunalité. S’y ajoutent une taxe additionnelle pour les chambres de commerce de ${FR.pct(P.cfe.taxe_additionnelle_cci, 2)} de la base, sauf pour les artisans, et des frais de gestion. Avec ${FR.eur(25000)} de chiffre d’affaires, l’écart est net : ${FR.eur(exP.total)} à Paris, ${FR.eur(exL.total)} à Lyon, ${FR.eur(exT.total)} à Toulouse, avec les taux et les bases votés pour ${P.cfe.millesime_taux}, derniers publiés par la DGFiP.`,
    faqs: [
      { q: 'Je travaille chez moi, dois-je payer la CFE ?', a: `Oui. Sans local professionnel, la CFE est calculée sur la base minimum de la commune où l’entreprise est domiciliée, votre domicile ou l’adresse d’une société de domiciliation. Elle n’est pas due l’année de création, puis réduite de moitié l’année suivante, et elle disparaît si le chiffre d’affaires de l’avant-dernière année ne dépasse pas ${FR.eur(P.cfe.exoneration_ca)}.` },
      { q: 'Pourquoi ma CFE de deuxième année est-elle plus basse ?', a: `L’année qui suit la création, la base d’imposition est réduite de moitié. À Lyon, avec ${FR.eur(25000)} de chiffre d’affaires, la CFE passe de ${FR.eur(exL.total)} en régime normal à ${FR.eur(exL2.total)} la deuxième année. Le chiffre d’affaires retenu est celui de l’année N-2, ramené à douze mois si l’activité a commencé en cours d’année.` },
      { q: 'Quand et comment la CFE se paie-t-elle ?', a: 'L’avis d’imposition est dématérialisé : il arrive dans l’espace professionnel du site impots.gouv.fr, pas par courrier. La CFE se règle en général au plus tard le 15 décembre, par paiement en ligne ou prélèvement. Créez donc votre espace professionnel dès la création de l’entreprise, même si la première année est exonérée, pour ne pas manquer le premier avis.' },
    ],
    body: (h) => `
<h2>D’où viennent les chiffres de ce simulateur</h2>
<p>La DGFiP publie chaque année le ${h.src('rei2025', 'fichier de recensement des éléments d’imposition (REI)')}, sous licence ouverte : pour chaque commune, les taux de CFE votés par la commune, son intercommunalité et les syndicats, les taxes spéciales qui s’y ajoutent et les six bases minimum délibérées. Ce site en a tiré ${h.num(NB)} communes, avec les noms du ${h.src('inseeCog', 'code officiel géographique de l’Insee')}. Le millésime ${P.cfe.millesime_taux} est le dernier publié ; les taux de 2026 ne le seront qu’en 2027, et une commune peut avoir modifié sa délibération entre-temps.</p>
<h2>Le calcul</h2>
<p>La tranche se lit sur le chiffre d’affaires de l’année N-2 : jusqu’à ${h.eur(P.cfe.tranches_ca[0])}, puis jusqu’à ${h.eur(P.cfe.tranches_ca[1])}, ${h.eur(P.cfe.tranches_ca[2])}, ${h.eur(P.cfe.tranches_ca[3])}, ${h.eur(P.cfe.tranches_ca[4])} et au-delà (${h.src('spCfe', 'service-public, fiche F23547')}). La base minimum de cette tranche est multipliée par le taux global de la commune. On ajoute la taxe additionnelle pour les CCI, ${h.pct(P.cfe.taxe_additionnelle_cci, 2)} de la base, dont les artisans inscrits seulement à la chambre des métiers sont exonérés, puis ${h.pct(P.cfe.frais_gestion, 0)} de frais de gestion.</p>
${h.table(['Commune', 'Taux global', 'Base minimum, CA de 10 001 à 32 600 €', 'CFE'], [[paris.n, h.pct(paris.t, 2), h.eur(paris.b[1] ?? 0), h.eur(exP.total)], [lyon.n, h.pct(lyon.t, 2), h.eur(lyon.b[1] ?? 0), h.eur(exL.total)], [toulouse.n, h.pct(toulouse.t, 2), h.eur(toulouse.b[1] ?? 0), h.eur(exT.total)]], `CFE pour ${h.eur(25000)} de chiffre d’affaires, troisième année, sans local`, ['l', 'r', 'r', 'r'])}
<h2>Les cas que le simulateur ne couvre pas</h2>
<p>Un local professionnel change tout : la CFE se calcule alors sur sa valeur locative si elle dépasse la base minimum. Certaines activités sont exonérées de droit (artisans travaillant seuls avec des apprentis, certains enseignants, artistes, auteurs, chauffeurs de taxi propriétaires de leur voiture…) et des communes votent des exonérations facultatives dans certaines zones. Ces cas se vérifient sur votre avis. Pour le reste du budget de l’auto-entrepreneur, voir ${h.a('charges-auto-entrepreneur', 'les charges de l’auto-entrepreneur')}.</p>`,
  },
  en: {
    slug: 'cfe-local-business-tax',
    nav: 'CFE local business tax',
    card: 'The CFE voted by your commune, band by band.',
    title: 'CFE tax France 2026: micro-entrepreneur amount by commune',
    description: 'CFE local tax for French micro-entrepreneurs in 2026: minimum base and rate voted by your commune, no CFE in year one, half in year two, even with no premises.',
    h1: 'The CFE local business tax: how much in your commune?',
    intro: 'Pick your commune and turnover: the CFE is worked out from the minimum base and rate that commune has voted.',
    resume: `The cotisation foncière des entreprises (CFE) is a local business tax owed by every micro-entrepreneur in France, even one working from home, from the second year: nothing in the year you start, half the base the year after, and no CFE at all if turnover two years earlier was at most ${EN.eur(P.cfe.exoneration_ca)}. Without business premises it is charged on a minimum base that your commune votes for six turnover bands, between ${EN.eur(P.cfe.base_min_bornes[0][0])} and ${EN.eur(P.cfe.base_min_bornes[5][1])}, multiplied by the CFE rate of the commune and its intercommunal authority. Add a chamber of commerce surcharge of ${EN.pct(P.cfe.taxe_additionnelle_cci, 2)} of the base, except for craftspeople, and management fees. On ${EN.eur(25000)} of turnover the gap is clear: ${EN.eur(exP.total)} in Paris, ${EN.eur(exL.total)} in Lyon, ${EN.eur(exT.total)} in Toulouse, using the rates and bases voted for ${P.cfe.millesime_taux}, the latest the French tax administration has published. The notice only ever arrives online, in your professional tax account.`,
    faqs: [
      { q: 'I work from my flat: do I still owe the CFE?', a: `Yes. Without business premises, the CFE is based on the minimum base of the commune where the business is registered, your home or a business address service. It is not due in the start-up year, is halved the following year and disappears if turnover two years earlier was at most ${EN.eur(P.cfe.exoneration_ca)}.` },
      { q: 'Why is my second-year CFE lower?', a: `In the year after you start, the base is halved. In Lyon, with ${EN.eur(25000)} of turnover, the CFE falls from ${EN.eur(exL.total)} in a normal year to ${EN.eur(exL2.total)} in the second year. The turnover used is that of two years earlier (N-2), scaled to twelve months if you started part-way through a year.` },
      { q: 'When and how is the CFE paid?', a: 'The tax notice is electronic only: it appears in your professional account on impots.gouv.fr and is not posted. The CFE is generally due by 15 December, paid online or by direct debit. So create your professional account as soon as you register, even though year one is exempt, so that you do not miss the first notice.' },
    ],
    body: (h) => `
<h2>Where the figures come from</h2>
<p>Each year the French tax administration (DGFiP) publishes its ${h.src('rei2025', 'local tax file, the REI')}, under an open licence: for each commune, the CFE rates voted by the commune, its intercommunal authority and syndicates, the special taxes added on top and the six minimum bases it has set. This site extracted ${h.num(NB)} communes from it, named after ${h.src('inseeCog', 'Insee’s official geographic code')}. The ${P.cfe.millesime_taux} file is the latest; 2026 rates will only be published in 2027, and a commune may have changed its decision since.</p>
<h2>The calculation</h2>
<p>Your band is set by turnover two years earlier: up to ${h.eur(P.cfe.tranches_ca[0])}, then up to ${h.eur(P.cfe.tranches_ca[1])}, ${h.eur(P.cfe.tranches_ca[2])}, ${h.eur(P.cfe.tranches_ca[3])}, ${h.eur(P.cfe.tranches_ca[4])} and above (${h.src('spCfe', 'service-public, sheet F23547')}). The minimum base for that band is multiplied by the commune’s overall rate. Then comes the chamber of commerce surcharge, ${h.pct(P.cfe.taxe_additionnelle_cci, 2)} of the base, which craftspeople registered only with the trades chamber do not pay, and ${h.pct(P.cfe.frais_gestion, 0)} of management fees.</p>
${h.table(['Commune', 'Overall rate', 'Minimum base, turnover €10,001 to €32,600', 'CFE'], [[paris.n, h.pct(paris.t, 2), h.eur(paris.b[1] ?? 0), h.eur(exP.total)], [lyon.n, h.pct(lyon.t, 2), h.eur(lyon.b[1] ?? 0), h.eur(exL.total)], [toulouse.n, h.pct(toulouse.t, 2), h.eur(toulouse.b[1] ?? 0), h.eur(exT.total)]], `CFE on ${h.eur(25000)} of turnover, third year, no premises`, ['l', 'r', 'r', 'r'])}
<h2>Cases the calculator does not cover</h2>
<p>Business premises change everything: the CFE is then based on their rental value if it exceeds the minimum base. Some activities are exempt by law (craftspeople working alone with apprentices, some private tutors, artists, authors, taxi drivers who own their car and others), and communes can vote optional exemptions in certain zones. Check these on your notice. For the rest of a micro-entrepreneur’s budget, see ${h.a('charges-auto-entrepreneur', 'micro-enterprise contributions')}.</p>`,
  },
});
