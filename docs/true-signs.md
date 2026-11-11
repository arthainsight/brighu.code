# True signs (ANALYSIS → True signs, v4.40)

The signs the grahas take in six divisions, counted together, after a video lesson on a modern True Signs report. It is not a rule of a classic, and the page says so.

Code: `src/lib/trueSigns.ts`, `src/components/TrueSignsPanel.tsx`, test `src/lib/trueSigns.test.ts`.

## What the lesson says

* The divisions are D1 (Rāśi), D7, D9 (Navāṁśa), D10 (Daśāṁśa), D12 (Dvādaśāṁśa) and D16 (Ṣoḍaśāṁśa).
* The D9 counts three quarters of the D1.
* The overall balance of signs is given in per cent, and the same for each graha.

## What was found, not given

The lesson gives weights only roughly (the D12 "about 13 %", the D16 "about 4 %"), which do not agree with the chart it shows. That chart's Venus has
30.8 %, 23.1 %, 15.4 %, 15.4 %, 7.7 % and 7.7 %: thirteenths, 4, 3, 2, 2, 1 and 1. With Venus at 19°54′ Virgo (tropical, 169.9°) the six divisions put it
in Virgo (D1), Gemini (D9), Cancer (D7), Aries (D12), Scorpio (D10) and Libra (D16), and the weights

| D1 | D9 | D7 | D12 | D10 | D16 |
|---|---|---|---|---|---|
| 4 | 3 | 2 | 2 | 1 | 1 |

give exactly those six numbers with the Parāśara divisions of the app (the test holds it). D9 over D1 is 3/4, as the lesson says. No other set of
divisions and rules was found to fit: all 13-division subsets of the app's 20 divisions under the four schemes of the app gave no match.

## Open

* The birth time of the chart in the lesson was taken from memory; with 20°10′ Virgo (170.17°) the D9 is Cancer and the numbers do not match, so the Venus of the lesson is a little before 20° Virgo.
* Not built: the sign rulers against the lord of the Lagna, the positive and negative spectrum of each sign, and the dignity of the grahas in the divisions with the ten-step scale (the lesson names them but does not give the working).
* Which grahas count in the overall balance is not said. The view takes the seven and lets the Lagna, Rāhu and Ketu be added.

## The overall balance (found v4.40)

The overall balance of signs is the mean of the bodies' own balances (the weights 4, 3, 2, 2, 1, 1 over the six divisions) with a weight for each body, given by the user from the report:

| Lagna | Moon | Sun | Mars, Mercury, Jupiter, Venus, Saturn | Rāhu, Ketu |
|---|---|---|---|---|
| 1 | 0.75 | 0.6 | 0.5 each | 0.5 each |

Checked against the overall balances shown in two videos, with the longitudes the app gives with the ayanāṁśa set to none (tropical) and the **true** node:

* Donald Trump (14.6.1946 10:54 EDT, Jamaica, New York): all twelve signs to the tenth of a per cent (the largest difference 0.05, in the rounding).
* Jim Morrison (8.12.1943 11:55 EWT, Melbourne, Florida): all twelve signs to the tenth of a per cent. With the mean node the numbers do not agree (a total difference of 8 per cent points), so the report takes the true node.

Both are in `src/lib/trueSigns.test.ts`. Kim Kardashian's chart of the first video could not be matched: her birth time was taken from memory.

The zodiac is tropical: with the Lahiri ayanāṁśa the same weights are far off (47 per cent points for Trump).
