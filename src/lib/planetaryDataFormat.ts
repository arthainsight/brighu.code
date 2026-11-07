// How the planetary data are written in the table of the view.

/** A right ascension in degrees as hours, minutes and seconds: 15° = 1h. */
export function rightAscensionText(degrees: number): string {
  const totalSeconds = Math.round(((degrees % 360) + 360) % 360 / 15 * 3600) % 86400;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

/** An angle in degrees as signed degrees, minutes and seconds. */
export function signedAngleText(degrees: number): string {
  const sign = degrees < 0 ? '−' : '+';
  const totalSeconds = Math.round(Math.abs(degrees) * 3600);
  const d = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${sign}${d}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″`;
}

/** A compass point for an azimuth from the north through the east: N, NE … */
export function compassPoint(azimuth: number): string {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return points[Math.round((((azimuth % 360) + 360) % 360) / 45) % 8];
}
