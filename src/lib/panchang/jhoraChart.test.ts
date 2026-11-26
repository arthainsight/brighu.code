import assert from 'node:assert/strict';
import { calculateChart } from '../ephemeris';
import { calculatePanchang } from './index';

// The birth Jagannatha Hora printed (1 November 1963, 11:55:00, UTC+2, Kotka) against this program, with the place JHora's own times imply: latitude 60.4664°N and longitude 26.9146°E
// (the sidereal time of 14:22:32 and the sunrise and sunset fit 26°54.9′E; 26.9458° is the place of the town in other lists and puts the same numbers 7 seconds off).
async function main() {
  const chart = await calculateChart(1963, 11, 1, 11, 55, 0, 60.4664, 26.9146, 2, 'lahiri', 'mean', 0, 'true');
  const panchang = calculatePanchang(chart, '01.11.1963 11.55.00', 2, 'Lahiri');
  const jhora = panchang.jhora!;
  const seconds = (text: string) => { const [h, m, s] = text.split(':').map(Number); return h * 3600 + m * 60 + s; };
  assert.ok(jhora, 'the chart carries the sun times by the centre of the disc');

  // Sunrise and sunset: the centre of the disc on the horizon, JHora 07:42:11 and 16:08:52.
  assert.ok(Math.abs(seconds(jhora.sunrise) - seconds('07:42:11')) <= 6, `sunrise ${jhora.sunrise}`);
  assert.ok(Math.abs(seconds(jhora.sunset) - seconds('16:08:52')) <= 6, `sunset ${jhora.sunset}`);
  // The app's own sunrise and sunset (the upper limb with refraction) are not touched: they differ by about 8 minutes at each end.
  assert.ok(seconds(panchang.sunrise!) < seconds(jhora.sunrise) - 400);
  assert.ok(seconds(panchang.sunset!) > seconds(jhora.sunset) + 400);
  assert.equal(jhora.vedicWeekday, 'Friday · Venus');
  // Janma Ghatis 10.5341, Sidereal Time 14:22:32.
  assert.ok(Math.abs(jhora.janmaGhatis - 10.5341) < 0.005, `${jhora.janmaGhatis}`);
  assert.ok(Math.abs(seconds(jhora.siderealTime!) - seconds('14:22:32')) <= 3, `sidereal time ${jhora.siderealTime}`);
  // The Hora Lord: Jupiter (5 min sign Taurus); the Mahakala Hora: Mars (Cancer); the Kaala Lord: Rahu (and the Mahakala one Rahu).
  assert.equal(jhora.horaLord.lord, 'Jupiter');
  assert.equal(jhora.horaLord.fiveSign, 'Taurus');
  assert.equal(jhora.mahakalaHora.lord, 'Mars');
  assert.equal(jhora.mahakalaHora.fiveSign, 'Cancer');
  assert.equal(jhora.kaalaLord!.lord, 'Rahu');
  assert.equal(jhora.kaalaLord!.part, 4);
  assert.equal(jhora.kaalaLordMahakala!.lord, 'Rahu');
  // The app's own Hora (the unequal horas, day and night in twelfths) is a different field and stays Mars.
  assert.equal(panchang.hora, 'Mars');
  assert.equal(panchang.kala, 'Madhyāhna (11:03–12:48)', 'the app\'s own Kāla is untouched');

  // "% left": JHora 19.93, 5.99, 44.04 and 39.87. The tithi and karaṇa do not depend on the ayanāṁśa (0.04 and 0.09 off), the nakṣatra and the yoga do, and JHora's Lahiri is 55″ lower.
  assert.ok(Math.abs(panchang.left.tithi - 19.93) < 0.1);
  assert.ok(Math.abs(panchang.left.karana - 39.87) < 0.15);
  assert.ok(Math.abs(panchang.left.nakshatra - 5.99) < 0.25, `${panchang.left.nakshatra}`);
  assert.ok(Math.abs(panchang.left.yoga - 44.04) < 0.5, `${panchang.left.yoga}`);
  console.log('panchang jhora chart tests passed');
}
main().catch(error => { console.error(error); process.exit(1); });
