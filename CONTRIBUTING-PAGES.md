# Ajouter une page à NetIndé (fr-freelance)

Notice pour les agents qui écrivent ou prolongent le site. À lire en entier, avec `~/Documents/GitHub/RECETTE-SITE.md` §6 (unicité), §7 (FAQ), §9 et §9.3 (écriture, mini-simulateurs), §11 (titres), §17.4 (règle de vérité), §21 (bloc citable). Les faits autorisés sont dans `research/faits.md` : **rien d'autre ne s'écrit**.

Site : se mettre à son compte en France et ce qu'il reste en net. Micro-entreprise, EI au réel, EURL, SASU, portage salarial, TJM. Français (`/fr/`) et anglais (`/en/`, pour une personne venue de l'étranger qui veut se mettre à son compte en France). Nom provisoire NetIndé, URL provisoire `fr-freelance.example`. Éditeur : Radif Partners (jamais de nom de personne).

## Principe : une page = un fichier

- Un guide = `src/content/guides/<id>.ts`. Une page outil = `src/content/outils/<id>.ts` (champ `tool`).
- Le fichier porte tout, dans les deux langues. Le cœur (routes, menus, sitemap, hreflang, schémas, maillage) le lit seul. **Ne modifiez aucun fichier du cœur** (`components`, `layouts`, `i18n`, `lib/engine`, `lib/helpers.ts`, `data/params-2026.json`…). Si un paramètre manque, signalez-le : ne l'écrivez pas en dur.
- Modèle de structure (jamais de phrases) : `src/content/guides/charges-auto-entrepreneur.ts`. Modèles d'outils : `src/content/outils/*.ts`.
- Mini-simulateurs : `src/lib/minis/<kind>.ts`, déjà écrits (liste plus bas). Chaque guide en a un, propre à son sujet. Un nouveau mini se crée seulement si aucun ne convient, sur le modèle de `netMicro.ts`, en appelant le moteur.

## Le moteur et les paramètres

| Module | Fonctions |
|---|---|
| `lib/engine/micro.ts` | `micro({ ca, activite: 'vente'\|'bic'\|'bnc'\|'cipav', artisan?, acre?: 'non'\|'avant'\|'depuis', vl?, chambre?, autres?, foyer?, cfe?, charges? })` → `taux, cotisations, cfp, tfc, vl, ir, revenuAbattu, abattement, net, netMensuel, plafond, depassePlafond, tvaSeuil, tvaMajore, tvaStatut` ; `tauxCotisation`, `revenuAbattu`, `plafondProrata(activite, jours)`, `seuilVL(parts, 2026\|2027)` |
| `lib/engine/ir.ts` | `impotRevenu(revenu, { parts, couple })` → `impot, tmi, decote…` ; `impotMarginal(ajout, autres, foyer)` ; `abattementSalaire(x)` |
| `lib/engine/tns.ts` | `cotisationsTNS(brutSocial, { artisan?, acre? })` → `assiette, maladie, ij, retraiteBase, retraiteCompl, invalidite, allocations, csgCrds, cfp, cotisations, deductible` ; `eiReel(benefice)` |
| `lib/engine/assimile.ts` | `assimileDepuisBrut(brutAnnuel)` → `net, cout, employeur, salarie, csgCrds, netImposable` ; `assimileDepuisCout`, `assimileDepuisNet` |
| `lib/engine/societe.ts` | `impotSocietes(benef)`, `pfu(dividendes, soumisCotisations?)`, `dividendesSoumisTNS(div, capital)` |
| `lib/engine/statuts.ts` | `comparer({ ca, charges, activite, foyer?, autres?, capital?, fraisPortage? })` → `{ micro, ei, eurl, sasu, portage }` avec `net, netMensuel, cotisations, impotSocietes, prelevementsDividendes, impotRevenu, partRemuneration, possible` ; `enMicro`, `enEI`, `enEURL`, `enSASU`, `enPortage`, `sasuPart(i, part)`, `eurlPart(i, part)` |
| `lib/engine/portage.ts` | `portage(ca, tauxFraisGestion, fraisPro)` |
| `lib/engine/cfe.ts` + `lib/cfe-data.ts` | `cfe(caN2, taux, bases, annee, artisan)` ; `commune(dep, codeInsee)` pour lire une commune au build |

