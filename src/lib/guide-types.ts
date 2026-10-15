/**
 * Une page = UN fichier dans `src/content/guides/` (guides) ou `src/content/outils/` (pages outils).
 * Le fichier porte les deux langues : texte, FAQ, sources, mini-simulateur, maillage. Le cœur
 * (routes, menus, pied de page, sitemap, hreflang, schémas) le lit seul. Notice : CONTRIBUTING-PAGES.md.
 */
import type { SourceKey, Params } from './engine/params';

export type Lang = 'fr' | 'en';
/** Rubrique du menu : micro-entreprise, création et déclarations, statuts et sociétés, freelance et TJM. */
export type Group = 'micro' | 'creation' | 'statuts' | 'freelance';
export interface FAQ { q: string; a: string }

export interface Helpers {
  lang: Lang;
  /** Lien interne par identifiant de page. */
  a: (id: string, text: string) => string;
  /** Montant en euros au format de la langue (sans centimes sauf demande). */
  eur: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  /** Pourcentage depuis une fraction (0,256 → « 25,6 % »). */
  pct: (x: number, decimals?: number) => string;
  /** Date ISO écrite en toutes lettres. */
  date: (iso: string) => string;
  /** Tableau de style journal. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Lien vers une source officielle de params-2026.json. */
  src: (key: SourceKey, text?: string) => string;
  /** Valeurs légales 2026 : tout chiffre réglementaire vient d'ici, jamais en dur. */
  P: Params;
}

export interface PageText {
  /** Segment d'URL sans barre, sans année. */
  slug: string;
  nav: string;
  card: string;
  /** 50 à 60 caractères, terme-clé en tête, avec 2026 (RECETTE §11). */
  title: string;
  /** 150 à 160 caractères, avec 2026. */
  description: string;
  h1: string;
  /** Une phrase sous le H1. */
  intro: string;
  /** Paragraphe citable d'au moins 120 mots, avec les chiffres (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  /** Corps HTML. `<!--mini:kind-->` insère un autre mini-simulateur. */
  body: (h: Helpers) => string;
}

export type Tool = 'micro' | 'statuts' | 'tjm' | 'sasu' | 'eurl' | 'cfe' | 'portage';

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Mini-simulateur placé avant le paragraphe citable (fichier `src/lib/minis/<kind>.ts`). Absent si `tool`. */
  mini?: string;
  /** Valeurs de départ du mini-simulateur sur cette page. */
  miniDefaults?: Record<string, number>;
  /** Page vers laquelle renvoie le bouton du mini-simulateur (défaut : l'accueil). */
  miniHref?: string;
  /** Simulateur complet de la page (pages outils). */
  tool?: Tool;
  /** Réglages du simulateur sur cette page (activité, TJM…). */
  toolPreset?: Record<string, number | string | boolean>;
  related: string[];
  sources: SourceKey[];
  fr: PageText;
  en: PageText;
}

export const defineGuide = (g: PageDef): PageDef => g;
