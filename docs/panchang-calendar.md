# Panchang: Samvatsara, Ayana, Ritu, Paksha and Kāla (v4.50)

Five rows added to the panchang of a chart (CHART workspace and the daily panchang), the other members of the sankalpa: *…samvatsare, … ayane, … ṛtau, … māse, … pakṣe, … tithau, … vāsare, … nakṣatre, … yoge, … karaṇe, … kāle*. Masa, tithi, vara, nakshatra, yoga and karana were already there.

Code: `src/lib/panchang/calendar.ts` (the rules), `src/lib/panchang/index.ts` (the fields `samvatsara`, `ayana`, `ritu`, `kala`), `src/components/PanchangPanel.tsx`; tests `src/lib/panchang/calendar.test.ts`, `panchang.test.ts` and `e2e/charts.spec.ts`.

| Row | What it is | Rule (and the choice made) |
|---|---|---|
| **Samvatsara** | the year of the sixty-year cycle, with its number and the Śaka year | the cycle that runs with the Śaka year, the Chandramāna one of the South: number = (Śaka + 11) mod 60 + 1 (Krodhi 38 from Ugadi 2024, Vishvavasu 2025, Parabhava 2026); the year changes with Chaitra, so the chart's amānta month decides whether a date in January to March is still the year of the spring before (Magha, Phālguna and Pausha in January are). Without the month a date before 14 April counts as the old year and the row says "(approx.)". **The Bṛhaspati cycle of the North, which goes by Jupiter's own sign and skips years, is a different count and is not given.** |
| **Ayana** | Uttarayana or Dakshinayana | by the sidereal Sun: Uttarayana from Makara to Mithuna, Dakshinayana from Karka to Dhanu (the saṅkrānti at 270° and 90°). When the sāyana Ayana (by the tropical Sun, which turns at the solstices a month earlier) is the other, it is added: "Dakshinayana (sāyana: Uttarayana)". |
| **Ritu** | the season | two lunar months each from Chaitra, as the sankalpa names it: Vasanta Chaitra–Vaishakha, Grīṣma Jyeṣṭha–Āṣāḍha, Varṣā Śrāvaṇa–Bhādrapada, Śarad Āśvina–Kārttika, Hemanta Mārgaśīrṣa–Pauṣa, Śiśira Māgha–Phālguna; the solar Ritu (by the sidereal sign: Vasanta Mīna and Meṣa … Śiśira Makara and Kumbha) is added when it is not the same. An Adhika month takes the Ritu of its name. |
| **Paksha** | Shukla or Krishna, with waxing or waning | the tithi's half (it was in the tithi row too) |
| **Kāla** | the part of the day, with its hours | the day from sunrise to sunset in **five equal parts** (Prātaḥ, Saṅgava, Madhyāhna, Aparāhṇa, Sāyāhna, the usual fivefold day of the dharmaśāstra) and the night from sunset to the next sunrise in **three equal parts** (Pradoṣa, Niśītha, Uṣaḥ); a birth before sunrise is in the night before. **The night's three equal parts are a choice made here**: the texts name the parts of the night but give no equal division. Null where the Sun does not rise and set. |

The names are written without diacritics like the other names of the panchang (Tithi names, Masa). The year of the cycle for the names was checked on Ugadi 2023 to 2026 (Shobhakrit, Krodhi, Vishvavasu, Parabhava); the sixty names are those of the usual list and were not compared against a printed almanac here.

## Not built

The Brihaspati (Jupiter) samvatsara of the North; the Vikrama and Kali year numbers; the sankalpa as one sentence in Sanskrit; the Kāla by the five-fold Muhūrta of the night; the yuga and the manvantara of a full sankalpa.
