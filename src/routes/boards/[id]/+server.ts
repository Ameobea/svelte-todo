import type { RequestHandler } from '@sveltejs/kit';
import { archiveBoardByID, deleteBoardByID, unarchiveBoardByID } from 'src/db/dbUtil';

export const DELETE: RequestHandler = ({ params: { id } }) => {
  if (typeof id !== 'string') {
    return new Response('Invalid or missing id parameter', { status: 400 });
  }
  const deleted = deleteBoardByID(+id);
  if (deleted) {
    return new Response(null, { status: 204 });
  } else {
    return new Response('No board found with provided id', { status: 404 });
  }
};

export const PATCH: RequestHandler = async ({ params: { id }, request }) => {
  if (typeof id !== 'string') {
    return new Response('Invalid or missing id parameter', { status: 400 });
  }

  const body = await request.json();
  const { archived } = body;

  if (typeof archived !== 'boolean') {
    return new Response('Invalid or missing archived parameter', { status: 400 });
  }

  const success = archived ? archiveBoardByID(+id) : unarchiveBoardByID(+id);
  if (success) {
    return new Response(null, { status: 204 });
  } else {
    return new Response('No board found with provided id', { status: 404 });
  }
};
