import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Route as RouteIcon,
  Loader,
  Crosshair,
  Flag,
  Layers,
  Clock,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import {
  getLocation,
  straightLineKm,
  formatDistance,
  formatDuration,
} from "../../../utils/geolocation";

// Shared, key-free OSRM demo server. It is rate limited, so a failure here is
// expected now and then — the page always offers the map link as a fallback.
const ROUTER_URL = "https://router.project-osrm.org/route/v1/driving";

const SCHOOL_CENTER = [28.3949, 84.124];

// OSRM returns coordinates as [longitude, latitude]; Leaflet wants the reverse.
const toLatLng = ([longitude, latitude]) => [latitude, longitude];

function ClickToPlace({ onPlace }) {
  useMapEvents({
    click(event) {
      onPlace(event.latlng);
    },
  });

  return null;
}

function FitToRoute({ points }) {
  const map = useMap();
  const fitted = useRef("");

  useEffect(() => {
    if (points.length < 2) return;

    const key = JSON.stringify(points);
    if (fitted.current === key) return;
    fitted.current = key;

    map.fitBounds(points, { padding: [40, 40] });
  }, [points, map]);

  return null;
}

const describeStep = (step) => {
  const type = step.maneuver?.type || "";
  const modifier = step.maneuver?.modifier || "";
  const road = step.name ? ` onto ${step.name}` : "";

  if (type === "depart") return "Start out";
  if (type === "arrive") return "Arrive at the student's home";
  if (type === "roundabout" || type === "rotary") return `Take the roundabout${road}`;
  if (type === "fork") return `Keep ${modifier}${road}`;
  if (type === "merge") return `Merge ${modifier}${road}`;
  if (type === "on ramp") return `Take the ramp${road}`;
  if (type === "off ramp") return `Take the exit${road}`;
  if (type === "end of road") return `At the end of the road, turn ${modifier}${road}`;
  if (type === "new name") return `Continue${road}`;

  return `${type} ${modifier}${road}`.trim();
};