Paramètres : `src/data/params-2026.json` (lisez-le en entier). Dans `body(h)` : `h.P.micro.taux.bnc`, `h.pct(…)`, `h.eur(…)`. Dans `resume` et `faqs` (chaînes) : `import { P, FR, EN } from '../../lib/fmt'` puis `${FR.pct(P.micro.taux.bnc)}`. **Une valeur réglementaire ne s'écrit jamais en dur** (« 25,6 % », « 83 600 € ») : seuls `title` et `description` sont des chaînes fixes, et tout nombre qui y figure doit apparaître aussi dans le texte rendu de la page. Les exemples chiffrés (« il reste 2 431 € ») viennent du moteur, calculés en tête du fichier.

## Les champs (`src/lib/guide-types.ts`)

| Champ | Règle |
|---|---|
| `id` | = nom du fichier, pris dans le plan ci-dessous. Liens : `h.a('sasu', 'texte')`. |
| `group` | `micro`, `creation`, `statuts`, `freelance` (imposé par le plan). |
| `order` | place dans le groupe, par pas de 10 (imposé par le plan). |
| `mini` | le mini-simulateur imposé par le plan. `miniDefaults` pour régler ses valeurs de départ (ex. `{ act: 0 }`). |
| `miniHref` | facultatif : page cible du bouton du mini (défaut : l'accueil). |
| `related` | 3 à 6 id du plan, voisins du sujet. |
| `sources` | 2 clés au moins de `params-2026.json > sources`. |

| Texte (`fr`, `en`) | Règle |
|---|---|
| `slug` | imposé par le plan. |
| `nav` | libellé court du menu. `card` : une phrase pour les cartes « À voir aussi ». |
| `title` | **50 à 60 caractères**, « 2026 » dedans, terme-clé en tête (la requête), jamais en tête : France/French, Simulateur, Calcul, Calculator, Comment, Quel, How, What, About, FAQ. Le mot d'outil peut venir après. Unique sur le site. |
| `description` | **150 à 160 caractères**, « 2026 » dedans, un fait chiffré. Unique. |
| `h1` | sans année. `intro` : une phrase. |
| `resume` | **UN** paragraphe d'au moins 120 mots, texte brut (ni lien ni HTML), le chiffre d'abord : la réponse à la requête (§21). |
| `faqs` | 4 à 8 vraies questions, comme on les tape, réponses de **40 à 90 mots** avec chiffre, condition et source. Une question n'existe qu'**une fois sur tout le site**, fr et en compris. |
| `body` | `(h) => string` HTML (`h2`, `h3`, `p`, `ul`, `ol`, `h.table(entêtes, lignes, légende, alignements)`). Total (resume + FAQ + body) ≥ **1 100 mots** par langue pour un guide, ≥ 650 pour une page TJM (`tjm-300`… : un tableau généré par le moteur obligatoire). `<!--mini:kind-->` insère un mini-simulateur de plus. |

Outils `h` : `h.a(id, texte)`, `h.eur(n, décimales?)`, `h.num(n)`, `h.pct(fraction, décimales?)`, `h.date(iso)`, `h.table(...)`, `h.src(clé, texte)`, `h.P`.

## Le plan (id · groupe · ordre · mini · slug fr · slug en)

Déjà écrites : `home` (accueil), `charges-auto-entrepreneur`, outils `comparateur-statuts`, `cfe-auto-entrepreneur`, `sasu`, `eurl`, `tjm-freelance`, `portage-salarial`, et `method`, `about`.

| id | groupe | ordre | mini | slug fr | slug en | requête visée |
|---|---|---|---|---|---|---|
| micro-entreprise | micro | 20 | netMicro | micro-entreprise | micro-enterprise-scheme | micro entreprise, micro entrepreneur |
| plafond-micro-entreprise | micro | 30 | plafond | plafond-micro-entreprise | turnover-ceiling | plafond micro entreprise, plafond auto entrepreneur |
| tva-auto-entrepreneur | micro | 40 | tvaFranchise | tva-auto-entrepreneur | vat-exemption-threshold | tva auto entrepreneur seuil |
| versement-liberatoire | micro | 50 | vlCompare | versement-liberatoire | flat-rate-income-tax | versement libératoire |
| acre-auto-entrepreneur | micro | 70 | acreGain | acre-auto-entrepreneur | acre-start-up-relief | acre auto entrepreneur, aide auto entrepreneur |
| impot-auto-entrepreneur | micro | 80 | impotMicro | impot-auto-entrepreneur | income-tax-micro-enterprise | impot auto entrepreneur |
| micro-ou-reel | micro | 90 | microOuReel | micro-entreprise-ou-reel | micro-or-real-profit | micro ou réel |
| auto-entrepreneur-salarie | micro | 100 | cumulSalarie | auto-entrepreneur-et-salarie | side-business-with-a-job | auto entrepreneur et salarié |
| auto-entrepreneur-vente | micro | 110 | netActivite (`miniDefaults: { act: 0 }`) | auto-entrepreneur-vente-marchandises | selling-goods-micro | auto entrepreneur vente |
| auto-entrepreneur-artisan | micro | 120 | netActivite (`{ act: 2 }`) | auto-entrepreneur-artisan | craft-trade-micro | auto entrepreneur artisan |
| auto-entrepreneur-liberal | micro | 130 | netActivite (`{ act: 3 }`) | auto-entrepreneur-profession-liberale | freelance-professions-bnc | auto entrepreneur prestation de service, BNC |
| auto-entrepreneur-cipav | micro | 140 | netActivite (`{ act: 4 }`) | auto-entrepreneur-cipav | cipav-professions | auto entrepreneur cipav |
| creer-micro-entreprise | creation | 10 | premiereAnnee | creer-sa-micro-entreprise | register-a-micro-enterprise | creation micro entreprise, créer sa micro entreprise, creation auto entrepreneur |
| devenir-auto-entrepreneur | creation | 20 | objectifNet | devenir-auto-entrepreneur | becoming-self-employed | devenir auto entrepreneur, auto entreprise |
| declarer-chiffre-affaires | creation | 30 | declaration | declarer-chiffre-d-affaires | declaring-turnover | déclarer auto entrepreneur |
| statut-auto-entrepreneur | creation | 40 | repartition | statut-auto-entrepreneur | social-cover | statut auto entrepreneur, statut micro entrepreneur |
| eurl-ou-sasu | statuts | 40 | eurlVsSasu | eurl-ou-sasu | eurl-or-sasu | eurl ou sasu, sasu ou eurl |
| micro-ou-sasu | statuts | 50 | microVsSasu | micro-entreprise-ou-sasu | micro-enterprise-or-sasu | micro entreprise ou sasu |
| entrepreneur-individuel | statuts | 60 | eiReel | entrepreneur-individuel | sole-trader-ei | entrepreneur individuel |
| salaire-ou-dividendes | statuts | 70 | salaireDividendes | salaire-ou-dividendes | salary-or-dividends | salaire ou dividendes sasu |
| flat-tax-dividendes | statuts | 80 | pfu | dividendes-flat-tax | dividend-flat-tax | flat tax dividendes, dividendes sasu |
| dividendes-eurl | statuts | 90 | dividendesEurl | dividendes-eurl | eurl-dividends | dividendes eurl |
| impot-sur-les-societes | statuts | 100 | is | impot-sur-les-societes | corporate-tax | impôt sur les sociétés |
| charges-sasu | statuts | 110 | chargesSasu | charges-sasu | sasu-president-pay | charges sasu, statut sasu |
| cotisations-tns | statuts | 120 | cotisTns | cotisations-tns | self-employed-contributions-tns | charges eurl, cotisations tns |
| portage-ou-auto-entrepreneur | freelance | 30 | portageVsMicro | portage-salarial-ou-auto-entrepreneur | umbrella-or-micro | portage salarial ou auto entrepreneur |
| statut-freelance | freelance | 40 | statutFreelance | statut-freelance | freelance-legal-status | statut freelance |
| freelance-informatique | freelance | 50 | tjmJours | developpeur-freelance | freelance-developer | statut juridique développeur freelance |
| prestation-de-service | freelance | 60 | prixPrestation | prestation-de-service | invoicing-services | prestation de service |
| tjm-300 | freelance | 70 | tjmPalier (`{ tjm: 300 }`) | tjm-300 | day-rate-300 | tjm 300 net |
| tjm-400 | freelance | 80 | tjmPalier (`{ tjm: 400 }`) | tjm-400 | day-rate-400 | tjm 400 net |
| tjm-500 | freelance | 90 | tjmPalier (`{ tjm: 500 }`) | tjm-500 | day-rate-500 | tjm 500 net |
| tjm-600 | freelance | 100 | tjmPalier (`{ tjm: 600 }`) | tjm-600 | day-rate-600 | tjm 600 net |
| tjm-800 | freelance | 110 | tjmPalier (`{ tjm: 800 }`) | tjm-800 | day-rate-800 | tjm 800 net |

Les id de ce tableau sont dans `tests/planned-ids.json` : vous pouvez les lier avant qu'ils soient écrits.

## Ton et langue

- **Français** : voix humaine, phrases de longueur variable, le chiffre d'abord, vocabulaire de l'Urssaf et des impôts (chiffre d'affaires encaissé, déclaration, cotisations, abattement, revenu fiscal de référence). Accents partout.
- **Anglais** : pour une personne venue de l'étranger qui s'installe à son compte en France. Chaque terme français est expliqué à sa première apparition (Urssaf, micro-entrepreneur, versement libératoire, CFE, quotient familial, Siret, guichet unique…) ; montants en euros ; règles françaises, jamais une traduction mot à mot du français. Mêmes chiffres, mêmes mini-simulateurs.
- **Interdits** : tiret cadratin « — » ou « &mdash; » ; « il est important de noter », « plongeons », « que vous soyez X ou Y », « it's important to note », « dive into », « whether you're » ; triplets systématiques ; conclusion qui résume ; émojis ; listes là où une phrase suffit.
- **Unicité** (§6) : `check-unique` compare toutes les pages d'une langue (seuil 30 %, chiffres neutralisés). Chaque page parle de **son** cas : son exemple chiffré, son seuil, son piège, ses démarches, avec un vocabulaire propre. Ne recopiez aucune phrase d'une autre page, ni du modèle.
- **Pas de copie** : aucun texte repris d'un autre site, même reformulé ; aucun lien vers un site du portefeuille (brutanet.fr, calculaides.fr, taxinoir.fr, pensionretraite.com…), ni vers une banque, une legaltech, une société de portage ou un cabinet.
- **Avertissement** : chaque page rappelle sobrement qu'il s'agit d'une estimation, pas d'un conseil personnalisé ; l'Urssaf et le service des impôts fixent les montants.

## Contrôles

```bash
cd ~/Documents/GitHub/a-publier/Mottalib-10M/fr-freelance
PAGE_FILES=<id> npx vitest run tests/pages.test.ts   # une page
npx vitest run                                         # tout le moteur et toutes les pages
npm run build                                          # inclut check-snippets (bloquant)
python3 scripts/check-unique.py dist
python3 scripts/check-seo.py .
python3 scripts/check-trame.py .
python3 scripts/check-simulateurs.py .
python3 scripts/check-hreflang.py . ; python3 scripts/check-anglais.py .
python3 scripts/check-regles.py . ; python3 scripts/check-portefeuille.py .
node scripts/check-sources.mjs . ; node scripts/check-legal.mjs . ; node scripts/typo-nbsp.mjs dist --check
node scripts/check-contraste.mjs dist ; node scripts/check-nombres.mjs dist ; node scripts/check-saisie.mjs dist --max=60
node scripts/check-url-propre.mjs dist ; node scripts/check-premier-ecran.mjs .
node scripts/check-layout.mjs dist > /tmp/layout-fr-freelance.log 2>&1 &   # long
```

Serveur local : port **4383** (`npm run preview`). Pour l'arrêter : `lsof -ti tcp:4383 | xargs kill`. Playwright : `export NODE_PATH=$(npm root -g):$PWD/node_modules`.

## Données rejouables

- `scripts/build-cfe.py <REI_2025.csv> <v_commune_2025.csv> <v_departement_2025.csv>` : CFE par commune (DGFiP REI, Licence Ouverte 2.0 ; Insee COG). Sorties `public/data/cfe/*.json` et `src/data/cfe-departements.json`. Le fichier REI 2026 paraîtra vers mai 2027 : le rejouer, puis mettre `cfe.millesime_taux` à jour.
- `node scripts/build-portage.mjs` : grille de salaires du portage calculée avec le paquet `modele-social` (modèle publié par l'Urssaf, MIT). À rejouer à chaque nouvelle version du paquet.
- Tests du moteur contre ce même modèle : `tests/engine.test.ts`. Le modèle 11.1.0 ne contient pas encore la réforme 2026 des indépendants : pour l'EI et l'EURL, les tests portent sur les montants publiés par l'Urssaf.

## Ce qu'on ne fait pas

Pas de dépôt GitHub, pas de push, pas de DNS. Ne toucher ni à `_trame` ni à la RECETTE. Aucune identité personnelle : l'éditeur est Radif Partners.
