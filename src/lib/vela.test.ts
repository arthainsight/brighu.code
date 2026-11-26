import assert from 'node:assert/strict';
import { FIXED_VELA_HOURS, GUNA_CYCLE, VELA_PARTS, VELA_UNCONFIRMED, velaAt, velaGuna, velaOfBirth, velaParts, velaSkyOfChart, vedicDayOf, type VelaDay, type VelaSky } from './vela';

const letter = (guna: string) => guna[0];
const row = (weekday: number) => Array.from({ length: VELA_PARTS }, (_, i) => letter(velaGuna(weekday, i + 1))).join('');

// --- The cycle: 16 to a weekday, Tamas first on Sunday, unbroken through all of them -----------------------------------------------------------------------
assert.deepEqual([...GUNA_CYCLE], ['Tamas', 'Sattva', 'Rajas']);
// The table derived from the rule in docs/jataka-parijata-vela-sources.md (segments 1–8 of the day and 9–16 of the night).
const table: Record<number, string> = {
  0: 'TSRTSRTS' + 'RTSRTSRT', 1: 'SRTSRTSR' + 'TSRTSRTS', 2: 'RTSRTSRT' + 'SRTSRTSR', 3: 'TSRTSRTS' + 'RTSRTSRT',
  4: 'SRTSRTSR' + 'TSRTSRTS', 5: 'RTSRTSRT' + 'SRTSRTSR', 6: 'TSRTSRTS' + 'RTSRTSRT',
};
for (let weekday = 0; weekday < 7; weekday++) assert.equal(row(weekday), table[weekday], `weekday ${weekday}`);
// The first Velas of Sunday to Saturday are the seven words of the verse, Tamas Sattva Rajas Tamas Sattva Rajas Tamas, and each day ends as it begins (Sastri's note).
assert.equal([0, 1, 2, 3, 4, 5, 6].map(day => letter(velaGuna(day, 1))).join(''), 'TSRTSRT');
for (let weekday = 0; weekday < 7; weekday++) assert.equal(velaGuna(weekday, 1), velaGuna(weekday, 16), `the last of weekday ${weekday} is as its first`);
// Unbroken: the Vela after the last of one weekday is the first of the next in the cycle.
for (let weekday = 0; weekday < 6; weekday++) {
  const next = GUNA_CYCLE[(GUNA_CYCLE.indexOf(velaGuna(weekday, 16)) + 1) % 3];
  assert.equal(velaGuna(weekday + 1, 1), next, `after weekday ${weekday}`);
}
assert.ok(VELA_UNCONFIRMED.length >= 4, 'the unconfirmed points are listed');

// --- A day of 06:00 to 18:00 and a night to 06:00: parts of an hour and a half, or of 1½ h each by day and by night ---------------------------------------------
const sunday: VelaDay = { weekday: 0, start: 6, sunset: 18, end: 30 };
const fixed = velaParts(sunday, 'fixed');
assert.equal(fixed.length, 16);
assert.deepEqual(fixed.map(part => part.end - part.start), Array(16).fill(1.5), 'fixed: an hour and a half each, 16 to the 24 hours');
assert.equal(fixed[0].start, 6);
assert.equal(fixed[15].end, 30);
assert.equal(fixed[7].night, false);
assert.equal(fixed[8].night, true, 'the ninth begins at 18:00');
const even = velaParts(sunday, 'proportional');
assert.deepEqual(even.map(part => part.end - part.start), Array(16).fill(1.5), 'proportional with a day and a night of 12 hours is the same');
// The parts run into one another without a gap.
for (const parts of [fixed, even]) for (let i = 1; i < 16; i++) assert.equal(parts[i].start, parts[i - 1].end);

// --- The birth in a part: at its start, in its middle, at its end ----------------------------------------------------------------------------------------------------
for (const method of ['fixed', 'proportional'] as const) {
  const atStart = velaAt(9, sunday, method)!;                 // 09:00 is the start of the 3rd half-yama
  assert.equal(atStart.part.segment, 3);
  assert.equal(atStart.elapsed, 0);
  assert.equal(atStart.fraction, 0);
  assert.equal(atStart.part.guna, 'Rajas', 'Sunday: Tamas, Sattva, Rajas');
  const middle = velaAt(9.75, sunday, method)!;
  assert.equal(middle.part.segment, 3);
  assert.equal(middle.fraction, 0.5);
  const last = velaAt(10.5 - 1e-9, sunday, method)!;          // the last instant of the 3rd
  assert.equal(last.part.segment, 3);
  assert.ok(last.fraction > 0.999999);
  const next = velaAt(10.5, sunday, method)!;                 // 10:30 is the 4th, which begins there
  assert.equal(next.part.segment, 4);
  assert.equal(next.part.guna, 'Tamas');
}
assert.equal(velaAt(5, sunday, 'fixed'), null, 'before the day');
assert.equal(velaAt(30, sunday, 'fixed'), null, 'the end of the day belongs to the next');

