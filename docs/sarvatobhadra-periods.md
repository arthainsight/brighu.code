# Sarvatobhadra: Lattā and good and difficult periods (v4.43)

Two additions to ANALYSIS → Sarvatobhadra.

Code: `src/lib/sarvatobhadraPeriods.ts`, `src/components/SarvatobhadraPeriods.tsx`, `src/components/SarvatobhadraPanel.tsx`; tests `src/lib/sarvatobhadraPeriods.test.ts` and `e2e/sarvatobhadra-periods.spec.ts`.

## Lattā

The kick of a graha, from the rules the app already has for the Phaladīpikā (26.42–47, `LATTA` in `phaladipikaGochara.ts`): counting the graha's own nakṣatra as 1, forward for the Sun (12), Mars (3), Jupiter (6) and Saturn (8); backward for Venus (5), Mercury (7), Rāhu (9) and the Moon (22). Ketu has none. The kicked nakṣatra is marked on the chakra (a dashed square with ↯ and the kicker's code) when Latta is pressed, for the natal grahas and, with Transit on, the transiting ones, and listed with the result the text gives when the kick falls on the birth nakṣatra and with the grahas that stand in the square kicked.

The Muhūrta Mārtaṇḍa (v. 16) counts some of the grahas otherwise (Mercury the 22nd, Venus the 24th, Rāhu the 20th, the Moon the 7th); Mahādosha's Lattā follows that text (`docs/muhurta-martanda-kalaprakasika.md`). The chakra follows the Phaladīpikā, as the transit table does.

## Special nakṣatras and the Lattā table

The page lists the special nakṣatras counted from the Moon's, as another program shows them on its Sarvatobhadra page (a screenshot the user sent; **not checked against a classic here**): Janma 1, Jāti 3, Karma 10, Abhiṣeka 15, Saṅghātika 16, Sāmudāyika 18, Naidhana 23. The Janma, the Karma and the Abhiṣeka are marked (red). The Lattā list is a table of graha, kick (12 ahead …), the star it stands in and the nakṣatra the kick falls on, with the special nakṣatra it is (`Revati ← Jāti`) and red when it is one of the three. Ketu has no lattā in the verses; the "Ketu 9 behind" button adds the Sarvatobhadra variant (as Rāhu's), marked *. The Phaladīpikā's own list of special nakṣatras (Janma, Vipat, Pratyari, Vadha, Karma, Ādhāna, Vainaśika) stays in the Gochara table.

## The whole nakṣatra or only the pada

A kick, an Upagraha and a Pāta can be taken as biting the **whole nakṣatra** (the way the app had it) or **only the pada** with the number of the pada the graha stands in (Muhūrtacintāmaṇi 6.62, *pātopagrahalattāsu neṣṭo 'ṅghriḥ kheṭapatsamaḥ*, with the Muhūrtadīpikā quoted in Mahīdhara's Hindi; see `docs/sarvatobhadra-latta-vedha-sources.md`). The choice is on both pages, off (the whole nakṣatra) to begin with:

* **Muhūrta Finder** → the Lattā, Upagraha and Pāta doṣas (Mahādosha): "Lattā, Upagraha and Pāta bite" — the whole nakṣatra, or only the pada of the graha. For the Lattā the graha is the kicker, for the Upagraha and the Pāta the Sun (the graha the count starts from); the Moon bites only when it stands in the pada of that number (`faultPart` in `DoshaOptions`, `FinderCriteria` and the `faultPart` parameter of `/api/muhurta-finder`).
* **Sarvatobhadra** → Lattā: "the whole nakshatra" or "only the pada of the kicker". In the Lattā table the pada of the kicker is shown after the nakṣatra and the kick is on the Janma only when the birth Moon stands in the pada with the number of the kicker's pada; in *Transits over natal planets* the lattā counts only when the natal graha stands in that pada; in the periods the stretches are cut at the pada and the lattā on the Janma counts only while the kicker is in the pada of the birth Moon's number. The Karma and the Abhiṣeka stay whole nakṣatras (no text gives their pada).

## Transits over natal planets

A table with a row for each of the nine natal grahas (`src/lib/sarvatobhadraTransits.ts`), from the transiting grahas of the target moment (it needs no switch): **Transit on it** (the same nakṣatra square), **Vedha** (a line of the transiting graha's square ends on the natal graha's nakṣatra), **Other aspects** (the transiting graha's own aspects by sign, the same sign being the conjunction and left out), **Lattā** (the nakṣatra the transiting graha kicks is the natal graha's; the Ketu button applies), and a **verdict**. The table follows one another program shows; its verdict is read from the examples in the screenshots, not from a classic: each hit counts by the nature of the graha that makes it (Moon, Mercury, Jupiter, Venus for; Sun, Mars, Saturn, Rāhu, Ketu against), the lattā too; supported when only benefics reach the graha, afflicted when only malefics, mixed when both, clear when none. (The periods below count a lattā on the Janma, Karma or Abhiṣeka as always difficult, which is a different question.)

## Good and difficult periods

The vedha of a transiting graha (the line across the chakra and the two diagonals from its nakṣatra's square) reaches the points of the birth the chakra is already read for: the Moon's nakṣatra, the Moon's sign, the Lagna's sign, the birth tithi and weekday, and the syllable of the name. While the graha stands in one square (and one nakṣatra of the 27), the points it reaches are the same, so the time is cut into **stretches** at the changes of nakṣatra (the edge is half way between two samples of the ephemeris: 12 hours for the Sun, Mars, Mercury and Venus, a day for Jupiter, Saturn and the nodes, 3 hours for the Moon).

| Choice | Value |
|---|---|
| Benefics | Moon, Mercury, Jupiter, Venus; the Sun, Mars, Saturn, Rāhu and Ketu are malefics (the teaching is that a malefic's vedha harms and a benefic's helps; it gives no scale) |
| Weight of the point reached | janma nakṣatra 3, Karma nakṣatra 2, Abhiṣeka nakṣatra 2, Moon sign 2, Lagna sign 2, tithi 1, weekday 1, name syllable 1; a line that only crosses the square counts as one that ends on it |
| Score of a stretch | the sum of the weights, + for a benefic, − for a malefic; and the lattā of the graha on the Janma (−3), the Karma (−2) or the Abhiṣeka (−2) nakṣatra |
| Window of days | each day is taken at its middle: its net score is the sum of the stretches then running; days of the same sign (good > 0, difficult < 0) run together into a window, a day at 0 ends it |
| The Moon | left out of the windows (it crosses a square in a day or so) unless "with the Moon" is pressed; the list "by graha" shows its stretches with the hour |
| Retrograde | not weighed |

The range is 3 months, 12 months or 3 years from the target date. The numbers are choices made here and the page says so.

## Not built

The weight of the strength of the graha (Ṣaḍbala) and of its dignity; the vedha of the Moon in the waning half as a malefic; the retrograde reversal some teachers give; the periods on the natal chakra (the dasha lords' vedha); the Lattā of the Moon's own 22nd in the muhūrta finder.
