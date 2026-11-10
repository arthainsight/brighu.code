# The names of the good vargas (Vaiśeṣikāṁśa): BPHS 6.42–53 against the app

Read on 10 November 2026 in three texts of the Bṛhat Parāśara Horā Śāstra, chapter 6 (the sixteen vargas), verses 42–53:

* **S**: sanskritdocuments.org (`par0110`, ITRANS and Devanagari, typed by Ahto Jarve, updated 22 December 2023);
* **E**: enjoylearningsanskrit.com (`scriptures/parashara/book-1/chapter-6`, Devanagari with IAST and an English that is a help, not the source);
* **J**: the printed edition with the Hindi commentary *Sudhā* of Devacandra Jhā (Chaukhamba, Kashi Sanskrit Series 220; archive.org
  `bmmv_brihat-parashar-hora-shastra-of-parashar-muni-with-sudha-commentary-by-pt.-dev-c`, read in its OCR, pages 55–57).

S and E are one digitization at two stages (`shadbala-sources.md`); J is a second witness, and its verse numbers are the same. The code is
`src/lib/vaisheshikamsa.ts`, the view `src/components/VaisheshikamsaPanel.tsx` (ANALYSIS → Bala → Vaiśeṣikāṁśa), the test
`src/lib/vaisheshikamsa.test.ts`.

## 1. The verses

| Verse | Sanskrit | What it says |
|---|---|---|
| 6.42 | वर्गभेदानहं वक्ष्ये मैत्रेय त्वं विधारय । षड्वर्गाः सप्तवर्गाश्च दिग्वर्गा नृपवर्गकाः ॥ | The kinds of vargas: six, seven, ten (*dig*, the directions), sixteen (*nṛpa*, the kings). |
| 6.43 | भवन्ति वर्गसंयोगे षड्वर्गे किंशुकादयः । द्वाभ्यां किंशुकनामा च त्रिभिर्व्यञ्जनमुच्यते ॥ | In the Ṣaḍvarga, when vargas come together: 2 Kiṁśuka, 3 Vyañjana. |
| 6.44 | चतुर्भिश्चामराख्यं च छत्रं पञ्चभिरेव च । षड्भिः कुण्डलयोगः स्यान्मुकुटाख्यं च सप्तभिः ॥ | 4 Cāmara, 5 Chatra, 6 Kuṇḍala, 7 Mukuṭa … |
| 6.45 | सप्तवर्गेऽथ दिग्वर्गे पारिजातादिसंज्ञकाः । पारिजातं भवेद्द्वाभ्यामुत्तमं त्रिभिरुच्यते ॥ | … in the Saptavarga. In the Daśavarga: 2 Pārijāta, 3 Uttama. |
| 6.46 | चतुर्भिर्गोपुराख्यं स्याच्छरैः सिंहासनं तथा । पारावतं भवेत् षड्भिर्देवलोकं च सप्तभिः ॥ | 4 Gopura, 5 (*śara*, the arrows) Siṁhāsana, 6 Pārāvata, 7 Devaloka. |
| 6.47 | वसुभिर्ब्रह्मलोकाख्यं नवभिः शक्रवाहनम् । दिग्भिः श्रीधामयोगः स्यादथ षोडशवर्गके ॥ | 8 (the Vasus) Brahmaloka, 9 Śakravāhana, 10 (the directions) Śrīdhāma. Then in the Ṣoḍaśavarga: |
| 6.48 | भेदकं च भवेद्द्वाभ्यां त्रिभिः स्यात् कुसुमाख्यकम् । चतुर्भिर्नागपुष्पं स्यात् पञ्चभिः कन्दुकाह्वयम् ॥ | 2 Bhedaka, 3 Kusuma, 4 Nāgapuṣpa, 5 Kanduka. |
| 6.49 | केरलाख्यं भवेत् षड्भिः सप्तभिः कल्पवृक्षकम् । अष्टभिश्चन्दनवनं नवभिः पूर्णचन्द्रकम् ॥ | 6 Kerala, 7 Kalpavṛkṣa, 8 Candanavana, 9 Pūrṇacandra. |
| 6.50 | दिग्भिरुच्चैःश्रवा नाम रुद्रैर्धन्वन्तरिर्भवेत् । सूर्यकान्तं भवेद् सूर्यैर्विश्वैः स्याद्विद्रुमाख्यकम् ॥ | 10 Uccaiḥśravā, 11 (the Rudras) Dhanvantari, 12 (the Suns) Sūryakānta, 13 (the Viśvedevas) Vidruma. |
| 6.51 | शक्रसिंहासनं शक्रैर्गोलोकं तिथिभिर्भवेत् । भूपैः श्रीवल्लभाख्यं स्याद्वर्गा भेदैरुदाहृताः ॥ | 14 (the Indras) Śakrasiṁhāsana, 15 (the tithis) Goloka, 16 (the kings) Śrīvallabha. |
| 6.52 | स्वोच्चमूलत्रिकोणस्वभवनाधिपतेः शुभाः । स्वारूढात् केन्द्रनाथानां वर्गा ग्राह्याः सुधीमता ॥ | Which vargas are good: see 3. |
| 6.53 | अस्तङ्गता ग्रहजिता नीचगा दुर्बलाश्च ये । शयनादिगतास्तेभ्य उत्पन्ना योगनाशकाः ॥ | What destroys the yoga: see 4. |

