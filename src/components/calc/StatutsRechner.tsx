/**
 * Comparateur de statuts : micro-entreprise, EI au réel, EURL à l'IS, SASU et portage salarial, pour
 * le même chiffre d'affaires (ou TJM × jours). Pour l'EURL et la SASU, le partage rémunération /
 * dividendes est celui qui donne le meilleur net, calculé par le moteur.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { comparer, STATUTS, type Statut } from '../../lib/engine/statuts';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { actOpt, actDe, foyerOpt, foyerDe } from '../../lib/minis/_kit';
import { Aktionen, Kopf, Hinweis, rahmen, tx, fm, type L } from './kit';

interface Props { lang?: L; methodHref?: string; mode?: 'ca' | 'tjm'; preset?: { tjm?: number; jours?: number; ca?: number; act?: number; focus?: string } }

export const NOMS: Record<Statut, [string, string]> = {
  micro: ['Micro-entreprise', 'Micro-enterprise'],
  ei: ['EI au réel', 'EI, real profit'],
  eurl: ['EURL à l’IS', 'EURL, corporate tax'],
  sasu: ['SASU', 'SASU'],
  portage: ['Portage salarial', 'Umbrella (portage)'],
};

export default function StatutsRechner({ lang = 'fr', methodHref, mode = 'ca', preset = {} }: Props) {
  const f = fm(lang);
  const d = { ca: preset.ca ?? 70000, tjm: preset.tjm ?? 450, jours: preset.jours ?? 200, charges: 3000, act: preset.act ?? 3, foyer: 0, frais: 0, portage: 8 };
  const [ca, setCa] = useState(d.ca);
  const [tjm, setTjm] = useState(d.tjm);
  const [jours, setJours] = useState(d.jours);
  const [charges, setCharges] = useState(d.charges);
  const [act, setAct] = useState(String(d.act));
  const [foyer, setFoyer] = useState(String(d.foyer));
  const [frais, setFrais] = useState(d.frais);
  const [fp, setFp] = useState(d.portage);
  const [vue, setVue] = useState('mois');
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setCa(num(u, 'ca', d.ca)); setTjm(num(u, 'tjm', d.tjm)); setJours(num(u, 'j', d.jours)); setCharges(num(u, 'ch', d.charges)); setAct(str(u, 'act', String(d.act)));
    setFoyer(str(u, 'f', '0')); setFrais(num(u, 'fs', 0)); setFp(num(u, 'fp', d.portage)); setVue(str(u, 'v', 'mois'));
  }, []);
  useEffect(() => { updateURL(mode === 'tjm' ? { tjm, j: jours, ch: charges, act, f: foyer, fs: frais, fp, v: vue } : { ca, ch: charges, act, f: foyer, fs: frais, fp, v: vue }); }, [ca, tjm, jours, charges, act, foyer, frais, fp, vue]);

  const caAn = mode === 'tjm' ? tjm * Math.min(366, jours) : ca;
  const { activite, artisan } = actDe(Number(act));
  const fy = foyerDe(Number(foyer));
  const r = useMemo(() => {
    const base = { ca: caAn, charges, activite, artisan, foyer: fy, fraisPortage: fp / 100 };
    const res = comparer(base);
    // Les frais propres à une société ne pèsent que sur l'EURL et la SASU.
    if (frais > 0) { const s = comparer({ ...base, charges: charges + frais }); res.eurl = s.eurl; res.sasu = s.sasu; }
    return res;
  }, [caAn, charges, activite, artisan, fy, fp, frais]);
  const possibles = STATUTS.filter((s) => r[s].possible);
  const best = possibles.reduce((a, b) => (r[b].net > r[a].net ? b : a), possibles[0]);
  const div = vue === 'mois' ? 12 : 1;
  const nom = (s: Statut) => (lang === 'en' ? NOMS[s][1] : NOMS[s][0]);
  const maxNet = Math.max(...STATUTS.map((s) => r[s].net), 1);

  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className="p-4 sm:p-6">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {mode === 'tjm' ? (<>
            <NumberField id="st-tjm" label={tx(lang, 'TJM hors taxe', 'Day rate before VAT')} value={tjm} onChange={setTjm} unit="€" max={10000} lang={lang} />
            <NumberField id="st-j" label={tx(lang, 'Jours facturés par an', 'Days billed per year')} value={jours} onChange={setJours} unit={tx(lang, 'j', 'd')} max={366} lang={lang} />
          </>) : (
            <NumberField id="st-ca" label={tx(lang, 'Chiffre d’affaires annuel hors taxe', 'Annual turnover before VAT')} value={ca} onChange={setCa} unit="€" max={5_000_000} lang={lang} />
          )}
          <NumberField id="st-ch" label={tx(lang, 'Frais professionnels par an', 'Business expenses per year')} value={charges} onChange={setCharges} unit="€" max={5_000_000} lang={lang} />
          <SelectField id="st-act" label={tx(lang, 'Activité (pour la micro)', 'Activity (for micro)')} value={act} onChange={setAct} options={actOpt(lang)} />
          {mode !== 'tjm' && <SelectField id="st-f" label={tx(lang, 'Foyer fiscal', 'Tax household')} value={foyer} onChange={setFoyer} options={foyerOpt(lang)} />}
        </form>
        <details className="mt-4 rounded-lg border border-navy-200 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-navy-800">{tx(lang, 'Foyer, frais d’une société, frais de portage', 'Household, company running costs, umbrella fees')}</summary>
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
            {mode === 'tjm' && <SelectField id="st-f2" label={tx(lang, 'Foyer fiscal', 'Tax household')} value={foyer} onChange={setFoyer} options={foyerOpt(lang)} />}
            <NumberField id="st-fs" label={tx(lang, 'Frais propres à une société, par an', 'Company running costs per year')} value={frais} onChange={setFrais} unit="€" max={200000} lang={lang} help={tx(lang, 'comptable, banque, juridique : vos devis', 'accountant, bank, legal: your quotes')} />
            <NumberField id="st-fp" label={tx(lang, 'Frais de gestion du portage', 'Umbrella management fee')} value={fp} onChange={setFp} unit="%" max={30} decimals={1} lang={lang} help={tx(lang, 'taux de votre contrat de portage', 'rate in your umbrella contract')} />
          </div>
        </details>
        <div aria-live="polite" data-resultat className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Kopf label={tx(lang, `Meilleur net : ${nom(best)}`, `Best take-home: ${nom(best)}`)} wert={f.eur(r[best].net / div)} unter={tx(lang, `${vue === 'mois' ? 'par mois' : 'par an'}, après cotisations et impôts, pour ${f.eur(caAn)} de chiffre d’affaires`, `${vue === 'mois' ? 'a month' : 'a year'}, after contributions and taxes, on ${f.eur(caAn)} of turnover`)} />
            <Toggle id="st-vue" label={tx(lang, 'Afficher', 'Show')} value={vue} onChange={setVue} options={[{ value: 'mois', label: tx(lang, 'par mois', 'monthly') }, { value: 'an', label: tx(lang, 'par an', 'yearly') }]} />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm tabular-nums">
              <thead><tr className="border-b-2 border-navy-800 text-left text-navy-900">
                <th scope="col" className="py-2 pr-3">{tx(lang, 'Statut', 'Legal form')}</th>
                <th scope="col" className="py-2 pr-3 text-right">{tx(lang, 'Net en poche', 'Take-home')}</th>
                <th scope="col" className="py-2 pr-3 text-right">{tx(lang, 'Cotisations', 'Contributions')}</th>
                <th scope="col" className="py-2 pr-3 text-right">{tx(lang, 'IS + dividendes', 'Corp. tax + dividends')}</th>
                <th scope="col" className="py-2 pr-3 text-right">{tx(lang, 'Impôt sur le revenu', 'Income tax')}</th>
                <th scope="col" className="py-2 text-left">{tx(lang, 'Rémunération', 'Pay mix')}</th>
              </tr></thead>
              <tbody>
                {STATUTS.map((s) => {
                  const o = r[s];
                  return (
                    <tr key={s} className={`border-b border-navy-200 ${s === best ? 'bg-accent-50 font-semibold text-navy-900' : 'text-navy-800'}`}>
                      <th scope="row" className="py-2 pr-3 text-left font-medium">{nom(s)}{!o.possible && <span className="ml-1 text-xs font-normal text-amber-800">{tx(lang, '(plafond dépassé)', '(over the ceiling)')}</span>}</th>
                      <td className="py-2 pr-3 text-right"><span className="mr-2 inline-block h-2 rounded bg-accent-700 align-middle" style={{ width: `${Math.max(0, (o.net / maxNet) * 64)}px` }} aria-hidden="true" />{f.eur(o.net / div)}</td>
                      <td className="py-2 pr-3 text-right">{f.eur(o.cotisations / div)}</td>
                      <td className="py-2 pr-3 text-right">{f.eur((o.impotSocietes + o.prelevementsDividendes) / div)}</td>
                      <td className="py-2 pr-3 text-right">{f.eur(o.impotRevenu / div)}</td>
                      <td className="py-2 text-left text-xs text-navy-700">{o.partRemuneration === undefined ? '–' : o.partRemuneration >= 0.995 ? tx(lang, 'tout en rémunération', 'all salary') : o.partRemuneration <= 0.005 ? tx(lang, 'tout en dividendes', 'all dividends') : tx(lang, `${f.pct(o.partRemuneration, 0)} du bénéfice en rémunération`, `${f.pct(o.partRemuneration, 0)} of profit as pay`)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-navy-700">{tx(lang, `EURL et SASU : tout le bénéfice restant est distribué en dividendes au prélèvement forfaitaire unique de ${f.pct(P.dividendes.pfu, 1)}. Une rémunération nulle ne valide aucun trimestre de retraite.`, `EURL and SASU: all remaining profit is paid out as dividends under the ${f.pct(P.dividendes.pfu, 1)} flat tax. Zero pay earns no pension quarters.`)}</p>
          <Aktionen lang={lang} text={() => tx(lang, `Statuts 2026 pour ${f.eur(caAn)} de CA : meilleur net en ${nom(best)}, ${f.eur(r[best].net / 12)} par mois`, `Legal forms 2026 for ${f.eur(caAn)} turnover: best take-home as ${nom(best)}, ${f.eur(r[best].net / 12)} a month`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}
