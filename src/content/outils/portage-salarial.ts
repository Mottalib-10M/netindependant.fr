import { defineGuide } from '../../lib/guide-types';
import { portage } from '../../lib/engine/portage';
import { enPortage, enMicro } from '../../lib/engine/statuts';
import { P, FR, EN } from '../../lib/fmt';

const ca = 450 * 200;
const p = portage(ca, 0.08), o = enPortage({ ca, charges: 0, activite: 'bnc', fraisPortage: 0.08 });
const m = enMicro({ ca: 75000, charges: 0, activite: 'bnc' }), p75 = enPortage({ ca: 75000, charges: 0, activite: 'bnc', fraisPortage: 0.08 });

export default defineGuide({
  id: 'portage-salarial',
  group: 'freelance',
  order: 20,
  tool: 'portage',
  related: ['portage-ou-auto-entrepreneur', 'tjm-freelance', 'statut-freelance', 'comparateur-statuts', 'freelance-informatique'],
  sources: ['spPortage', 'monEntreprise', 'urssafTauxSalarie', 'spBareme'],
  fr: {
    slug: 'portage-salarial',
    nav: 'Simulateur portage salarial',
    card: 'Du TJM au salaire net, frais de gestion compris.',
    title: 'Portage salarial 2026 : simulateur du salaire net porté',
    description: 'Portage salarial 2026 : simulateur gratuit du salaire net à partir du TJM, des jours facturés et des frais de gestion, cotisations selon le modèle de l’Urssaf.',
    h1: 'Portage salarial : votre salaire net à partir du TJM',
    intro: 'TJM, jours facturés, frais de gestion de votre contrat : le simulateur suit l’argent jusqu’au salaire net, puis après impôt.',
    resume: `En portage salarial, le client paie la société de portage, qui retient ses frais de gestion, rembourse vos frais professionnels et transforme le reste en salaire : coût employeur, cotisations patronales, brut, cotisations salariales, net. Le salarié porté relève toujours de la classification cadre, cotise à l’assurance chômage et ne peut pas toucher moins de ${FR.eur(P.portage.minimum_brut_mensuel, 2)} brut par mois selon service-public, avec une réserve de ${FR.pct(P.portage.reserve_financiere, 0)} du salaire de base pour les périodes sans mission en CDI. À ${FR.eur(450)} par jour sur ${FR.num(200)} jours, soit ${FR.eur(ca)} facturés, et ${FR.pct(0.08, 0)} de frais de gestion, il reste ${FR.eur(p.cout)} pour financer le salaire, ${FR.eur(p.brut)} de brut et ${FR.eur((p.net - p.fraisPro) / 12)} net par mois avant impôt, ${FR.eur(o.netMensuel)} après impôt pour une personne seule. Les cotisations sont calculées avec le modèle publié par l’Urssaf, réductions de cotisations comprises.`,
    faqs: [
      { q: 'Quels frais de gestion prendre dans le simulateur ?', a: 'Ceux de votre contrat : ils sont fixés par chaque société de portage et ne relèvent d’aucun barème officiel. Le simulateur part de 8 % pour illustrer ; changez la valeur pour comparer deux offres. Une différence de deux points sur un chiffre d’affaires de 90 000 € représente 1 800 € de coût employeur en moins pour votre salaire.' },
      { q: 'Portage ou micro-entreprise : quelle différence de net ?', a: `Pour ${FR.eur(75000)} de chiffre d’affaires en libéral, sans frais, une personne seule garde ${FR.eur(m.netMensuel)} par mois en micro-entreprise et ${FR.eur(p75.netMensuel)} en portage avec 8 % de frais. L’écart paie le statut de salarié cadre : assurance chômage, retraite complémentaire de cadre et prévoyance.` },
      { q: 'Qui peut travailler en portage salarial ?', a: 'Selon service-public, il faut au moins une qualification de niveau bac + 2 ou trois ans d’expérience dans le même secteur, et l’autonomie pour trouver ses clients et négocier le prix de ses prestations. L’entreprise de portage doit justifier d’une garantie financière et ouvrir un compte d’activité pour chaque salarié porté.' },
    ],
    body: (h) => `
<h2>Le chemin de l’argent</h2>
<p>Le client verse le prix de la prestation à la société de portage. Elle en retire ses frais de gestion, prévus au contrat (${h.src('spPortage', 'service-public, fiche F31620')}), et rembourse vos frais professionnels sur justificatifs. Ce qui reste finance votre salaire : c’est le coût employeur, qui comprend les cotisations patronales. Le simulateur convertit ce coût en salaire brut puis en net avec une grille de salaires calculée par le ${h.src('monEntreprise', 'modèle publié par l’Urssaf')}, pour un cadre en CDI : assurance chômage, retraite complémentaire, prévoyance cadre et réductions de cotisations comprises.</p>
${h.table(['Étape', 'Montant annuel'], [['Chiffre d’affaires facturé', h.eur(ca)], ['Frais de gestion (8 %)', h.eur(p.fraisGestion)], ['Coût employeur du salaire', h.eur(p.cout)], ['Salaire brut', h.eur(p.brut)], ['Salaire net avant impôt', h.eur(p.net - p.fraisPro)], ['Net après impôt, personne seule', h.eur(o.net)]], `TJM de ${h.eur(450)}, ${h.num(200)} jours`, ['l', 'r'])}
<h2>Les règles propres au portage</h2>
<p>Le salarié porté est cadre, quelle que soit son ancienneté. Sa rémunération mensuelle brute ne peut pas descendre sous ${h.eur(P.portage.minimum_brut_mensuel, 2)}, et le contrat prévoit, en CDI, une réserve financière de ${h.pct(P.portage.reserve_financiere, 0)} du salaire de base de la dernière mission pour les périodes sans client. Le contrat de portage à durée déterminée ne peut pas dépasser dix-huit mois, renouvellements compris. Le simulateur signale quand votre mission ne suffit pas à financer le minimum.</p>
<p>Pour comparer avec un statut d’indépendant, voir ${h.a('portage-ou-auto-entrepreneur', 'portage ou auto-entrepreneur')} et le ${h.a('tjm-freelance', 'simulateur TJM')}, qui met les cinq statuts côte à côte.</p>`,
  },
  en: {
    slug: 'umbrella-employment',
    nav: 'Umbrella employment calculator',
    card: 'From day rate to net salary, fees included.',
    title: 'Umbrella employment France 2026: portage net pay calculator',
    description: 'Portage salarial calculator for 2026: net salary from your day rate, days billed and umbrella fee, with contributions from the model published by the Urssaf.',
    h1: 'Umbrella employment: your net salary from your day rate',
    intro: 'Day rate, days billed, your contract’s management fee: the calculator follows the money down to net salary, then after tax.',
    resume: `Under portage salarial, France’s umbrella employment, the client pays the umbrella company, which keeps its management fee, reimburses your business expenses and turns the rest into salary: employer cost, employer contributions, gross pay, employee contributions, net pay. The umbrella employee always counts as an executive (cadre), pays into unemployment insurance and cannot earn less than ${EN.eur(P.portage.minimum_brut_mensuel, 2)} gross a month according to service-public, with a reserve of ${EN.pct(P.portage.reserve_financiere, 0)} of base salary for gaps between assignments on a permanent contract. At ${EN.eur(450)} a day over ${EN.num(200)} days, ${EN.eur(ca)} billed, with an ${EN.pct(0.08, 0)} fee, ${EN.eur(p.cout)} is left to fund the salary: ${EN.eur(p.brut)} gross and ${EN.eur((p.net - p.fraisPro) / 12)} net a month before tax, ${EN.eur(o.netMensuel)} after tax for a single person. Contributions come from the model published by the Urssaf, including contribution reductions.`,
    faqs: [
      { q: 'Which management fee should I enter?', a: 'The one in your contract: each umbrella company sets its own fee and there is no official scale. The calculator starts at 8% for illustration; change it to compare two offers. Two percentage points on €90,000 of turnover means €1,800 less employer cost available for your salary.' },
      { q: 'Umbrella or micro-enterprise: how much difference?', a: `On ${EN.eur(75000)} of freelance turnover with no expenses, a single person keeps ${EN.eur(m.netMensuel)} a month as a micro-enterprise and ${EN.eur(p75.netMensuel)} under umbrella employment with an 8% fee. The gap pays for employee status as an executive: unemployment insurance, executive supplementary pension and provident cover.` },
      { q: 'Who can work through an umbrella company in France?', a: 'According to service-public, you need at least a two-year post-secondary qualification or three years of experience in the same field, and the autonomy to find clients and negotiate your prices. The umbrella company must hold a financial guarantee and open an activity account for each employee.' },
    ],
    body: (h) => `
<h2>Where the money goes</h2>
<p>The client pays the price of the job to the umbrella company. It keeps its management fee, set in the contract (${h.src('spPortage', 'service-public, sheet F31620')}), and reimburses your expenses against receipts. What is left funds your salary: the employer cost, including employer contributions. The calculator turns that cost into gross and then net pay with a salary grid computed by the ${h.src('monEntreprise', 'model the Urssaf publishes')}, for an executive on a permanent contract: unemployment insurance, supplementary pension, executive provident cover and contribution reductions included.</p>
${h.table(['Step', 'Amount a year'], [['Turnover billed', h.eur(ca)], ['Management fee (8%)', h.eur(p.fraisGestion)], ['Employer cost of salary', h.eur(p.cout)], ['Gross salary', h.eur(p.brut)], ['Net salary before tax', h.eur(p.net - p.fraisPro)], ['Net after tax, single', h.eur(o.net)]], `Day rate ${h.eur(450)}, ${h.num(200)} days`, ['l', 'r'])}
<h2>Rules specific to umbrella employment</h2>
<p>An umbrella employee is an executive regardless of seniority. Gross monthly pay cannot fall below ${h.eur(P.portage.minimum_brut_mensuel, 2)}, and a permanent contract builds a reserve of ${h.pct(P.portage.reserve_financiere, 0)} of the last assignment’s base salary for periods without a client. A fixed-term umbrella contract cannot exceed eighteen months including renewals. The calculator warns you when an assignment cannot fund the minimum.</p>
<p>To compare with self-employment, see ${h.a('portage-ou-auto-entrepreneur', 'umbrella or micro-enterprise')} and the ${h.a('tjm-freelance', 'day rate calculator')}, which puts all five set-ups side by side.</p>`,
  },
});