The numbers above ten are word-numerals (*bhūtasaṅkhyā*): Rudra 11, Sūrya 12, Viśva 13, Śakra 14, tithi 15, bhūpa 16.

## 2. The tables

**Ṣaḍvarga** (rāśi, horā, dreṣkāṇa, navāṁśa, dvādaśāṁśa, triṁśāṁśa) and **Saptavarga** (with the saptāṁśa)

| Good vargas | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|
| संस्कृतम् | किंशुक | व्यञ्जन | चामर | छत्र | कुण्डल | मुकुट |
| IAST | Kiṁśuka | Vyañjana | Cāmara | Chatra | Kuṇḍala | Mukuṭa (Saptavarga only) |

**Daśavarga** (with the daśāṁśa, the ṣoḍaśāṁśa and the ṣaṣṭyaṁśa)

| Good vargas | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| संस्कृतम् | पारिजात | उत्तम | गोपुर | सिंहासन | पारावत | देवलोक | ब्रह्मलोक | शक्रवाहन | श्रीधाम |
| IAST | Pārijāta | Uttama | Gopura | Siṁhāsana | Pārāvata | Devaloka | Brahmaloka | Śakravāhana | Śrīdhāma |

**Ṣoḍaśavarga** (all sixteen)

| Good vargas | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| संस्कृतम् | भेदक | कुसुम | नागपुष्प | कन्दुक | केरल | कल्पवृक्ष | चन्दनवन | पूर्णचन्द्र |
| IAST | Bhedaka | Kusuma | Nāgapuṣpa | Kanduka | Kerala | Kalpavṛkṣa | Candanavana | Pūrṇacandra |

| Good vargas | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|---|---|---|---|---|---|---|---|
| संस्कृतम् | उच्चैःश्रवा | धन्वन्तरि | सूर्यकान्त | विद्रुम | शक्रसिंहासन | गोलोक | श्रीवल्लभ |
| IAST | Uccaiḥśravā | Dhanvantari | Sūryakānta | Vidruma | Śakrasiṁhāsana | Goloka | Śrīvallabha |

One good varga, or none, has no name in the verses. The Ṣaḍvarga has no seventh varga, so its names end at Kuṇḍala; J's commentary says
the same ("in the Saptavarga the same Kiṁśuka and the rest, but with seven Mukuṭa").

## 3. Which vargas are good (6.52)

The verse has two halves, and the texts read them differently.

1. **The exaltation, the mūlatrikoṇa and the own sign.** A varga in which the graha stands in its exaltation sign or in a sign of its own
   (the mūlatrikoṇa sign is always one of the two). This much every reading has, and it is the count the view shows first.
   *Not built:* the grammar of S and E (*…svabhavanādhipateḥ*, "of the lord of its exaltation, mūlatrikoṇa and own sign") and the Hindi of J
   ("the vargas of the lords of its exaltation, mūlatrikoṇa and own sign") can also be read so that every sign of the lord of the exaltation
   sign counts (for the Sun both signs of Mars). No book I read counts so.
