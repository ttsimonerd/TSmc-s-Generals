import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: AppView.GALLERY, label: 'Gallery', icon: 'M4 6h16M4 12h16M4 18h16' }, // Menu icon generic
    { id: AppView.SEARCH_GROUNDING, label: 'Grounded Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: AppView.THINKING_MODE, label: 'Deep Thinker', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: AppView.RNG_TACTICIAN, label: 'The Arbiter', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 glass-panel border-r border-white/10 z-50 flex flex-col pt-8 transition-all duration-300">
      <div className="px-6 mb-10 hidden md:block">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          TSmc
        </h1>
        <p className="text-xs text-zinc-400 tracking-widest mt-1">GENERALS</p>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
              ${currentView === item.id 
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <svg className={`w-6 h-6 flex-shrink-0 ${currentView === item.id ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-6 hidden md:block text-xs text-zinc-600">
        <p>Gemini Powered</p>
        <p>v1.3.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;