import React, { useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, Play, Gift, Tv, Zap } from 'lucide-react';
import { triggerSponsorAd } from '../utils/adManager';
import { sound } from '../utils/audio';

interface AdPlacementProps {
  zoneId: 458074 | 458075 | 'all';
  variant?: 'banner' | 'card' | 'compact' | 'reward-button';
  title?: string;
  subtitle?: string;
  rewardLabel?: string;
  onRewardClaim?: () => void;
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({
  zoneId,
  variant = 'card',
  title,
  subtitle,
  rewardLabel,
  onRewardClaim,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === 'banner' && containerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://js.wpadmngr.com/static/adManager.js';
      script.async = true;
      script.setAttribute('data-admpid', String(zoneId === 'all' ? 458074 : zoneId));
      containerRef.current.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [zoneId, variant]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playWin();
    const zoneKey = zoneId === 458075 ? 'ZONE_458075' : 'ZONE_458074';
    triggerSponsorAd(zoneKey, () => {
      if (onRewardClaim) onRewardClaim();
    });
  };

  if (variant === 'reward-button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        id={`ad-reward-btn-${zoneId}`}
        className={`px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer touch-manipulation ${className}`}
      >
        <Zap className="w-4 h-4 fill-current text-slate-950" />
        <span>{rewardLabel || 'Watch Sponsor Ad'}</span>
        <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{title || `Sponsored Partner (Tag ${zoneId})`}</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-mono">
                Verified
              </span>
            </p>
            <p className="text-[10px] text-slate-400">{subtitle || 'Visit sponsor to support the platform'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          id={`compact-ad-btn-${zoneId}`}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Open</span>
        </button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-col items-center justify-center ${className}`}>
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>WPAdMngr Sponsor Placement (Tag {zoneId})</span>
        </div>
        <div ref={containerRef} id={`wpadmngr-container-${zoneId}`} className="w-full min-h-[60px] flex items-center justify-center overflow-hidden" />
      </div>
    );
  }

  // Default: rich card
  return (
    <div className={`w-full bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 hover:border-cyan-500/40 rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden group ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Sponsor Channel #{zoneId}</span>
            </span>
            {rewardLabel && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {rewardLabel}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center justify-center sm:justify-start gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>{title || 'Featured Partner Showcase'}</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-lg">
            {subtitle || 'Click to view partner offers, support high payouts & unlock special gaming perks.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          id={`ad-card-btn-${zoneId}`}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 touch-manipulation"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Sponsor Offer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
