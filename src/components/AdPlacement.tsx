import React, { useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, Play, Gift, Tv, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { triggerSponsorAd } from '../utils/adManager';
import { sound } from '../utils/audio';

export type AdZoneId = 459144 | 459143 | 458074 | 458075 | '459144' | '459143' | '458074' | '458075' | 'all';

export interface SponsorOfferItem {
  id?: string;
  zoneId: AdZoneId;
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
    id: 'sponsor-459144-z1',
    zoneId: 459144,
    zoneLabel: 'SPONSORED ZONE 459144',
    title: 'WPAdMngr Prime Zone 459144',
    subtitle: 'High-yield interactive sponsor partner. Instant reward credit & multiplier boost.',
    rewardLabel: 'ACTIVE ZONE 459144',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    buttonLabel: 'Launch Prime Sponsor (459144)',
    gradient: 'from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30 hover:border-cyan-400/60'
  },
  {
    id: 'sponsor-459143-z2',
    zoneId: 459143,
    zoneLabel: 'SPONSORED ZONE 459143',
    title: 'WPAdMngr Elite Zone 459143',
    subtitle: 'Verified top tier sponsor partner. Triggers special platform perks & bonus spins.',
    rewardLabel: 'ACTIVE ZONE 459143',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    buttonLabel: 'Launch Elite Sponsor (459143)',
    gradient: 'from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30 hover:border-emerald-400/60'
  },
  {
    id: 'sponsor-458074-z3',
    zoneId: 458074,
    zoneLabel: 'SPONSORED ZONE 458074',
    title: 'Sponsor Stream 458074',
    subtitle: 'Interactive sponsor ad channel with verified impressions & direct reward payout.',
    rewardLabel: 'SPONSOR 458074',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    buttonLabel: 'Launch Sponsor Stream',
    gradient: 'from-slate-900 via-slate-900 to-purple-950/40 border-purple-500/30 hover:border-purple-400/60'
  },
  {
    id: 'sponsor-458075-z4',
    zoneId: 458075,
    zoneLabel: 'SPONSORED ZONE 458075',
    title: 'Partner Stream 458075',
    subtitle: 'Instant direct reward payout sponsor link with fast track account crediting.',
    rewardLabel: 'PARTNER 458075',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    buttonLabel: 'Launch Partner Offer',
    gradient: 'from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/30 hover:border-amber-400/60'
  }
];

interface AdPlacementProps {
  zoneId?: AdZoneId;
  variant?: 'banner' | 'card' | 'compact' | 'reward-button' | 'sticky-bar';
  title?: string;
  subtitle?: string;
  rewardLabel?: string;
  onRewardClaim?: () => void;
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({
  zoneId = 459144,
  variant = 'card',
  title,
  subtitle,
  rewardLabel,
  onRewardClaim,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const numericTag = Number(zoneId) || 459144;
  const zoneKey = numericTag === 459143 ? 'ZONE_459143' : numericTag === 458075 ? 'ZONE_458075' : numericTag === 458074 ? 'ZONE_458074' : 'ZONE_459144';

  useEffect(() => {
    if (variant === 'banner' && containerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://js.wpadmngr.com/static/adManager.js';
      script.async = true;
      script.setAttribute('data-admpid', String(numericTag));
      containerRef.current.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [numericTag, variant]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playWin();
    triggerSponsorAd(zoneKey, () => {
      if (onRewardClaim) onRewardClaim();
    });
  };

  if (variant === 'sticky-bar') {
    return (
      <div className={`w-full bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border-y border-indigo-500/30 px-3 py-2 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wide shrink-0">
            Sponsor #{numericTag}
          </span>
          <span className="text-[10px] text-slate-300 truncate hidden sm:inline">
            {subtitle || 'Explore verified sponsor link & earn bonus multiplier credits'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClick}
          id={`sticky-ad-btn-${numericTag}`}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-[10px] flex items-center gap-1 shrink-0 cursor-pointer shadow-sm active:scale-95 touch-manipulation"
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>{rewardLabel || 'Visit Sponsor'}</span>
          <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  if (variant === 'reward-button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        id={`ad-reward-btn-${numericTag}`}
        className={`px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-[11px] shadow-md hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${className}`}
      >
        <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
        <span>{rewardLabel || `Watch Sponsor #${numericTag}`}</span>
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
              <span className="truncate">{title || `WPAdMngr Sponsor (Tag ${numericTag})`}</span>
              <span className="text-[8px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-mono shrink-0">
                Verified
              </span>
            </p>
            <p className="text-[9px] text-slate-400 truncate">{subtitle || 'Visit sponsor to support platform earnings'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          id={`compact-ad-btn-${numericTag}`}
          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm active:scale-95"
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
          <span>WPAdMngr Sponsor Placement (Tag {numericTag})</span>
        </div>
        <div ref={containerRef} id={`wpadmngr-container-${numericTag}`} className="w-full min-h-[50px] flex items-center justify-center overflow-hidden" />
      </div>
    );
  }

  // Default: rich card
  return (
    <div className={`w-full bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-3.5 shadow-lg transition-all relative overflow-hidden group ${className}`}>
      <div className="flex flex-col gap-2.5 relative z-10">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>Sponsor Channel #{numericTag}</span>
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
            <span className="truncate">{title || `WPAdMngr Sponsor Zone ${numericTag}`}</span>
          </h4>
          <p className="text-[10px] text-slate-300 leading-tight mt-1 line-clamp-2">
            {subtitle || 'Click to view verified sponsor offers, support high payouts & unlock special gaming perks.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          id={`ad-card-btn-${numericTag}`}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-[11px] shadow-md hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 touch-manipulation"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Launch Sponsor Offer ({numericTag})</span>
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

  const handleLaunch = (zoneId: AdZoneId) => {
    sound.playWin();
    const numericTag = Number(zoneId) || 459144;
    const zoneKey = numericTag === 459143 ? 'ZONE_459143' : numericTag === 458075 ? 'ZONE_458075' : numericTag === 458074 ? 'ZONE_458074' : 'ZONE_459144';
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
                  <span>SPONSOR #{item.zoneId}</span>
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


