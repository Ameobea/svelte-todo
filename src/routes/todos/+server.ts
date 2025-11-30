import type { RequestHandler } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

import { createTodo, getAllTodosForBoard, getTodoByID } from 'src/db/dbUtil';
import { PositiveInt } from 'src/types';

export const GET: RequestHandler = ({ url }) => {
  const boardID = url.searchParams.get('boardID');
  if (!boardID) {
    return new Response('Missing `boardID` query param', { status: 400 });
  }

  const allTodos = getAllTodosForBoard(boardID);
  return new Response(JSON.stringify(allTodos), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

const CreateTodoRequest = t.type({
  content: t.string,
  state: PositiveInt,
});

export const POST: RequestHandler = async ({ url, request }) => {
  const boardID = url.searchParams.get('boardID');
  if (!boardID) {
    return new Response('Missing `boardID` query param', { status: 400 });
  }

  const body = await request.json();
  if (!body) {
    return new Response('Missing request body', { status: 400 });
  }
  const parsed = CreateTodoRequest.decode(body);
  if (isLeft(parsed)) {
    return new Response(`Invalid request body: ${PathReporter.report(parsed)}`, { status: 400 });
  }

  const req = parsed.right;
  const insertedID = createTodo(req.content, req.state, +boardID);
  console.log(`Created todo with id=${insertedID}`);
  const todo = getTodoByID(`${insertedID}`);
  if (!todo) {
    throw new Error('Inserted todo was not found just after creating it');
  }
  return new Response(JSON.stringify({ ...todo }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
