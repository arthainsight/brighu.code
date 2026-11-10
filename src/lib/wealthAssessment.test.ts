// The wealth assessment (wealthAssessment.ts): the horā by its definition (BPHS 7.5–6), the Moon from the Sun (Bṛhajjātaka 13.1), the relationships and spoilers of the dhana yoga pattern.
import assert from 'node:assert/strict';
import { assessWealth, dhanaYogas, horaOf, horaTable, relationship, sunMoonStructure, type TopicContext } from './wealthAssessment';
import { calcD2 } from './varga';
import { buildShadbalaRows } from './shadbala';
import { REFERENCE_CHART } from './shadbala.fixture';
import { SEVEN, type SevenGraha } from './topicCore';

// The horā is Leo or Cancer and nothing else, and it agrees with the D2 of the app at every degree.
for (let longitude = 0; longitude < 360; longitude += 0.5) {
  const sign = Math.floor(longitude / 30) + 1;
  const { horaSign } = horaOf(sign, longitude % 30);
  assert.equal(horaSign, calcD2(longitude) + 1, `horā at ${longitude}`);
  assert.ok(horaSign === 4 || horaSign === 5);
}
assert.deepEqual(horaOf(1, 0), { owner: 'sun', horaSign: 5 });   // Aries, first half: the Sun's
assert.deepEqual(horaOf(1, 20), { owner: 'moon', horaSign: 4 });
assert.deepEqual(horaOf(2, 0), { owner: 'moon', horaSign: 4 });  // Taurus, first half: the Moon's
assert.deepEqual(horaOf(2, 20), { owner: 'sun', horaSign: 5 });

const make = (ascendantSign: number, placed: Record<string, [number, number]>, ratio = 1.2): TopicContext => ({
  ascendantSign,
  ascendantLongitude: (ascendantSign - 1) * 30 + 5,
  ratio: Object.fromEntries(SEVEN.map(name => [name, ratio])) as Partial<Record<SevenGraha, number>>,
  planets: Object.entries(placed).map(([name, [sign, degree]]) => ({ name, sign, degree, longitude: (sign - 1) * 30 + degree })),
});
const base = { Sun: [1, 5], Moon: [1, 6], Mars: [1, 7], Mercury: [1, 8], Jupiter: [1, 9], Venus: [1, 10], Saturn: [1, 11] } as Record<string, [number, number]>;

// The verdicts of the horā: malefics in the Sun's horā of an odd sign help, in the Moon's horā of an odd sign hinder; benefics in the Moon's horā of an even sign help, in the Sun's horā of an even sign hinder; Mercury helps in either good place.
{
  const rows = horaTable(make(1, {
    Sun: [1, 3], Moon: [2, 3], Mars: [3, 20], Mercury: [4, 3], Jupiter: [4, 20], Venus: [2, 20], Saturn: [1, 20],
  }));
  const verdict = (name: string) => rows.find(row => row.name === name)?.verdict;
  assert.equal(verdict('Sun'), 'helps');      // Aries 3°: odd, the Sun's horā
  assert.equal(verdict('Moon'), 'helps');     // Taurus 3°: even, the Moon's horā
  assert.equal(verdict('Mars'), 'hinders');   // Gemini 20°: odd, the Moon's horā
}
{
  const rows = horaTable(make(1, { ...base, Mercury: [4, 3], Jupiter: [4, 20], Venus: [2, 20], Saturn: [1, 20] }));
  const verdict = (name: string) => rows.find(row => row.name === name)?.verdict;
  assert.equal(verdict('Mercury'), 'helps');  // Cancer 3°: even, first half, the Moon's horā
  assert.equal(verdict('Jupiter'), 'hinders'); // Cancer 20°: even, the Sun's horā
  assert.equal(verdict('Venus'), 'hinders');  // Taurus 20°: even, the Sun's horā
  assert.equal(verdict('Saturn'), 'hinders'); // Aries 20°: odd, the Moon's horā
}

