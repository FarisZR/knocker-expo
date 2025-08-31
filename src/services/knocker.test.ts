import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { knock } from './knocker';

describe('Knocker Service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('knock', () => {
    it('should return whitelist data on a successful knock', async () => {
      const endpoint = 'http://localhost:8080';
      const token = 'test-token';
      const responseData = {
        whitelisted_entry: '127.0.0.1',
        expires_at: 1678886400,
        expires_in_seconds: 3600,
      };

      mock.onPost(`${endpoint}/knock`).reply(200, responseData);

      const result = await knock(endpoint, token);
      expect(result).toEqual(responseData);
    });

    it('should throw an error for an invalid token', async () => {
      const endpoint = 'http://localhost:8080';
      const token = 'invalid-token';

      mock.onPost(`${endpoint}/knock`).reply(401, { error: 'Unauthorized' });

      await expect(knock(endpoint, token)).rejects.toThrow('Request failed with status code 401');
    });

    it('should throw an error for a forbidden request', async () => {
      const endpoint = 'http://localhost:8080';
      const token = 'test-token';
      const ipAddress = '8.8.8.8';

      mock.onPost(`${endpoint}/knock`).reply(403, { error: 'Forbidden' });

      await expect(knock(endpoint, token, { ip_address: ipAddress })).rejects.toThrow('Request failed with status code 403');
    });

    it('should throw an error for a bad request', async () => {
        const endpoint = 'http://localhost:8080';
        const token = 'test-token';
        const ipAddress = 'invalid-ip';
  
        mock.onPost(`${endpoint}/knock`).reply(400, { error: 'Bad Request' });
  
        await expect(knock(endpoint, token, { ip_address: ipAddress })).rejects.toThrow('Request failed with status code 400');
    });

    it('should handle network errors', async () => {
      const endpoint = 'http://localhost:8080';
      const token = 'test-token';

      mock.onPost(`${endpoint}/knock`).networkError();

      await expect(knock(endpoint, token)).rejects.toThrow('Network Error');
    });
  });
});