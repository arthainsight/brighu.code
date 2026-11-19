// The Open Gauquelin Database (opengauquelin.org): reading its CSV files (the "timed data" file, ogdb-time.csv, with the columns OGID, OCCU, GQID, MUID, FNAME,
// GNAME, DATE, TZO, DATE-UT, PLACE, C1–C3, CY, LG, LAT, GEOID, separated by semicolons) into people with a birth moment, a place and an occupation group. The file
// is read in the browser from the user's own copy; none of the data is in this program. See docs/open-gauquelin.md for what is done with the rows.

import type { SavedChartData } from './savedCharts';

export interface OgdbPerson {
  id: string;
  name: string;
  /** The occupations: "novelist+poet" is two. */
  occupations: string[];
  /** The birth moment as the app writes it, DD.MM.YYYY HH.MM.SS, in the time of the place (or in UT when the file gives only that, with tz 0). */
  birth: string;
  /** Hours east of UT of the clock the birth is in. */
  tz: number;
  place: string;
  country: string;
  lat: number;
  lng: number;
  /** True when the place had no coordinates of its own (taken from another entry of the same place) or its longitude had to be turned round. */
  approx: boolean;
}

export interface OgdbReadStats {
  rows: number;
  people: number;
  /** Rows left out: no date, no way to tell the time zone, or no place that can be found. */
  noDate: number;
  noZone: number;
  noPlace: number;
  /** People whose coordinates are a guess (see OgdbPerson.approx). */
  approx: number;
}

