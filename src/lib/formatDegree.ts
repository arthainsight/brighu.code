export type DegreePrecision = 'off' | 'degree' | 'minute' | 'second';

export function formatDegree(value: number, precision: DegreePrecision): string {
  const d = Math.floor(value);
  if (precision === 'degree') return `${d}°`;
  const minFloat = (value - d) * 60;
  const m = Math.floor(minFloat);
  if (precision === 'minute') return `${d}°${m}'`;
  const s = Math.round((minFloat - m) * 60);
  return `${d}°${m}'${s}"`;
}

/**
 * The label of a mark on a chart (a special lagna, an upagraha, an Āruḍha pada): its name, and its degree in the sign when the chart shows degrees.
 * Marks without a place of their own (the Bhṛgu Pada progressions: longitude 0, degree 0) stay a name.
 */
export function markLabel(mark: { name: string; degree: number; longitude: number }, precision: DegreePrecision): string {
  if (precision === 'off' || (mark.longitude === 0 && mark.degree === 0)) return mark.name;
  return `${mark.name} ${formatDegree(mark.degree, precision)}`;
}
