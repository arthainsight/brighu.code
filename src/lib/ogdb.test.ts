import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { niceName, occupationGroups, occupationLabel, parseCsv, parseOffset, personChartData, readOgdb, readZipText } from './ogdb';

const HEADER = 'OGID;OCCU;GQID;MUID;FNAME;GNAME;DATE;TZO;DATE-UT;PLACE;C1;C2;C3;CY;LG;LAT;GEOID';
const csv = (...lines: string[]) => [HEADER, ...lines].join('\n');

// --- The CSV ---------------------------------------------------------------------------------------------------------------------
assert.deepEqual(parseCsv('a;b;"c;d"\n1;2;"x ""y"""\r\n'), [['a', 'b', 'c;d'], ['1', '2', 'x "y"']]);
assert.deepEqual(parseCsv('a;;c\n\n'), [['a', '', 'c']]);

assert.equal(parseOffset('+00:09:21'), 9 / 60 + 21 / 3600);
assert.equal(parseOffset('-06:00'), -6);
assert.equal(parseOffset(''), null);
assert.equal(niceName('ANDRE-MORISSET'), 'Andre-Morisset');
assert.equal(niceName('Pierre'), 'Pierre');
assert.equal(niceName("O'BRIEN"), "O'Brien");

// --- A person with a place of its own and a zone from the two clocks ---------------------------------------------------------------------
const data = readOgdb(csv(
  'andrex-1907-01-23;actor;A5-20;;ANDREX;;1907-01-23 21:00;+00:09:21;1907-01-23 20:50:40;Marseille;;13;;FR;5.38107;43.29695;2995469',
  'aaron-harold-1921-06-21;military-personnel;D10-1;;Aaron;Harold;1921-06-21 07:00;-06:00;1921-06-21 13:00;Kokomo;;IN;;US;-86.13333;40.48333;',
));
assert.equal(data.people.length, 2);
const andrex = data.people[0];
assert.equal(andrex.name, 'Andrex');
assert.equal(andrex.birth, '23.01.1907 21.00.00');
assert.ok(Math.abs(andrex.tz - 0.155556) < 1e-5, 'the zone is the difference of the two clocks: 9 minutes 20 seconds (Paris time)');
assert.equal(andrex.approx, false);
assert.equal(data.people[1].tz, -6);
assert.equal(data.people[1].lng, -86.13333, 'a row outside France is not turned');
assert.deepEqual(data.people[1].occupations, ['military-personnel']);

// --- The Gauquelin rows of France with the longitude turned round --------------------------------------------------------------------
const nice = 'Nice;;06;;FR';
const flip = readOgdb(csv(
  'a-1;cyclist;;;A;One;1900-01-01 12:00;;1900-01-01 11:00;Nice;;06;;FR;7.26608;43.70313;1',               // looked up: the reference
  'b-1;cyclist;;;B;Two;1920-05-05 12:00;;1920-05-05 10:00;NICE;;06;;FR;-7.26;43.7;',                       // the same place, turned: turned back
  'c-1;cyclist;;;C;Three;1930-05-05 12:00;;1930-05-05 10:00;ParisUnknown;;75;;FR;-2.34;48.86;',            // no reference: a French row of the books is turned
  'd-1;cyclist;;M5-1;D;Four;1930-05-05 12:00;;1930-05-05 10:00;ParisUnknown2;;75;;FR;2.34;48.86;',         // a row with a MUID is not
  'e-1;cyclist;;;E;Five;1940-05-05 12:00;;1940-05-05 10:00;Brussels;;BR;;BE;4.35;50.85;',                  // another country is not
));
assert.equal(nice.length > 0, true);
const byId = Object.fromEntries(flip.people.map(person => [person.id, person]));
assert.equal(byId['a-1'].lng, 7.26608);
assert.equal(byId['b-1'].lng, 7.26, 'the same place turned back');
assert.equal(byId['b-1'].approx, true);
assert.equal(byId['c-1'].lng, 2.34, 'a French row of the books with no place to check is turned');
assert.equal(byId['d-1'].lng, 2.34);
assert.equal(byId['d-1'].approx, false);
assert.equal(byId['e-1'].lng, 4.35);
assert.equal(flip.stats.approx, 2);

