import { defineGuide } from '../../lib/guide-types';
import { micro } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Trois profils calculés par le moteur (personne seule, sans autre revenu, avant CFE).
const marche = micro({ ca: 55000, activite: 'vente' });
const velo = micro({ ca: 32000, activite: 'bic', artisan: true });
const trad = micro({ ca: 42000, activite: 'bnc' });
const pf = P.micro.plafonds;
const ab = P.micro.abattement;
const hb = P.micro.historique_bnc;
const preleve = (m: ReturnType<typeof micro>) => m.cotisations + m.cfp + m.tfc;

export default defineGuide({
  id: 'micro-entreprise',
  group: 'micro',
  order: 20,
  mini: 'netMicro',
  related: ['charges-auto-entrepreneur', 'plafond-micro-entreprise', 'tva-auto-entrepreneur', 'impot-auto-entrepreneur', 'micro-ou-reel', 'creer-micro-entreprise'],
  sources: ['aeEssentiel', 'spCotisationsMicro', 'spPlafonds', 'spMicroImposition'],
  fr: {
    slug: 'micro-entreprise',
    nav: 'La micro-entreprise',
    card: 'Le régime en clair : deux volets simplifiés, ses limites et le net qu’il laisse.',
    title: 'Micro-entreprise 2026 : règles du régime et revenu net réel',
    description: 'Micro-entreprise 2026 : de 12,3 % à 25,6 % du chiffre d’affaires en cotisations, plafond de 83 600 € en services, impôt après abattement. Le régime chiffré.',
    h1: 'La micro-entreprise : comment fonctionne le régime et ce qu’il laisse',
    intro: 'Une entreprise individuelle allégée où presque tout se déduit de ce que vous encaissez.',
    resume: `En 2026, un micro-entrepreneur reverse à l’Urssaf entre ${FR.pct(P.micro.taux.vente)} et ${FR.pct(P.micro.taux.bnc)} de son chiffre d’affaires encaissé, selon qu’il vend des marchandises ou exerce une activité libérale, puis il paie l’impôt sur le revenu sur une base réduite par un abattement forfaitaire de ${FR.pct(ab.bnc, 0)} à ${FR.pct(ab.vente, 0)}. La micro-entreprise, que tout le monde appelle encore auto-entreprise, est une entreprise individuelle qui combine deux régimes simplifiés : le micro-social pour les cotisations et le micro-fiscal pour l’impôt. Elle reste accessible tant que les recettes annuelles ne dépassent pas ${FR.eur(pf.vente)} en vente ou ${FR.eur(pf.services)} en prestations de services. Une traductrice qui encaisse ${FR.eur(42000)} en 2026 verse ${FR.eur(trad.cotisations)} de cotisations et ${FR.eur(trad.ir)} d’impôt si elle vit seule sans autre revenu ; elle garde ${FR.eur(trad.net)}, soit ${FR.eur(trad.netMensuel)} par mois avant la CFE. Les cotisations versées sont définitives, sans rattrapage l’année suivante, et un mois sans recette ne coûte rien.`,
    faqs: [
      { q: 'Micro-entreprise et auto-entreprise, est-ce le même régime ?', a: `Oui. « Auto-entrepreneur » est l’ancien nom, resté dans l’usage et dans l’adresse du portail de l’Urssaf, autoentrepreneur.urssaf.fr ; les textes parlent de micro-entrepreneur. Les règles sont identiques : cotisations proportionnelles au chiffre d’affaires, par exemple ${FR.pct(P.micro.taux.bic)} pour des services commerciaux ou artisanaux en 2026, et plafond annuel de ${FR.eur(pf.services)} pour ces services selon service-public.` },
      { q: 'Combien coûte une micro-entreprise qui n’encaisse rien ?', a: `Rien en cotisations : l’Urssaf calcule tout sur le chiffre d’affaires déclaré, et ${FR.eur(0)} déclaré donne ${FR.eur(0)} à payer. La déclaration reste obligatoire à chaque échéance. Côté CFE, l’année de création est exonérée et, ensuite, une entreprise dont le chiffre d’affaires de l’avant-dernière année ne dépasse pas ${FR.eur(P.cfe.exoneration_ca)} n’en paie pas, d’après service-public.` },
      { q: 'L’Urssaf peut-elle réclamer un complément de cotisations à un micro-entrepreneur l’année suivante ?', a: `Non. En micro-entreprise, les cotisations payées avec chaque déclaration sont définitives : aucune régularisation n’arrive l’année suivante, contrairement à l’entreprise individuelle au réel, où l’Urssaf encaisse des acomptes provisoires puis ajuste. Une traductrice qui déclare ${FR.eur(42000)} sur l’année a donc payé ses ${FR.eur(trad.cotisations)} une fois pour toutes, selon l’Urssaf.` },
      { q: 'Un micro-entrepreneur malade touche-t-il des indemnités journalières ?', a: `Oui : pour la maladie, il est rattaché à la CPAM, la caisse primaire d’assurance maladie. Ses indemnités journalières maladie, maternité ou paternité se calculent sur le chiffre d’affaires après abattement : ${FR.pct(ab.vente, 0)} retirés en vente, ${FR.pct(ab.bic, 0)} en services commerciaux ou artisanaux, ${FR.pct(ab.bnc, 0)} en libéral, selon l’Urssaf. Un petit chiffre d’affaires ouvre donc de petites indemnités.` },
      { q: 'Peut-on cotiser davantage en micro-entreprise pour être mieux couvert ?', a: `Oui, en demandant à l’Urssaf de payer les cotisations minimales des indépendants : la demande se fait avant le 31 décembre pour l’année suivante, ou avant la fin du troisième mois qui suit la création. Le calcul bascule alors sur celui d’un travailleur indépendant classique, selon service-public (fiche F36232). Le simulateur de cette page ne modélise pas cette option.` },
      { q: 'Le taux de la micro-entreprise libérale a-t-il changé depuis 2024 ?', a: `Oui, trois hausses en dix-huit mois. Il était de ${FR.pct(hb.jusqu_a_2024_06)} jusqu’en juin 2024, ${FR.pct(hb.depuis_2024_07)} à partir de juillet 2024, ${FR.pct(hb.y2025)} en 2025 et ${FR.pct(P.micro.taux.bnc)} depuis le 1er janvier 2026, d’après l’Urssaf. Sur ${FR.eur(42000)} encaissés, la différence entre le premier et le dernier taux atteint ${FR.eur(42000 * (P.micro.taux.bnc - hb.jusqu_a_2024_06))} par an.` },
    ],
    body: (h) => `
<h2>Un statut, deux régimes simplifiés</h2>
<p>Le mot « micro-entreprise » recouvre deux mécanismes distincts que l’on confond souvent. Le <strong>micro-social</strong> fixe les cotisations : un pourcentage du chiffre d’affaires encaissé, payé à chaque déclaration, sans calcul de bénéfice (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). Le <strong>micro-fiscal</strong> fixe l’impôt : l’administration retire un abattement forfaitaire censé représenter vos frais, et le reste rejoint vos autres revenus au barème (${h.src('spMicroImposition', 'service-public, fiche F23267')}). Les deux tiennent ensemble tant que vous restez sous le plafond de recettes ; si vous le dépassez deux années de suite, vous sortez de l’un comme de l’autre.</p>
<p>Juridiquement, le micro-entrepreneur n’a pas de société : il exerce en entreprise individuelle, en son nom propre. Toute la mécanique repose sur un seul chiffre, les recettes encaissées, ce qui explique le succès du régime chez ceux qui démarrent seuls et veulent savoir d’avance ce qu’ils devront.</p>
${h.table(['Activité', 'Cotisations', 'Abattement fiscal', 'Plafond de recettes', 'Franchise de TVA jusqu’à'], [
  ['Vente de marchandises, hébergement', h.pct(P.micro.taux.vente), h.pct(ab.vente, 0), h.eur(pf.vente), h.eur(P.tva.vente.seuil)],
  ['Services commerciaux ou artisanaux (BIC)', h.pct(P.micro.taux.bic), h.pct(ab.bic, 0), h.eur(pf.services), h.eur(P.tva.services.seuil)],
  ['Libéral non réglementé (BNC)', h.pct(P.micro.taux.bnc), h.pct(ab.bnc, 0), h.eur(pf.services), h.eur(P.tva.services.seuil)],
  ['Libéral affilié à la Cipav', h.pct(P.micro.taux.cipav), h.pct(ab.bnc, 0), h.eur(pf.services), h.eur(P.tva.services.seuil)],
], 'Les quatre paramètres qui gouvernent une micro-entreprise en 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Le plafond de recettes et le seuil de franchise de TVA n’ont rien à voir : entre ${h.eur(P.tva.services.seuil)} et ${h.eur(pf.services)}, un prestataire reste micro-entrepreneur mais facture la TVA. La page ${h.a('tva-auto-entrepreneur', 'TVA de l’auto-entrepreneur')} détaille cette zone intermédiaire, et ${h.a('plafond-micro-entreprise', 'le plafond de la micro-entreprise')} explique quand on en sort.</p>

<h2>Ce qu’il reste sur trois profils</h2>
<p>Le moteur du site applique les taux 2026 de l’Urssaf, la contribution à la formation professionnelle, la taxe de chambre quand elle existe et l’impôt d’une personne seule sans autre revenu. La CFE, qui dépend de la commune, n’est pas comptée.</p>
${h.table(['Profil', 'Chiffre d’affaires', 'Prélèvements sociaux', 'Impôt', 'Net annuel', 'Net mensuel'], [
  ['Vendeuse sur les marchés (vente)', h.eur(55000), h.eur(preleve(marche)), h.eur(marche.ir), h.eur(marche.net), h.eur(marche.netMensuel)],
  ['Réparateur de vélos (artisan)', h.eur(32000), h.eur(preleve(velo)), h.eur(velo.ir), h.eur(velo.net), h.eur(velo.netMensuel)],
  ['Traductrice (libéral BNC)', h.eur(42000), h.eur(preleve(trad)), h.eur(trad.ir), h.eur(trad.net), h.eur(trad.netMensuel)],
], 'Net d’un micro-entrepreneur en 2026 selon l’activité, avant CFE et avant frais professionnels', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>La vendeuse paraît la mieux lotie, avec ${h.eur(marche.netMensuel)} par mois. C’est un mirage partiel : ses ${h.eur(55000)} de ventes contiennent le prix d’achat de ce qu’elle revend, que le tableau ne retire pas. Le réparateur, lui, ne paie aucun impôt sur ${h.eur(velo.revenuAbattu)} de revenu imposable grâce à la décote, mais ses pièces détachées sortent aussi de sa poche. La traductrice n’a presque pas de frais, et c’est elle qui supporte le taux le plus lourd, ${h.pct(P.micro.taux.bnc)}.</p>
<p>Ces trois cas montrent la logique du régime : il est d’autant plus avantageux que les dépenses réelles sont faibles. Dès que les achats ou la sous-traitance pèsent lourd, la comparaison avec ${h.a('micro-ou-reel', 'le régime réel')} s’impose.</p>

<h2>Ce que le régime ne fait pas pour vous</h2>
<p>Il ne déduit aucune dépense des cotisations : un ordinateur, un loyer de bureau ou un déplacement chez un client ne réduisent pas ce que vous versez à l’Urssaf. Côté impôt, l’abattement est le même que vous ayez dépensé beaucoup ou rien du tout ; il ne dépasse jamais le chiffre d’affaires et ne descend pas sous ${h.eur(ab.minimum)}.</p>
<p>Il ne supprime pas non plus la ${h.a('cfe-auto-entrepreneur', 'cotisation foncière des entreprises')}, due même à domicile à partir de la deuxième année, ni l’impôt sur le revenu, que l’on paie au barème du foyer ou, sous condition de revenus, par ${h.a('versement-liberatoire', 'versement libératoire')}. Quant à l’Acre, l’allègement de début d’activité, elle n’est plus automatique depuis 2026 : la demande se fait dans les ${h.num(P.micro.acre.delai_demande_jours)} jours suivant le démarrage (${h.a('acre-auto-entrepreneur', 'détail de l’Acre')}).</p>

<h2>Déclarer et payer au fil de l’eau</h2>
<p>Chaque mois ou chaque trimestre, selon l’option choisie, vous déclarez en ligne le chiffre d’affaires encaissé sur la période, sur autoentrepreneur.urssaf.fr ou dans l’application de l’Urssaf, et vous payez dans la foulée (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}). Une fois par an, vous reportez ce même chiffre d’affaires brut sur la déclaration de revenus. Les échéances précises sont sur ${h.a('declarer-chiffre-affaires', 'déclarer son chiffre d’affaires')}.</p>
<p>Ce rythme a un avantage rarement souligné : la trésorerie suit l’activité. Un trimestre creux coûte peu, un trimestre faste coûte davantage, et rien ne vient s’ajouter dix-huit mois plus tard.</p>

<h2>Quand le régime cesse de convenir</h2>
<p>Trois signaux doivent faire réfléchir. Des frais réels qui dépassent nettement l’abattement fiscal. Un chiffre d’affaires qui approche ${h.eur(pf.services)} en services, au-delà duquel la sortie se prépare (${h.src('spPlafonds', 'service-public, fiche F32353')}). Un besoin d’associés ou de séparer nettement patrimoine privé et professionnel, que seule une société organise : la ${h.a('micro-ou-sasu', 'comparaison micro-entreprise ou SASU')} chiffre cet arbitrage. On peut aussi opter pour un régime réel sans attendre d’y être contraint.</p>
<p>Les montants de cette page sont des estimations établies avec les barèmes 2026 publiés ; ils ne remplacent pas un conseil personnalisé, et seuls l’Urssaf et le service des impôts arrêtent ce que vous devez.</p>`,
  },
  en: {
    slug: 'micro-enterprise-scheme',
    nav: 'The micro-enterprise scheme',
    card: 'How France’s simplest self-employed scheme works, its limits and what you keep.',
    title: 'Micro-enterprise scheme 2026 in France: rules and take-home',
    description: 'France’s micro-enterprise scheme in 2026: contributions of 12.3% to 25.6% of turnover, a €83,600 ceiling for services, income tax after a flat allowance.',
    h1: 'The French micro-enterprise scheme: how it works and what it leaves you',
    intro: 'A light form of sole trading where almost everything is worked out from the money you receive.',
    resume: `In 2026 a French micro-entrepreneur hands the Urssaf, the agency that collects social contributions, between ${EN.pct(P.micro.taux.vente)} and ${EN.pct(P.micro.taux.bnc)} of the turnover actually received, depending on whether they sell goods or work as a freelance professional. Income tax then applies to that turnover after a flat allowance of ${EN.pct(ab.bnc, 0)} to ${EN.pct(ab.vente, 0)}, which stands in for business expenses. The micro-enterprise, still widely called auto-entreprise, is not a company: it is a sole-trader business run in your own name under two simplified regimes, micro-social for contributions and micro-fiscal for tax. You can use it as long as yearly receipts stay below ${EN.eur(pf.vente)} for sales or ${EN.eur(pf.services)} for services. A translator receiving ${EN.eur(42000)} in 2026 pays ${EN.eur(trad.cotisations)} of contributions and ${EN.eur(trad.ir)} of income tax as a single person with no other income, keeping ${EN.eur(trad.net)}, or ${EN.eur(trad.netMensuel)} a month before CFE local business tax. Contributions are final, and a month with no income costs nothing.`,
    faqs: [
      { q: 'Is auto-entrepreneur the same thing as micro-entrepreneur in France?', a: `Yes. Auto-entrepreneur is the original name, still used in everyday French and in the address of the Urssaf portal, autoentrepreneur.urssaf.fr; official texts now say micro-entrepreneur. The rules are the same: contributions as a share of turnover, for example ${EN.pct(P.micro.taux.bic)} for commercial or craft services in 2026, and a yearly ceiling of ${EN.eur(pf.services)} for services, according to service-public.` },
      { q: 'Can I keep a French micro-enterprise open with no clients for a while?', a: `Yes, and it costs nothing in contributions: the Urssaf works everything out from declared turnover, so ${EN.eur(0)} declared means ${EN.eur(0)} to pay. You must still file each monthly or quarterly return. CFE, the local business tax, is waived in the year you start and later whenever turnover two years earlier was no more than ${EN.eur(P.cfe.exoneration_ca)}, according to service-public.` },
      { q: 'Will the Urssaf send me a catch-up bill for my micro-enterprise contributions?', a: `No. Under the micro scheme, the contributions you pay with each return are final, with no adjustment the following year. That is a real difference from the standard self-employed regime (real profit), where the Urssaf collects provisional instalments and then corrects them once your income is known. A translator who declares ${EN.eur(42000)} over the year has settled ${EN.eur(trad.cotisations)} for good.` },
      { q: 'Does a micro-entrepreneur get French sick pay when ill?', a: `Yes. You are attached to the CPAM, the local health insurance office. Daily sickness, maternity and paternity allowances are based on turnover after the flat allowance: ${EN.pct(ab.vente, 0)} is removed for sales, ${EN.pct(ab.bic, 0)} for commercial or craft services and ${EN.pct(ab.bnc, 0)} for freelance professions, according to the Urssaf. Low turnover therefore means low allowances.` },
      { q: 'Can a micro-entrepreneur choose to pay more to build better social cover?', a: `Yes, by asking the Urssaf to apply the minimum contributions of the standard self-employed regime. The request must reach the Urssaf before 31 December for the next year, or before the end of the third month after you start. Your contributions are then calculated as for a classic self-employed worker, according to service-public (sheet F36232). The calculator on this page does not model that option.` },
      { q: 'Why did my freelance contribution rate go up after 2024?', a: `Because the rate for unregulated freelance professions was raised in steps: ${EN.pct(hb.jusqu_a_2024_06)} until June 2024, ${EN.pct(hb.depuis_2024_07)} from July 2024, ${EN.pct(hb.y2025)} in 2025 and ${EN.pct(P.micro.taux.bnc)} from 1 January 2026, according to the Urssaf. If you read an older guide before moving, the gap on ${EN.eur(42000)} of turnover is ${EN.eur(42000 * (P.micro.taux.bnc - hb.jusqu_a_2024_06))} a year.` },
    ],
    body: (h) => `
<h2>One status, two simplified regimes</h2>
<p>People arriving in France often hear “micro-enterprise” as if it were a type of company. It is closer to a tax and social security setting for a sole trader. The <strong>micro-social</strong> side decides your contributions: a fixed share of the turnover you receive, paid with each return, with no profit calculation (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). The <strong>micro-fiscal</strong> side decides your income tax: the tax office removes a flat allowance meant to cover your expenses and adds the rest to your household income on the progressive scale (${h.src('spMicroImposition', 'service-public, sheet F23267')}). Both stay in place while your receipts remain under the ceiling; exceed it two years running and you leave both.</p>
<p>You trade as an entreprise individuelle (sole trader), in your own name, with no company and no share capital. Everything hangs on one figure, the money you actually receive, which is why so many newcomers start here before deciding whether a company makes sense.</p>
${h.table(['Activity', 'Contributions', 'Tax allowance', 'Turnover ceiling', 'No VAT up to'], [
  ['Selling goods, accommodation', h.pct(P.micro.taux.vente), h.pct(ab.vente, 0), h.eur(pf.vente), h.eur(P.tva.vente.seuil)],
  ['Commercial or craft services (BIC)', h.pct(P.micro.taux.bic), h.pct(ab.bic, 0), h.eur(pf.services), h.eur(P.tva.services.seuil)],
  ['Unregulated freelance (BNC)', h.pct(P.micro.taux.bnc), h.pct(ab.bnc, 0), h.eur(pf.services), h.eur(P.tva.services.seuil)],
  ['Freelance under the Cipav fund', h.pct(P.micro.taux.cipav), h.pct(ab.bnc, 0), h.eur(pf.services), h.eur(P.tva.services.seuil)],
], 'The four settings that drive a French micro-enterprise in 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>BIC and BNC are French tax categories: BIC covers commercial and craft income, BNC covers non-commercial professional income such as consulting, design or translation. Note that the turnover ceiling and the VAT exemption limit are two separate numbers. Between ${h.eur(P.tva.services.seuil)} and ${h.eur(pf.services)} a service provider remains a micro-entrepreneur but has to charge VAT: see ${h.a('tva-auto-entrepreneur', 'the VAT exemption threshold')} and ${h.a('plafond-micro-entreprise', 'the turnover ceiling')}.</p>

<h2>Three people, three results</h2>
<p>The site’s engine applies the 2026 Urssaf rates, the training levy, the chamber levy where one applies and the income tax of a single person with no other income. CFE is left out because it depends on the commune (municipality) where you are based.</p>
${h.table(['Profile', 'Turnover', 'Social levies', 'Income tax', 'Net per year', 'Net per month'], [
  ['Market stallholder (goods)', h.eur(55000), h.eur(preleve(marche)), h.eur(marche.ir), h.eur(marche.net), h.eur(marche.netMensuel)],
  ['Bicycle repairer (craft)', h.eur(32000), h.eur(preleve(velo)), h.eur(velo.ir), h.eur(velo.net), h.eur(velo.netMensuel)],
  ['Translator (freelance BNC)', h.eur(42000), h.eur(preleve(trad)), h.eur(trad.ir), h.eur(trad.net), h.eur(trad.netMensuel)],
], 'Take-home of a French micro-entrepreneur in 2026 by activity, before CFE and business costs', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The stallholder seems to do best at ${h.eur(marche.netMensuel)} a month, but her ${h.eur(55000)} of sales include what she paid for the stock, which the table does not remove. The bicycle repairer owes no income tax on ${h.eur(velo.revenuAbattu)} of taxable income thanks to the French low-income discount (décote), yet his spare parts come out of his own pocket too. The translator has almost no costs and carries the heaviest rate, ${h.pct(P.micro.taux.bnc)}.</p>
<p>The pattern is clear: the scheme rewards low real expenses. If purchases or subcontracting are a big part of your turnover, run the numbers on ${h.a('micro-ou-reel', 'micro versus real profit')} before you register.</p>

<h2>What the scheme will not do</h2>
<p>It never deducts costs from contributions. A laptop, office rent or a train ticket to a client leaves your Urssaf bill unchanged. For income tax the allowance is the same whether you spent a lot or nothing, it cannot exceed your turnover and it never falls below ${h.eur(ab.minimum)}.</p>
<p>Nor does it remove the ${h.a('cfe-auto-entrepreneur', 'CFE local business tax')}, owed even when you work from home from the second year, or income tax, paid either on the household scale or, if your income qualifies, through the ${h.a('versement-liberatoire', 'flat-rate option known as versement libératoire')}. Start-up relief (Acre) is no longer automatic in 2026: you must apply within ${h.num(P.micro.acre.delai_demande_jours)} days of starting, as explained on ${h.a('acre-auto-entrepreneur', 'the Acre page')}.</p>

<h2>Paying as you earn</h2>
<p>Every month or every quarter, as you choose, you declare online the turnover received in the period, on autoentrepreneur.urssaf.fr or in the Urssaf app, and pay at the same time (${h.src('spCotisationsMicro', 'service-public, sheet F36232')}). Once a year the same gross figure goes on your French income tax return. Deadlines are listed on ${h.a('declarer-chiffre-affaires', 'declaring your turnover')}.</p>
<p>For someone used to an annual self-assessment system, this rhythm takes some getting used to, but cash flow follows activity: a quiet quarter costs little and nothing lands eighteen months later.</p>

<h2>Signs you have outgrown it</h2>
<p>Real expenses well above the flat tax allowance. Turnover heading towards ${h.eur(pf.services)} for services, the point where you start planning an exit (${h.src('spPlafonds', 'service-public, sheet F32353')}). A wish to bring in partners or to wall off personal assets, which only a company organises: the ${h.a('micro-ou-sasu', 'micro-enterprise or SASU comparison')} puts figures on that choice. You may also opt for a real-profit regime voluntarily.</p>
<p>Figures on this page are estimates built on the published 2026 rules, not personal advice; the Urssaf and the French tax office set the amounts you actually owe.</p>`,
  },
});
