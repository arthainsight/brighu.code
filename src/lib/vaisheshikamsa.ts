// The names of the good vargas of a graha (BPHS 6.42–53), known in other books as the Vaiśeṣikāṁśas.
//
// A graha is looked at in the vargas of a scheme (the six, the seven, the ten or the sixteen, the same sets as in
// vargaMatrix.ts), the vargas in which it stands well are counted, and the count has a name: Kiṁśuka … Mukuṭa in the
// Ṣaḍvarga and the Saptavarga (6.43–44), Pārijāta … Śrīdhāma in the Daśavarga (6.45–47) and Bhedaka … Śrīvallabha in the
// Ṣoḍaśavarga (6.48–51). One good varga, or none, has no name.
//
// Which vargas are good is told in 6.52: those of the graha's exaltation, mūlatrikoṇa and own sign, and those of the
// lords of the kendras from the Āruḍha. The first half is what all the readings share and is the count shown first;
// the second half is a choice ('full'). 6.53 names the grahas that spoil the yoga: combust, defeated in a war,
// debilitated, weak, or in Śayana and the like. docs/vaisheshikamsa-sources.md has the verses, the three texts
// compared and what is not judged.

import type { BalaOptions } from './balaOptions';
import { DEFAULT_BALA_OPTIONS } from './balaOptions';
import { calculateAvasthas } from './avasthas';
import { combustionOf } from './combustion';
import type { ChartData } from '@/types';
import { buildShadbalaRows, getCompoundRelation, getDignity, SCORE_PLANETS, shadbalaWars, type RasiSigns, type ShadbalaChartLike, type ShadbalaPlanet } from './shadbala';
import { SIGN_ABBR, SIGN_LORDS } from './signs';
import { arudhaSign } from './specialSphutas';
import { getVargaSignIndex } from './varga';
import { VIMSOPAKA_SCHEMES, type SchemeKey } from './vargaMatrix';

export interface VaisheshikaName {
  /** How many good vargas. */
  count: number;
  name: string;
  devanagari: string;
  /** The word of the verse that gives the number, and the number it stands for where it is a word-numeral. */
  numeral: string;
  /** The verse of chapter 6. */
  verse: number;
  meaning: string;
}

/** Ṣaḍvarga and Saptavarga (6.43–44); the seventh is of the Saptavarga only. */
export const KIMSHUKADI: readonly VaisheshikaName[] = [
  { count: 2, name: 'Kiṁśuka', devanagari: 'किंशुक', numeral: 'dvābhyām', verse: 43, meaning: 'the flame-of-the-forest tree' },
  { count: 3, name: 'Vyañjana', devanagari: 'व्यञ्जन', numeral: 'tribhiḥ', verse: 43, meaning: 'the mark, the insignia' },
  { count: 4, name: 'Cāmara', devanagari: 'चामर', numeral: 'caturbhiḥ', verse: 44, meaning: 'the yak-tail fan' },
  { count: 5, name: 'Chatra', devanagari: 'छत्र', numeral: 'pañcabhiḥ', verse: 44, meaning: 'the parasol' },
  { count: 6, name: 'Kuṇḍala', devanagari: 'कुण्डल', numeral: 'ṣaḍbhiḥ', verse: 44, meaning: 'the earring' },
  { count: 7, name: 'Mukuṭa', devanagari: 'मुकुट', numeral: 'saptabhiḥ', verse: 44, meaning: 'the crown' },
];

/** Daśavarga (6.45–47). */
export const PARIJATADI: readonly VaisheshikaName[] = [
  { count: 2, name: 'Pārijāta', devanagari: 'पारिजात', numeral: 'dvābhyām', verse: 45, meaning: 'the coral tree of heaven' },
  { count: 3, name: 'Uttama', devanagari: 'उत्तम', numeral: 'tribhiḥ', verse: 45, meaning: 'the highest' },
  { count: 4, name: 'Gopura', devanagari: 'गोपुर', numeral: 'caturbhiḥ', verse: 46, meaning: 'the city gate' },
  { count: 5, name: 'Siṁhāsana', devanagari: 'सिंहासन', numeral: 'śaraiḥ (arrows: 5)', verse: 46, meaning: 'the lion throne' },
  { count: 6, name: 'Pārāvata', devanagari: 'पारावत', numeral: 'ṣaḍbhiḥ', verse: 46, meaning: 'the dove' },
  { count: 7, name: 'Devaloka', devanagari: 'देवलोक', numeral: 'saptabhiḥ', verse: 46, meaning: 'the world of the gods' },
  { count: 8, name: 'Brahmaloka', devanagari: 'ब्रह्मलोक', numeral: 'vasubhiḥ (Vasus: 8)', verse: 47, meaning: 'the world of Brahmā' },
  { count: 9, name: 'Śakravāhana', devanagari: 'शक्रवाहन', numeral: 'navabhiḥ', verse: 47, meaning: 'the mount of Indra' },
  { count: 10, name: 'Śrīdhāma', devanagari: 'श्रीधाम', numeral: 'digbhiḥ (directions: 10)', verse: 47, meaning: 'the abode of Śrī' },
];

