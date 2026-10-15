#!/usr/bin/env python3
"""Écrit public/llms.txt à partir du build (RECETTE §21). Appel : npm run build && python3 scripts/build-llms.py && npm run build"""
import glob, html, os, re
SITE = re.search(r'SITE_URL = "([^"]+)"', open('src/data/site-config.ts').read()).group(1)
rows = {'fr': [], 'en': []}
for f in sorted(glob.glob('dist/*/**/index.html', recursive=True)):
    d = open(f, encoding='utf-8').read()
    if 'noindex' in d[:3000] or '/embed/' in f: continue
    path = '/' + os.path.relpath(os.path.dirname(f), 'dist').replace(os.sep, '/') + '/'
    lang = path.split('/')[1]
    if lang not in rows: continue
    t = html.unescape(re.search(r'<title>(.*?)</title>', d, re.S).group(1))
    m = re.search(r'name="description" content="(.*?)"', d, re.S)
    rows[lang].append((path, t, html.unescape(m.group(1)) if m else ''))
out = ['# NetIndé', '',
       '> Site indépendant de Radif Partners, en français et en anglais, sur le revenu net des indépendants en France en 2026 : micro-entreprise (cotisations Urssaf par activité, CFP, taxe de chambre, Acre, versement libératoire, plafonds et franchise de TVA), CFE calculée commune par commune avec le fichier REI 2025 de la DGFiP, entreprise individuelle au réel et EURL avec le barème des travailleurs indépendants réformé en 2026, SASU (président assimilé salarié, impôt sur les sociétés, dividendes au prélèvement forfaitaire unique), portage salarial et TJM.', '',
       'Tous les calculs se font dans le navigateur ; aucune adresse e-mail demandée, aucune donnée collectée, aucune affiliation. Les résultats sont des estimations, pas un conseil personnalisé : l’Urssaf et l’administration fiscale fixent les montants. Le site n’est pas l’Urssaf.', '']
for lang, titre in (('fr', '## Pages en français'), ('en', '## Pages in English')):
    out.append(titre); out.append('')
    for p, t, d in rows[lang]: out.append(f'- [{t}]({SITE}{p}): {d}')
    out.append('')
open('public/llms.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('llms.txt :', sum(len(v) for v in rows.values()), 'pages')
