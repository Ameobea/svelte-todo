import { type RequestHandler, error, json } from '@sveltejs/kit';

import { createBoard, getAllBoards } from '../../db/dbUtil';

export const POST: RequestHandler = ({ url }) => {
  const boardName = url.searchParams.get('boardName');
  if (!boardName) {
    throw error(400, 'Missing `boardName` query param');
  }

  const createdBoardID = createBoard(boardName);
  return json({ createdBoardID });
};

export const GET: RequestHandler = () => {
  const allBoards = getAllBoards();
  return json(allBoards);
};
