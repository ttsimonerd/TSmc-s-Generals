import React, { useState } from 'react';
import { generateImageWithRatio } from '../services/geminiService';
import { AspectRatio } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratios: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // API Key Selection Flow as per requirement for Pro Vision model
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
           await window.aistudio.openSelectKey();
           // Note: We proceed assuming success, if user cancels/fails, the API call will fail gracefully
        } catch (e) {
           setError("API Key selection failed or was cancelled.");
           setLoading(false);
           return;
        }
      }

      // Proceed with generation
      const result = await generateImageWithRatio(prompt, aspectRatio);
      setGeneratedImage(result);

    } catch (err: any) {
       // Check for specific error message to prompt retry
       if (err.message && err.message.includes("Requested entity was not found")) {
           try {
             await window.aistudio.openSelectKey();
             // Retry once? For now, just let the user click again.
             setError("Key error. Please select a project again and retry.");
           } catch(e) {
             setError("Failed to select key.");
           }
       } else {
           setError("Image generation failed. Ensure your selected project has quota.");
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Pro Image Generator</h2>
        <p className="text-zinc-400">
            High-fidelity generation with <span className="text-emerald-400">Gemini 3 Pro</span>. 
            <br/><span className="text-xs opacity-70">Requires Paid GCP Project selection. See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-white">Billing Docs</a>.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl space-y-6 h-fit">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cyberpunk city with neon rain..."
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 h-40 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {ratios.map((r) => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={`py-2 px-1 rounded-lg text-sm font-medium transition-all border
                    ${aspectRatio === r 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                      : 'bg-zinc-800/50 text-zinc-400 border-transparent hover:bg-zinc-700'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
              ${loading || !prompt
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02]'
              }`}
          >
            {loading ? 'Generating...' : 'Select Key & Generate'}
          </button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Display */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-2 flex items-center justify-center min-h-[500px] bg-black/40 relative">
          {loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-400 animate-pulse">Creating masterpiece...</p>
             </div>
          )}
          
          {generatedImage ? (
            <img 
              src={generatedImage} 
              alt="Generated Art" 
              className="max-w-full max-h-[700px] object-contain rounded-xl shadow-2xl"
            />
          ) : (
             !loading && (
              <div className="text-center text-zinc-600">
                <div className="w-20 h-20 mx-auto mb-4 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p>Preview area</p>
              </div>
             )
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
