import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Tv, ExternalLink, Sparkles, ShieldCheck, PlayCircle, Gift } from 'lucide-react';
import { sound } from '../utils/audio';

interface WatchViewProps {
  onBack: () => void;
}

export const WatchView: React.FC<WatchViewProps> = ({ onBack }) => {
  // Container refs for dynamic script mounts
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const containerRef3 = useRef<HTMLDivElement>(null);
  const containerRef5 = useRef<HTMLDivElement>(null);

  const directAdUrl = "https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c";

  useEffect(() => {
    // 1. Script 1: pl31013561
    const script1 = document.createElement('script');
    script1.src = 'https://pl31013561.profitableratecpmnetwork.com/92/0e/17/920e173d33a4abcf7f1261310d8ae850.js';
    script1.async = true;
    if (containerRef1.current) {
      containerRef1.current.appendChild(script1);
    }

    // 2. Script 2: pl31013562 invoke + container-8ce40421675dbb01fc1c1445da53b0d2
    const script2 = document.createElement('script');
    script2.src = 'https://pl31013562.profitableratecpmnetwork.com/8ce40421675dbb01fc1c1445da53b0d2/invoke.js';
    script2.async = true;
    script2.setAttribute('data-cfasync', 'false');
    if (containerRef2.current) {
      containerRef2.current.appendChild(script2);
    }

    // 3. Script 3: pl31013563
    const script3 = document.createElement('script');
    script3.src = 'https://pl31013563.profitableratecpmnetwork.com/e9/d8/d8/e9d8d8d33f6be64050d4e67bcdcc3393.js';
    script3.async = true;
    if (containerRef3.current) {
      containerRef3.current.appendChild(script3);
    }

    // 5. Script 5: 728x90 Banner
    (window as any).atOptions = {
      'key': '514c9f2184740333422d70e81e7cf613',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };
    const script5 = document.createElement('script');
    script5.src = 'https://www.highrevenueformat.com/514c9f2184740333422d70e81e7cf613/invoke.js';
    script5.async = true;
    if (containerRef5.current) {
      containerRef5.current.appendChild(script5);
    }

    return () => {
      if (script1.parentNode) script1.parentNode.removeChild(script1);
      if (script2.parentNode) script2.parentNode.removeChild(script2);
      if (script3.parentNode) script3.parentNode.removeChild(script3);
      if (script5.parentNode) script5.parentNode.removeChild(script5);
    };
  }, []);

  return (
    <div className="min-h-[85vh] max-w-5xl mx-auto px-4 py-6 flex flex-col space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
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
              <span>Watch & Sponsor Hub</span>
            </h1>
            <p className="text-xs text-slate-400">Media channels, sponsor rewards & premium showcase</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Network</span>
        </div>
      </div>

      {/* 5. Placement: 728x90 High Revenue Banner Placement */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center justify-center overflow-x-auto">
        <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Featured Sponsor Banner (728x90)</span>
        </div>
        <div 
          ref={containerRef5}
          id="ad-placement-5-banner"
          className="min-h-[90px] w-full max-w-[728px] flex items-center justify-center overflow-hidden bg-slate-950/60 rounded-xl border border-slate-800/80"
        />
      </div>

      {/* 4. Placement: Featured Direct Sponsor Card (eg93q7e37) */}
      <div className="w-full bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/60 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Premium Partner
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Instant Access
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span>Special Sponsor Offer & Video Zone</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Explore our verified sponsor rewards. Click below to open the dedicated sponsor link and qualify for bonus in-game spins & points.
            </p>
          </div>

          <a
            id="watch-direct-sponsor-btn"
            href={directAdUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playWin()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 shrink-0 min-h-[46px] touch-manipulation"
          >
            <PlayCircle className="w-5 h-5 fill-current" />
            <span>Open Sponsor Link</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 2. Placement: Native Container (8ce40421675dbb01fc1c1445da53b0d2) */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Tv className="w-4 h-4 text-emerald-400" />
          <span>Interactive Media Feed</span>
        </div>
        <div 
          ref={containerRef2}
          id="ad-placement-2-wrapper"
          className="w-full min-h-[200px] bg-slate-950/70 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Target container for script 2 */}
          <div id="container-8ce40421675dbb01fc1c1445da53b0d2" className="w-full flex justify-center" />
        </div>
      </div>

      {/* 1 & 3 Placements: Network Stream Stream Placements (920e173d... & e9d8d8d3...) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Placement 1 (920e173d33a4abcf7f1261310d8ae850) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Channel Stream A</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Zone 920e17</span>
          </div>
          <div 
            ref={containerRef1}
            id="watch-script-placement-1"
            className="w-full min-h-[280px] bg-slate-950/70 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden flex-1"
          >
            {/* Script 1 output */}
          </div>
        </div>

        {/* Placement 3 (e9d8d8d33f6be64050d4e67bcdcc3393) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Channel Stream B</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Zone e9d8d8</span>
          </div>
          <div 
            ref={containerRef3}
            id="watch-script-placement-3"
            className="w-full min-h-[280px] bg-slate-950/70 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden flex-1"
          >
            {/* Script 3 output */}
          </div>
        </div>
      </div>
    </div>
  );
};
