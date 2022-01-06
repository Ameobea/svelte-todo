import type { RequestHandler } from '@sveltejs/kit';

import { createBoard, getAllBoards } from 'src/db/dbUtil';

export const post: RequestHandler = ({ url }) => {
  const boardName = url.searchParams.get('boardName');
  if (!boardName) {
    return { status: 400, body: 'Missing `boardName` query param' };
  }

  const createdBoardID = createBoard(boardName);
  return { body: { createdBoardID } };
};

export const get: RequestHandler = () => {
  const allBoards = getAllBoards();
  return { status: 200, body: allBoards };
};
