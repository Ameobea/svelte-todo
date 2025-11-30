import type { Handle } from '@sveltejs/kit';

import { authenticateRequest } from './auth';

export const handle: Handle = async ({ event, resolve }) => {
  const { request, url } = event;
  if (
    ['DELETE', 'PATCH', 'PUT', 'DELETE', 'POST'].includes(request.method) &&
    !(url.pathname.startsWith('/todos/') && url.pathname.length > 7 && request.method === 'PATCH')
  ) {
    const authRes = authenticateRequest(request);
    if (authRes) {
      if (url.pathname.includes('/activeBoardID')) {
        return new Response(null, { status: 203 });
      } else {
        return authRes;
      }
    }
  }

  const response = await resolve(event);
  return response;
};
