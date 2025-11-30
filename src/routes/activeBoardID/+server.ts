import type { RequestHandler } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import { draw } from 'io-ts/lib/Decoder.js';

import { getLastActiveBoardID, setLastActiveBoardID } from 'src/db/dbUtil';
import { NumberFromString } from 'src/types';

export const POST: RequestHandler = ({ url }) => {
  const rawBoardID = url.searchParams.get('boardID');
  if (!rawBoardID) {
    return new Response('Missing `boardID` query param', { status: 400 });
  }

  const boardIDParseRes = NumberFromString.decode(rawBoardID);
  if (isLeft(boardIDParseRes)) {
    return new Response(`Invalid boardID provided: ${draw(boardIDParseRes.left)}`, { status: 400 });
  }
  const boardID = boardIDParseRes.right;

  setLastActiveBoardID(boardID);
  return new Response(null, { status: 204 });
};

export const GET: RequestHandler = () => {
  const lastActiveBoardID = getLastActiveBoardID();
  return new Response(JSON.stringify(lastActiveBoardID), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
