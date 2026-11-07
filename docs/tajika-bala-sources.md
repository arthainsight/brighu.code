# Dvādaśavargīya Bala and Harṣa Bala: where the rules come from

Both are strengths of the Tājika annual chart (Varṣaphala panel) that the Pañcavargīya Bala leaves out. Kala lists all three
("many softwares only calculate the one panchavargiya bala and ommit the other two", vedic-astrology.net/kala/Varshaphala.asp) without
giving a rule, so the rules here are those of the source below, not of Kala. The code is `src/lib/tajikaBala.ts`.

## The source

Balabhadra, *Hāyanaratna* (Tājika, 16th–17th c.), English translation by Martin Gansten (2020), chapter 2 §8 (the twelve dignities) and
§9 (the joys), read at wisdomlib.org (`hayanaratna-the-jewel-of-annual-astrology`, doc1500900 and doc1500901). It quotes the older
Tājika books by name. The Sanskrit of the verses was not checked: the rules are those of the English translation.

The Tājika Nīlakaṇṭhī edition used for the other Varṣaphala rules (docs/tajika-nilakanthi-vs-app.md) has neither strength.

## Dvādaśavargīya Bala (§8)

The twelve dignities (Vāmana; Saṃjñātantra; Maṇittha's Varṣaphala 51–60): domicile, hora, decan, fourth-part, fifth-part, sixth-part,
seventh-part, eighth-part, ninth-part (navāṁśa), tenth-part, eleventh-part (rudrāṁśa), twelfth-part.

| Division | Ruler of the part | Verse of §8 | In the code |
|---|---|---|---|
| Domicile | the lord of the sign | 1 | `griha` |
| Hora | odd sign: Sun then Moon; even sign: Moon then Sun | 1 | `hora` |
| Decan | the lords of the signs 1st, 5th, 9th from the sign | 2 | `dreshkana` (same as the Parāśara D3) |
| Fourth-part | the lords of the angles from the sign | 3 | `padamsa` (Parāśara D4) |
| Fifth-part | odd signs Mars, Saturn, Jupiter, Mercury, Venus; even signs the reverse | 4 | `panchamsa` |
| Sixth-part | odd: from Aries; even: from Libra (72 parts running on) | 4 | `shashthamsa` |
| Seventh-part | odd: from the sign; even: from the 7th sign | 5 | `saptamsa` (Parāśara D7) |
| Eighth-part | movable from Aries, fixed from Sagittarius, dual from Leo | 5 | `ashtamsa` |
| Ninth-part | Aries, Capricorn, Libra, Cancer for the fire, earth, air, water signs | 5 | `navamsa` |
| Tenth-part | the parts run on from Aries: the signs begin at Aries, Aquarius, Sagittarius, Libra, Leo, Gemini … | 6 | `dashamsa` |
| Eleventh-part | the parts run on from Aries: Aries, Pisces, Aquarius, Capricorn … | 6 | `rudramsa` |
| Twelfth-part | from the sign itself | 6 | `dvadasamsa` (Parāśara D12) |

The part *k* of the zodiac in the sixth, eighth, tenth and eleventh divisions belongs to the sign *k* mod 12; this is the cyclic
Parivṛtti rule of the divisional charts (`varga/parivritti.ts`), and the test compares the two on a thousand longitudes
(`tajikaBala.test.ts`). The decan, fourth, seventh, ninth and twelfth are compared with the Parāśara divisions in the same way.

**Judging the parts.** "The twelve dignities of the sun and other planets are to be examined. [The divisions] arising from [the planet's]
domicile, [the sign of] a friend, a benefic, or its exaltation are good; those arising from [the sign of] fall, an enemy, or a malefic are evil.
Examining both [kinds of] results thus and subtracting the one from the other, the remainder should be understood to be that planet's resulting
[strength] from the twelve dignities."

The app reads this division by division. A division is **good** when its ruler is the graha itself, a natural friend of it or a natural
benefic, or when the division is the graha's sign of exaltation; it is **evil** when its ruler is a natural enemy or a natural malefic, or
the division is the graha's sign of fall. A division can be both (a friend who is a malefic, such as Mars for the Sun) and then counts on
both sides. The total is the number of good divisions less the number of evil ones, −12 to 12.

Choices of the app, not of the text:

* Which grahas are benefic: Jupiter, Venus and Mercury, and the Moon while she waxes (the Sun's elongation under 180° at the annual chart's
  moment). Mercury is not made to depend on its company.
* Natural friends and enemies are those of BPHS 3 (`dignity.ts`), as in the Pañcavargīya Bala.
* The text gives the points (Tājikayogasudhānidhi 4.10: "a hundred points in its own domicile and so on; half in that of a friend; half again in
  [that of] an enemy. That sum divided by sixty …") in a sentence that does not say how the twelve are weighed, so the divisions are counted and not weighed.
* The hora and the fifth-part give a ruler and no sign, so exaltation and fall are not looked for there.
* PyJHora's `dwadhasa_vargeeya_bala` counts the divisions D1–D12 in which the graha stands in its own, exalted or a friend's sign and does not subtract; it is another
  rule and its numbers do not equal these.

## Harṣa Bala (§9)

"The four places that give joy [to the planets] are described by Tejaḥsiṃha [Daivajñālaṅkṛti 7.1–2]: [House] nine, three, six, one, eleven, five or twelve
is the first [place] giving joy [to each of the planets counted] from the sun; [its] domicile and exaltation is considered the second; next, the third
place of joy is in the day for a male planet but at night for a female; and [the houses] by threes from the ascendant is the fourth for female and
male planets in order." Samarasiṃha (Tājikaśāstra) says the second place is the domicile only, not the exaltation. "In a place of joy, the points
endowed with joy are considered to be five" (Paddhatibhūṣaṇa 20), so a graha can have 20.

| Place | Rule | In the code |
|---|---|---|
| 1 | Sun 9th, Moon 3rd, Mars 6th, Mercury 1st, Jupiter 11th, Venus 5th, Saturn 12th (the seven numbers in the order of the grahas from the Sun; Tājikayogasudhānidhi 4.36) | `HARSHA_HOUSES` |
| 2 | own sign or exaltation sign (an option leaves the exaltation out, after Samarasiṃha) | `svagriha` |
| 3 | a male graha in a year that begins by day, a female one by night | `dinaRatri` |
| 4 | the female grahas in houses 1–3 and 7–9, the male in 4–6 and 10–12 | `trika` |

* Male: Sun, Mars, Jupiter. Female: Moon, Mercury, Venus, Saturn. The translation does not name the sexes in this passage; the choice is that of P.V.R. Narasimha Rao's
  worked example (Example 119 / Chart 66, in PyJHora's test-suite), which the test reproduces to the point: Moon 15, Mercury 10, Venus 10, Jupiter 5, Saturn 5, Sun 0, Mars 0.
* A day year is one that begins between sunrise and sunset at the annual chart's place, as in the rest of the Varṣaphala panel.
* Venus's house is the 5th, as the sequence of the Hāyanaratna reads it. **PyJHora has the 12th** (`const.harsha_bala_houses = [8,2,5,0,10,11,11]`), which looks like a slip; its
  published example does not test Venus's house.
* Yādava (Tājikayogasudhānidhi 4.36–37) has five places of four points each (the fifth: male signs for male grahas, female signs for female); and Praśnavaiṣṇava 2.30 gives
  more houses of joy for some grahas. Neither is in the app.
* The text adds that the strength of the day or night and of the first place are included again in the detailed strengths ("the strength of two places of joy should be added
  to the detailed strengths"). The app shows the Harṣa Bala as it is and does not add it to the Pañcavargīya Bala or to the choice of the lord of the year.
