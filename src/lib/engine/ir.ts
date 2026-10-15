/**
 * Impôt sur le revenu : barème de la loi de finances pour 2026 (revenus 2025, le dernier publié),
 * quotient familial et son plafonnement (1 807 € par demi-part), décote, seuil de recouvrement.
 * Sources : service-public F1419, F34328, F2705. Non modélisé : contribution exceptionnelle sur les
 * hauts revenus, réductions et crédits d'impôt.
 */
import { P } from './params';

/** Impôt brut pour UNE part, quotient q. */
export function impotParPart(q: number): number {
  let prev = 0, imp = 0;
  for (const [plafond, taux] of P.ir.bareme as Array<[number | null, number]>) {
    const haut = plafond ?? Infinity;
    if (q > prev) imp += (Math.min(q, haut) - prev) * taux;
    prev = haut;
  }
  return imp;
}
/** Taux marginal pour un quotient. */
export function tmi(q: number): number {
  let prev = 0;
  for (const [plafond, taux] of P.ir.bareme as Array<[number | null, number]>) {
    const haut = plafond ?? Infinity;
    if (q <= haut && q > prev) return taux;
    prev = haut;
  }
  return 0;
}

export interface Foyer { parts: number; couple: boolean }
export const FOYER_SEUL: Foyer = { parts: 1, couple: false };

export interface ImpotDetail { brutAvantDecote: number; decote: number; impot: number; tmi: number; plafonnement: boolean }

/** Impôt du foyer sur un revenu net imposable. `parts` = parts totales (1 personne seule, 2 couple, + 0,5 par enfant…). */
export function impotRevenu(revenu: number, foyer: Foyer = FOYER_SEUL): ImpotDetail {
  const R = Math.max(0, revenu);
  const base = foyer.couple ? 2 : 1;
  const parts = Math.max(base, foyer.parts);
  const avec = impotParPart(R / parts) * parts;
  const sans = impotParPart(R / base) * base;
  const demiParts = (parts - base) * 2;
  const plafonne = sans - demiParts * P.ir.plafond_demi_part;
  const plafonnement = demiParts > 0 && plafonne > avec;
  const brut = plafonnement ? plafonne : avec;
  const d = foyer.couple ? P.ir.decote.couple : P.ir.decote.seul;
  const decote = brut <= d.plafond ? Math.max(0, Math.min(brut, d.forfait - P.ir.decote.taux * brut)) : 0;
  let impot = Math.max(0, brut - decote);
  if (impot < P.ir.seuil_recouvrement) impot = 0;
  return { brutAvantDecote: brut, decote, impot, tmi: tmi(R / parts), plafonnement };
}

/** Impôt imputable à un revenu ajouté à d'autres revenus du foyer (différence entre les deux impôts). */
export function impotMarginal(revenuAjoute: number, autres: number, foyer: Foyer = FOYER_SEUL): number {
  return impotRevenu(autres + Math.max(0, revenuAjoute), foyer).impot - impotRevenu(autres, foyer).impot;
}

/** Abattement de 10 % sur une rémunération imposée comme un salaire (min 509 €, max 14 555 €). */
export function abattementSalaire(x: number): number {
  if (x <= 0) return 0;
  const a = P.ir.abattement_salaires;
  return Math.min(x, Math.min(a.max, Math.max(a.min, x * a.taux)));
}
