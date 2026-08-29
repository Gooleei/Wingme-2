import React, { useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { sound } from './audio';

export interface AdZoneConfig {
  tagId: number | string;
  name: string;
  type: 'banner' | 'native' | 'direct';
  directUrl?: string;
  format?: string;
}

export const ACTIVE_AD_ZONES: Record<string, AdZoneConfig> = {
  ZONE_459144: {
    tagId: 459144,
    name: 'WPAdMngr Prime Zone 459144',
    type: 'banner',
    directUrl: 'https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c'
  },
  ZONE_459143: {
    tagId: 459143,
    name: 'WPAdMngr Elite Zone 459143',
    type: 'banner',
    directUrl: 'https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c'
  },
  ZONE_458074: {
    tagId: 458074,
    name: 'WPAdMngr Legacy Zone 458074',
    type: 'banner',
    directUrl: 'https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c'
  },
  ZONE_458075: {
    tagId: 458075,
    name: 'WPAdMngr Legacy Zone 458075',
    type: 'banner',
    directUrl: 'https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c'
  },
  ZONE_DIRECT: {
    tagId: 'direct',
    name: 'Featured Premium Sponsor',
    type: 'direct',
    directUrl: 'https://www.profitableratecpmnetwork.com/eg93q7e37?key=7708673c87da2f16677aa4d28db3034c'
  }
};

/**
 * Trigger an ad view or sponsor visit and execute a callback
 */
export function triggerSponsorAd(zoneKey: keyof typeof ACTIVE_AD_ZONES = 'ZONE_459144', onComplete?: () => void): void {
  const zone = ACTIVE_AD_ZONES[zoneKey] || ACTIVE_AD_ZONES.ZONE_459144;
  sound.playClick();

  // If window.a3klsam ad manager is initialized from script, invoke it
  try {
    if (typeof window !== 'undefined' && (window as any).a3klsam && typeof (window as any).a3klsam.init === 'function') {
      (window as any).a3klsam.init(Number(zone.tagId) || 459144);
    }
  } catch (e) {
    console.debug('Ad manager init invoke:', e);
  }

  // Open direct sponsor URL in new tab safely
  if (zone.directUrl && typeof window !== 'undefined') {
    const win = window.open(zone.directUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = zone.directUrl;
    }
  }

  if (onComplete) {
    setTimeout(onComplete, 800);
  }
}
