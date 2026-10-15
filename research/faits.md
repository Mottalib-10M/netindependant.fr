# Faits vérifiés (lus le 2026-10-15) : seule base autorisée pour rédiger

Chaque chiffre publié vient d'ici **et** se tire de `src/data/params-2026.json` (`h.P` dans `body`, `P` + `FR`/`EN` dans `resume` et `faqs`) ou du moteur (`src/lib/engine/*.ts`). La clé entre crochets est la clé de `params-2026.json > sources` à citer avec `h.src(clé, texte)`.

## Micro-entreprise (auto-entrepreneur)
- Taux 2026 : vente/hébergement 12,3 % ; prestations BIC (commerciales et artisanales, y compris locations meublées non classées) 21,2 % ; libéral non réglementé BNC 25,6 % ; Cipav 23,2 % ; meublé de tourisme classé 6 % (hors champ) [aeEssentiel, spCotisationsMicro]. `P.micro.taux`.
- Historique BNC : 21,1 % jusqu'en juin 2024, 23,1 % depuis juillet 2024, 24,6 % en 2025, 25,6 % au 1er janvier 2026 [monEntreprise]. `P.micro.historique_bnc`.
- Taux affichés par service-public avec versement libératoire (hors CFP) : 13,3 / 22,9 / 27,8 / 25,4 % [spCotisationsMicro]. `P.micro.taux_vl_total`.
- CFP : 0,1 % commerçants ; 0,3 % artisans ; 0,2 % libéraux (réglementés et non) [aeEssentiel]. Droit à la formation si CA positif l'année précédente.
- Taxe pour frais de chambre (TFC) : commerçant 0,044 % (services) / 0,015 % (vente) ; artisan 0,48 % (services) / 0,22 % (vente) ; Alsace et Moselle plus élevé (non modélisé) [spTaxesChambres]. Libéraux : aucune.
- Cotisations définitives, aucune régularisation ; 0 € de CA = 0 € à payer, déclaration quand même ; première déclaration au plus tôt 90 jours après le début ; déclaration mensuelle ou trimestrielle en ligne (autoentrepreneur.urssaf.fr ou appli) [aeEssentiel, spCotisationsMicro].
- Cotisations minimales optionnelles : sur demande à l'Urssaf (avant le 31 décembre pour l'année suivante, ou avant la fin du 3e mois après la création) ; on bascule alors sur un calcul de travailleur indépendant classique [spCotisationsMicro]. Non modélisées.
- Sortie du régime micro-social si le seuil du régime micro-fiscal est dépassé deux années consécutives [spCotisationsMicro].
- Professions Cipav (liste service-public) : architecte, architecte d'intérieur, économiste de la construction, maître d'œuvre, géomètre expert ; ingénieur conseil ; moniteur de ski, guide de haute montagne, accompagnateur de moyenne montagne ; ostéopathe, psychologue, psychothérapeute, ergothérapeute, diététicien, chiropracteur, psychomotricien ; artiste non affilié à la Maison des artistes ; expert en automobile, expert devant les tribunaux, mandataire judiciaire à la protection des majeurs ; guide-conférencier [spCotisationsMicro].
- Répartition des cotisations au 1er janvier 2026 (décret n° 2025-943 du 8 septembre 2025) [decret2025943] : vente et BIC : retraite de base 43,45 %, complémentaire 19,75 %, maladie (dont IJ) 10,05 %, invalidité-décès 3,15 %, CSG-CRDS 23,60 % ; BNC : 46,40 / 21,00 / 4,10 / 3,30 / 25,20 % ; Cipav : 29,50 / 30,70 / 11,40 / 1,40 / 27,00 %. `P.micro.repartition`. La part de CSG-CRDS baisse au profit des cotisations contributives (retraite) : taux global inchangé [urssafReforme].
- Les auto-entrepreneurs sont rattachés à la CPAM pour la maladie ; IJ maladie, maternité, paternité calculées sur le CA abattu (71 / 50 / 34 %) [aeEssentiel].
- Outre-mer : taux réduits pendant 3 ans (non modélisés) [aeEssentiel].

