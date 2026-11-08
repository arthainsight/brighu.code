import assert from 'node:assert/strict';
import fixture from './fixtures/pyjhoraMatching.json';
import { ashtakoota, countSigns, VEDHA_PAIRS } from './ashtakoota';
import { NAKSHATRA_SIZE } from './nakshatras';

// The Ashtakoota against PyJHora (scripts/pyjhora_matching.py): every pair of Moon star and quarter, 27 × 4 against 27 × 4 — 11,664 pairs. Where PyJHora's
// own tables are wrong, or are another school's, the difference is pinned here exactly, so that it is known and does not grow.

const data = fixture as Record<string, string>;
const longitude = (star: number, pada: number) => (star - 1) * NAKSHATRA_SIZE + ((pada - 1) * NAKSHATRA_SIZE) / 4 + NAKSHATRA_SIZE / 8;
const theirs = (field: string, index: number): number => {
  const char = data[field][index];
  return char === '0' || char === '1' ? Number(char) : (char.charCodeAt(0) - 97) / 2;
};

const differences: Record<string, number> = {};
const note = (field: string) => { differences[field] = (differences[field] ?? 0) + 1; };
let index = 0;
let vedhaOnlyTheirs = 0;
const classical = new Set(VEDHA_PAIRS.map(([a, b]) => `${a}-${b}`).concat(VEDHA_PAIRS.map(([a, b]) => `${b}-${a}`)));
for (let bn = 1; bn <= 27; bn += 1) for (let bp = 1; bp <= 4; bp += 1) for (let gn = 1; gn <= 27; gn += 1) for (let gp = 1; gp <= 4; gp += 1) {
  // The Gaṇa is compared by the common table (PyJHora's); the default of the app is the table of Muhūrta Cintāmaṇi, which differs in four cells.
  const result = ashtakoota(longitude(bn, bp), longitude(gn, gp), { ganaTable: 'common' });
  const points = Object.fromEntries(result.kutas.map(kuta => [kuta.key, kuta.points]));
  const check = (field: string, mine: number, expected: number) => { if (Math.abs(mine - expected) > 1e-9) note(field); };

  // Where the app and PyJHora keep to the same tables, every pair agrees.
  check('yoni', points.yoni, theirs('yoni', index));
  check('maitri', points.maitri, theirs('maitri', index));
  check('gana', points.gana, theirs('gana', index));
  check('nadi', points.nadi, theirs('nadi', index));
  check('mahendra', +result.extras.mahendra, theirs('mahendra', index));
  check('rajju', +result.extras.rajju, theirs('rajju', index));
  check('stri_dirgha', +result.extras.striDirgha, theirs('stri_dirgha', index));

  // Vaśya: the halves of Sagittarius and Capricorn are told from the star and the quarter by PyJHora (a rough rule it marks as a TODO), from the degree by the app.
  if (result.boy.rasi !== 9 && result.boy.rasi !== 10 && result.girl.rasi !== 9 && result.girl.rasi !== 10) check('vashya', points.vashya, theirs('vashya', index));

  // Bhakoot: the 6/8, 5/9 and 2/12 relations are symmetric. PyJHora's table is not: its cell for a girl in Aquarius and a boy in Cancer says 7 where Cancer–Aquarius is 6/8 (and its own cell the other way round says 0).
  if (Math.abs(points.bhakoot - theirs('bhakoot', index)) > 1e-9) {
    assert.equal(result.girl.rasi, 11, 'the only difference is in the row of Aquarius');
    assert.equal(result.boy.rasi, 4, '… and the column of Cancer');
    assert.equal(countSigns(result.girl.rasi, result.boy.rasi), 6, 'a 6/8 relation');
    note('bhakoot');
  }

  // Tārā: PyJHora gives 1.5 for the counts whose remainder is 3, 5 or 7 (Vipat, Pratyak, Vadha) and nothing for the others, which is the reverse of the rule everywhere else.
  assert.ok(Math.abs(points.tara - (3 - theirs('tara', index))) < 1e-9, `tara is the reverse at ${bn}.${bp}/${gn}.${gp}`);

  // Varṇa: PyJHora puts the earth signs among the Śūdra and the air signs among the Vaiśya; the common table has them the other way round. The two agree where the signs are water or fire.
  const plainSigns = [1, 4, 5, 8, 9, 12];
  if (plainSigns.includes(result.boy.rasi) && plainSigns.includes(result.girl.rasi)) check('varna_plain', points.varna, theirs('varna', index));
  else if (Math.abs(points.varna - theirs('varna', index)) > 1e-9) note('varna');

  // Vedha: the app has the fourteen pairs of the tradition. PyJHora fails every pair whose numbers add up to 19, 28 or 37, which has the fourteen in it and thirty more.
  const pair = `${bn}-${gn}`;
  const mineFails = !result.extras.vedha;
  const theirsFails = theirs('vedha', index) === 0;
  assert.equal(mineFails, classical.has(pair), 'the app fails exactly the fourteen pairs');
  if (mineFails) assert.ok(theirsFails, 'every pair of the tradition fails in PyJHora too');
  if (theirsFails && !mineFails) { vedhaOnlyTheirs += 1; assert.ok([19, 28, 37].includes(bn + gn), 'PyJHora’s extra pairs are those with the sums 19, 28, 37'); }
  index += 1;
}

assert.equal(index, 11664);
for (const field of ['yoni', 'maitri', 'gana', 'nadi', 'mahendra', 'rajju', 'stri_dirgha', 'vashya', 'varna_plain']) assert.equal(differences[field] ?? 0, 0, `${field} agrees with PyJHora on every pair`);
// Cancer holds nine quarters of stars and Aquarius nine: 9 × 9 pairs of quarters.
assert.equal(differences.bhakoot, 81, 'the one cell of the table of PyJHora');
assert.ok(differences.varna > 0, 'the earth and air signs are where the varṇa differs');
assert.equal(vedhaOnlyTheirs > 0, true);

console.log('PyJHora matching tests passed');
