/**
 * Communes et taux de CFE (fichier REI 2025 de la DGFiP, scripts/build-cfe.py). Le département de
 * Paris est embarqué pour le premier rendu ; les autres se chargent à la demande depuis
 * /data/cfe/<dep>.json, un fichier statique du site : aucune saisie ne quitte le navigateur.
 */
import { useEffect, useState } from 'react';
import deps from '../../data/cfe-departements.json';
import paris from '../../../public/data/cfe/75.json';
import type { Commune } from '../../lib/engine/cfe';

export const DEPARTEMENTS = deps.departements as Array<{ d: string; n: string; k: number }>;
export const DEP_DEFAUT = '75';
export const COMMUNE_DEFAUT = '75056';
export const COMMUNES_PARIS = paris as Commune[];
const cache: Record<string, Commune[]> = { '75': COMMUNES_PARIS };

export async function chargerDepartement(dep: string): Promise<Commune[]> {
  if (cache[dep]) return cache[dep];
  const r = await fetch(`/data/cfe/${dep}.json`);
  const l = (await r.json()) as Commune[];
  cache[dep] = l;
  return l;
}

export const depOptions = () => DEPARTEMENTS.map((x) => ({ value: x.d, label: `${x.n} (${x.d})` }));

/** État département + commune, avec chargement à la demande. Premier rendu : Paris (hydratation stable). */
export function useCommune(initDep = DEP_DEFAUT, initCom = COMMUNE_DEFAUT, initList?: Commune[]) {
  if (initList && !cache[initDep]) cache[initDep] = initList;
  const [dep, setDepState] = useState(initDep);
  const [communes, setCommunes] = useState<Commune[]>(cache[initDep] ?? initList ?? COMMUNES_PARIS);
  const [code, setCode] = useState(initCom);
  // La longue liste des communes n'est rendue qu'après le montage : le HTML servi ne porte que la
  // commune choisie (même premier rendu côté serveur et navigateur, page plus légère).
  const [monte, setMonte] = useState(false);
  useEffect(() => { setMonte(true); }, []);
  useEffect(() => {
    let vivant = true;
    chargerDepartement(dep).then((l) => {
      if (!vivant) return;
      setCommunes(l);
      if (!l.some((c) => c.c === code)) setCode(l[0]?.c ?? '');
    }).catch(() => {});
    return () => { vivant = false; };
  }, [dep]);
  const commune = communes.find((c) => c.c === code) ?? communes[0];
  const setDep = (d: string, com?: string) => { setDepState(d); if (com) setCode(com); };
  const options = (monte ? communes : commune ? [commune] : []).map((x) => ({ value: x.c, label: x.n }));
  return { dep, setDep, code, setCode, communes, commune, options };
}
