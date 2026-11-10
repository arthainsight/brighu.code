# Wealth assessment: checking the cited classical verses against the Sanskrit

Method: every verse below was read in a Sanskrit text fetched on 2026-11-10. Renderings are mine. The OCR of archive.org Devanagari is noisy; where a reading depends on OCR it says so. Scratch copies are not kept in the repo. Line numbers refer to the plain text of the named file (sanskritdocuments page converted to text; archive.org `_djvu.txt`).

Texts used

| Short name | Source | Quality |
|---|---|---|
| BJ | sanskritdocuments.org/doc_z_misc_sociology_astrology/brihajjAtakam.html (typed Devanagari, verse numbers, no commentary) | clean |
| BJ-Utpala | archive.org `in.ernet.dli.2015.344803`, `in.ernet.dli.2015.487028` (Bṛhajjātaka with Utpala) | OCR unusable for Devanagari (letters scrambled) - Utpala NOT read |
| PD | archive.org `phaldipika_202310` (Phaladīpikā, Sanskrit + Hindi), file `Phaldipika फलदीपिका_djvu.txt` | good |
| JP | archive.org `jataka-parijata` (Jātakapārijāta, Vaidyanātha, Kashi Skt Series 10, Sanskrit + Hindi), `Jataka Parijata_djvu.txt` | fair |
| Sār | archive.org `saravali00kalyuoft` (Kalyāṇavarman, Sārāvalī, Sanskrit), `saravali00kalyuoft_djvu.txt` | poor-fair (OCR errors in the verse) |
| BPHS | sanskritdocuments.org `par0110.html` (Bṛhat Pārāśara Horā Śāstra ch.1-10, Devanagari with verse numbers); cross-checked against archive.org `gAMy_brihat-parashara-hora-shastram-...ganesh-datta...` and `bmmv_brihat-parashar-hora-shastra-...sudha...`, and Santhanam's English (`BPHSEnglish`) | clean |
| BhR-Bhasin | archive.org `fomy_bhavartha-ratnakar-of-ramanjujacarya-with-commentary-by-jagannath-bhasin-1977-ranjan-publicatio` (Sanskrit + Hindi) | fair |
| BhR-Raman | archive.org `in.ernet.dli.2015.134838` (B. V. Raman, English only) | English only |
| SC | archive.org `sarvartha-chintamani-mahidhar-sharma_202210` (Sarvārthacintāmaṇi, Sanskrit + Mahīdhara's Hindi) | fair, Sanskrit verses scrambled in places |
| UK | archive.org `kupdf.net_uttkalamrita-kalidas-ps-sastri` (English), `uttara-kalamrita-kalidas` (Sareen, English) | English only; Devanagari OCR is garbage |

## Summary

| # | Claim | Result |
|---|---|---|
| 1 | BJ 13.1 | CONFIRMED: ch.13 (Candrayoga), v.1, wording as claimed. Mapping kendra = adhama, paṇapara = sama, āpoklima = variṣṭha confirmed from Vaidyanātha's commentary in JP. The same verse is JP 7.112 and Sārāvalī 13.30; Phaladīpikā 6.18 states the rule in general terms and its modern Hindi editor quotes BJ 13.1 (attributing it to JP). Utpala: not read. |
| 2a | BPHS "ch.7 v.5-6" hora | CORRECTED: it is ch.6 (Ṣoḍaśavarga) v.5-6. Ch.7 (Vargaviveka) has "hora for wealth (sampad)" at 7.1 and the hora effects at 7.13-14. |
| 2b | Phaladīpikā 3.12 | CONFIRMED: ch.3 (Vargabheda) v.12. |
| 2c | BJ 1.9 hora | CORRECTED: hora as a half-sign is named in 1.9; the odd/even Sun/Moon rule is 1.11. Sārāvalī 3.14 parallel found. |
| 3 | Bhāvārtha Ratnākara | CONFIRMED in substance: chapter "Dhana yoga" (ch.2 in Raman's and Bhasin's editions), verses 1-2. Verse 1 = the two parivartanas; the 5th-lord-in-5th / 9th-lord-in-9th clause is verse 2 (printed together as "1, 2" in Bhasin). |
| 4a | SC 3.1 | CONFIRMED (2nd house: family, face, speech, right eye, wealth, vidyā, enjoyments, servants, friends). Sanskrit OCR garbled; Hindi gloss clear. |
| 4b | Uttarakālāmṛta ch.5 v.3 | PARTLY: ch.5 is the karakatva chapter and the 2nd bhava list contains "learning" (25th item in P. S. Sastri; "scholarship" in Sareen), but the verse number could not be read (no usable Devanagari OCR). |
| 4c | 9th house "rājyakṛpā" | NOT FOUND in SC (9th: guru, bhāgya, father, grandsons, dayā, tapas, prāpti...) or UK (9th list has no royal favour). In UK "favour of the king" is a karakatva of the Sun, not of the 9th house. |
| 5 | Varga strength of lagna/2nd/11th lords | NOT FOUND in a quick grep of JP, SC, PD. Not examined further. |

## 1. Bṛhajjātaka 13.1

| Item | Detail |
|---|---|
| Text, place | Varāhamihira, Bṛhajjātaka, adhyāya 13 "Candrayoga", verse 1. BJ file line 795-797. |
| Sanskrit | अधम सम वरिष्ठान्यर्क केन्द्रादि संस्थे शशिनि विनय वित्त ज्ञानधी नैपुणानि । <br> अहनि निशि च चन्द्रे स्वे अधिमित्रांशके वा सुर गुरु सितदृष्टे वित्तवान् स्यात् सुखी च ॥ १ ॥ |
| IAST | adhama sama variṣṭhāny arka-kendrādi-saṃsthe śaśini vinaya-vitta-jñāna-dhī-naipuṇāni / ahani niśi ca candre sve adhimitrāṃśake vā sura-guru-sita-dṛṣṭe vittavān syāt sukhī ca // 1 // |
| Meaning (mine) | With the Moon placed in a kendra etc. from the Sun, modesty, wealth, knowledge, intellect and skill are low, middling, highest (in that order). By day or night, if the Moon is in its own or an adhimitra navāṃśa and aspected by Jupiter or Venus, one is wealthy and happy. (Order of the pāda: adhama, sama, variṣṭha.) |
| Mapping to kendra/paṇapara/āpoklima | The verse says only "kendrādi" and "yathākrama". JP's commentary on the same verse (JP file line 17402-17409, Hindi + Sanskrit): सूर्यात् केन्द्रगते चन्द्रे अधमो योगः ... पणफरे ... समो ... आपोक्लिमे ... वरिष्ठः. IAST: sūryāt kendragate candre adhamo yogaḥ; paṇapharē samaḥ; āpoklime variṣṭhaḥ. It adds a quotation "sahasraraśmitaś candre kaṇṭakādigate sati / nyūna-madhya-variṣṭhāni dhana-dhī-naipuṇāni ca" and ascribes it to "pārāśarīya" (OCR; my reading). So: Moon in kendra from Sun = lowest, in paṇapara = middle, in āpoklima = highest. Claim holds. |
| Utpala | Not read: the two archive.org scans (`in.ernet.dli.2015.344803` and `...487028`) have scrambled Devanagari OCR; only the commentary's words on kendra/paṇapara/āpoklima survive in outline. |
| Parallel: Jātakapārijāta | Vaidyanātha, JP ch.7 (Rājayogādhyāya), v.112, heading "अथ अधमादियोगाः", JP file line 17399-17402. The verse is the same as BJ 13.1 (pāda a: अधमसमवरिष्ठान्यर्ककेन्द्रादिसंस्थे; pāda c: स्वाधिमित्रांशके, i.e. svādhimitra; d: सुरगुरुसितदृष्टे). Verse number "११२" as OCR'd. |
| Parallel: Sārāvalī | Kalyāṇavarman, ch.13 (colophon "चन्द्रविधि नाम त्रयोदशोऽध्यायः"), v.30, file line 2133-2134. OCR garbled: "सूयत् केन्द्रादिगतो निशाकरः खस्पमध्यमूपिषठान् । कुयौत्रमेण धनधीनेपुणविज्ञानविनयां श्च ॥ ३० ॥". My reading: sūryāt kendrādigato niśākaraḥ svalpa-madhya-variṣṭhān kuryāt krameṇa dhana-dhī-naipuṇa-vijñāna-vinayāṃś ca. (A parallel in sense and wording, with vijñāna added.) Confidence: medium (OCR). |
| Parallel: Phaladīpikā | PD ch.6 v.18 (file lines 3971-3977): "कष्टमध्यमवराह्वययोगे द्रव्यवाहनयशःसुखसम्पत् / ज्ञानधीविनयनैपुणविद्यात्यागभोगजफलान्यपि तद्वत् ॥ १८ ॥" = in kaṣṭa, madhyama and variṣṭha yogas, wealth, vehicles, fame, happiness, knowledge, intellect, modesty, skill, learning, renunciation, enjoyment come in small, middling, large measure. The modern Hindi editor (Mantreśvara's Phaladīpikā edition) quotes immediately after it, line 3976-3977, BJ 13.1 verbatim ("अधमसमवरिष्ठान्यर्ककेन्द्रादिसंस्थे ...") and labels it "(जातकपारिजात)". So the label is JP (JP does carry it, 7.112), but the verse is originally BJ 13.1. Phaladīpikā itself has no Moon-from-Sun verse in these terms (grep for विनयवित्त, ज्ञानधी: only 6.18 and the editor's quotation). |

Suggested citation for the app: "Bṛhajjātaka 13.1 (also Jātakapārijāta 7.112, Sārāvalī 13.30; cf. Phaladīpikā 6.18 for the three grades)".

## 2. Hora: BPHS, Phaladīpikā, Bṛhajjātaka, Sārāvalī

| Text | Verse | Sanskrit | Says | Where / confidence |
|---|---|---|---|---|
| BPHS (sanskritdocuments numbering = Santhanam's) | ch.6 "Ṣoḍaśavargādhyāya" v.5 (NOT ch.7) | तत्क्षेत्रं तस्य खेटस्य राशेर्यो यस्य नायकः । सूर्येन्द्वोर्विषमे राशौ समे तद्विपरीतकम् ॥ ५ ॥ <br> IAST: tatkṣetraṃ tasya kheṭasya rāśer yo yasya nāyakaḥ / sūryendor viṣame rāśau same tadviparītakam | The kṣetra of a planet is the sign it owns; in an odd sign (the horas) of Sun and Moon, in an even sign the reverse. (The Sanskrit does not say "first half" in words; the order Sun, Moon is implied; Santhanam's translation and Ganesh Datta's Hindi state it: odd sign, first half Sun.) | `par0110.txt` lines 596-597; confidence high |
| BPHS | ch.6 v.6 | पितरश्चन्द्रहोरेशा देवाः सूर्यस्य कीर्तिताः । राशेरर्द्धं भवेद्धोरा ताश्चतुर्विंशतिः स्मृता । मेषादि तासां होराणां परिवृत्तिद्वयं भवेत् ॥ ६ ॥ <br> IAST: pitaraś candrahoreśā devāḥ sūryasya kīrtitāḥ / rāśer arddhaṃ bhaved dhorā tāś caturviṃśatiḥ smṛtā / meṣādi tāsāṃ horāṇāṃ parivṛttidvayaṃ bhavet | Lords of the Moon's hora are the Pitṛs, of the Sun's the Devas; half a sign is a hora; 24 in all, the cycle from Aries repeating twice. | same file, lines 599-601; high. In the Ganesh Datta edition (`gAMy_...`, its ch.9) the same two are vv.4-5 and v.5 reads "devyaḥ" for "devāḥ"; the Jha edition and Santhanam differ in numbering by edition. |
| BPHS | ch.7 "Vargavivekādhyāya" v.1 | लग्ने देहस्य विज्ञानं होरायां सम्पदादिकम् ॥ १ ॥ (lagne dehasya vijñānaṃ horāyāṃ sampadādikam) | hora is the varga for wealth/prosperity (sampad). This is the one ch.7 verse relevant to "wealth from hora". | line 749; high |
| BPHS | ch.7 vv.13-14 | सूर्यहोराफलं दद्युर्जीवार्कवसुधात्मजाः । चन्द्रास्फुजिदर्कपुत्राश्चन्द्रहोराफलप्रदाः ॥ १३ ॥ फलद्वयं बुधो दद्यात् समे चान्द्रं तदन्यके । रवेः फलं स्वहोरादौ फलहीनं विरामके ॥ १४ ॥ | Jupiter, Sun, Mars give the Sun-hora result; Moon, Venus, Saturn the Moon-hora result; Mercury both; in even signs the Moon's hora result, otherwise (odd) the Sun's; full at the start of the hora, none at its end. | lines 784-788; high |
| Phaladīpikā | ch.3 "Vargabheda" v.4 (hora defined, with decanate etc.) | क्षेत्रस्यार्द्धं हि होरा त्वयुजि रविसुधांश्वोः समे व्यस्तमेतद् | Hora = half a sign; in an odd sign the Sun's and the Moon's (in that order); in an even sign reversed. | PD lines 1908-1910 (the ॥४॥ closing the verse is just below); high |
| Phaladīpikā | ch.3 v.12 (CONFIRMED as claimed) | ओजे क्रूरेऽर्कहोरां गतवति बलवान् क्रूरवृत्तिर्धनाढ्यो / युग्मे चान्द्रीं शुभेषु द्युतिविनयवचोहृद्यसौ भाग्ययुक्तः । / व्यस्तं व्यस्तेऽत्र मिश्रे समफलमुदितं लग्नचन्द्रौ बलिष्ठौ / तन्नाथौ द्वौ च तद्वद्यदि भवति चिरंजीव्यदुःखी यशस्वी ॥ १२ ॥ <br> IAST: oje krūre 'rkahorāṃ gatavati balavān krūravṛttir dhanāḍhyo / yugme cāndrīṃ śubheṣu dyutivinayavacohṛdyasau bhāgyayuktaḥ / vyastaṃ vyaste 'tra miśre samaphalam uditaṃ lagnacandrau baliṣṭhau / tannāthau dvau ca tadvad yadi bhavati ciraṃjīvy aduḥkhī yaśasvī | Malefic in the Sun's hora in an odd sign: strong, cruel in conduct, rich. Benefics in the Moon's hora in an even sign: radiant, modest, pleasant-voiced (vacohṛdya), fortunate. The reverse placements give the reverse; mixed, mixed. If lagna, Moon and their lords are strong: long-lived, free of sorrow, famous. | PD lines 2578-2581, Hindi 2582-2597; high. "Modest, pleasant manners" is the right gloss of dyuti-vinaya-vaco-hṛdya (the first word is "radiance"). |
| Bṛhajjātaka | ch.1 v.9 | द्रेष्काण होरा नव भाग संज्ञास्त्रिंशांशद्वादश संज्ञिताश्च । क्षेत्रं च यद्यस्य स तस्य वर्गो होरेति लग्नं भवनस्य चार्धम् ॥ ९ ॥ | Names of the vargas; hora = half of a sign. It does NOT give the Sun/Moon order. | `bj.txt` line 100-101; high |
| Bṛhajjātaka | ch.1 v.11 (the odd/even rule) | मार्तण्डेन्द्वोरयुजि समभे चन्द्र भान्वोश्च होरे ... <br> IAST: mārtaṇḍendvor ayuji samabhe candra-bhānvoś ca hore | in an odd sign the two horas are Sun's then Moon's; in an even sign Moon's then Sun's (rest of the verse: decanate lords). v.12 gives a rival view of the hora (first hora of a sign for its lord, second for the lord of the 11th). | `bj.txt` line 97 / 111-112; high |
| Sārāvalī | ch.3 v.14 (rāśibheda; v.9 gives the half-sign) | रविचन्द्राविन्दुरवी विषमसमेष्वर्धराशीनाम् (OCR "विषमसमेष्वधराशीनाम्") | Sun, Moon / Moon, Sun in the half-signs of odd and even signs. | `saravali00kalyuoft_djvu.txt` lines 609-611 (v.9 at 599-600); medium-high (OCR) |
| Jātakapārijāta | not looked up for hora | - | - | not found |

Note: the hora-results verse (PD 3.12) is the only one found that links hora to wealth by sign type for malefics/benefics. Whether Sārāvalī or BJ has the same table: not found.

## 3. Bhāvārtha Ratnākara, dhana yogas

Rāmānujācārya, Bhāvārtharatnākara. Editions differ in chapter count (Raman: 1 Lagna, 2 Dhana yogas...; Bhasin: ch.1 the 12 lagnas, ch.2 includes dhana yoga + vidyā). In both the dhana-yoga verses are the first of chapter 2.

| Verse | Sanskrit (BhR-Bhasin file lines 3337-3340; OCR with small errors, my corrections in IAST) | Says | Where / confidence |
|---|---|---|---|
| 1 (first half, with 2nd) | धनेशे पञ्चमस्थे च पञ्चमेशो धने यदि । धनपे लाभगे वापि लाभेशो धनगो यदि । <br> dhaneśe pañcamasthe ca pañcameśo dhane yadi / dhanape lābhage vāpi lābheśo dhanago yadi | 2nd lord in 5th and 5th lord in 2nd; or 2nd lord in 11th and 11th lord in 2nd (parivartana). Raman: "stanza 1: ... in the 5th and ... in the 2nd, or if the lord of the 2nd is in the 11th and the lord of the 11th is in the 2nd". Bhasin's Hindi paraphrase is looser (reads the second case as "or" either direction). | Bhasin lines 3337-3338, Hindi 3341-3343; Raman ch.2 "stanza 1" (file `in.ernet.dli.2015.134838` line ~2336); high for content, medium for exact pāda text |
| 2 | पञ्चमेशो पञ्चमे वा भाग्ये भाग्याधिपो यदि । विशेष धनयोगाश्चेत्याहुर्जातककोविदाः ॥ १,२ ॥ (OCR "पञ्चमेशो पंचमे वा ... जातकको विदा:") <br> pañcameśe pañcame vā bhāgye bhāgyādhipo yadi / viśeṣa-dhanayogāś cety āhur jātaka-kovidāḥ // 1, 2 // | 5th lord in 5th, 9th lord in 9th: special/much wealth. | Bhasin lines 3339-3340 (the two verses are printed as one unit "१, २"); Raman "stanza 2"; high |
| 3 | धनलाभाधिपत्योहि धनयोगम् नवे विना । नव पञ्चमेशयोरन्यरेण सहसंगति ॥ ३ ॥ (OCR very garbled) | Raman: dhana yoga if lords of 2nd and 11th combine with lords of 5th and 9th; not (the full yoga) if combined with other lords. Bhasin's Hindi (line ~3380) reads the verse as the negative. | medium (OCR garbled) |
| 4-8 | (Hindi/English) | 4: otherwise only modest wealth; 5: 12th lord with 2nd and 11th lords spoils it; 6: Jupiter with 2nd lord and Mercury; 7: lagna, 2nd, 11th lords each in own house; 8: 2nd and 11th lords both in lagna. | Bhasin 3395-3460; Raman stanzas 4-8; high |

Correction to the claim: the three conditions are not all in "verse 1": 1 = the two exchanges, 2 = the 5th/9th own-house clause (Bhasin merges them as 1-2).

Also relevant: Bhasin's rule list (line 374-376) says the 2nd bhāva is the principal sthāna of vidyā, "विद्या शीर्षक में श्लोक ३, ४, ७ से १०" (the vidyā section, verses 3, 4, 7-10; section at lines ~3648-3800 of Bhasin).

## 4. Second house as vidyā; ninth house

| Text | Place | Sanskrit | Says | Where / confidence |
|---|---|---|---|---|
| Sarvārthacintāmaṇi (Veṅkaṭeśa) | ch.3 "Dhanabhāvaphalādhyāya" v.1 | OCR (garbled): "कोटुबाद्वत्तेव्यान्सुखं च वाग्दक्षिणाक्षिपवोथीन् । विद्यामुक्तिविशेषान् दासान्मित्राणि च प्रवदेत् ॥ १ ॥". Only the second line is clean: **विद्यामुक्तिविशेषान् दासान्मित्राणि च प्रवदेत्** (vidyā-bhukti-viśeṣān dāsān mitrāṇi ca pravadet). The first line I read as kuṭumba-…, mukha, vāk, dakṣiṇākṣi, artha (OCR; not certain). | Mahīdhara's Hindi gloss (line 3885): "दूसरे स्थानसे ... कुटुंबी, मुख, वाणी, दाहिना नेत्र, धन, विद्या, भोगविशेष, दास, मित्र" = family, face, speech, right eye, wealth, learning, special enjoyments, servants, friends. So the 2nd house = vidyā, confirmed. | SC file lines 3882-3886; verse text medium, meaning high |
| Sarvārthacintāmaṇi | ch.7 "Aṣṭama-navamabhāvaphala", 9th-house section v.1 | शुभभवनाद् गुरुभाग्यं पितृपौत्रदयातपःप्राप्तिम् । ऊरुस्थानं ... (OCR garbled) | 9th: guru, fortune, father, grandsons, compassion, penance, gain, thigh-place, etc.; v.2: guru, svāmin, father, bhāgya, maternal uncles. No royal favour. | lines 7089-7102; meaning high, Sanskrit text low |
| Uttarakālāmṛta (Kālidāsa) | ch.5 (karakatva chapter) 2nd bhava, near its start (verses 3-4 on the OCR numbering "Sloka-1 %3" in Sareen, i.e. probably 3-4; not certain) | Devanagari not recoverable | 2nd bhava significations (P. S. Sastri's English): speech, wealth, faith in scripture, nails, enjoyments, truth/falsehood, tongue, eyes, clothes, gems, ... (25) Learning, gold, silver, corn, ... "Scholarship" (27) in Sareen. | `kupdf.net_uttkalamrita-kalidas-ps-sastri` line 7263 ff; `uttara-kalamrita-kalidas` line 2530 ff; list confirmed (English only), verse number NOT confirmed |
| Uttarakālāmṛta | ch.5, 9th bhava | - | 9th: charity, virtuous acts, pilgrimage, penance, respect for guru/elders, purity of mind, worship of gods, "effort to learn", splendour, ... fortune, polity, ... paternal property, sons and daughters, eight forms of wealth. No royal favour. In the list of the Sun: "(12) favour of the king". | kupdf line 7528-7545, 7924; high (English) |

So: "2nd house = vidyā/jñāna" holds for SC 3.1 (clear) and UK 5 (learning/scholarship in the 2nd-bhava list). "9th house = rājyakṛpā": not found in either text; if the app uses this phrase it should not cite SC or UK for it.

## 5. Varga strength of lagna, 2nd, 11th lords

Not found in the time spent: a grep of JP, SC and PD for lagneśa/dhaneśa/lābheśa with varga terms gave nothing relevant. The only hits: BPHS 7.1 (hora for wealth) and PD 3.12 (above). Marked not found.

## What I could not do

- Utpala's commentary on BJ 13.1 (OCR unusable; Vaidyanātha's commentary in JP used instead).
- A Devanagari text of the Uttarakālāmṛta (only English translations are on archive.org here).
- A clean Sanskrit text of Bhāvārtharatnākara dhana-yoga verse 3 (OCR garbled).
- Per the instruction "do not edit any other file", `docs/muhurta-sources.md` was not touched.
