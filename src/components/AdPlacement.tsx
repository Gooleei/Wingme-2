import React, { useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, Play, Gift, Tv, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { triggerSponsorAd, ADMOB_APP_ID, AD_CLIENT_PUB_ID } from '../utils/adManager';
import { sound } from '../utils/audio';

export type AdZoneId = 459382 | 459383 | 459144 | 459143 | 458074 | 458075 | 'admob' | '459382' | '459383' | '459144' | '459143' | '458074' | '458075' | 'all';

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
    id: 'sponsor-admob-prime',
    zoneId: 'admob',
    zoneLabel: 'GOOGLE ADMOB / ADNET',
    title: 'AdMob Partner ca-app-pub-1639291014874354~8469220759',
    subtitle: 'Verified global ad monetization channel. Instant crypto reward credits & payout boosts.',
    rewardLabel: 'ACTIVE ADMOB',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    buttonLabel: 'Launch AdMob Offer',
    gradient: 'from-slate-900 via-amber-950/20 to-slate-950 border-amber-500/40 hover:border-amber-400/80'
  },
  {
    id: 'sponsor-459382-z0',
    zoneId: 459382,
    zoneLabel: 'SPONSORED ZONE 459382',
    title: 'WPAdMngr Hyper Zone 459382',
    subtitle: 'High-velocity interactive monetization channel. Instant payout crediting & multiplier boosts.',
    rewardLabel: 'ACTIVE ZONE 459382',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    buttonLabel: 'Launch Hyper Zone (459382)',
    gradient: 'from-slate-900 via-slate-900 to-rose-950/40 border-rose-500/30 hover:border-rose-400/60'
  },
  {
    id: 'sponsor-459383-z01',
    zoneId: 459383,
    zoneLabel: 'SPONSORED ZONE 459383',
    title: 'WPAdMngr Ultra Zone 459383',
    subtitle: 'Verified ultra tier monetization partner with accelerated payouts and mining power.',
    rewardLabel: 'ACTIVE ZONE 459383',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    buttonLabel: 'Launch Ultra Zone (459383)',
    gradient: 'from-slate-900 via-slate-900 to-violet-950/40 border-violet-500/30 hover:border-violet-400/60'
  },
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

  const isAdmob = String(zoneId) === 'admob';
  const numericTag = Number(zoneId) || 459382;
  const zoneKey = isAdmob 
    ? 'ZONE_ADMOB' 
    : numericTag === 459382 
    ? 'ZONE_459382' 
    : numericTag === 459383 
    ? 'ZONE_459383' 
    : numericTag === 459143 
    ? 'ZONE_459143' 
    : numericTag === 458075 
    ? 'ZONE_458075' 
    : numericTag === 458074 
    ? 'ZONE_458074' 
    : 'ZONE_459144';

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
    const isAdmob = String(zoneId) === 'admob';
    const numericTag = Number(zoneId) || 459382;
    const zoneKey = isAdmob 
      ? 'ZONE_ADMOB' 
      : numericTag === 459382 
      ? 'ZONE_459382' 
      : numericTag === 459383 
      ? 'ZONE_459383' 
      : numericTag === 459143 
      ? 'ZONE_459143' 
      : numericTag === 458075 
      ? 'ZONE_458075' 
      : numericTag === 458074 
      ? 'ZONE_458074' 
      : 'ZONE_459144';
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

/**
 * Universal Top Ad Banner - Rendered on top of every page/view for all users without exemption.
 */
