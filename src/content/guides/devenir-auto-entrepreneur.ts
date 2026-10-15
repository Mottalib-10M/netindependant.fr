import { defineGuide } from '../../lib/guide-types';
import { micro, type Activite } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Chiffre d'affaires annuel nécessaire pour un net mensuel visé (recherche par dichotomie sur le moteur).
function caPour(net: number, activite: Activite, opts: Partial<Parameters<typeof micro>[0]> = {}): number {
  let lo = 0, hi = Math.max(1000, net * 60);
  for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (micro({ ca: mid, activite, ...opts }).netMensuel < net) lo = mid; else hi = mid; }
  return hi;
}
const NETS = [1500, 2000, 2500, 3000, 4000];
const grille = NETS.map((n) => ({ n, vente: caPour(n, 'vente'), bic: caPour(n, 'bic'), bnc: caPour(n, 'bnc') }));
// Une consultante qui vise 2 500 € nets par mois.
const caConsult = caPour(2500, 'bnc');
const consult = micro({ ca: caConsult, activite: 'bnc' });
const consultVL = caPour(2500, 'bnc', { vl: true });
const consultCouple = caPour(2500, 'bnc', { foyer: { parts: 2, couple: true } });
// Un dépanneur en prestations commerciales qui vise 2 000 € nets, sans puis avec 6 000 € de frais réels.
const fraisDep = 6000;
const caDep = caPour(2000, 'bic');
const caDepFrais = caPour(2000, 'bic', { charges: fraisDep });
const dep = micro({ ca: caDepFrais, activite: 'bic', charges: fraisDep });
// Plafond des services : le net mensuel maximal qu'il permet en libéral, personne seule.
const maxBnc = micro({ ca: P.micro.plafonds.services, activite: 'bnc' });
const tvaTxt = (ca: number, l: 'fr' | 'en') => {
  const s = micro({ ca, activite: 'bnc' }).tvaStatut;
  if (l === 'fr') return s === 'franchise' ? 'en franchise' : s === 'tolerance' ? 'entre les deux seuils' : 'TVA due';
  return s === 'franchise' ? 'exempt' : s === 'tolerance' ? 'between thresholds' : 'VAT due';
};