/** A CSV text as rows of fields; `;` or any separator, double quotes around a field and "" inside it. */
export function parseCsv(text: string, separator = ';'): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === separator) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const MOMENT = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/;
function moment(text: string): { ms: number; parts: [number, number, number, number, number, number] } | null {
  const match = MOMENT.exec(text.trim());
  if (!match) return null;
  const parts = match.slice(1, 7).map(item => Number(item ?? 0)) as [number, number, number, number, number, number];
  const date = new Date(Date.UTC(2000, parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
  date.setUTCFullYear(parts[0]);   // years under 100 and the like are not read as 19xx
  return { ms: date.getTime(), parts };
}

/** "+00:09:21" or "-06:00" as hours. */
export function parseOffset(text: string): number | null {
  const match = /^([+-])(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim());
  if (!match) return null;
  return (match[1] === '-' ? -1 : 1) * (Number(match[2]) + Number(match[3]) / 60 + Number(match[4] ?? 0) / 3600);
}

const pad = (value: number, size = 2) => String(value).padStart(size, '0');
const birthText = (parts: readonly number[]) => `${pad(parts[2])}.${pad(parts[1])}.${pad(parts[0], 4)} ${pad(parts[3])}.${pad(parts[4])}.${pad(parts[5])}`;

/** "ADAM" → "Adam", "ANDRE-MORISSET" → "Andre-Morisset", and names already in mixed case are left alone. */
export function niceName(text: string): string {
  if (text !== text.toUpperCase()) return text;
  return text.toLowerCase().replace(/(^|[\s'’.-])(\p{L})/gu, (_, before: string, letter: string) => before + letter.toUpperCase());
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

/**
 * The people of an OGDB CSV text. The file mixes sources: a place that was looked up (GEOID) has its longitude as the rest of the world writes it, east positive,
 * but many French rows from the Gauquelins' own books, with no GEOID, have it turned round (Nice at −7.26, Paris at −2.34). A row without a lookup is checked against
 * the same place (the same name and country) in a row that has one, and when it is that longitude with the sign turned it is turned back; when there is no such place,
 * a French row of the books (no GEOID, no MUID) is turned (250 of 250 such rows with a place to check against were turned). Both are marked `approx`.
 */
export function readOgdb(text: string): { people: OgdbPerson[]; stats: OgdbReadStats } {
  const table = parseCsv(text);
  const header = table[0] ?? [];
  const index = (name: string) => header.indexOf(name);
  const col = { id: index('OGID'), occu: index('OCCU'), muid: index('MUID'), fname: index('FNAME'), gname: index('GNAME'), date: index('DATE'), tzo: index('TZO'), ut: index('DATE-UT'), place: index('PLACE'), cy: index('CY'), lg: index('LG'), lat: index('LAT'), geoid: index('GEOID') };
  if (col.id < 0 || col.occu < 0 || col.date < 0 || col.lg < 0 || col.lat < 0) throw new Error('Not an Open Gauquelin CSV (the columns OGID, OCCU, DATE, LG and LAT are needed)');
  const cell = (row: string[], at: number) => (at >= 0 ? (row[at] ?? '').trim() : '');
  const rows = table.slice(1);

  // The places that were looked up, by name and country.
  const looked = new Map<string, { lat: number[]; lng: number[] }>();
  for (const row of rows) {
    if (!cell(row, col.geoid) || !cell(row, col.lg) || !cell(row, col.lat)) continue;
    const key = `${cell(row, col.place).toLowerCase()}|${cell(row, col.cy)}`;
    const entry = looked.get(key) ?? { lat: [], lng: [] };
    entry.lat.push(Number(cell(row, col.lat)));
    entry.lng.push(Number(cell(row, col.lg)));
    looked.set(key, entry);
  }

  const stats: OgdbReadStats = { rows: rows.length, people: 0, noDate: 0, noZone: 0, noPlace: 0, approx: 0 };
  const people: OgdbPerson[] = [];
  for (const row of rows) {
    const local = moment(cell(row, col.date));
    const universal = moment(cell(row, col.ut));
    if (!local && !universal) { stats.noDate++; continue; }
    let birth: readonly number[];
    let tz: number;
    if (local && universal) { birth = local.parts; tz = Math.round(((local.ms - universal.ms) / 3_600_000) * 1_000_000) / 1_000_000; }
    else if (local) {
      const offset = parseOffset(cell(row, col.tzo));
      if (offset === null) { stats.noZone++; continue; }
      birth = local.parts; tz = offset;
    } else { birth = universal!.parts; tz = 0; }

    const place = cell(row, col.place);
    const country = cell(row, col.cy);
    const reference = looked.get(`${place.toLowerCase()}|${country}`);
    let lat = cell(row, col.lat) === '' ? NaN : Number(cell(row, col.lat));
    let lng = cell(row, col.lg) === '' ? NaN : Number(cell(row, col.lg));
    let approx = false;
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      if (!reference) { stats.noPlace++; continue; }
      lat = median(reference.lat); lng = median(reference.lng); approx = true;
    } else if (!cell(row, col.geoid)) {
      if (reference) {
        const m = median(reference.lng);
        if (Math.abs(m) >= 0.5 && Math.abs(lng + m) < 0.6 && Math.abs(lng - m) >= 0.6) { lng = -lng; approx = true; }
      } else if (country === 'FR' && !cell(row, col.muid)) { lng = -lng; approx = true; }
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) { stats.noPlace++; continue; }
    if (approx) stats.approx++;
    const given = niceName(cell(row, col.gname));
    const family = niceName(cell(row, col.fname));
    people.push({
      id: cell(row, col.id),
      name: [given, family].filter(Boolean).join(' ') || cell(row, col.id),
      occupations: cell(row, col.occu).split('+').filter(Boolean),
      birth: birthText(birth),
      tz, place, country, lat, lng, approx,
    });
  }
  stats.people = people.length;
  return { people, stats };
}

/** The saved chart of a person, for opening in the app or keeping with the saved charts. */
export function personChartData(person: OgdbPerson, today: string): SavedChartData {
  return {
    birthDatetime: person.birth,
    city: [person.place, person.country].filter(Boolean).join(', '),
    manualLat: String(Math.round(person.lat * 100_000) / 100_000),
    manualLng: String(Math.round(person.lng * 100_000) / 100_000),
    ianaTimezone: '',
    tzOverride: String(person.tz),
    targetDate: today,
    showCoords: true,
  };
}

/** The occupation groups with the number of people in each (a person with two occupations is in both), the largest first. */
export function occupationGroups(people: readonly OgdbPerson[]): { occupation: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const person of people) for (const occupation of person.occupations) counts.set(occupation, (counts.get(occupation) ?? 0) + 1);
  return [...counts].map(([occupation, count]) => ({ occupation, count })).sort((a, b) => b.count - a.count || a.occupation.localeCompare(b.occupation));
}

/** "rugby-union-player" → "Rugby union player". */
export const occupationLabel = (occupation: string) => occupation.replace(/-/g, ' ').replace(/^./, letter => letter.toUpperCase());

// --- The zip -----------------------------------------------------------------------------------------------------------------------------------------------

/** The text of the first file in a zip (stored or deflated), for the file as it is downloaded from the site. */
export async function readZipText(buffer: ArrayBuffer): Promise<string> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  let end = -1;
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error('Not a zip file');
  const entry = view.getUint32(end + 16, true);
  if (view.getUint32(entry, true) !== 0x02014b50) throw new Error('Not a zip file');
  const method = view.getUint16(entry + 10, true);
  const size = view.getUint32(entry + 20, true);
  const local = view.getUint32(entry + 42, true);
  const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
  const data = bytes.slice(start, start + size);
  if (method === 0) return new TextDecoder().decode(data);
  if (method !== 8) throw new Error('This zip is packed in a way that is not read here; unpack it and choose the CSV file');
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
}
