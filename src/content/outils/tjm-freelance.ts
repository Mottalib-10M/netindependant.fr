import { defineGuide } from '../../lib/guide-types';
import { comparer } from '../../lib/engine/statuts';
import { P, FR, EN } from '../../lib/fmt';

const c = comparer({ ca: 450 * 200, charges: 3000, activite: 'bnc', fraisPortage: 0.08 });
const joursPlafond = Math.floor(P.micro.plafonds.services / 450);

export default defineGuide({
  id: 'tjm-freelance',
  group: 'freelance',
  order: 10,
  tool: 'tjm',
  toolPreset: { tjm: 450, jours: 200 },
  related: ['statut-freelance', 'portage-salarial', 'tjm-500', 'freelance-informatique', 'comparateur-statuts'],
  sources: ['aeEssentiel', 'urssafTauxAC', 'urssafTauxSalarie', 'spIs', 'spDividendes'],
  fr: {
    slug: 'simulateur-tjm-freelance',
    nav: 'Simulateur TJM freelance',
    card: 'Du taux journalier au net mensuel, statut par statut.',
    title: 'TJM freelance 2026 : simulateur du net selon le statut',
    description: 'TJM freelance 2026 : du taux journalier au net mensuel en micro-entreprise, EI, EURL, SASU et portage salarial, avec les jours facturés et les taux Urssaf 2026.',
    h1: 'Votre TJM, combien en net chaque mois ?',
    intro: 'Taux journalier et jours facturés : le simulateur donne le net mensuel dans les cinq cadres possibles.',
    resume: `Un freelance raisonne en taux journalier moyen, mais son revenu dépend du nombre de jours réellement facturés et du statut. À ${FR.eur(450)} par jour sur ${FR.num(200)} jours, le chiffre d’affaires annuel atteint ${FR.eur(450 * 200)}. En micro-entreprise libérale, le plafond de ${FR.eur(P.micro.plafonds.services)} est atteint au bout de ${FR.num(joursPlafond)} jours : au-delà, deux années de suite, il faut changer de régime. Avec ${FR.eur(3000)} de frais par an, ce même TJM laisse ${FR.eur(c.ei.netMensuel)} par mois en entreprise individuelle au réel, ${FR.eur(c.eurl.netMensuel)} en EURL, ${FR.eur(c.sasu.netMensuel)} en SASU avec le meilleur partage entre salaire et dividendes, et ${FR.eur(c.portage.netMensuel)} en portage salarial avec ${FR.pct(0.08, 0)} de frais de gestion. Les jours non facturés, congés, prospection, formation, ne rapportent rien : c’est la variable qui compte le plus, avant même le statut.`,
    faqs: [
      { q: 'Combien de jours facturer par an pour un TJM réaliste ?', a: 'Il n’existe pas de norme officielle. Une année compte environ 250 jours ouvrés avant congés, et tout le temps passé à chercher des missions, à se former ou à gérer l’entreprise n’est pas facturé. Le simulateur part de 200 jours ; essayez 180 ou 160 pour voir l’effet d’une intermission sur votre net.' },
      { q: 'Faut-il facturer la TVA sur mon TJM ?', a: `En micro-entreprise, pas tant que le chiffre d’affaires reste sous ${FR.eur(P.tva.services.seuil)} sur l’année précédente et ${FR.eur(P.tva.services.majore)} sur l’année en cours. À ${FR.eur(450)} par jour, le seuil de franchise est franchi après ${FR.num(Math.floor(P.tva.services.seuil / 450))} jours. En société ou au réel, la TVA s’ajoute en général au TJM.` },
      { q: 'Le portage salarial vaut-il le coût pour un freelance ?', a: `À ${FR.eur(450)} par jour sur ${FR.num(200)} jours, le portage laisse ${FR.eur(c.portage.netMensuel)} par mois, moins que la micro ou la SASU, parce que le salaire porte toutes les cotisations patronales et salariales. En échange, le porté cotise à l’assurance chômage et pour la retraite comme un cadre salarié.` },
    ],
    body: (h) => `
<h2>Ce que le simulateur fait du TJM</h2>
<p>Il multiplie le taux journalier par le nombre de jours facturés pour obtenir le chiffre d’affaires hors taxe, puis le passe dans le même moteur que le ${h.a('comparateur-statuts', 'comparateur de statuts')} : cotisations de la micro-entreprise au taux de ${h.pct(P.micro.taux.bnc, 1)} (${h.src('aeEssentiel', 'Urssaf')}), barème 2026 des ${h.src('urssafTauxAC', 'travailleurs indépendants')} pour l’EI et l’EURL, ${h.src('urssafTauxSalarie', 'régime général')} pour le président de SASU, ${h.src('spIs', 'impôt sur les sociétés')} et ${h.src('spDividendes', 'prélèvement forfaitaire')}, grille du portage. Le net affiché est après impôt sur le revenu, pour le foyer choisi.</p>
${h.table(['Statut', 'Net par mois'], [['Micro-entreprise libérale', c.micro.possible ? h.eur(c.micro.netMensuel) : 'plafond dépassé'], ['EI au réel', h.eur(c.ei.netMensuel)], ['EURL à l’IS', h.eur(c.eurl.netMensuel)], ['SASU', h.eur(c.sasu.netMensuel)], ['Portage salarial', h.eur(c.portage.netMensuel)]], `TJM de ${h.eur(450)}, ${h.num(200)} jours, ${h.eur(3000)} de frais, personne seule`, ['l', 'r'])}
<h2>Pages par TJM</h2>
<p>Chaque palier a sa question : ${h.a('tjm-300', 'à 300 €')} la micro reste ouverte toute l’année, ${h.a('tjm-400', 'à 400 €')} le plafond tombe vers deux cents jours, ${h.a('tjm-500', 'à 500 €')} la société devient la règle, ${h.a('tjm-600', 'à 600 €')} et ${h.a('tjm-800', 'à 800 €')} se pose la question du partage entre salaire et dividendes. Pour le choix du cadre lui-même, voir ${h.a('statut-freelance', 'le statut du freelance')}.</p>`,
  },
  en: {
    slug: 'day-rate-calculator',
    nav: 'Day rate calculator',
    card: 'From day rate to monthly take-home, form by form.',
    title: 'Day rate France 2026: freelance take-home by legal form',
    description: 'Day rate calculator for France 2026: from daily rate to monthly take-home as a micro-enterprise, EI, EURL, SASU or umbrella employee, using the 2026 rates.',
    h1: 'Your day rate: how much do you take home each month?',
    intro: 'Day rate and days billed: the calculator gives monthly take-home under the five possible set-ups.',
    resume: `Freelancers think in day rates (TJM, taux journalier moyen), but income depends on the days actually billed and on the legal form. At ${EN.eur(450)} a day over ${EN.num(200)} days, annual turnover is ${EN.eur(450 * 200)}. As a micro-enterprise for professional services, the ${EN.eur(P.micro.plafonds.services)} ceiling is reached after ${EN.num(joursPlafond)} days: above it two years running, you must change regime. With ${EN.eur(3000)} of expenses a year, the same rate leaves ${EN.eur(c.ei.netMensuel)} a month as a sole trader on real profit, ${EN.eur(c.eurl.netMensuel)} in an EURL, ${EN.eur(c.sasu.netMensuel)} in a SASU with the best salary and dividend split, and ${EN.eur(c.portage.netMensuel)} under umbrella employment with an ${EN.pct(0.08, 0)} management fee. Days you do not bill (holidays, finding clients, training, admin) earn nothing at all: that matters more than the legal form, and it is the first figure to test before choosing one.`,
    faqs: [
      { q: 'How many days a year should I plan to bill?', a: 'There is no official norm. A year has about 250 working days before holidays, and the time spent finding work, training or running the business is not billed. The calculator starts at 200 days; try 180 or 160 to see what a gap between assignments does to your take-home.' },
      { q: 'Do I add VAT to my day rate?', a: `As a micro-enterprise, not while turnover stays under ${EN.eur(P.tva.services.seuil)} in the previous year and ${EN.eur(P.tva.services.majore)} in the current year. At ${EN.eur(450)} a day, the exemption threshold is crossed after ${EN.num(Math.floor(P.tva.services.seuil / 450))} days. In a company or on real profit, VAT is usually added to the rate.` },
      { q: 'Is umbrella employment worth its cost?', a: `At ${EN.eur(450)} a day over ${EN.num(200)} days, umbrella employment leaves ${EN.eur(c.portage.netMensuel)} a month, less than micro or a SASU, because the salary carries every employer and employee contribution. In return you pay into French unemployment insurance and build pension rights like an employed executive.` },
    ],
    body: (h) => `
<h2>What the calculator does with your day rate</h2>
<p>It multiplies the day rate by the days billed to get turnover before VAT, then runs it through the same engine as the ${h.a('comparateur-statuts', 'legal form comparison')}: micro-enterprise contributions at ${h.pct(P.micro.taux.bnc, 1)} (${h.src('aeEssentiel', 'Urssaf')}), the 2026 ${h.src('urssafTauxAC', 'self-employed scale')} for the EI and EURL, the ${h.src('urssafTauxSalarie', 'general scheme')} for a SASU president, ${h.src('spIs', 'corporate tax')}, the ${h.src('spDividendes', 'dividend flat tax')} and the umbrella pay grid. Take-home is after income tax for the household you pick.</p>
${h.table(['Legal form', 'Monthly take-home'], [['Micro-enterprise (BNC)', c.micro.possible ? h.eur(c.micro.netMensuel) : 'over ceiling'], ['EI, real profit', h.eur(c.ei.netMensuel)], ['EURL, corporate tax', h.eur(c.eurl.netMensuel)], ['SASU', h.eur(c.sasu.netMensuel)], ['Umbrella employment', h.eur(c.portage.netMensuel)]], `Day rate ${h.eur(450)}, ${h.num(200)} days, ${h.eur(3000)} expenses, single`, ['l', 'r'])}
<h2>Pages by day rate</h2>
<p>Each level has its own question: ${h.a('tjm-300', 'at €300')} micro stays open all year, ${h.a('tjm-400', 'at €400')} the ceiling hits around two hundred days, ${h.a('tjm-500', 'at €500')} a company becomes the norm, ${h.a('tjm-600', 'at €600')} and ${h.a('tjm-800', 'at €800')} the salary and dividend split matters most. For the choice of set-up itself, see ${h.a('statut-freelance', 'freelance legal status')}. If you are new to France, note that day rates quoted by French clients are almost always before VAT (hors taxe, HT), and that the turnover ceilings and VAT thresholds apply to money actually received in the calendar year, not to what you invoiced.</p>`,
  },
});
