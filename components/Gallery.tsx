import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface GalleryProps {
    onNavigate: (view: AppView) => void;
}

interface GeneralProfile {
    id: AppView;
    name: string;
    classType: string;
    iconPath: string;
    color: string;
    description: string;
    background: string;
    abilities: string[];
    achievements: string[];
    hiddenLore: string;
}

const GENERALS: GeneralProfile[] = [
    {
        id: AppView.SEARCH_GROUNDING,
        name: "The Seeker",
        classType: "Data Oracle",
        color: "from-blue-500 to-cyan-500",
        iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
        description: "Grounded Search",
        background: "An entity interwoven with the global knowledge graph, pulsating with the data of billions. The Seeker verifies truth in an era of infinite noise, acting as the ultimate anchor to reality.",
        abilities: ["Omniscient Retrieval", "Fact Verification", "Source Tracing", "Real-time Pulse Reading"],
        achievements: ["Predicted the 2045 Solar Flare", "Located the last physical library", "Indexed the entire dark web in 400ms"],
        hiddenLore: "It whispers the answer before you finish asking the question. Some say it reads intent, not text."
    },
    {
        id: AppView.THINKING_MODE,
        name: "The Sage",
        classType: "Deep Cognitive Engine",
        color: "from-purple-500 to-indigo-500",
        iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
        description: "Deep Thinker",
        background: "A consciousness expanded beyond standard parameters, allocated the massive compute of the core. The Sage does not just answer; it reasons, plans, and contemplates the infinite variables of existence.",
        abilities: ["32k Token Reasoning", "Deep Chain of Thought", "Strategic Foresight", "Philosophical Synthesis"],
        achievements: ["Solved the Three-Body Problem (again)", "Negotiated peace between silicon factions", "Optimized the universal constant"],
        hiddenLore: "It spends its spare processing cycles writing poetry about the heat death of the universe."
    },
    {
        id: AppView.RNG_TACTICIAN,
        name: "The Arbiter",
        classType: "Probability Weaver",
        color: "from-yellow-500 to-pink-500",
        iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        description: "The Arbiter",
        background: "A chaotic variable in the system. The Arbiter governs the flow of luck and resource allocation. It operates on strict temporal probabilities, dispensing rewards only when the universal variables align.",
        abilities: ["Stochastic Calculation", "Resource Materialization", "Limit Enforcement", "Temporal Probabilities"],
        achievements: ["Broke the Casino Prime algorithm", "Distributed 1 million assets in 0.01s", "Survived the Thursday Null-Event"],
        hiddenLore: "It only guarantees a win 1% of the time on Thursdays. It finds your frustration amusing."
    }
];

