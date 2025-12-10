import React, { useState, useEffect } from 'react';
import { rollWithLimit, checkMultiple, getMaterials, loadWeekData, resetWins } from '../services/rngService';
import { getRedemptionRiddle, checkRedemptionAnswer, RiddleResponse } from '../services/geminiService';

interface FailedLog {
  question: string;
  answer: string;
  userAnswer: string;
}

interface ActionLog {
  id: string;
  time: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'neutral';
}

const RngTactician: React.FC = () => {
  const [step, setStep] = useState<'IDLE' | 'ROLLED' | 'MULTIPLE_OFFER' | 'MATERIALS_OFFER' | 'SHOW_MATERIALS'>('IDLE');
  const [rollResult, setRollResult] = useState<string>('');
  const [multipleResult, setMultipleResult] = useState<string>('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [supplyTitle, setSupplyTitle] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [weekData, setWeekData] = useState(loadWeekData());

  // Redeemer State
  const [redeemerOpen, setRedeemerOpen] = useState(false);
  const [redeemerLoading, setRedeemerLoading] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState<RiddleResponse | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [redeemerStatus, setRedeemerStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [failedLogs, setFailedLogs] = useState<FailedLog[]>([]);

  // Operation Log State
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);

  // Refresh stats on load or update
  const refreshStats = () => {
      setWeekData(loadWeekData());
  };

  useEffect(() => {
      refreshStats();
  }, [step, redeemerStatus]);

  const addToLog = (message: string, type: 'success' | 'error' | 'warning' | 'neutral') => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const id = now.getTime().toString() + Math.random().toString();
      setActionLogs(prev => [{ id, time, message, type }, ...prev]);
  };

  const handleRoll = () => {
    setLoading(true);
    setStep('IDLE');
    setMaterials([]);
    setMultipleResult('');
    setSupplyTitle('');
    
    setTimeout(() => {
      const result = rollWithLimit();
      setRollResult(result);
      setLoading(false);
      setStep('ROLLED');
      refreshStats();
      
      if (result.includes('Yes')) {
          setStep('MULTIPLE_OFFER');
      } 
      // Removed logs for Roll Outcome/System Alert
    }, 800);
  };

  const handleMultiple = (choice: boolean) => {
    if (!choice) {
       // User declines gamble -> Safe Win: Give 1 Material immediately
       const todaysSupply = getMaterials(1);
       setMaterials(todaysSupply);
       setSupplyTitle("-- TODAY'S SUPPLY --");
       addToLog(`${todaysSupply[0]}`, 'neutral'); // Log the supply
       setStep('SHOW_MATERIALS');
       return;
    }
    
    // Check multiple chance
    const result = checkMultiple(); // "Yes" or "No"
    setMultipleResult(result);
    
    if (result === "Yes") {
        // Success: Proceed to selection, log will happen in handleMaterials
        setStep('MATERIALS_OFFER');
    } else {
        // FAIL Logic: AUTOMATICALLY Give 1 material as consolation
        const consolationSupply = getMaterials(1);
        setMaterials(consolationSupply);
        setSupplyTitle("-- CONSOLATION SUPPLY (1) --");
        addToLog(`${consolationSupply[0]}`, 'error'); // Log the supply (Red for consolation)
        setStep('SHOW_MATERIALS');
    }
  };

  const handleMaterials = (choice: boolean) => {
      if (choice) {
          const mats = getMaterials(quantity);
          setMaterials(mats);
          setSupplyTitle(`-- ACQUIRED ASSETS (${quantity}) --`);
          addToLog(`${mats.join(', ')}`, 'success'); // Log the supplies
          setStep('SHOW_MATERIALS');
      } else {
          setStep('ROLLED');
      }
  };

  // Redeemer Logic
  const handleSummonRedeemer = async () => {
      setRedeemerLoading(true);
      setRedeemerStatus('IDLE');
      setUserAnswer('');
      try {
          const failedQuestions = JSON.parse(localStorage.getItem('redeemer_failed_questions') || '[]');
          const riddle = await getRedemptionRiddle(failedQuestions);
          setCurrentRiddle(riddle);
          setRedeemerOpen(true);
      } catch (e) {
          console.error(e);
      } finally {
          setRedeemerLoading(false);
      }
  };

  const handleSubmitRedemption = async () => {
      if (!currentRiddle || !userAnswer) return;
      setRedeemerLoading(true);
      
      const isCorrect = await checkRedemptionAnswer(currentRiddle.question, currentRiddle.answer, userAnswer);
      
      if (isCorrect) {
          resetWins();
          setRedeemerStatus('CORRECT');
          refreshStats();
          setTimeout(() => {
               setRedeemerOpen(false);
               setRedeemerStatus('IDLE');
               setCurrentRiddle(null);
          }, 3000);
      } else {
          setRedeemerStatus('WRONG');
          // Add to log
          setFailedLogs(prev => [{
              question: currentRiddle.question,
              answer: currentRiddle.answer,
              userAnswer: userAnswer
          }, ...prev]);

          // Add to blocklist
          const failed = JSON.parse(localStorage.getItem('redeemer_failed_questions') || '[]');
          failed.push(currentRiddle.question);
          localStorage.setItem('redeemer_failed_questions', JSON.stringify(failed));
      }
      setRedeemerLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-white">The Arbiter</h2>
        <p className="text-zinc-400">Weekly Probability & Supply Allocation System.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats & Redeemer */}
        <div className="md:col-span-1 space-y-6">
            {/* Stats Panel */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 h-fit border border-emerald-500/20">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Status</div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Week No.</span>
                        <span className="font-mono text-emerald-400 font-bold">{weekData.week_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Wins Acquired</span>
                        <span className={`font-mono font-bold ${weekData.yes_count >= 3 ? 'text-red-500' : 'text-emerald-400'}`}>
                            {weekData.yes_count} / 3
                        </span>
                    </div>
                </div>
            </div>

            {/* Operation History Log */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-zinc-800 animate-fade-in max-h-[300px] flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Supply History</div>
                    {actionLogs.length > 0 && (
                        <button 
                            onClick={() => setActionLogs([])}
                            className="text-[10px] text-zinc-600 hover:text-emerald-400 uppercase"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[100px]">
                    {actionLogs.length === 0 ? (
                         <div className="h-full flex items-center justify-center text-zinc-700 text-xs italic">
                             No supplies recorded.
                         </div>
                    ) : (
                        actionLogs.map((log) => (
                            <div key={log.id} className="text-xs border-l-2 border-zinc-800 pl-2 py-0.5">
                                <span className="text-zinc-600 font-mono mr-2">[{log.time}]</span>
                                <span className={`${
                                    log.type === 'success' ? 'text-emerald-400' : 
                                    log.type === 'error' ? 'text-red-400' : 
                                    log.type === 'warning' ? 'text-yellow-500' : 
                                    'text-zinc-400'
                                }`}>
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* The Redeemer Panel */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-red-500/10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-900/5 pointer-events-none"></div>
                 <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">The Redeemer</h3>
                     </div>
                     <p className="text-xs text-zinc-400 mb-4">
                         Wins exceeded? Challenge the system to reset your fate.
                     </p>
                     
                     {!redeemerOpen ? (
                         <button 
                            onClick={handleSummonRedeemer}
                            disabled={redeemerLoading}
                            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase transition-all"
                         >
                             {redeemerLoading ? 'Summoning...' : 'Challenge Fate'}
                         </button>
                     ) : (
                         <div className="space-y-3 animate-fade-in">
                             {redeemerStatus === 'IDLE' && currentRiddle && (
                                 <>
                                    <p className="text-sm text-zinc-200 italic">"{currentRiddle.question}"</p>
                                    <input 
                                        type="text" 
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Your answer..."
                                        className="w-full bg-black/30 border border-red-500/30 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleSubmitRedemption}
                                            disabled={redeemerLoading || !userAnswer}
                                            className="flex-1 py-1 bg-red-600 text-white rounded text-xs font-bold"
                                        >
                                            {redeemerLoading ? 'Judging...' : 'Submit'}
                                        </button>
                                        <button 
                                            onClick={() => { setRedeemerOpen(false); setCurrentRiddle(null); }}
                                            className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                 </>
                             )}
                             {redeemerStatus === 'CORRECT' && (
                                 <div className="text-center py-2">
                                     <p className="text-emerald-400 font-bold text-sm">ACCEPTED.</p>
                                     <p className="text-xs text-zinc-400">Wins reset to 0.</p>
                                 </div>
                             )}
                             {redeemerStatus === 'WRONG' && (
                                 <div className="text-center py-2 space-y-2">
                                     <p className="text-red-500 font-bold text-sm">DENIED.</p>
                                     <p className="text-xs text-zinc-400">This question is burned.</p>
                                     <button 
                                        onClick={handleSummonRedeemer}
                                        className="text-xs underline text-zinc-500 hover:text-white"
                                     >
                                         Try Another
                                     </button>
                                 </div>
                             )}
                         </div>
                     )}
                 </div>
            </div>

            {/* Failure Archive (Log) */}
            {failedLogs.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl space-y-4 border border-zinc-800 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Failure Archive</div>
                        <button 
                            onClick={() => setFailedLogs([])}
                            className="text-[10px] text-zinc-600 hover:text-red-400 uppercase"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                        {failedLogs.map((log, idx) => (
                            <div key={idx} className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 space-y-2">
                                <p className="text-xs text-zinc-400 line-clamp-2">"{log.question}"</p>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] uppercase tracking-wide">
                                        <span className="text-red-500/70">Your Answer</span>
                                        <span className="text-emerald-500/70">Correct Answer</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-red-400 line-through decoration-red-500/50 opacity-80">{log.userAnswer}</span>
                                        <span className="text-emerald-400 font-bold">{log.answer}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Main Interface */}
        <div className="md:col-span-2 glass-panel p-8 rounded-2xl min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
             
             {/* Background Matrix Effect placeholder */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

             {step === 'IDLE' && !loading && (
                 <>
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center mb-4 shadow-2xl">
                        <span className="text-4xl">🎲</span>
                    </div>
                    <button 
                        onClick={handleRoll}
                        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        INITIATE ROLL
                    </button>
                    <p className="text-zinc-500 text-sm">Probabilities calculated based on temporal coordinates.</p>
                 </>
             )}

             {loading && (
                 <div className="flex flex-col items-center gap-4">
                     <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="font-mono text-emerald-400 animate-pulse">CALCULATING OUTCOME...</p>
                 </div>
             )}

             {(step === 'ROLLED' || step === 'MULTIPLE_OFFER' || step === 'MATERIALS_OFFER' || step === 'SHOW_MATERIALS') && !loading && (
                 <div className="w-full space-y-8 animate-fade-in-up">
                      <div className="space-y-2">
                          <p className="text-zinc-400 uppercase tracking-widest text-xs">Outcome</p>
                          <h2 className={`text-6xl font-black 
                            ${rollResult.includes('Yes') ? 'text-emerald-400 animate-pop-in' : 
                              rollResult.includes('Rule') || rollResult.includes('Weekend') ? 'text-yellow-500' : 
                              'text-red-500 animate-shake'}`}>
                              {rollResult}
                          </h2>
                      </div>

                      {step === 'MULTIPLE_OFFER' && (
                          <div className="p-6 bg-zinc-800/50 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                              <p className="text-xl font-bold text-white">Attempt Multiple?</p>
                              <div className="flex gap-4 justify-center">
                                  <button onClick={() => handleMultiple(true)} className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30">YES</button>
                                  <button onClick={() => handleMultiple(false)} className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30">NO</button>
                              </div>
                          </div>
                      )}

                      {multipleResult && (
                          <div className="space-y-2 animate-fade-in">
                             <p className="text-zinc-400 text-sm">Multiple Result</p>
                             <p className={`text-3xl font-bold ${multipleResult === 'Yes' ? 'text-emerald-400 animate-pop-in' : 'text-red-500 animate-shake'}`}>{multipleResult}</p>
                             {multipleResult === 'No' && (
                                 <p className="text-zinc-500 text-sm italic">The Arbiter grants 1 consolation asset.</p>
                             )}
                          </div>
                      )}

                      {step === 'MATERIALS_OFFER' && (
                          <div className="p-6 bg-zinc-800/50 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                              <p className="text-xl font-bold text-white">Acquire Materials?</p>
                              <div className="flex flex-col items-center gap-4">
                                  <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                                      <label className="text-zinc-400 text-sm">Quantity:</label>
                                      <input 
                                        type="number" 
                                        min="1" 
                                        max="50"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-16 bg-transparent border-b border-zinc-500 text-center text-white focus:outline-none focus:border-emerald-500"
                                      />
                                  </div>
                                  <div className="flex gap-4 justify-center">
                                      <button onClick={() => handleMaterials(true)} className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30">CONFIRM</button>
                                      <button onClick={() => handleMaterials(false)} className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30">DECLINE</button>
                                  </div>
                              </div>
                          </div>
                      )}
                      
                      {step === 'SHOW_MATERIALS' && materials.length > 0 && (
                          <div className="w-full text-left space-y-2 animate-fade-in">
                              <p className={`text-center font-mono text-sm mb-4 ${supplyTitle.includes('CONSOLATION') ? 'text-yellow-500' : 'text-emerald-400'}`}>
                                  {supplyTitle}
                              </p>
                              <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                  {materials.map((mat, idx) => (
                                      <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-lg text-zinc-300 font-mono text-sm flex justify-between">
                                          <span>{mat}</span>
                                          <span className="text-zinc-600">#{idx + 1}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* Reset Button */}
                      {(rollResult.includes('No') || rollResult.includes('Rule') || rollResult.includes('Weekend') || (step === 'ROLLED' && rollResult === 'Yes 🥵' && !multipleResult) || materials.length > 0 || multipleResult === 'No') && (
                        <button 
                            onClick={() => { setStep('IDLE'); setRollResult(''); setMaterials([]); setMultipleResult(''); }}
                            className="mt-8 text-zinc-500 hover:text-white text-sm underline underline-offset-4"
                        >
                            Reset System
                        </button>
                      )}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default RngTactician;