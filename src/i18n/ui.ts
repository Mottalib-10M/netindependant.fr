import type { Locale } from './routes';
const fr = {
  updatedOn: 'Mis à jour le', editorialPolicy: 'Charte éditoriale', contactLabel: 'Contact', reviewedBy: 'Calculs vérifiés par',
  skipToContent: 'Aller au contenu', mainNav: 'Navigation principale', breadcrumbLabel: 'Fil d’Ariane', breadcrumbHome: 'Accueil', menuOpen: 'Ouvrir le menu',
  faqTitle: 'Les questions des indépendants', relatedCalculators: 'À voir aussi', sourcesTitle: 'Textes et sources officielles', writtenBy: 'Publié par',
  asOf: 'Règles', lastUpdated: 'relues le', footerValidated: 'Taux micro et salaire du président comparés au modèle de calcul publié par l’Urssaf', footerBrowser: 'Calcul fait dans votre navigateur · sans inscription · sans e-mail · rien n’est envoyé',
  footerDisclaimer: 'NetIndé est un site indépendant édité par Radif Partners. Il n’est ni l’Urssaf, ni l’administration fiscale, ni un expert-comptable, et ne vend aucun service de création d’entreprise. Les résultats sont des estimations fondées sur les taux et barèmes 2026 publiés, pas un conseil personnalisé : vos montants réels sont fixés par l’Urssaf et le service des impôts.', footerPopular: '', notFound: 'Aucune page à cette adresse.',
  readMore: 'Lire la suite',
};
const en: typeof fr = {
  updatedOn: 'Updated', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Figures checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'What self-employed people in France ask', relatedCalculators: 'See also', sourcesTitle: 'Official texts and sources', writtenBy: 'Published by',
  asOf: 'Rules', lastUpdated: 'checked on', footerValidated: 'Micro-enterprise rates and company director pay checked against the calculation model published by the Urssaf', footerBrowser: 'Calculated in your browser · no sign-up · no email · nothing is sent',
  footerDisclaimer: 'NetIndé is an independent site published by Radif Partners. It is not the Urssaf, not the French tax office and not an accountant, and it sells no company formation service. Results are estimates only, based on the published 2026 rates and scales; they are not tax or financial advice, and your actual amounts are set by the Urssaf and the tax office.', footerPopular: '', notFound: 'There is no page at this address.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : fr; }
