import { Request, Response } from 'express';

export interface MockRequestOptions<P = any, B = any> {
  params?: P;
  body?: B;
  query?: any;
  headers?: Record<string, string>;
}

export const createMockRequest = <P = any, B = any>(options: MockRequestOptions<P, B> = {}): Partial<Request> => {
  return {
    params: options.params || {},
    body: options.body || {},
    query: options.query || {},
    headers: options.headers || {},
  };
};

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

export const createTestRequest = <P = any, B = any>(options: MockRequestOptions<P, B> = {}) => {
  return {
    req: createMockRequest(options),
    res: createMockResponse(),
  };
}; 