/**
 * CFE d'un indépendant sans local, commune par commune : base minimum votée pour la tranche de
 * chiffre d'affaires, taux global de CFE, taxe CCI, frais ; exonérations de création et sous 5 000 €.
 * Données : fichier REI 2025 de la DGFiP (taux et bases minimum votés pour 2025, derniers publiés).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { cfe, basesBornes, trancheCFE } from '../../lib/engine/cfe';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { useCommune, depOptions } from './communes';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L } from './kit';

import type { Commune } from '../../lib/engine/cfe';
interface Props { lang?: L; methodHref?: string; preset?: { ca?: number; dep?: string; com?: string }; initCommunes?: Commune[] }
export default function CfeRechner({ lang = 'fr', methodHref, preset = {}, initCommunes }: Props) {
  const f = fm(lang);
  const d = { ca: preset.ca ?? 30000, annee: '3', artisan: '0' };
  const [ca, setCa] = useState(d.ca);
  const [annee, setAnnee] = useState(d.annee);
  const [artisan, setArtisan] = useState(d.artisan);
  const lieu = useCommune(preset.dep, preset.com, initCommunes);
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setCa(num(u, 'ca', d.ca)); setAnnee(str(u, 'an', d.annee)); setArtisan(str(u, 'art', d.artisan));
    const dep = u.get('dep'); if (dep) lieu.setDep(dep, u.get('com') ?? undefined);
  }, []);
  useEffect(() => { updateURL({ ca, an: annee, art: artisan, dep: lieu.dep, com: lieu.code }); }, [ca, annee, artisan, lieu.dep, lieu.code]);
  const c = lieu.commune;
  const t = trancheCFE(ca);
  const r = useMemo(() => (c ? cfe(ca, c.t, c.b, Number(annee), artisan === '1') : null), [ca, c, annee, artisan]);
  const [bmin, bmax] = basesBornes(t);
  const moinsCheres = useMemo(() => lieu.communes.filter((x) => x.b[t] != null).map((x) => ({ n: x.n, v: (x.b[t] as number) * x.t })).sort((a, b) => a.v - b.v), [lieu.communes, t]);
  const rang = c && c.b[t] != null ? moinsCheres.findIndex((x) => x.n === c.n) + 1 : 0;
  const trancheTxt = t === 0 ? tx(lang, `jusqu’à ${f.eur(P.cfe.tranches_ca[0])}`, `up to ${f.eur(P.cfe.tranches_ca[0])}`) : t >= P.cfe.tranches_ca.length ? tx(lang, `plus de ${f.eur(P.cfe.tranches_ca[t - 1])}`, `over ${f.eur(P.cfe.tranches_ca[t - 1])}`) : `${f.eur(P.cfe.tranches_ca[t - 1] + 1)} – ${f.eur(P.cfe.tranches_ca[t])}`;
  const rows = r && c ? [
    { label: tx(lang, `Tranche de chiffre d’affaires ${trancheTxt}`, `Turnover band ${trancheTxt}`), value: r.base != null ? f.eur(c.b[t] ?? 0) : '–' },
    { label: tx(lang, 'Base retenue cette année', 'Base used this year'), value: f.eur(r.base ?? 0) },
    { label: tx(lang, `Taux global de CFE à ${c.n}`, `Overall CFE rate in ${c.n}`), value: f.pct(c.t, 2) },
    { label: tx(lang, 'Cotisation foncière', 'CFE contribution'), value: f.eur(r.cfe) },
    { label: tx(lang, `Taxe additionnelle CCI (${f.pct(P.cfe.taxe_additionnelle_cci, 2)} de la base)`, `CCI surcharge (${f.pct(P.cfe.taxe_additionnelle_cci, 2)} of the base)`), value: f.eur(r.taxeCci) },
    { label: tx(lang, 'Frais de gestion', 'Management fees'), value: f.eur(r.frais) },
    { label: tx(lang, 'CFE à payer en décembre', 'CFE due in December'), value: f.eur(r.total), strong: true, sep: true },
  ] : [];
  const steps = r && c ? [
    r.exoneree && r.raison === 'creation' ? tx(lang, 'Année de création : pas de CFE jusqu’au 31 décembre.', 'Start-up year: no CFE until 31 December.') : '',
    r.exoneree && r.raison === 'ca' ? tx(lang, `Chiffre d’affaires de référence (année N-2) inférieur ou égal à ${f.eur(P.cfe.exoneration_ca)} : exonération.`, `Reference turnover (year N-2) at most ${f.eur(P.cfe.exoneration_ca)}: exempt.`) : '',
    r.exoneree && r.raison === 'base' ? tx(lang, 'La commune ne publie pas de base minimum pour cette tranche dans le fichier REI : vérifiez votre avis.', 'The commune publishes no minimum base for this band in the REI file: check your notice.') : '',
    annee === '2' ? tx(lang, 'Deuxième année : base réduite de moitié.', 'Second year: base halved.') : '',
    tx(lang, `Base minimum votée à ${c.n} pour votre tranche : ${c.b[t] != null ? f.eur(c.b[t] as number) : '–'} (fourchette légale ${f.eur(bmin)} à ${f.eur(bmax)}).`, `Minimum base set in ${c.n} for your band: ${c.b[t] != null ? f.eur(c.b[t] as number) : '–'} (legal range ${f.eur(bmin)} to ${f.eur(bmax)}).`),
    rang > 0 ? tx(lang, `Pour cette tranche, ${c.n} se classe ${rang}e sur ${moinsCheres.length} communes du département, de la moins chère à la plus chère.`, `For this band, ${c.n} ranks ${rang} of ${moinsCheres.length} communes in the département, cheapest first.`) : '',
  ].filter(Boolean) : [];
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <SelectField id="cf-dep" label={tx(lang, 'Département', 'Département')} value={lieu.dep} onChange={(x) => lieu.setDep(x)} options={depOptions()} />
            <SelectField id="cf-com" label={tx(lang, 'Commune du domicile de l’entreprise', 'Commune of the business address')} value={lieu.code} onChange={lieu.setCode} options={lieu.communes.map((x) => ({ value: x.c, label: x.n }))} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id="cf-ca" label={tx(lang, 'Chiffre d’affaires de l’année N-2', 'Turnover two years earlier (N-2)')} value={ca} onChange={setCa} unit="€" max={10_000_000} lang={lang} help={tx(lang, 'ramené à 12 mois', 'scaled to 12 months')} />
            <SelectField id="cf-an" label={tx(lang, 'Année d’activité', 'Year of activity')} value={annee} onChange={setAnnee} options={[{ value: '1', label: tx(lang, 'Année de création', 'Start-up year') }, { value: '2', label: tx(lang, 'Année suivante', 'Following year') }, { value: '3', label: tx(lang, 'Ensuite', 'Later years') }]} />
          </div>
          <Toggle id="cf-art" label={tx(lang, 'Artisan (chambre des métiers)', 'Craftsperson (trade chamber)')} value={artisan} onChange={setArtisan} options={[{ value: '0', label: tx(lang, 'Non', 'No') }, { value: '1', label: tx(lang, 'Oui', 'Yes') }]} />
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'CFE estimée pour l’année', 'Estimated CFE for the year')} wert={f.eur(r?.total ?? 0)} unter={c ? tx(lang, `${c.n}, taux et bases votés pour ${P.cfe.millesime_taux}`, `${c.n}, rates and bases set for ${P.cfe.millesime_taux}`) : ''} />
          <Zeilen rows={rows} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `CFE ${c?.n ?? ''} : ${f.eur(r?.total ?? 0)} pour ${f.eur(ca)} de chiffre d’affaires`, `CFE ${c?.n ?? ''}: ${f.eur(r?.total ?? 0)} for ${f.eur(ca)} turnover`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}
