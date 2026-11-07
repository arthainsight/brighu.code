import { ayanamsaModeNumber, type AyanamsaMode } from './ayanamsas';

interface SweInstance {
  initSwissEph(): Promise<void>;
  set_sid_mode(mode: number, t0: number, ayan_t0: number): void;
  julday(year: number, month: number, day: number, hour: number): number;
  get_ayanamsa_ut(jd: number): number;
  calc_ut(jd: number, planet: number, flags: number): Float64Array;
  houses(jd: number, lat: number, lng: number, hsys: string): { ascmc: Record<number, number> };
  azalt(jd: number, flag: number, geopos: number[], pressure: number, temperature: number, point: number[]): { azimuth: number; trueAltitude: number; apparentAltitude: number };
  /** Greenwich mean sidereal time in hours. */
  sidtime(jd: number): number;
  /** The compiled library, for the calls the wrapper gets wrong. */
  SweModule: {
    _malloc(bytes: number): number;
    _free(pointer: number): void;
    ccall(name: string, returns: string, types: string[], args: number[]): number;
    HEAPF64: Float64Array;
  };
  readonly SE_SIDM_LAHIRI: number;
}

// swe_calc_ut flag combinations. SEFLG_SWIEPH(2) selects the Swiss ephemeris,
// SEFLG_SPEED(256) populates the speed slots, SEFLG_EQUATORIAL(2048) switches
// the output from ecliptic longitude/latitude to right ascension/declination.
const FLAGS_ECLIPTIC = 2 | 256;
const FLAGS_EQUATORIAL = 2 | 256 | 2048;

let _swe: SweInstance | null = null;
let _initPromise: Promise<void> | null = null;
let _sidMode = 1;
let _ayanamsaQueue: Promise<void> = Promise.resolve();

async function getSwe(): Promise<SweInstance> {
  if (_swe) return _swe;
  if (!_initPromise) {
    _initPromise = (async () => {
      const mod = (await import('swisseph-wasm')) as unknown as { default: new () => SweInstance };
      const instance = new mod.default();
      await instance.initSwissEph();
      instance.set_sid_mode(instance.SE_SIDM_LAHIRI, 0, 0);
      _swe = instance;
    })();
  }
  await _initPromise;
  return _swe!;
}

export const SE_SUN       = 0;
export const SE_MOON      = 1;
export const SE_MERCURY   = 2;
export const SE_VENUS     = 3;
export const SE_MARS      = 4;
export const SE_JUPITER   = 5;
export const SE_SATURN    = 6;
export const SE_URANUS    = 7;
export const SE_NEPTUNE   = 8;
export const SE_PLUTO     = 9;
export const SE_MEAN_NODE = 10;
export const SE_TRUE_NODE = 11;

async function setSiderealMode(mode: number): Promise<void> {
  const swe = await getSwe();
  if (_sidMode !== mode) {
    swe.set_sid_mode(mode, 0, 0);
    _sidMode = mode;
  }
}

export async function sweJulday(year: number, month: number, day: number, hour: number): Promise<number> {
  return (await getSwe()).julday(year, month, day, hour);
}

export function sweGetAyanamsa(jd: number, ayanamsa: AyanamsaMode = 'lahiri'): Promise<number> {
  if (ayanamsa === 'tropical') return Promise.resolve(0);
  const task = _ayanamsaQueue.then(async () => {
    await setSiderealMode(ayanamsaModeNumber(ayanamsa) ?? 1);
    return (await getSwe()).get_ayanamsa_ut(jd);
  });
  _ayanamsaQueue = task.then(() => undefined, () => undefined);
  return task;
}

export async function sweCalcUt(jd: number, planetId: number): Promise<{ longitude: number; speed: number }> {
  const r = (await getSwe()).calc_ut(jd, planetId, FLAGS_ECLIPTIC);
  return { longitude: r[0], speed: r[3] };
}

/** Right ascension and declination in degrees. */
export async function sweCalcUtEquatorial(jd: number, planetId: number): Promise<{ rightAscension: number; declination: number }> {
  const r = (await getSwe()).calc_ut(jd, planetId, FLAGS_EQUATORIAL);
  return { rightAscension: r[0], declination: r[1] };
}

/** The true obliquity of the ecliptic at the moment, in degrees. */
export async function sweObliquity(jd: number): Promise<number> {
  return (await getSwe()).calc_ut(jd, -1, 0)[0];
}

/**
 * The apparent magnitude and the apparent diameter of the disc of a body, by the C function (swe_pheno_ut). The magnitude is smaller
 * the brighter the body is; the diameter is in seconds of arc. Nothing for a body the function does not know (the nodes).
 */
export async function swePheno(jd: number, bodyId: number): Promise<{ magnitude: number; diameter: number } | null> {
  const { SweModule: module } = await getSwe();
  const attr = module._malloc(20 * 8);
  const message = module._malloc(256);
  try {
    const flag = module.ccall('swe_pheno_ut', 'number', ['number', 'number', 'number', 'pointer', 'pointer'], [jd, bodyId, 2, attr, message]);
    if (flag < 0) return null;
    const values = new Float64Array(module.HEAPF64.buffer, attr, 20);
    // attr[3] is the diameter of the disc in degrees, attr[4] the magnitude.
    return { magnitude: values[4], diameter: values[3] * 3600 };
  } finally {
    module._free(attr);
    module._free(message);
  }
}

