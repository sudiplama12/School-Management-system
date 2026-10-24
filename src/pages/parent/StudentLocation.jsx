
import { useEffect, useState } from "react";

import {
  MapPin,
  Navigation,
  CheckCircle,
  User,
  CalendarDays,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// =====================================================
// FIX LEAFLET MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function StudentLocation() {
  const { child, childStudentId } = useAuth();

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!childStudentId) {
      setError("No child is linked to this parent account.");
      setLoading(false);
      return;
    }

    let active = true;

    api
      .get(`/location-requests/student/${childStudentId}`)
      .then(({ data }) => {
        if (active) setLocation(data || null);
      })
      .catch((err) => {
        if (!active) return;
        // 404 means no approved/stored location for the child yet.
        if (err?.response?.status === 404) {
          setLocation(null);
        } else {
          setError(
            err?.response?.data?.message ||
              "Unable to load your child's location."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [childStudentId]);

  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);

  const hasLocation =
    location &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const addressLabel =
    location?.locationName ||
    (hasLocation ? `${latitude}, ${longitude}` : "—");

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

  const openMap = () => {
    window.open(
      `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
      "_blank"
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Student Home Location
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your child's approved home location.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-10 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">Loading location…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-10 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">{error}</p>
        </div>
      )}

      {!loading && !error && !hasLocation && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-10 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 font-semibold text-slate-700">
            No location on file
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your child's home location has not been approved or recorded yet.
          </p>
        </div>
      )}

      {!loading && !error && hasLocation && (
        <>
          {/* =================================================
              STUDENT INFORMATION
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-3">

            {/* Student */}
            <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Student
                  </p>

                  <p className="font-semibold text-slate-800">
                    {child?.name || location.studentId}
                  </p>
                </div>

              </div>

            </div>


            {/* Class */}
            <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Class
                  </p>

                  <p className="font-semibold text-slate-800">
                    {child?.className || "—"}
                    {child?.section ? ` - Section ${child.section}` : ""}
                  </p>
                </div>

              </div>

            </div>


            {/* Status */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

              <div className="flex items-center gap-3">

                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />

                <div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Location Status
                  </p>

                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Available
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              APPROVAL MESSAGE
          ================================================= */}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

            <div className="flex items-start gap-3">

              <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />

              <div>

                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Location on File
                </p>

                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                  Your child's home location has been approved
                  and is currently shared with authorized school
                  staff.
                </p>

                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  Last updated on{" "}
                  {formatDate(location.recordedAt || location.updatedAt)}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              MAP
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">

            <div className="border-b border-slate-200 p-5">

              <div className="flex items-center gap-3">

                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Home Location
                  </h2>

                  <p className="text-sm text-slate-500">
                    {addressLabel}
                  </p>
                </div>

              </div>

            </div>


            <MapContainer
              center={[latitude, longitude]}
              zoom={16}
              scrollWheelZoom={true}
              className="h-[500px] w-full"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[latitude, longitude]}
              >

                <Popup>
                  <strong>{child?.name || location.studentId}'s Home</strong>

                  <br />

                  {addressLabel}

                  <br />

                  {latitude}, {longitude}
                </Popup>

              </Marker>

            </MapContainer>

          </div>


          {/* =================================================
              LOCATION DETAILS
          ================================================= */}

          <div className="grid gap-5 md:grid-cols-2">

            {/* Coordinates */}
            <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">

              <div className="flex items-start gap-3">

                <MapPin className="mt-1 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                <div>

                  <p className="text-xs text-slate-400">
                    Coordinates
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {latitude}, {longitude}
                  </p>

                </div>

              </div>

            </div>


            {/* Open Map */}
            <button
              type="button"
              onClick={openMap}
              className="rounded-2xl bg-emerald-700 p-5 text-left text-white shadow-sm transition hover:bg-emerald-800"
            >

              <Navigation className="h-6 w-6" />

              <p className="mt-3 font-semibold">
                Open Map
              </p>

              <p className="mt-1 text-sm text-emerald-100 dark:text-white">
                View this location on OpenStreetMap.
              </p>

            </button>

          </div>
        </>
      )}

    </div>
  );
}