## Plafonds (régime micro-fiscal), revenus 2026
- 203 100 € vente/hébergement ; 83 600 € services BIC et BNC ; meublé de tourisme classé et chambres d'hôtes 83 600 € ; meublé de tourisme non classé 15 000 € [spPlafonds]. Anciens seuils : 188 700 / 77 700 €. `P.micro.plafonds`.
- Le régime s'applique en N si le CA de N-1 **ou** de N-2 n'a pas dépassé le seuil : un seul dépassement est toléré, deux années consécutives font sortir au 1er janvier suivant [spPlafonds].
- Création : régime micro automatique l'année N et N+1 ; vérification à partir de N+2 ; la première année le seuil est proratisé : seuil × jours d'activité / 365 (exemples officiels : création 31 janvier 2026 en vente → 186 407 € ; début 1er mars 2026 en services → 70 087 €) [spPlafonds, aeEssentiel]. Fonction `plafondProrata`.
- Activité mixte : seuil global 203 100 € + seuil 83 600 € pour la part services ; le seuil n'est pas doublé ; abattements cumulés, minimum 610 € [spPlafonds, spMicroImposition].
- Option possible pour un régime réel [spPlafonds].

## TVA (franchise en base)
- 2026 : services 37 500 € (seuil) et 41 250 € (seuil majoré) ; vente/hébergement 85 000 € et 93 500 € ; avocats activités réglementées 50 000 / 55 000 €, non réglementées 35 000 / 38 500 € ; auteurs (livraisons d'œuvres, droits) 50 000 / 55 000 €, autres 35 000 / 38 500 € [spFranchiseTva]. `P.tva`.
- Seuil unique de 25 000 € prévu par la loi de finances pour 2025 : **abandonné** (service-public, vérifié le 1er janvier 2026). `P.tva.seuil_unique_abandonne`.
- Au-delà du seuil N-1 : TVA au 1er janvier suivant ; au-delà du seuil majoré en cours d'année : TVA dès le jour du dépassement. Prorata la première année : CA × 365 / jours d'activité [spFranchiseTva].
- Mention sur les factures en franchise : « TVA non applicable, art. 293 B du CGI » ; une fois redevable : numéro de TVA intracommunautaire auprès du SIE, TVA collectée et déductible [aeEssentiel].
- **Interdit** : citer un taux de TVA (20 %, 10 %…) : non relu sur une source officielle de ce chantier.

## Impôt du micro-entrepreneur
- Abattements : 71 % vente ; 50 % services BIC ; 34 % BNC ; minimum 305 € (610 € en activité mixte) [spMicroImposition]. Meublé de tourisme non classé 30 %.
- Déclaration annuelle du CA brut sur la 2042-C-PRO, sans déduire les charges ; attestation fiscale disponible en février dans l'espace Urssaf [aeEssentiel].
- Versement libératoire : 1 % vente/hébergement ; 1,7 % services BIC (y compris locations meublées, chambres d'hôtes) ; 2,2 % BNC [impotsVL]. Option à la création ou jusqu'au dernier jour du 3e mois suivant la création ; sinon avant le 30 septembre pour l'année suivante ; dénonciation avant le 30 septembre [impotsVL, spMicroImposition].
- Condition de revenu : RFR de N-2 ≤ limite de la 2e tranche du barème de l'année précédente, par part (majoration de 50 % par demi-part, 25 % par quart de part). Pour 2026 : RFR 2024 ≤ 29 315 € par part (simulateur de l'Urssaf mon-entreprise) ; pour une option prenant effet en 2027 : 29 579 € par part (service-public F23267 : 29 579 € seul, 59 158 € couple, 73 947,5 € couple + 1 enfant, 88 737 € couple + 2 enfants). `P.micro.vl_seuil_rfr_par_part`, fonction `seuilVL(parts, année)`.
- Avec VL, le CA abattu sert au taux effectif des autres revenus et au RFR ; penser à supprimer l'acompte de prélèvement à la source dans l'espace particulier [impotsVL, spMicroImposition].
- Sortie du VL : dénonciation, dépassement des seuils micro, ou RFR au-dessus du seuil [impotsVL].

## Acre
- Depuis le 1er janvier 2026 (LFSS 2026) : **plus automatique** ; demande à l'Urssaf dans les **60 jours** suivant le début d'activité ; réservée à : demandeur d'emploi indemnisé ; non indemnisé inscrit 6 mois sur 18 ; RSA ou ASS ; 18 à 25 ans révolus (29 si handicap) ; moins de 30 ans non indemnisé ; moins de 30 ans reconnu handicapé ; salarié repreneur d'une entreprise en sauvegarde, redressement ou liquidation ; Cape ; QPV ; PreParE ; ZFRR ou ZFRR+. Pas d'Acre déjà obtenue dans les 3 années précédentes [urssafAcre2026, spAcre].
- Sociétés : contrôle effectif (famille > 50 % dont 35 % perso ; ou dirigeant avec 1/3 dont 25 % perso, nul autre > 50 % ; ou demandeurs ensemble > 50 % avec un dirigeant, chacun ≥ 1/10 de la part du principal associé) [urssafAcre2026].
- Micro-entrepreneur : début d'activité jusqu'au 30/06/2026 → taux payés : vente 6,2 %, BIC 10,6 %, BNC 12,8 %, Cipav 13,4 % ; depuis le 01/07/2026 → 9,3 / 15,9 / 19,2 / 17,4 % [aeEssentiel]. Service-public : taux égal à 75 % du taux normal, exonération de 25 % (exemple : électricien BIC 15,9 % au lieu de 21,2 %) [spAcre].
- Durée : jusqu'à la fin du 3e trimestre civil suivant celui du début d'activité (exemple officiel : début le 3 septembre 2026 → jusqu'au 30 juin 2027, soit 10 mois ; début en juillet → 12 mois) [spAcre]. Demander l'Acre la « consomme » même sans CA [aeEssentiel]. Silence d'un mois = acceptation [aeEssentiel].
- Indépendants au réel : exonération du quart des cotisations maladie, IJ, allocations familiales, retraite de base et invalidité-décès si revenu ≤ 75 % du Pass (36 045 €), dégressive jusqu'au Pass (48 060 €) [urssafTauxAC].
- Arce (France Travail) : 60 % des droits ARE restants versés en capital en deux fois, réservée aux bénéficiaires de l'Acre ; alternative : maintien partiel de l'ARE [aeEssentiel, spAcre]. **Interdit** : chiffrer l'ARE elle-même.

## CFE
- Due par tout entrepreneur, y compris micro, même à domicile ; exonération l'année de création ; base réduite de moitié l'année suivante ; exonération si CA de N-2 ≤ 5 000 € (proratisé si création en N-1) [spCfe].
- Sans local : base minimum votée par la commune selon le CA de N-2 : ≤ 10 000 € : 250 à 597 € ; 10 001-32 600 € : 250 à 1 194 € ; 32 601-100 000 € : 250 à 2 509 € ; 100 001-250 000 € : 250 à 4 183 € ; 250 001-500 000 € : 250 à 5 974 € ; > 500 000 € : 250 à 7 769 € (montants 2026) [spCfe]. `P.cfe`.
- Taxe additionnelle CCI : 1,12 % de la base (exonérés : artisans inscrits au RNE non inscrits sur la liste électorale de la CCI, loueurs de meublés…) ; frais de gestion de 1 % de la CFE et de la taxe additionnelle [spCfe].
- Avis dématérialisé dans l'espace professionnel impots.gouv.fr, paiement en général au plus tard le 15 décembre, en ligne ou prélèvement [spCfe].
- Exonérations de plein droit (liste service-public) : artisans travaillant seuls ou avec apprentis, chauffeurs de taxi/ambulance (1 ou 2 véhicules), VDI sous 7 930 €, professeurs dispensant eux-mêmes leur enseignement (domicile ou local sans enseigne), peintres, sculpteurs, graveurs, dessinateurs artistes, photographes auteurs, auteurs, compositeurs, traducteurs percevant des droits d'auteur, artistes lyriques et dramatiques, sages-femmes et garde-malades, sportifs, avocats ayant suivi le CAPA pendant 2 ans, meublés de tourisme classés et chambres d'hôtes dans l'habitation personnelle sauf délibération contraire… [spCfe].
- Données par commune : fichier REI 2025 de la DGFiP (Licence Ouverte 2.0), 34 905 communes ; taux et bases votés pour 2025, derniers publiés [rei2025]. Fonction `cfe()`, données `public/data/cfe/<dep>.json` (lecture au build : `src/lib/cfe-data.ts`).

## Impôt sur le revenu (barème LF 2026, revenus 2025)
- Tranches : 0 % jusqu'à 11 600 € ; 11 % jusqu'à 29 579 € ; 30 % jusqu'à 84 577 € ; 41 % jusqu'à 181 917 € ; 45 % au-delà [spBareme]. Exemple officiel : célibataire, 30 000 € → 2 103,99 € ; couple 60 000 € → 2 × 2 103,99 €.
- Plafonnement du quotient familial : 1 807 € par demi-part (904 € par quart de part) [spQuotient].
- Décote : impôt brut ≤ 1 982 € (seul) ou 3 277 € (couple) ; décote = 897 € (ou 1 483 €) − 45,25 % de l'impôt [spCalculImpot] ; impôt non recouvré sous 61 €.
- Abattement de 10 % sur salaires : min 509 €, max 14 555 € [spFraisPro].
- Moteur : `impotRevenu`, `impotMarginal` (impôt dû à un revenu ajouté au foyer).

## Indépendants au réel (EI, EURL à l'IR, gérant majoritaire) : barème 2026 réformé
- Réforme (LFSS 2024, art. 18 ; décret n° 2024-688 du 5 juillet 2024) appliquée à partir de la régularisation des revenus 2025, en 2026 : assiette unique cotisations + CSG-CRDS = revenu brut (charges déduites, cotisations non déduites) − abattement de 26 % ; abattement compris entre 1,76 % et 130 % du Pass [urssafReforme, decret2024688]. Micro-fiscaux hors auto-entrepreneurs : abattement fiscal (71/50/34 %) à la place. Auto-entrepreneurs : non concernés.
- Pass 2026 : 48 060 € par an (4 005 € par mois) [urssafTauxAC].
- Barème 2026 (artisans, commerçants, PLNR) [urssafTauxAC] : maladie 0 % sous 20 % du Pass, progressif 0 → 1,5 % (20-40 %), 1,5 → 4 % (40-60 %), 4 → 6,5 % (60-110 %), 6,5 → 7,7 % (110-200 %), 7,7 → 8,5 % (200-300 %), puis 6,5 % sur la part au-delà de 3 Pass ; IJ 0,5 % jusqu'à 5 Pass (assiette min 40 % Pass) ; retraite de base 17,87 % jusqu'au Pass + 0,72 % au-delà ; complémentaire 8,1 % jusqu'au Pass + 9,1 % de 1 à 4 Pass ; invalidité-décès 1,3 % jusqu'au Pass ; allocations familiales 0 sous 110 % Pass, progressif jusqu'à 3,1 % à 140 % ; CSG-CRDS 9,7 % (dont 6,8 % déductible) ; CFP 0,25 % du Pass (0,29 % artisan, 0,34 % avec conjoint collaborateur).
- Avant réforme (pour comparer) : maladie jusqu'à 6,7 %, retraite de base 17,75 % + 0,60 %, complémentaire 7 % / 8 %.
- Cotisations minimales 2026 : IJ 96 € ; retraite de base 967 € (assiette 450 × Smic horaire = 5 409 €) ; invalidité-décès 72 € ; CFP 120 € (139 € artisan) ; pas de minimum si RSA ou prime d'activité [urssafTauxAC].
- Début d'activité : cotisations provisoires sur bases forfaitaires (19 % du Pass…), régularisées ensuite ; premiers paiements après 90 jours [urssafTauxAC].
- Gérant d'EURL/SARL à l'IS : revenu brut social = rémunération (cotisations non déduites) + dividendes au-delà de 10 % du capital, primes d'émission et comptes courants [urssafReforme, spDividendes].
- Moteur : `cotisationsTNS`, `eiReel`.
- Professions libérales réglementées (Cipav…) au réel : **hors champ du simulateur** (retraite gérée par leur caisse). Barème Cipav 2026 : retraite de base 8,73 % + 1,87 % ; complémentaire 11 % / 21 % (ne pas développer).

## Président de SAS/SASU (assimilé salarié)
- Régime général sans assurance chômage ni AGS ; taux 2026 secteur privé [urssafTauxSalarie] : maladie 13 % ; vieillesse 8,55 % plafonnée + 2,11 % totalité (salarié 6,90 % + 0,40 %) ; allocations familiales 5,25 % ; CSA 0,3 % ; FNAL 0,1 % (< 50 salariés) ; formation 0,55 % (< 11 salariés) ; taxe d'apprentissage 0,59 % + 0,09 % ; CSG 9,2 % (6,8 % déductible, 2,4 % imposable) + CRDS 0,5 % sur 98,25 % du brut (jusqu'à 4 Pass) ; Agirc-Arrco T1 7,87 % (4,72 employeur / 3,15 salarié), CEG 2,15 % (1,29 / 0,86) ; AT/MP moyen 2,08 % ; prévoyance cadre 1,5 % T1 (hypothèse du simulateur Urssaf).
- Moteur `assimileDepuisBrut` : écart < 0,3 % avec le simulateur de l'Urssaf (tests).
- Pas de réduction générale ni de taux réduits pour un mandataire sans contrat de travail (cohérent avec le simulateur Urssaf).

## Sociétés, dividendes
- IS : 15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà ; taux réduit si capital entièrement libéré et détenu à 75 % au moins par des personnes physiques [spIs]. (Condition de CA < 10 M€ : **ne pas citer**, non relue.)
- Dividendes : PFU 31,4 % = 12,8 % impôt + 18,6 % prélèvements sociaux ; option barème avec abattement de 40 % [spDividendes]. PFNL de 12,8 % prélevé à la source.
- Gérant majoritaire : dividendes au-delà de 10 % du capital social, des primes d'émission et des comptes courants d'associé soumis aux cotisations TNS [spDividendes, urssafReforme].
- Moteur : `impotSocietes`, `pfu`, `dividendesSoumisTNS`, `comparer`, `enMicro`, `enEI`, `enEURL`, `enSASU`, `enPortage`, `sasuPart`, `eurlPart`.

## Portage salarial
- Contrat tripartite ; qualification niveau 5 (bac + 2) ou 3 ans d'expérience ; le porté trouve ses clients et négocie ses prix ; CDD ≤ 18 mois renouvellements compris (report possible 3 mois) ; toujours cadre [spPortage].
- Rémunération mensuelle brute minimale : 2 517,13 € ; salaire garanti : 70 % du plafond (junior, 2 288,30 €), 75 % (senior, 2 451,75 €), 85 % (forfait jours, 2 778,65 €) ; intègre salaire de base, congés payés et prime d'apport d'affaires de 5 % ; réserve financière de 10 % du salaire de base de la dernière mission (CDI) ou indemnité de précarité (CDD) [spPortage].
- Garantie financière de la société de portage : ≥ 10 % de la masse salariale, au moins 96 120 € ; compte d'activité mensuel [spPortage].
- Frais de gestion : fixés par contrat, **aucun barème officiel** : toujours une saisie, jamais un « taux moyen ».
- Moteur `portage` (grille du modèle Urssaf, cadre, CDI, 20 salariés).

## Interdits (non vérifiés ou hors champ)
- Taux de TVA (20 %…), ARE et son montant, retraite (nombre de trimestres validés par niveau de CA), chiffres de l'Insee sur le nombre d'auto-entrepreneurs ou leurs revenus moyens, coût d'une création (greffe, annonce légale), tarifs d'experts-comptables, de banques ou de legaltechs, frais de portage « moyens », condition de CA < 10 M€ pour l'IS, CEHR, réformes annoncées non votées.
- Aucun lien hors sources officielles ; aucun nom de banque, legaltech, plateforme de portage ou cabinet ; aucun lien vers un site du portefeuille (brutanet.fr, calculaides.fr, taxinoir.fr, pensionretraite.com…).
