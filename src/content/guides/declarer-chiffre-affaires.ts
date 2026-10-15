import { defineGuide } from '../../lib/guide-types';
import { micro, revenuAbattu, type Activite } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Montants dus pour 10 000 € déclarés sur une période, par activité (moteur).
const DECL = 10000;
const ACTS: Array<{ k: string; a: Activite; artisan?: boolean; fr: string; en: string }> = [
  { k: 'vente', a: 'vente', fr: 'Vente de marchandises', en: 'Selling goods' },
  { k: 'bic', a: 'bic', fr: 'Services commerciaux (BIC)', en: 'Commercial services (BIC)' },
  { k: 'art', a: 'bic', artisan: true, fr: 'Artisanat (BIC)', en: 'Skilled trade (BIC)' },
  { k: 'bnc', a: 'bnc', fr: 'Profession libérale (BNC)', en: 'Liberal profession (BNC)' },
  { k: 'cipav', a: 'cipav', fr: 'Libéral relevant de la Cipav', en: 'Cipav profession' },
];
const parAct = ACTS.map((x) => {
  const m = micro({ ca: DECL, activite: x.a, artisan: x.artisan, vl: true });
  return { ...x, cot: m.cotisations, taxes: m.cfp + m.tfc, vl: m.vl, total: m.cotisations + m.cfp + m.tfc + m.vl };
});
// Une traductrice en libéral : 2 700 € par mois, ou 8 100 € par trimestre.
const mois = micro({ ca: 2700, activite: 'bnc' });
const trim = micro({ ca: 8100, activite: 'bnc' });
const trimAcre = micro({ ca: 8100, activite: 'bnc', acre: 'depuis' });
const pay = (m: ReturnType<typeof micro>) => m.cotisations + m.cfp + m.tfc + m.vl;
// Déclaration annuelle de revenus : même traductrice, 32 400 € sur l'année.
const annuel = 32400;
const ab = revenuAbattu(annuel, 'bnc');
const petit = revenuAbattu(600, 'bnc');

