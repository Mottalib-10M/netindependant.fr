/**
 * Micro-entreprise (auto-entrepreneur) 2026 : cotisations sur le chiffre d'affaires encaissé, CFP,
 * taxe pour frais de chambre, Acre, versement libératoire ou impôt au barème après abattement,
 * plafonds et franchise de TVA. Sources : autoentrepreneur.urssaf.fr, service-public F36232, F32353,
 * F23267, F21746, impots.gouv.fr. Les taux sont ceux de params-2026.json.
 */
import { P } from './params';
import { impotMarginal, type Foyer, FOYER_SEUL } from './ir';

export type Activite = 'vente' | 'bic' | 'bnc' | 'cipav';
/** 'non' : pas d'Acre ; 'avant' : début d'activité jusqu'au 30 juin 2026 ; 'depuis' : à partir du 1er juillet 2026. */
export type Acre = 'non' | 'avant' | 'depuis';
export const ACTIVITES: Activite[] = ['vente', 'bic', 'bnc', 'cipav'];

export interface MicroInput {
  ca: number;               // chiffre d'affaires annuel encaissé, hors taxe
  activite: Activite;
  artisan?: boolean;        // BIC inscrit au répertoire des métiers (CFP 0,3 %, chambre des métiers)
  acre?: Acre;
  vl?: boolean;             // versement libératoire
  chambre?: boolean;        // taxe pour frais de chambre (CCI ou CMA), défaut : oui pour vente et BIC
  autres?: number;          // autres revenus nets imposables du foyer
  foyer?: Foyer;
  cfe?: number;             // CFE annuelle (calculée à part, voir cfe.ts)
  charges?: number;         // dépenses réelles de l'activité (non déductibles en micro, mais payées)
}

export interface MicroOut {
  taux: number; cotisations: number; cfp: number; tfc: number; vl: number; ir: number; cfe: number; charges: number;
  revenuApresCotisations: number; revenuAbattu: number; abattement: number; net: number; netMensuel: number;
  plafond: number; depassePlafond: boolean; tvaSeuil: number; tvaMajore: number; tvaStatut: 'franchise' | 'tolerance' | 'redevable';
  tauxGlobal: number;
}

export const tauxCotisation = (a: Activite, acre: Acre = 'non') =>
  acre === 'avant' ? P.micro.acre.taux_acre_avant[a] : acre === 'depuis' ? P.micro.acre.taux_acre_depuis[a] : P.micro.taux[a];

export const tauxCfp = (a: Activite, artisan = false) =>
  a === 'bnc' || a === 'cipav' ? P.micro.cfp.liberal : artisan ? P.micro.cfp.artisan : P.micro.cfp.commercant;

export function tauxTfc(a: Activite, artisan = false): number {
  if (a === 'bnc' || a === 'cipav') return 0;
  const t = P.micro.tfc;
  if (artisan) return a === 'vente' ? t.artisan_vente : t.artisan_service;
  return a === 'vente' ? t.commerce_vente : t.commerce_service;
}

export const abattementTaux = (a: Activite) => (a === 'vente' ? P.micro.abattement.vente : a === 'bic' ? P.micro.abattement.bic : P.micro.abattement.bnc);
/** Revenu imposable au barème : CA moins l'abattement forfaitaire (au moins 305 €, sans dépasser le CA). */
export function revenuAbattu(ca: number, a: Activite): { abattement: number; revenu: number } {
  if (ca <= 0) return { abattement: 0, revenu: 0 };
  const ab = Math.min(ca, Math.max(P.micro.abattement.minimum, ca * abattementTaux(a)));
  return { abattement: ab, revenu: ca - ab };
}
export const plafondCA = (a: Activite) => (a === 'vente' ? P.micro.plafonds.vente : P.micro.plafonds.services);
export const tvaSeuils = (a: Activite) => (a === 'vente' ? P.tva.vente : P.tva.services);
export const tauxVL = (a: Activite) => P.micro.vl[a];

export function micro(i: MicroInput): MicroOut {
  const ca = Math.max(0, i.ca);
  const a = i.activite;
  const taux = tauxCotisation(a, i.acre ?? 'non');
  const cotisations = ca * taux;
  const cfp = ca * tauxCfp(a, i.artisan);
  const tfc = (i.chambre ?? true) ? ca * tauxTfc(a, i.artisan) : 0;
  const { abattement, revenu } = revenuAbattu(ca, a);
  const vl = i.vl ? ca * tauxVL(a) : 0;
  const ir = i.vl ? 0 : impotMarginal(revenu, i.autres ?? 0, i.foyer ?? FOYER_SEUL);
  const cfe = Math.max(0, i.cfe ?? 0);
  const charges = Math.max(0, i.charges ?? 0);
  const revenuApresCotisations = ca - cotisations - cfp - tfc;
  const net = revenuApresCotisations - vl - ir - cfe - charges;
  const s = tvaSeuils(a);
  const tvaStatut = ca <= s.seuil ? 'franchise' : ca <= s.majore ? 'tolerance' : 'redevable';
  return {
    taux, cotisations, cfp, tfc, vl, ir, cfe, charges, revenuApresCotisations, revenuAbattu: revenu, abattement,
    net, netMensuel: net / 12, plafond: plafondCA(a), depassePlafond: ca > plafondCA(a),
    tvaSeuil: s.seuil, tvaMajore: s.majore, tvaStatut, tauxGlobal: ca > 0 ? (ca - net - charges) / ca : 0,
  };
}

/** Seuil de RFR par part pour le versement libératoire (2026 : RFR 2024 ; 2027 : RFR 2025). */
export function seuilVL(parts: number, annee: 2026 | 2027 = 2026): number {
  const s = annee === 2026 ? P.micro.vl_seuil_rfr_par_part.y2026 : P.micro.vl_seuil_rfr_par_part.y2027;
  return s * parts;
}

/** Plafond proratisé l'année de création : seuil × jours d'activité / 365 (service-public F32353). */
export function plafondProrata(a: Activite, joursActivite: number): number {
  return plafondCA(a) * Math.min(365, Math.max(0, joursActivite)) / 365;
}
