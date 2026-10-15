/**
 * Rémunération du dirigeant d'une SASU (assimilé salarié) ou d'une EURL à l'IS (gérant travailleur
 * indépendant) : partage du bénéfice entre rémunération et dividendes, IS, prélèvement forfaitaire,
 * impôt sur le revenu, et le partage qui maximise le net.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { sasuPart, eurlPart, enSASU, enEURL } from '../../lib/engine/statuts';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { foyerOpt, foyerDe } from '../../lib/minis/_kit';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L } from './kit';

interface Props { lang?: L; methodHref?: string; forme: 'sasu' | 'eurl'; preset?: { ca?: number; charges?: number; part?: number } }

export default function SocieteRechner({ lang = 'fr', methodHref, forme, preset = {} }: Props) {
  const f = fm(lang);
  const d = { ca: preset.ca ?? 90000, charges: preset.charges ?? 6000, part: preset.part ?? 50, foyer: 0, capital: 1000 };
  const [ca, setCa] = useState(d.ca);
  const [charges, setCharges] = useState(d.charges);
  const [part, setPart] = useState(d.part);
  const [foyer, setFoyer] = useState(String(d.foyer));
  const [capital, setCapital] = useState(d.capital);
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setCa(num(u, 'ca', d.ca)); setCharges(num(u, 'ch', d.charges)); setPart(num(u, 'pr', d.part)); setFoyer(str(u, 'f', '0')); setCapital(num(u, 'k', d.capital));
  }, []);
  useEffect(() => { updateURL({ ca, ch: charges, pr: part, f: foyer, k: capital }); }, [ca, charges, part, foyer, capital]);

  const i = { ca, charges, activite: 'bnc' as const, foyer: foyerDe(Number(foyer)), capital };
  const p = Math.min(100, Math.max(0, part)) / 100;
  const o = useMemo(() => (forme === 'sasu' ? sasuPart(i, p) : eurlPart(i, p)), [ca, charges, p, foyer, capital, forme]);
  const best = useMemo(() => (forme === 'sasu' ? enSASU(i) : enEURL(i)), [ca, charges, foyer, capital, forme]);
  const benef = Math.max(0, ca - charges);
  const brutRem = benef * p;
  const div = Math.max(0, benef - brutRem - o.impotSocietes);

  const rows = [
    { label: tx(lang, 'Bénéfice avant rémunération', 'Profit before director pay'), value: f.eur(benef) },
    { label: forme === 'sasu' ? tx(lang, 'Coût total de la rémunération', 'Total cost of salary') : tx(lang, 'Rémunération et cotisations du gérant', 'Manager pay and contributions'), value: f.eur(brutRem) },
    { label: tx(lang, 'dont cotisations sociales', 'of which social contributions'), value: f.eur(Math.max(0, brutRem - o.remunerationNette)), muted: true },
    { label: tx(lang, 'Rémunération nette', 'Net pay'), value: f.eur(o.remunerationNette) },
    { label: tx(lang, `Impôt sur les sociétés (${f.pct(P.is.taux_reduit, 0)} puis ${f.pct(P.is.taux_normal, 0)})`, `Corporate tax (${f.pct(P.is.taux_reduit, 0)} then ${f.pct(P.is.taux_normal, 0)})`), value: `− ${f.eur(o.impotSocietes)}` },
    { label: tx(lang, 'Dividendes distribués', 'Dividends paid out'), value: f.eur(div) },
    { label: forme === 'sasu' ? tx(lang, `Prélèvement forfaitaire (${f.pct(P.dividendes.pfu, 1)})`, `Flat tax (${f.pct(P.dividendes.pfu, 1)})`) : tx(lang, 'Prélèvements et cotisations sur dividendes', 'Tax and contributions on dividends'), value: `− ${f.eur(div - o.dividendesNets)}` },
    { label: tx(lang, 'Impôt sur le revenu (rémunération)', 'Income tax (on pay)'), value: `− ${f.eur(o.impotRevenu)}` },
    { label: tx(lang, 'Net en poche sur l’année', 'Take-home for the year'), value: f.eur(o.net), strong: true, sep: true },
  ];
  const ecart = best.net - o.net;
  const steps = [
    forme === 'sasu'
      ? tx(lang, `Le président est assimilé salarié : sur ${f.eur(brutRem)} de coût, il touche ${f.eur(o.remunerationNette)} net (cotisations patronales et salariales, sans assurance chômage).`, `The president is treated as an employee: out of ${f.eur(brutRem)} of cost, ${f.eur(o.remunerationNette)} is paid net (employer and employee contributions, no unemployment insurance).`)
      : tx(lang, `Le gérant majoritaire est travailleur indépendant : cotisations sur sa rémunération après l’abattement de ${f.pct(P.tns.abattement, 0)}, et sur la part des dividendes au-delà de ${f.pct(P.dividendes.seuil_tns_capital, 0)} du capital (${f.eur(capital)}).`, `The majority manager is self-employed: contributions on pay after the ${f.pct(P.tns.abattement, 0)} allowance, and on the part of dividends above ${f.pct(P.dividendes.seuil_tns_capital, 0)} of share capital (${f.eur(capital)}).`),
    tx(lang, `IS : ${f.pct(P.is.taux_reduit, 0)} jusqu’à ${f.eur(P.is.seuil_reduit)} de bénéfice, ${f.pct(P.is.taux_normal, 0)} au-delà, soit ${f.eur(o.impotSocietes)}.`, `Corporate tax: ${f.pct(P.is.taux_reduit, 0)} up to ${f.eur(P.is.seuil_reduit)} of profit, ${f.pct(P.is.taux_normal, 0)} above, i.e. ${f.eur(o.impotSocietes)}.`),
    tx(lang, `Meilleur partage trouvé : ${f.pct(best.partRemuneration ?? 0, 0)} du bénéfice en rémunération, ${f.eur(best.net)} net par an${ecart > 1 ? `, soit ${f.eur(ecart)} de plus que votre réglage` : ''}.`, `Best split found: ${f.pct(best.partRemuneration ?? 0, 0)} of profit as pay, ${f.eur(best.net)} net a year${ecart > 1 ? `, ${f.eur(ecart)} more than your setting` : ''}.`),
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id={`so-ca-${forme}`} label={tx(lang, 'Chiffre d’affaires hors taxe', 'Turnover before VAT')} value={ca} onChange={setCa} unit="€" max={5_000_000} lang={lang} />
            <NumberField id={`so-ch-${forme}`} label={tx(lang, 'Charges de la société', 'Company expenses')} value={charges} onChange={setCharges} unit="€" max={5_000_000} lang={lang} help={tx(lang, 'hors rémunération du dirigeant', 'excluding director pay')} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id={`so-pr-${forme}`} label={tx(lang, 'Part du bénéfice en rémunération', 'Share of profit paid as salary')} value={part} onChange={setPart} unit="%" max={100} lang={lang} help={tx(lang, 'le reste part en dividendes après IS', 'the rest goes to dividends after corporate tax')} />
            <SelectField id={`so-f-${forme}`} label={tx(lang, 'Foyer fiscal', 'Tax household')} value={foyer} onChange={setFoyer} options={foyerOpt(lang)} />
          </div>
          {forme === 'eurl' && <NumberField id="so-k" label={tx(lang, 'Capital et comptes courants d’associé', 'Share capital and partner current account')} value={capital} onChange={setCapital} unit="€" max={10_000_000} lang={lang} help={tx(lang, 'seuil de 10 % pour les dividendes soumis aux cotisations', '10% threshold for dividends subject to contributions')} />}
          <button type="button" onClick={() => setPart(Math.round((best.partRemuneration ?? 0) * 100))} className="rounded-md border border-accent-700 bg-white px-3 py-2 text-sm font-semibold text-accent-800 hover:bg-accent-50">{tx(lang, `Appliquer le meilleur partage (${f.pct(best.partRemuneration ?? 0, 0)})`, `Use the best split (${f.pct(best.partRemuneration ?? 0, 0)})`)}</button>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'Net en poche par mois', 'Take-home per month')} wert={f.eur(o.net / 12)} unter={tx(lang, `${f.eur(o.net)} par an, rémunération et dividendes`, `${f.eur(o.net)} a year, pay and dividends`)} />
          <Zeilen rows={rows} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `${forme.toUpperCase()} 2026 : ${f.eur(o.net / 12)} net par mois avec ${f.pct(p, 0)} en rémunération`, `${forme.toUpperCase()} 2026: ${f.eur(o.net / 12)} take-home a month with ${f.pct(p, 0)} as pay`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}
