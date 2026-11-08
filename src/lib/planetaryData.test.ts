import assert from 'node:assert/strict';
import { calculateChart } from './ephemeris';
import { eclipticToEquatorial } from './celestial';
import { sweBodyData, sweObliquity, SE_MOON } from './ephemerisAdapter';
import { chartBhavas, CUSP_CHALIT_SYSTEMS } from './bhavaChalit';

const close = (actual: number, expected: number, tolerance: number, message: string) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);

async function main() {
  // Kotka 13.10.1987 00:15 (UTC+2): the Sun is below the horizon at midnight, the Moon not far from the Lagna's side of the sky.
  const kotka = await calculateChart(1987, 10, 13, 0, 15, 0, 60.4667, 26.9458, 2, 'lahiri', 'mean');
  const sun = kotka.planets.find(planet => planet.name === 'Sun')!;
  const moon = kotka.planets.find(planet => planet.name === 'Moon')!;
  const rahu = kotka.planets.find(planet => planet.name === 'Rahu')!;
  const ketu = kotka.planets.find(planet => planet.name === 'Ketu')!;
  assert.ok(sun.data && moon.data && rahu.data && ketu.data, 'every body carries its data');
  assert.ok(sun.data!.altitude < -10, 'the Sun is below the horizon at midnight');
  assert.equal(sun.data!.elongation, undefined, 'the Sun has no elongation');
  close(sun.data!.distance!, 0.9976, 0.003, 'the Sun is near perihelion distance in October');
  close(sun.data!.declination, -7.5, 0.6, 'the Sun declination on 13 October is about −7.5°');
  assert.ok(moon.data!.elongation! >= 0 && moon.data!.elongation! <= 180);
  assert.equal(moon.data!.declination, moon.declination, 'the declination of the data is the one of Ayana Bala');

  // The magnitude and the disc (swe_pheno_ut): the Sun is the brightest and the biggest disc, about half a degree across; the nodes have neither.
  close(sun.data!.magnitude!, -26.7, 0.3, 'the magnitude of the Sun');
  close(sun.data!.diameter!, 1930, 40, 'the disc of the Sun in seconds of arc');
  assert.ok(moon.data!.diameter! > 1700 && moon.data!.diameter! < 2000, 'the disc of the Moon is about half a degree');
  assert.equal(rahu.data!.magnitude, undefined);
  assert.equal(ketu.data!.diameter, undefined);
  const venus = kotka.planets.find(planet => planet.name === 'Venus')!;
  const saturn = kotka.planets.find(planet => planet.name === 'Saturn')!;
  assert.ok(venus.data!.magnitude! < saturn.data!.magnitude!, 'Venus is brighter than Saturn (a smaller magnitude)');

  // The right ascension of the library agrees with the one of the formula (for the Moon, with its own latitude).
  const jd = kotka.debug!.julianDay;
  const raw = await sweBodyData(jd, SE_MOON, 60.4667, 26.9458);
  const formula = eclipticToEquatorial(raw.longitude, raw.latitude, await sweObliquity(jd));
  close(formula.rightAscension, raw.rightAscension, 0.01, 'RA by formula = RA by library');
  close(formula.declination, raw.declination, 0.01, 'dec by formula = dec by library');

  // Ketu is opposite Rahu: the right ascension is 180° away and the declination the opposite.
  close(Math.abs(rahu.data!.rightAscension - ketu.data!.rightAscension), 180, 1e-6, 'nodes 180° apart in RA');
  close(rahu.data!.declination, -ketu.data!.declination, 1e-6, 'nodes opposite in declination');
  assert.equal(rahu.data!.distance, undefined);

  // The house cusps: the 1st is the Lagna, the 10th the Midheaven in Placidus and Koch, and each system differs from the others.
  const cusps = kotka.houseCusps!;
  for (const system of CUSP_CHALIT_SYSTEMS) {
    assert.equal(cusps[system]!.length, 12, `${system} has twelve cusps`);
    close(cusps[system]![0], kotka.ascendant.longitude, 1e-6, `${system}: the 1st cusp is the Lagna`);
    close(cusps[system]![3], (kotka.midheaven! + 180) % 360, 1e-6, `${system}: the 4th cusp is the IC`);
    assert.ok(chartBhavas(kotka, system), `${system} gives bhavas`);
  }
  assert.notEqual(cusps.placidus![1].toFixed(3), cusps.koch![1].toFixed(3), 'Placidus and Koch differ');
  assert.notEqual(cusps.placidus![1].toFixed(3), cusps.campanus![1].toFixed(3), 'Placidus and Campanus differ');
  // Each system's cusps run round the zodiac in order.
  for (const system of CUSP_CHALIT_SYSTEMS) {
    const list = cusps[system]!;
    for (let i = 0; i < 12; i += 1) assert.ok(((list[(i + 1) % 12] - list[i] + 360) % 360) < 90, `${system}: cusp ${i + 1} to ${i + 2} is under 90°`);
    assert.ok(list.reduce((sum, c, i) => sum + ((list[(i + 1) % 12] - c + 360) % 360), 0) - 360 < 1e-6, `${system}: the cusps make one round`);
  }

  // Beyond the polar circle Placidus and Koch are not defined; the other systems still are.
  const north = await calculateChart(1987, 10, 13, 12, 0, 0, 70, 26, 2);
  assert.equal(north.houseCusps!.placidus, undefined);
  assert.equal(north.houseCusps!.koch, undefined);
  assert.equal(north.houseCusps!.regiomontanus!.length, 12);
  assert.equal(chartBhavas(north, 'placidus'), null);
  console.log('planetary data and cusp tests passed');
}
main().catch(error => { console.error(error); process.exit(1); });
