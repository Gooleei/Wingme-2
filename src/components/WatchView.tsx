import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Tv } from 'lucide-react';
import { sound } from '../utils/audio';

interface WatchViewProps {
  onBack: () => void;
}

export const WatchView: React.FC<WatchViewProps> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Append the requested script
    const script = document.createElement('script');
    script.src = 'https://js.onclckmn.com/static/onclicka.js';
    script.async = true;
    script.setAttribute('data-admpid', '457669');
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    } else {
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-[80vh] max-w-4xl mx-auto px-4 py-6 flex flex-col">
      {/* Top Header with Back button */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl mb-6">
        <div className="flex items-center gap-3">
          <button
            id="watch-back-btn"
            type="button"
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-cyan-400" />
              <span>Watch</span>
            </h1>
            <p className="text-xs text-slate-400">Sponsored media zone</p>
          </div>
        </div>
      </div>

      {/* Blank Page Area with Embedded Script Container */}
      <div 
        ref={containerRef}
        id="watch-script-container"
        className="flex-1 w-full min-h-[500px] bg-slate-950/60 rounded-3xl border border-slate-800/80 p-6 flex flex-col items-center justify-center text-center shadow-inner"
      >
        {/* Clean container for script output */}
      </div>
    </div>
  );
};
