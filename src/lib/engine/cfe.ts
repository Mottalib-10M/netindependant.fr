/**
 * Cotisation foncière des entreprises sans local (base minimum) : la base minimum votée par la commune
 * pour la tranche de chiffre d'affaires de l'année N-2, multipliée par le taux global de CFE de la
 * commune (commune, intercommunalité, syndicats, taxes spéciales d'équipement, Gemapi, taxes
 * additionnelles régionales), plus la taxe additionnelle pour les CCI (1,12 % de la base, hors
 * artisans) et 1 % de frais de gestion. Exonération l'année de création, base réduite de moitié
 * l'année suivante, exonération si le CA de N-2 ne dépasse pas 5 000 €. Service-public F23547 ;
 * taux et bases : fichier REI 2025 de la DGFiP.
 */
import { P } from './params';

export function trancheCFE(ca: number): number {
  const t = P.cfe.tranches_ca;
  for (let k = 0; k < t.length; k++) if (ca <= t[k]) return k;
  return t.length;
}

export interface Commune { c: string; n: string; t: number; b: Array<number | null> }
export interface CfeOut { tranche: number; base: number | null; cfe: number; taxeCci: number; frais: number; total: number; exoneree: boolean; raison: '' | 'creation' | 'ca' | 'base' }

/** `annee` : 1 = année de création, 2 = année suivante, 3 = ensuite. `taux` en fraction (0,3034 = 30,34 %). */
export function cfe(caN2: number, taux: number, bases: Array<number | null>, annee = 3, artisan = false): CfeOut {
  const tranche = trancheCFE(caN2);
  const vide = (raison: CfeOut['raison'], base: number | null = null): CfeOut => ({ tranche, base, cfe: 0, taxeCci: 0, frais: 0, total: 0, exoneree: true, raison });
  if (annee <= 1) return vide('creation');
  if (caN2 <= P.cfe.exoneration_ca) return vide('ca');
  const b0 = bases[tranche];
  if (b0 == null) return vide('base');
  const base = b0 * (annee === 2 ? 1 - P.cfe.reduction_annee_2 : 1);
  const c = base * taux;
  const taxeCci = artisan ? 0 : base * P.cfe.taxe_additionnelle_cci;
  const frais = (c + taxeCci) * P.cfe.frais_gestion;
  return { tranche, base, cfe: c, taxeCci, frais, total: c + taxeCci + frais, exoneree: false, raison: '' };
}

/** Fourchette nationale de la base minimum pour une tranche (service-public F23547). */
export const basesBornes = (tranche: number) => P.cfe.base_min_bornes[tranche] as [number, number];
