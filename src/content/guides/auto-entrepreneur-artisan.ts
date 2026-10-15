import { defineGuide } from '../../lib/guide-types';
import { micro } from '../../lib/engine/micro';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const art = (ca: number, extra: Partial<Parameters<typeof micro>[0]> = {}) => micro({ ca, activite: 'bic', artisan: true, ...extra });
const NIVEAUX = [25000, 45000, 70000];
const plombier = art(45000);
const MATERIAUX = 15000;
const plombierReel = art(45000, { charges: MATERIAUX });
const commercial = micro({ ca: 45000, activite: 'bic' });
const ecartTaxes = plombier.cfp + plombier.tfc - commercial.cfp - commercial.tfc;
const electricien = art(30000);
const electricienAcre = art(30000, { acre: 'depuis' });
const plombierVL = art(45000, { vl: true });
const rb = P.micro.repartition.bic;
const tvaS = P.tva.services;

export default defineGuide({
  id: 'auto-entrepreneur-artisan',
  group: 'micro',
  order: 120,
  mini: 'netActivite',
  miniDefaults: { act: 2 },
  related: ['charges-auto-entrepreneur', 'cfe-auto-entrepreneur', 'tva-auto-entrepreneur', 'micro-ou-reel', 'auto-entrepreneur-vente', 'acre-auto-entrepreneur'],
  sources: ['aeEssentiel', 'spTaxesChambres', 'spCfe', 'spFranchiseTva', 'spAcre'],
  fr: {
    slug: 'auto-entrepreneur-artisan',
    nav: 'Auto-entrepreneur artisan',
    card: 'Taux, CFP la plus haute, taxe de la chambre des métiers et CFE parfois nulle.',
    title: 'Auto-entrepreneur artisan 2026 : cotisations, CFP et CMA',
    description: 'Auto-entrepreneur artisan en 2026 : 21,2 % de cotisations, CFP de 0,3 %, taxe de chambre des métiers de 0,48 %, plafond de 83 600 € et TVA dès 37 500 €.',
    h1: 'Artisan en micro-entreprise : ce que coûte chaque chantier en 2026',
    intro: 'Même taux qu’un prestataire commercial, mais deux contributions plus lourdes et une exonération de CFE que beaucoup ignorent.',
    resume: `Un artisan en micro-entreprise, inscrit au répertoire des métiers pour une activité de services comme l’électricité, la plomberie, la menuiserie ou la serrurerie, cotise en 2026 à ${FR.pct(P.micro.taux.bic)} de son chiffre d’affaires encaissé. Il paie en plus la contribution à la formation professionnelle la plus élevée du régime, ${FR.pct(P.micro.cfp.artisan)}, et une taxe pour frais de chambre des métiers de ${FR.pct(P.micro.tfc.artisan_service, 2)} sur ses prestations, contre ${FR.pct(P.micro.tfc.commerce_service, 3)} pour un commerçant. Un plombier qui encaisse ${FR.eur(45000)} dans l’année verse ainsi ${FR.eur(plombier.cotisations)} de cotisations, ${FR.eur(plombier.cfp)} de CFP et ${FR.eur(plombier.tfc)} de taxe de chambre. Le plafond du régime est de ${FR.eur(P.micro.plafonds.services)}, mais la franchise de TVA s’arrête bien plus tôt, à ${FR.eur(tvaS.seuil)}. Les fournitures et matériaux ne se déduisent pas : sur un chantier où ils pèsent lourd, le régime réel peut coûter moins. Bonne nouvelle en revanche pour l’artisan qui travaille seul ou avec des apprentis : il est exonéré de CFE de plein droit.`,
    faqs: [
      { q: 'Un artisan auto-entrepreneur qui travaille seul paie-t-il la CFE ?', a: `Non, selon service-public, les artisans qui travaillent seuls ou avec des apprentis sont exonérés de cotisation foncière des entreprises de plein droit. Les autres paient la CFE à partir de la deuxième année, sauf si leur chiffre d’affaires de l’avant-dernière année n’a pas dépassé ${FR.eur(P.cfe.exoneration_ca)}. Un artisan inscrit au répertoire des métiers mais pas sur la liste de la CCI échappe aussi à la taxe additionnelle.` },
      { q: 'Combien de taxe de chambre des métiers paie un artisan en micro ?', a: `${FR.pct(P.micro.tfc.artisan_service, 2)} du chiffre d’affaires de prestations de services et ${FR.pct(P.micro.tfc.artisan_vente, 2)} sur la part vente, collectés par l’Urssaf avec les cotisations. Sur ${FR.eur(45000)} de prestations, cela représente ${FR.eur(plombier.tfc)} par an. En Alsace et en Moselle, le taux est plus élevé, d’après service-public ; ce site ne le calcule pas.` },
      { q: 'Pourquoi un artisan paie-t-il plus qu’un prestataire commercial au même taux ?', a: `Le taux de cotisations est identique, ${FR.pct(P.micro.taux.bic)}, mais la CFP de l’artisan est de ${FR.pct(P.micro.cfp.artisan)} contre ${FR.pct(P.micro.cfp.commercant)}, et sa taxe de chambre bien plus forte. Sur ${FR.eur(45000)} encaissés, l’écart atteint ${FR.eur(ecartTaxes)} par an. En contrepartie, l’artisan seul est exonéré de CFE, ce qui compense souvent la différence.` },
      { q: 'Un électricien auto-entrepreneur doit-il facturer la TVA ?', a: `Oui dès que ses prestations dépassent ${FR.eur(tvaS.seuil)} sur une année : la TVA s’applique au 1er janvier suivant, ou immédiatement s’il dépasse ${FR.eur(tvaS.majore)} en cours d’année, selon service-public. Le plafond de la micro-entreprise, ${FR.eur(P.micro.plafonds.services)}, est bien plus haut : un artisan peut rester en micro tout en collectant la TVA.` },
      { q: 'Les matériaux achetés pour un chantier réduisent-ils les cotisations de l’artisan ?', a: `Non. Les cotisations se calculent sur tout ce qui est encaissé, matériaux refacturés compris. Un plombier qui encaisse ${FR.eur(45000)} dont ${FR.eur(MATERIAUX)} de fournitures paie quand même ${FR.eur(plombier.cotisations)} de cotisations, et il lui reste ${FR.eur(plombierReel.net)} après achats et impôt. Quand les fournitures dépassent la moitié des factures, l’abattement fiscal de ${FR.pct(P.micro.abattement.bic, 0)} ne suffit plus à les couvrir.` },
    ],
    body: (h) => `
<h2>Artisan ou commerçant : ce que change l’inscription</h2>
<p>Pour l’Urssaf, la prestation d’un électricien et celle d’un agent commercial relèvent de la même catégorie, les bénéfices industriels et commerciaux, avec le même taux de ${h.pct(P.micro.taux.bic)}. La différence vient de l’inscription au répertoire des métiers, qui rattache l’artisan à la chambre des métiers et de l’artisanat (CMA) plutôt qu’à la chambre de commerce. Deux contributions changent alors de niveau (${h.src('spTaxesChambres', 'service-public, taxes pour frais de chambres')}).</p>
${h.table([`Sur ${h.eur(45000)} encaissés`, 'Artisan (CMA)', 'Prestataire commercial (CCI)'], [
  ['Cotisations sociales', h.eur(plombier.cotisations), h.eur(commercial.cotisations)],
  ['Formation professionnelle', `${h.eur(plombier.cfp)} (${h.pct(P.micro.cfp.artisan)})`, `${h.eur(commercial.cfp)} (${h.pct(P.micro.cfp.commercant)})`],
  ['Taxe pour frais de chambre', `${h.eur(plombier.tfc)} (${h.pct(P.micro.tfc.artisan_service, 2)})`, `${h.eur(commercial.tfc)} (${h.pct(P.micro.tfc.commerce_service, 3)})`],
  ['CFE', 'exonéré s’il travaille seul ou avec apprentis', 'due dès la deuxième année'],
], 'Prestations de services BIC en micro-entreprise, 2026', ['l', 'r', 'r'])}
<p>Une précision : les artisans d’Alsace et de Moselle paient une taxe de chambre plus élevée, que ce tableau ignore.</p>

<h2>Ce qu’il reste selon le volume de chantiers</h2>
<p>Le tableau suivant part d’un artisan seul, sans autre revenu dans le foyer, et donne le reste après prélèvements sociaux et impôt au barème. Les fournitures n’y sont pas déduites.</p>
${h.table(['Encaissé dans l’année', 'Cotisations', 'CFP et taxe CMA', 'Impôt', 'Reste', 'Par mois', 'TVA'],
  NIVEAUX.map((ca) => { const m = art(ca); return [h.eur(ca), h.eur(m.cotisations), h.eur(m.cfp + m.tfc), h.eur(m.ir), h.eur(m.net), h.eur(m.netMensuel), m.tvaStatut === 'franchise' ? 'franchise' : 'redevable'] }),
  'Artisan en prestations de services, personne seule, taux et barème 2026', ['r', 'r', 'r', 'r', 'r', 'r', 'l'])}
<p>Sur ces cotisations, ${h.pct(rb.retraite_base + rb.retraite_compl)} financent la retraite de base et complémentaire depuis la nouvelle répartition de 2026 (${h.src('decret2025943', 'décret du 8 septembre 2025')}), et ${h.pct(rb.maladie)} la maladie. Les indemnités journalières en cas d’arrêt se calculent sur le chiffre d’affaires abattu de ${h.pct(P.micro.abattement.bic, 0)}, pas sur le chiffre d’affaires brut.</p>

<h2>Le poids des fournitures</h2>
<p>Un artisan du bâtiment achète souvent ce qu’il pose. Reprenons le plombier à ${h.eur(45000)} : si ${h.eur(MATERIAUX)} de ce montant correspondent à des tuyaux, robinets et chauffe-eau refacturés, ses cotisations restent de ${h.eur(plombier.cotisations)}, calculées sur le tout. Après achats et impôt, il lui reste ${h.eur(plombierReel.net)}, ${h.eur(plombierReel.netMensuel)} par mois. Pour l’impôt, l’abattement de ${h.pct(P.micro.abattement.bic, 0)} couvre forfaitairement ses frais ; tant que les fournitures restent en dessous de ce niveau, il y gagne. Un carreleur ou un menuisier qui fournit beaucoup de matière devrait comparer avec ${h.a('micro-ou-reel', 'le régime réel')}, où l’on cotise sur le bénéfice.</p>

<h2>La TVA arrive avant le plafond</h2>
<p>Le régime micro accepte jusqu’à ${h.eur(P.micro.plafonds.services)} de prestations, mais la franchise de TVA s’arrête à ${h.eur(tvaS.seuil)} (${h.src('spFranchiseTva', 'service-public, fiche F21746')}). Entre les deux, l’artisan reste micro-entrepreneur pour ses cotisations et doit pourtant facturer la TVA, demander un numéro de TVA intracommunautaire au service des impôts et reverser la TVA collectée, en déduisant celle payée sur ses achats. Pour un particulier qui commande des travaux, la facture grimpe d’autant. Au-delà de ${h.eur(tvaS.majore)} en cours d’année, la TVA est due dès le jour du dépassement. Voir ${h.a('tva-auto-entrepreneur', 'la TVA de l’auto-entrepreneur')}.</p>
<p>Un artisan qui vend aussi des produits sans les poser, comme un menuisier qui vend des meubles, a une activité mixte : seuil global de ${h.eur(P.micro.plafonds.vente)}, dont ${h.eur(P.micro.plafonds.services)} au plus pour les services, et taxe de chambre à ${h.pct(P.micro.tfc.artisan_vente, 2)} sur la part vente.</p>

<h2>L’exonération de CFE propre aux artisans</h2>
<p>La cotisation foncière des entreprises est due par presque tous les micro-entrepreneurs à partir de la deuxième année. Service-public cite pourtant parmi les exonérations de plein droit les artisans qui travaillent seuls ou avec des apprentis (${h.src('spCfe', 'fiche F23547')}). Un artisan inscrit au répertoire des métiers sans l’être sur la liste électorale de la CCI échappe en outre à la taxe additionnelle de ${h.pct(P.cfe.taxe_additionnelle_cci, 2)}. Dès qu’il embauche un salarié autre qu’un apprenti, l’exonération tombe et le ${h.a('cfe-auto-entrepreneur', 'calcul de CFE par commune')} s’applique.</p>

<h2>L’Acre pour un artisan qui se lance</h2>
<p>Service-public prend justement l’exemple d’un électricien : avec l’Acre, il cotise à ${h.pct(P.micro.acre.taux_acre_depuis.bic)} au lieu de ${h.pct(P.micro.taux.bic)} s’il démarre à partir du 1er juillet 2026 (${h.src('spAcre', 'fiche F11677')}). Sur ${h.eur(30000)} encaissés pendant la période, ses cotisations passent de ${h.eur(electricien.cotisations)} à ${h.eur(electricienAcre.cotisations)}. La CFP et la taxe de chambre, elles, ne baissent pas. L’aide se demande dans les ${h.P.micro.acre.delai_demande_jours} jours et n’est ouverte qu’à certains publics : voir ${h.a('acre-auto-entrepreneur', 'l’Acre en 2026')}.</p>

<h2>Le versement libératoire pour un artisan</h2>
<p>À ${h.pct(P.micro.vl.bic)} du chiffre d’affaires, il remplace l’impôt au barème (${h.src('aeEssentiel', 'Urssaf')}). Pour le plombier seul à ${h.eur(45000)}, il coûterait ${h.eur(plombierVL.vl)} contre ${h.eur(plombier.ir)} d’impôt au barème : l’option ne se justifie qu’avec d’autres revenus dans le foyer ou un chiffre d’affaires plus élevé.</p>
<p>Ces résultats sont des estimations établies avec les taux 2026 ; l’Urssaf, la chambre des métiers et le service des impôts fixent les montants réels.</p>`,
  },
  en: {
    slug: 'craft-trade-micro',
    nav: 'Craft trades (micro)',
    card: 'Rates, the highest training levy, the trades-chamber levy and a possible CFE exemption.',
    title: 'Craft trade micro-enterprise 2026: rates and trade levies',
    description: 'Craft trade micro-enterprise in France, 2026: 21.2% contributions, 0.3% training levy, 0.48% trades-chamber levy, €83,600 ceiling and VAT from €37,500.',
    h1: 'Electricians, plumbers and other trades under the micro scheme',
    intro: 'Same contribution rate as other service businesses, two heavier levies, and a local-tax exemption many tradespeople never claim.',
    resume: `A tradesperson registered in France as an artisan, on the répertoire des métiers (the trades register), who sells services such as electrical work, plumbing, joinery or locksmithing as a micro-entrepreneur pays social contributions of ${EN.pct(P.micro.taux.bic)} on turnover received in 2026. On top come the highest training levy in the scheme, ${EN.pct(P.micro.cfp.artisan)}, and a levy for the chamber of trades (CMA) of ${EN.pct(P.micro.tfc.artisan_service, 2)} on services, against ${EN.pct(P.micro.tfc.commerce_service, 3)} for a trader. A plumber who receives ${EN.eur(45000)} in the year therefore pays ${EN.eur(plombier.cotisations)} of contributions, ${EN.eur(plombier.cfp)} of training levy and ${EN.eur(plombier.tfc)} of chamber levy, all collected by the Urssaf, the social contributions agency. The scheme allows up to ${EN.eur(P.micro.plafonds.services)} a year, but VAT exemption stops much earlier, at ${EN.eur(tvaS.seuil)}. Materials you buy and re-invoice are never deducted. On the plus side, an artisan working alone or only with apprentices is exempt from the CFE local business tax.`,
    faqs: [
      { q: 'Do I need to be on the trades register to work as a plumber in a micro-enterprise?', a: `Craft activities are registered as artisan activities, which links you to the chamber of trades (CMA). That registration is what sets your training levy at ${EN.pct(P.micro.cfp.artisan)} and your chamber levy at ${EN.pct(P.micro.tfc.artisan_service, 2)} of service turnover in 2026. Commercial service providers pay ${EN.pct(P.micro.cfp.commercant)} and ${EN.pct(P.micro.tfc.commerce_service, 3)}.` },
      { q: 'Are self-employed tradespeople exempt from the CFE local business tax?', a: `Those who work alone or only with apprentices are, by law, according to service-public. Other micro-entrepreneurs pay the CFE (cotisation foncière des entreprises) from their second year unless turnover two years earlier was ${EN.eur(P.cfe.exoneration_ca)} or less. Hiring an employee who is not an apprentice ends the exemption.` },
      { q: 'At what turnover does a French electrician have to charge VAT?', a: `Above ${EN.eur(tvaS.seuil)} of service turnover in a year, VAT applies from the next 1 January; above ${EN.eur(tvaS.majore)} during the year, it applies from that day. The micro ceiling is ${EN.eur(P.micro.plafonds.services)}, so you can stay in the scheme while charging VAT, with a VAT number from the tax office.` },
      { q: 'Can a tradesperson deduct the cost of parts and materials?', a: `Not from contributions: they are charged on everything received, re-invoiced parts included. A plumber taking ${EN.eur(45000)}, of which ${EN.eur(MATERIAUX)} is parts, still pays ${EN.eur(plombier.cotisations)} of contributions and keeps ${EN.eur(plombierReel.net)} after parts and tax. For income tax, a flat ${EN.pct(P.micro.abattement.bic, 0)} allowance stands in for all costs.` },
      { q: 'How much does Acre save a newly registered electrician?', a: `Starting on or after 1 July 2026, an electrician with Acre pays ${EN.pct(P.micro.acre.taux_acre_depuis.bic)} instead of ${EN.pct(P.micro.taux.bic)}, the example service-public gives. On ${EN.eur(30000)} received during the relief period, contributions fall from ${EN.eur(electricien.cotisations)} to ${EN.eur(electricienAcre.cotisations)}. Acre must be claimed within ${EN.num(P.micro.acre.delai_demande_jours)} days and is limited to certain groups.` },
    ],
    body: (h) => `
<h2>Artisan or trader: what registration changes</h2>
<p>For contribution purposes an electrician and a sales agent are in the same box, BIC services (commercial profits), with the same ${h.pct(P.micro.taux.bic)} rate. Registering on the trades register attaches you to the chamber of trades (CMA, chambre de métiers et de l’artisanat) instead of the chamber of commerce (CCI), and two levies change (${h.src('spTaxesChambres', 'service-public, chamber levies')}).</p>
${h.table([`On ${h.eur(45000)} received`, 'Artisan (CMA)', 'Commercial services (CCI)'], [
  ['Social contributions', h.eur(plombier.cotisations), h.eur(commercial.cotisations)],
  ['Training levy (CFP)', `${h.eur(plombier.cfp)} (${h.pct(P.micro.cfp.artisan)})`, `${h.eur(commercial.cfp)} (${h.pct(P.micro.cfp.commercant)})`],
  ['Chamber levy', `${h.eur(plombier.tfc)} (${h.pct(P.micro.tfc.artisan_service, 2)})`, `${h.eur(commercial.tfc)} (${h.pct(P.micro.tfc.commerce_service, 3)})`],
  ['CFE local business tax', 'exempt if working alone or with apprentices', 'due from year two'],
], 'BIC service micro-enterprise, 2026', ['l', 'r', 'r'])}
<p>Craftspeople in Alsace and Moselle pay a higher chamber levy, not modelled here.</p>

<h2>What is left at three levels of work</h2>
<p>A tradesperson working alone, no other household income, before materials:</p>
${h.table(['Received in the year', 'Contributions', 'CFP and CMA levy', 'Income tax', 'Kept', 'Per month', 'VAT'],
  NIVEAUX.map((ca) => { const m = art(ca); return [h.eur(ca), h.eur(m.cotisations), h.eur(m.cfp + m.tfc), h.eur(m.ir), h.eur(m.net), h.eur(m.netMensuel), m.tvaStatut === 'franchise' ? 'exempt' : 'VAT due'] }),
  'Craft services, single person, 2026 rates and tax scale', ['r', 'r', 'r', 'r', 'r', 'r', 'l'])}
<p>Since the 2026 reallocation, ${h.pct(rb.retraite_base + rb.retraite_compl)} of these contributions fund basic and supplementary pension (${h.src('decret2025943', 'decree of 8 September 2025')}) and ${h.pct(rb.maladie)} health cover. You are covered by the CPAM, the French public health insurer, and sick pay is based on turnover after the ${h.pct(P.micro.abattement.bic, 0)} allowance.</p>

<h2>Parts and materials are not deducted</h2>
<p>Back to the plumber on ${h.eur(45000)}: if ${h.eur(MATERIAUX)} of that is pipes, taps and water heaters passed on to customers, he still pays ${h.eur(plombier.cotisations)} of contributions on the whole amount. After parts and tax he keeps ${h.eur(plombierReel.net)}, ${h.eur(plombierReel.netMensuel)} a month. A tiler or joiner supplying lots of material should compare with ${h.a('micro-ou-reel', 'the real-profit regime')}, where contributions follow profit.</p>

<h2>VAT comes before the ceiling</h2>
<p>The scheme accepts up to ${h.eur(P.micro.plafonds.services)} of services, but VAT exemption ends at ${h.eur(tvaS.seuil)} (${h.src('spFranchiseTva', 'service-public sheet F21746')}). In between, you stay a micro-entrepreneur for contributions yet must add VAT to invoices, get an intra-EU VAT number from the tax office (SIE) and pay over the VAT you collect, net of VAT on your purchases. For private customers, your price rises accordingly. Pass ${h.eur(tvaS.majore)} mid-year and VAT is due from that day. See ${h.a('tva-auto-entrepreneur', 'the VAT threshold')}.</p>
<p>A joiner who also sells furniture without fitting it runs a mixed activity: overall ceiling ${h.eur(P.micro.plafonds.vente)}, services capped at ${h.eur(P.micro.plafonds.services)}, and a CMA levy of ${h.pct(P.micro.tfc.artisan_vente, 2)} on the sales part.</p>

<h2>The CFE exemption for tradespeople</h2>
<p>Almost every micro-entrepreneur pays the CFE from year two, but service-public lists artisans working alone or with apprentices among the automatic exemptions (${h.src('spCfe', 'sheet F23547')}). If you are on the trades register but not on the CCI electoral roll, you also escape the ${h.pct(P.cfe.taxe_additionnelle_cci, 2)} additional CCI levy. Hire an employee who is not an apprentice and the ${h.a('cfe-auto-entrepreneur', 'commune-by-commune CFE')} applies.</p>

<h2>Acre and the flat-rate tax option</h2>
<p>With Acre, an electrician starting from 1 July 2026 pays ${h.pct(P.micro.acre.taux_acre_depuis.bic)} instead of ${h.pct(P.micro.taux.bic)} (${h.src('spAcre', 'sheet F11677')}); on ${h.eur(30000)} that is ${h.eur(electricienAcre.cotisations)} instead of ${h.eur(electricien.cotisations)}. See ${h.a('acre-auto-entrepreneur', 'Acre in 2026')}. The versement libératoire, a flat ${h.pct(P.micro.vl.bic)} of turnover replacing income tax (${h.src('aeEssentiel', 'Urssaf')}), would cost the plumber ${h.eur(plombierVL.vl)} against ${h.eur(plombier.ir)} on the scale: worth it only with other household income or higher turnover.</p>
<h2>Settling in France with a trade</h2>
<p>If you practised your trade abroad, the French routine may surprise you in two ways. First, nothing is assessed at year end: you file your turnover online with the Urssaf every month or quarter and pay the contributions and both levies on the spot, and those payments are final. The first return falls at least ninety days after your start date, and a month with no jobs means a nil return and nothing to pay. Second, income tax is separate. Each spring you report gross turnover on the 2042-C-PRO form, the tax office removes the ${h.pct(P.micro.abattement.bic, 0)} allowance and taxes the rest with your household’s other income. Keep an eye on your receipts rather than your quotes: what counts is money actually received in the period, not work done or invoices sent.</p>
<p>All figures are estimates using 2026 rates, not personal advice; the Urssaf, the chamber of trades and the tax office set the real amounts.</p>`,
  },
});
