import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import SearchGrounding from './components/SearchGrounding';
import ThinkingMode from './components/ThinkingMode';
import RngTactician from './components/RngTactician';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.GALLERY);

  const renderView = () => {
    switch (currentView) {
      case AppView.GALLERY:
        return <Gallery onNavigate={setCurrentView} />;
      case AppView.SEARCH_GROUNDING:
        return <SearchGrounding />;
      case AppView.THINKING_MODE:
        return <ThinkingMode />;
      case AppView.RNG_TACTICIAN:
        return <RngTactician />;
      default:
        return <Gallery onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 transition-all">
        <div className="max-w-7xl mx-auto pt-8">
           {renderView()}
        </div>
      </main>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      </div>
    </div>
  );
};

export default App;