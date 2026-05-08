import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { format } from 'date-fns';

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25]
});

// Component to handle map centering
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function ISSMap({ history }) {
  if (!history || history.length === 0) {
    return <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>;
  }

  const currentPos = history[history.length - 1];
  const positions = history.map((p) => [p.position.lat, p.position.lon]);

  return (
    <div className="h-[400px] md:h-full w-full rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 relative z-0">
      <MapContainer 
        center={[currentPos.position.lat, currentPos.position.lon]} 
        zoom={4} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={[currentPos.position.lat, currentPos.position.lon]} />
        
        {positions.length > 1 && (
          <Polyline positions={positions} color="red" weight={3} opacity={0.7} />
        )}

        <Marker position={[currentPos.position.lat, currentPos.position.lon]} icon={issIcon}>
          <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
            <div className="text-center font-sans">
              <p className="font-bold">ISS Current Position</p>
              <p>Lat: {currentPos.position.lat.toFixed(4)}</p>
              <p>Lon: {currentPos.position.lon.toFixed(4)}</p>
              <p className="text-xs text-slate-500 mt-1">
                {format(new Date(currentPos.timestamp), 'HH:mm:ss')}
              </p>
            </div>
          </Tooltip>
        </Marker>
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-slate-200 dark:border-slate-700">
        Tracking {history.length} / 15 positions
      </div>
    </div>
  );
}
