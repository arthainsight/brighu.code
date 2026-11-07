import assert from 'node:assert/strict';
import { kpLords } from './kp';
import { NAKSHATRA_SIZE } from './nakshatras';

// The start of Aries is in Ashwini (Ketu): Ketu's own sub (7/120 of 13°20′ = 0°46′40″) and its own sub-sub come first.
let lords = kpLords(0);
assert.deepEqual([lords.signLord, lords.starLord, lords.subLord, lords.subSubLord], ['Mars', 'Ketu', 'Ketu', 'Ketu']);
// Ashwini's subs in the KP table: Ketu to 0°46′40″, Venus to 3°00′00″, Sun to 3°40′00″ (Sun has 6/120 of 13°20′ = 40′).
assert.equal(kpLords(0.7777).subLord, 'Ketu');
assert.equal(kpLords(0.7779).subLord, 'Venus');
assert.equal(kpLords(2.9999).subLord, 'Venus');
assert.equal(kpLords(3.0001).subLord, 'Sun');
assert.equal(kpLords(3.6665).subLord, 'Sun');
assert.equal(kpLords(3.6669).subLord, 'Moon');
// The sub-sub of Venus's sub in Ashwini begins with Venus: Venus (20/120 of 2°13′20″ = 22′13″).
lords = kpLords(0.7778 + 0.01);
assert.equal(lords.subLord, 'Venus');
assert.equal(lords.subSubLord, 'Venus');
// The star lord goes round the nine lords three times.
for (let nakshatra = 0; nakshatra < 27; nakshatra += 1) {
  const expected = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'][nakshatra % 9];
  assert.equal(kpLords(nakshatra * NAKSHATRA_SIZE + 0.001).starLord, expected);
  // The last sub of a nakshatra is the lord before the star lord in the cycle (Mercury for Ketu), and every sub is a lord.
  const last = kpLords((nakshatra + 1) * NAKSHATRA_SIZE - 0.0001).subLord;
  const cycle = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  assert.equal(last, cycle[(cycle.indexOf(expected) + 8) % 9]);
}
// A longitude is taken round the circle, and 360° is 0°.
assert.equal(kpLords(360.5).sign, 1);
assert.equal(kpLords(-0.5).sign, 12);
console.log('kp tests passed');
