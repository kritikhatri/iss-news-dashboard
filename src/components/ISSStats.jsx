import { Rocket, MapPin, Navigation, Map } from 'lucide-react';

export default function ISSStats({ data, onRefresh }) {
  if (!data) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
      </div>
    );
  }

  const { position, speed, locationName } = data;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Rocket size={64} />
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="text-pink-500" /> Current Position
        </h2>
        <button 
          onClick={onRefresh}
          className="text-sm px-3 py-1 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/30 dark:hover:bg-pink-800/50 text-pink-600 dark:text-pink-400 rounded-md transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Latitude</p>
          <p className="text-lg font-semibold">{position.lat.toFixed(4)}°</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Longitude</p>
          <p className="text-lg font-semibold">{position.lon.toFixed(4)}°</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Navigation size={14} /> Speed
          </p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {speed > 0 ? `${speed.toFixed(0)} km/h` : 'Calculating...'}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Map size={14} /> Area
          </p>
          <p className="text-sm font-semibold truncate" title={locationName}>
            {locationName}
          </p>
        </div>
      </div>
    </div>
  );
}
