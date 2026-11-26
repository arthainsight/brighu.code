import assert from 'node:assert/strict';
import { equalHora, janmaGhatis, kaalaLord, KAALA_ORDER, mahakalaHora, weekdayAt, WEEKDAY_LORDS } from './jhora';

// The birth JHora printed: 1 November 1963, 11:55:00, UTC+2, Kotka (longitude 26°54.9′E as its sidereal time and sunrise imply), a Friday (5).
const clock = (h: number, m = 0, s = 0) => h + m / 60 + s / 3600;
const birth = clock(11, 55);
const sunrise = clock(7, 42, 11);   // JHora: the centre of the Sun's disc on the horizon
const sunset = clock(16, 8, 52);
const friday = 5;

// --- Janma Ghatis: the ghatis from sunrise to birth, 24 minutes each; JHora prints 10.5341 ------------------------------------------------------------------------------------
assert.ok(Math.abs(janmaGhatis(birth, sunrise) - 10.5341) < 1e-3, `${janmaGhatis(birth, sunrise)}`);
assert.ok(Math.abs(janmaGhatis(birth, clock(7, 34, 15)) - 10.8646) < 1e-3, 'by the app\'s sunrise (the upper limb with refraction) it is another number');

// --- Hora Lord: equal hours from sunrise; Friday's first is Venus; 4 h 12 m 49 s on is the 5th, Jupiter (5 min sign Taurus) ----------------------------------------------------
const hora = equalHora(birth, sunrise, friday, true);
assert.equal(hora.number, 5);
assert.equal(hora.lord, 'Jupiter');
assert.equal(hora.fiveSign, 2, 'the five-minute part 12.8 min into the hora: Pisces + 2 = Taurus');
assert.equal(hora.fivePart, 3);
assert.equal(hora.fiveInferred, false);
assert.ok(Math.abs(hora.start - clock(11, 42, 11)) < 1e-9 && Math.abs(hora.end - clock(12, 42, 11)) < 1e-9, 'the hora runs 11:42:11 to 12:42:11');
// The order along the day: Venus, Mercury, Moon, Saturn, Jupiter, Mars, Sun.
assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(i => equalHora(sunrise + i + 0.1, sunrise, friday, true).lord), ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun']);
assert.equal(equalHora(sunrise + 7.5, sunrise, friday, true).lord, 'Venus', 'the 8th is Venus again');
assert.equal(equalHora(sunrise + 8.5, sunrise, friday, true).lord, 'Mercury');
// Weekday change: before sunrise it is the day before's (Thursday: first Jupiter).
assert.equal(weekdayAt(friday, clock(6), sunrise), 4);
assert.equal(weekdayAt(friday, birth, sunrise), 5);
assert.equal(equalHora(clock(6), sunrise - 24, 4, false).lord, 'Mars', 'Thursday, 22 h 18 min after its sunrise: the 23rd hora, Jupiter + 22 → Mars');
// Continuous over sunset: the 9th hora of Friday begins 08 h after the sunrise, whatever the sunset.
assert.equal(equalHora(sunrise + 8.2, sunrise, friday, false).lord, 'Mercury');

// --- Mahakala Hora: the same horas from 06:00 local mean time; JHora prints Mars (5 min sign Cancer) ----------------------------------------------------------------------------
const mahakala = mahakalaHora(birth, 2, 26.9146, friday);
assert.ok(Math.abs(mahakala.lmt - clock(11, 42, 39)) < 0.001, `local mean time ${mahakala.lmt}`);
assert.equal(mahakala.number, 6, '06:00 + 5 h is the sixth hora');
assert.equal(mahakala.lord, 'Mars');
assert.equal(mahakala.fiveSign, 4, 'Scorpio + 8 five-minute parts = Cancer');
assert.equal(mahakala.day, true);
// The weekday changes at 06:00 of local mean time: 04:47 LMT (05:00 at UTC+2) is the day before's.
assert.equal(mahakalaHora(clock(5), 2, 26.9146, friday).weekday, 4, 'Thursday');
assert.equal(mahakalaHora(clock(5), 2, 26.9146, friday).lord, 'Mars', '04:47 LMT, Thursday: the 23rd hora from 06:00 of Thursday: Jupiter + 22 → Mars');
// A clock before the zone's midnight in local mean time: 00:30 at UTC+2 and 26.9° E is 22:17 LMT of the day before.
assert.equal(mahakalaHora(0.5, 2, 26.9146, friday).weekday, 4);

// --- Kaala Lord: eight parts of the day, Rahu's the Rahu Kala of the almanacs on every weekday -------------------------------------------------------------------------------------------------
const rahuPart = [8, 2, 7, 5, 6, 4, 3];   // Sunday to Saturday
for (let weekday = 0; weekday < 7; weekday++) {
  const parts = Array.from({ length: 8 }, (_, i) => kaalaLord(6 + i * 1.5 + 0.1, 6, 18, weekday)!);
  assert.deepEqual(parts.map(p => p.part), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(parts[0].lord, WEEKDAY_LORDS[weekday], 'the first part is the weekday lord\'s');
  assert.equal(parts.find(p => p.lord === 'Rahu')!.part, rahuPart[weekday], `weekday ${weekday}: Rahu in the ${rahuPart[weekday]}th`);
  assert.equal(new Set(parts.map(p => p.lord)).size, 8);
}
assert.deepEqual([...KAALA_ORDER], ['Sun', 'Mars', 'Jupiter', 'Mercury', 'Venus', 'Saturn', 'Moon', 'Rahu']);
const kaala = kaalaLord(birth, sunrise, sunset, friday)!;
assert.equal(kaala.lord, 'Rahu');
assert.equal(kaala.part, 4);
// The part runs 10:52:11 to 11:55:31 and the birth is 31 seconds before its end.
assert.ok(Math.abs(kaala.start - clock(10, 52, 11)) < 0.001 && Math.abs(kaala.end - clock(11, 55, 31)) < 0.001);
assert.ok(Math.abs((kaala.end - birth) * 3600 - 31) < 2);
assert.equal(kaalaLord(clock(11, 56), sunrise, sunset, friday)!.lord, 'Sun', 'a minute later the next part, the Sun\'s');
assert.equal(kaalaLord(clock(17), sunrise, sunset, friday), null, 'the night: no rule');
assert.equal(kaalaLord(clock(6), sunrise, sunset, friday), null, 'before sunrise');
console.log('panchang jhora tests passed');
