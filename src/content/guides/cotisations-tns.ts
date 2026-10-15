import { defineGuide } from '../../lib/guide-types';
import { cotisationsTNS, eiReel } from '../../lib/engine/tns';
import { P, FR, EN } from '../../lib/fmt';

// Exemples tirés du moteur (jamais écrits à la main).
const T = P.tns, PASS = P.pass.annuel;
const paliers = [20000, 35000, 50000, 80000, 120000].map((r) => ({ r, c: cotisationsTNS(r) }));
const c50 = cotisationsTNS(50000);
const e50 = eiReel(50000);
const zero = cotisationsTNS(0);
const sansAcre = cotisationsTNS(30000), avecAcre = cotisationsTNS(30000, { acre: true });
const artisan35 = cotisationsTNS(35000, { artisan: true }), commercant35 = cotisationsTNS(35000);
const abatMin = T.abattement_min_pass * PASS, abatMax = T.abattement_max_pass * PASS;
const revenuAbatMax = abatMax / T.abattement;
const tauxEff = paliers.map(({ r, c }) => c.cotisations / r);
const tauxMin = Math.min(...tauxEff), tauxMax = Math.max(...tauxEff);
const maxMaladie = T.maladie.points[T.maladie.points.length - 1][1];

export default defineGuide({
  id: 'cotisations-tns',
  group: 'statuts',
  order: 120,
  mini: 'cotisTns',
  related: ['eurl', 'entrepreneur-individuel', 'dividendes-eurl', 'charges-sasu', 'eurl-ou-sasu', 'micro-ou-reel'],
  sources: ['urssafTauxAC', 'urssafReforme', 'decret2024688', 'spDividendes'],
  fr: {
    slug: 'cotisations-tns',
    nav: 'Cotisations TNS',
    card: 'Le barème 2026 des indépendants au réel, de l’assiette abattue aux minimums.',
    title: 'Cotisations TNS 2026 : barème réformé, abattement de 26 %',
    description: 'Cotisations TNS 2026 : assiette abattue de 26 %, taux ligne par ligne, minimums de 967 € en retraite, Acre au réel et exemples pour un gérant d’EURL ou une EI.',
    h1: 'Les cotisations des travailleurs non salariés après la réforme',
    intro: 'Entrepreneur individuel au réel ou gérant majoritaire d’EURL : une seule assiette, un abattement forfaitaire et un barème par risque.',
    resume: `Un travailleur non salarié au réel, entrepreneur individuel ou gérant majoritaire d’EURL, paie en 2026 des cotisations calculées sur une assiette unique : son revenu professionnel brut, cotisations non déduites, diminué d’un abattement forfaitaire de ${FR.pct(T.abattement, 0)}. Cet abattement ne descend pas sous ${FR.eur(abatMin)} et ne dépasse pas ${FR.eur(abatMax)}. Sur cette assiette s’appliquent la maladie, progressive jusqu’à ${FR.pct(maxMaladie)}, les indemnités journalières, la retraite de base à ${FR.pct(T.retraite_base.t1, 2)} jusqu’au plafond de ${FR.eur(PASS)}, la retraite complémentaire, l’invalidité-décès, les allocations familiales au-delà de ${FR.pct(T.alloc_familiales.seuil_pass, 0)} du plafond et la CSG-CRDS à ${FR.pct(T.csg_crds.total)}. Pour ${FR.eur(50000)} de revenu, l’assiette tombe à ${FR.eur(c50.assiette)} et l’ensemble atteint ${FR.eur(c50.cotisations)}, formation professionnelle comprise, soit ${FR.pct(c50.cotisations / 50000)} du revenu. Même sans revenu, des minimums restent dus : ${FR.eur(zero.cotisations)} par an au total pour un commerçant ou un libéral non réglementé. La réforme, prévue par le décret n° 2024-688, s’applique pour la première fois à la régularisation des revenus 2025.`,
    faqs: [
      { q: 'Comment l’abattement de 26 % réduit-il l’assiette d’un indépendant ?', a: `On part du revenu professionnel avant cotisations et on en retire ${FR.pct(T.abattement, 0)}, dans la limite de ${FR.eur(abatMin)} au moins et ${FR.eur(abatMax)} au plus. Pour ${FR.eur(50000)}, l’abattement vaut ${FR.eur(c50.abattement)} et l’assiette ${FR.eur(c50.assiette)}. Le plafond n’est atteint qu’à partir de ${FR.eur(revenuAbatMax)} de revenu, selon le décret du 5 juillet 2024.` },
      { q: 'Combien de cotisations TNS pour un revenu de 50 000 € ?', a: `${FR.eur(c50.cotisations)} sur l’année avec le barème 2026 : ${FR.eur(c50.retraiteBase)} de retraite de base, ${FR.eur(c50.retraiteCompl)} de complémentaire, ${FR.eur(c50.maladie + c50.ij)} de maladie et d’indemnités journalières, ${FR.eur(c50.csgCrds)} de CSG-CRDS et le reste en invalidité-décès et formation. Il reste ${FR.eur(e50.netAvantImpot)} avant impôt sur le revenu à un entrepreneur individuel.` },
      { q: 'Quelles cotisations minimales paie un indépendant sans revenu ?', a: `Selon l’Urssaf, ${FR.eur(T.minimums_publies.retraite_base)} pour la retraite de base, ${FR.eur(T.minimums_publies.ij)} pour les indemnités journalières, ${FR.eur(T.minimums_publies.invalidite_deces)} pour l’invalidité-décès et ${FR.eur(T.minimums_publies.cfp_commercant)} de formation professionnelle (${FR.eur(T.minimums_publies.cfp_artisan)} pour un artisan). Ces minimums ne s’appliquent pas à qui perçoit le RSA ou la prime d’activité.` },
      { q: 'Pourquoi l’Urssaf régularise-t-elle les cotisations d’un nouvel indépendant ?', a: `Parce qu’à la création, son revenu est inconnu. L’Urssaf appelle d’abord des cotisations provisoires sur une base forfaitaire, sans lien avec votre activité réelle, puis recalcule l’année quand le revenu réel est déclaré. Si l’activité a bien marché, un rappel suit ; dans le cas contraire, un remboursement. Mieux vaut provisionner l’écart dès les premiers mois.` },
      { q: 'L’Acre allège-t-elle les cotisations d’un indépendant au réel ?', a: `Oui, d’un quart sur la maladie, les indemnités journalières, les allocations familiales, la retraite de base et l’invalidité-décès, quand l’assiette reste sous ${FR.pct(T.acre.seuil_pass, 0)} du plafond, soit ${FR.eur(T.acre.seuil_pass * PASS)}, puis de façon dégressive jusqu’à ${FR.eur(PASS)}. Pour ${FR.eur(30000)} de revenu, l’économie atteint ${FR.eur(avecAcre.exonerationAcre)} la première année, sur demande à l’Urssaf.` },
      { q: 'Quelle part de la CSG-CRDS d’un TNS est déductible ?', a: `Sur ${FR.pct(T.csg_crds.total)} de CSG-CRDS, ${FR.pct(T.csg_crds.deductible)} se déduisent du revenu imposable et ${FR.pct(T.csg_crds.non_deductible)} restent imposables. Pour ${FR.eur(50000)} de revenu, ${FR.eur(c50.csgNonDeductible)} sont ainsi réintégrés : l’entrepreneur individuel est imposé sur ${FR.eur(e50.imposable)}, un peu plus que ce qu’il garde avant impôt.` },
    ],
    body: (h) => `
<h2>Qui cotise comme travailleur non salarié</h2>
<p>Le sigle TNS désigne les indépendants qui ne relèvent ni du régime micro-social, ni du régime général. Sur ce site, cela couvre l’entrepreneur individuel au régime réel, le gérant associé unique d’EURL et le gérant majoritaire de SARL, dans l’artisanat, le commerce ou les professions libérales non réglementées. Les libéraux rattachés à la Cipav relèvent d’un autre barème de retraite et sortent du champ du mini-simulateur, comme les auto-entrepreneurs, qui paient un pourcentage de leur chiffre d’affaires.</p>
<p>Pour un gérant d’EURL à l’impôt sur les sociétés, le revenu soumis aux cotisations comprend sa rémunération, cotisations non déduites, et la part des dividendes qui dépasse ${h.pct(P.dividendes.seuil_tns_capital, 0)} du capital, des primes d’émission et des comptes courants d’associé (${h.src('spDividendes', 'service-public, fiche F32963')}). C’est ce mécanisme qui fait des cotisations TNS le sujet central des « charges d’EURL ».</p>

<h2>L’assiette unique depuis la réforme</h2>
<p>Jusqu’ici, cotisations et CSG-CRDS reposaient sur deux bases différentes. La ${h.src('urssafReforme', 'réforme de l’assiette sociale')} les fusionne : on prend le revenu brut, sans déduire les cotisations, puis on retire un abattement forfaitaire de ${h.pct(P.tns.abattement, 0)} (${h.src('decret2024688', 'décret n° 2024-688 du 5 juillet 2024')}). L’abattement est encadré : au moins ${h.eur(abatMin)}, au plus ${h.eur(abatMax)}, ce dernier montant n’étant atteint qu’au-delà de ${h.eur(revenuAbatMax)} de revenu. Les taux ont été relevés en parallèle, de sorte que le niveau global de prélèvement change peu ; c’est la répartition qui se déplace vers la retraite.</p>

<h2>Le barème 2026, risque par risque</h2>
${h.table(['Risque', 'Taux 2026', 'Sur quelle part de l’assiette'], [
  ['Maladie-maternité', `0 à ${h.pct(maxMaladie)}`, `progressif jusqu’à ${h.num(T.maladie.plafond_progressif_pass)} plafonds, puis ${h.pct(T.maladie.taux_au_dela)}`],
  ['Indemnités journalières', h.pct(T.ij.taux), `jusqu’à ${h.num(T.ij.plafond_pass)} plafonds`],
  ['Retraite de base', h.pct(T.retraite_base.t1, 2), `jusqu’à ${h.eur(PASS)}, puis ${h.pct(T.retraite_base.t2, 2)}`],
  ['Retraite complémentaire', h.pct(T.retraite_compl.t1), `jusqu’à ${h.eur(PASS)}, puis ${h.pct(T.retraite_compl.t2)} jusqu’à ${h.num(T.retraite_compl.plafond_pass)} plafonds`],
  ['Invalidité-décès', h.pct(T.invalidite_deces.taux), `jusqu’à ${h.eur(PASS)}`],
  ['Allocations familiales', `0 à ${h.pct(T.alloc_familiales.taux)}`, `à partir de ${h.pct(T.alloc_familiales.seuil_pass, 0)} du plafond, plein à ${h.pct(T.alloc_familiales.plein_pass, 0)}`],
  ['CSG-CRDS', h.pct(T.csg_crds.total), `toute l’assiette, dont ${h.pct(T.csg_crds.deductible)} déductible`],
  ['Formation professionnelle', h.pct(T.cfp.commercant, 2), `du plafond (${h.pct(T.cfp.artisan, 2)} pour un artisan)`],
], 'Barème 2026 des artisans, commerçants et professions libérales non réglementées, après abattement', ['l', 'r', 'l'])}
<p>La maladie est le seul poste vraiment progressif : nulle sous ${h.pct(T.maladie.points[1][0], 0)} du plafond, elle grimpe par paliers jusqu’à ${h.pct(maxMaladie)} vers trois plafonds, puis retombe à ${h.pct(T.maladie.taux_au_dela)} sur la part qui dépasse. Les taux viennent de la page ${h.src('urssafTauxAC', 'taux et barèmes 2026 de l’Urssaf')}.</p>

<h2>Cinq revenus, cinq factures</h2>
${h.table(['Revenu avant cotisations', 'Assiette après abattement', 'Cotisations totales', 'Part du revenu'], paliers.map(({ r, c }) => [h.eur(r), h.eur(c.assiette), h.eur(c.cotisations), h.pct(c.cotisations / r, 1)]), 'Cotisations sociales 2026 d’un commerçant ou libéral non réglementé au réel, CSG-CRDS et formation comprises, sans Acre', ['r', 'r', 'r', 'r'])}
<p>Le taux effectif dessine une cloche très aplatie, entre ${h.pct(tauxMin, 1)} et ${h.pct(tauxMax, 1)} sur ces cinq revenus. Il monte d’abord avec la maladie progressive, puis redescend au-dessus du plafond, quand la retraite de base tombe à ${h.pct(T.retraite_base.t2, 2)}. Sous quelques milliers d’euros de revenu, en revanche, les minimums le font grimper en flèche. Le mini-simulateur en haut de page détaille votre propre cas.</p>
<h3>Le détail pour ${h.eur(50000)}</h3>
<p>Un consultant en entreprise individuelle dégage ${h.eur(50000)} avant cotisations. Après l’abattement de ${h.eur(c50.abattement)}, son assiette est de ${h.eur(c50.assiette)}. Il verse ${h.eur(c50.retraiteBase)} de retraite de base, ${h.eur(c50.retraiteCompl)} de complémentaire, ${h.eur(c50.maladie)} de maladie, ${h.eur(c50.ij)} d’indemnités journalières, ${h.eur(c50.invalidite)} d’invalidité-décès, ${h.eur(c50.csgCrds)} de CSG-CRDS et ${h.eur(c50.cfp)} de formation. Aucune allocation familiale n’est due, l’assiette restant sous ${h.pct(T.alloc_familiales.seuil_pass, 0)} du plafond. Il conserve ${h.eur(e50.netAvantImpot)} avant impôt.</p>
<h3>Artisan ou commerçant</h3>
<p>Le barème est commun, à une ligne près : la contribution à la formation professionnelle. À ${h.eur(35000)} de revenu, un artisan paie ${h.eur(artisan35.cotisations)}, un commerçant ${h.eur(commercant35.cotisations)}.</p>

<h2>Minimums, démarrage et Acre</h2>
<p>Un indépendant sans revenu ou presque doit malgré tout ${h.eur(zero.cotisations)} par an : ${h.eur(T.minimums_publies.retraite_base)} de retraite de base, calculés sur ${h.eur(T.retraite_base.assiette_min)}, ${h.eur(T.minimums_publies.ij)} d’indemnités journalières, ${h.eur(T.minimums_publies.invalidite_deces)} d’invalidité-décès et ${h.eur(T.minimums_publies.cfp_commercant)} de formation. Ces minimums tombent pour les bénéficiaires du RSA ou de la prime d’activité.</p>
<p>La première année, l’Urssaf ne connaît pas encore le revenu. Elle appelle des cotisations provisoires sur une base forfaitaire, puis les régularise d’après la déclaration de revenus. Le décalage peut être sensible quand l’activité démarre vite : garder une réserve évite la surprise du rappel.</p>
<p>Avec l’Acre, accordée sur demande depuis 2026, un quart des cotisations maladie, indemnités journalières, allocations familiales, retraite de base et invalidité-décès est exonéré tant que l’assiette ne dépasse pas ${h.eur(T.acre.seuil_pass * PASS)}, puis l’avantage diminue jusqu’à s’éteindre à ${h.eur(PASS)}. Pour ${h.eur(30000)} de revenu, la facture passe de ${h.eur(sansAcre.cotisations)} à ${h.eur(avecAcre.cotisations)}.</p>

<h2>Comparer avec les autres cadres</h2>
<p>À rémunération égale, le TNS cotise moins qu’un président de SASU, dont le détail figure sur ${h.a('charges-sasu', 'les charges en SASU')}, mais sa protection diffère. Face à la micro-entreprise, le réel gagne quand les frais sont élevés : voir ${h.a('micro-ou-reel', 'micro ou réel')}. Pour l’arbitrage entre rémunération et dividendes d’un gérant, voir ${h.a('dividendes-eurl', 'les dividendes d’EURL')} et le ${h.a('eurl', 'simulateur EURL')}.</p>
<p>Ces chiffres restent des estimations construites sur les barèmes publiés : seule l’Urssaf arrête vos cotisations, et un conseil personnalisé reste nécessaire pour un cas particulier.</p>`,
  },
  en: {
    slug: 'self-employed-contributions-tns',
    nav: 'Self-employed contributions (TNS)',
    card: 'The 2026 scale for self-employed people on real profit, from the reduced base to the minimums.',
    title: 'TNS contributions 2026: reformed French self-employed scale',
    description: 'TNS contributions 2026: base cut by a 26% allowance, rates line by line, €967 minimum for pensions, Acre on real profit, EURL and sole trader examples.',
    h1: 'Self-employed (TNS) contributions after the reform',
    intro: 'Sole trader on real profit or majority manager of an EURL: one base, one flat allowance and a rate for each risk.',
    resume: `In France, a travailleur non salarié, or TNS, is a self-employed person outside both the micro-enterprise scheme and the employee scheme: typically a sole trader (entreprise individuelle, EI) taxed on real profit, or the majority manager of an EURL, a one-member limited company. In 2026 a TNS pays contributions on a single base: gross business income, before contributions are deducted, minus a flat ${EN.pct(T.abattement, 0)} allowance. The allowance is never below ${EN.eur(abatMin)} nor above ${EN.eur(abatMax)}. On that base come health cover, progressive up to ${EN.pct(maxMaladie)}, sick pay, basic pension at ${EN.pct(T.retraite_base.t1, 2)} up to the ${EN.eur(PASS)} social security ceiling, supplementary pension, disability and death cover, family benefits above ${EN.pct(T.alloc_familiales.seuil_pass, 0)} of the ceiling, and the CSG-CRDS social levies at ${EN.pct(T.csg_crds.total)}. On ${EN.eur(50000)} of income the base drops to ${EN.eur(c50.assiette)} and the total reaches ${EN.eur(c50.cotisations)}, training levy included, ${EN.pct(c50.cotisations / 50000)} of income. With no income at all, minimums of ${EN.eur(zero.cotisations)} a year remain for a trader or unregulated professional.`,
    faqs: [
      { q: 'How does the 26% allowance shrink a French self-employed contribution base?', a: `Take business income before contributions and remove ${EN.pct(T.abattement, 0)}, with a floor of ${EN.eur(abatMin)} and a cap of ${EN.eur(abatMax)}. On ${EN.eur(50000)} the allowance is ${EN.eur(c50.abattement)} and the base ${EN.eur(c50.assiette)}. The cap only bites from ${EN.eur(revenuAbatMax)} of income, under the decree of 5 July 2024.` },
      { q: 'How much TNS contribution is due on €50,000 of income?', a: `${EN.eur(c50.cotisations)} for the year on the 2026 scale: ${EN.eur(c50.retraiteBase)} of basic pension, ${EN.eur(c50.retraiteCompl)} of supplementary pension, ${EN.eur(c50.maladie + c50.ij)} for health and sick pay, ${EN.eur(c50.csgCrds)} of CSG-CRDS, and the rest for disability cover and the training levy. A sole trader keeps ${EN.eur(e50.netAvantImpot)} before income tax.` },
      { q: 'What minimum contributions does a self-employed person owe with no income?', a: `According to the Urssaf, ${EN.eur(T.minimums_publies.retraite_base)} for basic pension, ${EN.eur(T.minimums_publies.ij)} for sick pay, ${EN.eur(T.minimums_publies.invalidite_deces)} for disability and death cover and ${EN.eur(T.minimums_publies.cfp_commercant)} of training levy (${EN.eur(T.minimums_publies.cfp_artisan)} for a craftsperson). People receiving the RSA, France’s minimum income, or the prime d’activité top-up are exempt from these minimums.` },
      { q: 'Why does the Urssaf adjust a new self-employed person’s contributions later?', a: `Because your income is unknown when you start. The Urssaf first bills provisional contributions on a flat base that ignores your actual business, then recalculates the year once your real income is declared. A good first year brings an extra bill; a weak one, a refund. Setting money aside from the first months avoids a nasty surprise.` },
      { q: 'Does Acre relief cut contributions for a self-employed person on real profit?', a: `Yes, by a quarter of health, sick pay, family benefits, basic pension and disability contributions while the base stays under ${EN.pct(T.acre.seuil_pass, 0)} of the ceiling, ${EN.eur(T.acre.seuil_pass * PASS)}, then tapering to nothing at ${EN.eur(PASS)}. On ${EN.eur(30000)} of income the saving is ${EN.eur(avecAcre.exonerationAcre)} in the first year, on application to the Urssaf.` },
      { q: 'How much of a TNS’s CSG-CRDS can be deducted from taxable income?', a: `Of the ${EN.pct(T.csg_crds.total)} CSG-CRDS, ${EN.pct(T.csg_crds.deductible)} is deductible and ${EN.pct(T.csg_crds.non_deductible)} stays taxable. On ${EN.eur(50000)} of income, ${EN.eur(c50.csgNonDeductible)} is added back, so a sole trader is taxed on ${EN.eur(e50.imposable)}, a little more than the ${EN.eur(e50.netAvantImpot)} actually kept before tax.` },
    ],
    body: (h) => `
<h2>Who counts as TNS</h2>
<p>On this site, TNS covers the sole trader on real profit, the managing sole member of an EURL and the majority manager of a SARL, in crafts, trade or unregulated professions such as consulting. Regulated professions attached to the Cipav pension fund have their own pension scale and fall outside the mini-calculator, as do auto-entrepreneurs (micro-entrepreneurs), who pay a percentage of turnover instead.</p>
<p>For an EURL manager whose company pays corporate tax, the income subject to contributions is pay, before contributions, plus any dividends above ${h.pct(P.dividendes.seuil_tns_capital, 0)} of share capital, share premium and partner current accounts (${h.src('spDividendes', 'service-public, sheet F32963')}). That is why, when French founders talk about “EURL charges”, they mostly mean TNS contributions.</p>

<h2>One base since the reform</h2>
<p>Contributions and the CSG-CRDS levies used to rest on two different bases. The ${h.src('urssafReforme', 'reform of the self-employed base')} merges them: start from gross income without deducting contributions, then remove a flat ${h.pct(P.tns.abattement, 0)} allowance (${h.src('decret2024688', 'decree no. 2024-688 of 5 July 2024')}). The allowance has a floor of ${h.eur(abatMin)} and a cap of ${h.eur(abatMax)}, reached only above ${h.eur(revenuAbatMax)} of income. Rates were raised at the same time, so the overall burden moves little; what shifts is the share going to pensions. The new rules apply for the first time when 2025 income is settled in 2026.</p>

<h2>The 2026 scale, risk by risk</h2>
${h.table(['Risk', '2026 rate', 'Applied to'], [
  ['Health and maternity', `0 to ${h.pct(maxMaladie)}`, `progressive up to ${h.num(T.maladie.plafond_progressif_pass)} ceilings, then ${h.pct(T.maladie.taux_au_dela)}`],
  ['Sick pay', h.pct(T.ij.taux), `up to ${h.num(T.ij.plafond_pass)} ceilings`],
  ['Basic pension', h.pct(T.retraite_base.t1, 2), `up to ${h.eur(PASS)}, then ${h.pct(T.retraite_base.t2, 2)}`],
  ['Supplementary pension', h.pct(T.retraite_compl.t1), `up to ${h.eur(PASS)}, then ${h.pct(T.retraite_compl.t2)} up to ${h.num(T.retraite_compl.plafond_pass)} ceilings`],
  ['Disability and death', h.pct(T.invalidite_deces.taux), `up to ${h.eur(PASS)}`],
  ['Family benefits', `0 to ${h.pct(T.alloc_familiales.taux)}`, `from ${h.pct(T.alloc_familiales.seuil_pass, 0)} of the ceiling, full at ${h.pct(T.alloc_familiales.plein_pass, 0)}`],
  ['CSG-CRDS', h.pct(T.csg_crds.total), `whole base, ${h.pct(T.csg_crds.deductible)} deductible`],
  ['Training levy', h.pct(T.cfp.commercant, 2), `of the ceiling (${h.pct(T.cfp.artisan, 2)} for craftspeople)`],
], '2026 scale for craftspeople, traders and unregulated professions, after the allowance', ['l', 'r', 'l'])}
<p>The “ceiling” here is the Pass, the annual social security ceiling of ${h.eur(PASS)}. Health is the only truly progressive line: zero below ${h.pct(T.maladie.points[1][0], 0)} of the ceiling, rising in steps to ${h.pct(maxMaladie)} around three ceilings, then ${h.pct(T.maladie.taux_au_dela)} on anything above. Rates come from the ${h.src('urssafTauxAC', 'Urssaf’s 2026 rates page')}.</p>

<h2>Five incomes, five bills</h2>
${h.table(['Income before contributions', 'Base after allowance', 'Total contributions', 'Share of income'], paliers.map(({ r, c }) => [h.eur(r), h.eur(c.assiette), h.eur(c.cotisations), h.pct(c.cotisations / r, 1)]), '2026 social contributions of a trader or unregulated professional on real profit, CSG-CRDS and training levy included, no Acre', ['r', 'r', 'r', 'r'])}
<p>The effective rate traces a very flat hump, between ${h.pct(tauxMin, 1)} and ${h.pct(tauxMax, 1)} across these five incomes. It rises first with progressive health cover, then eases above the ceiling, where basic pension drops to ${h.pct(T.retraite_base.t2, 2)}. On an income of only a few thousand euros, though, the minimums send it soaring. The mini-calculator at the top of the page works out your own figures.</p>
<h3>${h.eur(50000)} in detail</h3>
<p>A consultant trading as a sole trader earns ${h.eur(50000)} before contributions. After a ${h.eur(c50.abattement)} allowance the base is ${h.eur(c50.assiette)}. The bill: ${h.eur(c50.retraiteBase)} basic pension, ${h.eur(c50.retraiteCompl)} supplementary pension, ${h.eur(c50.maladie)} health, ${h.eur(c50.ij)} sick pay, ${h.eur(c50.invalidite)} disability and death, ${h.eur(c50.csgCrds)} CSG-CRDS and ${h.eur(c50.cfp)} training levy. No family benefit contribution is due because the base stays under ${h.pct(T.alloc_familiales.seuil_pass, 0)} of the ceiling. ${h.eur(e50.netAvantImpot)} is left before income tax.</p>
<h3>Craftsperson or trader</h3>
<p>The scale is shared except for one line, the training levy. On ${h.eur(35000)} of income a craftsperson pays ${h.eur(artisan35.cotisations)}, a trader ${h.eur(commercant35.cotisations)}.</p>

<h2>Minimums, first year and Acre</h2>
<p>With little or no income you still owe ${h.eur(zero.cotisations)} a year: ${h.eur(T.minimums_publies.retraite_base)} of basic pension worked out on ${h.eur(T.retraite_base.assiette_min)}, ${h.eur(T.minimums_publies.ij)} of sick pay, ${h.eur(T.minimums_publies.invalidite_deces)} of disability cover and ${h.eur(T.minimums_publies.cfp_commercant)} of training levy. Those minimums do not apply to people on the RSA or the prime d’activité.</p>
<p>In your first year the Urssaf does not know your income yet. It bills provisional contributions on a flat base, then corrects them from your income return. If business takes off quickly the catch-up bill can be large: keep a reserve.</p>
<p>With Acre, the start-up relief granted on application since 2026, a quarter of health, sick pay, family benefit, basic pension and disability contributions is waived while the base stays under ${h.eur(T.acre.seuil_pass * PASS)}, tapering to zero at ${h.eur(PASS)}. On ${h.eur(30000)} of income the bill falls from ${h.eur(sansAcre.cotisations)} to ${h.eur(avecAcre.cotisations)}.</p>

<h2>How it compares</h2>
<p>For the same pay, a TNS pays less than a SASU president, whose costs are on ${h.a('charges-sasu', 'SASU president pay')}, with different cover. Against the micro-enterprise scheme, real profit wins when costs are high: see ${h.a('micro-ou-reel', 'micro or real profit')}. For a manager weighing pay against dividends, see ${h.a('dividendes-eurl', 'EURL dividends')} and the ${h.a('eurl', 'EURL calculator')}.</p>
<p>These are estimates built on the published scales. The Urssaf alone settles what you owe, and your own situation may call for personal advice.</p>`,
  },
});
