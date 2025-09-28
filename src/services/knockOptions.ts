import { getItem } from './storage';

export interface KnockOptions {
  ip_address?: string;
 ttl?: number;
}

interface NormalizedKnockOptions extends KnockOptions {
  effectiveTtl?: number;
  isAndroidSchedulerCompatible: boolean;
}

/**
 * Normalizes TTL value according to Android scheduler requirements.
 * If TTL is below the minimum, it returns the minimum value as effective TTL.
 * @param ttl The raw TTL value
 * @returns Object containing the original TTL, effective TTL, and compatibility status
 */
export function normalizeTtlForAndroidScheduler(ttl: number | undefined): { originalTtl?: number; effectiveTtl?: number; isAndroidSchedulerCompatible: boolean } {
  if (typeof ttl !== 'number' || isNaN(ttl)) {
    return { originalTtl: undefined, effectiveTtl: undefined, isAndroidSchedulerCompatible: true };
  }

  const ANDROID_SCHEDULER_MIN_INTERVAL = 15 * 60; // 900 seconds
  const isCompatible = ttl >= ANDROID_SCHEDULER_MIN_INTERVAL;
  
  return {
    originalTtl: ttl,
    effectiveTtl: isCompatible ? ttl : ANDROID_SCHEDULER_MIN_INTERVAL,
    isAndroidSchedulerCompatible: isCompatible,
  };
}

/**
 * Read TTL and IP address from storage and normalize values for knock().
 * Includes Android scheduler compatibility information.
 */
export async function getKnockOptions(): Promise<NormalizedKnockOptions> {
  const ttlRaw = await getItem('knocker-ttl');
  const ip = await getItem('knocker-ip');
  const ttlNum = ttlRaw ? Number(ttlRaw) : undefined;
  const ttlObj = normalizeTtlForAndroidScheduler(ttlNum);

  return {
    ttl: ttlObj.originalTtl,
    effectiveTtl: ttlObj.effectiveTtl,
    isAndroidSchedulerCompatible: ttlObj.isAndroidSchedulerCompatible,
    ip_address: ip || undefined,
  };
}