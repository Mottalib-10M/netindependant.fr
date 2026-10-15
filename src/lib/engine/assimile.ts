/**
 * Dirigeant assimilé salarié (président de SAS ou de SASU, gérant minoritaire de SARL) : cotisations
 * du régime général sur la rémunération brute, sans assurance chômage ni AGS (pas de contrat de
 * travail), sans réduction générale ni taux réduits (réservés aux salariés). Taux 2026 : urssaf.fr
 * (secteur privé) ; ventilation alignée sur le modèle publié par l'Urssaf (mon-entreprise).
 * Hypothèses : entreprise de moins de 11 salariés, taux AT/MP moyen 2026 (2,08 %), prévoyance cadre de
 * 1,5 % sur la tranche 1 comme dans le simulateur de l'Urssaf, sans mutuelle.
 */
import { P, PASS, clamp } from './params';

const E = P.assimile.employeur, S = P.assimile.salarie, C = P.assimile.csg;
const T2MAX = P.assimile.tranche2_plafond_pass * PASS;

export interface AssimileOut {
  brut: number; employeur: number; salarie: number; csgCrds: number; net: number; netImposable: number; cout: number;
  lignes: { maladie: number; vieillesse: number; allocations: number; retraiteCompl: number; autres: number; csg: number };
}

export function assimileDepuisBrut(brutAnnuel: number): AssimileOut {
  const b = Math.max(0, brutAnnuel);
  const t1 = Math.min(b, PASS), t2 = clamp(b - PASS, 0, T2MAX - PASS);
  const maladie = E.maladie * b;
  const vieillesse = E.vieillesse_plafonnee * t1 + E.vieillesse_deplafonnee * b;
  const allocations = E.alloc_familiales * b;
  const retraiteE = E.agirc_t1 * t1 + E.agirc_t2 * t2 + E.ceg_t1 * t1 + E.ceg_t2 * t2 + (b > PASS ? E.cet * Math.min(b, T2MAX) : 0);
  const prevoyance = E.prevoyance_cadre_t1 * t1;
  const autresE = E.atmp * b + E.fnal * t1 + E.csa * b + E.formation * b + E.taxe_apprentissage * b + prevoyance;
  const employeur = maladie + vieillesse + allocations + retraiteE + autresE;
  const vieillesseS = S.vieillesse_plafonnee * t1 + S.vieillesse_deplafonnee * b;
  const retraiteS = S.agirc_t1 * t1 + S.agirc_t2 * t2 + S.ceg_t1 * t1 + S.ceg_t2 * t2 + (b > PASS ? S.cet * Math.min(b, T2MAX) : 0);
  const baseCsg = C.assiette * Math.min(b, C.abattement_plafond_pass * PASS) + Math.max(0, b - C.abattement_plafond_pass * PASS) + prevoyance;
  const csgCrds = baseCsg * (C.deductible + C.non_deductible + C.crds);
  const salarie = vieillesseS + retraiteS;
  const net = b - salarie - csgCrds;
  const netImposable = net + baseCsg * (C.non_deductible + C.crds) + prevoyance;
  return { brut: b, employeur, salarie, csgCrds, net, netImposable, cout: b + employeur,
    lignes: { maladie, vieillesse: vieillesse + vieillesseS, allocations, retraiteCompl: retraiteE + retraiteS, autres: autresE, csg: csgCrds } };
}

/** Brut qui correspond à un coût total employeur donné (recherche par dichotomie). */
export function assimileDepuisCout(cout: number): AssimileOut {
  if (cout <= 0) return assimileDepuisBrut(0);
  let lo = 0, hi = cout;
  for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (assimileDepuisBrut(m).cout > cout) hi = m; else lo = m; }
  return assimileDepuisBrut(lo);
}

/** Brut qui donne un net (avant impôt) voulu. */
export function assimileDepuisNet(net: number): AssimileOut {
  if (net <= 0) return assimileDepuisBrut(0);
  let lo = 0, hi = net * 2;
  for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (assimileDepuisBrut(m).net > net) hi = m; else lo = m; }
  return assimileDepuisBrut(lo);
}
