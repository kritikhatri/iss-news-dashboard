import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#ec4899', '#f43f5e', '#e11d48', '#be123c', '#8b5cf6', '#3b82f6', '#0ea5e9', '#06b6d4'];

export default function NewsChart({ news, onSourceClick, selectedSource }) {
  const data = useMemo(() => {
    if (!news || news.length === 0) return [];
    
    const sourceCounts = {};
    news.forEach((article) => {
      const sourceName = article.source?.name || 'Unknown';
      sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + 1;
    });

    return Object.keys(sourceCounts)
      .map((key) => ({
        name: key,
        value: sourceCounts[key],
      }))
      .sort((a, b) => b.value - a.value); // Sort by count desc
  }, [news]);

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md h-80 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <PieChartIcon size={32} className="mb-2 opacity-20" />
        <p>No news data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-lg rounded-lg border border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-sm mb-1">{payload[0].name}</p>
          <p className="text-slate-600 dark:text-slate-300 font-bold">
            {payload[0].value} {payload[0].value === 1 ? 'article' : 'articles'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md h-80 flex flex-col border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <PieChartIcon className="text-pink-500" /> News Sources
        </h3>
        {selectedSource && (
          <button 
            onClick={() => onSourceClick(null)}
            className="text-xs text-pink-500 hover:text-pink-600 underline"
          >
            Clear Filter
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click a slice to filter news</p>
      
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              onClick={(entry) => {
                if (selectedSource === entry.name) {
                  onSourceClick(null);
                } else {
                  onSourceClick(entry.name);
                }
              }}
              className="cursor-pointer focus:outline-none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  opacity={selectedSource && selectedSource !== entry.name ? 0.3 : 1}
                  stroke={selectedSource === entry.name ? '#fff' : 'transparent'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '12px', paddingLeft: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
