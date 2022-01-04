import type { ServerRequest, ServerResponse } from '@sveltejs/kit/types/hooks';

import { ExpectedBasicAuthValue } from './conf';

export const authenticateRequest = (req: ServerRequest<Record<string, any>, unknown>): ServerResponse | null => {
  const auth = req.headers['authorization'];
  if (auth !== `Basic ${ExpectedBasicAuthValue}`) {
    console.warn('Invalid or missing auth; sending back 401');
    return {
      status: 401,
      body: `Invalid or missing authentication credentials`,
      headers: { 'WWW-Authenticate': 'Basic realm="User Visible Realm", charset="UTF-8"' },
    };
  }

  console.log('Successfully authenticated request');
  return null;
};
