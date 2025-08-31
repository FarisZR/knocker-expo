import axios from 'axios';

interface KnockResponse {
  whitelisted_entry: string;
  expires_at: number;
  expires_in_seconds: number;
}

interface KnockOptions {
  ip_address?: string;
  ttl?: number;
}

export const knock = async (
  endpoint: string,
  token: string,
  options: KnockOptions = {}
): Promise<KnockResponse> => {
  const { ip_address, ttl } = options;
  const headers: Record<string, string> = {
    'X-Api-Key': token,
  };

  const data: Record<string, any> = {};
  if (ip_address) {
    data.ip_address = ip_address;
  }
  if (ttl) {
    data.ttl = ttl;
  }

  const response = await axios.post(`${endpoint}/knock`, data, {
    headers,
  });

  return response.data;
};