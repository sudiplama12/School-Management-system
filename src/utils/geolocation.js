// navigator.geolocation is callback-based and reports failures as numeric
// codes. Pages need a plain sentence, so every call goes through here.
//
// Note: browsers only expose geolocation on https or localhost — an
// http://192.168.x.x dev address silently offers no fix.
const DEFAULTS = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

export const getLocation = (options = {}) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This browser cannot share a location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: Math.round(coords.accuracy || 0),
        }),
      (err) => {
        if (err.code === 1) {
          reject(
            new Error(
              "Location was blocked for this page. Allow it in the browser bar, then try again."
            )
          );
        } else if (err.code === 2) {
          reject(
            new Error(
              "No position could be read from this device. Try again on the phone's mobile data with GPS on."
            )
          );
        } else {
          reject(
            new Error(
              "Taking too long to get a position. Move to an open area and try again."
            )
          );
        }
      },
      { ...DEFAULTS, ...options }
    );
  });

// Distance used when the routing service is unreachable, so the teacher still
// gets a rough idea before falling back to a maps link.
export const straightLineKm = (from, to) => {
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = rad(to.latitude - from.latitude);
  const dLon = rad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.latitude)) *
      Math.cos(rad(to.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.asin(Math.sqrt(a));
};

export const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

export const formatDuration = (seconds) => {
  const mins = Math.round(seconds / 60);

  if (mins < 60) return `${mins} min`;

  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
};
