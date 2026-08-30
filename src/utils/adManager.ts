import React, { useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { sound } from './audio';

export const ADMOB_APP_ID = 'ca-app-pub-1639291014874354~8469220759';
export const AD_CLIENT_PUB_ID = 'ca-pub-1639291014874354';
export const DIRECT_AD_URL = 'https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c';

export interface AdZoneConfig {
  tagId: number | string;
  name: string;
  type: 'banner' | 'native' | 'direct' | 'admob';
  directUrl?: string;
  format?: string;
  adUnitId?: string;
}

export const ACTIVE_AD_ZONES: Record<string, AdZoneConfig> = {
  ZONE_ADMOB: {
    tagId: 'admob-8469220759',
    name: 'Google AdMob / AdSense ca-app-pub-1639291014874354~8469220759',
    type: 'admob',
    adUnitId: ADMOB_APP_ID,
    directUrl: DIRECT_AD_URL
  },
  ZONE_459144: {
    tagId: 459144,
    name: 'WPAdMngr Prime Zone 459144',
    type: 'banner',
    adUnitId: ADMOB_APP_ID,
    directUrl: DIRECT_AD_URL
  },
  ZONE_459143: {
    tagId: 459143,
    name: 'WPAdMngr Elite Zone 459143',
    type: 'banner',
    adUnitId: ADMOB_APP_ID,
    directUrl: DIRECT_AD_URL
  },
  ZONE_458074: {
    tagId: 458074,
    name: 'WPAdMngr Legacy Zone 458074',
    type: 'banner',
    adUnitId: ADMOB_APP_ID,
    directUrl: DIRECT_AD_URL
  },
  ZONE_458075: {
    tagId: 458075,
    name: 'WPAdMngr Legacy Zone 458075',
    type: 'banner',
    adUnitId: ADMOB_APP_ID,
    directUrl: DIRECT_AD_URL
  },
  ZONE_DIRECT: {
    tagId: 'direct',
    name: 'Featured Premium Sponsor',
    type: 'direct',
    adUnitId: ADMOB_APP_ID,
    directUrl: DIRECT_AD_URL
  }
};

let isClickListenerAttached = false;
let clickCounter = 0;
let lastAdTriggerTime = 0;

/**
 * Initializes a global click handler that monitors user interactions across all buttons and pages,
 * triggering the ad link and Google AdMob/AdSense impressions on user clicks.
 */
export function setupGlobalAdClickListener(): void {
  if (typeof window === 'undefined' || isClickListenerAttached) return;
  isClickListenerAttached = true;

  document.addEventListener('click', (event) => {
    clickCounter++;
    const target = event.target as HTMLElement | null;
    const isClickable = target?.closest('button, a, [role="button"], input[type="submit"], .cursor-pointer, .interactive-card, [data-ad-trigger="true"]');
    
    // Check if this click should trigger the ad link / impression
    const now = Date.now();
    if (isClickable && (now - lastAdTriggerTime > 15000 || clickCounter % 6 === 0)) {
      lastAdTriggerTime = now;
      console.log(`[Ad Monetization ${ADMOB_APP_ID}] Global click #${clickCounter} registered.`);
      
      try {
        if ((window as any).a3klsam && typeof (window as any).a3klsam.init === 'function') {
          (window as any).a3klsam.init(459144);
        }
      } catch {
        // silent
      }

      try {
        if ((window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch {
        // silent
      }
    }
  }, { capture: true, passive: true });
}

/**
 * Trigger an ad view or sponsor visit and execute a callback
 */
export function triggerSponsorAd(zoneKey: keyof typeof ACTIVE_AD_ZONES = 'ZONE_459144', onComplete?: () => void): void {
  const zone = ACTIVE_AD_ZONES[zoneKey] || ACTIVE_AD_ZONES.ZONE_ADMOB || ACTIVE_AD_ZONES.ZONE_459144;
  sound.playClick();

  // If window.a3klsam ad manager is initialized from script, invoke it
  try {
    if (typeof window !== 'undefined' && (window as any).a3klsam && typeof (window as any).a3klsam.init === 'function') {
      (window as any).a3klsam.init(Number(zone.tagId) || 459144);
    }
  } catch (e) {
    console.debug('Ad manager init invoke:', e);
  }

  // If Google AdSense/AdMob adsbygoogle is available, trigger push
  try {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    }
  } catch (e) {
    console.debug('AdMob adsbygoogle push:', e);
  }

  // Open direct sponsor URL in new tab safely
  if (zone.directUrl && typeof window !== 'undefined') {
    const win = window.open(zone.directUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = zone.directUrl;
    }
  }

  if (onComplete) {
    setTimeout(onComplete, 600);
  }
}

