/**
 * Portage salarial : le chiffre d'affaires facturé au client, moins les frais de gestion de la société
 * de portage et les frais professionnels remboursés, finance le coût employeur du salaire du porté.
 * Le passage du coût au brut puis au net vient d'une grille calculée par le modèle publié par
 * l'Urssaf (scripts/build-portage.mjs) : réductions de cotisations et taux réduits compris.
 * Les frais de gestion sont fixés par contrat : c'est une saisie, pas un barème.
 */
import grille from '../../data/portage-grille.json';
import { P } from './params';

const L = grille.lignes as number[][];
function interpCol(xCol: number, yCol: number, x: number): number {
  if (x <= L[0][xCol]) return L[0][yCol] * (x / L[0][xCol]);
  for (let k = 1; k < L.length; k++) {
    if (x <= L[k][xCol]) { const a = L[k - 1], b = L[k]; return a[yCol] + ((x - a[xCol]) / (b[xCol] - a[xCol])) * (b[yCol] - a[yCol]); }
  }
  const a = L[L.length - 2], b = L[L.length - 1];
  return b[yCol] + ((x - b[xCol]) / (b[xCol] - a[xCol])) * (b[yCol] - a[yCol]);
}

export interface PortageOut { ca: number; fraisGestion: number; fraisPro: number; cout: number; brut: number; net: number; netImposable: number; cotisations: number; netMensuel: number; sousMinimum: boolean }

export function portage(caAnnuel: number, tauxFraisGestion: number, fraisProAnnuels = 0): PortageOut {
  const ca = Math.max(0, caAnnuel);
  const fraisGestion = ca * Math.min(1, Math.max(0, tauxFraisGestion));
  const fraisPro = Math.min(Math.max(0, fraisProAnnuels), ca - fraisGestion);
  const cout = Math.max(0, ca - fraisGestion - fraisPro);
  const coutM = cout / 12;
  const brutM = coutM > 0 ? interpCol(2, 0, coutM) : 0;
  const netM = brutM > 0 ? interpCol(0, 1, brutM) : 0;
  const impM = brutM > 0 ? interpCol(0, 3, brutM) : 0;
  return { ca, fraisGestion, fraisPro, cout, brut: brutM * 12, net: netM * 12 + fraisPro, netImposable: impM * 12, cotisations: cout - netM * 12, netMensuel: netM + fraisPro / 12, sousMinimum: brutM > 0 && brutM < P.portage.minimum_brut_mensuel };
}
