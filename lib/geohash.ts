const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
/**
 * Encodes a latitude and longitude into a geohash string with the specified precision.
 * @param latitude
 * @param longitude
 * @param precision - The desired length of the geohash string (default is 8).
 * @returns geohash string or null if the input is invalid
 */
export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision: number = 8,
): string | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  let hash = "";
  let bit = 0;
  let idx = 0;
  let evenBit = true;

  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lonMin + lonMax) / 2;
      if (longitude >= mid) {
        idx = (idx << 1) + 1;
        lonMin = mid;
      } else {
        idx = idx << 1;
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        idx = (idx << 1) + 1;
        latMin = mid;
      } else {
        idx = idx << 1;
        latMax = mid;
      }
    }

    evenBit = !evenBit;
    bit += 1;

    if (bit === 5) {
      hash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return hash;
}
