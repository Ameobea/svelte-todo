import { type RequestHandler, error, json } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import { draw } from 'io-ts/lib/Decoder.js';

import { getLastActiveBoardID, setLastActiveBoardID } from '../../db/dbUtil';
import { NumberFromString } from '../../types';

export const POST: RequestHandler = ({ url }) => {
  const rawBoardID = url.searchParams.get('boardID');
  if (!rawBoardID) {
    throw error(400, 'Missing `boardID` query param');
  }

  const boardIDParseRes = NumberFromString.decode(rawBoardID);
  if (isLeft(boardIDParseRes)) {
    throw error(400, `Invalid boardID provided: ${draw(boardIDParseRes.left)}`);
  }
  const boardID = boardIDParseRes.right;

  setLastActiveBoardID(boardID);
  return new Response(null, { status: 204 });
};

export const GET: RequestHandler = () => {
  const lastActiveBoardID = getLastActiveBoardID();
  return json(lastActiveBoardID);
};
