/** Lecture, au build seulement, des listes de communes de public/data/cfe/ (fichier REI, scripts/build-cfe.py). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Commune } from './engine/cfe';
export function communesDep(dep: string): Commune[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'public', 'data', 'cfe', `${dep}.json`), 'utf-8')) as Commune[];
}
export const commune = (dep: string, code: string): Commune => {
  const c = communesDep(dep).find((x) => x.c === code);
  if (!c) throw new Error(`Commune ${code} absente de public/data/cfe/${dep}.json`);
  return c;
};
