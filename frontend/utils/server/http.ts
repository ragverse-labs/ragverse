import { NextApiRequest } from 'next';

import { Headers } from '@/agent/plugins/requests';

export const extractHeaders = (request: Request | NextApiRequest): Headers => {
  let result: Record<string, string> = {};
  if (request instanceof Request) {
    let ite = request.headers.entries();
    let entry = ite.next();
    while (!entry.done) {
      result[entry.value[0]] = entry.value[1];
      entry = ite.next();
    }
    return result;
  } else {
    const headers = (request as NextApiRequest).headers;
    for (const key in headers) {
      result[key] = headers[key]?.toString() || '';
    }
  }
  return result;
};
