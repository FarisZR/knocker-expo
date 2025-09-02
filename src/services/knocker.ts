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

/**
 * Perform a knock request.
 * Catches 403 responses and throws a clearer error across web / android / iOS.
 */
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

  try {
    const response = await axios.post(`${endpoint}/knock`, data, {
      headers,
    });

    return response.data;
  } catch (err: any) {
    // If the server returned a response (non-2xx), surface a clear error using status and any server message.
    if (err?.response) {
      const status = err.response.status;
      const statusText = err.response.statusText || '';
      const serverMessage =
        typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data?.error || err.response.data?.message || '';

      // Build a readable label from available pieces (status, statusText, server message).
      const pieces = [String(status)];
      if (statusText) pieces.push(statusText);
      if (serverMessage) pieces.push(serverMessage);
      const label = pieces.join(' ');

      if (status === 403) {
        // Keep the helpful, permission-related hint for forbidden responses.
        throw new Error(`${label} — are you sure your token has enough permissions for all options?`);
      }

      // For other HTTP errors, surface the status and server message if any.
      throw new Error(label);
    }

    // In some environments axios surfaces a generic "Network Error" without a response object.
    // Convert that into a more actionable message so callers can show a helpful hint.
    if (err?.message === 'Network Error' && !err?.response) {
      throw new Error(
        'Network Error — request sent but no response received (possible CORS, network failure, or server blocked the response)'
      );
    }

    // Re-throw original error for other cases (e.g., offline, DNS failure).
    throw err;
  }
};