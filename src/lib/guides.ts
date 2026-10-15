/** Registre des pages : chaque fichier de `src/content/guides/` et `src/content/outils/` est chargé ici. */
import type { PageDef, Group } from './guide-types';

const mods = import.meta.glob<{ default: PageDef }>(['../content/guides/*.ts', '../content/outils/*.ts'], { eager: true });

export const PAGES: PageDef[] = Object.entries(mods)
  .map(([file, m]) => {
    const g = m.default;
    const base = file.split('/').pop()!.replace(/\.ts$/, '');
    if (g.id !== base) throw new Error(`${file} : l'id « ${g.id} » diffère du nom de fichier`);
    return g;
  })
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export const GROUPS: Group[] = ['micro', 'creation', 'statuts', 'freelance'];
export const pageById = (id: string) => PAGES.find((p) => p.id === id);
