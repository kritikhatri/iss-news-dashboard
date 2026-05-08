import { useState, useMemo } from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import NewsCard from './NewsCard';

export default function NewsDashboard({ news, loading, onRefresh, selectedSource }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'source'

  const filteredAndSortedNews = useMemo(() => {
    if (!news) return [];
    
    let result = [...news];

    // Filter by selected source (from pie chart)
    if (selectedSource) {
      result = result.filter(item => item.source.name === selectedSource);
    }

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(lowerSearch)) || 
        (item.description && item.description.toLowerCase().includes(lowerSearch)) ||
        (item.source?.name && item.source.name.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      } else if (sortBy === 'source') {
        const sourceA = a.source?.name || '';
        const sourceB = b.source?.name || '';
        return sourceA.localeCompare(sourceB);
      }
      return 0;
    });

    return result;
  }, [news, searchTerm, sortBy, selectedSource]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Latest Space News</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedSource ? `Filtering by source: ${selectedSource}` : 'Top 10 articles from around the web'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
          >
            <option value="date">Sort by Date</option>
            <option value="source">Sort by Source</option>
          </select>
          
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            aria-label="Refresh News"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl h-80 animate-pulse"></div>
          ))}
        </div>
      ) : filteredAndSortedNews.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <Filter size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No articles found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
          {filteredAndSortedNews.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
