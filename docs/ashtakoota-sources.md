# Ashtakoota: where the tables come from

The matching of LIBRARY → Compatibility (`src/lib/ashtakoota.ts`). Kala shows the Ashta Kutas, Rajju, Vedha, Strii Diirgha, Mahendra and Vasya between the
Moons, the Lagnas and every other planet (vedic-astrology.net/kala/Compatibility-Module.asp); it gives no tables. The app does the same matchings between the same
points (the Moon is the default) with the tables below.

## What this record cannot promise

No single classical verse gives all eight kūṭas and their points. The classical source for the matching is the Vivāha Prakaraṇa of the *Muhūrta Cintāmaṇi*, which was
**not read for this version**; the numbers of points (36) and the tables are those of common North Indian practice as published and as programs keep them. They
were cross-checked against PyJHora over all 11,664 pairs of Moon star and quarter (`pyjhoraMatching.test.ts`, fixture from `scripts/pyjhora_matching.py`), and PyJHora
is itself a program, not a source. Where the common practice has more than one table the app says so and shows both (the Vaśya) or follows one and names it.

## Rule by rule

| Kūṭa | Points | The app | Against PyJHora |
|---|---|---|---|
| Varṇa | 1 | The sign's varṇa: water signs Brahmin, fire Kṣatriya, earth Vaiśya, air Śūdra; 1 point when the boy's varṇa is not lower than the girl's | **Differs**: PyJHora puts the earth signs among the Śūdra and the air signs among the Vaiśya. The common table (and the app) has them the other way round. They agree on water and fire |
| Vaśya | 2 | Five classes of the Moon's sign (quadruped, human, water, wild, insect); Sagittarius and Capricorn change at 15° **of the Moon's longitude**. Two published tables, saravali.de (default) and astroyogi.com, both shown | PyJHora has the same classes but tells the halves of Sagittarius and Capricorn from the star's quarter (a rough rule it marks as a TODO); compared only for the other signs |
| Tārā | 3 | The count of the boy's star from the girl's and of hers from his; each count divided by 9, the remainders 3, 5, 7 (Vipat, Pratyak, Vadha) are bad; 1.5 for each way that is not bad | **Differs, PyJHora is the reverse**: it gives 1.5 for exactly those remainders and nothing for the others (so a pair in the same star gets 0 and the Sampat count 2 gets 0). For every pair the app's Tārā is 3 minus PyJHora's |
| Yoni | 4 | 14 animals for the 27 stars, the 14 × 14 table with 4 for the same animal and 0 for the sworn enemies | Agrees on every pair |
| Graha Maitri | 5 | The lords of the two Moon signs, the 7 × 7 table (0 to 5) | Agrees on every pair |
| Gaṇa | 6 | Deva, Manuṣya, Rākṣasa by star; table [girl][boy] 6 6 0 / 5 6 0 / 1 0 6 (the orientation PyJHora has since 3.1.1; the published tables differ in which of the two is 5 and which 6) | Agrees on every pair |
| Bhakoot | 7 | 0 when the signs stand 2/12, 5/9 or 6/8 from each other, otherwise 7; symmetric | **Differs in one cell**: PyJHora's table says 7 for a girl in Aquarius and a boy in Cancer, which is 6/8 (its own cell the other way round says 0): 81 pairs |
| Nāḍī | 8 | Ādi, Madhya, Antya by star (1 2 3 3 2 1 …); 0 when the same, otherwise 8 | Agrees on every pair |
| Mahendra | pass/fail | The boy's star the 4th, 7th, 10th … 25th from the girl's | Agrees |
| Vedha | pass/fail | The fourteen pairs of the tradition (Ashwini–Jyeshtha, Bharani–Anuradha, Krittika–Vishakha, Rohini–Swati, Mrigashira–Chitra, Mrigashira–Dhanishta, Ardra–Shravana, Punarvasu–Uttara Ashadha, Pushya–Purva Ashadha, Ashlesha–Mula, Magha–Revati, Purva Phalguni–Uttara Bhadrapada, Uttara Phalguni–Purva Bhadrapada, Hasta–Shatabhisha) | **Differs**: PyJHora fails every pair whose star numbers add up to 19, 28 or 37, which holds the fourteen and thirty more. Every pair of the tradition fails in both |
| Rajju | pass/fail | Five parts of the body (foot, waist, stomach, neck, head) by star; the same part fails | Agrees |
| Strī-dīrgha | pass/fail | The boy's star more than 13 from the girl's | Agrees |

## What is not done

* The cancellations of the doshas (Nāḍī, Bhakoot, Gaṇa) that the texts give when the Moon signs share a lord, the stars are the same and so on: they differ from text to
  text, so the app marks the doshas and says that it does not cancel them.
* The Southern ten-fold (Daśa-kūṭa/Poruttam) scoring and its minimum conditions; the four extras are shown as pass or fail, not added.
* The overlays, the aspects between the charts, the composite and Davidson charts and the Ashtakavarga points of the pair that Kala shows.
* The verdict bands (under 18 not advised, 18–24 acceptable, 25–32 good, 33 and over excellent) are the common reading, not a verse.

## Kuja dosha

Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house from the Lagna or from the Moon (the popular rule; BPHS does not state it so). The balance is read in the common way: both
charts have it, they cancel; only one has it, a mismatch. The houses from Venus are shown but not used.
