# The worksheet of the twelve houses (Sudarshana chakra)

The table in TIMING → Sudarśana follows a worksheet shown in a video on the Sudarshana Chakra paddhati (the channel Revatiraa). It is a **modern worksheet**, not a rule of BPHS (BPHS 74 is
the verdict on a house, already in the page). Each column was checked against the worksheet for the chart it shows: 3 December 1984, 09:17, Howrah (Lahiri, mean node); the Lagna is
Capricorn, the Sun is in Scorpio, the Moon in Pisces. `src/lib/sudarshanaTable.test.ts` keeps the checks.

| Column | Rule | Checked |
|---|---|---|
| In the signs (Placement) | the grahas standing in the sign of the house in each of the three charts (Lagna, Moon, Sun); B: Moon, Mercury, Jupiter, Venus; M: the others, the nodes too | all houses but the 4th; the order inside a cell differs |
| Lords of the three signs, Strength | the lord of each of the three signs by its state in its own sign: exalted 1, moolatrikona 0.75 (the whole sign, as BPHS 3), own sign 0.5, friendly 0.25, neutral 0.125, enemy or debilitated 0; the sum over three, over 3 | 11 of 12 rows |
| V-AMSHA | the mean of the Auspi of the grahas in the house (Auspi = good count over six), 50 for an empty house | 11 of 12 rows |
| SAV | the Sarvāṣṭakavarga (Parāśara's) of the sign of the house counted from the Lagna | all eleven shown (the 7th is hidden in the picture; the page gives 23) |
| Aspects | the grahas outside the sign that aspect it (Parāśara's: the 7th, and the special aspects of Mars, Jupiter, Saturn and the nodes) in any of the three charts, B or M | **not matched** (see below) |

## Where the worksheet and the page differ

* **The 8th house, strength.** The worksheet's letters are F,N,N (0.25 + 0.125 + 0.125 = 0.5, 16.67 %) but its number is 1.25 (41.67 %), the same as the 9th row: a copy slip. The page gives 0.5.
* **The 4th house.** The worksheet has a B (the Moon) there and 66.67 for V-AMSHA; no graha stands in the 4th of any of the three charts (the Moon is in the 1st, 3rd and 5th), so the page gives 50. The worksheet has 28 entries for the 27 (nine grahas in three charts).
* **The letter E** was read as "enemy" by one reader and "exalted" by another; the numbers decide: E scores 1, and in this chart Mars (in Capricorn) and Saturn (in Libra) are exalted, so
  the signs they rule (Aries, Scorpio; Capricorn, Aquarius) are the E signs; twelve of the 36 lord cells, as in the worksheet.

## What is not computed

* **Good and Bad** (six per graha; Auspi = Good ÷ 6). The author copies them from the Shadvarga view of Jagannatha Hora (Good, and Bad = 6 − Good). The page asks for the nine good counts and
  does not compute them: the rule inside Jagannatha Hora's view is not known here. Tried and not matching: the dignity in D1, D2, D3, D9, D12, D30 by the natural and the compound friendships
  (Sun is friend or better in all six but the worksheet has 3), the nature of the lord of each divisional sign, and over a hundred other combinations of divisional charts; the best match
  was no better than chance. So the page does not guess them.
* **Aspect.** The worksheet has a B in each even house (2 to 12) and Mars (M) in the 6th, "by looking at the chart". The page's full Parāśara aspects give, from Jupiter, Mercury and Venus
  (all three in Sagittarius), exactly the houses 2, 4, 6, 8 and 10 of the worksheet; the 12th is not reached by any benefic. The Moon aspects the 7th, 9th and 11th and Mars most of the houses (2, 4, 5, 6, 7, 8, 9, 10), which
  the worksheet does not show. The page shows its own computation (the Moon counted as a benefic), so the column differs from the worksheet's in the 12th and in the houses of the Moon and Mars.
* **Remarks** (good, average, below average, bad) are the author's judgment. A score of the strength, the SAV and the benefic aspect orders the twelve rows as the worksheet does but ties
  in one place (the 5th and the 9th), so no rule is made of it.
