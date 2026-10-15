/**
 * Comparaison des statuts pour une même activité : ce qui reste en poche, impôt sur le revenu compris,
 * en micro-entreprise, en entreprise individuelle au réel (ou EURL à l'IR), en EURL à l'IS (gérant
 * majoritaire, travailleur indépendant), en SASU (président assimilé salarié) et en portage salarial.
 * Pour les sociétés à l'IS, le moteur cherche le partage rémunération / dividendes qui maximise le net,
 * ou applique celui que l'on impose. Hypothèses communes : tout le bénéfice restant est distribué
 * l'année même, dividendes au prélèvement forfaitaire unique, aucun autre revenu sauf `autres`.
 */
import { micro, type Activite } from './micro';
import { eiReel, cotisationsTNS } from './tns';
import { assimileDepuisCout } from './assimile';
import { impotSocietes, pfu, dividendesSoumisTNS } from './societe';
import { impotMarginal, abattementSalaire, type Foyer, FOYER_SEUL } from './ir';
import { portage } from './portage';

export type Statut = 'micro' | 'ei' | 'eurl' | 'sasu' | 'portage';
export const STATUTS: Statut[] = ['micro', 'ei', 'eurl', 'sasu', 'portage'];

export interface StatutInput {
  ca: number;                 // chiffre d'affaires annuel hors taxe
  charges: number;            // frais professionnels réels (hors rémunération du dirigeant)
  activite: Activite;         // pour la micro-entreprise
  artisan?: boolean;
  foyer?: Foyer;
  autres?: number;            // autres revenus nets imposables du foyer
  vl?: boolean;               // versement libératoire en micro
  capital?: number;           // capital + comptes courants (seuil de 10 % des dividendes en EURL)
  partRemuneration?: number;  // 0 à 1 : part du bénéfice affectée à la rémunération (sinon optimisée)
  fraisPortage?: number;      // frais de gestion du portage, fraction du CA
}

export interface StatutOut {
  statut: Statut; possible: boolean; ca: number; charges: number;
  cotisations: number; impotSocietes: number; impotRevenu: number; prelevementsDividendes: number;
  remunerationNette: number; dividendesNets: number; net: number; netMensuel: number;
  partRemuneration?: number; note?: string;
}

const base = (s: Statut, i: StatutInput): StatutOut => ({ statut: s, possible: true, ca: i.ca, charges: i.charges, cotisations: 0, impotSocietes: 0, impotRevenu: 0, prelevementsDividendes: 0, remunerationNette: 0, dividendesNets: 0, net: 0, netMensuel: 0 });
const fin = (o: StatutOut): StatutOut => ({ ...o, net: o.remunerationNette + o.dividendesNets - o.impotRevenu, netMensuel: (o.remunerationNette + o.dividendesNets - o.impotRevenu) / 12 });

export function enMicro(i: StatutInput): StatutOut {
  const m = micro({ ca: i.ca, activite: i.activite, artisan: i.artisan, vl: i.vl, foyer: i.foyer, autres: i.autres, charges: i.charges });
  const o = base('micro', i);
  o.possible = !m.depassePlafond;
  o.cotisations = m.cotisations + m.cfp + m.tfc;
  o.impotRevenu = m.ir + m.vl;
  o.remunerationNette = i.ca - o.cotisations - i.charges;
  return fin(o);
}

export function enEI(i: StatutInput): StatutOut {
  const r = eiReel(Math.max(0, i.ca - i.charges), { artisan: i.artisan });
  const o = base('ei', i);
  o.cotisations = r.cotisations;
  o.remunerationNette = r.netAvantImpot;
  o.impotRevenu = impotMarginal(r.imposable, i.autres ?? 0, i.foyer ?? FOYER_SEUL);
  return fin(o);
}

/** EURL à l'IS : `B` = budget du gérant (rémunération + cotisations prises en charge par la société). */
function eurlAvec(i: StatutInput, part: number): StatutOut {
  const benef = Math.max(0, i.ca - i.charges);
  const B = benef * part;
  const cB = cotisationsTNS(B, { artisan: i.artisan });
  // La société paie les cotisations du gérant : au plus le budget.
  const remNette = Math.max(0, B - cB.cotisations);
  const is = impotSocietes(benef - B).is;
  const D = Math.max(0, benef - B - is);
  const Ds = dividendesSoumisTNS(D, i.capital ?? 1000);
  const cTot = cotisationsTNS(B + Ds, { artisan: i.artisan });
  const cotisDiv = Math.max(0, cTot.cotisations - cB.cotisations);
  const p = pfu(D, Ds);
  const imposable = Math.max(0, remNette + cB.csgNonDeductible - abattementSalaire(remNette + cB.csgNonDeductible));
  const o = base('eurl', i);
  o.cotisations = cB.cotisations + cotisDiv;
  o.impotSocietes = is;
  o.prelevementsDividendes = p.total;
  o.remunerationNette = remNette;
  o.dividendesNets = D - p.total - cotisDiv;
  o.impotRevenu = impotMarginal(imposable, i.autres ?? 0, i.foyer ?? FOYER_SEUL);
  o.partRemuneration = part;
  return fin(o);
}

/** SASU : `K` = coût total employeur de la rémunération du président. */
function sasuAvec(i: StatutInput, part: number): StatutOut {
  const benef = Math.max(0, i.ca - i.charges);
  const K = benef * part;
  const a = assimileDepuisCout(K);
  const is = impotSocietes(benef - a.cout).is;
  const D = Math.max(0, benef - a.cout - is);
  const p = pfu(D);
  const imposable = Math.max(0, a.netImposable - abattementSalaire(a.netImposable));
  const o = base('sasu', i);
  o.cotisations = a.employeur + a.salarie + a.csgCrds;
  o.impotSocietes = is;
  o.prelevementsDividendes = p.total;
  o.remunerationNette = a.net;
  o.dividendesNets = p.net;
  o.impotRevenu = impotMarginal(imposable, i.autres ?? 0, i.foyer ?? FOYER_SEUL);
  o.partRemuneration = part;
  return fin(o);
}

/** Cherche la part de rémunération (pas de 1 %) qui donne le meilleur net, ou applique celle imposée. */
function optimiser(f: (i: StatutInput, part: number) => StatutOut, i: StatutInput): StatutOut {
  if (i.partRemuneration !== undefined) return f(i, Math.min(1, Math.max(0, i.partRemuneration)));
  let best = f(i, 0);
  for (let k = 1; k <= 100; k++) { const o = f(i, k / 100); if (o.net > best.net + 0.5) best = o; }
  return best;
}
export const enEURL = (i: StatutInput) => optimiser(eurlAvec, i);
export const enSASU = (i: StatutInput) => optimiser(sasuAvec, i);
export const eurlPart = eurlAvec;
export const sasuPart = sasuAvec;

export function enPortage(i: StatutInput): StatutOut {
  const p = portage(i.ca, i.fraisPortage ?? 0.07, i.charges);
  const o = base('portage', i);
  o.cotisations = p.cotisations;
  o.remunerationNette = p.net - p.fraisPro;
  o.charges = i.charges;
  o.impotRevenu = impotMarginal(Math.max(0, p.netImposable - abattementSalaire(p.netImposable)), i.autres ?? 0, i.foyer ?? FOYER_SEUL);
  return fin(o);
}

export function comparer(i: StatutInput): Record<Statut, StatutOut> {
  return { micro: enMicro(i), ei: enEI(i), eurl: enEURL(i), sasu: enSASU(i), portage: enPortage(i) };
}
