import React, { useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, Play, Gift, Tv, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { triggerSponsorAd } from '../utils/adManager';
import { sound } from '../utils/audio';

export interface SponsorOfferItem {
  id?: string;
  zoneId: 458074 | 458075;
  zoneLabel?: string;
  title: string;
  subtitle: string;
  rewardLabel?: string;
  badgeColor?: string;
  buttonLabel?: string;
  gradient?: string;
}

export const DEFAULT_SPONSOR_OFFERS: SponsorOfferItem[] = [
  {
    id: 'sponsor-458074-z1',
    zoneId: 458074,
    zoneLabel: 'SPONSORED ZONE 1',
    title: 'Sponsor Network Tag 458074',
    subtitle: 'Explore sponsored offers & boost platform rewards. Instant credit activation.',
    rewardLabel: 'SPONSORED ZONE 1',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    buttonLabel: 'Launch Sponsor Offer',
    gradient: 'from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30 hover:border-cyan-400/60'
  },
  {
    id: 'sponsor-458075-z2',
    zoneId: 458075,
    zoneLabel: 'SPONSORED ZONE 2',
    title: 'Sponsor Network Tag 458075',
    subtitle: 'Discover verified sponsor partners & trigger special gaming power-ups.',
    rewardLabel: 'SPONSORED ZONE 2',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    buttonLabel: 'Launch Sponsor Offer',
    gradient: 'from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30 hover:border-emerald-400/60'
  },
  {
    id: 'sponsor-458074-z3',
    zoneId: 458074,
    zoneLabel: 'SPONSORED ZONE 3',
    title: 'Sponsor Stream Tag 458074',
    subtitle: 'High-yield interactive sponsor link with automatic 2X reward boost multiplier.',
    rewardLabel: 'SPONSORED ZONE 3',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    buttonLabel: 'Launch Sponsor Stream',
    gradient: 'from-slate-900 via-slate-900 to-purple-950/40 border-purple-500/30 hover:border-purple-400/60'
  },
  {
    id: 'sponsor-458075-z4',
    zoneId: 458075,
    zoneLabel: 'SPONSORED ZONE 4',
    title: 'Elite Partner Tag 458075',
    subtitle: 'Verified instant direct reward payout sponsor link with fast track crediting.',
    rewardLabel: 'SPONSORED ZONE 4',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    buttonLabel: 'Launch Elite Partner',
    gradient: 'from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/30 hover:border-amber-400/60'
  }
];

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
        className={`px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-[11px] shadow-md hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${className}`}
      >
        <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
        <span>{rewardLabel || 'Watch Sponsor Ad'}</span>
        <ExternalLink className="w-3 h-3 stroke-[2.5]" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md ${className}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Tv className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-white flex items-center gap-1 truncate">
              <span className="truncate">{title || `Sponsored Partner (Tag ${zoneId})`}</span>
              <span className="text-[8px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-mono shrink-0">
                Verified
              </span>
            </p>
            <p className="text-[9px] text-slate-400 truncate">{subtitle || 'Visit sponsor to support the platform'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          id={`compact-ad-btn-${zoneId}`}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Open</span>
        </button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-md flex flex-col items-center justify-center ${className}`}>
        <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>WPAdMngr Sponsor Placement (Tag {zoneId})</span>
        </div>
        <div ref={containerRef} id={`wpadmngr-container-${zoneId}`} className="w-full min-h-[50px] flex items-center justify-center overflow-hidden" />
      </div>
    );
  }

  // Default: rich card (Reduced size and typography)
  return (
    <div className={`w-full bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-3.5 shadow-lg transition-all relative overflow-hidden group ${className}`}>
      <div className="flex flex-col gap-2.5 relative z-10">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>Sponsor Channel #{zoneId}</span>
          </span>
          {rewardLabel && (
            <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {rewardLabel}
            </span>
          )}
        </div>

        <div>
          <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{title || 'Featured Partner Showcase'}</span>
          </h4>
          <p className="text-[10px] text-slate-300 leading-tight mt-1 line-clamp-2">
            {subtitle || 'Click to view partner offers, support high payouts & unlock special gaming perks.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          id={`ad-card-btn-${zoneId}`}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-[11px] shadow-md hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 touch-manipulation"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Launch Sponsor Offer</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

interface SponsorCarouselProps {
  title?: string;
  subtitle?: string;
  items?: SponsorOfferItem[];
  className?: string;
}

export const SponsorCarousel: React.FC<SponsorCarouselProps> = ({
  title = 'Sponsor Partner Offers',
  subtitle = 'Discover verified sponsor partners & boost platform rewards',
  items = DEFAULT_SPONSOR_OFFERS,
  className = ''
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    sound.playClick();
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.75;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleLaunch = (zoneId: 458074 | 458075) => {
    sound.playWin();
    const zoneKey = zoneId === 458075 ? 'ZONE_458075' : 'ZONE_458074';
    triggerSponsorAd(zoneKey);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header with Navigation controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{title}</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden xs:inline-flex items-center gap-1 font-bold">
            <span>{items.length} Channels</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-medium mr-1">
            <span>⇄ Slide offers</span>
          </span>
          <button
            onClick={() => scroll('left')}
            title="Slide Sponsor Offers Left"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            title="Slide Sponsor Offers Right"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Side Slide Carousel Container */}
      <div
        ref={carouselRef}
        className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 px-1 scroll-smooth snap-x snap-mandatory select-none"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`w-[230px] sm:w-[260px] shrink-0 snap-start bg-gradient-to-br ${
              item.gradient || 'from-slate-900 via-slate-900 to-slate-950 border-slate-800'
            } border rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between space-y-2.5 relative overflow-hidden transition-all hover:scale-[1.02] active:scale-98`}
          >
            <div className="space-y-2">
              {/* Badges row */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                  item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>SPONSOR CHANNEL #{item.zoneId}</span>
                </span>
                {item.rewardLabel && (
                  <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.rewardLabel}
                  </span>
                )}
              </div>

              {/* Title & description */}
              <div>
                <h4 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 truncate">
                  <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </h4>
                <p className="text-[10px] text-slate-300/90 leading-tight mt-1 line-clamp-2">
                  {item.subtitle}
                </p>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => handleLaunch(item.zoneId)}
              id={`sponsor-carousel-btn-${item.zoneId}-${idx}`}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{item.buttonLabel || 'Launch Sponsor Offer'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