/** Ṣoḍaśavarga (6.48–51). */
export const BHEDAKADI: readonly VaisheshikaName[] = [
  { count: 2, name: 'Bhedaka', devanagari: 'भेदक', numeral: 'dvābhyām', verse: 48, meaning: 'the divider' },
  { count: 3, name: 'Kusuma', devanagari: 'कुसुम', numeral: 'tribhiḥ', verse: 48, meaning: 'the flower' },
  { count: 4, name: 'Nāgapuṣpa', devanagari: 'नागपुष्प', numeral: 'caturbhiḥ', verse: 48, meaning: 'the nāga flower' },
  { count: 5, name: 'Kanduka', devanagari: 'कन्दुक', numeral: 'pañcabhiḥ', verse: 48, meaning: 'the ball' },
  { count: 6, name: 'Kerala', devanagari: 'केरल', numeral: 'ṣaḍbhiḥ', verse: 49, meaning: 'Kerala' },
  { count: 7, name: 'Kalpavṛkṣa', devanagari: 'कल्पवृक्ष', numeral: 'saptabhiḥ', verse: 49, meaning: 'the wish-granting tree' },
  { count: 8, name: 'Candanavana', devanagari: 'चन्दनवन', numeral: 'aṣṭabhiḥ', verse: 49, meaning: 'the sandalwood grove' },
  { count: 9, name: 'Pūrṇacandra', devanagari: 'पूर्णचन्द्र', numeral: 'navabhiḥ', verse: 49, meaning: 'the full Moon' },
  { count: 10, name: 'Uccaiḥśravā', devanagari: 'उच्चैःश्रवा', numeral: 'digbhiḥ (directions: 10)', verse: 50, meaning: 'the horse of Indra' },
  { count: 11, name: 'Dhanvantari', devanagari: 'धन्वन्तरि', numeral: 'rudraiḥ (Rudras: 11)', verse: 50, meaning: 'the physician of the gods' },
  { count: 12, name: 'Sūryakānta', devanagari: 'सूर्यकान्त', numeral: 'sūryaiḥ (Suns: 12)', verse: 50, meaning: 'the sunstone' },
  { count: 13, name: 'Vidruma', devanagari: 'विद्रुम', numeral: 'viśvaiḥ (Viśvedevas: 13)', verse: 50, meaning: 'the coral' },
  { count: 14, name: 'Śakrasiṁhāsana', devanagari: 'शक्रसिंहासन', numeral: 'śakraiḥ (Indras: 14)', verse: 51, meaning: 'the throne of Indra' },
  { count: 15, name: 'Goloka', devanagari: 'गोलोक', numeral: 'tithibhiḥ (tithis: 15)', verse: 51, meaning: 'the world of the cows' },
  { count: 16, name: 'Śrīvallabha', devanagari: 'श्रीवल्लभ', numeral: 'bhūpaiḥ (kings: 16)', verse: 51, meaning: 'the beloved of Śrī' },
];

/** The names of each scheme. The Ṣaḍvarga ends at Kuṇḍala: it has no seventh varga. */
export const VAISHESHIKA_NAMES: Record<SchemeKey, readonly VaisheshikaName[]> = {
  shadvarga: KIMSHUKADI.slice(0, 5),
  saptavarga: KIMSHUKADI,
  dasavarga: PARIJATADI,
  shodasavarga: BHEDAKADI,
};

export const VAISHESHIKA_SCHEMES = Object.keys(VIMSOPAKA_SCHEMES) as SchemeKey[];

/** The vargas of a scheme, as 'D1', 'D2' … */
export const schemeVargas = (scheme: SchemeKey): string[] => Object.keys(VIMSOPAKA_SCHEMES[scheme].weights);

