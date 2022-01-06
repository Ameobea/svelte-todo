import type { RequestHandler } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import { draw } from 'io-ts/lib/Decoder.js';

import { getLastActiveBoardID, setLastActiveBoardID } from 'src/db/dbUtil';
import { NumberFromString } from 'src/types';

export const post: RequestHandler = ({ url }) => {
  const rawBoardID = url.searchParams.get('boardID');
  if (!rawBoardID) {
    return { status: 400, body: 'Missing `boardID` query param' };
  }

  const boardIDParseRes = NumberFromString.decode(rawBoardID);
  if (isLeft(boardIDParseRes)) {
    return { status: 400, body: `Invalid boardID provided: ${draw(boardIDParseRes.left)}` };
  }
  const boardID = boardIDParseRes.right;

  setLastActiveBoardID(boardID);
  return { status: 204 };
};

export const get: RequestHandler = () => {
  const lastActiveBoardID = getLastActiveBoardID();
  return { body: lastActiveBoardID };
};
