import { Users } from 'lucide-react';

export default function PeopleInSpace({ data }) {
  if (!data) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      </div>
    );
  }

  const issPeople = data.people.filter((p) => p.craft === 'ISS');

  return (
    <div className="bg-gradient-to-br from-pink-500 via-red-500 to-blue-600 p-6 rounded-xl shadow-md text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white/20 rounded-lg">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">People in Space</h2>
          <p className="text-pink-100 text-sm">Currently aboard the ISS</p>
        </div>
      </div>
      
      <div className="mb-4 text-3xl font-bold">
        {issPeople.length} <span className="text-lg font-normal opacity-80">astronauts</span>
      </div>
      
      <div className="space-y-2">
        {issPeople.map((person, index) => (
          <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-md">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="font-medium">{person.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