/** The name of a count in a scheme; null for one good varga or none. */
export function vaisheshikaName(scheme: SchemeKey, count: number): VaisheshikaName | null {
  return VAISHESHIKA_NAMES[scheme].find(entry => entry.count === count) ?? null;
}

export interface VaisheshikaVerse {
  verse: number;
  sanskrit: [string, string];
  iast: [string, string];
  gloss: string;
  /** Where the letters printed here are not those of the online text. */
  note?: string;
}

// The Devanagari is the text of sanskritdocuments.org (the same digitization as enjoylearningsanskrit.com), read against
// the printed edition of Devacandra Jhā (Chaukhamba, Kashi Sanskrit Series 220); the misprints corrected from the print
// are in the notes. The glosses are short summaries, and the verse decides.
export const VAISHESHIKA_VERSES: readonly VaisheshikaVerse[] = [
  { verse: 42, sanskrit: ['वर्गभेदानहं वक्ष्ये मैत्रेय त्वं विधारय ।', 'षड्वर्गाः सप्तवर्गाश्च दिग्वर्गा नृपवर्गकाः ॥४२॥'], iast: ['vargabhedānahaṃ vakṣye maitreya tvaṃ vidhāraya .', 'ṣaḍvargāḥ saptavargāśca digvargā nṛpavargakāḥ.'], gloss: 'The kinds of vargas: the six, the seven, the ten (the directions) and the sixteen (the kings).' },
  { verse: 43, sanskrit: ['भवन्ति वर्गसंयोगे षड्वर्गे किंशुकादयः ।', 'द्वाभ्यां किंशुकनामा च त्रिभिर्व्यञ्जनमुच्यते ॥४३॥'], iast: ['bhavanti vargasaṃyoge ṣaḍvarge kiṃśukādayaḥ .', 'dvābhyāṃ kiṃśukanāmā ca tribhirvyañjanamucyate.'], gloss: 'When vargas come together, in the Ṣaḍvarga: Kiṁśuka and the rest. With two Kiṁśuka, with three Vyañjana.', note: 'The online text has षडवर्गे.' },
  { verse: 44, sanskrit: ['चतुर्भिश्चामराख्यं च छत्रं पञ्चभिरेव च ।', 'षड्भिः कुण्डलयोगः स्यान्मुकुटाख्यं च सप्तभिः ॥४४॥'], iast: ['caturbhiścāmarākhyaṃ ca chatraṃ pañcabhireva ca .', 'ṣaḍbhiḥ kuṇḍalayogaḥ syānmukuṭākhyaṃ ca saptabhiḥ.'], gloss: 'With four Cāmara, with five Chatra, with six the Kuṇḍala yoga, and with seven Mukuṭa' },
  { verse: 45, sanskrit: ['सप्तवर्गेऽथ दिग्वर्गे पारिजातादिसंज्ञकाः ।', 'पारिजातं भवेद्द्वाभ्यामुत्तमं त्रिभिरुच्यते ॥४५॥'], iast: ['saptavarge\'tha digvarge pārijātādisaṃjñakāḥ .', 'pārijātaṃ bhaveddvābhyāmuttamaṃ tribhirucyate.'], gloss: '… in the Saptavarga. Then in the Daśavarga the names begin with Pārijāta: with two Pārijāta, with three Uttama.' },
  { verse: 46, sanskrit: ['चतुर्भिर्गोपुराख्यं स्याच्छरैः सिंहासनं तथा ।', 'पारावतं भवेत् षड्भिर्देवलोकं च सप्तभिः ॥४६॥'], iast: ['caturbhirgopurākhyaṃ syāccharaiḥ siṃhāsanaṃ tathā .', 'pārāvataṃ bhavet ṣaḍbhirdevalokaṃ ca saptabhiḥ.'], gloss: 'With four Gopura, with five (the arrows) Siṁhāsana, with six Pārāvata, with seven Devaloka.', note: 'The online texts have सयाच्छरैः and स्याच्छरौः.' },
  { verse: 47, sanskrit: ['वसुभिर्ब्रह्मलोकाख्यं नवभिः शक्रवाहनम् ।', 'दिग्भिः श्रीधामयोगः स्यादथ षोडशवर्गके ॥४७॥'], iast: ['vasubhirbrahmalokākhyaṃ navabhiḥ śakravāhanam .', 'digbhiḥ śrīdhāmayogaḥ syādatha ṣoḍaśavargake.'], gloss: 'With eight (the Vasus) Brahmaloka, with nine Śakravāhana, with ten (the directions) the Śrīdhāma yoga. Then in the Ṣoḍaśavarga:' },
  { verse: 48, sanskrit: ['भेदकं च भवेद्द्वाभ्यां त्रिभिः स्यात् कुसुमाख्यकम् ।', 'चतुर्भिर्नागपुष्पं स्यात् पञ्चभिः कन्दुकाह्वयम् ॥४८॥'], iast: ['bhedakaṃ ca bhaveddvābhyāṃ tribhiḥ syāt kusumākhyakam .', 'caturbhirnāgapuṣpaṃ syāt pañcabhiḥ kandukāhvayam.'], gloss: 'With two Bhedaka, with three Kusuma, with four Nāgapuṣpa, with five Kanduka.', note: 'The online text has कुमुमाख्यकम्; the commentary of the printed edition names it कुसुम.' },
  { verse: 49, sanskrit: ['केरलाख्यं भवेत् षड्भिः सप्तभिः कल्पवृक्षकम् ।', 'अष्टभिश्चन्दनवनं नवभिः पूर्णचन्द्रकम् ॥४९॥'], iast: ['keralākhyaṃ bhavet ṣaḍbhiḥ saptabhiḥ kalpavṛkṣakam .', 'aṣṭabhiścandanavanaṃ navabhiḥ pūrṇacandrakam.'], gloss: 'With six Kerala, with seven Kalpavṛkṣa, with eight Candanavana, with nine Pūrṇacandra.' },
  { verse: 50, sanskrit: ['दिग्भिरुच्चैःश्रवा नाम रुद्रैर्धन्वन्तरिर्भवेत् ।', 'सूर्यकान्तं भवेद् सूर्यैर्विश्वैः स्याद्विद्रुमाख्यकम् ॥५०॥'], iast: ['digbhiruccaiḥśravā nāma rudrairdhanvantarirbhavet .', 'sūryakāntaṃ bhaved sūryairviśvaiḥ syādvidrumākhyakam.'], gloss: 'With ten (the directions) Uccaiḥśravā, with eleven (the Rudras) Dhanvantari, with twelve (the Suns) Sūryakānta, with thirteen (the Viśvedevas) Vidruma.' },
  { verse: 51, sanskrit: ['शक्रसिंहासनं शक्रैर्गोलोकं तिथिभिर्भवेत् ।', 'भूपैः श्रीवल्लभाख्यं स्याद्वर्गा भेदैरुदाहृताः ॥५१॥'], iast: ['śakrasiṃhāsanaṃ śakrairgolokaṃ tithibhirbhavet .', 'bhūpaiḥ śrīvallabhākhyaṃ syādvargā bhedairudāhṛtāḥ.'], gloss: 'With fourteen (the Indras) Śakrasiṁhāsana, with fifteen (the tithis) Goloka, with sixteen (the kings) Śrīvallabha. So the vargas are told by their kinds.', note: 'The online text has स्रीवल्लभाख्यं.' },
  { verse: 52, sanskrit: ['स्वोच्चमूलत्रिकोणस्वभवनाधिपतेः शुभाः ।', 'स्वारूढात् केन्द्रनाथानां वर्गा ग्राह्याः सुधीमता ॥५२॥'], iast: ['svoccamūlatrikoṇasvabhavanādhipateḥ śubhāḥ .', 'svārūḍhāt kendranāthānāṃ vargā grāhyāḥ sudhīmatā.'], gloss: 'The vargas to be taken as good: those of the exaltation, the mūlatrikoṇa and the own sign, and those of the lords of the kendras from the Āruḍha.', note: 'The online text has स्वारुढात्; the printed edition ends the first half with …धिपतेस्तथा.' },
  { verse: 53, sanskrit: ['अस्तङ्गता ग्रहजिता नीचगा दुर्बलाश्च ये ।', 'शयनादिगतास्तेभ्य उत्पन्ना योगनाशकाः ॥५३॥'], iast: ['astaṅgatā grahajitā nīcagā durbalāśca ye .', 'śayanādigatāstebhya utpannā yoganāśakāḥ.'], gloss: 'Combust, defeated by a graha, debilitated, weak, or in Śayana and the like: what arises from such grahas destroys the yoga.', note: 'The printed edition: …दुर्बलास्तथा । शयनादिगता दुःस्था ग्रहाः स्युर्योगनाशकाः.' },
];

