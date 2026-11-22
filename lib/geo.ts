/** Great-circle distance in metres (haversine), same formula the API uses. */
export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Offset of b from a in metres: x east, y north. Good enough at office scale. */
export function offsetMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos((a.latitude * Math.PI) / 180);
  return { x: (b.longitude - a.longitude) * mPerDegLng, y: (b.latitude - a.latitude) * mPerDegLat };
}
