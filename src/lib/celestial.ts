// Spherical astronomy used by the planetary data: ecliptic → equatorial coordinates and the angle between two bodies.

import { normalizeDegrees } from './angles';

const RAD = Math.PI / 180;

/** Right ascension (0 to 360°) and declination of a point given by its ecliptic longitude and latitude, for the obliquity of the date. */
export function eclipticToEquatorial(longitude: number, latitude: number, obliquity: number): { rightAscension: number; declination: number } {
  const lon = longitude * RAD;
  const lat = latitude * RAD;
  const eps = obliquity * RAD;
  const rightAscension = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon)) / RAD;
  const declination = Math.asin(Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon)) / RAD;
  return { rightAscension: normalizeDegrees(rightAscension), declination };
}

/** The angle between two points given by ecliptic longitude and latitude, 0 to 180°. */
export function angularSeparation(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const a = lat1 * RAD;
  const b = lat2 * RAD;
  const cosine = Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos((lon1 - lon2) * RAD);
  return Math.acos(Math.min(1, Math.max(-1, cosine))) / RAD;
}