/** 'own': the exaltation, mūlatrikoṇa and own sign (6.52, first half). 'full': also the signs of the lords of the kendras from the Āruḍha Lagna (the second half). */
export type VaisheshikaReading = 'own' | 'full';

export interface VaisheshikaCell {
  signIndex: number;
  sign: string;
  /** The graha is in its exaltation sign, or in a sign of its own (its mūlatrikoṇa sign is one of the two). */
  dignity: 'exalted' | 'own' | null;
  /** The lord of the sign is the lord of a kendra from the Āruḍha Lagna; in the Jagannatha Hora count, the graha is in a kendra from the lord of the Āruḍha Lagna in this varga. */
  kendraLord: boolean;
  /** The Jagannatha Hora count: why the kendra does not count here. */
  cancelled?: 'debilitated' | 'enemy' | 'avastha';
  /** Counted as a good varga under the reading. */
  good: boolean;
}

/** What 6.53 says spoils the yoga, as far as the app judges it. */
export type VaisheshikaSpoiler = 'combust' | 'defeated' | 'debilitated' | 'weak';

export interface VaisheshikaRow {
  /** One of the seven grahas; in the Jagannatha Hora count Rahu and Ketu too. */
  planet: string;
  /** The sixteen vargas, by 'D1' … 'D60'. */
  vargas: Record<string, VaisheshikaCell>;
  counts: Record<SchemeKey, number>;
  names: Record<SchemeKey, VaisheshikaName | null>;
  spoilers: VaisheshikaSpoiler[];
}

