import { buildApiUrl } from './api-url';

const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return c.json();
  }

  if (contentType && contentType.includes('application/pdf')) {
    return c.blob() as Promise<T>;
  }

  return c.text() as Promise<T>;
};

const getUrl = (url: string): string => {
  return buildApiUrl(url);
};

export const customInstance = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const requestUrl = getUrl(url);

  const requestInit: RequestInit = {
    credentials: 'include',
    ...options,
  };

  const response = await fetch(requestUrl, requestInit);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Request failed with status ${response.status}: ${errorBody}`
    );
  }

  const data = await getBody<T>(response);

  return { status: response.status, data, headers: response.headers } as T;
};
