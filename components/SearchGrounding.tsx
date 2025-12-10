import React, { useState } from 'react';
import { searchWithGrounding } from '../services/geminiService';
import { SearchResponseData } from '../types';

const SearchGrounding: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await searchWithGrounding(query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
       <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-white">Grounded Search</h2>
        <p className="text-zinc-400">Ask about current events. Powered by Google Search & Gemini Flash.</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something... (e.g., 'Who won the Super Bowl last year?')"
          className="block w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-700 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-lg"
        />
        <button 
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {result && (
        <div className="glass-panel rounded-2xl p-8 space-y-6 animate-fade-in-up">
          <div className="prose prose-invert prose-emerald max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{result.text}</p>
          </div>

          {result.groundingChunks && result.groundingChunks.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.groundingChunks.map((chunk, idx) => (
                  chunk.web && (
                    <a 
                      key={idx} 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-white/5 hover:border-emerald-500/30 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400 group-hover:bg-emerald-500/20">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-zinc-200 truncate">{chunk.web.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{chunk.web.uri}</p>
                      </div>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchGrounding;