export interface BodyData {
  /** Tropical ecliptic longitude and latitude, degrees. */
  longitude: number;
  latitude: number;
  /** Distance from the Earth in astronomical units. */
  distance: number;
  rightAscension: number;
  declination: number;
  /** From the north through the east, degrees. */
  azimuth: number;
  /** Above the horizon, without refraction, degrees. */
  altitude: number;
}

/** A body with its ecliptic, equatorial and horizontal coordinates at the place of the chart. */
export async function sweBodyData(jd: number, bodyId: number, lat: number, lng: number): Promise<BodyData> {
  const swe = await getSwe();
  const ecliptic = swe.calc_ut(jd, bodyId, FLAGS_ECLIPTIC);
  const equatorial = swe.calc_ut(jd, bodyId, FLAGS_EQUATORIAL);
  return { longitude: ecliptic[0], latitude: ecliptic[1], distance: ecliptic[2], rightAscension: equatorial[0], declination: equatorial[1], ...(await horizontal(jd, ecliptic[0], ecliptic[1], ecliptic[2], lat, lng)) };
}

/** The azimuth (from the north through the east) and the altitude of a point given by its ecliptic coordinates. */
export async function horizontal(jd: number, longitude: number, latitude: number, distance: number, lat: number, lng: number): Promise<{ azimuth: number; altitude: number }> {
  const result = (await getSwe()).azalt(jd, 0, [lng, lat, 0], 0, 0, [longitude, latitude, distance]);
  // The library measures the azimuth from the south through the west.
  return { azimuth: (result.azimuth + 180) % 360, altitude: result.trueAltitude };
}

export async function sweSidtime(jd: number): Promise<number> {
  return (await getSwe()).sidtime(jd);
}

export async function sweGetAscendant(jd: number, lat: number, lng: number): Promise<number> {
  return (await getSwe()).houses(jd, lat, lng, 'W').ascmc[0];
}

/** The tropical Ascendant and Midheaven. */
export async function sweGetAngles(jd: number, lat: number, lng: number): Promise<{ ascendant: number; midheaven: number }> {
  const { ascmc } = (await getSwe()).houses(jd, lat, lng, 'W');
  return { ascendant: ascmc[0], midheaven: ascmc[1] };
}
/** Swiss Ephemeris house-system letters of the quadrant systems the app casts. */
export const CUSP_SYSTEM_CODES = { placidus: 'P', koch: 'K', regiomontanus: 'R', campanus: 'C', alcabitius: 'B' } as const;
export type CuspSystem = keyof typeof CUSP_SYSTEM_CODES;

/**
 * The twelve tropical cusps (1st first) of a quadrant house system, by the C function itself: the wrapper of the library
 * passes the system letter as a string where the function wants the code of the character, and then every system comes out the same.
 */
export async function sweGetCusps(jd: number, lat: number, lng: number, system: CuspSystem): Promise<number[]> {
  const { SweModule: module } = await getSwe();
  const cusps = module._malloc(13 * 8);
  const angles = module._malloc(10 * 8);
  try {
    module.ccall('swe_houses', 'number', ['number', 'number', 'number', 'number', 'pointer', 'pointer'], [jd, lat, lng, CUSP_SYSTEM_CODES[system].charCodeAt(0), cusps, angles]);
    return Array.from(new Float64Array(module.HEAPF64.buffer, cusps, 13).slice(1, 13));
  } finally {
    module._free(cusps);
    module._free(angles);
  }
}
/**
 * The maximum of the next eclipse after `jd` by the C function itself (the wrapper of the library passes the arguments of
 * these two in the wrong order, so it finds nothing). `kind` is the C function; the returned flags tell the type.
 */
async function nextEclipse(kind: 'swe_sol_eclipse_when_glob' | 'swe_lun_eclipse_when', jd: number): Promise<{ jd: number; flags: number } | null> {
  const { SweModule: module } = await getSwe();
  const times = module._malloc(10 * 8);
  const message = module._malloc(256);
  try {
    // (tjd_start, ifl = SEFLG_SWIEPH, ifltype = any, tret, backward = 0, serr)
    const flags = module.ccall(kind, 'number', ['number', 'number', 'number', 'pointer', 'number', 'pointer'], [jd, 2, 0, times, 0, message]);
    const maximum = new Float64Array(module.HEAPF64.buffer, times, 1)[0];
    return flags < 0 || !(maximum > jd) ? null : { jd: maximum, flags };
  } finally {
    module._free(times);
    module._free(message);
  }
}

/** The Julian day (UT) of the maximum of the next solar eclipse after `jd` anywhere on Earth, or null when none is found. */
export async function sweNextSolarEclipse(jd: number): Promise<number | null> {
  return (await nextEclipse('swe_sol_eclipse_when_glob', jd))?.jd ?? null;
}

/** The Julian day (UT) of the maximum of the next lunar eclipse after `jd` that can be seen (not the penumbral ones), or null when none is found. */
export async function sweNextLunarEclipse(jd: number): Promise<number | null> {
  // The penumbral eclipse (flag 64) darkens the Moon too little to be seen; one is passed over for the next.
  let from = jd;
  for (let tries = 0; tries < 6; tries += 1) {
    const found = await nextEclipse('swe_lun_eclipse_when', from);
    if (!found) return null;
    if (found.flags & (4 | 16)) return found.jd;
    from = found.jd + 20;
  }
  return null;
}