export interface VaisheshikaResult {
  /** The Āruḍha Lagna, 1–12; null when the Lagna or its lord is not known. */
  arudhaSign: number | null;
  /** The lords of the four kendras from it. */
  kendraLords: ShadbalaPlanet[];
  rows: VaisheshikaRow[];
}

const ALL_VARGAS = schemeVargas('shodasavarga');

/** The Āruḍha Lagna of the rāśi chart and the lords of its kendras. */
export function arudhaKendraLords(chart: ShadbalaChartLike): { arudhaSign: number | null; kendraLords: ShadbalaPlanet[] } {
  const lagnaSign = typeof chart.ascendant?.longitude === 'number' ? Math.floor((((chart.ascendant.longitude % 360) + 360) % 360) / 30) + 1 : chart.ascendant?.sign;
  if (typeof lagnaSign !== 'number') return { arudhaSign: null, kendraLords: [] };
  const lord = (chart.planets ?? []).find(planet => planet.name === SIGN_LORDS[lagnaSign - 1]);
  if (typeof lord?.longitude !== 'number') return { arudhaSign: null, kendraLords: [] };
  const pada = arudhaSign(lagnaSign, getVargaSignIndex(lord.longitude, 1) + 1);
  const lords = [0, 3, 6, 9].map(step => SIGN_LORDS[(pada - 1 + step) % 12] as ShadbalaPlanet);
  return { arudhaSign: pada, kendraLords: SCORE_PLANETS.filter(planet => lords.includes(planet)) };
}

/** The grahas that 6.53 names, as far as they are judged: combust, defeated in a war, debilitated in the rāśi, or under the required Ṣaḍbala. */
export function vaisheshikaSpoilers(chart: ShadbalaChartLike, options: BalaOptions = DEFAULT_BALA_OPTIONS): Partial<Record<ShadbalaPlanet, VaisheshikaSpoiler[]>> {
  const planets = chart.planets ?? [];
  const sun = planets.find(planet => planet.name === 'Sun');
  const shadbala = buildShadbalaRows(chart, options);
  // The victor is told whatever the Yuddha Bala choice is; 'off' only keeps the war out of the Ṣaḍbala.
  const losers = new Set(shadbalaWars(chart, shadbala, { ...options, yuddha: options.yuddha === 'off' ? 'verse' : options.yuddha }).map(war => war.loser));
  const result: Partial<Record<ShadbalaPlanet, VaisheshikaSpoiler[]>> = {};
  for (const name of SCORE_PLANETS) {
    const planet = planets.find(item => item.name === name);
    if (typeof planet?.longitude !== 'number') continue;
    const spoilers: VaisheshikaSpoiler[] = [];
    const retrograde = planet.isRetrograde ?? (typeof planet.speed === 'number' && planet.speed < 0);
    if (typeof sun?.longitude === 'number' && combustionOf(name, planet.longitude, sun.longitude, retrograde)) spoilers.push('combust');
    if ((losers as Set<string | null>).has(name)) spoilers.push('defeated');
    if (getDignity(name, getVargaSignIndex(planet.longitude, 1)) === 'debilitated') spoilers.push('debilitated');
    const row = shadbala.find(item => item.planet === name);
    if (row && row.requiredVirupa > 0 && row.ratio < 1) spoilers.push('weak');
    result[name] = spoilers;
  }
  return result;
}

