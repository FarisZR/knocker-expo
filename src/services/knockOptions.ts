import { getItem } from './storage';

export interface KnockOptions {
  ip_address?: string;
  ttl?: number;
}

/**
 * Read TTL and IP address from storage and normalize values for knock().
 */
export async function getKnockOptions(): Promise<KnockOptions> {
  const ttlRaw = await getItem('knocker-ttl');
  const ip = await getItem('knocker-ip');
  const ttlNum = ttlRaw ? Number(ttlRaw) : undefined;

  return {
    ttl: typeof ttlNum === 'number' && !isNaN(ttlNum) ? ttlNum : undefined,
    ip_address: ip || undefined,
  };
}