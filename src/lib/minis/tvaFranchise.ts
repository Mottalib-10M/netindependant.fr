/** Franchise en base de TVA : seuil, seuil majoré et prix TTC une fois la TVA due. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, eur, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Franchise de TVA : où en êtes-vous ?', 'VAT exemption: where do you stand?'),
  cta: T(l, 'Calculer le net', 'Work out take-home'),
  inputs: [{ id: 'ca', label: T(l, 'Chiffre d’affaires 2026 hors taxe', '2026 turnover before VAT'), def: 39000, unit: '€', max: 2000000 }, { id: 's', label: T(l, 'Activité', 'Activity'), def: 1, options: [{ value: '0', label: T(l, 'Vente de marchandises', 'Selling goods') }, { value: '1', label: T(l, 'Prestations de services', 'Services') }] }],
  run: (v) => {
    const s = v.s === 0 ? P.tva.vente : P.tva.services;
    const zone = v.ca <= s.seuil ? T(l, 'Franchise : pas de TVA', 'Exempt: no VAT') : v.ca <= s.majore ? T(l, 'Tolérance : TVA au 1er janvier suivant', 'Tolerance: VAT from next 1 January') : T(l, 'TVA due dès le dépassement', 'VAT due from the day you cross');
    return {
      head: [T(l, 'Votre situation', 'Your position'), zone],
      rows: [[T(l, 'Seuil de franchise', 'Exemption threshold'), eur(s.seuil, l)], [T(l, 'Seuil majoré', 'Upper threshold'), eur(s.majore, l)], [T(l, `Marge avant le seuil majoré`, 'Room below upper threshold'), eur(Math.max(0, s.majore - v.ca), l)]],
      note: T(l, 'Le dépassement s’apprécie sur le chiffre d’affaires encaissé de l’année civile (service-public, fiche F21746).', 'Thresholds apply to turnover received in the calendar year (service-public, sheet F21746).'),
    };
  },
});
