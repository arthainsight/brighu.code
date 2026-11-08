# Ashtakoota: where the tables come from

The matching of LIBRARY → Compatibility (`src/lib/ashtakoota.ts`). Kala shows the Ashta Kutas, Rajju, Vedha, Strii Diirgha, Mahendra and Vasya between the Moons, the Lagnas and
every other planet (vedic-astrology.net/kala/Compatibility-Module.asp); it gives no tables.

## What was read

*Muhūrta Cintāmaṇi* (Rāma Daivajña, 1600), Vivāha Prakaraṇa (prakaraṇa 6) verses 21–34, in two places on archive.org:

* the Nirṇaya Sāgara edition with the *Pīyūṣadhārā* of Govinda Daivajña (1603), `in.ernet.dli.2015.553968` (Sanskrit; the OCR is poor, so the page was also read as an image,
  printed pages 249–251);
* the Hindi commentary of Mahīdhara Śarmā, `muhurta-chintamani-of-daivagya-ramacharya-mahidhar-sharma`.

The checks are in `ashtakootaMuhurtaChintamani.test.ts`: the lists are typed in from those pages, not from the code. The program PyJHora is only compared with
(`pyjhoraMatching.test.ts`, 11,664 pairs); it is not a source.

## Rule by rule

| Kūṭa | Points | Muhūrta Cintāmaṇi | The app |
|---|---|---|---|
| (all) | 1 2 3 4 5 6 7 8 | 6.21 "varṇo vaśyaṃ tathā tārā yoniś ca grahamaitrakam / gaṇamaitraṃ bhakūṭaṃ ca nāḍī caite guṇādhikāḥ"; the points are in the *Daivajñamanohara* quoted by the Pīyūṣadhārā | Same: 36 |
| Varṇa | 1 | 6.22: Pisces, Scorpio, Cancer Brahmin; Aries, Leo, Sagittarius Kṣatriya; Taurus, Virgo, Capricorn Vaiśya; Gemini, Libra, Aquarius Śūdra. The bride's varṇa must not be above the groom's; the same is best | **Same** |
| Vaśya | 2 | 6.23: all signs are vaśya to the human signs (Gemini, Virgo, Libra) but Leo, the water signs are their food, all are under Leo but Scorpio, "the rest by the practice of the world"; two points when the bride's sign is vaśya to the groom's, nothing the other way | **Not reproduced**: the verse leaves most signs to practice, and gives 2 or 0, not the five classes and the 0.5, 1, 1.5 of the two tables the app has (saravali.de and astroyogi.com, both shown). The Sagittarius and Capricorn halves are also not in the verse. Common practice, not the text |
| Tārā | 3 | 6.24: count from the bride's star to the groom's and the groom's to the bride's, divide by nine; the remainders 3, 5, 7 are bad. Three points when neither way is bad, half of that when one is, nothing when both (*Daivajñamanohara*) | **Same.** Kaśyapa, quoted in the commentary, leaves out the Janma (1) too ("janma-tri-pañca-sapta"); the verse and its commentary do not: not applied |
| Yoni | 4 | 6.25–26: the 14 animals of the 27 stars (the app's list is that of the verse, test by test); the sworn enemies horse–buffalo, elephant–lion, sheep–monkey, serpent–mongoose, dog–deer, cat–rat, cow–tiger (Vasiṣṭha); five degrees (mahāvaira, vaira, svabhāva, mitra, the same yoni) with the points 0 to 4 | **Same** for the animals, the enemies (0) and the same yoni (4). The verse names the degrees but gives no 14 × 14 table: the middle values come from common practice (the table PyJHora has) |
| Graha Maitrī | 5 | 6.27–28: the friendships of the seven grahas (the Sun's friends Moon, Mars, Jupiter, enemies Venus, Saturn; …); the same lord or friends both ways 5, a friend and a neutral 4, two neutrals 3, a friend and an enemy 1, a neutral and an enemy ½, enemies both ways 0 (*Daivajñamanohara*) | **Same**: the 7 × 7 table is derived in the test from the friendships of the verses and this rule, for all 144 pairs of signs. (The Hindi commentary of Mahīdhara Śarmā gives 2 and 1 for the friend–enemy and neutral–enemy: another reading, not applied) |
| Gaṇa | 6 | 6.29: Rākṣasa Magha, Ashlesha, Dhanishta, Jyeshtha, Mula, Shatabhisha, Krittika, Chitra, Vishakha; Manuṣya the three Pūrva, the three Uttara, Rohini, Bharani, Ardra; Deva Anuradha, Punarvasu, Mrigashira, Shravana, Revati, Swati, Ashwini, Pushya, Hasta. Points (*Daivajñamanohara*, read in the scan): the same gaṇa 6; Deva with Manuṣya 5, 4 (or 3) where the woman is the Deva and the man the human; Deva or Manuṣya with Rākṣasa nothing; but a Rākṣasa man with a Deva woman 2 and with a human woman 1 | **The lists are the same. The points are now those of the text** (default); the table PyJHora has (6 6 0 / 5 6 0 / 1 0 6 as [girl][boy]) is a choice (`common`) and differs in four cells (a human man with a Deva woman 6 against 4, a Rākṣasa man with a Deva woman 0 against 2 and with a human woman 0 against 1, a Deva man with a Rākṣasa woman 1 against 0). Before v4.27 the app had the common table |
| Bhakoot | 7 | 6.31: death at the sixth and eighth, loss of children at the fifth and ninth, poverty at the second and twelfth; the other places happiness | **Same.** The exceptions of 6.32–33 (the same lord, friendly lords, Nāḍī and Tārā good …) are not applied |
| Nāḍī | 8 | 6.34: Ādi Ashwini, Ardra, Punarvasu, Uttara Phalguni, Hasta, Jyeshtha, Mula, Shatabhisha, Purva Bhadrapada; Madhya Bharani, Mrigashira, Pushya, Purva Phalguni, Chitra, Anuradha, Purva Ashadha, Dhanishta, Uttara Bhadrapada; Antya Krittika, Rohini, Ashlesha, Magha, Swati, Vishakha, Uttara Ashadha, Shravana, Revati; the same Nāḍī is "asat" (the middle one is deadly for both). Some say the Ādi harms the groom, the Antya the bride | **Same** for the stars and the points. The exceptions (by region, the same star in another quarter …) are not applied |

## The Southern matchings: Mahendra, Vedha, Rajju, Strī-dīrgha

**A correction.** Before v4.28 this page said that these four are not in Muhūrta Cintāmaṇi, because a search of the OCR found nothing. The search was wrong (the OCR spells the words out of recognition): the
*Pīyūṣadhārā* on 6.21 quotes Nārada's ten kūṭas (dina, gaṇa, mahendra, strī-dīrgha, yoni, rāśi, rāśyadhipa, rajju, vaśya, vedha) and Garga's eighteen, and says that the author takes the eight that are well known.
They are therefore named in the commentary, but **no rule for them is given there**.

The rules are those of the *Kālaprakāśikā* (the English of N. P. Subramania Iyer, 1982, archive.org `kalaprakasika`, chapter XIII "To determine the suitability of a match", the ten considerations); the text
is an English translation, not the Sanskrit, and `ashtakootaKalaprakasika.test.ts` is typed in from it.

| Matching | The text | The app |
|---|---|---|
| Mahendra | the groom's star the 4th, 7th, 10th, 13th, 16th, 19th, 22nd or 25th from the bride's | **Same** |
| Strī-dīrgha | the groom's star beyond the 13th from the bride's; "some writers hold that it is enough if it be beyond the 7th" | **Same**; the strict reading decides, and a pair that passes only by the lenient one is marked |
| Rajju | five divisions (Pādha: Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati; Ūru: Bharani, Pushya, Purva Phalguni, Anuradha, Purva Ashadha, Uttara Bhadrapada; Nābhi: Krittika, Punarvasu, Uttara Phalguni, Vishakha, Uttara Ashadha, Purva Bhadrapada; Kaṇṭha: Rohini, Ardra, Hasta, Swati, Shravana, Shatabhisha; Śiras: Mrigashira, Chitra, Dhanishta); the same division fails: the foot "travel in foreign countries", the thigh loss of property, the navel loss of offspring, the neck the death of the woman, the head the death of the man | **Same**, and the view says which division and what it does |
| Vedha | the pairs Ashwini–Jyeshtha, Bharani–Anuradha, Krittika–Vishakha, Rohini–Swati, Ardra–Shravana, Punarvasu–Uttara Ashadha, Pushya–Purva Ashadha, Ashlesha–Mula, Magha–Revati, Purva Phalguni–Uttara Bhadrapada, Uttara Phalguni–Purva Bhadrapada, Hasta–Shatabhisha, and the set Mrigashira, Chitra, Dhanishta | **Corrected**: the app had fourteen pairs; the set of three makes three pairs, so there are fifteen, and Chitra–Dhanishta was missing |

The text adds an exception for Rajju, Vedha, Gaṇa and Rasi: the harm "need not be considered if (1) the lords of the Janma-Rasis are the same, (2) they be friendly planets and (3) their Janma-Rasis be diametrically
opposite". The app applies the first and the third and shows them; the second is not applied, because the text has a table of friendships of its own for it (Mars's friends Mercury and Venus, Venus's all but the Sun and the Moon,
…) that differs from the one of BPHS.

Of the ten the text says "the horoscopes must agree in respect of at least five"; the app does not count them, because the other six (dina, rāśi, rāśyadhipa, vaśya, gaṇa and yoni of the Southern reading) are not the same as the
Ashtakoota's and were not implemented.

## The cancellations of the doshas (Muhūrta Cintāmaṇi 6.32–6.37)

The doshas are marked as before and the points are not changed; the view now also says when the text cancels a dosha.

| Dosha | Cancelled when | Verse |
|---|---|---|
| Nāḍī | the Moons are in one sign and in two stars; or in one star and two signs; or in one star and two quarters ("rāśy-aikye ced bhinnam ṛkṣaṃ dvayoḥ syān nakṣatr-aikye rāśiyugmaṃ tathaiva / nāḍīdoṣo no gaṇānāṃ ca doṣo nakṣatr-aikye pādabhede tu śastaḥ") | 6.37 |
| Gaṇa | the same three; or the lords of the two signs are friends ("gaṇānāṃ na doṣaḥ" where the lords of the signs and of the navamsas are friends) | 6.37, 6.33 |
| Bhakoot (6/8, 5/9, 2/12) | one lord for both signs (ekādhipatya), or lords who are friends; the 6/8 also by a good Tārā; **only when the Nāḍī is good** ("nāḍyṛkṣaśuddhir yadi", "nāḍī sabhī meṃ honī cāhiye") | 6.32–33 |

Not applied: the exceptions by region (the Nāḍī dosha is not for those south of the Godāvarī, nor for Kṣatriyas), the strong lords of the navamsas as friends, and rāśi-vaśyatā (the Vaśya is not
reproducible from the text, see above). Friendly lords are lords who are friends both ways by the friendships of 6.27–28; the same lord is counted apart.

## Where PyJHora differs and the app does not follow it

* **Tārā**: PyJHora gives 1.5 for the remainders 3, 5, 7, the reverse of 6.24. For every pair the app's Tārā is 3 minus PyJHora's.
* **Vedha**: PyJHora fails every pair whose star numbers add up to 19, 28 or 37, which holds the fifteen pairs of the text and many more; the app has the fifteen.
* **Bhakoot**: one cell of its table (a girl in Aquarius, a boy in Cancer, a 6/8 relation) says 7: 81 pairs.
* **Varṇa**: it puts the earth signs among the Śūdra and the air signs among the Vaiśya; 6.22 has them the other way round.
* **Gaṇa**: the points, see above.

## What is not done

* The Southern ten-fold counting (at least five of ten) and its other six kūṭas; the four extras are shown as passed or not, not added.
* The overlays, the aspects between the charts, the composite and Davidson charts and the Ashtakavarga points of the pair that Kala shows; the Varga-kūṭa and the Bhāga-cakra of 6.35–36.
* The verdict bands (under 18 not advised, 18–24 acceptable, 25–32 good, 33 and over excellent) are common reading, not a verse.

## Kuja dosha

Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house from the Lagna or from the Moon (the popular rule; BPHS does not state it so). Both charts have it, they cancel; only one has it, a mismatch.
The houses from Venus are shown but not used. Not read in Muhūrta Cintāmaṇi.
