import { useEffect, useState } from "react";

import {
  MapPin,
  Navigation,
  CheckCircle,
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

// Fix Leaflet marker icons
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
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = "ST001";

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const response = await api.get(
        `/location-requests/student/${studentId}`
      );

      setLocation(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading location...
      </div>
    );
  }

  if (!location) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 text-center shadow-sm">

        <MapPin className="mx-auto h-12 w-12 text-slate-300" />

        <h2 className="mt-4 text-lg font-bold text-slate-700">
          Location Not Available
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Your child's home location has not been approved
          or shared yet.
        </p>

      </div>
    );
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          Student Home Location
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Approved home location of your child.
        </p>

      </div>

      {/* STATUS */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

        <div className="flex items-center gap-3">

          <CheckCircle className="h-6 w-6 text-emerald-600" />

          <div>

            <p className="font-semibold text-emerald-800">
              Location Approved
            </p>

            <p className="text-sm text-emerald-700">
              Location was shared with permission.
            </p>

          </div>

        </div>

      </div>

      {/* MAP */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <MapContainer
          center={[latitude, longitude]}
          zoom={16}
          scrollWheelZoom={true}
          className="h-[500px] w-full"
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={[latitude, longitude]}
          >

            <Popup>
              <strong>Student Home</strong>
              <br />
              {latitude}, {longitude}
            </Popup>

          </Marker>

        </MapContainer>

      </div>

      {/* DETAILS */}
      <div className="grid gap-5 md:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex gap-3">

            <MapPin className="h-5 w-5 text-emerald-600" />

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

        <button
          onClick={() =>
            window.open(
              `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
              "_blank"
            )
          }
          className="rounded-2xl bg-emerald-600 p-5 text-left text-white shadow-sm hover:bg-emerald-700"
        >

          <Navigation className="h-6 w-6" />

          <p className="mt-3 font-semibold">
            Open Map
          </p>

          <p className="mt-1 text-sm text-emerald-100">
            View this location on OpenStreetMap.
          </p>

        </button>

      </div>

    </div>
  );
}