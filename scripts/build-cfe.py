#!/usr/bin/env python3
"""Jeu de données CFE par commune (base minimum, sans local) à partir du fichier REI de la DGFiP.

Source : « Impôts locaux : fichier de recensement des éléments d'imposition à la fiscalité directe
locale (REI) », millésime 2025, data.economie.gouv.fr, Licence Ouverte 2.0. Noms de communes : code
officiel géographique 2025 de l'Insee (Licence Ouverte). Rejouable :

    python3 scripts/build-cfe.py <REI_2025.csv> <v_commune_2025.csv> <v_departement_2025.csv>

Sorties : public/data/cfe/<dep>.json (une liste par département, chargée à la demande par le
simulateur, aucune donnée de l'utilisateur n'est envoyée) et src/data/cfe-departements.json.

Taux global retenu = part communale (P12) + syndicats (P22) + intercommunalité (P32) + taxe spéciale
d'équipement (P52) + Gemapi (P52gGEMAPI) + TASARIF (P52TASA) + TSC (P52TSC), en pourcentage.
Bases minimum : BAMINTCT1 à BAMINTCT6 (temps complet), vides si la commune n'en publie pas.
"""
import csv, json, os, sys
rei, cogc, cogd = sys.argv[1:4]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cog = {r['COM']: r['LIBELLE'] for r in csv.DictReader(open(cogc, encoding='utf-8')) if r['TYPECOM'] == 'COM'}
deps = {r['DEP']: r['LIBELLE'] for r in csv.DictReader(open(cogd, encoding='utf-8'))}
def f(x):
    x = (x or '').strip()
    try: return float(x)
    except ValueError: return 0.0
def titre(s):
    return ' '.join(w.capitalize() if w.lower() not in ('de', 'du', 'des', 'la', 'le', 'les', 'en', 'sur', 'sous', 'et', 'aux') else w.lower() for w in s.replace('-', ' ').split())
out = {}
for row in csv.DictReader(open(rei, encoding='latin-1'), delimiter=';'):
    d, c = row['DEP'].strip(), row['COM'].strip()
    if d in ('977', '978'): continue  # Saint-Barthélemy, Saint-Martin : fiscalité propre, pas de CFE
    code = d + c if len(d) == 2 else d + c[-2:]
    nom = cog.get(code) or titre(row['LIBCOM'].strip())
    taux = sum(f(row.get(k)) for k in ('P12', 'P22', 'P32', 'P52', 'P52gGEMAPI', 'P52TASA', 'P52TSC'))
    bases = []
    for i in range(1, 7):
        v = (row.get(f'BAMINTCT{i}') or '').strip()
        bases.append(int(float(v)) if v not in ('', '0') else None)
    out.setdefault(d, []).append({'c': code, 'n': nom, 't': round(taux / 100, 6), 'b': bases})
os.makedirs(os.path.join(root, 'public/data/cfe'), exist_ok=True)
index = []
for d, lst in sorted(out.items()):
    lst.sort(key=lambda x: x['n'])
    json.dump(lst, open(os.path.join(root, f'public/data/cfe/{d}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    index.append({'d': d, 'n': deps.get(d, d), 'k': len(lst)})
json.dump({'millesime': 2025, 'source': 'DGFiP, REI 2025', 'departements': index}, open(os.path.join(root, 'src/data/cfe-departements.json'), 'w'), ensure_ascii=False, indent=0)
print(sum(len(v) for v in out.values()), 'communes,', len(out), 'départements')

# Détail des grandes villes (pages par ville et mini-simulateur cfeVille) : taux par bénéficiaire.
VILLES = ['75056', '13055', '69123', '31555', '33063', '59350']
detail = []
for row in csv.DictReader(open(rei, encoding='latin-1'), delimiter=';'):
    d, c = row['DEP'].strip(), row['COM'].strip()
    code = d + c if len(d) == 2 else d + c[-2:]
    if code not in VILLES: continue
    parts = {k: round(f(row.get(k)) / 100, 6) for k in ('P12', 'P22', 'P32', 'P52', 'P52gGEMAPI', 'P52TASA', 'P52TSC')}
    bases = [int(float(row[f'BAMINTCT{i}'])) if (row.get(f'BAMINTCT{i}') or '').strip() not in ('', '0') else None for i in range(1, 7)]
    detail.append({'c': code, 'n': cog.get(code, row['LIBCOM'].strip()), 'dep': d, 'fiscalite': row['OPTEPCI'].strip(), 'parts': parts, 't': round(sum(parts.values()), 6), 'b': bases})
detail.sort(key=lambda x: VILLES.index(x['c']))
json.dump({'millesime': 2025, 'source': 'DGFiP, REI 2025', 'villes': detail}, open(os.path.join(root, 'src/data/cfe-villes.json'), 'w'), ensure_ascii=False, indent=1)
print(len(detail), 'villes détaillées')
