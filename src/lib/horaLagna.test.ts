import assert from 'node:assert/strict';
import { avataraOfHour, AVATARA_PAIRS, clockText, directionOfSign, horaLagnas, separation } from './horaLagna';

const near = (actual: number, expected: number, tolerance: number, label: string) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} is not within ${tolerance} of ${expected}`);

// --- The direction follows the sign --------------------------------------------------------------------------------------------------------
for (const sign of [1, 2, 3, 7, 8, 9]) assert.equal(directionOfSign(sign), 'savya', `sign ${sign}`);
for (const sign of [4, 5, 6, 10, 11, 12]) assert.equal(directionOfSign(sign), 'apasavya', `sign ${sign}`);

// --- A Sun in a savya sign adds the arc: a sign an hour, the standard Hora Lagna ------------------------------------------------------------
const savya = horaLagnas(10, 200, 3);
assert.equal(savya.surya.direction, 'savya');
near(savya.surya.longitude, 100, 1e-9, 'Aries 10° + 3 hours = 3 signs on');
assert.equal(savya.surya.sign, 4);
assert.equal(savya.suryaIsStandard, true);
near(savya.standard.longitude, savya.surya.longitude, 1e-9, 'the standard one is the same');

// --- A Sun in an apasavya sign takes the arc away -------------------------------------------------------------------------------------------
const apasavya = horaLagnas(125, 200, 2.5);   // Leo 5°
assert.equal(apasavya.surya.direction, 'apasavya');
near(apasavya.surya.longitude, 50, 1e-9, 'Leo 5° − 75° = Taurus 20°');
assert.equal(apasavya.surya.sign, 2);
assert.equal(apasavya.suryaIsStandard, false);
near(apasavya.standard.longitude, 200, 1e-9, 'the standard one goes forward: 125° + 75°');
near(separation(apasavya.surya.longitude, apasavya.standard.longitude), 150, 1e-9, 'a gap of 150° between the two');

// --- The Lagna HL has its own direction, from the Lagna's sign ------------------------------------------------------------------------------
assert.equal(savya.lagna.direction, 'savya', 'Lagna in Libra (200°)');
near(savya.lagna.longitude, 290, 1e-9, 'Libra 20° + 3 hours = Capricorn 20°');
// The Lagna of this one is the same 200° (Libra, savya): 200° + 75° = 275°, Capricorn.
assert.equal(apasavya.lagna.sign, 10);
near(apasavya.lagna.longitude, 275, 1e-9, 'Lagna HL');
const reversedLagna = horaLagnas(10, 100, 1);  // Lagna in Cancer
assert.equal(reversedLagna.lagna.direction, 'apasavya');
near(reversedLagna.lagna.longitude, 70, 1e-9, 'Cancer 10° − 30° = Gemini 10°');

// --- Arcs of more than a day's worth wrap the circle; the sign of a negative result is still 1–12 -------------------------------------------
const wrap = horaLagnas(10, 20, 24);
near(wrap.surya.longitude, 10, 1e-9, '24 hours is two full circles');
const backwards = horaLagnas(100, 100, 5);  // Cancer 10°, − 150°
near(backwards.surya.longitude, 310, 1e-9, '100° − 150° = −50° = 310°');
assert.equal(backwards.surya.sign, 11);

// --- The birth hour and its avatāra -----------------------------------------------------------------------------------------------------------
assert.equal(AVATARA_PAIRS.length, 12);
assert.equal(AVATARA_PAIRS.flatMap(pair => pair.avatars).length, 24);
assert.equal(new Set(AVATARA_PAIRS.flatMap(pair => pair.avatars)).size, 24, 'twenty-four different avatāras');
assert.equal(avataraOfHour(6.2).avatar, 'Chatushana');
assert.equal(avataraOfHour(7.9).avatar, 'Varaha');
assert.equal(avataraOfHour(0.0).avatar, 'Krishna', 'exactly midnight');
assert.equal(avataraOfHour(0.0).sign, 10, 'Capricorn');
assert.equal(avataraOfHour(5.5).avatar, 'Hayagriva', 'just before sunrise');
assert.equal(avataraOfHour(5.5).sign, 12);
assert.equal(avataraOfHour(18.2).avatar, 'Mohini', 'just after sunset');
assert.equal(avataraOfHour(17.5).avatar, 'Dhanvantari', 'just before sunset');
assert.equal(avataraOfHour(21.5).avatar, 'Parasurama');
assert.equal(avataraOfHour(30.2).avatar, 'Chatushana', 'the clock wraps');
assert.equal(avataraOfHour(-0.5).avatar, 'Rama', 'half past eleven the evening before, the last hour of Sagittarius');
assert.deepEqual(avataraOfHour(6.5).window, [6, 7]);
// The day can start at the sunrise instead of 06:00.
assert.equal(avataraOfHour(5.5, 5.2).avatar, 'Chatushana', 'a 05:12 sunrise: 05:30 is the first hour of the day');
assert.equal(clockText(6.5), '06:30');
assert.equal(clockText(23.999), '00:00');
