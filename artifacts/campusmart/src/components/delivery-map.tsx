import { useEffect, useRef, useState } from "react";
import { MapPin, Locate, X } from "lucide-react";
import { usePublicSettings } from "@/lib/settings";

declare global {
  interface Window { initDeliveryMap?: () => void; }
}

interface DeliveryLocation {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  onConfirm: (loc: DeliveryLocation) => void;
  onClose: () => void;
  initialAddress?: string;
}

export default function DeliveryMap({ onConfirm, onClose, initialAddress = "" }: Props) {
  const { data: settings } = usePublicSettings();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState(initialAddress);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const apiKey = settings?.googleMapsApiKey;

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return;
    if (window.google?.maps) { initMap(); return; }

    window.initDeliveryMap = initMap;
    if (!document.getElementById("gmaps-script")) {
      const s = document.createElement("script");
      s.id = "gmaps-script";
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initDeliveryMap`;
      s.async = true;
      document.head.appendChild(s);
    }
    return () => { delete window.initDeliveryMap; };
  }, [apiKey]);

  function initMap() {
    if (!mapRef.current || !window.google?.maps) return;
    // Default: Nairobi
    const center = { lat: -1.2921, lng: 36.8219 };
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
    });

    markerRef.current = new window.google.maps.Marker({
      map: mapInstance.current,
      draggable: true,
      icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" },
    });

    markerRef.current.addListener("dragend", () => {
      const pos = markerRef.current.getPosition();
      reverseGeocode(pos.lat(), pos.lng());
    });

    mapInstance.current.addListener("click", (e: any) => {
      const lat = e.latLng.lat(), lng = e.latLng.lng();
      markerRef.current.setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });

    setMapReady(true);
    // Auto-locate user
    locateUser();
  }

  function reverseGeocode(lat: number, lng: number) {
    setCoords({ lat, lng });
    if (!window.google?.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      }
    });
  }

  function locateUser() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocating(false);
        if (mapInstance.current) {
          mapInstance.current.setCenter({ lat, lng });
          mapInstance.current.setZoom(17);
        }
        if (markerRef.current) markerRef.current.setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const handleConfirm = () => {
    if (!address.trim()) return;
    onConfirm({ lat: coords?.lat || 0, lng: coords?.lng || 0, address });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#D0282E]" />
            <h2 className="font-bold text-gray-900">Pin Delivery Location</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Map */}
        <div className="relative flex-1 min-h-[300px]">
          {!apiKey ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center p-6">
              <MapPin className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-600">Map not configured</p>
              <p className="text-xs text-gray-400 mt-1">Add a Google Maps API key in Admin → Settings</p>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full min-h-[300px]" />
          )}
          {/* Locate me button */}
          {apiKey && (
            <button
              onClick={locateUser}
              disabled={locating}
              className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <Locate className={`w-5 h-5 text-[#0A2342] ${locating ? "animate-pulse" : ""}`} />
            </button>
          )}
        </div>

        {/* Address + confirm */}
        <div className="p-4 space-y-3 border-t border-gray-100">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Delivery Address</label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Type address or tap map to pin location..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 outline-none"
            />
          </div>
          <button
            onClick={handleConfirm}
            disabled={!address.trim()}
            className="w-full py-3 bg-[#0A2342] text-white font-bold rounded-xl disabled:opacity-40 hover:bg-[#0A2342]/90 transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
