/**
 * Cotisations des travailleurs indépendants « classiques » (entreprise individuelle au réel, gérant
 * majoritaire d'EURL ou de SARL), barèmes 2026 après la réforme de l'assiette : assiette unique =
 * revenu brut social diminué d'un abattement de 26 % (au moins 1,76 % et au plus 130 % du Pass),
 * sur laquelle se calculent cotisations et CSG-CRDS. Artisans, commerçants et professions libérales
 * non réglementées. Sources : urssaf.fr (taux 2026, page de la réforme), décret n° 2024-688.
 * Hors champ : professions libérales réglementées (Cipav, CARMF…), conjoint collaborateur, outre-mer.
 */
import { P, PASS, clamp } from './params';

const T = P.tns;

/** Taux maladie progressif pour une assiette (fraction du Pass), interpolé entre les points publiés. */
export function tauxMaladie(a: number): number {
  const x = a / PASS;
  const pts = T.maladie.points as number[][];
  if (x <= pts[0][0]) return pts[0][1];
  for (let k = 1; k < pts.length; k++) {
    const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts[pts.length - 1][1];
}

export interface TnsOptions { artisan?: boolean; acre?: boolean }
export interface TnsOut {
  brutSocial: number; abattement: number; assiette: number;
  maladie: number; ij: number; retraiteBase: number; retraiteCompl: number; invalidite: number; allocations: number; csgCrds: number; cfp: number;
  exonerationAcre: number;
  cotisations: number;        // total, CSG-CRDS et CFP compris
  csgNonDeductible: number;   // part non déductible du revenu imposable (2,9 % de l'assiette)
  deductible: number;         // ce qui se déduit du revenu imposable
}

/** Abattement forfaitaire de 26 % borné entre 1,76 % et 130 % du Pass (décret n° 2024-688). */
export function abattementForfaitaire(brutSocial: number): number {
  if (brutSocial <= 0) return 0;
  return Math.min(brutSocial, clamp(brutSocial * T.abattement, T.abattement_min_pass * PASS, T.abattement_max_pass * PASS));
}

export function cotisationsTNS(brutSocial: number, o: TnsOptions = {}): TnsOut {
  const R = Math.max(0, brutSocial);
  const abattement = abattementForfaitaire(R);
  const A = Math.max(0, R - abattement);
  const a3 = Math.min(A, T.maladie.plafond_progressif_pass * PASS);
  const maladie = tauxMaladie(a3) * a3 + T.maladie.taux_au_dela * Math.max(0, A - T.maladie.plafond_progressif_pass * PASS);
  const ij = T.ij.taux * clamp(A, T.ij.assiette_min_pass * PASS, T.ij.plafond_pass * PASS);
  const retraiteBase = T.retraite_base.t1 * Math.max(Math.min(A, PASS), T.retraite_base.assiette_min) + T.retraite_base.t2 * Math.max(0, A - PASS);
  const retraiteCompl = T.retraite_compl.t1 * Math.min(A, PASS) + T.retraite_compl.t2 * clamp(A - PASS, 0, (T.retraite_compl.plafond_pass - 1) * PASS);
  const invalidite = T.invalidite_deces.taux * clamp(A, T.invalidite_deces.assiette_min_pass * PASS, PASS);
  const af = T.alloc_familiales;
  const tAf = A <= af.seuil_pass * PASS ? 0 : A >= af.plein_pass * PASS ? af.taux : af.taux * (A / PASS - af.seuil_pass) / (af.plein_pass - af.seuil_pass);
  const allocations = tAf * A;
  const csgCrds = T.csg_crds.total * A;
  const cfp = (o.artisan ? T.cfp.artisan : T.cfp.commercant) * PASS;
  let exonerationAcre = 0;
  if (o.acre) {
    const exo = (maladie + ij + allocations + retraiteBase + invalidite) * T.acre.part_exoneree;
    const s = T.acre.seuil_pass * PASS, p = T.acre.plafond_pass * PASS;
    exonerationAcre = A <= s ? exo : A >= p ? 0 : exo * (p - A) / (p - s);
  }
  const cotisations = maladie + ij + retraiteBase + retraiteCompl + invalidite + allocations + csgCrds + cfp - exonerationAcre;
  const csgNonDeductible = T.csg_crds.non_deductible * A;
  return { brutSocial: R, abattement, assiette: A, maladie, ij, retraiteBase, retraiteCompl, invalidite, allocations, csgCrds, cfp, exonerationAcre, cotisations, csgNonDeductible, deductible: cotisations - csgNonDeductible };
}

/** Entreprise individuelle au réel (ou EURL à l'IR) : bénéfice avant cotisations → net avant impôt et bénéfice imposable. */
export function eiReel(beneficeAvantCotisations: number, o: TnsOptions = {}) {
  const c = cotisationsTNS(beneficeAvantCotisations, o);
  const netAvantImpot = beneficeAvantCotisations - c.cotisations;
  const imposable = Math.max(0, beneficeAvantCotisations - c.deductible);
  return { ...c, netAvantImpot, imposable };
}