2. **The lords of the kendras from the Āruḍha** (*svārūḍhāt kendranāthānām*). J's Hindi reads the Āruḍha as the Lagna-pada (the Āruḍha
   Lagna). As a choice in the view, a varga also counts when the lord of its sign is the lord of one of the four kendras from the Āruḍha
   Lagna of the rāśi chart. *The writer's reading of an unclear half-verse:* whether *sva-* means the pada of the Lagna or of the graha
   itself, and whether the kendras are to be counted in every varga anew, the verse does not say.

With the second half nearly every varga counts: in the test chart (13 October 1987, Kotka; the kendra lords are the Sun, Mars, Venus and
Saturn) Jupiter has 1 good varga of 10 by the first half and 10 of 10, Śrīdhāma, with the second. This is why the first half alone is the
count shown first, against the rule of the project that the fuller text is the default: the half-verse is not clear enough to be one.

**What the first count cannot reach.** J's editor notes that if the good vargas are the graha's own, Śrīdhāma is not possible: the horā
has only the signs of the Sun and the Moon, and the triṁśāṁśa only those of the five others. (He would read *vargasaṁyoge* as "in the
vargas of the benefics".) By the first count Jupiter can have the horā through its exaltation, Cancer; the Sun and the Moon can never have
the triṁśāṁśa.

## 4. What destroys the yoga (6.53)

| The verse | In the view |
|---|---|
| *astaṅgata*, set in the Sun's rays | "combust": inside the orb of `combustion.ts` (BPHS 3) |
| *grahajita*, defeated by a graha | "defeated in a war": the loser of a planetary war (`yuddha.ts`: closer than 1°, the northern one wins unless the southern is larger and brighter) |
| *nīcaga*, in its debilitation | "debilitated": in its debilitation sign in the rāśi chart |
| *durbala*, weak | "Ṣaḍbala under the required": *the writer's reading*; the verse gives no measure |
| *śayanādigata*, in Śayana and the like | **not judged**: the verse does not say which of the twelve Śayanādi states it means (J adds *duḥstha*, "badly placed") |

The names are shown as counted, and the last column of the table names the spoilers; the count is not lowered.

## 5. The three texts compared

| Verse | S | E | J | Printed in the app |
|---|---|---|---|---|
| 6.43 | षडवर्गे | षडवर्गे | षड्वर्गे (OCR पषडवंग) | षड्वर्गे |
| 6.46 | सयाच्छरैः | स्याच्छरौः | स्याच्छरैः | स्याच्छरैः |
| 6.48 | कुमुमाख्यकम् | कुमुमाख्यकम् | कुसु॰ (OCR कुसुभा॰; the Hindi: कुसुम) | कुसुमाख्यकम् |
| 6.49 | चन्दनवनं | चन्दनवं | चन्दनवन | चन्दनवनं |
| 6.51 | स्रीवल्लभाख्यं | स्रीवल्लभाख्यं (the English: "Strīvallabha") | श्रीव॰ (the Hindi: श्रीवल्लभ) | श्रीवल्लभाख्यं |
| 6.52 | …धिपतेः शुभाः । स्वारुढात् | the same | …धिपतेस्तथा । स्वारूढात् | …धिपतेः शुभाः । स्वारूढात् |
| 6.53 | दुर्बलाश्च ये । शयनादिगतास्तेभ्य उत्पन्ना योगनाशकाः | the same | दुर्बलास्तथा । शयनादिगता दुःस्था ग्रहाः स्युर्योगनाशकाः | as S |

No number and no name differs between the texts; the differences are misprints, and the second half of 6.52–53.

## 6. Not in these verses

* **The word *vaiśeṣikāṁśa*** is not in 6.42–53. It is the name later books use for these counts (the Phaladīpikā 16.15, noted in
  `topic-yogas.md`; J: "in some jātaka books this is called the Vaiśeṣika yoga").
* **Airāvata** for nine in the Daśavarga, which some English books have: the three texts read have Śakravāhana (Indra's mount, which
  Airāvata is).
* **The results** of the names. BPHS 41.18–34 tells what the lord of a house gives in the Pārijāta, the Uttama, the Gopura and the others
  (the verses are shown in ANALYSIS → Topic yogas); they are not joined to this table.
* **The vargas** are always those of Parāśara (BPHS 6), as in the Vimśopaka Bala; the Parivṛtti choice of the charts does not reach them.
