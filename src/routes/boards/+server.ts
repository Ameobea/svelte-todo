import type { RequestHandler } from '@sveltejs/kit';

import { createBoard, getAllBoards } from 'src/db/dbUtil';

export const POST: RequestHandler = ({ url }) => {
  const boardName = url.searchParams.get('boardName');
  if (!boardName) {
    return new Response('Missing `boardName` query param', { status: 400 });
  }

  const createdBoardID = createBoard(boardName);
  return new Response(JSON.stringify({ createdBoardID }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: RequestHandler = () => {
  return new Response(JSON.stringify(getAllBoards()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
