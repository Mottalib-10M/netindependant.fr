/**
 * Simulateur auto-entrepreneur : du chiffre d'affaires au net en poche, avec les cotisations 2026,
 * la CFP, la taxe pour frais de chambre, l'Acre, le versement libératoire ou l'impôt au barème, et la
 * CFE de la commune (fichier REI de la DGFiP). Premier rendu = valeurs par défaut (RECETTE §17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import StackedBar from '../ui/StackedBar';
import { micro, seuilVL, type Acre } from '../../lib/engine/micro';
import { cfe } from '../../lib/engine/cfe';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { actOpt, actDe, foyerOpt, foyerDe } from '../../lib/minis/_kit';
import { useCommune, depOptions } from './communes';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L, type Zeile } from './kit';

interface Props { lang?: L; methodHref?: string; compareHref?: string; cfeHref?: string; preset?: { act?: number; ca?: number; acre?: string; vl?: boolean } }

export default function MicroRechner({ lang = 'fr', methodHref, compareHref, cfeHref, preset = {} }: Props) {
  const f = fm(lang);
  const d = { ca: preset.ca ?? 40000, per: 'an', act: preset.act ?? 3, acre: preset.acre ?? 'non', vl: preset.vl ? '1' : '0', foyer: 0, autres: 0, annee: 3, charges: 0, chambre: '1' };
  const [ca, setCa] = useState(d.ca);
  const [per, setPer] = useState(d.per);
  const [act, setAct] = useState(String(d.act));
  const [acre, setAcre] = useState(d.acre);
  const [vl, setVl] = useState(d.vl);
  const [foyer, setFoyer] = useState(String(d.foyer));
  const [autres, setAutres] = useState(d.autres);
  const [annee, setAnnee] = useState(String(d.annee));
  const [charges, setCharges] = useState(d.charges);
  const [chambre, setChambre] = useState(d.chambre);
  const lieu = useCommune();
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setCa(num(u, 'ca', d.ca)); setPer(str(u, 'p', d.per)); setAct(str(u, 'act', String(d.act))); setAcre(str(u, 'acre', d.acre)); setVl(str(u, 'vl', d.vl));
    setFoyer(str(u, 'f', '0')); setAutres(num(u, 'ar', 0)); setAnnee(str(u, 'an', '3')); setCharges(num(u, 'ch', 0)); setChambre(str(u, 'cm', '1'));
    const dep = u.get('dep'); if (dep) lieu.setDep(dep, u.get('com') ?? undefined);
  }, []);
  useEffect(() => { updateURL({ ca, p: per, act, acre, vl, f: foyer, ar: autres, an: annee, ch: charges, cm: chambre, dep: lieu.dep, com: lieu.code }); }, [ca, per, act, acre, vl, foyer, autres, annee, charges, chambre, lieu.dep, lieu.code]);

  const caAn = per === 'mois' ? ca * 12 : ca;
  const { activite, artisan } = actDe(Number(act));
  const fy = foyerDe(Number(foyer));
  const c = lieu.commune;
  const cf = useMemo(() => (c ? cfe(caAn, c.t, c.b, Number(annee), artisan) : null), [caAn, c, annee, artisan]);
  const m = useMemo(() => micro({ ca: caAn, activite, artisan, acre: acre as Acre, vl: vl === '1', chambre: chambre === '1', foyer: fy, autres, cfe: cf?.total ?? 0, charges }), [caAn, activite, artisan, acre, vl, chambre, fy, autres, cf, charges]);
  const impot = m.vl + m.ir;
  const cot = m.cotisations + m.cfp + m.tfc;

  const rows: Zeile[] = [
    { label: tx(lang, 'Chiffre d’affaires encaissé', 'Turnover received'), value: f.eur(caAn) },
    { label: tx(lang, `Cotisations sociales (${f.pct(m.taux, 1)})`, `Social contributions (${f.pct(m.taux, 1)})`), value: `− ${f.eur(m.cotisations)}` },
    { label: tx(lang, 'Formation professionnelle (CFP)', 'Training levy (CFP)'), value: `− ${f.eur(m.cfp)}` },
    ...(m.tfc > 0 ? [{ label: tx(lang, 'Taxe pour frais de chambre', 'Chamber levy'), value: `− ${f.eur(m.tfc)}` }] : []),
    { label: vl === '1' ? tx(lang, `Versement libératoire (${f.pct(P.micro.vl[activite], 1)})`, `Flat-rate income tax (${f.pct(P.micro.vl[activite], 1)})`) : tx(lang, 'Impôt sur le revenu (barème)', 'Income tax (scale)'), value: `− ${f.eur(impot)}` },
    { label: c ? tx(lang, `CFE ${c.n}`, `CFE ${c.n}`) : 'CFE', value: `− ${f.eur(cf?.total ?? 0)}`, muted: !!cf?.exoneree },
    ...(charges > 0 ? [{ label: tx(lang, 'Dépenses de l’activité', 'Business expenses'), value: `− ${f.eur(charges)}` }] : []),
    { label: tx(lang, 'Net en poche sur l’année', 'Take-home for the year'), value: f.eur(m.net), strong: true, sep: true },
  ];
  const alertes: string[] = [];
  if (m.depassePlafond) alertes.push(tx(lang, `Au-delà de ${f.eur(m.plafond)}, le plafond 2026 de votre activité est dépassé : une année, c’est toléré ; deux années de suite, vous sortez de la micro-entreprise.`, `Above ${f.eur(m.plafond)}, the 2026 ceiling for your activity is exceeded: one year is tolerated; two years in a row and you leave the micro-enterprise scheme.`));
  if (m.tvaStatut === 'tolerance') alertes.push(tx(lang, `Entre ${f.eur(m.tvaSeuil)} et ${f.eur(m.tvaMajore)} : franchise de TVA conservée cette année, TVA à facturer dès le 1er janvier suivant.`, `Between ${f.eur(m.tvaSeuil)} and ${f.eur(m.tvaMajore)}: VAT exemption kept this year, VAT to charge from 1 January next year.`));
  if (m.tvaStatut === 'redevable') alertes.push(tx(lang, `Au-delà de ${f.eur(m.tvaMajore)}, la TVA est due dès le jour du dépassement : vos prix TTC changent, pas votre chiffre d’affaires hors taxe.`, `Above ${f.eur(m.tvaMajore)}, VAT is due from the day you cross it: your VAT-inclusive prices change, not your pre-tax turnover.`));
  if (vl === '1') alertes.push(tx(lang, `Versement libératoire possible en 2026 si le revenu fiscal de référence 2024 du foyer ne dépasse pas ${f.eur(seuilVL(fy.parts))} (${f.eur(P.micro.vl_seuil_rfr_par_part.y2026)} par part).`, `The flat-rate option applies in 2026 only if your household's 2024 reference tax income is at most ${f.eur(seuilVL(fy.parts))} (${f.eur(P.micro.vl_seuil_rfr_par_part.y2026)} per share).`));

  const steps = [
    tx(lang, `${f.eur(caAn)} × ${f.pct(m.taux, 1)} = ${f.eur(m.cotisations)} de cotisations${acre !== 'non' ? ' (taux minoré par l’Acre jusqu’à la fin du 3e trimestre civil qui suit le début d’activité)' : ''}.`, `${f.eur(caAn)} × ${f.pct(m.taux, 1)} = ${f.eur(m.cotisations)} in contributions${acre !== 'non' ? ' (Acre reduced rate until the end of the third calendar quarter after you start)' : ''}.`),
    vl === '1'
      ? tx(lang, `Impôt payé avec les cotisations : ${f.eur(caAn)} × ${f.pct(P.micro.vl[activite], 1)} = ${f.eur(m.vl)}.`, `Tax paid with contributions: ${f.eur(caAn)} × ${f.pct(P.micro.vl[activite], 1)} = ${f.eur(m.vl)}.`)
      : tx(lang, `Revenu imposable : ${f.eur(caAn)} − abattement de ${f.eur(m.abattement)} = ${f.eur(m.revenuAbattu)}, soumis au barème 2026 avec ${f.eur(autres)} d’autres revenus : ${f.eur(m.ir)} d’impôt dû à l’activité.`, `Taxable income: ${f.eur(caAn)} − flat allowance of ${f.eur(m.abattement)} = ${f.eur(m.revenuAbattu)}, taxed on the 2026 scale with ${f.eur(autres)} of other income: ${f.eur(m.ir)} of tax due to the business.`),
    cf?.exoneree
      ? tx(lang, cf.raison === 'creation' ? 'CFE : exonération l’année de création.' : cf.raison === 'ca' ? `CFE : exonérée, chiffre d’affaires de référence ≤ ${f.eur(P.cfe.exoneration_ca)}.` : 'CFE : la commune ne publie pas de base minimum pour cette tranche.', cf.raison === 'creation' ? 'CFE: no CFE in the year you start.' : cf.raison === 'ca' ? `CFE: exempt, reference turnover ≤ ${f.eur(P.cfe.exoneration_ca)}.` : 'CFE: the commune publishes no minimum base for this band.')
      : cf && c ? tx(lang, `CFE : base minimum de ${f.eur(cf.base ?? 0)} × taux ${f.pct(c.t, 2)} à ${c.n}, + taxe CCI et frais = ${f.eur(cf.total)} (taux votés pour ${P.cfe.millesime_taux}, chiffre d’affaires supposé identique deux ans plus tôt).`, `CFE: minimum base ${f.eur(cf.base ?? 0)} × rate ${f.pct(c.t, 2)} in ${c.n}, + chamber levy and fees = ${f.eur(cf.total)} (rates set for ${P.cfe.millesime_taux}, assuming the same turnover two years earlier).`) : '',
  ].filter(Boolean);

  const anneeOpt = [
    { value: '1', label: tx(lang, '1re année (création)', 'Year 1 (start-up year)') },
    { value: '2', label: tx(lang, '2e année', 'Year 2') },
    { value: '3', label: tx(lang, '3e année et suivantes', 'Year 3 onwards') },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-4">
            <NumberField id="me-ca" label={tx(lang, 'Chiffre d’affaires hors taxe', 'Turnover before VAT')} value={ca} onChange={setCa} unit="€" max={2_000_000} lang={lang} />
            <Toggle id="me-per" label={tx(lang, 'Période', 'Period')} value={per} onChange={setPer} options={[{ value: 'an', label: tx(lang, 'an', 'year') }, { value: 'mois', label: tx(lang, 'mois', 'month') }]} />
          </div>
          <SelectField id="me-act" label={tx(lang, 'Activité', 'Activity')} value={act} onChange={setAct} options={actOpt(lang)} />
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <SelectField id="me-acre" label="Acre" value={acre} onChange={setAcre} options={[{ value: 'non', label: tx(lang, 'Non', 'No') }, { value: 'avant', label: tx(lang, 'Oui, début avant juillet 2026', 'Yes, started before July 2026') }, { value: 'depuis', label: tx(lang, 'Oui, début depuis juillet 2026', 'Yes, started July 2026 or later') }]} />
            <Toggle id="me-vl" label={tx(lang, 'Versement libératoire', 'Flat-rate income tax')} value={vl} onChange={setVl} options={[{ value: '0', label: tx(lang, 'Non', 'No') }, { value: '1', label: tx(lang, 'Oui', 'Yes') }]} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <SelectField id="me-dep" label={tx(lang, 'Département (CFE)', 'Département (CFE)')} value={lieu.dep} onChange={(x) => lieu.setDep(x)} options={depOptions()} />
            <SelectField id="me-com" label={tx(lang, 'Commune du domicile de l’entreprise', 'Commune of the business address')} value={lieu.code} onChange={lieu.setCode} options={lieu.communes.map((x) => ({ value: x.c, label: x.n }))} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy-800">{tx(lang, 'Foyer fiscal, année d’activité, dépenses', 'Household, year of activity, expenses')}</summary>
            <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <SelectField id="me-foyer" label={tx(lang, 'Foyer fiscal', 'Tax household')} value={foyer} onChange={setFoyer} options={foyerOpt(lang)} />
              <NumberField id="me-autres" label={tx(lang, 'Autres revenus imposables du foyer', 'Other taxable household income')} value={autres} onChange={setAutres} unit="€" max={2_000_000} lang={lang} help={tx(lang, 'par an, salaires nets imposables du conjoint par exemple', 'per year, e.g. a partner’s taxable salary')} />
              <SelectField id="me-annee" label={tx(lang, 'Année d’activité (CFE)', 'Year of activity (CFE)')} value={annee} onChange={setAnnee} options={anneeOpt} />
              <NumberField id="me-charges" label={tx(lang, 'Dépenses réelles de l’activité', 'Actual business expenses')} value={charges} onChange={setCharges} unit="€" max={2_000_000} lang={lang} help={tx(lang, 'payées mais non déductibles en micro', 'paid but not deductible in micro')} />
              <Toggle id="me-chambre" label={tx(lang, 'Taxe CCI ou chambre des métiers', 'CCI or trade chamber levy')} value={chambre} onChange={setChambre} options={[{ value: '1', label: tx(lang, 'Oui', 'Yes') }, { value: '0', label: tx(lang, 'Non', 'No') }]} />
            </div>
          </details>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'Net en poche par mois', 'Take-home per month')} wert={f.eur(m.netMensuel)} unter={tx(lang, `${f.eur(m.net)} par an · ${f.pct(caAn > 0 ? m.net / caAn : 0, 0)} du chiffre d’affaires`, `${f.eur(m.net)} a year · ${f.pct(caAn > 0 ? m.net / caAn : 0, 0)} of turnover`)} />
          <div className="mt-4"><StackedBar total={caAn} ariaPrefix={tx(lang, 'Répartition du chiffre d’affaires', 'Turnover split')} segments={[
            { label: tx(lang, 'Net', 'Net'), value: Math.max(0, m.net), color: '#0b3540' },
            { label: tx(lang, 'Cotisations', 'Contributions'), value: cot, color: '#94a3b8' },
            { label: tx(lang, 'Impôt', 'Tax'), value: impot, color: '#334155' },
            { label: 'CFE', value: cf?.total ?? 0, color: '#7bd3ea' },
            { label: tx(lang, 'Dépenses', 'Expenses'), value: charges, color: '#e2e8f0' },
          ]} /></div>
          <Zeilen rows={rows} />
          {alertes.length > 0 && <ul className="mt-3 space-y-1 text-sm text-amber-800">{alertes.map((a) => <li key={a}>{a}</li>)}</ul>}
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `Auto-entrepreneur 2026 : ${f.eur(caAn)} de CA → ${f.eur(m.netMensuel)} net par mois`, `Micro-enterprise 2026: ${f.eur(caAn)} turnover → ${f.eur(m.netMensuel)} take-home a month`)} />
          {(compareHref || cfeHref) && <p className="mt-3 text-sm">{compareHref && <a className="font-medium text-accent-700 underline" href={compareHref}>{tx(lang, 'Comparer avec EI, EURL, SASU et portage', 'Compare with EI, EURL, SASU and umbrella')}</a>}{compareHref && cfeHref && ' · '}{cfeHref && <a className="font-medium text-accent-700 underline" href={cfeHref}>{tx(lang, 'Détail de la CFE', 'CFE details')}</a>}</p>}
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}