export const UniversalTopAdBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeZoneIndex, setActiveZoneIndex] = React.useState<number>(0);
  const sponsorZones: Array<{ id: AdZoneId; label: string; tag: string }> = [
    { id: 459382, label: 'Hyper Zone 459382', tag: '#459382' },
    { id: 459383, label: 'Ultra Zone 459383', tag: '#459383' },
    { id: 459144, label: 'Prime Zone 459144', tag: '#459144' },
    { id: 459143, label: 'Elite Zone 459143', tag: '#459143' },
    { id: 'admob', label: 'AdMob Global Network', tag: 'ADMOB' },
  ];

  const currentZone = sponsorZones[activeZoneIndex];

  const handleTrigger = (zoneId: AdZoneId) => {
    sound.playWin();
    const isAdmob = String(zoneId) === 'admob';
    const numericTag = Number(zoneId) || 459382;
    const zoneKey = isAdmob
      ? 'ZONE_ADMOB'
      : numericTag === 459382
      ? 'ZONE_459382'
      : numericTag === 459383
      ? 'ZONE_459383'
      : numericTag === 459143
      ? 'ZONE_459143'
      : numericTag === 458075
      ? 'ZONE_458075'
      : numericTag === 458074
      ? 'ZONE_458074'
      : 'ZONE_459144';
    triggerSponsorAd(zoneKey);
  };

  return (
    <div
      id="universal-top-ad-placement"
      className={`w-full bg-slate-950/95 border-b border-indigo-900/50 backdrop-blur-md px-2.5 sm:px-4 py-1.5 flex items-center justify-between gap-2 z-30 transition-all ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            AD NETWORK
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-white truncate flex items-center gap-1">
            <span>{currentZone.label}</span>
            <span className="text-[9px] text-slate-400 font-mono hidden md:inline">({ADMOB_APP_ID})</span>
          </span>
        </div>
      </div>

      {/* Quick Zone Chips */}
      <div className="hidden lg:flex items-center gap-1">
        {sponsorZones.map((z, i) => (
          <button
            key={z.tag}
            type="button"
            onClick={() => {
              setActiveZoneIndex(i);
              handleTrigger(z.id);
            }}
            className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              activeZoneIndex === i
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-black scale-105'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {z.tag}
          </button>
        ))}
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => handleTrigger(currentZone.id)}
        id="universal-top-ad-btn"
        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
      >
        <Play className="w-3 h-3 fill-current" />
        <span>Open Ad Link</span>
        <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
      </button>
    </div>
  );
};

/**
 * Universal Bottom Ad Banner - Persistent footer-level sponsor placement across all views for all users.
 */
export const UniversalBottomAdBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const handleAdClick = (zoneId: AdZoneId) => {
    sound.playWin();
    const isAdmob = String(zoneId) === 'admob';
    const numericTag = Number(zoneId) || 459382;
    const zoneKey = isAdmob
      ? 'ZONE_ADMOB'
      : numericTag === 459382
      ? 'ZONE_459382'
      : numericTag === 459383
      ? 'ZONE_459383'
      : numericTag === 459143
      ? 'ZONE_459143'
      : numericTag === 458075
      ? 'ZONE_458075'
      : numericTag === 458074
      ? 'ZONE_458074'
      : 'ZONE_459144';
    triggerSponsorAd(zoneKey);
  };

  return (
    <div
      id="universal-bottom-ad-placement"
      className={`w-full bg-slate-950/95 border-t border-slate-800/80 px-3 py-2 z-20 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left min-w-0">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
            <strong className="text-white font-black">All-Player Monetization: </strong>
            <span>Active Ad Zones (459382, 459383, 459144, 459143, AdMob)</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => handleAdClick(459382)}
            id="bottom-ad-btn-459382"
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>Zone 459382</span>
          </button>
          <button
            type="button"
            onClick={() => handleAdClick(459383)}
            id="bottom-ad-btn-459383"
            className="px-2.5 py-1 rounded-lg bg-violet-500/20 border border-violet-500/40 hover:bg-violet-500/30 text-violet-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>Zone 459383</span>
          </button>
          <button
            type="button"
            onClick={() => handleAdClick(459144)}
            id="bottom-ad-btn-459144"
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>Zone 459144</span>
          </button>
          <button
            type="button"
            onClick={() => handleAdClick(459143)}
            id="bottom-ad-btn-459143"
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>Zone 459143</span>
          </button>
          <button
            type="button"
            onClick={() => handleAdClick('admob')}
            id="bottom-ad-btn-admob"
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>AdMob</span>
          </button>
        </div>
      </div>
    </div>
  );
};


