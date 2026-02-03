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
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'productionBaseUrl'
        : 'http://localhost:3000';
  
    const requestUrl = new URL(`${baseUrl}${url}`);
  
    return requestUrl.toString();
  };
  
  export const customInstance = async <T>(
    url: string,
    options: RequestInit,
  ): Promise<T> => {
    const requestUrl = getUrl(url);
  
    const requestInit: RequestInit = {
      credentials: 'include',
      ...options,
    };
  
    const response = await fetch(requestUrl, requestInit);
    const data = await getBody<T>(response);
  
    return { status: response.status, data, headers: response.headers } as T;
  };