import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export default function SpeedChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md h-80 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <Activity size={32} className="mb-2 opacity-20" />
        <p>Waiting for more data points...</p>
      </div>
    );
  }

  // Map history to chart data
  const data = history.map((item) => ({
    time: format(new Date(item.timestamp), 'HH:mm:ss'),
    speed: Math.round(item.speed),
  }));

  // Simple custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-lg rounded-lg border border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-sm mb-1">{label}</p>
          <p className="text-pink-600 dark:text-pink-400 font-bold">
            {payload[0].value} km/h
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md h-80 flex flex-col border border-slate-100 dark:border-slate-700">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Activity className="text-pink-500" /> ISS Speed History
      </h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="speed" 
              stroke="#ec4899" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
