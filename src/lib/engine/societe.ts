/**
 * Société à l'impôt sur les sociétés : IS (15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà, pour une
 * PME dont le capital est entièrement libéré et détenu à 75 % au moins par des personnes physiques),
 * dividendes au prélèvement forfaitaire unique de 31,4 % (12,8 % d'impôt + 18,6 % de prélèvements
 * sociaux) ou au barème après abattement de 40 %. Sources : service-public F23575 et F32963.
 */
import { P } from './params';

export function impotSocietes(benefice: number): { is: number; reduit: number; normal: number } {
  const b = Math.max(0, benefice);
  const reduit = Math.min(b, P.is.seuil_reduit) * P.is.taux_reduit;
  const normal = Math.max(0, b - P.is.seuil_reduit) * P.is.taux_normal;
  return { is: reduit + normal, reduit, normal };
}

/** Dividendes au PFU : `soumisCotisations` = part déjà soumise aux cotisations TNS (gérant majoritaire),
 *  qui ne supporte pas une seconde fois les prélèvements sociaux. */
export function pfu(dividendes: number, soumisCotisations = 0): { ir: number; ps: number; total: number; net: number } {
  const d = Math.max(0, dividendes);
  const ir = d * P.dividendes.pfu_ir;
  const ps = Math.max(0, d - soumisCotisations) * P.dividendes.prelevements_sociaux;
  return { ir, ps, total: ir + ps, net: d - ir - ps };
}

/** Part des dividendes d'un gérant majoritaire soumise aux cotisations : au-delà de 10 % du capital,
 *  des primes d'émission et des comptes courants d'associé. */
export function dividendesSoumisTNS(dividendes: number, capitalEtComptes: number): number {
  return Math.max(0, dividendes - P.dividendes.seuil_tns_capital * Math.max(0, capitalEtComptes));
}
