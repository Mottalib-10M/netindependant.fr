/**
 * Moteur de NetIndé : cas de référence des textes officiels, puis comparaison sur une grille avec le
 * modèle publié par l'Urssaf (paquet modele-social, celui de mon-entreprise.urssaf.fr).
 */
import { describe, expect, it } from 'vitest';
import rules from 'modele-social';
import Engine from 'publicodes';
import { P, PASS } from '../src/lib/engine/params';
import { impotRevenu, abattementSalaire } from '../src/lib/engine/ir';
import { micro, tauxCotisation, revenuAbattu, plafondProrata, seuilVL, type Activite } from '../src/lib/engine/micro';
import { cotisationsTNS, abattementForfaitaire, tauxMaladie, eiReel } from '../src/lib/engine/tns';
import { assimileDepuisBrut, assimileDepuisCout } from '../src/lib/engine/assimile';
import { impotSocietes, pfu, dividendesSoumisTNS } from '../src/lib/engine/societe';
import { cfe, trancheCFE } from '../src/lib/engine/cfe';
import { portage } from '../src/lib/engine/portage';
import { comparer, enMicro, enEI, sasuPart, eurlPart } from '../src/lib/engine/statuts';

const near = (a: number, b: number, tol = 0.5) => expect(Math.abs(a - b), `${a} ≠ ${b}`).toBeLessThanOrEqual(tol);
const engine = new Engine(rules as never, { logger: { log() {}, warn() {}, error() {} } } as never);

describe('impôt sur le revenu (service-public F1419, F34328)', () => {
  it('célibataire, 30 000 € : 2 103,99 €', () => near(impotRevenu(30000).impot, 2103.99, 0.01));
  it('couple, 60 000 € : 2 × 2 103,99 €', () => near(impotRevenu(60000, { parts: 2, couple: true }).impot, 4207.98, 0.01));
  it('décote célibataire : impôt brut 1 400 € → 1 136,50 €', () => {
    // revenu qui donne 1 400 € d'impôt brut pour une part
    let r = 11600; while (impotRevenu(r).brutAvantDecote < 1400) r += 0.01;
    near(impotRevenu(r).impot, 1136.5, 0.05);
  });
  it('décote couple : impôt brut 2 800 € → 2 584 €', () => {
    let r = 23200; while (impotRevenu(r, { parts: 2, couple: true }).brutAvantDecote < 2800) r += 0.01;
    near(impotRevenu(r, { parts: 2, couple: true }).impot, 2584, 0.05);
  });
  it('plafonnement du quotient familial : avantage limité à 1 807 € par demi-part', () => {
    const sans = impotRevenu(150000, { parts: 2, couple: true }).impot;
    const avec = impotRevenu(150000, { parts: 2.5, couple: true });
    expect(avec.plafonnement).toBe(true);
    near(sans - avec.impot, P.ir.plafond_demi_part, 0.01);
  });
  it('seuil de recouvrement : moins de 61 € ne se paie pas', () => expect(impotRevenu(12000).impot).toBe(0));
  it('abattement de 10 % borné (509 € / 14 555 €)', () => { expect(abattementSalaire(3000)).toBe(509); expect(abattementSalaire(300000)).toBe(14555); near(abattementSalaire(40000), 4000); });
});