// --- The weekday changes at sunrise: a birth just before it is in the last half-yama of the day before -------------------------------------------------------
const sky = (birth: number, weekday: number): VelaSky => ({ weekday, birth, sunrise: 6, sunset: 18, nextSunrise: 30, previousSunrise: -18, previousSunset: -6 });
const mondayDawn = velaOfBirth(sky(5.9, 1));                  // Monday the calendar date, before sunrise: Sunday's night
assert.equal(vedicDayOf(sky(5.9, 1)).weekday, 0);
for (const result of mondayDawn) {
  assert.equal(result.part.segment, 16, `${result.method}: the last half-yama of Sunday`);
  assert.equal(result.part.guna, 'Tamas', 'Sunday ends as it begins');
}
const mondayRise = velaOfBirth(sky(6, 1));                    // at sunrise it is Monday's first: Sattva
assert.equal(vedicDayOf(sky(6, 1)).weekday, 1);
for (const result of mondayRise) {
  assert.equal(result.part.segment, 1);
  assert.equal(result.part.guna, 'Sattva');
  assert.equal(result.elapsed, 0, 'exactly at the start');
}
// Saturday into Sunday: a birth before sunrise on Sunday is Saturday's.
assert.equal(vedicDayOf(sky(3, 0)).weekday, 6);
assert.equal(velaOfBirth(sky(3, 0))[0].part.guna, velaGuna(6, velaOfBirth(sky(3, 0))[0].part.segment));
// The night belongs to the weekday of its evening: 23:00 on a Monday is Monday's 15th (fixed) or 11th (proportional) half-yama.
const lateMonday = velaOfBirth(sky(23, 1));
assert.equal(lateMonday.find(result => result.method === 'fixed')!.part.segment, 12, 'the fixed parts from 06:00: (23-6)/1.5 = 11.33 → the 12th');
assert.equal(lateMonday.find(result => result.method === 'proportional')!.part.segment, 12, 'the night from 18:00 in eighths of 1.5 h: (23-18)/1.5 = 3.33 → the 4th of the night, the 12th');

// --- The sunrise and sunset vary through the year: the proportional parts follow them, the fixed ones do not --------------------------------------------------
const summerDay: VelaDay = { weekday: 3, start: 4, sunset: 19.5, end: 28.5 };       // a day of 15½ h and a night of 9 h
const winterDay: VelaDay = { weekday: 3, start: 8.5, sunset: 16, end: 32.5 };       // a day of 7½ h and a night of 16½ h
const summer = velaParts(summerDay, 'proportional');
assert.ok(Math.abs((summer[0].end - summer[0].start) - 15.5 / 8) < 1e-12, 'a day part of 1 h 56 min in summer');
assert.ok(Math.abs((summer[8].end - summer[8].start) - 9 / 8) < 1e-12, 'a night part of 1 h 8 min');
const winter = velaParts(winterDay, 'proportional');
assert.ok(Math.abs((winter[0].end - winter[0].start) - 7.5 / 8) < 1e-12, 'a day part of 56 min in winter');
assert.ok(Math.abs((winter[8].end - winter[8].start) - 16.5 / 8) < 1e-12, 'a night part of 2 h 3 min');
const fixedWinter = velaParts(winterDay, 'fixed');
assert.equal(fixedWinter[0].end - fixedWinter[0].start, FIXED_VELA_HOURS);
assert.equal(fixedWinter[15].end, 32.5, 'the last fixed part is made to end with the day: the 16 parts of an hour and a half run to 32.5 here too');
// The two methods can give another Vela for the same moment, which the page shows side by side: 09:00 on a summer Wednesday.
const wednesday = velaOfBirth({ weekday: 3, birth: 9, sunrise: 4, sunset: 19.5, nextSunrise: 28.5, previousSunrise: -20, previousSunset: -4.5 });
assert.equal(wednesday.length, 2);
assert.equal(wednesday[0].part.segment, 4, 'fixed: (9-4)/1.5 = 3.33');
assert.equal(wednesday[1].part.segment, 3, 'proportional: (9-4)/(15.5/8) = 2.58');
assert.notEqual(wednesday[0].part.guna, wednesday[1].part.guna, 'Wednesday Tamas Sattva Rajas Tamas: the 4th is Tamas, the 3rd Rajas');

// --- From a chart: the birth moment of the chart and its sunrises and sunsets ------------------------------------------------------------------------------
const fromChart = velaSkyOfChart({
  inputDateTime: '2026-11-23 05:30:00',   // a Monday
  sunriseLocalHours: 7.5, sunsetLocalHours: 15.5, nextSunriseLocalHours: 31.55, previousSunriseLocalHours: -16.45, previousSunsetLocalHours: -8.55,
});
assert.equal(fromChart!.sky!.weekday, 1, '23 November 2026 is a Monday');
assert.equal(fromChart!.sky!.birth, 5.5);
const beforeSunrise = velaOfBirth(fromChart!.sky!);
assert.equal(vedicDayOf(fromChart!.sky!).weekday, 0, 'before the sunrise of 07:30 it is Sunday\'s');
assert.ok(beforeSunrise.every(result => result.part.segment >= 15), 'the end of Sunday\'s night');
assert.equal(velaSkyOfChart({ inputDateTime: '2026-11-23 05:30:00' })!.sky, null, 'without sunrise and sunset there is no sky');
assert.equal(velaSkyOfChart({}), null);
assert.equal(velaSkyOfChart(undefined), null);

console.log('vela tests passed');