/**
 * The good vargas of the seven grahas in the four schemes, with the name of each count. The vargas are those of
 * Parāśara (BPHS 6), as in the Vimśopaka Bala.
 */
export function calculateVaisheshikamsa(chart: ShadbalaChartLike, reading: VaisheshikaReading = 'own', options: BalaOptions = DEFAULT_BALA_OPTIONS): VaisheshikaResult {
  const { arudhaSign: pada, kendraLords } = arudhaKendraLords(chart);
  const spoilers = vaisheshikaSpoilers(chart, options);
  const rows: VaisheshikaRow[] = [];
  for (const name of SCORE_PLANETS) {
    const longitude = (chart.planets ?? []).find(planet => planet.name === name)?.longitude;
    if (typeof longitude !== 'number') continue;
    const vargas: Record<string, VaisheshikaCell> = {};
    for (const key of ALL_VARGAS) {
      const signIndex = getVargaSignIndex(longitude, Number(key.slice(1)));
      const state = getDignity(name, signIndex);
      const dignity = state === 'exalted' ? 'exalted' : state === 'own' || state === 'moolatrikona' ? 'own' : null;
      const kendraLord = kendraLords.includes(SIGN_LORDS[signIndex] as ShadbalaPlanet);
      vargas[key] = { signIndex, sign: SIGN_ABBR[signIndex], dignity, kendraLord, good: dignity !== null || (reading === 'full' && kendraLord) };
    }
    const counts = {} as Record<SchemeKey, number>;
    const names = {} as Record<SchemeKey, VaisheshikaName | null>;
    for (const scheme of VAISHESHIKA_SCHEMES) {
      counts[scheme] = schemeVargas(scheme).filter(key => vargas[key].good).length;
      names[scheme] = vaisheshikaName(scheme, counts[scheme]);
    }
    rows.push({ planet: name, vargas, counts, names, spoilers: spoilers[name] ?? [] });
  }
  return { arudhaSign: pada, kendraLords, rows };
}

// --- The count of Jagannatha Hora -------------------------------------------------------------------------------------
// Jagannatha Hora reads the second half of 6.52 in several ways (its "Vaiseshikamsa Calculation Preferences"). The one
// below was found by reproducing the numbers of a video (3 December 1984, Howrah) and was then confirmed in the program
// by the user, setting by setting: swarudha is "AL lord of rasi chart (take kendra from him in vargas)", the horā is
// Parāśara's, and the kendra is not counted when the graha is debilitated in the division, in a śatru or adhiśatru sign
// there, or in a bad Śayanādi avasthā. It is not Parāśara's text: it is that program's reading of it.

/** The signs Jagannatha Hora's numbers ask for the nodes (0 = Aries): Rahu exalted in Gemini and at home in Aquarius, Ketu exalted in Sagittarius and at home in Scorpio. */
const NODE_GOOD_SIGNS: Record<string, { exalted: number; own: number }> = { Rahu: { exalted: 2, own: 10 }, Ketu: { exalted: 8, own: 7 } };
export const JHORA_GRAHAS = [...SCORE_PLANETS, 'Rahu', 'Ketu'] as const;

/** The Śayanādi states that cancel the kendra, as far as they were seen in Jagannatha Hora: Upaveśana does (Jupiter in the video's chart), Prakāśa and Nṛtyalipsā do not. The other nine were not seen. */
export const JHORA_BAD_AVASTHAS_KNOWN: readonly string[] = ['Upaveśana'];

/** The lord of the Āruḍha Lagna of the rāśi chart; null when the Āruḍha is not known. */
export function arudhaLagnaLord(chart: ShadbalaChartLike): ShadbalaPlanet | null {
  const { arudhaSign: pada } = arudhaKendraLords(chart);
  return pada === null ? null : SIGN_LORDS[pada - 1] as ShadbalaPlanet;
}