// Step 1: the Moon counted from the Sun. Bṛhajjātaka 13.1.
{
  const at = (moonSign: number) => sunMoonStructure(make(1, { ...base, Sun: [1, 5], Moon: [moonSign, 5] }));
  assert.deepEqual([1, 4, 7, 10].map(sign => at(sign)?.kind), ['kendra', 'kendra', 'kendra', 'kendra']);
  assert.deepEqual([2, 5, 8, 11].map(sign => at(sign)?.kind), ['panaphara', 'panaphara', 'panaphara', 'panaphara']);
  assert.deepEqual([3, 6, 9, 12].map(sign => at(sign)?.kind), ['apoklima', 'apoklima', 'apoklima', 'apoklima']);
  assert.equal(at(6)?.house, 6);
  assert.equal(at(6)?.best, true);
  assert.equal(at(9)?.best, true);
  assert.equal(at(3)?.best, false);
}

// Relationships: exchange, conjunction, mutual aspect.
{
  const context = make(1, { ...base, Venus: [5, 10], Sun: [2, 5] }); // Venus in Leo, the Sun in Taurus: an exchange
  assert.equal(relationship(context, 'Venus', 'Sun').exchange, true);
  assert.equal(relationship(context, 'Venus', 'Mars').any, false);
  assert.equal(relationship(make(1, { ...base, Mars: [2, 1], Venus: [8, 1] }), 'Mars', 'Venus').mutualAspect, true); // the 7th
  assert.equal(relationship(context, 'Moon', 'Moon').same, true);
}

// The dhana yoga pattern for Aries: the 2nd lord Venus and the 5th lord Sun exchange; the 8th lord is Mars, the 12th Jupiter, the 6th Mercury.
{
  const clean = make(1, { Sun: [2, 5], Moon: [9, 5], Mars: [12, 5], Mercury: [9, 5], Jupiter: [3, 5], Venus: [5, 10], Saturn: [4, 5] });
  const yoga = dhanaYogas(clean).find(item => item.key === 'lord2lord5')!;
  assert.equal(yoga.formed, true);
  assert.deepEqual(yoga.how, ['exchange of signs']);
  assert.equal(yoga.status, 'present');
  // Mars (the 8th lord) in Leo with Venus spoils it …
  const spoiled = dhanaYogas(make(1, { Sun: [2, 5], Moon: [9, 5], Mars: [5, 5], Mercury: [9, 5], Jupiter: [3, 5], Venus: [5, 10], Saturn: [4, 5] })).find(item => item.key === 'lord2lord5')!;
  assert.equal(spoiled.status, 'broken');
  assert.deepEqual(spoiled.spoilers, [{ house: 8, graha: 'Mars' }]);
  // … Jupiter (the 12th lord) in Leo only lowers it.
  const jupiter = dhanaYogas(make(1, { Sun: [2, 5], Moon: [9, 5], Mars: [12, 5], Mercury: [9, 5], Jupiter: [5, 5], Venus: [5, 10], Saturn: [4, 5] })).find(item => item.key === 'lord2lord5')!;
  assert.equal(jupiter.status, 'diluted');
  assert.equal(dhanaYogas(clean).find(item => item.key === 'lord5in5lord9in9')?.formed, false);
}

// The reference chart end to end: Cancer rising, the Moon 10th from the Sun, nothing missing.
{
  const ratio: Partial<Record<SevenGraha, number>> = {};
  for (const row of buildShadbalaRows(REFERENCE_CHART)) if ((SEVEN as readonly string[]).includes(row.planet)) ratio[row.planet as SevenGraha] = row.ratio;
  const context: TopicContext = {
    ascendantSign: REFERENCE_CHART.ascendant!.sign!, ascendantLongitude: REFERENCE_CHART.ascendant!.longitude, ratio,
    planets: REFERENCE_CHART.planets!.map(planet => ({ name: planet.name, sign: planet.sign!, degree: planet.longitude! % 30, longitude: planet.longitude! })),
  };
  const result = assessWealth(context);
  assert.equal(result.step1?.house, 10);
  assert.equal(result.step1?.kind, 'kendra');
  assert.equal(result.hora.length, 7);
  assert.equal(result.hora.find(row => row.name === 'Mercury')?.verdict, 'neutral'); // Libra 18.7°: odd, the Moon's horā (not the good place for Mercury)
  assert.equal(result.hora.find(row => row.name === 'Venus')?.owner, 'sun'); // Libra 8.9°: odd, first half
  assert.equal(result.houses[2].lord, 'Sun');
  assert.equal(result.houses[11].lord, 'Venus');
  assert.equal(result.lagnaLord.lord, 'Moon');
  assert.ok(result.moon);
  assert.ok(result.money.every(item => item.vargas.length === 5));
  assert.equal(result.tally.supports + result.tally.hinders + result.tally.open, 15);
}
