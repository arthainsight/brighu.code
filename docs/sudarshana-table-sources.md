# The worksheet of the twelve houses (Sudarshana chakra)

The table in TIMING → Sudarśana follows a worksheet shown in a video on the Sudarshana Chakra paddhati (the channel Revatiraa). It is a **modern worksheet**, not a rule of BPHS (BPHS 74 is
the verdict on a house, already in the page). Each column was checked against the worksheet for the chart it shows: 3 December 1984, 09:17, Howrah (Lahiri, mean node); the Lagna is
Capricorn, the Sun is in Scorpio, the Moon in Pisces. `src/lib/sudarshanaTable.test.ts` keeps the checks.

| Column | Rule | Checked |
|---|---|---|
| In the signs (Placement) | the grahas standing in the sign of the house in each of the three charts (Lagna, Moon, Sun); B: Moon, Mercury, Jupiter, Venus; M: the others, the nodes too | all houses but the 4th; the order inside a cell differs |
| Lords of the three signs, Strength | the lord of each of the three signs by its state in its own sign: exalted 1, moolatrikona 0.75 (the whole sign, as BPHS 3), own sign 0.5, friendly 0.25, neutral 0.125, enemy or debilitated 0; the sum over three, over 3 | 11 of 12 rows |
| V-AMSHA (Vaiśeṣikāṁśa) | the mean of the Auspi of the grahas in the house (Auspi = good count over six), 50 for an empty house; the good counts are the page's own (below) unless typed in | 11 of 12 rows with the worksheet's counts typed in |
| SAV | the Sarvāṣṭakavarga (Parāśara's) of the sign of the house counted from the Lagna | all eleven shown (the 7th is hidden in the picture; the page gives 23) |
| Aspects | the grahas outside the sign that aspect it (Parāśara's: the 7th, and the special aspects of Mars, Jupiter, Saturn and the nodes) in any of the three charts, B or M | **not matched** (see below) |

## Where the worksheet and the page differ

* **The 8th house, strength.** The worksheet's letters are F,N,N (0.25 + 0.125 + 0.125 = 0.5, 16.67 %) but its number is 1.25 (41.67 %), the same as the 9th row: a copy slip. The page gives 0.5.
* **The 4th house.** The worksheet has a B (the Moon) there and 66.67 for V-AMSHA; no graha stands in the 4th of any of the three charts (the Moon is in the 1st, 3rd and 5th), so the page gives 50. The worksheet has 28 entries for the 27 (nine grahas in three charts).
* **The letter E** was read as "enemy" by one reader and "exalted" by another; the numbers decide: E scores 1, and in this chart Mars (in Capricorn) and Saturn (in Libra) are exalted, so
  the signs they rule (Aries, Scorpio; Capricorn, Aquarius) are the E signs; twelve of the 36 lord cells, as in the worksheet.

## What is not computed

* **Good and Bad** (six per graha; Auspi = Good ÷ 6). The author copies them from Jagannatha Hora (its Vaiseshikamsa (6) bars; Bad = 6 − Good). The page has two counts and a box
  for each graha to type another:
  * **BPHS 6.52, the certain half** (shown first): the vargas of the Ṣaḍvarga (D1, D2, D3, D9, D12, D30) in which the graha is in its exaltation, mūlatrikoṇa or own sign. Rahu and
    Ketu have no such sign and are left out of the mean of a house (a house with the nodes only is 50). For the worksheet's chart: 1, 1, 1, 1, 2, 1, 2.
  * **As Jagannatha Hora** (v4.33): that program's reading of the second half of the verse and of 6.53, found by reproducing the worksheet's numbers and confirmed in the program
    (`vaisheshikamsa-sources.md`). It gives the worksheet's 3, 4, 5, 2, 2, 3, 3, 2, 3 and with them its V-AMSHA column in eleven rows of twelve (the 4th differs for the reason above).
    It depends on which Śayanādi states are bad, of which only Upaveśana is known.
* **Aspect.** The worksheet has a B in each even house (2 to 12) and Mars (M) in the 6th, "by looking at the chart". The page's full Parāśara aspects give, from Jupiter, Mercury and Venus
  (all three in Sagittarius), exactly the houses 2, 4, 6, 8 and 10 of the worksheet; the 12th is not reached by any benefic. The Moon aspects the 7th, 9th and 11th and Mars most of the houses (2, 4, 5, 6, 7, 8, 9, 10), which
  the worksheet does not show. The page shows its own computation (the Moon counted as a benefic), so the column differs from the worksheet's in the 12th and in the houses of the Moon and Mars.
* **Remarks** (good, average, below average, bad) are the author's judgment. A score of the strength, the SAV and the benefic aspect orders the twelve rows as the worksheet does but ties
  in one place (the 5th and the 9th), so no rule is made of it.

## The ten-year daśā (v4.32)

The second part of the same video series (the Phalita part) runs the chakra in two ways. The yearly daśā with its months is BPHS 74 and was already in the page. The other is added
from a written summary of the video given by the user; the video itself and the books it names (Bimal Kanti Roy in Bengali, the Phalita Mārtaṇḍa, Gopesh Kumar Ojha on the
Aṣṭakavarga) **were not read**, so nothing here is checked against a text.

| Part | Rule | In the page |
|---|---|---|
| The daśā | each house rules ten years of age: the 1st from birth to 10, the 2nd from 10 to 20 … twelve houses, 120 years | `sudarshanaDecadeHouse`; after 120 the 1st again |
| The antardaśā | ten months each, twelve of them, the first the house of the daśā | the ten years in twelve equal parts |
| The years | not said | a year is a sidereal solar return, as in the yearly daśā; the ten years run from the return that completes 10 × n years (birth for the first) to the tenth after it |
| The daśā house as a Lagna | benefics in a kendra, a trikoṇa or the 8th from it are favourable; malefics in the 3rd, 6th, 10th or 11th are favourable; Rahu in a kendra, a trikoṇa or the 8th from the house or from its lord makes the time hard | a table for the three charts, the houses counted from the sign of the daśā house; benefics are the Moon, Mercury, Jupiter and Venus, as in the worksheet |

Not built: the Ṣaḍbala percent of the three lords and which of them leads (the summary's example: Saturn and Venus 50 %, Jupiter 33.3 %, Saturn leading because exalted; the worksheet's
strength column is another measure), the bhāva-kāraka, the month lord (*māsādhipati*) of the yearly daśā as the one that gives the event, and the joining with the Viṁśottarī, the
natural ages and the transits. Rahu in the 10th is both a kendra and an upachaya; the summary does not say which wins, and the page shows both.