export default defineGuide({
  id: 'declarer-chiffre-affaires',
  group: 'creation',
  order: 30,
  mini: 'declaration',
  related: ['charges-auto-entrepreneur', 'creer-micro-entreprise', 'impot-auto-entrepreneur', 'versement-liberatoire', 'cfe-auto-entrepreneur'],
  sources: ['aeEssentiel', 'spCotisationsMicro', 'spMicroImposition', 'impotsVL', 'spCfe'],
  fr: {
    slug: 'declarer-chiffre-d-affaires',
    nav: 'Déclarer son chiffre d’affaires',
    card: 'Déclaration à l’Urssaf chaque mois ou trimestre, puis déclaration de revenus une fois par an.',
    title: 'Déclarer son chiffre d’affaires en 2026 : Urssaf et impôts',
    description: 'Déclarer son chiffre d’affaires d’auto-entrepreneur en 2026 : 10 000 € déclarés en libéral coûtent 2 800 € avec le versement libératoire. Urssaf et 2042-C-PRO.',
    h1: 'Déclarer son chiffre d’affaires d’auto-entrepreneur : les deux déclarations',
    intro: 'Une déclaration courte et fréquente à l’Urssaf, une ligne par an sur la déclaration de revenus : voici ce que chacune demande et coûte.',
    resume: `Un auto-entrepreneur déclare son chiffre d’affaires deux fois, à deux administrations. À l’Urssaf, chaque mois ou chaque trimestre selon l’option choisie, il déclare en ligne les sommes encaissées sur la période et paie aussitôt les cotisations correspondantes : pour ${FR.eur(DECL)} déclarés en profession libérale en 2026, ${FR.eur(parAct[3].cot)} de cotisations au taux de ${FR.pct(P.micro.taux.bnc)}, plus ${FR.eur(parAct[3].taxes)} de contribution à la formation, et ${FR.eur(parAct[3].vl)} de plus avec le versement libératoire, soit ${FR.eur(parAct[3].total)}. La première déclaration intervient au plus tôt quatre-vingt-dix jours après le début d’activité. Une période sans encaissement se déclare quand même, à zéro, sans rien payer. Une fois par an, le chiffre d’affaires brut de l’année se reporte ensuite sur la déclaration de revenus, formulaire 2042-C-PRO, sans déduire aucune charge : l’administration applique elle-même l’abattement, ${FR.pct(P.micro.abattement.bnc, 0)} en libéral. Ces montants sont des estimations ; l’Urssaf et le service des impôts arrêtent les sommes dues.`,
    faqs: [
      { q: 'Faut-il faire une déclaration Urssaf quand on n’a rien encaissé ce trimestre ?', a: `Oui. La déclaration reste obligatoire même sans chiffre d’affaires : vous saisissez zéro et rien n’est prélevé, puisque les cotisations du micro-entrepreneur sont proportionnelles aux encaissements. C’est ce que rappelle l’Urssaf sur son portail des auto-entrepreneurs. Avec ${FR.eur(0)} déclarés, le versement libératoire est lui aussi nul, quel que soit votre taux de ${FR.pct(P.micro.vl.vente)} à ${FR.pct(P.micro.vl.bnc)}.` },
      { q: 'Vaut-il mieux déclarer son chiffre d’affaires au mois ou au trimestre ?', a: `Le montant total payé est le même : ${FR.eur(pay(mois) * 3)} sur trois mois pour une traductrice qui encaisse ${FR.eur(2700)} par mois, que ce soit en trois fois ou en une. Seul le rythme change. Le mensuel lisse les sorties de trésorerie ; le trimestriel réduit le nombre de déclarations à quatre par an. Les cotisations sont définitives dans les deux cas, sans régularisation l’année suivante.` },
      { q: 'Où reporter le chiffre d’affaires de micro-entrepreneur sur la déclaration de revenus ?', a: `Sur la déclaration complémentaire 2042-C-PRO, dans la rubrique de votre catégorie, pour son montant brut de l’année, sans déduire de charges. L’attestation fiscale qui récapitule ce total est disponible en février dans votre espace Urssaf. L’administration applique ensuite l’abattement : ${FR.pct(P.micro.abattement.bnc, 0)} en libéral, ${FR.pct(P.micro.abattement.bic, 0)} en services commerciaux, ${FR.pct(P.micro.abattement.vente, 0)} en vente, au moins ${FR.eur(P.micro.abattement.minimum)}.` },
      { q: 'Avec le versement libératoire, doit-on encore déclarer son chiffre d’affaires aux impôts ?', a: `Oui. L’impôt est déjà payé avec les cotisations, à ${FR.pct(P.micro.vl.bnc)} du chiffre d’affaires en libéral, mais le montant se déclare quand même sur la 2042-C-PRO. Il sert à calculer le taux applicable aux autres revenus du foyer et le revenu fiscal de référence. Pensez aussi à supprimer l’acompte de prélèvement à la source sur cette activité dans votre espace particulier, selon impots.gouv.fr.` },
      { q: 'Comment l’Acre apparaît-elle dans les déclarations trimestrielles ?', a: `Vous n’avez rien à calculer : une fois la demande acceptée, l’Urssaf applique le taux minoré à vos déclarations jusqu’à la fin du troisième trimestre civil qui suit le début d’activité. Pour ${FR.eur(8100)} déclarés en libéral sur un trimestre, les cotisations passent de ${FR.eur(trim.cotisations)} à ${FR.eur(trimAcre.cotisations)} au taux de ${FR.pct(P.micro.acre.taux_acre_depuis.bnc)}, applicable aux activités commencées depuis le 1er juillet 2026.` },
      { q: 'La CFE se règle-t-elle avec la déclaration de chiffre d’affaires ?', a: `Non. La cotisation foncière des entreprises ne passe pas par l’Urssaf. Son avis est mis à disposition dans votre espace professionnel du site impots.gouv.fr, et le paiement intervient en général au plus tard le 15 décembre, en ligne ou par prélèvement. Elle n’est pas due l’année de création, et vous en êtes exonéré si le chiffre d’affaires de l’avant-dernière année ne dépasse pas ${FR.eur(P.cfe.exoneration_ca)}.` },
    ],
    body: (h) => `
<h2>Deux déclarations, deux rythmes</h2>
<p>Le micro-entrepreneur ne tient pas de comptabilité de bénéfice, mais il déclare. D’un côté, à l’Urssaf, une déclaration périodique qui déclenche le paiement des cotisations sociales, de la contribution à la formation, de la taxe de chambre éventuelle et, si vous l’avez choisi, du versement libératoire de l’impôt (${h.src('aeEssentiel', 'Urssaf, l’essentiel du statut')}). De l’autre, aux impôts, une ligne annuelle sur la déclaration de revenus du foyer. Les deux portent sur le même chiffre d’affaires encaissé ; elles n’ont pas le même but.</p>

<h2>La déclaration à l’Urssaf, pas à pas</h2>
<p>Elle se fait en ligne, sur le portail des auto-entrepreneurs de l’Urssaf ou son application mobile, chaque mois ou chaque trimestre selon le rythme retenu (${h.src('spCotisationsMicro', 'service-public, fiche F36232')}). On saisit le total encaissé sur la période, réparti par catégorie si l’activité est mixte, et le montant à payer s’affiche aussitôt. Quelques repères :</p>
<ul>
<li>La première déclaration ne peut pas intervenir avant quatre-vingt-dix jours d’activité.</li>
<li>Une période sans encaissement se déclare à zéro : aucune somme n’est due, mais l’absence de déclaration n’est pas une option.</li>
<li>Les cotisations calculées sont définitives : il n’y a ni appel provisoire ni régularisation l’année suivante, ce qui distingue ce régime de celui des ${h.a('cotisations-tns', 'indépendants au réel')}.</li>
</ul>
<p>Le tableau ci-dessous donne, pour ${h.eur(DECL)} déclarés sur une période, ce que chaque catégorie paie, versement libératoire compris.</p>
${h.table(['Activité', 'Cotisations', 'CFP et taxe de chambre', 'Versement libératoire', 'Total à payer'], parAct.map((x) => [x.fr, h.eur(x.cot), h.eur(x.taxes), h.eur(x.vl), h.eur(x.total)]), `Montants payés à l’Urssaf pour ${h.eur(DECL)} de chiffre d’affaires déclaré en 2026, avec versement libératoire, sans Acre`, ['l', 'r', 'r', 'r', 'r'])}
<p>Sans versement libératoire, retirez la colonne correspondante : l’impôt sera calculé l’année suivante, au barème, sur la déclaration de revenus.</p>

<h2>Mensuel ou trimestriel : un exemple</h2>
<p>Une traductrice libérale encaisse régulièrement ${h.eur(2700)} par mois. En déclaration mensuelle, elle paie ${h.eur(pay(mois))} chaque mois ; en trimestrielle, ${h.eur(pay(trim))} pour ${h.eur(8100)} déclarés. Le coût est identique, seul le calendrier diffère. Un rythme mensuel convient à qui préfère ne jamais voir s’accumuler une grosse échéance ; un rythme trimestriel, à qui veut limiter les formalités. Si elle bénéficie de l’Acre, l’Urssaf applique d’elle-même le taux réduit de ${h.pct(P.micro.acre.taux_acre_depuis.bnc)} : ${h.eur(trimAcre.cotisations)} de cotisations pour le même trimestre, au lieu de ${h.eur(trim.cotisations)}.</p>
<p>Le mini-simulateur en haut de page fait ce calcul pour votre propre montant et votre catégorie. Pour l’année entière, avec l’impôt et la CFE, utilisez le ${h.a('home', 'simulateur complet')}.</p>

<h2>La déclaration de revenus : une ligne, mais la bonne</h2>
<p>Chaque année, le chiffre d’affaires brut de l’année précédente se reporte sur la déclaration complémentaire 2042-C-PRO, dans la case de votre catégorie (${h.src('spMicroImposition', 'service-public, fiche F23267')}). On n’y retire ni frais ni cotisations : c’est l’administration qui applique l’abattement forfaitaire. L’Urssaf met à disposition en février une attestation fiscale qui récapitule les montants déclarés dans l’année.</p>
<p>Pour la traductrice, ${h.eur(annuel)} encaissés sur l’année donnent, après l’abattement de ${h.pct(P.micro.abattement.bnc, 0)}, un revenu imposable de ${h.eur(ab.revenu)}. Pour un très petit chiffre d’affaires, l’abattement minimal joue : sur ${h.eur(600)}, il atteint ${h.eur(petit.abattement)} et seuls ${h.eur(petit.revenu)} restent imposables. Le calcul de l’impôt lui-même est sur ${h.a('impot-auto-entrepreneur', 'l’impôt de l’auto-entrepreneur')}.</p>
<h3>Si vous avez opté pour le versement libératoire</h3>
<p>L’impôt est déjà réglé, période après période. La ligne de la 2042-C-PRO reste pourtant obligatoire : le chiffre d’affaires abattu entre dans le revenu fiscal de référence et sert à fixer le taux appliqué aux autres revenus du foyer (${h.src('impotsVL', 'impots.gouv.fr, le versement libératoire')}). Autre réflexe : supprimer, dans l’espace particulier, l’acompte de prélèvement à la source calculé sur cette activité, faute de quoi vous paieriez deux fois. La comparaison avec l’impôt au barème est sur ${h.a('versement-liberatoire', 'versement libératoire')}.</p>

<h2>Ce qui ne passe pas par ces déclarations</h2>
<p>La cotisation foncière des entreprises a son propre circuit. L’avis est déposé dans l’espace professionnel du site impots.gouv.fr et se paie en général au plus tard le 15 décembre, en ligne ou par prélèvement (${h.src('spCfe', 'service-public, fiche F23547')}). Rien n’est dû l’année de la création ; le montant dépend ensuite de la commune, voir ${h.a('cfe-auto-entrepreneur', 'la CFE de l’auto-entrepreneur')}.</p>
<p>Si vous devenez redevable de la TVA, la TVA collectée ne fait pas partie du chiffre d’affaires déclaré à l’Urssaf, qui reste un montant hors taxe ; elle obéit à ses propres obligations auprès du service des impôts des entreprises.</p>

<h2>Les oublis qui coûtent</h2>
<p>Oublier une période vide est inutile : la saisie à zéro reste obligatoire et ne coûte rien. Déclarer en avance une facture non encore payée fait cotiser trop tôt. Reporter sur la 2042-C-PRO un montant net de frais fausse l’impôt, puisque l’abattement est déjà censé couvrir les charges. Et laisser courir l’acompte de prélèvement à la source avec le versement libératoire revient à payer l’impôt deux fois. Ces montants restent des estimations ; l’Urssaf et l’administration fiscale fixent ce qui est réellement dû. Pour la ventilation des taux, voyez ${h.a('charges-auto-entrepreneur', 'les charges de l’auto-entrepreneur')}.</p>`,
  },
  en: {
    slug: 'declaring-turnover',
    nav: 'Declaring your turnover',
    card: 'Monthly or quarterly returns to the Urssaf, then one line a year on your income tax return.',
    title: 'Declaring micro-enterprise turnover in 2026: Urssaf and tax',
    description: 'Declaring micro-enterprise turnover in France in 2026: €10,000 declared as a freelancer costs €2,800 with the flat-rate tax. Urssaf returns and form 2042-C-PRO.',
    h1: 'Declaring your micro-enterprise turnover: the two returns',
    intro: 'A short, frequent return to the Urssaf and one line a year on your tax return: what each asks for and what it costs.',
    resume: `A French micro-entrepreneur declares turnover twice, to two different bodies. To the Urssaf, the agency that collects social contributions, you file online every month or every quarter, depending on your choice, the amounts received during the period, and pay the matching contributions straight away. In 2026, ${EN.eur(DECL)} declared as a liberal profession (independent professional services such as consulting or translation) costs ${EN.eur(parAct[3].cot)} in contributions at ${EN.pct(P.micro.taux.bnc)}, plus ${EN.eur(parAct[3].taxes)} of training levy, and ${EN.eur(parAct[3].vl)} more with the versement libératoire, the optional flat-rate income tax, making ${EN.eur(parAct[3].total)}. The first return comes no earlier than ninety days after you start. A period with no income is still declared, as zero, and costs nothing. Once a year, gross turnover then goes on your household income tax return, form 2042-C-PRO, with no costs deducted: the tax office applies the flat allowance itself, ${EN.pct(P.micro.abattement.bnc, 0)} for liberal professions. These are estimates; the Urssaf and the tax office set the amounts due.`,
    faqs: [
      { q: 'Do I file an Urssaf return for a quarter with no income?', a: `Yes. The return is compulsory even with no turnover: you enter zero and nothing is taken, since micro-entrepreneur contributions are a share of what you receive. The Urssaf says so on its portal for auto-entrepreneurs. With ${EN.eur(0)} declared, the flat-rate income tax is zero too, whatever your rate between ${EN.pct(P.micro.vl.vente)} and ${EN.pct(P.micro.vl.bnc)}.` },
      { q: 'Monthly or quarterly Urssaf returns: which costs less?', a: `Neither. A translator receiving ${EN.eur(2700)} a month pays ${EN.eur(pay(mois) * 3)} over three months whether she files once or three times. Only the timing changes: monthly returns spread the cash outflow, quarterly returns cut the paperwork to four filings a year. In both cases the contributions are final, with no adjustment the following year.` },
      { q: 'Where does micro-enterprise turnover go on the French income tax return?', a: `On the supplementary form 2042-C-PRO, in the box for your category, as the gross amount for the year with no costs deducted. The tax certificate summarising that total is available in February in your Urssaf account. The tax office then applies the allowance: ${EN.pct(P.micro.abattement.bnc, 0)} for liberal professions, ${EN.pct(P.micro.abattement.bic, 0)} for commercial services, ${EN.pct(P.micro.abattement.vente, 0)} for sales, at least ${EN.eur(P.micro.abattement.minimum)}.` },
      { q: 'If I pay the flat-rate tax, must I still report turnover to the tax office?', a: `Yes. The tax is already paid with your contributions, at ${EN.pct(P.micro.vl.bnc)} of turnover for liberal professions, but the amount still goes on form 2042-C-PRO. It is used to set the rate on your household’s other income and your reference income. You should also cancel the withholding-tax instalment on this activity in your personal tax account, according to impots.gouv.fr.` },
      { q: 'How does Acre show up on my quarterly Urssaf returns?', a: `You have nothing to calculate: once your application is accepted, the Urssaf applies the reduced rate to your returns until the end of the third calendar quarter after you started. For ${EN.eur(8100)} declared in a quarter as a liberal profession, contributions fall from ${EN.eur(trim.cotisations)} to ${EN.eur(trimAcre.cotisations)} at ${EN.pct(P.micro.acre.taux_acre_depuis.bnc)}, the rate for businesses started since 1 July 2026.` },
      { q: 'Is the CFE paid through the Urssaf turnover return?', a: `No. The CFE, the local business tax, does not go through the Urssaf. Its notice is posted in your professional account on impots.gouv.fr, the French tax website, and payment is generally due by 15 December, online or by direct debit. It is not charged in the year you start, and you are exempt when turnover two years earlier was ${EN.eur(P.cfe.exoneration_ca)} or less.` },
    ],
    body: (h) => `
<h2>Two returns, two rhythms</h2>
<p>A micro-entrepreneur keeps no profit accounts, but still has to file. On one side there is a periodic return to the Urssaf, which triggers payment of social contributions, the training levy, any chamber levy and, if you chose it, the flat-rate income tax (${h.src('aeEssentiel', 'Urssaf, key facts about the scheme')}). On the other, a yearly line on your household income tax return. Both cover the same turnover received; they serve different purposes. If you come from a country where the self-employed file a single annual return, this split is the first French habit to learn.</p>

<h2>The Urssaf return, step by step</h2>
<p>You file online, on the Urssaf portal for auto-entrepreneurs or its mobile app, monthly or quarterly as you chose (${h.src('spCotisationsMicro', 'service-public, sheet F36232')}). You enter the total received in the period, split by category if your activity is mixed, and the amount due appears at once. A few points to keep in mind:</p>
<ul>
<li>The first return cannot be filed before ninety days of trading.</li>
<li>A period with no income is filed as zero: nothing is owed, but skipping the return is not an option.</li>
<li>The contributions are final: no provisional demand and no adjustment the next year, unlike ${h.a('cotisations-tns', 'self-employed people taxed on real profit')}.</li>
</ul>
<p>The table shows what each category pays for ${h.eur(DECL)} declared in a period, flat-rate income tax included.</p>
${h.table(['Activity', 'Contributions', 'Training and chamber levies', 'Flat-rate income tax', 'Total to pay'], parAct.map((x) => [x.en, h.eur(x.cot), h.eur(x.taxes), h.eur(x.vl), h.eur(x.total)]), `Amounts paid to the Urssaf for ${h.eur(DECL)} of turnover declared in 2026, with the flat-rate income tax, without Acre`, ['l', 'r', 'r', 'r', 'r'])}
<p>Without the flat-rate option, drop that column: income tax is then calculated the following year on the progressive scale, through your income tax return.</p>

<h2>Monthly or quarterly: an example</h2>
<p>A freelance translator receives a steady ${h.eur(2700)} a month. Filing monthly, she pays ${h.eur(pay(mois))} each month; filing quarterly, ${h.eur(pay(trim))} for ${h.eur(8100)} declared. The cost is the same; only the calendar differs. Monthly suits someone who never wants a large bill to build up; quarterly suits someone who wants less admin. If she has Acre, the Urssaf applies the reduced rate of ${h.pct(P.micro.acre.taux_acre_depuis.bnc)} automatically: ${h.eur(trimAcre.cotisations)} of contributions for the same quarter instead of ${h.eur(trim.cotisations)}.</p>
<p>The mini-calculator at the top of the page runs this for your own amount and category. For the whole year, with income tax and CFE, use the ${h.a('home', 'full calculator')}.</p>

<h2>The income tax return: one line, the right one</h2>
<p>Each year, the gross turnover of the previous year goes on the supplementary form 2042-C-PRO, in the box for your category (${h.src('spMicroImposition', 'service-public, sheet F23267')}). You deduct neither costs nor contributions: the tax office applies the flat allowance. In February the Urssaf provides a tax certificate summarising what you declared during the year.</p>
<p>For the translator, ${h.eur(annuel)} received over the year gives, after the ${h.pct(P.micro.abattement.bnc, 0)} allowance, taxable income of ${h.eur(ab.revenu)}. For very small turnover the minimum allowance kicks in: on ${h.eur(600)} it reaches ${h.eur(petit.abattement)}, leaving only ${h.eur(petit.revenu)} taxable. The tax calculation itself is on ${h.a('impot-auto-entrepreneur', 'income tax for micro-entrepreneurs')}.</p>
<h3>If you chose the flat-rate income tax</h3>
<p>The tax is already settled, period by period. The 2042-C-PRO line is still compulsory: turnover after the allowance counts towards your revenu fiscal de référence, the reference income printed on your French tax notice, and it sets the rate applied to the household’s other income (${h.src('impotsVL', 'impots.gouv.fr, the flat-rate payment')}). One more step: in your personal tax account, cancel the prélèvement à la source instalment, France’s pay-as-you-go withholding, calculated on this activity, or you will pay twice. The comparison with scale-based tax is on ${h.a('versement-liberatoire', 'the flat-rate tax page')}.</p>

<h2>What these returns do not cover</h2>
<p>The CFE local business tax has its own channel. The notice is posted in your professional account on impots.gouv.fr and is generally paid by 15 December, online or by direct debit (${h.src('spCfe', 'service-public, sheet F23547')}). Nothing is due in the year you start; after that the amount depends on your commune, see ${h.a('cfe-auto-entrepreneur', 'the CFE page')}.</p>
<p>If you become liable for VAT (TVA), the VAT you collect is not part of the turnover declared to the Urssaf, which stays a before-VAT figure; it follows its own obligations with the SIE, the business tax office.</p>

<h2>Slips that cost money</h2>
<p>Skipping an empty period gains nothing: the zero return is still compulsory and costs nothing. Declaring an invoice before the client has paid makes you contribute too early. Entering a figure net of costs on form 2042-C-PRO distorts your tax, since the allowance is meant to cover costs already. And leaving the withholding instalment running alongside the flat-rate tax means paying income tax twice. These figures are estimates; the Urssaf and the tax office set what is really due. For how the rates break down, see ${h.a('charges-auto-entrepreneur', 'micro-enterprise contributions')}.</p>`,
  },
});
