import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Tv, ExternalLink, Sparkles, ShieldCheck, PlayCircle, Gift, Zap, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { AdPlacement } from './AdPlacement';
import { triggerSponsorAd } from '../utils/adManager';

interface WatchViewProps {
  onBack: () => void;
}

export const WatchView: React.FC<WatchViewProps> = ({ onBack }) => {
  // Container refs for dynamic script mounts
  const containerRef144 = useRef<HTMLDivElement>(null);
  const containerRef143 = useRef<HTMLDivElement>(null);
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const containerRef3 = useRef<HTMLDivElement>(null);
  const containerRef5 = useRef<HTMLDivElement>(null);
  const containerRefAd74 = useRef<HTMLDivElement>(null);
  const containerRefAd75 = useRef<HTMLDivElement>(null);
  const adCarouselRef = useRef<HTMLDivElement>(null);

  const scrollAdCarousel = (direction: 'left' | 'right') => {
    sound.playClick();
    if (adCarouselRef.current) {
      const scrollAmount = adCarouselRef.current.clientWidth * 0.75;
      adCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const directAdUrl = "https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c";

  useEffect(() => {
    // WPAdMngr Zone 459144 mount
    const script144 = document.createElement('script');
    script144.src = 'https://js.wpadmngr.com/static/adManager.js';
    script144.async = true;
    script144.setAttribute('data-admpid', '459144');
    if (containerRef144.current) {
      containerRef144.current.appendChild(script144);
    }

    // WPAdMngr Zone 459143 mount
    const script143 = document.createElement('script');
    script143.src = 'https://js.wpadmngr.com/static/adManager.js';
    script143.async = true;
    script143.setAttribute('data-admpid', '459143');
    if (containerRef143.current) {
      containerRef143.current.appendChild(script143);
    }

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

    // WPAdMngr Zone 458074 mount
    const script74 = document.createElement('script');
    script74.src = 'https://js.wpadmngr.com/static/adManager.js';
    script74.async = true;
    script74.setAttribute('data-admpid', '458074');
    if (containerRefAd74.current) {
      containerRefAd74.current.appendChild(script74);
    }

    // WPAdMngr Zone 458075 mount
    const script75 = document.createElement('script');
    script75.src = 'https://js.wpadmngr.com/static/adManager.js';
    script75.async = true;
    script75.setAttribute('data-admpid', '458075');
    if (containerRefAd75.current) {
      containerRefAd75.current.appendChild(script75);
    }

    return () => {
      if (script144.parentNode) script144.parentNode.removeChild(script144);
      if (script143.parentNode) script143.parentNode.removeChild(script143);
      if (script1.parentNode) script1.parentNode.removeChild(script1);
      if (script2.parentNode) script2.parentNode.removeChild(script2);
      if (script3.parentNode) script3.parentNode.removeChild(script3);
      if (script5.parentNode) script5.parentNode.removeChild(script5);
      if (script74.parentNode) script74.parentNode.removeChild(script74);
      if (script75.parentNode) script75.parentNode.removeChild(script75);
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
            <p className="text-xs text-slate-400">Media channels, sponsor ad links & interactive reward stations</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Ad Network</span>
        </div>
      </div>

      {/* Embedded Ad Manager 458074 & 458075 Side Slide Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Sponsor Video & Offer Streams</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden xs:inline-flex items-center gap-1 font-bold">
              <span>2 Channels</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-medium mr-1">
              <span>⇄ Slide channels</span>
            </span>
            <button
              onClick={() => scrollAdCarousel('left')}
              title="Scroll Sponsor Channels Left"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollAdCarousel('right')}
              title="Scroll Sponsor Channels Right"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={adCarouselRef}
          className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 px-1 scroll-smooth snap-x snap-mandatory select-none"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Google AdMob App ID Card */}
          <div className="w-[240px] sm:w-[270px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 border border-amber-500/40 hover:border-amber-400/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 transition-all hover:scale-[1.01]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Google AdMob</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  Global Net
                </span>
              </div>
              <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">AdMob ca-app-pub-1639291014874354~8469220759</span>
              </h4>
              <p className="text-[10px] text-slate-300/90 leading-tight line-clamp-2">
                Official Google AdMob publisher channel. High-value impressions and accelerated user payouts.
              </p>
            </div>

            <button
              type="button"
              id="btn-ad-trigger-admob"
              onClick={() => triggerSponsorAd('ZONE_ADMOB')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Launch AdMob Offer</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Ad Tag 459382 Hyper Zone Card */}
          <div className="w-[240px] sm:w-[270px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/50 border border-rose-500/40 hover:border-rose-400/70 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 transition-all hover:scale-[1.01]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-rose-400" />
                  <span>Channel #459382</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-rose-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  Hyper Zone
                </span>
              </div>
              <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Hyper Sponsor 459382</span>
              </h4>
              <p className="text-[10px] text-slate-300/90 leading-tight line-clamp-2">
                High-yield interactive monetization stream with instant direct payout bonuses.
              </p>
            </div>

            <button
              type="button"
              id="btn-ad-trigger-459382"
              onClick={() => triggerSponsorAd('ZONE_459382')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Launch Sponsor (459382)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Ad Tag 459383 Ultra Zone Card */}
          <div className="w-[240px] sm:w-[270px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/50 border border-violet-500/40 hover:border-violet-400/70 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 transition-all hover:scale-[1.01]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                  <span>Channel #459383</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-violet-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  Ultra Zone
                </span>
              </div>
              <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                <Video className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="truncate">Ultra Sponsor 459383</span>
              </h4>
              <p className="text-[10px] text-slate-300/90 leading-tight line-clamp-2">
                Ultra-tier monetization link with verified impressions and accelerated mining speed.
              </p>
            </div>

            <button
              type="button"
              id="btn-ad-trigger-459383"
              onClick={() => triggerSponsorAd('ZONE_459383')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 hover:from-violet-300 hover:to-fuchsia-300 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Launch Sponsor (459383)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Ad Tag 459144 Card */}
          <div className="w-[240px] sm:w-[270px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-indigo-500/40 hover:border-cyan-400/60 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 transition-all hover:scale-[1.01]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Channel #459144</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  Prime Zone
                </span>
              </div>
              <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                <Video className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Prime Sponsor 459144</span>
              </h4>
              <p className="text-[10px] text-slate-300/90 leading-tight line-clamp-2">
                High-yield interactive sponsor stream with verified impressions & instant bonus points.
              </p>
            </div>

            <div 
              ref={containerRef144}
              id="ad-placement-459144-container"
              className="w-full min-h-[50px] bg-slate-950/80 rounded-xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden"
            />

            <button
              type="button"
              id="btn-ad-trigger-459144"
              onClick={() => triggerSponsorAd('ZONE_459144')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Launch Sponsor (459144)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Ad Tag 459143 Card */}
          <div className="w-[240px] sm:w-[270px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-emerald-500/40 hover:border-emerald-400/60 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 transition-all hover:scale-[1.01]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Channel #459143</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  Elite Zone
                </span>
              </div>
              <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Elite Sponsor 459143</span>
              </h4>
              <p className="text-[10px] text-slate-300/90 leading-tight line-clamp-2">
                Direct monetization partner feed with automatic reward multipliers & speed boosts.
              </p>
            </div>

            <div 
              ref={containerRef143}
              id="ad-placement-459143-container"
              className="w-full min-h-[50px] bg-slate-950/80 rounded-xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden"
            />

            <button
              type="button"
              id="btn-ad-trigger-459143"
              onClick={() => triggerSponsorAd('ZONE_459143')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Launch Sponsor (459143)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Ad Tag 458074 Card */}
          <div className="w-[240px] sm:w-[270px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 hover:border-cyan-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 transition-all hover:scale-[1.01]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  <span>Channel #458074</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  Ad Link 1
                </span>
              </div>
              <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Prime Sponsor 458074</span>
              </h4>
              <p className="text-[10px] text-slate-300/90 leading-tight line-clamp-2">
                Interactive sponsor stream with verified impressions & instant bonus points.
              </p>
            </div>

            <div 
              ref={containerRefAd74}
              id="ad-placement-458074-container"
              className="w-full min-h-[50px] bg-slate-950/80 rounded-xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden"
            />

            <button
              type="button"
              id="btn-ad-trigger-458074"
              onClick={() => triggerSponsorAd('ZONE_458074')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Launch Link 1 (458074)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Ad Tag 458075 Card */}
          <div className="w-[240px] sm:w-[270px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 transition-all hover:scale-[1.01]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Channel #458075</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  Ad Link 2
                </span>
              </div>
              <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Elite Sponsor 458075</span>
              </h4>
              <p className="text-[10px] text-slate-300/90 leading-tight line-clamp-2">
                Direct monetization partner feed with automatic reward multipliers & speed boosts.
              </p>
            </div>

            <div 
              ref={containerRefAd75}
              id="ad-placement-458075-container"
              className="w-full min-h-[50px] bg-slate-950/80 rounded-xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden"
            />

            <button
              type="button"
              id="btn-ad-trigger-458075"
              onClick={() => triggerSponsorAd('ZONE_458075')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <PlayCircle className="w-3.5 h-3.5 fill-current" />
              <span>Launch Link 2 (458075)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
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

