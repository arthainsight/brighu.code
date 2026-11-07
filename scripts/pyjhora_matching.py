"""
Reference values for src/lib/pyjhoraMatching.test.ts, from PyJHora (another Jyotish program): the Ashtakoota (North) kūṭas and the
four extra matchings of every pair of Moon star and quarter, 27 x 4 against 27 x 4, boy and girl, 11,664 pairs.

    python -m venv venv && venv/bin/pip install PyJHora pyswisseph numpy geocoder pytz timezonefinder geopy python-dateutil
    venv/bin/python scripts/pyjhora_matching.py src/lib/fixtures/pyjhoraMatching.json

One string for each matching, one character for each pair, the pairs in the order boy star, boy quarter, girl star, girl quarter
(each from 1; the boy's loop is the outer one). A score is a digit, or a letter 'a' + twice the score where a half point is possible
(a = 0, b = 0.5, c = 1 …). A yes or no is 0 or 1.
"""
import contextlib
import json
import sys

with contextlib.redirect_stdout(sys.stderr):
    from jhora.horoscope.match import compatibility as c

FIELDS = ['varna', 'vashya', 'tara', 'yoni', 'maitri', 'gana', 'bhakoot', 'nadi', 'mahendra', 'vedha', 'rajju', 'stri_dirgha']
out = {name: [] for name in FIELDS}
rasi = []
for bn in range(1, 28):
    for bp in range(1, 5):
        for gn in range(1, 28):
            for gp in range(1, 5):
                a = c.Ashtakoota(bn, bp, gn, gp)
                values = {
                    'varna': a.varna_porutham()[0], 'vashya': a.vasiya_porutham()[0], 'tara': a.nakshathra_porutham()[0],
                    'yoni': a.yoni_porutham()[0], 'maitri': a.raasi_adhipathi_porutham()[0], 'gana': a.gana_porutham()[0],
                    'bhakoot': a.raasi_porutham()[0], 'nadi': a.naadi_porutham()[0],
                    'mahendra': a.mahendra_porutham(), 'vedha': a.vedha_porutham(), 'rajju': a.rajju_porutham(), 'stri_dirgha': a.sthree_dheerga_porutham(),
                }
                for name, value in values.items():
                    if isinstance(value, bool):
                        out[name].append('1' if value else '0')
                    else:
                        out[name].append(chr(ord('a') + int(round(value * 2))))
result = {name: ''.join(chars) for name, chars in out.items()}
with open(sys.argv[1], 'w') as handle:
    json.dump(result, handle, separators=(',', ':'))
print('wrote', sys.argv[1], len(result['yoni']), 'pairs', file=sys.stderr)
