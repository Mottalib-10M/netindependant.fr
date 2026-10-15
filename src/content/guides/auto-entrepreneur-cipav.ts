import { defineGuide } from '../../lib/guide-types';
import { micro } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const cip = (ca: number, extra: Partial<Parameters<typeof micro>[0]> = {}) => micro({ ca, activite: 'cipav', ...extra });
const osteo = cip(40000);
const osteoBnc = micro({ ca: 40000, activite: 'bnc' });
const moniteur = cip(18000);
const archi = cip(60000);
const archiVL = cip(60000, { vl: true });
const osteoAcre = cip(40000, { acre: 'depuis' });
const ecart = osteoBnc.cotisations - osteo.cotisations;
const rc = P.micro.repartition.cipav, rn = P.micro.repartition.bnc;
const tvaS = P.tva.services;
const CAS: Array<[string, string, number]> = [
  ['Moniteur de ski, une saison', 'Ski instructor, one season', 18000],
  ['Ostéopathe à temps plein', 'Full-time osteopath', 40000],
  ['Architecte d’intérieur', 'Interior architect', 60000],
];

export default defineGuide({
  id: 'auto-entrepreneur-cipav',
  group: 'micro',
  order: 140,
  mini: 'netActivite',
  miniDefaults: { act: 4 },
  related: ['auto-entrepreneur-liberal', 'charges-auto-entrepreneur', 'acre-auto-entrepreneur', 'versement-liberatoire', 'statut-auto-entrepreneur'],
  sources: ['spCotisationsMicro', 'decret2025943', 'aeEssentiel', 'spMicroImposition', 'spCfe'],
  fr: {
    slug: 'auto-entrepreneur-cipav',
    nav: 'Auto-entrepreneur à la Cipav',
    card: 'Les métiers rattachés à la Cipav, leur taux 2026 et l’écart avec les autres libéraux.',
    title: 'Auto-entrepreneur Cipav 2026 : métiers concernés et taux',
    description: 'Auto-entrepreneur relevant de la Cipav en 2026 : 23,2 % de cotisations, liste des métiers (architecte, ostéopathe, psychologue…), abattement de 34 % à l’impôt.',
    h1: 'Micro-entrepreneur affilié à la Cipav : qui est concerné et combien il paie',
    intro: 'Architectes, ostéopathes, psychologues, moniteurs de ski : une vingtaine de métiers cotisent à un taux à part, un peu plus bas que celui des autres libéraux.',
    resume: `Une liste fermée de professions libérales réglementées relève de la Cipav, une caisse de retraite propre à ces métiers : architectes, maîtres d’œuvre, géomètres experts, ingénieurs conseils, ostéopathes, psychologues, psychothérapeutes, diététiciens, ergothérapeutes, chiropracteurs, psychomotriciens, moniteurs de ski, guides de haute montagne, guides-conférenciers, experts automobiles ou judiciaires, entre autres. En micro-entreprise, ces métiers cotisent en 2026 à ${FR.pct(P.micro.taux.cipav)} du chiffre d’affaires encaissé, contre ${FR.pct(P.micro.taux.bnc)} pour un libéral non réglementé, avec la même contribution à la formation de ${FR.pct(P.micro.cfp.liberal)}, sans taxe de chambre. La différence tient à la répartition : ${FR.pct(rc.retraite_compl)} des cotisations vont à la retraite complémentaire gérée par la Cipav. Pour l’impôt, rien ne change : abattement de ${FR.pct(P.micro.abattement.bnc, 0)}, versement libératoire à ${FR.pct(P.micro.vl.cipav)}. Une ostéopathe qui encaisse ${FR.eur(40000)} verse ${FR.eur(osteo.cotisations)} de cotisations, ${FR.eur(ecart)} de moins qu’un consultant au même chiffre d’affaires, et garde ${FR.eur(osteo.net)} sur l’année si elle vit seule, avant CFE et frais du cabinet.`,
    faqs: [
      { q: 'Quels métiers d’auto-entrepreneur relèvent de la Cipav ?', a: `Selon service-public : architecte, architecte d’intérieur, économiste de la construction, maître d’œuvre, géomètre expert, ingénieur conseil, moniteur de ski, guide de haute montagne, accompagnateur de moyenne montagne, ostéopathe, psychologue, psychothérapeute, ergothérapeute, diététicien, chiropracteur, psychomotricien, artiste non affilié à la Maison des artistes, expert en automobile, expert devant les tribunaux, mandataire judiciaire à la protection des majeurs et guide-conférencier. Tous cotisent à ${FR.pct(P.micro.taux.cipav)} en 2026.` },
      { q: 'Un ostéopathe en micro paie-t-il moins qu’un coach ?', a: `Oui, légèrement. L’ostéopathe relève de la Cipav, à ${FR.pct(P.micro.taux.cipav)} du chiffre d’affaires, le coach des libéraux non réglementés, à ${FR.pct(P.micro.taux.bnc)}. Sur ${FR.eur(40000)} encaissés, l’écart est de ${FR.eur(ecart)} par an. La CFP de ${FR.pct(P.micro.cfp.liberal)}, l’abattement fiscal et le versement libératoire sont en revanche identiques, selon l’Urssaf.` },
      { q: 'Pourquoi la Cipav reçoit-elle une si grosse part des cotisations ?', a: `Parce qu’elle gère la retraite complémentaire de ces professions. Depuis le 1er janvier 2026, ${FR.pct(rc.retraite_compl)} des cotisations d’un micro-entrepreneur Cipav financent cette complémentaire et ${FR.pct(rc.retraite_base)} la retraite de base, d’après le décret du 8 septembre 2025. La maladie reçoit ${FR.pct(rc.maladie)} et la CSG-CRDS ${FR.pct(rc.csg_crds)}.` },
      { q: 'Combien rapporte l’Acre à un psychologue qui s’installe en micro ?', a: `S’il remplit l’une des conditions de l’Acre et démarre à partir du 1er juillet 2026, il cotise à ${FR.pct(P.micro.acre.taux_acre_depuis.cipav)} au lieu de ${FR.pct(P.micro.taux.cipav)} ; avant cette date, le taux publié par l’Urssaf était de ${FR.pct(P.micro.acre.taux_acre_avant.cipav)}. Sur ${FR.eur(40000)} encaissés pendant la période, l’économie atteint ${FR.eur(osteo.cotisations - osteoAcre.cotisations)}. La demande se fait dans les ${FR.num(P.micro.acre.delai_demande_jours)} jours.` },
      { q: 'Un moniteur de ski saisonnier peut-il rester en micro-entreprise ?', a: `Oui, le régime convient bien à une activité de quelques mois. Sur une saison à ${FR.eur(18000)}, il verse ${FR.eur(moniteur.cotisations)} de cotisations et ${FR.eur(moniteur.cfp)} de CFP. Les mois sans cours, il déclare un chiffre d’affaires nul et ne paie rien. L’année de création, le plafond de ${FR.eur(P.micro.plafonds.services)} se proratise selon les jours d’activité.` },
    ],
    body: (h) => `
<h2>La liste officielle des métiers Cipav</h2>
<p>La Cipav n’accueille pas tous les libéraux. Seules les professions énumérées par ${h.src('spCotisationsMicro', 'service-public, fiche F36232')} y restent affiliées ; toutes les autres activités libérales, conseil, informatique, coaching, relèvent du ${h.a('auto-entrepreneur-liberal', 'régime BNC général')}.</p>
<ul>
<li>cadre bâti : architecte, architecte d’intérieur, économiste de la construction, maître d’œuvre, géomètre expert ;</li>
<li>ingénierie : ingénieur conseil ;</li>
<li>montagne : moniteur de ski, guide de haute montagne, accompagnateur de moyenne montagne ;</li>
<li>santé et accompagnement : ostéopathe, psychologue, psychothérapeute, ergothérapeute, diététicien, chiropracteur, psychomotricien ;</li>
<li>arts : artiste non affilié à la Maison des artistes ;</li>
<li>expertise : expert en automobile, expert devant les tribunaux, mandataire judiciaire à la protection des majeurs ;</li>
<li>tourisme : guide-conférencier.</li>
</ul>
<p>Si votre activité n’y figure pas, le taux de ${h.pct(P.micro.taux.cipav)} ne vous concerne pas, même si votre métier vous semble proche.</p>

<h2>Le taux 2026 et ce qu’il finance</h2>
<p>Un micro-entrepreneur Cipav cotise à ${h.pct(P.micro.taux.cipav)} de ses recettes, plus ${h.pct(P.micro.cfp.liberal)} de CFP. Ce qui le distingue surtout d’un libéral BNC, c’est la destination de l’argent (${h.src('decret2025943', 'décret n° 2025-943 du 8 septembre 2025')}).</p>
${h.table(['Part des cotisations en 2026', 'Cipav', 'Libéral BNC'], [
  ['Retraite de base', h.pct(rc.retraite_base), h.pct(rn.retraite_base)],
  ['Retraite complémentaire', h.pct(rc.retraite_compl), h.pct(rn.retraite_compl)],
  ['Maladie, indemnités journalières', h.pct(rc.maladie), h.pct(rn.maladie)],
  ['Invalidité-décès', h.pct(rc.invalidite), h.pct(rn.invalidite)],
  ['CSG-CRDS', h.pct(rc.csg_crds), h.pct(rn.csg_crds)],
], 'Répartition des cotisations d’un micro-entrepreneur Cipav comparée à celle d’un libéral non réglementé', ['l', 'r', 'r'])}
<p>Chez les affiliés de la Cipav, la retraite complémentaire pèse même un peu plus que la retraite de base, alors qu’elle en représente moins de la moitié chez les autres libéraux. La maladie reçoit aussi une part plus large : ${h.pct(rc.maladie)} contre ${h.pct(rn.maladie)}. Sur les ${h.eur(osteo.cotisations)} versés par une ostéopathe à ${h.eur(40000)}, ${h.eur(osteo.cotisations * rc.retraite_compl)} vont à la complémentaire.</p>

<h2>Trois métiers, trois niveaux d’activité</h2>
${h.table(['Situation', 'Encaissé', 'Cotisations et CFP', 'Impôt au barème', 'Reste annuel', 'Par mois'],
  CAS.map(([fr, , ca]) => { const m = cip(ca); return [fr, h.eur(ca), h.eur(m.cotisations + m.cfp), h.eur(m.ir), h.eur(m.net), h.eur(m.netMensuel)]; }),
  'Micro-entrepreneurs Cipav, personne seule sans autre revenu, taux et barème 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Le reste s’entend avant CFE, loyer du cabinet, matériel ou assurance professionnelle, que le régime micro ne déduit jamais. Un moniteur de ski qui ne travaille que l’hiver déclare un chiffre d’affaires nul le reste de l’année et ne cotise pas sur ces mois-là.</p>

<h2>Impôt : les règles des BNC</h2>
<p>Côté fiscal, la Cipav ne change rien (${h.src('spMicroImposition', 'fiche F23267')}). Le chiffre d’affaires est abattu de ${h.pct(P.micro.abattement.bnc, 0)} avant d’entrer dans le revenu du foyer, ou taxé à ${h.pct(P.micro.vl.cipav)} avec le versement libératoire. Pour l’architecte d’intérieur à ${h.eur(60000)} vivant seul, l’option coûterait ${h.eur(archiVL.vl)} contre ${h.eur(archi.ir)} au barème. Voir ${h.a('versement-liberatoire', 'le versement libératoire')} pour la condition de revenu.</p>

<h2>Seuils et TVA</h2>
<p>Le plafond est celui des prestations de services, ${h.eur(P.micro.plafonds.services)}. La franchise de TVA s’arrête à ${h.eur(tvaS.seuil)} sur l’année précédente, avec une tolérance jusqu’à ${h.eur(tvaS.majore)}. À ${h.eur(60000)}, l’architecte d’intérieur est donc redevable de la TVA tout en restant micro-entrepreneur. Ce site ne traite que les seuils de franchise ; pour toute autre règle de TVA propre à votre profession, interrogez le service des impôts.</p>

<h2>L’Acre pour un affilié Cipav</h2>
<p>Pour une activité commencée jusqu’au 30 juin 2026, l’${h.src('aeEssentiel', 'Urssaf')} publiait un taux de ${h.pct(P.micro.acre.taux_acre_avant.cipav)} ; à partir du 1er juillet 2026, il passe à ${h.pct(P.micro.acre.taux_acre_depuis.cipav)}, soit ${h.pct(P.micro.acre.taux_paye_depuis_2026_07, 0)} du taux normal. L’Acre se demande désormais dans les ${h.P.micro.acre.delai_demande_jours} jours et seulement pour les publics prévus : voir ${h.a('acre-auto-entrepreneur', 'l’Acre en 2026')}.</p>

<h2>CFE et artistes</h2>
<p>Les affiliés Cipav paient en principe la cotisation foncière des entreprises à partir de la deuxième année. Un artiste non affilié à la Maison des artistes qui exerce comme peintre, sculpteur, graveur ou dessinateur figure toutefois parmi les exonérations de plein droit listées par ${h.src('spCfe', 'service-public')}. Pour les autres, la CFE dépend de la commune : voir le ${h.a('cfe-auto-entrepreneur', 'calcul de CFE')}.</p>

<h2>Et au réel ?</h2>
<p>Hors micro-entreprise, un affilié Cipav cotise directement à sa caisse pour la retraite, selon un barème propre que ce site ne simule pas. Le passage au réel se compare donc moins facilement que pour un consultant BNC ; le ${h.a('home', 'simulateur auto-entrepreneur')} reste limité au régime micro pour ces professions.</p>
<p>Ces calculs sont des estimations fondées sur les taux 2026 ; l’Urssaf, la Cipav et le service des impôts restent seuls à fixer les montants dus.</p>`,
  },
  en: {
    slug: 'cipav-professions',
    nav: 'Cipav professions',
    card: 'Which professions belong to the Cipav fund, their 2026 rate and the gap with other freelancers.',
    title: 'Cipav professions 2026: micro-entrepreneur rate and list',
    description: 'Cipav professions under the French micro scheme in 2026: 23.2% contributions for architects, osteopaths, psychologists, ski instructors, 34% tax allowance.',
    h1: 'Architects, osteopaths and ski instructors: the Cipav micro rate',
    intro: 'About twenty regulated professions pay a separate rate, slightly below other freelancers, with more of it going to pension.',
    resume: `In France, a closed list of regulated professions is attached to the Cipav, a pension fund of its own for those professions. It includes architects, interior architects, project managers in construction, chartered surveyors, consulting engineers, osteopaths, psychologists, psychotherapists, dieticians, occupational therapists, chiropractors, psychomotor therapists, ski instructors, mountain guides, tour guides and court or car experts. As micro-entrepreneurs these professions pay social contributions of ${EN.pct(P.micro.taux.cipav)} of fees received in 2026, against ${EN.pct(P.micro.taux.bnc)} for unregulated freelancers, plus the same ${EN.pct(P.micro.cfp.liberal)} training levy and no chamber levy. The money is split differently: ${EN.pct(rc.retraite_compl)} goes to the supplementary pension the Cipav runs. Income tax works as for any freelancer: a ${EN.pct(P.micro.abattement.bnc, 0)} flat allowance, or the flat-rate option at ${EN.pct(P.micro.vl.cipav)}. An osteopath receiving ${EN.eur(40000)} pays ${EN.eur(osteo.cotisations)} of contributions, ${EN.eur(ecart)} less than a consultant on the same fees, and keeps ${EN.eur(osteo.net)} over the year if single, before CFE local business tax and practice costs.`,
    faqs: [
      { q: 'Which professions does the Cipav cover for micro-entrepreneurs?', a: `Service-public lists: architect, interior architect, construction economist, project manager (maître d’œuvre), chartered surveyor, consulting engineer, ski instructor, high-mountain guide, mid-mountain leader, osteopath, psychologist, psychotherapist, occupational therapist, dietician, chiropractor, psychomotor therapist, artist not covered by the Maison des artistes, car expert, court expert, court-appointed adult guardian and tour guide. All pay ${EN.pct(P.micro.taux.cipav)} in 2026.` },
      { q: `I am a foreign-trained osteopath: what will I pay on ${EN.eur(40000)} of fees?`, a: `As a micro-entrepreneur attached to the Cipav, ${EN.pct(P.micro.taux.cipav)} of fees, so ${EN.eur(osteo.cotisations)} of contributions, plus ${EN.eur(osteo.cfp)} of training levy. If you live alone with no other income, income tax after the ${EN.pct(P.micro.abattement.bnc, 0)} allowance comes to ${EN.eur(osteo.ir)}, leaving ${EN.eur(osteo.net)} before CFE and costs. Your right to practise is a separate matter.` },
      { q: 'How is a Cipav micro-entrepreneur’s contribution split in 2026?', a: `Under the decree of 8 September 2025: ${EN.pct(rc.retraite_base)} to basic pension, ${EN.pct(rc.retraite_compl)} to the supplementary pension run by the Cipav, ${EN.pct(rc.maladie)} to health and sick pay, ${EN.pct(rc.invalidite)} to disability and death cover and ${EN.pct(rc.csg_crds)} to the CSG-CRDS levies. Unregulated freelancers send only ${EN.pct(rn.retraite_compl)} to supplementary pension.` },
      { q: 'Does a seasonal ski instructor pay contributions in summer?', a: `No. Contributions are a share of what you receive, so months with no lessons mean a nil return and nothing to pay, though you still file it. On a season bringing in ${EN.eur(18000)}, an instructor pays ${EN.eur(moniteur.cotisations)} of contributions and ${EN.eur(moniteur.cfp)} of training levy at the 2026 Cipav rate.` },
      { q: 'What Acre rate applies to a Cipav profession starting in 2026?', a: `With Acre, a business started from 1 July 2026 pays ${EN.pct(P.micro.acre.taux_acre_depuis.cipav)} instead of ${EN.pct(P.micro.taux.cipav)}; one started earlier paid ${EN.pct(P.micro.acre.taux_acre_avant.cipav)}, per the Urssaf. On ${EN.eur(40000)} received during the relief period, that saves ${EN.eur(osteo.cotisations - osteoAcre.cotisations)}. Claim it within ${EN.num(P.micro.acre.delai_demande_jours)} days, and only if you are in an eligible group.` },
    ],
    body: (h) => `
<h2>The official list</h2>
<p>The Cipav does not cover every freelancer. Only the professions named by ${h.src('spCotisationsMicro', 'service-public, sheet F36232')} stay attached to it; all other freelance work, consulting, IT, coaching, falls under the ${h.a('auto-entrepreneur-liberal', 'general BNC rules')}.</p>
<ul>
<li>building: architect, interior architect, construction economist, project manager (maître d’œuvre), chartered surveyor (géomètre expert);</li>
<li>engineering: consulting engineer;</li>
<li>mountains: ski instructor, high-mountain guide, mid-mountain leader;</li>
<li>health and therapy: osteopath, psychologist, psychotherapist, occupational therapist, dietician, chiropractor, psychomotor therapist;</li>
<li>arts: artist not covered by the Maison des artistes (the artists’ social security body);</li>
<li>expertise: car expert, court expert, court-appointed guardian for adults;</li>
<li>tourism: tour guide (guide-conférencier).</li>
</ul>
<p>If your activity is not on the list, the ${h.pct(P.micro.taux.cipav)} rate does not apply to you, however close your job seems.</p>

<h2>The 2026 rate and what it pays for</h2>
<p>A Cipav micro-entrepreneur pays ${h.pct(P.micro.taux.cipav)} of fees plus a ${h.pct(P.micro.cfp.liberal)} training levy, both collected by the Urssaf. The real difference from other freelancers is where the money goes (${h.src('decret2025943', 'decree no. 2025-943 of 8 September 2025')}).</p>
${h.table(['Share of contributions, 2026', 'Cipav', 'Unregulated freelance (BNC)'], [
  ['Basic pension', h.pct(rc.retraite_base), h.pct(rn.retraite_base)],
  ['Supplementary pension', h.pct(rc.retraite_compl), h.pct(rn.retraite_compl)],
  ['Health and sick pay', h.pct(rc.maladie), h.pct(rn.maladie)],
  ['Disability and death', h.pct(rc.invalidite), h.pct(rn.invalidite)],
  ['CSG-CRDS levies', h.pct(rc.csg_crds), h.pct(rn.csg_crds)],
], 'How a Cipav micro-entrepreneur’s contributions are split, compared with an unregulated freelancer', ['l', 'r', 'r'])}
<p>For Cipav members the supplementary pension even edges past the basic one, and health gets ${h.pct(rc.maladie)} rather than ${h.pct(rn.maladie)}. Out of the ${h.eur(osteo.cotisations)} an osteopath on ${h.eur(40000)} pays, ${h.eur(osteo.cotisations * rc.retraite_compl)} goes to the supplementary scheme.</p>

<h2>Three professions, three levels of activity</h2>
${h.table(['Situation', 'Received', 'Contributions and CFP', 'Income tax (scale)', 'Kept per year', 'Per month'],
  CAS.map(([, en, ca]) => { const m = cip(ca); return [en, h.eur(ca), h.eur(m.cotisations + m.cfp), h.eur(m.ir), h.eur(m.net), h.eur(m.netMensuel)]; }),
  'Cipav micro-entrepreneurs, single person with no other income, 2026 rates and scale', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>These amounts come before CFE, practice rent, equipment or professional insurance, none of which the micro scheme deducts.</p>

<h2>Income tax follows BNC rules</h2>
<p>For tax, Cipav membership changes nothing (${h.src('spMicroImposition', 'sheet F23267')}). Fees are cut by the ${h.pct(P.micro.abattement.bnc, 0)} allowance and added to household income, or taxed at ${h.pct(P.micro.vl.cipav)} under the versement libératoire, a flat-rate payment made with your contributions. For a single interior architect on ${h.eur(60000)}, the option costs ${h.eur(archiVL.vl)} against ${h.eur(archi.ir)} on the scale. The income test is on ${h.a('versement-liberatoire', 'the flat-rate option')}.</p>

<h2>Ceiling and VAT</h2>
<p>The ceiling is the services one, ${h.eur(P.micro.plafonds.services)}. VAT exemption ends at ${h.eur(tvaS.seuil)} over the previous year, with leeway to ${h.eur(tvaS.majore)}. At ${h.eur(60000)} the interior architect charges VAT while staying a micro-entrepreneur. This site only covers the exemption thresholds; for any VAT rule specific to your profession, ask your tax office.</p>

<h2>Acre, CFE and artists</h2>
<p>Acre lowers the rate to ${h.pct(P.micro.acre.taux_acre_depuis.cipav)} for a start from 1 July 2026, ${h.pct(P.micro.acre.taux_paye_depuis_2026_07, 0)} of the normal rate (${h.src('aeEssentiel', 'Urssaf')}); see ${h.a('acre-auto-entrepreneur', 'Acre in 2026')}. The CFE local business tax applies from year two, but painters, sculptors, engravers and artist illustrators are among the automatic exemptions on the ${h.src('spCfe', 'service-public list')}. Others can check the ${h.a('cfe-auto-entrepreneur', 'CFE calculator')}.</p>

<h2>Outside the micro scheme</h2>
<p>On real profit, a Cipav member pays pension contributions to the fund directly, on its own scale, which this site does not simulate. The ${h.a('home', 'calculator')} therefore covers these professions only under the micro scheme.</p>
<h2>Opening a practice after moving to France</h2>
<p>Once registered, you file your fees online with the Urssaf each month or each quarter and pay contributions at the same time; the first return comes at least ninety days after your start date, and the amounts are final, with no catch-up bill later. Health cover comes from the CPAM, the public health insurer, through those same contributions. If you fall ill, sick pay is worked out on fees after the ${h.pct(P.micro.abattement.bnc, 0)} allowance, roughly two thirds of what you received. In your first year, the ${h.eur(P.micro.plafonds.services)} ceiling is reduced in proportion to the days you were trading; the tax office then checks it against full years from the third year on. Keep a simple ledger of every payment received with its date: it is the only figure the Urssaf asks for.</p>
<p>All figures are estimates based on 2026 rates, not personal advice; the Urssaf, the Cipav and the tax office set what you owe.</p>`,
  },
});