// --- Rows that cannot be used are counted -------------------------------------------------------------------------------------------------
const rough = readOgdb(csv(
  'n-1;painter;;;N;One;;;;Paris;;75;;FR;2.35;48.85;',                                                         // no date
  'n-2;painter;;;N;Two;1900-01-01 12:00;;;Paris;;75;;FR;2.35;48.85;',                                        // a clock but no zone
  'n-3;painter;;;N;Three;1900-01-01 12:00;;1900-01-01 11:00;Nowhere;;;;FR;;;',                               // no place
  'n-4;painter;;;N;Four;;;1900-01-01 22:00;Milano;;MI;;IT;9.19;45.46;1',                                      // only the UT: kept, in UT
  'n-5;painter;;;N;Five;1900-01-01 12:00;;1900-01-01 11:00;Rome;;;;IT;;;',                                   // no coordinates but a place that was looked up below
  'n-6;painter;;;N;Six;1901-01-01 12:00;;1901-01-01 11:00;Rome;;;;IT;12.5;41.9;1',
));
assert.deepEqual({ ...rough.stats }, { rows: 6, people: 3, noDate: 1, noZone: 1, noPlace: 1, approx: 1 });
assert.equal(rough.people.find(person => person.id === 'n-4')!.tz, 0);
assert.equal(rough.people.find(person => person.id === 'n-4')!.birth, '01.01.1900 22.00.00');
const rome = rough.people.find(person => person.id === 'n-5')!;
assert.equal(rome.lng, 12.5, 'a place without coordinates takes those of the same place that has them');
assert.equal(rome.approx, true);
assert.throws(() => readOgdb('a;b\n1;2'), /Not an Open Gauquelin/);

// --- Groups and the chart of a person ------------------------------------------------------------------------------------------------------------
const groups = occupationGroups(readOgdb(csv(
  'p-1;novelist+poet;;;P;One;1900-01-01 12:00;;1900-01-01 11:00;X;;;;FR;1;1;1',
  'p-2;poet;;;P;Two;1900-01-01 12:00;;1900-01-01 11:00;X;;;;FR;1;1;1',
  'p-3;painter;;;P;Three;1900-01-01 12:00;;1900-01-01 11:00;X;;;;FR;1;1;1',
)).people);
assert.deepEqual(groups, [{ occupation: 'poet', count: 2 }, { occupation: 'novelist', count: 1 }, { occupation: 'painter', count: 1 }]);
assert.equal(occupationLabel('rugby-union-player'), 'Rugby union player');
const saved = personChartData(andrex, '2026-11-19');
assert.equal(saved.birthDatetime, '23.01.1907 21.00.00');
assert.equal(saved.manualLng, '5.38107');
assert.equal(saved.ianaTimezone, '');
assert.equal(saved.tzOverride, String(andrex.tz));
assert.equal(saved.city, 'Marseille, FR');

// --- The zip as the site sends it ---------------------------------------------------------------------------------------------------------------------
function makeZip(name: string, content: string, deflate: boolean): ArrayBuffer {
  const raw = Buffer.from(content, 'utf-8');
  const packed = deflate ? deflateRawSync(raw) : raw;
  const nameBytes = Buffer.from(name);
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(deflate ? 8 : 0, 8); local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(nameBytes.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(deflate ? 8 : 0, 10); central.writeUInt32LE(packed.length, 20); central.writeUInt32LE(raw.length, 24); central.writeUInt16LE(nameBytes.length, 28); central.writeUInt32LE(0, 42);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
  const body = Buffer.concat([local, nameBytes, packed]);
  end.writeUInt32LE(central.length + nameBytes.length, 12); end.writeUInt32LE(body.length, 16);
  const all = Buffer.concat([body, central, nameBytes, end]);
  return all.buffer.slice(all.byteOffset, all.byteOffset + all.length) as ArrayBuffer;
}
async function main() {
  const text = csv('andrex-1907-01-23;actor;A5-20;;ANDREX;;1907-01-23 21:00;+00:09:21;1907-01-23 20:50:40;Marseille;;13;;FR;5.38107;43.29695;2995469');
  assert.equal(await readZipText(makeZip('ogdb-time.csv', text, true)), text);
  assert.equal(await readZipText(makeZip('ogdb-time.csv', text, false)), text);
  await assert.rejects(() => readZipText(new ArrayBuffer(64)), /Not a zip/);
}
main().catch(error => { console.error(error); process.exit(1); });