describe('micro-entreprise : taux 2026 (autoentrepreneur.urssaf.fr)', () => {
  it('taux de cotisations 2026', () => {
    expect(tauxCotisation('vente')).toBe(0.123); expect(tauxCotisation('bic')).toBe(0.212); expect(tauxCotisation('bnc')).toBe(0.256); expect(tauxCotisation('cipav')).toBe(0.232);
  });
  it('Acre : la moitié jusqu’au 30 juin 2026, les trois quarts ensuite (taux publiés)', () => {
    for (const a of ['vente', 'bic', 'bnc'] as Activite[]) {
      near(tauxCotisation(a, 'avant'), P.micro.taux[a] * P.micro.acre.taux_paye_avant_2026_07, 0.0006);
      near(tauxCotisation(a, 'depuis'), P.micro.taux[a] * P.micro.acre.taux_paye_depuis_2026_07, 0.001);
    }
    expect(tauxCotisation('bic', 'depuis')).toBe(0.159); // exemple de l'électricien, service-public F11677
  });
  it('taux avec versement libératoire publiés par service-public (13,3 / 22,9 / 27,8 / 25,4 %)', () => {
    for (const a of ['vente', 'bic', 'bnc', 'cipav'] as Activite[]) near(P.micro.taux[a] + P.micro.vl[a], P.micro.taux_vl_total[a], 1e-9);
  });
  it('abattement minimal de 305 €', () => { expect(revenuAbattu(400, 'bnc').abattement).toBe(305); expect(revenuAbattu(100, 'bnc').revenu).toBe(0); });
  it('plafond proratisé : création au 31 janvier 2026 en vente → 186 407 € (exemple service-public)', () => near(plafondProrata('vente', 335), 186407, 1));
  it('plafond proratisé : début le 1er mars 2026 en services → 70 087 € (exemple Urssaf)', () => near(plafondProrata('bnc', 306), 70087, 1));
  it('seuil du versement libératoire : 29 315 € par part en 2026', () => { expect(seuilVL(1)).toBe(29315); expect(seuilVL(2)).toBe(58630); expect(seuilVL(1, 2027)).toBe(29579); });
  it('franchise de TVA', () => {
    expect(micro({ ca: 37000, activite: 'bnc' }).tvaStatut).toBe('franchise');
    expect(micro({ ca: 40000, activite: 'bnc' }).tvaStatut).toBe('tolerance');
    expect(micro({ ca: 42000, activite: 'bnc' }).tvaStatut).toBe('redevable');
    expect(micro({ ca: 90000, activite: 'vente' }).tvaStatut).toBe('tolerance');
  });

  const cas: Array<{ a: Activite; nature: string; sv?: string; artisan?: boolean }> = [
    { a: 'vente', nature: 'commerciale', sv: 'vente' },
    { a: 'bic', nature: 'commerciale', sv: 'service' },
    { a: 'bic', nature: 'artisanale', sv: 'service', artisan: true },
    { a: 'bnc', nature: 'libérale' },
  ];
  for (const c of cas) for (const ca of [8000, 25000, 50000, 80000]) {
    it(`grille Urssaf : ${c.a}${c.artisan ? ' artisan' : ''}, CA ${ca} € → revenu net et impôt à 15 € près`, () => {
      const sit: Record<string, string> = { 'entreprise . catégorie juridique': "'EI'", 'entreprise . catégorie juridique . EI . auto-entrepreneur': 'oui', 'entreprise . activité . nature': `'${c.nature}'`, "dirigeant . auto-entrepreneur . chiffre d'affaires": `${ca} €/an` };
      if (c.sv) sit['entreprise . activités . service ou vente'] = `'${c.sv}'`;
      engine.setSituation(sit as never);
      const netU = engine.evaluate('dirigeant . auto-entrepreneur . revenu net').nodeValue as number;
      const apresU = engine.evaluate('dirigeant . auto-entrepreneur . revenu net . après impôt').nodeValue as number;
      const m = micro({ ca, activite: c.a, artisan: c.artisan });
      // L'Urssaf arrondit chaque ligne à l'euro chaque mois : quelques euros d'écart sur l'année.
      near(m.revenuApresCotisations, netU, 15);
      near(m.revenuApresCotisations - m.ir, apresU, 15);
    });
  }
});

describe('indépendants au réel : barème 2026 après réforme (urssaf.fr)', () => {
  it('abattement de 26 % borné à 1,76 % et 130 % du Pass', () => {
    near(abattementForfaitaire(40000), 10400); near(abattementForfaitaire(2000), 0.0176 * PASS); near(abattementForfaitaire(400000), 1.3 * PASS);
  });
  it('taux maladie progressif aux points publiés', () => {
    near(tauxMaladie(0.2 * PASS), 0, 1e-9); near(tauxMaladie(0.4 * PASS), 0.015, 1e-9); near(tauxMaladie(1.1 * PASS), 0.065, 1e-9); near(tauxMaladie(3 * PASS), 0.085, 1e-9);
  });
  it('cotisations minimales publiées (revenu nul) : IJ 96 €, retraite de base 967 €, invalidité-décès 72 €, CFP 120 €', () => {
    const c = cotisationsTNS(0);
    near(c.ij, P.tns.minimums_publies.ij, 1); near(c.retraiteBase, P.tns.minimums_publies.retraite_base, 1); near(c.invalidite, P.tns.minimums_publies.invalidite_deces, 1); near(c.cfp, P.tns.minimums_publies.cfp_commercant, 1);
    near(cotisationsTNS(0, { artisan: true }).cfp, P.tns.minimums_publies.cfp_artisan, 1);
  });
  it('plafonds publiés : IJ 1 202 €, invalidité-décès 625 €', () => {
    const c = cotisationsTNS(1_000_000); near(c.ij, P.tns.maximums_publies.ij, 1); near(c.invalidite, P.tns.maximums_publies.invalidite_deces, 1);
  });
  it('exemple vérifiable à la main : 50 000 € de revenu brut social', () => {
    const c = cotisationsTNS(50000);
    const A = 37000;
    near(c.assiette, A, 0.01);
    near(c.retraiteBase, 0.1787 * A, 0.01);
    near(c.retraiteCompl, 0.081 * A, 0.01);
    near(c.csgCrds, 0.097 * A, 0.01);
    expect(c.allocations).toBe(0);
    const t = 0.04 + (A / PASS - 0.6) / 0.5 * 0.025; near(c.maladie, t * A, 0.01);
  });
  it('Acre : un quart des cotisations visées sous 75 % du Pass, rien au-delà du Pass', () => {
    const s = cotisationsTNS(30000), a = cotisationsTNS(30000, { acre: true });
    near(s.cotisations - a.cotisations, 0.25 * (s.maladie + s.ij + s.allocations + s.retraiteBase + s.invalidite), 0.01);
    expect(cotisationsTNS(80000, { acre: true }).exonerationAcre).toBe(0);
  });
  it('EI : la CSG non déductible reste dans le revenu imposable', () => {
    const r = eiReel(50000); near(r.imposable, 50000 - r.cotisations + r.csgNonDeductible, 0.01);
  });
});

