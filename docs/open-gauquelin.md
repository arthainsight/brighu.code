# Open Gauquelin Database in the LIBRARY (v4.46)

LIBRARY → Open Gauquelin reads the user's own copy of the **Open Gauquelin Database** (opengauquelin.org, by Thierry Graff) and uses its occupations as groups. **None of the data is in this program or its repository**: the user downloads `ogdb-time.csv.zip` (or `ogdb-all.csv.zip`) from the site and chooses it in the page; it is read in the browser (`src/lib/ogdb.ts`) and kept in the browser's IndexedDB (`src/lib/ogdbStore.ts`, database `bcp-gauquelin`), because 20 000 people do not fit the 5 MB of localStorage. Nothing is sent to a server.

Code: `src/lib/ogdb.ts`, `src/lib/ogdbStore.ts`, `src/components/GauquelinPanel.tsx`; tests `src/lib/ogdb.test.ts` and `e2e/gauquelin.spec.ts`.

## Licence

The site says its content and software are released under GPL, FDL and CC-BY-SA-4; it does not say which applies to the data, and the data come from the Gauquelins' LERRCP booklets, Arno Müller's lists, Suitbert Ertel's list and CURA v5 (archived), each with rights of its own. The licence of the data was **not confirmed**; hence the data are not shipped. The page names the source and the licences the site states.

## What is read (the "timed data" CSV, semicolon-separated)

OGID, OCCU, GQID, MUID, FNAME, GNAME, DATE (local), TZO, DATE-UT, PLACE, C1–C3, CY, LG, LAT, GEOID. Checked on the file of 24 539 rows (August 2023): **21 482** people are read.

| Rule | Why |
|---|---|
| The zone is the local `DATE` minus `DATE-UT`; with `DATE` and `TZO` but no UT, the `TZO`; with only `DATE-UT`, the UT moment with zone 0 | the file gives the clock, not a zone name; the old French rows run on Paris mean time (+0:09:21) |
| 3 049 rows have a clock and no zone and 7 no date: left out and counted on the page | a time zone cannot be guessed honestly |
| A row without coordinates takes those of the same place and country that has them (marked ≈) | 1 614 rows have none; 1 is left with no place |
| **The longitude of many French rows is turned round** (Nice −7.26, Paris −2.34): a row without a GEOID is checked against the same place in a row that has one and turned back when it is that longitude with the sign turned; with no such place, a French row of the books (no GEOID, no MUID) is turned (marked ≈; all 250 of the 250 such rows that could be checked were turned, and 70 of 87 of the `D6` ones) | found by comparing the file with itself; **555 people have such a guess** |
| The occupations are split at `+` (a "novelist+poet" is in both groups): 98 groups, the largest Military personnel, Physician, Actor, Politician, Painter | OCCU |

Birth times in France are rounded to the hour until the 1920s (the site says so); the OCR of the booklets was corrected by hand but the site has an issues page of questionable data.

## What the page does

Choose the file (the zip or the CSV), see how many were read and how many were left out and why, choose an occupation group, search by name or place, **Open** a person in the CHART workspace (the zone goes in as the time-zone override), **Save** one person or **Save these to my charts** (a group of up to 500, put under the client "OGDB <occupation>" so that Research can take them as a group), or remove the loaded data.

## Not built

The group comparison of natal features (the Mars effect and the like) on thousands of people: the chart of each would have to be calculated, which the page does not do; the `ogdb-all` file's people without a birth time as charts; the history files of the site; estimating a zone for the 3 049 rows without one.
