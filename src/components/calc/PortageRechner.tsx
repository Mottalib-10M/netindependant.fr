/**
 * Portage salarial : du chiffre d'affaires (ou TJM × jours) au salaire net, avec les frais de gestion
 * du contrat et la grille de cotisations du modèle publié par l'Urssaf ; comparaison avec la
 * micro-entreprise en libéral pour le même chiffre d'affaires.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { portage } from '../../lib/engine/portage';
import { enPortage, enMicro } from '../../lib/engine/statuts';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { foyerOpt, foyerDe } from '../../lib/minis/_kit';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L } from './kit';

interface Props { lang?: L; methodHref?: string; preset?: { tjm?: number; jours?: number; frais?: number } }
export default function PortageRechner({ lang = 'fr', methodHref, preset = {} }: Props) {
  const f = fm(lang);
  const d = { tjm: preset.tjm ?? 450, jours: preset.jours ?? 200, frais: preset.frais ?? 8, pro: 0, foyer: 0 };
  const [tjm, setTjm] = useState(d.tjm);
  const [jours, setJours] = useState(d.jours);
  const [frais, setFrais] = useState(d.frais);
  const [pro, setPro] = useState(d.pro);
  const [foyer, setFoyer] = useState(String(d.foyer));
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setTjm(num(u, 'tjm', d.tjm)); setJours(num(u, 'j', d.jours)); setFrais(num(u, 'fg', d.frais)); setPro(num(u, 'fp', 0)); setFoyer(str(u, 'f', '0'));
  }, []);
  useEffect(() => { updateURL({ tjm, j: jours, fg: frais, fp: pro, f: foyer }); }, [tjm, jours, frais, pro, foyer]);
  const ca = tjm * Math.min(366, jours);
  const fy = foyerDe(Number(foyer));
  const p = useMemo(() => portage(ca, frais / 100, pro), [ca, frais, pro]);
  const o = useMemo(() => enPortage({ ca, charges: pro, activite: 'bnc', foyer: fy, fraisPortage: frais / 100 }), [ca, pro, fy, frais]);
  const m = useMemo(() => enMicro({ ca, charges: pro, activite: 'bnc', foyer: fy }), [ca, pro, fy]);
  const rows = [
    { label: tx(lang, 'Chiffre d’affaires facturé', 'Turnover billed'), value: f.eur(ca) },
    { label: tx(lang, `Frais de gestion (${f.pct(frais / 100, 1)})`, `Management fee (${f.pct(frais / 100, 1)})`), value: `− ${f.eur(p.fraisGestion)}` },
    ...(pro > 0 ? [{ label: tx(lang, 'Frais professionnels remboursés', 'Expenses reimbursed'), value: `− ${f.eur(p.fraisPro)}` }] : []),
    { label: tx(lang, 'Coût employeur du salaire', 'Employer cost of salary'), value: f.eur(p.cout) },
    { label: tx(lang, 'Salaire brut', 'Gross salary'), value: f.eur(p.brut) },
    { label: tx(lang, 'Cotisations patronales et salariales', 'Employer and employee contributions'), value: `− ${f.eur(p.cotisations)}` },
    { label: tx(lang, 'Salaire net avant impôt', 'Net salary before tax'), value: f.eur(p.net - p.fraisPro) },
    { label: tx(lang, 'Impôt sur le revenu', 'Income tax'), value: `− ${f.eur(o.impotRevenu)}` },
    { label: tx(lang, 'Net en poche sur l’année', 'Take-home for the year'), value: f.eur(o.net), strong: true, sep: true },
    { label: tx(lang, 'Même CA en micro-entreprise libérale', 'Same turnover as a micro-enterprise (BNC)'), value: m.possible ? f.eur(m.net) : tx(lang, 'plafond dépassé', 'over the ceiling'), muted: true },
  ];
  const steps = [
    tx(lang, `${f.eur(tjm)} × ${f.num(Math.min(366, jours))} jours = ${f.eur(ca)} facturés par la société de portage.`, `${f.eur(tjm)} × ${f.num(Math.min(366, jours))} days = ${f.eur(ca)} billed by the umbrella company.`),
    tx(lang, `Après frais, ${f.eur(p.cout)} financent le salaire : c’est le coût employeur, cotisations patronales comprises (assurance chômage incluse).`, `After fees, ${f.eur(p.cout)} fund the salary: this is the employer cost including employer contributions (unemployment insurance included).`),
    p.sousMinimum ? tx(lang, `Le brut mensuel tombe sous le minimum de ${f.eur(P.portage.minimum_brut_mensuel, 2)} fixé pour le portage : la mission ne suffit pas à le financer.`, `Monthly gross falls below the ${f.eur(P.portage.minimum_brut_mensuel, 2)} umbrella minimum: the assignment cannot fund it.`) : '',
  ].filter(Boolean);
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id="po-tjm" label={tx(lang, 'TJM hors taxe', 'Day rate before VAT')} value={tjm} onChange={setTjm} unit="€" max={10000} lang={lang} />
            <NumberField id="po-j" label={tx(lang, 'Jours facturés par an', 'Days billed per year')} value={jours} onChange={setJours} unit={tx(lang, 'j', 'd')} max={366} lang={lang} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id="po-fg" label={tx(lang, 'Frais de gestion du contrat', 'Contract management fee')} value={frais} onChange={setFrais} unit="%" max={30} decimals={1} lang={lang} help={tx(lang, 'le taux écrit dans votre contrat', 'the rate in your contract')} />
            <NumberField id="po-fp" label={tx(lang, 'Frais professionnels par an', 'Business expenses per year')} value={pro} onChange={setPro} unit="€" max={500000} lang={lang} help={tx(lang, 'remboursés sur justificatifs', 'reimbursed against receipts')} />
          </div>
          <SelectField id="po-f" label={tx(lang, 'Foyer fiscal', 'Tax household')} value={foyer} onChange={setFoyer} options={foyerOpt(lang)} />
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'Net en poche par mois', 'Take-home per month')} wert={f.eur(o.net / 12)} unter={tx(lang, `salaire net ${f.eur((p.net - p.fraisPro) / 12)} par mois avant impôt`, `net salary ${f.eur((p.net - p.fraisPro) / 12)} a month before tax`)} />
          <Zeilen rows={rows} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `Portage salarial 2026 : TJM ${f.eur(tjm)} → ${f.eur(o.net / 12)} net par mois`, `Umbrella employment 2026: day rate ${f.eur(tjm)} → ${f.eur(o.net / 12)} take-home a month`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}