/**
 * The good vargas as Jagannatha Hora counts them with the settings above: a varga is good when the graha is in its
 * exaltation or own sign in it, or stands in a kendra from the lord of the Āruḍha Lagna in it; the kendra is not counted
 * in a varga where the graha is debilitated or in the sign of a śatru or adhiśatru (the compound relation, the temporary
 * part read in the varga itself), nor in any varga for a graha in a bad Śayanādi avasthā (`weakGrahas`). The nodes have
 * the signs above and only the avasthā takes their kendra away. The spoilers of 6.53 are left empty.
 */
export function calculateJhoraVaisheshikamsa(chart: ShadbalaChartLike, weakGrahas: readonly string[] = []): VaisheshikaResult {
  const { arudhaSign: pada, kendraLords } = arudhaKendraLords(chart);
  const lord = pada === null ? null : SIGN_LORDS[pada - 1];
  const longitudeOf = (name: string) => (chart.planets ?? []).find(planet => planet.name === name)?.longitude;
  const signsIn = (division: number): RasiSigns => Object.fromEntries(SCORE_PLANETS.flatMap(name => {
    const longitude = longitudeOf(name);
    return typeof longitude === 'number' ? [[name, getVargaSignIndex(longitude, division)]] : [];
  }));
  const rows: VaisheshikaRow[] = [];
  for (const name of JHORA_GRAHAS) {
    const longitude = longitudeOf(name);
    if (typeof longitude !== 'number') continue;
    const node = NODE_GOOD_SIGNS[name];
    const vargas: Record<string, VaisheshikaCell> = {};
    for (const key of ALL_VARGAS) {
      const division = Number(key.slice(1));
      const signs = signsIn(division);
      const signIndex = getVargaSignIndex(longitude, division);
      const state = node ? null : getDignity(name, signIndex);
      const dignity = node
        ? (signIndex === node.exalted ? 'exalted' : signIndex === node.own ? 'own' : null)
        : state === 'exalted' ? 'exalted' : state === 'own' || state === 'moolatrikona' ? 'own' : null;
      const lordSign = lord ? signs[lord as ShadbalaPlanet] : undefined;
      const kendra = typeof lordSign === 'number' && (signIndex - lordSign + 12) % 3 === 0;
      let cancelled: VaisheshikaCell['cancelled'];
      if (kendra && dignity === null) {
        if (weakGrahas.includes(name)) cancelled = 'avastha';
        else if (state === 'debilitated') cancelled = 'debilitated';
        else if (!node) {
          const relation = getCompoundRelation(name as ShadbalaPlanet, SIGN_LORDS[signIndex] as ShadbalaPlanet, signs);
          if (relation === 'shatru' || relation === 'adhishatru') cancelled = 'enemy';
        }
      }
      vargas[key] = { signIndex, sign: SIGN_ABBR[signIndex], dignity, kendraLord: kendra, cancelled, good: dignity !== null || (kendra && !cancelled) };
    }
    const counts = {} as Record<SchemeKey, number>;
    const names = {} as Record<SchemeKey, VaisheshikaName | null>;
    for (const scheme of VAISHESHIKA_SCHEMES) {
      counts[scheme] = schemeVargas(scheme).filter(key => vargas[key].good).length;
      names[scheme] = vaisheshikaName(scheme, counts[scheme]);
    }
    rows.push({ planet: name, vargas, counts, names, spoilers: [] });
  }
  return { arudhaSign: pada, kendraLords, rows };
}

/** The Śayanādi state of each graha (avasthas.ts); empty when the birth time or the sunrise is not known. */
export function sayanadiStates(chart: ChartData, birthDatetime: string): Record<string, string> {
  // The chart keeps the moment it was cast for; it serves when the page gives none.
  return Object.fromEntries(calculateAvasthas(chart, birthDatetime || chart.debug?.inputDateTime || '').filter(item => item.sayanadi !== '—').map(item => [item.planet, item.sayanadi]));
}

/** The grahas whose Śayanādi state is one of the bad ones. */
export function jhoraWeakGrahas(states: Record<string, string>, badStates: readonly string[] = JHORA_BAD_AVASTHAS_KNOWN): string[] {
  return Object.keys(states).filter(name => badStates.includes(states[name]));
}
