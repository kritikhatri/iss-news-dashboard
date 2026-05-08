import { useState, useEffect, useCallback, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from './components/ThemeToggle';
import ISSStats from './components/ISSStats';
import PeopleInSpace from './components/PeopleInSpace';
import ISSMap from './components/ISSMap';
import SpeedChart from './components/SpeedChart';
import NewsDashboard from './components/NewsDashboard';
import NewsChart from './components/NewsChart';
import Chatbot from './components/Chatbot';

import { fetchISSLocation, fetchPeopleInSpace, reverseGeocode, fetchNews } from './utils/api';
import { calculateSpeed } from './utils/haversine';
import { getCache, setCache } from './utils/localStorage';
import toast from 'react-hot-toast';

function App() {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Data States
  const [issHistory, setIssHistory] = useState([]); // Array of { position, timestamp, speed, locationName }
  const [peopleInSpace, setPeopleInSpace] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedNewsSource, setSelectedNewsSource] = useState(null);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Fetch ISS Data
  const updateISSData = useCallback(async (isManualRefresh = false) => {
    try {
      const [posData, peopleData] = await Promise.all([
        fetchISSLocation(),
        !peopleInSpace ? fetchPeopleInSpace() : Promise.resolve(null)
      ]);

      if (peopleData) setPeopleInSpace(peopleData);

      const lat = parseFloat(posData.iss_position.latitude);
      const lon = parseFloat(posData.iss_position.longitude);
      const timestamp = posData.timestamp * 1000;

      // Reverse geocode
      const locationName = await reverseGeocode(lat, lon);

      setIssHistory((prev) => {
        let speed = 0;
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          speed = calculateSpeed(
            last.position.lat, last.position.lon, last.timestamp,
            lat, lon, timestamp
          );
        }

        const newPoint = { position: { lat, lon }, timestamp, speed, locationName };
        const newHistory = [...prev, newPoint].slice(-15); // Keep last 15
        
        // Also save to a separate history for chart if needed, but requirements say last 30 for chart.
        // We'll just keep 30 in history to satisfy both (map can just use all or we can slice it there)
        const extendedHistory = [...prev, newPoint].slice(-30);
        return extendedHistory;
      });

      if (isManualRefresh) toast.success('ISS position updated');
    } catch (error) {
      console.error('Error updating ISS data', error);
      if (isManualRefresh) toast.error('Failed to update ISS position');
    }
  }, [peopleInSpace]);

  // Initial and periodic ISS fetch (every 15s)
  useEffect(() => {
    updateISSData();
    const interval = setInterval(() => updateISSData(), 15000);
    return () => clearInterval(interval);
  }, [updateISSData]);

  // Fetch News Data
  const loadNews = useCallback(async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      let data = forceRefresh ? null : getCache('news_cache');
      
      if (!data) {
        data = await fetchNews();
        setCache('news_cache', data, 15);
        if (forceRefresh) toast.success('News refreshed');
      } else if (!forceRefresh) {
        toast.success('News loaded from cache');
      }
      
      setNews(data);
    } catch (error) {
      toast.error('Failed to load news');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Generate context string for AI
  const currentISS = issHistory[issHistory.length - 1];
  const contextStr = useMemo(() => {
    if (!currentISS || !peopleInSpace) return 'Data is loading...';
    
    let context = `ISS Current Position: Latitude ${currentISS.position.lat.toFixed(4)}, Longitude ${currentISS.position.lon.toFixed(4)}.\n`;
    context += `ISS Current Location: ${currentISS.locationName}.\n`;
    context += `ISS Current Speed: ${currentISS.speed.toFixed(0)} km/h.\n`;
    
    const issPeople = peopleInSpace.people.filter(p => p.craft === 'ISS');
    context += `Total People in Space (on ISS): ${issPeople.length}. Names: ${issPeople.map(p => p.name).join(', ')}.\n`;
    
    context += `Total News Articles Available: ${news.length}.\n`;
    news.slice(0, 5).forEach((n, i) => {
      context += `News ${i+1}: "${n.title}" from ${n.source?.name || 'Unknown'}. Description: ${n.description || 'None'}\n`;
    });
    return context;
  }, [currentISS, peopleInSpace, news]);

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/30">
              IS
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-blue-600 bg-clip-text text-transparent hidden sm:block">
              Real-Time ISS & News Dashboard
            </h1>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Row: Map & Core Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ISSMap history={issHistory.slice(-15)} />
          </div>
          <div className="flex flex-col gap-6">
            <ISSStats data={currentISS} onRefresh={() => updateISSData(true)} />
            <PeopleInSpace data={peopleInSpace} />
          </div>
        </div>

        {/* Middle Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SpeedChart history={issHistory} />
          <NewsChart 
            news={news} 
            selectedSource={selectedNewsSource}
            onSourceClick={setSelectedNewsSource} 
          />
        </div>

        {/* Bottom Row: News Dashboard */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <NewsDashboard 
            news={news} 
            loading={newsLoading} 
            onRefresh={() => loadNews(true)}
            selectedSource={selectedNewsSource}
          />
        </div>

      </main>

      {/* Chatbot */}
      <Chatbot contextStr={contextStr} />
    </div>
  );
}

export default App;
