import type { Handle } from '@sveltejs/kit';

import { authenticateRequest } from './auth';

export const handle: Handle = async ({ request, resolve }) => {
  if (
    ['DELETE', 'PATCH', 'PUT', 'DELETE', 'POST'].includes(request.method) &&
    !(request.url?.pathname.startsWith('/todos/') && request.url.pathname.length > 7 && request.method === 'PATCH')
  ) {
    const authRes = authenticateRequest(request);
    if (authRes) {
      if (request.url.pathname.includes('/activeBoardID')) {
        return { status: 203, headers: {} };
      } else {
        return authRes;
      }
    }
  }

  return resolve(request);
};
