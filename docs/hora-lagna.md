# Surya Hora Lagna (ANALYSIS → Surya Hora Lagna, v4.41)

The Hora Lagna from the Sun and from the Lagna, the direction of the count by the sign it starts in, and the avatāra of the birth hour. After a lesson on the Hora Lagna, the 24 avatāras of the Garuḍa Purāṇa and the two kinds of wealth; not a rule of BPHS, and the page says so.

Code: `src/lib/horaLagna.ts`, `src/components/SuryaHoraLagnaPanel.tsx`, tests `src/lib/horaLagna.test.ts` and `e2e/horalagna.spec.ts`.

## The count

The time from sunrise to birth (hours) is turned to an arc at 30° an hour, double the 15° of the Bhāva Lagna. It is moved from the starting point:

| | starts from | wealth | deity |
|---|---|---|---|
| Surya HL | the Sun | physical and material (cash, cars, property); ends with the life | Kubera |
| Lagna HL | the Lagna | intellectual capital (deep and occult knowledge, insight); outlives death | Ganesha and Shiva |

The direction is that of the starting sign: savya signs (Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius) add the arc, apasavya signs (Cancer, Leo, Virgo, Capricorn, Aquarius, Pisces) take it away. The result is reduced to the circle. For a Sun in a savya sign the Surya HL is the standard Parāśara Hora Lagna (the Sun + 12° a ghaṭī); the standard one is shown beside both, and the page says how far it lies from the Surya HL when the Sun is in an apasavya sign. The sunrise is the one the chart's special sphuṭas use (true, mean-time or by hand).

## The avatāra of the birth hour

The day is cut into twelve signs of two hours from 06:00, each with two avatāras of the Garuḍa Purāṇa:

| Sign | Hours | Pair |
|---|---|---|
| Aries | 06–08 | Chatushana, Varaha |
| Taurus | 08–10 | Narada, Nara-Narayana |
| Gemini | 10–12 | Kapila, Dattatreya |
| Cancer | 12–14 | Rishabha, Yagya |
| Leo | 14–16 | Prithu, Matsya |
| Virgo | 16–18 | Kachhapa, Dhanvantari |
| Libra | 18–20 | Mohini, Narasimha |
| Scorpio | 20–22 | Vamana, Parasurama |
| Sagittarius | 22–24 | Vyasa, Rama |
| Capricorn | 00–02 | Krishna, Balarama |
| Aquarius | 02–04 | Buddha, Kalki |
| Pisces | 04–06 | Yajna, Hayagriva |

## What was chosen here

* The first named of a pair has the first hour of the two. This fits the lesson: Krishna at midnight (Capricorn, 00:00), Hayagriva just before sunrise (Pisces), Mohini just after sunset (Libra), Dhanvantari before it (Virgo).
* The lesson gives Parasurama once as "09:00–10:00" and once under Scorpio (20:00–22:00) in the table; the table is followed (21:00–22:00).
* The day starts at 06:00 clock time, as in the lesson's table; the page also offers the true sunrise of the chart.
* The lists of different Purāṇas (the 22 of the Bhāgavata, the 24 of the Garuḍa, the Chobbīs of the Guru Granth Sahib) are not to be made to agree; only the Garuḍa list is used.
* The lesson's example charts (Bernard Arnault, Sanjay Rath, and others) are not tested: their birth data are not in the lesson, so the tests are of the rules, with worked arcs.

## Not built

The Dasāvatāra by yuga and the check of the D60 (the dispositor of Ketu aspecting the D60 Lagna); the Garuḍa Purāṇa's list beyond the names; the Mahāmantra order of the six-armed Chaitanya; the Nakṣatra mantra of the HL lord.
