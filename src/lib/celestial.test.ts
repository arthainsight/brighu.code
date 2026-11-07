import assert from 'node:assert/strict';
import { angularSeparation, eclipticToEquatorial } from './celestial';
import { compassPoint, rightAscensionText, signedAngleText } from './planetaryDataFormat';

const close = (actual: number, expected: number, tolerance: number, message: string) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);

// The equinox and the solstices, for the obliquity 23.4393°.
let point = eclipticToEquatorial(0, 0, 23.4393);
close(point.rightAscension, 0, 1e-9, 'RA at 0° Aries'); close(point.declination, 0, 1e-9, 'dec at 0° Aries');
point = eclipticToEquatorial(90, 0, 23.4393);
close(point.rightAscension, 90, 1e-9, 'RA at the summer solstice'); close(point.declination, 23.4393, 1e-9, 'dec at the summer solstice');
point = eclipticToEquatorial(180, 0, 23.4393);
close(point.rightAscension, 180, 1e-9, 'RA at 0° Libra');
point = eclipticToEquatorial(270, 0, 23.4393);
close(point.declination, -23.4393, 1e-9, 'dec at the winter solstice');
// The north pole of the ecliptic is at RA 18h, dec 90° − ε.
point = eclipticToEquatorial(0, 90, 23.4393);
close(point.declination, 90 - 23.4393, 1e-9, 'dec of the pole of the ecliptic'); close(point.rightAscension, 270, 1e-9, 'RA of the pole of the ecliptic');

close(angularSeparation(10, 0, 100, 0), 90, 1e-9, 'a quarter circle'); close(angularSeparation(350, 0, 10, 0), 20, 1e-9, 'across 0°');
close(angularSeparation(0, 0, 180, 0), 180, 1e-9, 'opposition'); close(angularSeparation(40, 5, 40, 5), 0, 1e-9, 'the same point');

assert.equal(rightAscensionText(0), '0h 00m 00s');
assert.equal(rightAscensionText(15), '1h 00m 00s');
assert.equal(rightAscensionText(359.9999999), '0h 00m 00s', 'rounds round the circle');
assert.equal(signedAngleText(-23.5), '−23°30′00″');
assert.equal(signedAngleText(0.5), '+0°30′00″');
assert.equal(compassPoint(0), 'N'); assert.equal(compassPoint(359), 'N'); assert.equal(compassPoint(90), 'E'); assert.equal(compassPoint(200), 'S');
console.log('celestial tests passed');
