# Sarvatobhadra: Lattā and good and difficult periods (v4.43)

Two additions to ANALYSIS → Sarvatobhadra.

Code: `src/lib/sarvatobhadraPeriods.ts`, `src/components/SarvatobhadraPeriods.tsx`, `src/components/SarvatobhadraPanel.tsx`; tests `src/lib/sarvatobhadraPeriods.test.ts` and `e2e/sarvatobhadra-periods.spec.ts`.

## Lattā

The kick of a graha, from the rules the app already has for the Phaladīpikā (26.42–47, `LATTA` in `phaladipikaGochara.ts`): counting the graha's own nakṣatra as 1, forward for the Sun (12), Mars (3), Jupiter (6) and Saturn (8); backward for Venus (5), Mercury (7), Rāhu (9) and the Moon (22). Ketu has none. The kicked nakṣatra is marked on the chakra (a dashed square with ↯ and the kicker's code) when Latta is pressed, for the natal grahas and, with Transit on, the transiting ones, and listed with the result the text gives when the kick falls on the birth nakṣatra and with the grahas that stand in the square kicked.

The Muhūrta Mārtaṇḍa (v. 16) counts some of the grahas otherwise (Mercury the 22nd, Venus the 24th, Rāhu the 20th, the Moon the 7th); Mahādosha's Lattā follows that text (`docs/muhurta-martanda-kalaprakasika.md`). The chakra follows the Phaladīpikā, as the transit table does.

## Good and difficult periods

The vedha of a transiting graha (the line across the chakra and the two diagonals from its nakṣatra's square) reaches the points of the birth the chakra is already read for: the Moon's nakṣatra, the Moon's sign, the Lagna's sign, the birth tithi and weekday, and the syllable of the name. While the graha stands in one square (and one nakṣatra of the 27), the points it reaches are the same, so the time is cut into **stretches** at the changes of nakṣatra (the edge is half way between two samples of the ephemeris: 12 hours for the Sun, Mars, Mercury and Venus, a day for Jupiter, Saturn and the nodes, 3 hours for the Moon).

| Choice | Value |
|---|---|
| Benefics | Moon, Mercury, Jupiter, Venus; the Sun, Mars, Saturn, Rāhu and Ketu are malefics (the teaching is that a malefic's vedha harms and a benefic's helps; it gives no scale) |
| Weight of the point reached | janma nakṣatra 3, Moon sign 2, Lagna sign 2, tithi 1, weekday 1, name syllable 1; a line that only crosses the square counts as one that ends on it |
| Score of a stretch | the sum of the weights, + for a benefic, − for a malefic; and −3 when the graha's lattā falls on the birth nakṣatra |
| Window of days | each day is taken at its middle: its net score is the sum of the stretches then running; days of the same sign (good > 0, difficult < 0) run together into a window, a day at 0 ends it |
| The Moon | left out of the windows (it crosses a square in a day or so) unless "with the Moon" is pressed; the list "by graha" shows its stretches with the hour |
| Retrograde | not weighed |

The range is 3 months, 12 months or 3 years from the target date. The numbers are choices made here and the page says so.

## Not built

The weight of the strength of the graha (Ṣaḍbala) and of its dignity; the vedha of the Moon in the waning half as a malefic; the retrograde reversal some teachers give; the periods on the natal chakra (the dasha lords' vedha); the Lattā of the Moon's own 22nd in the muhūrta finder.
