# Vela of birth (ANALYSIS → Vela, v4.52)

The Sattva, Rajas or Tamas Vela of birth after Jātakapārijāta 9.123–125 (V. Subrahmanya Sastri's numbering; 124–126 in the Kāśī editions). **What the sources settle and what they leave open is in `docs/jataka-parijata-vela-sources.md`** (the verses in Devanāgarī and IAST, Sastri's and the Sudhāśālinī's notes, Mishra 2018, and the parallel rules of the BPHS and the Phaladīpikā). The page does not present the result as the text's own: it says what is unconfirmed, and gives the two possible lengths of the half-yāma side by side.

Code: `src/lib/vela.ts`, `src/components/VelaPanel.tsx`; tests `src/lib/vela.test.ts`, `e2e/vela.spec.ts`.

## What the text and its commentary settle

* 9.125: *tamaḥ sattva-rajo-velās tamaḥ sattvaṃ rajas tamaḥ / bhavanty arka-dinādīnām ardha-yāmair anukramāt*. The Velas are by half-yāmas (*ardha-yāma*, glossed *ardha-prahara-pramita*) of the weekdays from Sunday on.
* **16 half-yāmas to a weekday** ("8 praharas = 16"), and the Velas run Tamas, Sattva, Rajas, Tamas … in **one unbroken cycle**, the first half-yāma of Sunday being **Tamas**; so the first Velas of Sunday to Saturday are Tamas, Sattva, Rajas, Tamas, Sattva, Rajas, Tamas (the seven words of the verse) and each weekday ends with the Vela it begins with (Sastri's note; the Sudhāśālinī). The Vela of the half-yāma k (1–16) of the weekday d (Sunday 0) is the cycle at (16·d + k − 1) mod 3. The 7 × 16 table is derived from this rule (the printed table is OCR-broken in the editions read); its first and last columns agree with Sastri's list.
* 9.123 Sattva Vela, 9.124 Rajas and Tamas Vela: the results, in the page with the Sanskrit and a reading.

## What it does not settle (and the page says so)

| Point | What the sources say | What the program does |
|---|---|---|
| Length of a half-yāma | the Sanskrit gives no length; Sastri's note (and the Gujarati tables): an hour and a half, 3¾ ghaṭī, fixed; Mishra (2018): an eighth of the day and an eighth of the night, in proportion, as Parāśara's eighths | **both are calculated and shown side by side**; where they give the same Vela the page says so |
| Where the count starts | "from Sunday on"; the parallel rules (BPHS 3.66–67, Phaladīpikā 25.2) start the day's eighths at sunrise and the night's at sunset | the day from sunrise to sunrise; the proportional count has 8 parts to sunset and 8 from sunset; the fixed count 16 of an hour and a half from sunrise (the last made to end with the day). Marked unconfirmed |
| Change of the weekday | not stated for the Vela; the Kālahorā of the same chapter implies sunrise | sunrise to sunrise (a birth before sunrise is in the weekday before). Marked unconfirmed |
| Placing the birth | "the Vela at the time of birth"; no algorithm, no worked example | a part includes its start and not its end (a birth exactly at the end of a part is in the next). Marked unconfirmed |

## What is not mixed in

The Vela is not the Vara (the weekday), the Hora (the planetary hour), the Kāla (the time of day, the panchang) or the Tithi or a Nitya Yoga; it uses the weekday only to start the cycle.

## Inputs

The birth moment of the chart (the clock of the place in the time zone chosen for the birth, so the zone and the summer time of the day are already in it; the app does not look the zone up again here), the weekday of that date, and the sunrise, sunset, next sunrise and the previous sunrise and sunset that the chart carries for the same clock (the ephemeris sunrise of the place). No sunrise and sunset (polar days and nights, or a chart saved before the times were kept): the page says so and gives no Vela.

## The earlier assumption

The earlier assumption of a half-yāma of 90 minutes that starts at sunrise is **not** taken as the answer: the fixed 90-minute count is one of the two given, counted from sunrise through the 24 hours to the next sunrise, and the other is the eighths of the day and of the night.

## Not built

A choice between the two lengths as the one the page leads with; a start at sunset or midnight; the weekday changing at midnight; the Vela of the Moon's or the Lagna's moment; the table of the printed edition (not seen).
