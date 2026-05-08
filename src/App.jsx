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

import { fetchISSLocation, fetchPeopleInSpace, reverseGeocode, fetchNews, fallbackISS, fallbackPeople, fallbackNews } from './utils/api';
import { getCache, setCache } from './utils/localStorage';
import toast from 'react-hot-toast';

function App() {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Data States
  const [issHistory, setIssHistory] = useState([]); // Array of { position, timestamp, speed, locationName }
  const [peopleInSpace, setPeopleInSpace] = useState(null);
  const [issLoading, setIssLoading] = useState(true);
  const [issError, setIssError] = useState(false);
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

  const updateISSData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIssLoading(true);

      let posData, peopleData;
      let isFallback = false;

      try {
        [posData, peopleData] = await Promise.all([
          fetchISSLocation(),
          !peopleInSpace ? fetchPeopleInSpace() : Promise.resolve(null)
        ]);
        setIssError(false);
      } catch (err) {
        console.error("ISS API Failed, using fallback:", err);
        setIssError(true);
        isFallback = true;
        posData = fallbackISS;
        peopleData = { people: fallbackPeople };
        if (isManualRefresh) toast.error('Using simulated ISS data');
      }

      if (peopleData) setPeopleInSpace(peopleData);

      const lat = parseFloat(posData.latitude);
      const lon = parseFloat(posData.longitude);
      const timestamp = posData.timestamp ? posData.timestamp * 1000 : new Date().getTime();
      const velocity = parseFloat(posData.velocity);

      // Reverse geocode
      const locationName = isFallback ? 'Simulated Location' : await reverseGeocode(lat, lon).catch(() => 'Ocean / Unknown area');

      setIssHistory((prev) => {
        const speed = velocity;
        const newPoint = { position: { lat, lon }, timestamp, speed, locationName };
        return [...prev, newPoint].slice(-30);
      });

      if (isManualRefresh && !isFallback) toast.success('ISS position updated');
    } catch (error) {
      console.error('Critical Error updating ISS data', error);
      setIssError(true);
    } finally {
      setIssLoading(false);
    }
  }, [peopleInSpace]);

  // Initial and periodic ISS fetch (every 15s)
  useEffect(() => {
    updateISSData();
    const interval = setInterval(() => updateISSData(), 15000);
    return () => clearInterval(interval);
  }, [updateISSData]);

  const loadNews = useCallback(async (forceRefresh = false) => {
    try {
      setNewsLoading(true);
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
      console.error('News Error', error);
      toast.error('Failed to load news, using fallback');
      setNews(fallbackNews);
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
          <div className="lg:col-span-2 relative min-h-[400px]">
            {issLoading && issHistory.length === 0 ? (
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
                <p className="text-slate-500">Loading Map...</p>
              </div>
            ) : (
              <ISSMap history={issHistory.slice(-15)} />
            )}
          </div>
          <div className="flex flex-col gap-6">
            {issLoading && issHistory.length === 0 ? (
              <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            ) : (
              <ISSStats data={currentISS} onRefresh={() => updateISSData(true)} />
            )}
            {issLoading && !peopleInSpace ? (
              <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            ) : (
              <PeopleInSpace data={peopleInSpace} />
            )}
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