export default function RoutePlanner() {
  const { teacherId } = useAuth();
  const [searchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentId, setStudentId] = useState(searchParams.get("student") || "");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(0);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState("");

  const chosenStudent = students.find((student) => student.studentId === studentId);
  const requestedId = searchParams.get("student");

  // The exact points come from what the family shared, not from the seeded
  // demo addresses, so only approved students are offered here.
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(`/location-requests/teacher/${teacherId}`);
        const approved = (Array.isArray(data) ? data : []).filter(
          (request) => request.status === "approved"
        );

        const found = await Promise.all(
          approved.map((request) =>
            api
              .get(`/location-requests/student/${request.studentId}`)
              .then(({ data: location }) => ({
                studentId: request.studentId,
                studentName: request.studentName || location.studentId,
                locationName: location.locationName || "",
                recordedAt: location.recordedAt || location.updatedAt,
                latitude: location.latitude,
                longitude: location.longitude,
              }))
              .catch(() => null)
          )
        );

        if (!active) return;

        setStudents(found.filter(Boolean));
        setError("");
      } catch (err) {
        if (!active) return;

        setError(
          err?.response?.data?.message || "Could not load approved students."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [teacherId]);

  useEffect(() => {
    if (requestedId && students.some((s) => s.studentId === requestedId)) {
      setStudentId(requestedId);
    }
  }, [requestedId, students]);

  useEffect(() => {
    const chosen = students.find((s) => s.studentId === studentId);

    if (!chosen) {
      setDestination(null);
      return;
    }

    setDestination({
      latitude: chosen.latitude,
      longitude: chosen.longitude,
      label: chosen.studentName,
    });
  }, [studentId, students]);

  // Only a real request is ever drawn, so an origin change drops the old line.
  useEffect(() => {
    if (!origin || !destination) {
      setRoutes([]);
      return;
    }

    let active = true;

    const fetchRoute = async () => {
      setRouting(true);
      setRouteError("");
      setRoutes([]);

      const query = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

      try {
        const response = await fetch(
          `${ROUTER_URL}/${query}?overview=full&geometries=geojson&alternatives=2&steps=true`
        );

        const payload = await response.json();

        if (!active) return;

        if (!response.ok || payload?.code !== "Ok" || !payload.routes?.length) {
          setRoutes([]);
          setRouteError(
            payload?.msg === "No route" || payload?.code === "NoRoute"
              ? "No road route was found between those two points. The direct distance and the map link below still work."
              : "The routing service is busy right now. Try again in a moment, or open the route in Google Maps."
          );
          return;
        }

        setRoutes(payload.routes);
        setActiveRoute(0);
      } catch {
        if (active) {
          setRouteError(
            "Could not reach the routing service. The direct distance and the map link below still work."
          );
        }
      } finally {
        if (active) setRouting(false);
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [origin, destination]);

  const activePoints = useMemo(() => {
    const geometry = routes[activeRoute]?.geometry?.coordinates;

    if (geometry?.length) return geometry.map(toLatLng);

    if (origin && destination) return [origin, destination].map((p) => [p.latitude, p.longitude]);

    return [];
  }, [routes, activeRoute, origin, destination]);

  const sorted = useMemo(
    () =>
      [...routes].sort((a, b) => a.duration - b.duration),
    [routes]
  );

  const fastest = routes.length
    ? routes.reduce((best, route) => (route.duration < best.duration ? route : best), routes[0])
    : null;

  const shortest = routes.length
    ? routes.reduce((best, route) => (route.distance < best.distance ? route : best), routes[0])
    : null;

  const straightKm =
    origin && destination
      ? straightLineKm(
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        )
      : null;

  const openInMaps = () => {
    if (!origin || !destination) return;

    const key = (point) => `${point.latitude},${point.longitude}`;

    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        key(origin)
      )}&destination=${encodeURIComponent(
        key(destination)
      )}&travelmode=driving`,
      "_blank"
    );
  };

  const useMyLocation = async () => {
    setRouteError("");

    try {
      const fix = await getLocation();
      setOrigin({ ...fix, label: "My location" });
    } catch (err) {
      setRouteError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
        <Loader className="mx-auto h-9 w-9 animate-spin text-slate-400" />
        <p className="mt-4 text-sm text-slate-500">Loading approved locations…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
          <RouteIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Best Route</h1>
          <p className="text-sm text-slate-500">
            Drive from where you are to a student's home.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {students.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 font-semibold text-slate-700">
            No approved locations yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ask for a student's location and get it accepted first. Routes can
            only be planned to a position the family has shared with you.
          </p>
        </div>
      )}

      {students.length > 0 && (
        <>
          {/* CONTROLS */}
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-card p-5 shadow-sm md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Going to
              </label>

              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-card px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Choose an approved student…</option>

                {students.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.studentName} — {student.studentId}
                  </option>
                ))}
              </select>

              {destination && (
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {destination.latitude.toFixed(5)}, {destination.longitude.toFixed(5)}
                  {chosenStudent?.locationName ? ` · ${chosenStudent.locationName}` : ""}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Starting from
              </label>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={useMyLocation}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Crosshair className="h-4 w-4" />
                  Use my location
                </button>

                <button
                  onClick={() => setOrigin(null)}
                  disabled={!origin}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {origin
                  ? `${origin.label || "Start point"} · ${origin.latitude.toFixed(
                      5
                    )}, ${origin.longitude.toFixed(5)}`
                  : "Or click anywhere on the map to drop the start pin."}
              </p>
            </div>
          </div>

          {routeError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300">
              {routeError}
            </div>
          )}

          {/* MAP */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
            <MapContainer
              center={
                destination
                  ? [destination.latitude, destination.longitude]
                  : SCHOOL_CENTER
              }
              zoom={destination ? 14 : 11}
              scrollWheelZoom
              className="h-[320px] w-full sm:h-[430px] lg:h-[520px]"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ClickToPlace
                onPlace={(latlng) =>
                  setOrigin({
                    latitude: latlng.lat,
                    longitude: latlng.lng,
                    label: "Map pick",
                  })
                }
              />

              {activePoints.length >= 2 && (
                <Polyline
                  positions={activePoints}
                  pathOptions={{
                    color: "#059669",
                    weight: 6,
                    opacity: 0.85,
                  }}
                />
              )}

              {origin && (
                <CircleMarker
                  center={[origin.latitude, origin.longitude]}
                  radius={9}
                  pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.9 }}
                >
                  <Popup>Start — {origin.label || "your pick"}</Popup>
                </CircleMarker>
              )}

              {destination && (
                <CircleMarker
                  center={[destination.latitude, destination.longitude]}
                  radius={9}
                  pathOptions={{
                    color: "#059669",
                    fillColor: "#059669",
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup>{destination.label}'s home</Popup>
                </CircleMarker>
              )}

              <FitToRoute points={activePoints} />
            </MapContainer>
          </div>

          {/* OPTIONS */}
          <div className="grid gap-4 md:grid-cols-3">
            {routing && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-5 text-sm text-slate-500 shadow-sm">
                <Loader className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400" />
                Finding the best way there…
              </div>
            )}

            {!routing &&
              sorted.map((route, index) => {
                const chosen = routes[activeRoute] === route;
                const tags = [
                  fastest === route ? "Fastest" : "",
                  shortest === route ? "Shortest" : "",
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <button
                    key={`${route.distance}-${index}`}
                    onClick={() => setActiveRoute(routes.indexOf(route))}
                    className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                      chosen
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-card hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        Option {index + 1}
                      </p>
                      {tags && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          {tags}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-2xl font-bold text-slate-800">
                      {formatDistance(route.distance / 1000)}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      about {formatDuration(route.duration)} by road
                    </p>
                  </button>
                );
              })}

            {!routing && !routes.length && origin && destination && straightKm !== null && (
              <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm md:col-span-2">
                <p className="text-sm font-semibold text-slate-700">
                  Direct distance
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-800">
                  {formatDistance(straightKm)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Straight-line only — the road will be longer. Open the route in
                  Google Maps for live directions.
                </p>
              </div>
            )}

            {origin && destination && (
              <button
                onClick={openInMaps}
                className="flex flex-col justify-center rounded-2xl bg-emerald-700 p-5 text-left text-white shadow-sm transition hover:bg-emerald-800"
              >
                <Navigation className="h-6 w-6" />
                <p className="mt-3 font-semibold">Open route in Google Maps</p>
                <p className="mt-1 text-sm text-emerald-100">
                  Turn-by-turn directions from the start pin, with live traffic.
                </p>
              </button>
            )}
          </div>

          {/* STEPS */}
          {!routing && routes[activeRoute]?.legs?.[0]?.steps?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-semibold text-slate-800">
                  Step by step ({routes[activeRoute].legs[0].steps.length} turns)
                </h2>
              </div>

              <ol className="mt-4 space-y-3">
                {routes[activeRoute].legs[0].steps.map((step, index) => (
                  <li key={`${step.maneuver?.baseline_name || ""}-${index}`} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm text-slate-700">
                        {describeStep(step)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDistance(step.distance / 1000)}
                      </p>
                    </div>
                  </li>
                ))}

                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Flag className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    {destination?.label}'s home
                  </p>
                </li>
              </ol>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Routes are calculated on a shared public service, so the traffic on
            the day may change them. Always confirm the address with the family
            before setting out.
          </p>
        </>
      )}
    </div>
  );
}
