import { ExternalLink, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function NewsCard({ article }) {
  const { title, source, author, publishedAt, urlToImage, description, url } = article;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 flex flex-col h-full">
      {urlToImage && (
        <div className="h-48 overflow-hidden relative">
          <img 
            src={urlToImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400';
            }}
          />
          <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
            {source?.name || 'Unknown Source'}
          </div>
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2" title={title}>
          {title}
        </h3>
        
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            {publishedAt ? format(new Date(publishedAt), 'MMM dd, yyyy') : 'Unknown Date'}
          </div>
          <div className="flex items-center gap-1 truncate max-w-[120px]" title={author}>
            <User size={12} />
            <span className="truncate">{author || 'Unknown Author'}</span>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 flex-grow">
          {description || 'No description available for this article.'}
        </p>
        
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg text-sm font-medium transition-colors"
        >
          Read Full Article <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
