# The panchanga record of a birth: the app's fields and Jagannatha Hora's (v4.53)

One birth, in two programs: **1 November 1963, 11:55:00, UTC+2, Kotka, Finland** (the app: 60.4664°N 26.9458°E; JHora's own times fit about 26.915°E). Every field below is of one system only. Nothing from one system is put into another's field, and where the two disagree both stay. The sources are `docs/jhora-panchanga-sources.md` (JHora: eighteen printed outputs, PyJHora, the author's 2005 note) and `docs/jataka-parijata-vela-sources.md` (Jātakapārijāta 9); **JHora's own help is not on the web as text, so JHora's rules here are those its outputs follow, not a quotation of its manual.**

## A. The app's panchanga (unchanged)

| Field | Value | System |
|---|---|---|
| Vara | Friday · Venus | the Vedic day from the app's sunrise |
| Tithi | Purnima / Amavasya (15) · Shukla | |
| Nakshatra | Ashwini · Pada 4 | Lahiri (Swiss Ephemeris, 23°21′07″) |
| Karana | Bava | |
| Yoga | Siddhi | |
| **Hora** | **Mars** | **unequal horas: the day in 12 and the night in 12 (sunrise 07:34:15, sunset 16:16:30)** |
| Sunrise / sunset / solar noon | 07:34:15 / 16:16:30 / 11:55:23 | **the upper limb with the usual refraction (Sun's centre at −0.833°)** |
| Ayanamsa | 23°21′07″ (Lahiri) | Swiss Ephemeris `SE_SIDM_LAHIRI` (mean) |
| Masa | Adhika Kartika (amānta) | |
| Samvatsara | Shobhakrit (37) · Śaka 1885 | the cycle of the Śaka year, (Śaka + 11) mod 60 + 1 |
| Ayana · Ritu · Paksha | Dakshinayana · Sharad · Shukla (waxing) | |
| **Kala** | **Madhyahna (11:03–12:48)** | **the app's own five-fold day (a fifth of sunrise to sunset)** |

## B. Jagannatha Hora's printed values

| Field | JHora prints |
|---|---|
| Lunar Yr-Mo | Shobhana – Adhika Karthika |
| Tithi | Pournimasya (Sa) (19.93% left) |
| Vedic Weekday | Friday (Ve) |
| Nakshatra | Aswini (Ke) (5.99% left) |
| Yoga | Siddhi (Ma) (44.04% left) |
| Karana | Bava (Su) (39.87% left) |
| **Hora Lord** | **Jupiter (5 min sign: Ta)** |
| **Mahakala Hora** | **Mars (5 min sign: Cn)** |
| **Kaala Lord** | **Rahu (Mahakala: Rahu)** |
| Sunrise / Sunset | 07:42:11 / 16:08:52 |
| Janma Ghatis | 10.5341 |
| Ayanamsa | 23°20′11.80″ (Lahiri) |
| Sidereal Time | 14:22:32 |

## C. The same fields worked out by the app, each by JHora's rule (ANALYSIS is not needed: CHART → panchang)

Shown by the Panchang view under "Jagannatha Hora's fields", from v4.53; the "% left" of the four limbs stands on their own rows ("Shukla Purnima (15) · 19.89 % left", "Ashwini · Pada 4 · 6.15 % left", "Siddhi · 44.39 % left", "Bava · 39.78 % left"). For the chart of the birth with the place JHora's times imply (60.4664°N, 26.9146°E), `jhoraChart.test.ts` checks: sunrise 07:42:1x and sunset 16:08:5x (within 6 s of JHora), Janma Ghatis 10.534, sidereal time 14:22:3x, Hora Lord Jupiter (Taurus), Mahakala Hora Mars (Cancer), Kaala Lord Rahu, tithi/karana % left within 0.1 of JHora, and the app's own Hora (Mars) and Kala (Madhyahna) untouched.

## D. What each term is, and how it differs from the others

| Term | What it is | Source of the rule | Certainty |
|---|---|---|---|
| **Hora** (the app's) | the horas of the Vedic day made from the **unequal** parts: sunrise to sunset in 12, sunset to the next sunrise in 12; lords Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars from the weekday lord. Mars here (the 6th: index 5.99 of 12) | Parāśara's eighths and the Phaladīpikā scale the day likewise; the app's own long-standing choice | the arithmetic is certain; that it is the classical Hora is **not** (see Kālahorā below) |
| **Hora Lord** (JHora) | the planet of the **equal hour (60 minutes)** counted from the true sunrise, the first hour the weekday lord's, the others Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars on; continuous through the sunset. Here 4 h 12 m 49 s after sunrise: the 5th hour, **Jupiter** (the same by the app's sunrise too) | 17 of 17 printed outputs fit; the "5 min sign" below is inferred | **certain** for the rule |
| **5 min sign** | the hora is cut in twelve parts of five minutes; the sign is a starting sign (by lord and by day or night: Sun and Moon Leo/Cancer, Mars Scorpio/Aries, Jupiter Pisces/Sagittarius, Venus Libra/Taurus, Saturn Aquarius/Capricorn, Mercury Virgo/Gemini) plus the parts passed. Here Pisces + 2 = **Taurus** | fits 33 of 34 outputs; Mercury by day and Saturn by night were not seen and are **inferred** (the page says so); the reason of the rule was not found | partly inferred |
| **Mahakala Hora** (JHora) | the same equal horas, but counted from **06:00 of local mean time** (the clock less the zone plus the longitude in time), the weekday changing at 06:00 LMT, the day half 06:00–18:00. Here LMT 11:42:40, the 6th hora, **Mars** (Scorpio + 8 five-minute parts = **Cancer**) | 17 of 17 outputs; it is JHora's "illusive measure" against the "true measure" of the Hora Lord | **certain** for the rule; the 06:00 LMT start is not found in a classic |
| **Kaala Lord** (JHora) | the day from sunrise to sunset in **eight equal parts**, the lords Sun, Mars, Jupiter, Mercury, Venus, Saturn, Moon, Rahu in a cycle, the first the weekday lord's; Rahu's part is the almanacs' Rahu Kāla on every weekday (Friday the 4th). Here 10:52:11–11:55:31: **Rahu**, the birth **31 seconds before its end** (a minute later the part is the Sun's) | fits 9 of 11 day births (two old JHora 7.x outputs unexplained); **the rule for the night is not known and is not given** | certain by day, unknown by night |
| **(Mahakala: Rahu)** | the same eight-fold division read on the 06:00–18:00 LMT day (parts of 1½ hours); whether LMT or the clock is meant is not settled. Rahu here either way | partial fit only | **unconfirmed** |
| **Kala** (the app's) | the app's own part of the day for the sankalpa: Sūryodaya, Prātaḥ, Saṅgava, Madhyāhna, Parāhna, Sāyankāla, Rātri, Pratyūsha (fifths of the day). **Not** JHora's Kaala and not a lord | docs/panchang-calendar.md | the app's own |
| **Janma Ghatis** | the ghaṭīs (24 minutes each) from the last sunrise to the birth; no scaling. 15169 s ÷ 1440 s = **10.5340** (JHora 10.5341); by the app's sunrise 10.8646 | 18 of 18 outputs | **certain** |
| **Sidereal Time** | the local sidereal time at the birth place and moment (mean and apparent differ by about 1 s). The app at 26.9458°E gives 14:22:39, JHora 14:22:32; at 26.915°E it is 14:22:32 | checked | **certain**; the 7 s is the longitude |

**Not to be mixed:** the app's Hora (unequal) and JHora's Hora Lord (equal) are two systems, both right by their own rule, and they give Mars and Jupiter. JHora's Mahakala Hora (Mars) happens to name the same planet as the app's Hora here; it is a third system, and the equality is a coincidence of this birth. The app's Kala is not the Kaala Lord, and none of the Hora or Kaala fields is the Vela (docs/vela.md), the Vara, the Tithi or a Nitya Yoga.

## E. The Kālahorā of Jātakapārijāta 9 (9.126 in Sastri, 9.127 in the Kāśī editions)

*mantrimaṅgalamārtaṇḍaśukrajñendusanaiścarāḥ / ārabhya vārato horā rātrau pañcamavārataḥ*: the horas start from the weekday lord in the order Jupiter, Mars, Sun, Venus, Mercury, Moon, Saturn, and the night's start from the fifth weekday's lord. The Sudhāśālinī (quoting Vasiṣṭha and Muhūrtacintāmaṇi 1.55): 24 kālahorās in a day and a night of sixty daṇḍas, 12 by day and 12 by night, **each of 2½ ghaṭī (an hour)**. So the text's Kālahorā is the **equal hour**: it is JHora's **Hora Lord** (Jupiter here), not the app's unequal Hora (Mars) and not the Mahakala Hora. The classical start is the weekday's beginning (*vāra-pravṛtti*), near sunrise; JHora counts from its sunrise (or from 06:00 LMT for the Mahakala), and the 06:00 LMT start was not found in a classic. JP 9 has **no Kāla lord**: JHora's Kaala Lord is not the Kāla upagraha of JP 2.5–6 either.

For an analysis after Jātakapārijāta 9, **the Kālahorā of the record is the Hora Lord (equal hours from sunrise): Jupiter.** The Vela (9.123–125) is its own field (docs/vela.md). The birth is 31 seconds from the end of the Kaala Lord's Rahu part and 30 seconds from the end of the app's Mars hora: a sunrise defined a little differently can move either.

## F. Why the two programs differ, and what is comparable

| Difference | Cause | Comparable? |
|---|---|---|
| Sunrise 07:34:15 / sunset 16:16:30 against 07:42:11 / 16:08:52 | **the definition**: the app counts the Sun's upper limb with the usual refraction (the centre at −0.833°), JHora the centre of the disc on the geometric horizon without refraction (altitude 0°). At 60.5°N in November the Sun climbs slowly and 0.833° is about 7.7 minutes at each end. The app's own engine gives 07:42:00 / 16:08:46 for altitude 0°; the 6–11 s left is JHora's longitude (26.915°E) | **not** the same quantity; the app now also shows the centre-of-disc times under JHora's fields |
| Janma Ghatis 10.8646 (app sunrise) against 10.5341 | the sunrise | follow the sunrise |
| Sidereal time 14:22:39 against 14:22:32 | longitude 26.9458° against about 26.915° (7.5 s) | comparable once the place is the same |
| Ayanamsa 23°21′07″ against 23°20′11.80″ | **a different Lahiri**: the app uses Swiss Ephemeris `SE_SIDM_LAHIRI` (23°21′06.90″ mean); JHora 8.0's value is 55.1″ lower on a smooth curve (−47″ in 1776, −55″ in 1963, −58″ in 2024), about the level of Swiss Ephemeris's "Lahiri 1940" variant; older JHora versions (7.2–7.66) equal the app's. The author wrote in 2005 that he computes the ayanāṁśa with his own module. **Neither is an error** | no: they are two definitions. It explains most of the difference in the nakṣatra and the yoga "% left" (6.15 → 6.03 against JHora 5.99; 44.39 → 44.16 against 44.04), none of the tithi and karaṇa, which do not depend on it |
| Tithi 19.89% and karaṇa 39.78% left against 19.93 and 39.87 | not the ayanāṁśa; the 0.005° of the Moon–Sun distance left is about 35–40 seconds of time (the size of ΔT in 1963); not resolved | comparable to 0.1 |
| Samvatsara Shobhakrit against "Shobhana" | the same year, 37; JHora spells the 60 names its own way (n = (Śaka + 12) mod 60 with JHora's list: 36 Shubha-krit, 37 Shobhana, 38 Krodhi) | the same field |
| Masa Adhika Kartika against Adhika Karthika | the same | the same field |

How to check in JHora: **Preferences → Related to calculations → Ayanamsa** (the variant chosen; Help → About for the version) and, for the Lahiri definition, the ayanāṁśa at 1 January 1900 12:00 UT (22-27-38 is the standard Lahiri, 22-26-4x the 1940 anchor); for the sunrise definition the sunrise and sunset options in the same preferences; for the place, the coordinates JHora shows for Kotka.

## G. Not settled (and said so)

* How JHora's Kaala Lord works by night, and whether the Mahakala bracket is LMT or the clock.
* The starting signs of the "5 min sign" for Mercury by day and Saturn by night, and the reason of the rule.
* The author's definition of the Lahiri of JHora 8.0; the 35-second residue in the tithi and the karaṇa.
* The whole JHora list of the 60 year names.
* JHora's manual text for Hora, Mahakala and Kaala (not available as text).
