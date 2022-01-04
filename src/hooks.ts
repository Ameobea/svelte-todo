import type { Handle } from '@sveltejs/kit';

import { authenticateRequest } from './auth';

export const handle: Handle = async ({ request, resolve }) => {
  if (
    ['DELETE', 'PATCH', 'PUT', 'DELETE'].includes(request.method) &&
    !(request.url?.pathname.startsWith('/todos/') && request.url.pathname.length > 7 && request.method === 'PATCH')
  ) {
    const authRes = authenticateRequest(request);
    if (authRes) {
      return authRes;
    }
  }

  return resolve(request);
};
