import React, { useState } from 'react';
import { generateThoughtfulResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Assuming standard markdown usage is acceptable even if not explicitly requested, standard for LLM output. If not, simple text render.

const ThinkingMode: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleThink = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    
    try {
      const text = await generateThoughtfulResponse(prompt);
      setResponse(text);
    } catch (e) {
      setResponse("Error: Could not generate a thoughtful response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Deep Thinking</h2>
        <p className="text-zinc-400">Gemini 3 Pro with extended thinking budget (32k) for complex reasoning.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a complex question requiring deep reasoning (e.g., 'Design a sustainable architecture for a Mars colony using local resources')..."
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 h-32"
        />
        <div className="flex justify-end">
            <button
                onClick={handleThink}
                disabled={loading || !prompt}
                className={`px-8 py-3 rounded-xl font-bold transition-all
                ${loading || !prompt
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                }`}
            >
                {loading ? 'Thinking deeply...' : 'Analyze'}
            </button>
        </div>
      </div>

      {(loading || response) && (
        <div className="glass-panel p-8 rounded-2xl min-h-[200px] relative">
            {loading && (
                 <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-zinc-400 text-sm animate-pulse">Reasoning in progress...</p>
                 </div>
            )}
            
            {!loading && response && (
                <div className="prose prose-invert prose-purple max-w-none">
                     {/* Rendering strictly as text paragraphs for simplicity/safety without external markdown lib, but usually ReactMarkdown is preferred.
                         Using whitespace-pre-wrap to respect formatting from model */}
                     <div className="whitespace-pre-wrap font-light text-zinc-200 leading-7">
                        {response}
                     </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ThinkingMode;
