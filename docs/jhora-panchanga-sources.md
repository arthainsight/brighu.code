# Jagannatha Hora (JHora) chart-header panchanga: what each field is, and how it compares with the app

Read on 26 Nov 2026. Question: the user's JHora natal chart for 1 Nov 1963, 11:55:00, UTC+2, Kotka (about 60°28′N, 26°55′E in JHora, see 6 and 5) against the app. "Sanskrit decides": the classical verses are quoted from the OCR files already in the scratchpad; JHora is closed-source Windows software, so for JHora itself the only primary material found is (a) the author's own release notes and feature list on vedicastrologer.org, (b) one message of the author (P. V. R. Narasimha Rao) quoted on a blog, and (c) JHora printouts posted by users. From (c) I reverse-engineered the rules and tested them by script; that is evidence, not documentation, and each point says which it is. No code of the app was changed. Downloads and scripts are in the session scratchpad (`.../scratchpad/jhmanual`, `.../scratchpad/scripts`, `.../scratchpad/pyjhora*`).

## 0. What was found and what was not

| Source | Where | What it gives | Limits |
| --- | --- | --- | --- |
| JHora feature list (author) | https://www.vedicastrologer.org/jh/features.htm (saved `jhmanual/…` via curl) | Names the three sunrise definitions, the true/illusive measures of time for hora and kaala, the 5-minute sign of hora | One line each, no formulas |
| JHora release notes 7.1, 7.2, 7.3, 7.32, 7.4, 8.0 (author) | https://www.vedicastrologer.org/jh/update_7.1.htm, `update_7.2.htm`, `update_7.3.htm`, `update_7.32.htm`, `update_7.4.htm`, `update_8.0.htm` | Ayanamsa variants and default changes; Swiss Ephemeris versions | No statement about the Lahiri definition in 8.0 |
| Message of the author on JHora vs Swiss Ephemeris, 2005 | https://jyotish-blog.blogspot.com/2005/12/ayanamsha-in-jhora-702-vs-swiss.html | "I use Swiss Ephemeris only for tropical planetary positions … my own module to compute the ayanamsa" | 2005 (version 7.02) |
| JHora printouts posted by users (18 charts, listed in 11) | blogs and forums, URLs in 11 | Used to reverse-engineer Hora Lord, Mahakala Hora, 5-min sign, Janma Ghatis, Kaala Lord | Third-party; versions differ (7.0x to 8.0) |
| PyJHora 5.0.6 (sdist from PyPI, `pyjhora_sdist/…/src/jhora`; master `drik.py`, `const.py` from raw.githubusercontent.com in `pyjhora/`) | PyPI https://pypi.org/project/PyJHora/ , GitHub naturalstupid/PyJHora | Python port; sunrise flags, ayanamsa call, hora-bala hora, Rahu/Yama/Gulika offsets | It does **not** implement JHora's header fields: no "Hora Lord", "Mahakala Hora", "Kaala Lord", "5 min sign", "Janma Ghatis" (grep for mahakala, janma ghati, hora lord, 5 min: nothing) |
| Swiss Ephemeris manual | https://www.astro.com/swisseph/swisseph.htm (§2.8.5, appendix E), https://www.astro.com/swisseph/swephprg.htm (§11.2) | Definition of SE Lahiri, mean/true ayanamsa | |
| Swiss Ephemeris itself | `swisseph-wasm` in the app's `node_modules`, run from `scripts/*.mjs` | Numbers for the ayanamsa and sidereal time checks | The same engine the app uses |
| Jātakapārijāta ch. 9 (Sanskrit with Sudhāśālinī, Sastri's translation), Muhūrtacintāmaṇi 1.54–55 with Pīyūṣadhārā and Hindi | scratchpad `xbla/t.txt`, `xwfu/t.txt`, `sast/vol1.txt`, `mc/t.txt`, `mcH/t.txt` (identifiers in `jataka-parijata-vela-sources.md` and `muhurta-sources.md`) | The classical Kālahorā | OCR |

**Not found:** the JHora help file (jhora.chm) is not online as text; `jh_update.zip` on vedicastrologer.org is only an installer exe (not opened). No text of JHora's own definition of "Kaala Lord". Check in JHora: Help menu and Preferences → Related to calculations (menus named in the release notes).

## 1. Hora Lord and its "5 min sign"

**What it is (read from 17 printouts, tested by script: certain for the lord, high for the sign table).** Equal one-hour horas, counted continuously from the true sunrise of the Vedic weekday, the first hora belonging to the weekday lord, the lords following in the Chaldean order Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon (descending speed). Hora number = whole hours since sunrise + 1. It is 24 horas from sunrise to the next sunrise; sunset does not restart the series (the night horas continue the day series). A birth before sunrise belongs to the previous Vedic weekday and its sunrise.

Test: 17 of 17 charts give the printed Hora Lord (script `scripts/verify2.py`, data `scripts/data2.py`). For the user's chart: weekday Friday (first hora Venus); 4:12:49 after sunrise 07:42:11, so the 5th hora: Venus, Mercury, Moon, Saturn, **Jupiter** ✓.

The author's own feature list says only: "In addition to hora, the sign corresponding to the 5-minute division of hora is also given (useful in prasna)" (features.htm, Panchanga/Basic Calculations list).

**The "5 min sign" (high certainty as a table, inferred from printouts).** The hora (60 min) is cut in twelve 5-minute parts; the sign printed is the (k+1)-th sign, k = whole 5-minute parts elapsed within the current hora (0 to 11), counted from a **starting sign that depends on the hora lord and on whether the birth is by day or by night** (day = sunrise to sunset, night = otherwise):

| Lord | Start sign by day | Start sign by night |
| --- | --- | --- |
| Sun, Moon | Leo | Cancer |
| Mars | Scorpio | Aries |
| Mercury | Virgo (not tested) | Gemini |
| Jupiter | Pisces | Sagittarius |
| Venus | Libra | Taurus |
| Saturn | Aquarius | Capricorn |

(Each lord's pair is the lord's two own signs, the second of the pair by day and the first by night, except Sun and Moon, whose pair is Leo by day and Cancer by night.) Tested on the 17 charts, 34 sign values (hora and Mahakala): 33 agree. The one miss (Siddipet 1954, Jupiter: printed Sagittarius, rule gives Scorpio) lies 1.8 s from the 45.00-minute boundary. Untested cells: Mercury by day, Saturn by night (extrapolated from the pattern). Day for the Mahakala sign is the 6–18 h LMT half (see 2).
User's chart: 12.8 min into the Jupiter hora, k = 2, Pisces + 2 = **Taurus** ✓ (printed Ta).
Why these start signs is not known (no text found); to check in JHora: view the Panchanga window or Prasna options for the hora and its 5-minute division.

**PyJHora:** none of this. Its `shubha_hora` (drik.py line 2614) cuts the day and the night each into 12 unequal horas ("hora is 1/12th of daytime or nighttime practiced as time measure in South India") using `const.shubha_hora_day_table`; its `_hora_bala` (strength.py line 599–608) uses equal hours from sunrise: `hora = (int(tobh-srise)+day+1)%7` with `const.hora_bala_hora_order = [6,4,2,0,5,3,1]` (const.py 1422). The second is the equal-hour hora of JHora's header; the first is not. Whether the end times of "24 horas in the day" in JHora's Panchanga window (features.htm) are equal or unequal is not stated anywhere I found.

## 2. Mahakala Hora

**What it is (certain for the lord; the basis is "6 am LMT").** The same equal one-hour hora series, but counted from **6:00 local mean time (LMT) of the birth place**, not from sunrise: the Vedic day for this purpose runs 6:00 LMT to 6:00 LMT (the weekday changes at 6 LMT), 12 hours "day" (6–18 LMT) and 12 "night". LMT = UT + longitude/15 h.
Evidence: 17 of 17 charts reproduce the printed Mahakala Hora with LMT (a standard-time start would be wrong for Brussels 2003: printed Jupiter; clock-standard 6 am would give Mars) and a pre-6 LMT birth (Muscat 1978, 05:47 LMT, printed Jupiter) counts from the previous day's 6:00. Author's feature list (features.htm): "For finding horas and weekdays, day can be taken to start at sunrise or at 6 am LMT" and "hora and kaala are shown using the true measure of time (chosen from sunrise or 6 am LMT) and the illusive measure of time (chosen from 6 am LMT and the standard time)". So "Hora Lord" is the true measure (sunrise), "Mahakala" the illusive measure (6 am LMT is what the printouts show). The word "Mahakala" itself is explained only in non-primary posts (a forum message of Sanjay Rath's student: "MahaKaal does not follow the sun, but uses local time (6AM) for the start. The day and night durations have 12 hours each", https://www.indiadivine.org/content/topic/1510281-hora-kala-yama-and-the-division-of-time-in-a-day/ ; Mystic Board: https://www.mysticboard.org/viewtopic.php?t=68033 was not readable (503)).

**Not the unequal 12-by-day, 12-by-night hora of the classics**: the 12-hour halves are fixed (6–18, 18–6), not sunrise–sunset. Its length is always 60 min.
User's chart: LMT = 09:55:00 UT + 1:47:40 (26°55′E) = 11:42:40; 5 h 42 m 40 s after 6:00 gives the 6th hora of Friday: Venus, Mercury, Moon, Saturn, Jupiter, **Mars** ✓; 42.7 min in, k = 8, Scorpio + 8 = **Cancer** ✓ (printed Cn).

## 3. Kaala Lord and "(Mahakala: Rahu)"

**What it is (day births: strong inference; night births: not solved).** A division of the day into **eight equal parts** (not seven, not the three-hour sunrise units), each ruled by one of the eight lords Sun, Mars, Jupiter, Mercury, Venus, Saturn, Moon, **Rahu**. For a day birth the parts run from sunrise to sunset, the first part belongs to the weekday lord, and the lords follow in the cyclic order

**Sun → Mars → Jupiter → Mercury → Venus → Saturn → Moon → Rahu → (Sun)**.

This is the order a user asked about in a 2004 forum thread as "the Kalachakra sequence … Moon, Rahu, Sun, Mars, Jupiter, Mercury, Venus and Saturn" (https://www.indiadivine.org/content/topic/1510281-hora-kala-yama-and-the-division-of-time-in-a-day/, the question of Frank in San Diego; the answer of Sanjay P. there: "The Kaalas (1.5 hrs and Yamas of 1/8 of day portion) are 8 follow the Kaalchakra or Ashtadala Padma"). I did not take it from that post: the cycle came out of the data and then agreed with it.

Independent proof of the order: with this cycle the part ruled by Rahu falls, for each weekday, exactly at the traditional **Rahu Kāla** (Sun 8th part, Mon 2nd, Tue 7th, Wed 5th, Thu 6th, Fri 4th, Sat 3rd; the same offsets are in PyJHora `drik.trikalam`, `'raahu kaalam': [0.875, 0.125, 0.75, 0.5, 0.625, 0.375, 0.25]`, drik.py line 2658). So "Kaala Lord: Rahu" means: the birth is in the Rahu Kāla of the day.
Test on the printouts: 9 of 11 day births agree with the printed Kaala Lord (Sunrise parts). The two misses (Delhi 1962, Brussels 2003, both older posts, JHora 7.x) are not explained. Night births (6 charts): the cycle runs backwards (Sun, Rahu, Moon, Saturn, Venus, Mercury, Jupiter, Mars) in every night sample, with the starting lord Jupiter (Sunday, Thursday) or Sun (Monday, Wednesday); no rule for the start was found. The Jātakapārijāta/Parāśara rule "the night is counted from the fifth lord" gives Jupiter for Sunday and Sun for Wednesday but not for Monday or Thursday, so it is not confirmed. Treat night births as unknown.

**The bracket "(Mahakala: …)"** is the same eight-fold scheme on the Mahakala basis (day 6–18 h, night 18–6 h, parts of 1.5 h from 6:00): in the user's chart both are Rahu. The sample fits it only partly (5 of 9 day births with LMT; the failures are three DST-date charts, which fit if the clock time rather than LMT is used, and Philadelphia 2024), so I cannot say whether the Kaala bracket uses LMT or the standard clock. For the user's chart it does not matter (LMT part 3.81, clock part 3.94: both the 4th part, 10:30–12:00).

**User's chart (day birth, Friday).** Day 07:42:11–16:08:52 = 8:26:41, one eighth = 1:03:20.1. Friday: Venus 07:42:11, Saturn 08:45:31, Moon 09:48:51, **Rahu 10:52:11–11:55:31**, Sun from 11:55:31. The birth 11:55:00 is **31 s before the end of the Rahu part**; with the app's own sunrise/sunset (07:34:15–16:16:30) the same part ends 11:57:23. So Rahu holds in either, but one minute later in birth time would give Sun. On the 6 am basis: Friday 10:30–12:00 LMT, the birth at 11:42:40 LMT inside.

**Relation to the classics.** The Kāla of Jātakapārijāta 2.5–6 and Parāśara (BPHS ch. 3, vv. 66–69: "divasān aṣṭadhā bhaktvā vāreśād gaṇayet kramāt / aṣṭamo 'ṃśo nirīśaḥ …; rātrim apy aṣṭadhā kṛtvā vāreśāt pañcamāditaḥ") is an upagraha: the eight parts follow the weekday order from the weekday lord, the eighth has no lord, the Sun's part is Kāla, Mars's Mṛtyu, Mercury's Ardhaprahara, Jupiter's Yamaghaṇṭaka, Saturn's Gulika (read in `jataka-parijata-vela-sources.md` section 3, `bphs/t.txt` 2880–2900). JHora's Kaala Lord is **not** that: its order is not the weekday order and Rahu is given the part. JP ch. 9 contains no Kāla lord, only the Kālahorā (9). The Muhūrtacintāmaṇi's "Kālavelā" (1.37–39) is a muhūrta fault with sixteenths of the day, also a different thing.

## 4. Janma Ghatis

**Certain.** Janma Ghatis = (birth time − the **last true sunrise** before the birth) in hours ÷ 0.4 (one ghaṭī = 24 min of clock time). It is plain elapsed time; the day and night are not rescaled to 30 + 30 ghaṭī (the maximum is therefore not 60 at the next sunrise unless the day is exactly 24 h). 18 of 18 printouts agree within the 4-decimal rounding (script `scripts/kaala.py`); the example with a birth before sunrise (Boston, 27 Nov 1997 01:47, printout gives sunrise "6:50:14 am (November 26)") uses the previous day's sunrise: (1:47 + 24 − 6:50:14) = 18:56:46 = 47.3651 ghaṭī, printed 47.3651.
User's chart: 11:55:00 − 07:42:11 = 4:12:49 = 15169 s = 10.5340 ghaṭī, printed 10.5341 ✓. JHora's "true sunrise" is JHora's own (see 6); with the app's sunrise it would be (11:55:00 − 07:34:15)/24 min = 10.9 ghaṭī.
PyJHora's `vedic_time` (drik.py 4932–5000) is another thing: it scales to 60 ghaṭī per sunrise-to-sunrise or per half; it is not JHora's Janma Ghatis.

## 5. Sidereal Time

**Local sidereal time at the birth place and moment, of date (high; mean or apparent cannot be told apart).** Computed from the printouts: LST = GMST(UT) + longitude. User's chart at the JHora longitude of 26°55′E (inferred from 6): apparent 14:22:32.5, mean 14:22:33.6; printed 14:22:32. At the app's 26.95°E it would be 14:22:40.5 (apparent) or 14:22:41.6, so the 8 s are the longitude. Other charts (apparent / mean / printed): Delhi 1998 12:15:11.8 / 12:15:12.3 / 12:15:12; Boston 1997 6:27:05.9 / 6:27:06.3 / 6:27:06; Ludhiana 2007 3:51:41.0 / 3:51:40.7 / 3:51:41; Philadelphia 2024 0:46:26.3 / 0:46:26.4 / 0:46:26. The nutation term is ≤ 1.1 s here, below what the printouts resolve. (Scripts `scripts/st.mjs`; GMST by Swiss Ephemeris `sidtime` and by the IAU formula.)

## 6. Sunrise and sunset

**JHora's value is the true rise of the Sun's centre: altitude 0°, no refraction. Explained to 4–11 s (certain on the numbers; the label of the default is inferred).**
The author's feature list: "Three different definitions of sunrise (and correspondingly sunset) supported - (1) true rise of center, (2) true rise of tip, (3) apparent rise of tip." The default is not stated there. The numbers decide:

| Kotka 1 Nov 1963 (EET, +2) | Sunrise | Sunset |
| --- | --- | --- |
| JHora printout | 07:42:11 | 16:08:52 |
| my Sun model, centre, no refraction (alt 0°), 60°28′N 26°55′E | 07:42:07 | 16:08:52 |
| same at 26.95°E | 07:42:00 | 16:08:43 |
| upper limb with refraction (−0.833°), 26.95°E | 07:34:15 | 16:16:27 |
| app | 07:34:15 | 16:16:30 |
| upper limb, no refraction (−0.2667°) | 07:39:30 | 16:11:12 |
| centre with refraction (−0.5667°) | 07:36:43 | 16:13:59 |

The −0.833° line reproduces the app exactly (so the model is as good as the app's own), and the centre/no-refraction line reproduces JHora's day length 8:26:41 to the second. The 15.5-minute difference is the horizon definition: 0.833° of altitude takes about 7.8 min at the horizon at this latitude (60.5°N) and declination (−14.4°) at each end. The residual 4 s (sunrise) and 0 s (sunset) is within the uncertainty of the JHora place's coordinates (1′ of longitude is 4 s); the JHora longitude that fits sunrise, sunset and sidereal time together is 26°55′E ±1′ (the app uses 26.95° = 26°57′). Script `scripts/sun.py`, `scripts/srchk.py`.

On the other 15 printouts that could be computed (the 1776 chart was left out of this check), the centre/no-refraction model reproduces sunrise and sunset to within ±4 s on 8 (Modi 2014, Siddipet 2025 and 1954, Philadelphia 2024, Kolkata 2006, Rajampet 1961, Naresh 1948, Washington 2005); on the other 7 (Delhi 1998, Boston 1997, Ludhiana 2007, Delhi 1962, Muscat 1978, Washington 2006, Brussels 2003) the JHora day is about 7 min longer than the centre model (sunrise 2–4 min earlier, sunset 2–4.5 min later) and about 0.5–4 min shorter than upper limb with refraction (script `srchk.py`). So an older default or setting (versions 5–7.02 and an old-version post of 2008) lay between the two definitions; the user's chart is in the group that follows the centre rule.

**PyJHora:** `drik.sunrise` docstring "Sunrise when centre of disc is at horizon for given date and place" (drik.py 452–454); defaults `const.RISE_SET_USE_REFRACTION = False`, `RISE_SET_USE_DISC_CENTER_FOR_RISING = True`, `RISE_SET_HINDU_RISING = True` (const.py 1830–1832) passed to `swe.rise_trans` with `BIT_HINDU_RISING | BIT_NO_REFRACTION | BIT_DISC_CENTER` (utils.py 1926–1975). Same definition. Also `PLANET_POSITIONS_TRUE = True` (const.py 1820), and the author's 2005 message says JHora "default is true positions" (not apparent).
In JHora: Preferences → Related to calculations → sunrise option (the name of the menu item is from release note 7.4: "Set Calculation Options as recommended by author … (ayanamsa, sunrise, chara karaka definition etc)"). The app's 07:34 is the usual almanac definition (upper limb with refraction); which one the app should use for comparison with JHora (the traditional Hindu rule "ignores refraction" is said by drikpanchang, seen in a search snippet only, not opened) is the caller's decision.

## 7. Ayanamsa "Lahiri"

**The 55″ is not an arithmetic error of either side; it is a different definition. Established by comparison, the mechanism is inferred.**

Numbers (Swiss Ephemeris through the app's `swisseph-wasm`, 1 Nov 1963 09:55 UT, JD 2438334.9132):
- `get_ayanamsa_ut` (what the app calls): 23°21′06.90″; the Swiss Ephemeris manual §11.2 says "swe_get_ayanamsa() and swe_get_ayanamsa_ut() provide the ayanamsha without nutation"; with nutation (`get_ayanamsa_ex_ut`, flags 2): 23°20′48.48″ (nutation −18.4″).
- JHora: 23°20′11.80″: **−55.1″ from the mean (app) value, −36.7″ from the true value.**

How JHora computes it (read): the author, 2005, JHora 7.02: "I use Swiss Ephemeris only for tropical planetary positions and do not use their sidereal calculations. I use my own module to compute the ayanamsa. … The original Lahiri ayanamsa was linear … However, linear ayanamsa is not correct … So I use the non-linear model … they and I may have converted the linear ayanamsa into a non-linear one in a slightly different way." and "I am not sure if Lahiri ayanamsa is fully correct … may be off by 1-2 arc-MIN" (https://jyotish-blog.blogspot.com/2005/12/ayanamsha-in-jhora-702-vs-swiss.html). Release notes: 7.1 "a variation of Chitrapaksha ayanamsa (aka Lahiri ayanamsa) that uses the mean Sun-earth plane … Vishnunabhi plane"; 7.2 "The default ayanamsa is changed from 'Lahiri (Chitrapaksha)' in 7.02 to 'Modified Lahiri (Chitrapaksha, mean plane)' … Even the regular Lahiri ayanamsa implemented in 7.02 had a minor error and it is corrected in 7.2"; 7.32 "True Chitrapaksha … fixes Chitra star at 180 deg always" and "Jagannatha ayanamsa" (Chitra at 180° and the Vishnunabhi plane) (update_7.1/7.2/7.32.htm). The 8.0 notes do not mention a change of Lahiri.

What the printouts show (JHora value minus Swiss Ephemeris SE_SIDM_LAHIRI, `scripts/ay6.mjs`, `ay7.mjs`):

| JHora era of the printout | Charts | J − SE mean | J − SE true (with nutation) |
| --- | --- | --- | --- |
| 5–7.02 (1997–2008 posts) | Delhi 1998, Boston 1997, Brussels 2003, Washington 2006, Kolkata 2006, Rajampet 1961, Naresh 1948, Muscat 1978 | −15 to +1 | **−0.8 to +1.1** (all 8) |
| 7.2–7.66 (Delhi 1962 post 2008, Modi 2014) | 2 | **0.0, +0.2** | +12.4, −6.6 |
| 8.0 (Kotka 1963, Siddipet 1954 and 2025, Philadelphia 1776 and 2024) | 5 | **−55.1, −54.7, −57.7, −47.2, −57.7** | −36.7, −72.0, −59.0, −34.1, −54.8 |

So: JHora up to 7.02 followed SE's Lahiri with nutation (±1″); 7.2–7.66 followed SE's mean Lahiri to 0.2″ (the app's value exactly); the 8.0-era printouts, among them the user's, lie 47–58″ below it, on a smooth line without nutation wobble (−47.2″ at 1776, −55.1″ at 1963, −57.7″ at 2024, slope about −0.043″/year). A smooth, nutation-free curve is the "mean plane" behaviour of 7.2. The level matches the Swiss Ephemeris variant "Lahiri (1940)" (SE_SIDM_LAHIRI_1940, mode 43: "ayanamsha = 22°26′45.50″ J1900.0 … Lahiri had published a different Citra ayanamsha in his Bengali book Panchanga Darpan … the value of 'mean ayanamsha' is given as 22°26′45.50″ in 1900, whereas the official value for the same date is 22°27′38″", Swiss Ephemeris manual §2.8.5): JHora − SE Lahiri 1940 (mean) = −1.9″ (1963), −1.5″ (Siddipet 1954), +6.0″ (1776), −4.5″ (2024), −4.5″ (Siddipet 2025). SE True Citra (mode 27) fits worse (+19.9, −11.6, −2.6, −6.9, −17.5″), and True Pushya (mode 29, which PyJHora's README suggests for "comparing with JHora V8.0") is 1.1° off, so it is not what the user's JHora shows. At 1900-01-01 SE's standard Lahiri (mean) is 22°27′37.91″; the JHora curve extrapolated to 1900 gives about 22°26′45.5″.
**Conclusion (inferred): the user's JHora uses a Lahiri whose 1900 anchor is Lahiri's 1940 value (22°26′45.5″), about 52–58″ lower than the standard IAE/ICRC-based Lahiri (23°15′00.658″ at 21 Mar 1956 0h TDT, true) that Swiss Ephemeris and the app use.** The residual 2–6″ is a precession-model difference.
To check in JHora: Preferences → Related to calculations → Ayanamsa: which of "Lahiri (Chitrapaksha)", "Modified Lahiri (mean plane)", "True Chitrapaksha", "Jagannatha" is selected; and Help → About for the version. Cast a chart for 1 Jan 1900 12:00 UT: the ayanamsa shown will be 22-26-4x if it is the 1940 anchor, 22-27-38 if it is the standard one; or for 21 Mar 1956 0:00 ET: 23-15-00.7 (true) / 23-14-4x (mean) for the standard one.
**Effect for the app:** nothing wrong in the app's setting (`sweGetAyanamsa`, `get_ayanamsa_ut`, SE_SIDM_LAHIRI, mean) if the aim is the standard Lahiri; it equals JHora 7.2–7.66's default. A user who wants numerical agreement with JHora 8.0 needs "Custom Lahiri" (`applyAyanamsaOffset` in `src/lib/ayanamsas.ts`) with about −55″ at 1963 (−0.0153°), but the difference is time-dependent (−47″ in 1776, −58″ in 2024), so an offset is only valid near the birth date; or SE mode 43 (Lahiri 1940), which fits within 2–6″. The caller decides.

## 8. Lunar Yr-Mo "Shobhana"

**Same year as the app's Śobhakṛt (37); only the name differs (certain for the number; JHora's name list known only in part).**
All JHora printouts agree with n = (Śaka year + 12) mod 60, Prabhava = 1, Śaka year taken from the lunar year starting at Chaitra: Śaka 1885 (Chaitra 1963 to Chaitra 1964): 1897 mod 60 = **37**. Checks, printed name / computed number: "Shubha-krit" (July 1962, Śaka 1884) 36; "Shobhana" (the user's chart, Śaka 1885) 37; "Krodhi" (March 2025, Śaka 1946) 38; "Isvara" (Nov 1997) 11; "Bahu-dhanya" (June 1998) 12; "Subhanu" (2003, Śaka 1925) 17 (Svabhānu); "Parthiva" (2005) 19; "Vyaya" (2006, 2007) 20; "Sarva-dhari" (1948) 22; "Vijaya" (1954) 27; "Jaya" (2014) 28; "Durmukha" (July 1776, Śaka 1698) 30; "Sharvari" (1961) 34; "Kaala-yukta" (1978, Śaka 1900) 52; "Sukla" (Jan 1510, Śaka 1431) 3 (all fit). So JHora spells the 37th "Shobhana" and the 36th "Shubha-krit", where the app has Śobhakṛt (37); these are the two names of the same year (Śobhana / Śobhakṛt), not a different cycle or a one-year shift. The full list of JHora's 60 names was not found (the printouts give the 15 above). PyJHora's list (lang/list_values_en.txt line 22: …Shubhakrit, Shobhakrit, Krodhi…) is PyJHora's, not JHora's.
Note: the user's "Adhika Karthika" is a separate claim of JHora (an intercalary month in 1963); not checked here.

## 9. Jātakapārijāta ch. 9, Kālahorā

**Verse confirmed** (the same as the user's): numbered **126 in Sastri's English edition** (sast/vol1.txt, "Sloka 126", lines 35413–35420, OCR garbled in the verse, the translation legible) and **127 in the Kāśī editions** (xbla/t.txt 19595–19596; xwfu/t.txt 25807–25808, clean):

> मन्त्रिमङ्गलमार्तण्डशुक्रज्ञेन्दुशनैश्चराः ।
> आरभ्य वारतो होरा रात्रौ पञ्चमवारतः ॥

*mantri-maṅgala-mārtaṇḍa-śukra-jñendu-śanaiścarāḥ / ārabhya vārato horā rātrau pañcama-vārataḥ.* Rendering (mine): "Jupiter, Mars, the Sun, Venus, Mercury, the Moon, Saturn: the horas begin from the weekday (lord); at night from the fifth weekday (lord)." Sastri: "Jupiter, Mars, the Sun, Venus, Mercury, the Moon, Saturn – this is the order in which the lords of the Horas follow in succession. The Hora in any day of the week is reckoned beginning with that day's lord. The Hora on the night of the week-day chosen is reckoned from the 5th week-day therefrom." The order of the seven names is the Chaldean order (the one in 1).

**Sudhāśālinī (Kapileśvara Śāstrī) on 9.127–129**, xbla/t.txt 19601–19612 (also xwfu 25812–25830): "ekasminn ahorātre ṣaṣṭi-daṇḍātmake caturviṃśatiḥ kālahorā bhavanti. dine dvādaśa rātrau ca dvādaśa. prati-khaṇḍaṃ sārdha-ghaṭī-dvayam" ("In one day and night of sixty daṇḍas there are 24 kālahorās, 12 by day and 12 by night; each segment is two and a half ghaṭī"), quoting Vasiṣṭha: *vāra-pravṛtter gaditā dineśāt kālākhya-horā-patayaḥ krameṇa / sārdhena nāḍī-dvitayena taṣṭaḥ ṣaṣṭhaś ca ṣaṣṭhaś ca punaḥ punaḥ syāt* and Muhūrtacintāmaṇi 1.55: *vārāder ghaṭikā dvighnā svākṣa-hṛc-cheṣa-varjitāḥ / saikās taṣṭā nagaiḥ kāla-horeśā dina-pāt kramāt*; the example "on Thursday the first kālahorā is Jupiter's, the second the sixth from it, Mars's, the third the sixth from that, the Sun's … at night: on Sunday night the first is Jupiter's, the second Mars's; Monday night the first is Venus's, the second Mercury's".

**Which system: the equal hora of 2½ ghaṭī (60 min), 24 to a day and night, counted continuously (verified), not the unequal day/12.** The text's "12 by day, 12 by night" together with "2½ ghaṭī each" and "sixty daṇḍas" gives equal hours; the night series starting at the fifth lord is simply the 13th hora of the continuous Chaldean series (12 steps = 5 mod 7). The Pīyūṣadhārā on MC 1.55 (mc/t.txt 3322–3360) derives it: if 60 ghaṭī give 24 horas, then 1 ghaṭī gives 24/60, so the number of horas is the elapsed ghaṭī doubled and divided by 5. It does not discuss shorter or longer days.
**Where the count starts:** not at sunrise as such but at the *vāra-pravṛtti* of Muhūrtacintāmaṇi 1.54 (*pādona-rekhā-apara-pūrva-yojanaiḥ … dinapa-praveśanam*, mc/t.txt 3277–3295, Hindi mcH 1548–1570): the moment the weekday begins, computed from the place's distance (yojanas) from the Laṅkā–Ujjayinī–Kurukṣetra meridian and the half-day, "after or before sunrise" (Kāśī example: 2 ghaṭī 49 pala after sunrise). The Hindi on 1.55 adds, citing Vasiṣṭha: "here vāra-pravṛtti is only for the kālahorā; for [other] acts the weekday is reckoned from sunrise" (mcH 1606–1608). So the classical Kālahorā = JHora's **Hora Lord** in length and in order (certain); the starting instant differs: JHora uses the true sunrise (or 6 am LMT for "Mahakala"), the classical text a computed vāra-pravṛtti near sunrise (not read in detail; a difference of at most a few ghaṭī). It is also not "both" systems: there is no unequal hora in these verses. JHora's Mahakala Hora has the same order and length with the 6 am LMT start, a convention I did not find in the classical texts read.
**Kāla lord in ch. 9:** none. Ch. 9 ends with the Kālahorā result verses (9.128–129 Kāśī). The eight-part Kāla (upagraha) is in JP 2.5–6 (see 3), and JHora's Kaala Lord is not that.

## 10. Madhyāhna (11:03–12:48) and Janma Ghatis or Kaala

**No connection (certain as to definitions).** A fifth of the day from the user's own sunrise/sunset: 07:34:15 + 2/5 and 3/5 of 8:46:15 = 11:05 to 12:48 (from JHora's sunrise and sunset the third fifth is 11:04:51–12:46:12, almost the same). Janma Ghatis is elapsed time from sunrise in 24-minute units (10.53 ghaṭī, the birth at 4:12:49, 49.9% of the JHora day), and JHora's Kaala is an eighth of the day (the Rahu part 10:52:11–11:55:31); no JHora field uses fifths of the day. The birth does lie inside the Madhyāhna fifth, and the Rahu part overlaps it, but only by the time of day.

## 11. The 18 printouts used (all JHora, third-party posts)

Date, local time, zone (+ east), place, sunrise, sunset, weekday, Hora (sign), Mahakala (sign), Kaala (Mahakala), Janma Ghatis, ayanamsa.

| # | Chart | Printed values | URL |
| --- | --- | --- | --- |
| 1 | 1963-11-01 11:55:00, +2, Kotka (user) | 07:42:11, 16:08:52, Fri, Ju (Ta), Ma (Cn), Ra (Ra), 10.5341, 23-20-11.80, Sid. 14:22:32 | the user's |
| 2 | 1998-06-10 19:21:32, +5:30, 77E12 28N36 | 5:23:37, 19:17:57, Wed, Ve (Ar), Ve (Ta), Su (Ra), 34.9130, 23-49-59.49, 12:15:12 | https://jyotish-blog.blogspot.com/2007/07/panchanga-examples-by-pvr.html (PVR) |
| 3 | 1997-11-27 01:47:00, −5, 71W12 42N30 | 6:50:14 (Nov 26), 16:12:26, Wed, Ma (Pi), Ve (Ta), Me (Ve), 47.3651, 23-49-35.57, 6:27:06 | same (PVR) |
| 4 | 2007-01-24 20:04:00, +5:30, 75E53 30N54 | 7:23:56, 17:54:18, Wed, Su (Pi), Ve (Sg), Ra (Su), 31.6693, 23-51-56.77 (KP ayanamsa, a KP horary) | https://www.indiadivine.org/content/topic/1494153-horary-in-jagannatha-hora-702-sw-comparison-for-a-horary-chart/ |
| 5 | 2024-06-25 06:30:42, −5, 75W09′51″ 39N57′08″ | 4:38:35, 19:28:20, Tue, Su (Ge), Ma (Ta), Ju (Ju), 4.6718, 24-10-59.05 | https://shankerjyotishi.wixsite.com/jyotishi/post/burning-usa-2025 |
| 6 | 1776-07-04 18:30:00, −5, same | 4:41:58, 19:27:08, Thu, Sa (Sc), Mo (Sg), Ma (Ma), 34.5014, 20-43-25.21 | same |
| 7 | 1962-07-29 16:26:58, +5:30, 77E13 28N40 | 5:40:20, 19:14:23, Sun, Mo (Ta), Mo (Vi), Ra (Mo), 26.9430, 23-20-03.62 | https://jyotish-blog.blogspot.com/2008/06/ |
| 8 | 2025-03-13 21:46:26, +5:30, 78E51 18N06 | 6:27:55, 18:20:26, Thu, Ma (Cn), Ma (Li), Su (Su), 38.2712, 24-11-35.00 | https://shankerjyotishi.wixsite.com/jyotishi/post/tithi-pravesha-chakra-of-kcr |
| 9 | 1954-02-17 10:30:00, +5:30, same | 6:45:02, 18:12:43, Wed, Ju (Sg), Ma (Aq), Sa (Sa), 9.3737, 23-12-04.34 | same |
| 10 | 1978-05-16 05:53:00, +4, 58E35 23N36 | 5:24:24, 18:40:37, Tue, Ma (Ar), Ju (Vi), Ma (Ma), 1.1918, 23-33-18.76 | https://jyotish-blog.blogspot.com/2005/11/reading-marriage-date.html |
| 11 | 2005-04-08 16:32:36, −4, 77W02′12″ 38N53′42″ | 6:46:10, 19:34:20, Fri, Mo (Ta), Mo (Sg), Ju (Me), 24.4348 | http://sanjayprabhakaran.blogspot.com/2005/04/parthiva-chaitra-new-moon-new-year.html |
| 12 | 2014-05-26 18:11:00, +5:30, 77E13 28N40 | 5:29:28, 19:07:02, Mon, Ve (Ge), Su (Ta), Sa (Sa), 31.7305, 24-03-29.81 | http://vjgoel.blogspot.com/2014/05/ |
| 13 | 2006-09-18 23:10:14, +5:30, 88E22 22N34 | 5:27:34, 17:33:44, Mon, Ma (Sg), Ma (Li), Sa (Sa), 44.2775, 23-57-04.14 | https://www.indiadivine.org/content/topic/1494994-tajaka-chart-reading-help/ |
| 14 | 1961-03-05 23:27:59, +5:30, 79E10 14N12 | 6:31:22, 18:18:50, Sun, Me (Ta), Mo (Vi), Ra (Ra), 42.3588, 23-18-46.23 | https://www.indiadivine.org/content/topic/1276404-job-interview/ |
| 15 | 1948-04-25 17:54:00, +5:30, 72E54′56″ 20N56′20″ | 6:15:56, 18:57:00, Sun, Sa (Vi), Sa (Ta), Ra (Ra), 29.0861, 23-07-54.66 | https://www.indiadivine.org/content/topic/1258539-moon-in-3rd/?tab=comments |
| 16 | 2006-04-04 15:41:32, −4, 77W01′45″ 38N54′06″ | 6:50:34, 19:34:25, Tue, Su (Ge), Su (Aq), Mo (Ra), 22.1240, 23-56-38.49 | http://sanjayprabhakaran.blogspot.com/2006/04/ |
| 17 | 2003-05-21 18:01:53, +2, 4E20 50N50 | 5:50:10, 21:31:20, Wed, Su (Li), Ju (Ge), Ra (Ra), 30.4886, 23-54-00.44 | same |
| 18 | 1510-01-30 22:00:00, +5:44, 86E00 23N30 (Julian date; checked by hand) | 6:42:49, 17:45:56, Thu, Ma (Cn), Su (Cn), Su (Su), 38.2161, 17-01-15.73 | https://sanjayprabhakaran.blogspot.com/2008/06/sri-achyutaananda-some-reading.html |

Tests (scripts `scripts/verify2.py`, `kaala.py`, `kaala5.py`, `fit4.py`, `srchk.py`; data `scripts/data2.py`; all in the scratchpad): Hora Lord 17/17 (18/18 with #18), Mahakala Hora 17/17, Janma Ghatis 17/17, 5-min sign 33/34, Kaala Lord (sunrise basis) 9/11 on day births.

## 12. Summary table

| JHora term | What it is | Source | Certainty |
| --- | --- | --- | --- |
| Hora Lord | Equal 60-min horas from the true sunrise of the Vedic weekday, Chaldean order from the weekday lord, 24 per sunrise-to-sunrise, continuous across sunset | 17 printouts (11); not in PyJHora's header; matches Kālahorā of JP 9.127 / MC 1.55 in length and order | Certain (tested 17/17) |
| (5 min sign) | Sign of the 5-minute (12th of an hour) part within the current hora; start sign by lord and day/night: Sun, Moon Leo/Cancer; Mars Scorpio/Aries; Jupiter Pisces/Sagittarius; Venus Libra/Taurus; Saturn Aquarius/Capricorn; Mercury (Virgo)/Gemini | features.htm (existence); table from 34 values | High; the start-sign table is inferred, Mercury day and Saturn night untested; the reason is unknown |
| Mahakala Hora | The same hora series from 6:00 local mean time (weekday changes at 6 LMT), 12 h day 6–18, 12 h night | features.htm ("6 am LMT" option, "illusive measure"); 17 printouts | Certain for LMT (tested 17/17); the name's meaning only in non-primary posts |
| Kaala Lord | Lord of the eighth part (1/8 of sunrise-to-sunset) at a day birth; first part the weekday lord, order Sun, Mars, Jupiter, Mercury, Venus, Saturn, Moon, Rahu; Rahu's part is the Rahu Kāla | 11 day printouts, Rahu Kāla table, PyJHora trikalam offsets (drik.py 2658) | Day: strong inference (9/11, and the Rahu Kāla identity); night: not solved |
| (Mahakala: …) | The same on the 6–18 / 18–6 LMT (or clock) basis, parts of 1.5 h | 17 printouts | Partly (LMT or clock not settled); Rahu in the user's chart on both |
| Janma Ghatis | (birth − last true sunrise) in hours ÷ 0.4, not rescaled | 18 printouts | Certain |
| Sidereal Time | Local sidereal time of the place and moment (mean or apparent, indistinguishable, ≤1.1 s) | 5 printouts + Swiss Ephemeris | High |
| Sunrise, Sunset | True rise of the Sun's centre (alt 0°, no refraction); 15.5 min shorter day than upper limb with refraction | features.htm (three definitions), numbers: 9 of 16 printouts (the newer ones, incl. the user's), PyJHora const.py 1830–1832 | Certain on the numbers; the "default" label inferred |
| Ayanamsa (Lahiri) | 8.0-era JHora: its own non-linear mean Lahiri, 47–58″ below SE Lahiri (55.1″ in 1963), 2–6″ from SE Lahiri 1940; 7.2–7.66: equals SE mean Lahiri | Author's 2005 message, release notes 7.1/7.2/7.32, 11 printouts vs Swiss Ephemeris | Difference established; mechanism (Lahiri 1940 anchor) inferred |
| Lunar Yr-Mo "Shobhana" | Samvatsara 37 of the 60 (Śobhana/Śobhakṛt), n = (Śaka + 12) mod 60 | 15 printouts | Certain for the number; name list partial |
| JP 9.126 (Sastri) / 9.127 (Kāśī) | Kālahorā: equal 2½-ghaṭī horas, 24 per day, from the weekday lord, night from the fifth lord | Sudhāśālinī, Sastri, MC 1.54–55 Pīyūṣadhārā | Certain (text read) |
