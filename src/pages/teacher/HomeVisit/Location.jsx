import { useEffect, useState } from "react";
import {
  MapPin,
  Search,
  Navigation,
  User,
  CheckCircle,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import api from "../../../api/axios";
import "leaflet/dist/leaflet.css";

// =====================================================
// FIX LEAFLET DEFAULT MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================================================
// LOCATION PAGE
// =====================================================

export default function Location() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Demo teacher account
  const teacherId = "teacher1";

  // ===================================================
  // LOAD APPROVED LOCATIONS
  // ===================================================

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError("");

      // Get teacher's location requests
      const requestResponse = await api.get(
        `/location-requests/teacher/${teacherId}`
      );

      const requests = requestResponse.data || [];

      // Only approved requests
      const approvedRequests = requests.filter(
        (request) => request.status === "approved"
      );

      const locationData = [];

      // Get actual GPS location for each approved student
      for (const request of approvedRequests) {
        try {
          const locationResponse = await api.get(
            `/location-requests/student/${request.studentId}`
          );

          locationData.push({
            ...locationResponse.data,

            studentName:
              request.studentName ||
              request.studentId,

            studentId:
              request.studentId,
          });
        } catch (locationError) {
          console.error(
            "Could not load location:",
            locationError
          );
        }
      }

      setLocations(locationData);

      // Automatically select first location
      if (locationData.length > 0) {
        setSelected(locationData[0]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load student locations."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredLocations = locations.filter(
    (student) =>
      `${student.studentName || ""} ${
        student.studentId || ""
      } ${student.locationName || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ===================================================
  // OPEN OPENSTREETMAP
  // ===================================================

  const openNavigation = (student) => {
    if (
      student.latitude === undefined ||
      student.longitude === undefined
    ) {
      return;
    }

    const url =
      `https://www.openstreetmap.org/?mlat=${student.latitude}` +
      `&mlon=${student.longitude}` +
      `#map=17/${student.latitude}/${student.longitude}`;

    window.open(url, "_blank");
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading approved locations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <MapPin className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Student Home Locations
              </h1>

              <p className="text-sm text-slate-500">
                View approved student locations for home visits.
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search student..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

          {/* =================================================
              STUDENT LIST
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="font-bold text-slate-800">
                Approved Locations
              </h2>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {filteredLocations.length}
              </span>

            </div>

            <div className="space-y-3">

              {filteredLocations.map(
                (student) => (

                  <button
                    key={student.studentId}
                    onClick={() =>
                      setSelected(student)
                    }
                    className={`w-full rounded-xl p-4 text-left transition ${
                      selected?.studentId ===
                      student.studentId
                        ? "bg-emerald-50 ring-2 ring-emerald-500"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <User className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-700">
                          {student.studentName}
                        </p>

                        <p className="text-xs text-slate-500">
                          ID: {student.studentId}
                        </p>

                      </div>

                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Location Approved
                    </div>

                  </button>

                )
              )}

            </div>

            {filteredLocations.length === 0 && (
              <div className="py-10 text-center">

                <MapPin className="mx-auto h-9 w-9 text-slate-300" />

                <p className="mt-3 text-sm text-slate-500">
                  No approved student locations.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Parents must approve a location request first.
                </p>

              </div>
            )}

          </div>

          {/* =================================================
              MAP
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <MapContainer
              center={
                selected
                  ? [
                      selected.latitude,
                      selected.longitude,
                    ]
                  : [28.3949, 84.124]
              }
              zoom={selected ? 15 : 7}
              scrollWheelZoom={true}
              className="h-[550px] w-full"
            >

              {/* OpenStreetMap */}
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Student markers */}
              {locations.map(
                (student) => (

                  <Marker
                    key={student.studentId}
                    position={[
                      student.latitude,
                      student.longitude,
                    ]}
                  >

                    <Popup>

                      <div className="min-w-[190px]">

                        <p className="font-bold">
                          {student.studentName}
                        </p>

                        <p className="text-sm">
                          ID: {student.studentId}
                        </p>

                        <hr className="my-2" />

                        <p className="text-sm">
                          {student.locationName ||
                            "Home Location"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Latitude: {student.latitude}
                        </p>

                        <p className="text-xs text-slate-500">
                          Longitude: {student.longitude}
                        </p>

                      </div>

                    </Popup>

                  </Marker>

                )
              )}

              {/* Move map when student selected */}
              {selected && (
                <MapMover
                  latitude={selected.latitude}
                  longitude={selected.longitude}
                />
              )}

            </MapContainer>

            {/* =================================================
                SELECTED STUDENT DETAILS
            ================================================= */}

            {selected && (

              <div className="border-t border-slate-200 p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <CheckCircle className="h-5 w-5 text-emerald-600" />

                      <p className="font-semibold text-slate-800">
                        {selected.studentName}
                      </p>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      ID: {selected.studentId}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selected.locationName ||
                        "Student Home Location"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {selected.latitude},{" "}
                      {selected.longitude}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      openNavigation(selected)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Navigation className="h-4 w-4" />

                    Open Map
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  );
}

// =====================================================
// MOVE MAP TO SELECTED LOCATION
// =====================================================

function MapMover({
  latitude,
  longitude,
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(
      [latitude, longitude],
      15,
      {
        duration: 1,
      }
    );
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}