export default defineGuide({
  id: 'devenir-auto-entrepreneur',
  group: 'creation',
  order: 20,
  mini: 'objectifNet',
  related: ['creer-micro-entreprise', 'micro-entreprise', 'micro-ou-reel', 'tjm-freelance', 'auto-entrepreneur-salarie', 'tva-auto-entrepreneur'],
  sources: ['aeEssentiel', 'spPlafonds', 'spFranchiseTva', 'spMicroImposition'],
  fr: {
    slug: 'devenir-auto-entrepreneur',
    nav: 'Devenir auto-entrepreneur',
    card: 'Le chiffre d’affaires à viser pour vivre de son activité, et les seuils qui changent la donne.',
    title: 'Devenir auto-entrepreneur 2026 : chiffre d’affaires à viser',
    description: 'Devenir auto-entrepreneur en 2026 : pour 2 000 € nets par mois en libéral, il faut encaisser environ 33 383 € par an. Seuils, TVA et frais à bien prévoir.',
    h1: 'Devenir auto-entrepreneur : combien faut-il encaisser pour en vivre ?',
    intro: 'La question n’est pas de savoir si l’inscription est simple, elle l’est, mais combien il faut facturer pour qu’il reste un revenu.',
    resume: `Pour devenir auto-entrepreneur et se dégager ${FR.eur(2000)} nets par mois en 2026, une personne seule exerçant une profession libérale doit encaisser environ ${FR.eur(grille[1].bnc)} de chiffre d’affaires dans l’année, contre ${FR.eur(grille[1].bic)} en prestations commerciales et ${FR.eur(grille[1].vente)} en vente de marchandises, avant tout frais professionnel. L’écart vient des taux de cotisations, ${FR.pct(P.micro.taux.bnc)} en libéral, ${FR.pct(P.micro.taux.bic)} en services commerciaux et ${FR.pct(P.micro.taux.vente)} en vente, et des abattements fiscaux qui servent au calcul de l’impôt. Deux seuils encadrent le projet : le plafond du régime, ${FR.eur(P.micro.plafonds.services)} pour les services et ${FR.eur(P.micro.plafonds.vente)} pour la vente, et la franchise de TVA, ${FR.eur(P.tva.services.seuil)} pour les services. Viser ${FR.eur(2500)} nets en libéral demande déjà ${FR.eur(caConsult)}, au-delà du seuil de TVA. Ces montants sont des estimations calculées avec les paramètres publiés, sans valeur de conseil personnalisé.`,
    faqs: [
      { q: 'Quel chiffre d’affaires annuel pour se dégager 2 000 € par mois en auto-entrepreneur libéral ?', a: `Environ ${FR.eur(grille[1].bnc)} encaissés dans l’année pour une personne seule sans autre revenu, une fois payées les cotisations à ${FR.pct(P.micro.taux.bnc)}, la contribution à la formation et l’impôt sur le revenu au barème. Ce calcul ne compte ni la CFE, due à partir de la deuxième année, ni vos frais réels. En vente de marchandises, ${FR.eur(grille[1].vente)} suffiraient, mais ce chiffre comprend le prix d’achat des produits.` },
      { q: 'Combien de chiffre d’affaires en plus pour couvrir 6 000 € de frais annuels en micro ?', a: `Pour des prestations commerciales visant ${FR.eur(2000)} nets par mois, l’objectif passe de ${FR.eur(caDep)} à ${FR.eur(caDepFrais)}. Le régime micro ne déduit aucune dépense : chaque euro de frais doit être financé par du chiffre d’affaires qui supporte lui-même cotisations et impôt. Au-delà d’un certain niveau de dépenses, la comparaison avec le régime réel s’impose.` },
      { q: 'Viser 2 500 € nets par mois oblige-t-il un auto-entrepreneur à facturer la TVA ?', a: `En libéral, oui le plus souvent : il faut encaisser environ ${FR.eur(caConsult)}, au-dessus du seuil majoré de franchise des services, ${FR.eur(P.tva.services.majore)}. La TVA devient due dès le jour du dépassement de ce seuil majoré. Vous la facturez alors en plus de vos prix hors taxe et demandez un numéro de TVA intracommunautaire au service des impôts des entreprises.` },
      { q: 'Quel revenu maximal peut-on tirer d’une micro-entreprise de services ?', a: `Le plafond des services, ${FR.eur(P.micro.plafonds.services)} de chiffre d’affaires, laisse à une personne seule en libéral environ ${FR.eur(maxBnc.netMensuel)} nets par mois après cotisations et impôt au barème, hors frais et CFE. Un seul dépassement est toléré ; deux années consécutives au-dessus font sortir du régime au 1er janvier suivant.` },
      { q: 'Le foyer fiscal change-t-il le chiffre d’affaires à viser en auto-entreprise ?', a: `Oui, par l’impôt sur le revenu. Pour ${FR.eur(2500)} nets par mois en libéral, une personne seule doit encaisser ${FR.eur(caConsult)} ; un couple sans autre revenu, ${FR.eur(consultCouple)}, grâce au quotient familial. Avec le versement libératoire au taux de ${FR.pct(P.micro.vl.bnc)}, l’objectif devient ${FR.eur(consultVL)}. Le mini-simulateur suppose une personne seule.` },
    ],
    body: (h) => `
<h2>Le bon point de départ : le revenu dont vous avez besoin</h2>
<p>Les guides sur l’auto-entreprise commencent souvent par la démarche d’inscription. Elle prend peu de temps et elle est détaillée sur ${h.a('creer-micro-entreprise', 'créer sa micro-entreprise')}. La vraie question se pose avant : combien encaisser pour que l’activité vous fasse vivre. On part du net mensuel voulu, puis on remonte au chiffre d’affaires, en tenant compte des cotisations, de la contribution à la formation, de la taxe de chambre éventuelle et de l’impôt sur le revenu.</p>
<p>Le tableau suivant fait ce calcul avec le moteur du site, pour une personne seule sans autre revenu, sans frais professionnels, sans Acre et avec l’impôt calculé au barème après abattement (${h.src('spMicroImposition', 'service-public, fiche F23267')}).</p>
${h.table(['Net visé par mois', 'Vente de marchandises', 'Prestations commerciales', 'Profession libérale', 'TVA en libéral'], grille.map((g) => [h.eur(g.n), h.eur(g.vente), h.eur(g.bic), h.eur(g.bnc), tvaTxt(g.bnc, 'fr')]), 'Chiffre d’affaires annuel à encaisser en micro-entreprise pour un net mensuel visé, personne seule, 2026', ['l', 'r', 'r', 'r', 'l'])}
<p>Trois lectures. D’abord, la vente demande le moins de chiffre d’affaires pour un même net affiché, parce que le taux de cotisations y est le plus bas et l’abattement fiscal le plus fort, ${h.pct(P.micro.abattement.vente, 0)}. Mais ce chiffre d’affaires inclut l’achat des marchandises revendues : il faut y ajouter le coût du stock. Ensuite, l’écart entre services commerciaux et libéral s’élargit à mesure que l’objectif monte. Enfin, au-delà d’environ ${h.eur(2000)} nets en libéral, l’objectif croise les seuils de TVA.</p>

<h2>Trois profils, trois objectifs</h2>
<h3>Une consultante qui vise ${h.eur(2500)} par mois</h3>
<p>Elle doit encaisser ${h.eur(caConsult)} dans l’année. Sur cette somme, ${h.eur(consult.cotisations)} partent en cotisations, ${h.eur(consult.cfp)} en contribution à la formation et ${h.eur(consult.ir)} en impôt sur le revenu. Ce niveau dépasse le seuil majoré de franchise de TVA des services, ${h.eur(P.tva.services.majore)} (${h.src('spFranchiseTva', 'service-public, fiche F21746')}) : elle facturera la TVA en plus de ses prix. Elle devra demander un numéro de TVA intracommunautaire et tenir le compte de la TVA collectée et de la TVA déductible. Pour traduire cet objectif en jours facturés, voir ${h.a('tjm-freelance', 'le calcul du TJM')}.</p>
<h3>Un dépanneur qui a des frais</h3>
<p>Il exerce en prestations commerciales et vise ${h.eur(2000)} nets. Sans frais, ${h.eur(caDep)} suffiraient. Avec ${h.eur(fraisDep)} de dépenses annuelles, véhicule, outillage, téléphone, il lui faut ${h.eur(caDepFrais)}, car le régime micro ignore ces dépenses : il paie ${h.eur(dep.cotisations)} de cotisations sur le tout. C’est le signal pour regarder ${h.a('micro-ou-reel', 'micro ou réel')}.</p>
<h3>Un couple dont un seul se lance</h3>
<p>L’impôt dépend du foyer. Pour ${h.eur(2500)} nets en libéral, un couple sans autre revenu n’a besoin que de ${h.eur(consultCouple)}, contre ${h.eur(caConsult)} pour une personne seule. À l’inverse, si le conjoint a déjà un salaire, l’impôt sur le chiffre d’affaires sera calculé à un taux marginal plus élevé que dans cet exemple : le simulateur complet accepte ces autres revenus. Le versement libératoire, à ${h.pct(P.micro.vl.bnc)} du chiffre d’affaires en libéral, porte l’objectif à ${h.eur(consultVL)} pour une personne seule : il ne fait pas gagner à ce niveau.</p>

<h2>Les seuils qui bornent le projet</h2>
<p>Le régime micro accepte jusqu’à ${h.eur(P.micro.plafonds.services)} de chiffre d’affaires en services et ${h.eur(P.micro.plafonds.vente)} en vente (${h.src('spPlafonds', 'service-public, fiche F32353')}). Au maximum, une personne seule en libéral en retire environ ${h.eur(maxBnc.netMensuel)} nets par mois. Si votre projet vise plus, le régime micro n’est probablement pas le bon cadre ; ${h.a('micro-entreprise', 'la page sur la micro-entreprise')} décrit ses limites. Le seuil n’est pas brutal : un dépassement isolé est toléré, et c’est la deuxième année consécutive au-dessus qui fait sortir du régime.</p>
<p>La franchise de TVA tombe bien plus tôt pour les prestataires : ${h.eur(P.tva.services.seuil)}, avec une marge jusqu’à ${h.eur(P.tva.services.majore)}. En vente, ${h.eur(P.tva.vente.seuil)} et ${h.eur(P.tva.vente.majore)}. Le seuil unique de ${h.eur(P.tva.seuil_unique_abandonne)} un temps prévu par la loi de finances pour 2025 a été abandonné. Les détails sont sur ${h.a('tva-auto-entrepreneur', 'la TVA de l’auto-entrepreneur')}.</p>

<h2>Ce que le net ne contient pas encore</h2>
<p>Le revenu calculé ici est ce qui reste après cotisations et impôt. Il reste trois postes à prévoir. La CFE, nulle la première année puis variable selon la commune. Vos frais réels, que le régime micro ne déduit jamais. Et les mois sans client : un objectif annuel suppose d’encaisser tout au long de l’année, alors que les cotisations, elles, ne sont dues que sur ce qui est réellement encaissé, ce qui amortit les creux.</p>
<p>Si vous gardez un emploi salarié en parallèle, l’objectif se raisonne autrement, parce que l’impôt se calcule sur l’ensemble du foyer : voyez ${h.a('auto-entrepreneur-salarie', 'auto-entrepreneur et salarié')}.</p>

<h2>Avant de vous inscrire</h2>
<p>Vérifiez la catégorie de votre activité : c’est elle qui fixe le taux (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Regardez si vous pouvez prétendre à l’Acre, qui allège les cotisations du début d’activité mais se demande désormais dans les ${h.num(P.micro.acre.delai_demande_jours)} jours. Et testez votre propre objectif dans le mini-simulateur en haut de page, puis dans le simulateur complet. Les résultats restent des estimations : l’Urssaf et le service des impôts arrêtent les montants réels.</p>`,
  },
  en: {
    slug: 'becoming-self-employed',
    nav: 'Becoming self-employed',
    card: 'The turnover you need to live on your business, and the thresholds that change the picture.',
    title: 'Becoming self-employed in France 2026: the turnover you need',
    description: 'Becoming self-employed in France in 2026: to keep €2,000 a month as a freelancer you need about €33,383 of yearly turnover. Thresholds, VAT and costs.',
    h1: 'Becoming self-employed in France: how much do you need to earn?',
    intro: 'Registering is the easy part; the real question is how much you must bring in before anything is left to live on.',
    resume: `To become self-employed in France as an auto-entrepreneur, also called micro-entrepreneur, and keep ${EN.eur(2000)} a month in 2026, a single person in a liberal profession (independent professional services such as consulting, design or coaching) needs to receive about ${EN.eur(grille[1].bnc)} of turnover over the year. Commercial services need ${EN.eur(grille[1].bic)} and selling goods ${EN.eur(grille[1].vente)}, before any business costs. The gap comes from contribution rates, ${EN.pct(P.micro.taux.bnc)} for liberal professions, ${EN.pct(P.micro.taux.bic)} for commercial services and ${EN.pct(P.micro.taux.vente)} for sales, paid to the Urssaf, the body that collects social contributions, and from the flat tax allowances used for income tax. Two thresholds frame the plan: the scheme ceiling of ${EN.eur(P.micro.plafonds.services)} for services and ${EN.eur(P.micro.plafonds.vente)} for sales, and the VAT exemption threshold of ${EN.eur(P.tva.services.seuil)} for services. Aiming for ${EN.eur(2500)} a month as a freelancer already takes ${EN.eur(caConsult)}, above that VAT threshold. These are estimates from published parameters, not personal advice.`,
    faqs: [
      { q: 'How much turnover does a French micro-entrepreneur need to take home €2,000 a month?', a: `About ${EN.eur(grille[1].bnc)} received over the year for a single person in a liberal profession with no other income, after contributions at ${EN.pct(P.micro.taux.bnc)}, the training levy and income tax on the progressive scale. That excludes the CFE local business tax, owed from the second year, and your real costs. Selling goods would need ${EN.eur(grille[1].vente)}, but that includes buying stock.` },
      { q: 'How much extra turnover covers €6,000 of yearly business costs under micro?', a: `For commercial services aiming at ${EN.eur(2000)} a month, the target rises from ${EN.eur(caDep)} to ${EN.eur(caDepFrais)}. The micro scheme deducts no expenses: every euro of cost has to be funded by turnover that itself bears contributions and tax. Past a certain level of spending, compare with the real-profit regime.` },
      { q: 'Will aiming for €2,500 a month push me over the French VAT threshold?', a: `As a liberal profession, usually yes: you need about ${EN.eur(caConsult)}, above the higher services threshold of ${EN.eur(P.tva.services.majore)}. VAT, called TVA in France, becomes due from the day you cross that higher threshold. You then add it on top of your prices before VAT and get an EU VAT number from the business tax office, the SIE.` },
      { q: 'What is the most a services micro-enterprise can pay me?', a: `The services ceiling of ${EN.eur(P.micro.plafonds.services)} of turnover leaves a single liberal professional about ${EN.eur(maxBnc.netMensuel)} a month after contributions and income tax on the scale, before costs and CFE. Going over once is tolerated; two consecutive years above it take you out of the scheme on the following 1 January.` },
      { q: 'Does my household change the turnover target in France?', a: `Yes, through income tax. For ${EN.eur(2500)} a month as a liberal professional, a single person needs ${EN.eur(caConsult)}; a couple with no other income ${EN.eur(consultCouple)}, thanks to the quotient familial, the French system that divides household income by a number of shares. With the flat-rate income tax at ${EN.pct(P.micro.vl.bnc)}, the target becomes ${EN.eur(consultVL)}. The mini-calculator assumes a single person.` },
    ],
    body: (h) => `
<h2>Start from the income you need</h2>
<p>Most guides start with the paperwork. It is quick and it is covered on ${h.a('creer-micro-entreprise', 'registering a micro-enterprise')}. The more useful question comes first: how much must come in for the business to support you. You start from the monthly amount you want to keep, then work back to turnover, allowing for social contributions, the training levy, any chamber levy and French income tax.</p>
<p>The table below runs that calculation through the site’s engine for a single person with no other income, no business costs, no Acre relief and income tax on the progressive scale after the flat allowance (${h.src('spMicroImposition', 'service-public, sheet F23267')}).</p>
${h.table(['Monthly target', 'Selling goods', 'Commercial services', 'Liberal profession', 'VAT, liberal'], grille.map((g) => [h.eur(g.n), h.eur(g.vente), h.eur(g.bic), h.eur(g.bnc), tvaTxt(g.bnc, 'en')]), 'Yearly turnover a micro-entrepreneur must receive for a monthly take-home target, single person, 2026', ['l', 'r', 'r', 'r', 'l'])}
<p>Three things stand out. Sales need the least turnover for the same take-home, because the contribution rate is the lowest and the tax allowance the highest, ${h.pct(P.micro.abattement.vente, 0)}. But that turnover includes the cost of the goods you resell, so add your stock purchases. The gap between commercial services and liberal professions widens as the target rises. And beyond roughly ${h.eur(2000)} a month as a liberal professional, the target crosses the VAT thresholds.</p>

<h2>Three profiles, three targets</h2>
<h3>A consultant aiming for ${h.eur(2500)} a month</h3>
<p>She must receive ${h.eur(caConsult)} over the year. Of that, ${h.eur(consult.cotisations)} goes in contributions, ${h.eur(consult.cfp)} in training levy and ${h.eur(consult.ir)} in income tax. That level is above the higher services VAT threshold, ${h.eur(P.tva.services.majore)} (${h.src('spFranchiseTva', 'service-public, sheet F21746')}), so she will charge VAT on top of her prices. She will need an EU VAT number and must track the VAT she collects and the VAT she can deduct. To turn the target into billable days, see ${h.a('tjm-freelance', 'the day-rate calculator')}.</p>
<h3>A repair technician with running costs</h3>
<p>He provides commercial services and wants ${h.eur(2000)} a month. Without costs, ${h.eur(caDep)} would do. With ${h.eur(fraisDep)} of yearly spending on a van, tools and phone, he needs ${h.eur(caDepFrais)}, because the micro scheme ignores those costs: he pays ${h.eur(dep.cotisations)} of contributions on the whole amount. That is the moment to look at ${h.a('micro-ou-reel', 'micro versus real profit')}.</p>
<h3>A couple where only one partner starts out</h3>
<p>French income tax is assessed on the household. For ${h.eur(2500)} a month as a liberal professional, a couple with no other income needs only ${h.eur(consultCouple)}, against ${h.eur(caConsult)} for a single person. If the partner already earns a salary, the business income is taxed at a higher marginal rate than in this example: the full calculator accepts that other income. The versement libératoire, a flat-rate income tax of ${h.pct(P.micro.vl.bnc)} of turnover for liberal professions, lifts the single person’s target to ${h.eur(consultVL)}: at this level it does not pay off.</p>

<h2>The thresholds around your plan</h2>
<p>The micro scheme accepts up to ${h.eur(P.micro.plafonds.services)} of turnover for services and ${h.eur(P.micro.plafonds.vente)} for sales (${h.src('spPlafonds', 'service-public, sheet F32353')}). At the top, a single liberal professional keeps about ${h.eur(maxBnc.netMensuel)} a month. If you aim higher, the micro scheme is probably not the right frame; ${h.a('micro-entreprise', 'the micro-enterprise page')} sets out the limits. The ceiling is not a cliff edge: one year above it is tolerated, and only the second consecutive year takes you out.</p>
<p>VAT exemption ends much earlier for service providers: ${h.eur(P.tva.services.seuil)}, with leeway up to ${h.eur(P.tva.services.majore)}. For sales it is ${h.eur(P.tva.vente.seuil)} and ${h.eur(P.tva.vente.majore)}. A single ${h.eur(P.tva.seuil_unique_abandonne)} threshold once planned in the 2025 finance act was dropped. Details are on ${h.a('tva-auto-entrepreneur', 'the VAT threshold page')}.</p>

<h2>What the take-home figure leaves out</h2>
<p>The amounts above are what remains after contributions and income tax. Three items still need a budget. The CFE, the local business tax, which is zero in year one and then depends on your commune. Your actual business costs, which micro never deducts. And months without work: a yearly target assumes steady receipts, although contributions are only due on what you actually receive, which softens the quiet months.</p>
<p>If you keep a salaried job alongside the business, the target works differently because tax is calculated on the whole household: see ${h.a('auto-entrepreneur-salarie', 'running a side business with a job')}.</p>

<h2>Before you register</h2>
<p>Check which category your activity falls into, since it sets your rate (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). See whether you qualify for Acre, the start-up relief on contributions, which must now be requested within ${h.num(P.micro.acre.delai_demande_jours)} days of starting. Then test your own target in the mini-calculator at the top of the page and in the full calculator. Results are estimates; the Urssaf and the tax office set the real amounts.</p>`,
  },
});