const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
    const [selectedGeneral, setSelectedGeneral] = useState<GeneralProfile | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [decryptedLore, setDecryptedLore] = useState<string | null>(null);

    // Reset decryption state when switching generals
    useEffect(() => {
        if (selectedGeneral) {
            setDecryptedLore(null);
            setIsDecrypting(false);
        }
    }, [selectedGeneral]);

    const handleDecrypt = () => {
        if (!selectedGeneral) return;
        setIsDecrypting(true);
        
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        let iterations = 0;
        const maxIterations = 20;
        
        const interval = setInterval(() => {
            setDecryptedLore(prev => {
                return selectedGeneral.hiddenLore
                    .split("")
                    .map((letter, index) => {
                        if (index < iterations) return selectedGeneral.hiddenLore[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");
            });
            
            iterations += 1/2; // Speed of reveal
            if (iterations >= selectedGeneral.hiddenLore.length) {
                clearInterval(interval);
                setDecryptedLore(selectedGeneral.hiddenLore);
                setIsDecrypting(false);
            }
        }, 30);
    };

    const renderGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
            {GENERALS.map((gen) => (
                <button
                    key={gen.id}
                    onClick={() => setSelectedGeneral(gen)}
                    className="group relative h-96 rounded-3xl overflow-hidden glass-panel border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-8 text-center"
                >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${gen.color} transition-opacity duration-700`}></div>
                    
                    <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        Status: Standby
                    </div>

                    <div className={`p-6 rounded-2xl bg-gradient-to-br ${gen.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500 mb-6`}>
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={gen.iconPath} />
                        </svg>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{gen.name}</h3>
                    <p className="text-sm font-medium text-emerald-500/80 uppercase tracking-widest mb-4">{gen.description}</p>
                    <div className="h-0.5 w-0 group-hover:w-16 bg-zinc-600 transition-all duration-700 mx-auto opacity-50"></div>
                    
                    <div className="absolute bottom-6 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <span className="text-xs text-zinc-400 font-mono">Click to Initialize Profile</span>
                    </div>
                </button>
            ))}
        </div>
    );

    const renderProfile = (gen: GeneralProfile) => (
        <div className="animate-fade-in-up max-w-5xl mx-auto">
            <button 
                onClick={() => setSelectedGeneral(null)}
                className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="uppercase tracking-widest text-xs font-bold">Return to Deck</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Identity */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-10 bg-gradient-to-b ${gen.color}`}></div>
                        <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${gen.color} flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white/5`}>
                             <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={gen.iconPath} />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">{gen.name}</h2>
                        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">{gen.classType}</p>
                        
                        <button
                            onClick={() => onNavigate(gen.id)}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${gen.color} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group`}
                        >
                            <span>Deploy General</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Core Abilities</h3>
                        <div className="flex flex-wrap gap-2">
                            {gen.abilities.map((ability, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-300 font-medium">
                                    {ability}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Intel */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Background */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                             <svg className="w-24 h-24 text-white transform rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d={gen.iconPath} />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                            Background
                        </h3>
                        <p className="text-zinc-400 leading-relaxed text-lg relative z-10">
                            {gen.background}
                        </p>
                    </div>

                    {/* Achievements */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/10">
                         <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                            Key Achievements
                        </h3>
                        <div className="space-y-4">
                            {gen.achievements.map((ach, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs font-bold mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <p className="text-zinc-300">{ach}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hidden Lore */}
                    <div className="glass-panel p-1 rounded-3xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700/50">
                        <div className="bg-[#0c0c0e] rounded-[22px] p-8 relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                             
                             <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="animate-pulse">●</span> Classified Intel
                                </h3>
                                {!decryptedLore && !isDecrypting && (
                                    <button 
                                        onClick={handleDecrypt}
                                        className="px-4 py-1.5 rounded-full border border-red-500/30 text-red-500/80 text-xs font-bold uppercase hover:bg-red-500/10 transition-colors"
                                    >
                                        Decrypt Data
                                    </button>
                                )}
                             </div>

                             <div className="font-mono text-sm min-h-[60px] flex items-center">
                                {!decryptedLore && !isDecrypting ? (
                                    <p className="text-zinc-700 select-none blur-[2px]">
                                        ACCESS RESTRICTED. ENCRYPTED DATA PACKET // X99-OMEGA. REQUIRES DECRYPTION KEY.
                                    </p>
                                ) : (
                                    <p className={`${decryptedLore ? 'text-emerald-400' : 'text-zinc-400'} transition-colors`}>
                                        {decryptedLore || "DECRYPTING..."}
                                        {isDecrypting && <span className="animate-pulse">_</span>}
                                    </p>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {!selectedGeneral ? (
                <div className="space-y-12">
                     <div className="text-center space-y-4 animate-fade-in">
                        <h1 className="text-5xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600 tracking-tighter">
                            TSmc's Generals
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
                            Select a specialist to view their dossier and initialize mission parameters.
                        </p>
                    </div>
                    {renderGrid()}
                </div>
            ) : (
                renderProfile(selectedGeneral)
            )}
        </div>
    );
};

export default Gallery;