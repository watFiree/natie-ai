const TICKTICK_API_BASE = 'https://api.ticktick.com/open/v1';

export type TokenProvider = () => Promise<string>;

export function createTickTickClient(token: string) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return {
    async get(path: string): Promise<unknown> {
      const response = await fetch(`${TICKTICK_API_BASE}${path}`, { headers });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`TickTick API GET ${path} failed (${response.status}): ${text}`);
      }
      return response.json();
    },

    async post(path: string, body?: unknown): Promise<unknown> {
      const response = await fetch(`${TICKTICK_API_BASE}${path}`, {
        method: 'POST',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`TickTick API POST ${path} failed (${response.status}): ${text}`);
      }
      const text = await response.text();
      if (!text) return null;
      return JSON.parse(text);
    },

    async put(path: string, body?: unknown): Promise<unknown> {
      const response = await fetch(`${TICKTICK_API_BASE}${path}`, {
        method: 'PUT',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`TickTick API PUT ${path} failed (${response.status}): ${text}`);
      }
      const text = await response.text();
      if (!text) return null;
      return JSON.parse(text);
    },

    async delete(path: string): Promise<void> {
      const response = await fetch(`${TICKTICK_API_BASE}${path}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`TickTick API DELETE ${path} failed (${response.status}): ${text}`);
      }
    },
  };
}