describe('assimilé salarié (président de SASU) contre le modèle de l’Urssaf', () => {
  for (const brut of [1500, 3000, 6000, 12000, 20000]) {
    it(`brut ${brut} €/mois → net, coût, net imposable`, () => {
      engine.setSituation({ 'entreprise . catégorie juridique': "'SAS'", 'entreprise . associés': "'unique'", 'salarié . contrat . salaire brut': `${brut} €/mois`, 'entreprise . imposition': "'IS'", 'salarié . cotisations . prévoyances . santé . montant': '0 €/mois' } as never);
      const a = assimileDepuisBrut(brut * 12);
      near(a.net / 12, engine.evaluate('salarié . rémunération . net . à payer avant impôt').nodeValue as number, brut * 0.003);
      near(a.cout / 12, engine.evaluate('salarié . coût total employeur').nodeValue as number, brut * 0.003);
      near(a.netImposable / 12, engine.evaluate('salarié . rémunération . net . imposable').nodeValue as number, brut * 0.003);
    });
  }
  it('le coût redonne le brut', () => near(assimileDepuisCout(assimileDepuisBrut(50000).cout).brut, 50000, 0.5));
});

describe('sociétés, dividendes, CFE, portage', () => {
  it('IS : 15 % jusqu’à 42 500 €, 25 % au-delà', () => { near(impotSocietes(40000).is, 6000); near(impotSocietes(100000).is, 6375 + 14375); });
  it('PFU 31,4 % ; part soumise aux cotisations sans prélèvements sociaux', () => { near(pfu(10000).total, 3140); near(pfu(10000, 10000).total, 1280); });
  it('dividendes de gérant : au-delà de 10 % du capital', () => { expect(dividendesSoumisTNS(5000, 1000)).toBe(4900); expect(dividendesSoumisTNS(5000, 100000)).toBe(0); });
  it('tranches de CFE', () => { expect(trancheCFE(10000)).toBe(0); expect(trancheCFE(10001)).toBe(1); expect(trancheCFE(32600)).toBe(1); expect(trancheCFE(600000)).toBe(5); });
  it('CFE : exonérations de création et sous 5 000 €, moitié l’année 2', () => {
    const b = [500, 1000, 2000, 3000, 4000, 5000];
    expect(cfe(20000, 0.3, b, 1).total).toBe(0);
    expect(cfe(4000, 0.3, b, 3).total).toBe(0);
    near(cfe(20000, 0.3, b, 2).cfe, 150);
    const c = cfe(20000, 0.3, b, 3); near(c.cfe, 300); near(c.taxeCci, 11.2); near(c.total, (300 + 11.2) * 1.01);
    expect(cfe(20000, 0.3, b, 3, true).taxeCci).toBe(0);
  });
  it('portage : le net croît avec le CA et reste sous le coût employeur', () => {
    const a = portage(60000, 0.07), b = portage(90000, 0.07);
    expect(b.net).toBeGreaterThan(a.net); expect(a.net).toBeLessThan(a.cout); expect(a.net).toBeGreaterThan(0.5 * a.cout);
  });
});

describe('comparateur de statuts', () => {
  it('cinq statuts, aucun NaN, net cohérent', () => {
    for (const ca of [20000, 60000, 120000]) {
      const r = comparer({ ca, charges: 5000, activite: 'bnc' });
      for (const o of Object.values(r)) { expect(Number.isFinite(o.net)).toBe(true); expect(o.net).toBeLessThan(ca); }
    }
  });
  it('micro au-delà du plafond signalée impossible', () => expect(enMicro({ ca: 90000, charges: 0, activite: 'bnc' }).possible).toBe(false));
  it('l’optimisation SASU fait au moins aussi bien que tout salaire ou tout dividende', () => {
    const i = { ca: 90000, charges: 6000, activite: 'bnc' as Activite };
    const best = comparer(i).sasu.net;
    expect(best).toBeGreaterThanOrEqual(sasuPart(i, 0).net - 1); expect(best).toBeGreaterThanOrEqual(sasuPart(i, 1).net - 1);
  });
  it('EURL : même logique', () => {
    const i = { ca: 90000, charges: 6000, activite: 'bnc' as Activite };
    expect(comparer(i).eurl.net).toBeGreaterThanOrEqual(eurlPart(i, 1).net - 1);
  });
  it('EI : net avant impôt = bénéfice − cotisations', () => { const o = enEI({ ca: 60000, charges: 10000, activite: 'bnc' }); near(o.remunerationNette, 50000 - cotisationsTNS(50000).cotisations, 0.01); });
});
