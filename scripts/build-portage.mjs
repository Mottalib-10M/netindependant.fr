/**
 * Grille du salaire porté (portage salarial) : pour chaque salaire brut mensuel, le net à payer avant
 * impôt, le coût total employeur et le net imposable, calculés par le modèle social publié par
 * l'Urssaf (paquet npm modele-social, licence MIT, celui de mon-entreprise.urssaf.fr).
 * Hypothèses : CDI, statut cadre (le salarié porté relève toujours de la classification cadre,
 * service-public F31620), entreprise de portage de 20 salariés, sans mutuelle ni versement mobilité.
 * Rejouer : node scripts/build-portage.mjs  → src/data/portage-grille.json
 */
import rules from 'modele-social';
import Engine from 'publicodes';
import { writeFileSync, readFileSync } from 'node:fs';
const e = new Engine(rules, { logger: { log() {}, warn() {}, error() {} } });
const rows = [];
for (let brut = 1800; brut <= 25000; brut += 50) {
  e.setSituation({ 'salarié . contrat . salaire brut': `${brut} €/mois`, 'salarié . contrat . statut cadre': 'oui', 'entreprise . salariés . effectif': '20', 'salarié . cotisations . prévoyances . santé . montant': '0 €/mois' });
  const v = (n) => Math.round(e.evaluate(n).nodeValue * 100) / 100;
  rows.push([brut, v('salarié . rémunération . net . à payer avant impôt'), v('salarié . coût total employeur'), v('salarié . rémunération . net . imposable')]);
}
const ver = JSON.parse(readFileSync(new URL('../node_modules/modele-social/package.json', import.meta.url))).version;
writeFileSync(new URL('../src/data/portage-grille.json', import.meta.url), JSON.stringify({ _source: `modele-social ${ver} (Urssaf), date du modèle ${rules.date}`, colonnes: ['brut_mensuel', 'net_mensuel', 'cout_employeur_mensuel', 'net_imposable_mensuel'], lignes: rows }));
console.log(rows.length, 'lignes');
