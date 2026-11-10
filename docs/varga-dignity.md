# Varga dignity (ANALYSIS → Varga dignity, v4.39)

The dignity of the seven grahas in a divisional chart (the Navāṁśa first; D1, D7, D10, D12 and D16 too), the average of it, and the list of the grahas in the order of dominance with the signs ∇, Δ and a flag. After the lessons of a modern teacher (Vic DiCara's video "Dignity: the most important technique in astrology", his notes on the recursive dignity, and the video on the Navāṁśa chart); not a rule of a classic, and the page says so.

Code: `src/lib/vargaDignity.ts`, `src/components/VargaDignityPanel.tsx`, test `src/lib/vargaDignity.test.ts`.

## What the lessons give

* A spectrum: exalted (the challenge is met actively), own sign (it does not come), great friend, friend, neutral, enemy, great enemy, fallen. The four upper states are read as good and the rest as undignified.
* The dignity is recursive: a graha in the sign of a host takes what the host can offer by the host's own dignity, and that by the host's host; the contacts (conjunction, aspect) too; the Ṣaḍbala decides which of two has the upper hand.
* The Navāṁśa: the average dignity of all the grahas and the houses as a pulse of the chart (high: living by one's dharma is easy), and a list of the grahas by their dominance in it with ∇ (high dominance, low dignity), Δ (low dominance, good dignity) and a flag (a sharp turn between two grahas of a different kind).

The teacher's report gives no formula for the scores, the dominance or the signs; his site and the video say so.

## What was chosen here

| | |
|---|---|
| The steps | exalted 7, own sign (the mūlatrikoṇa too) 6, great friend 5, friend 4, neutral 3, enemy 2, great enemy 1, fallen 0; the compound relation of BPHS 3.55–58 as in Vimśopaka Bala, the temporary friendship read from the division's own signs |
| The recursion | effective = 0.6 × own score + 0.4 × the host's effective score, worked out to a fixed point (so that an exchange of signs settles); a graha in its own sign stands on its own |
| Good | an effective score of 4 or more |
| Dominance | the number of the seven grahas and the Lagna whose chain of hosts reaches the graha, itself counted; ties by the effective score, then the order of the week |
| ∇ | among the upper three of the list with an effective score under 4 |
| Δ | among the lower three with an effective score of 4 or more |
| The flag | between two next to each other where one is a benefic (Moon, Mercury, Jupiter, Venus) and the other a malefic (Sun, Mars, Saturn) |
| The average | the mean of the effective scores of the seven grahas, out of 7 (the houses are not counted) |

## Not built

Conjunctions and aspects in the recursion; the dignity of the houses; the ten-step scale of the report (the steps of the lesson are eight); Rāhu and Ketu; the Ṣaḍbala as the judge between two grahas.
