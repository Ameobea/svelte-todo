import { type RequestHandler, error, json } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

import { createTodo, getAllTodosForBoard, getTodoByID } from '../../db/dbUtil';
import { PositiveInt } from '../../types';

export const GET: RequestHandler = ({ url }) => {
  const boardID = url.searchParams.get('boardID');
  if (!boardID) {
    throw error(400, 'Missing `boardID` query param');
  }

  const allTodos = getAllTodosForBoard(boardID);
  return json(allTodos);
};

const CreateTodoRequest = t.type({
  content: t.string,
  state: PositiveInt,
});
export const POST: RequestHandler = async ({ url, request }) => {
  const body = await request.json();
  const boardID = url.searchParams.get('boardID');
  if (!boardID) {
    throw error(400, 'Missing `boardID` query param');
  }

  const parsed = CreateTodoRequest.decode(body);
  if (isLeft(parsed)) {
    throw error(400, `Invalid request body: ${PathReporter.report(parsed)}`);
  }

  const req = parsed.right;
  const insertedID = createTodo(req.content, req.state, +boardID);
  console.log(`Created todo with id=${insertedID}`);
  const todo = getTodoByID(`${insertedID}`);
  if (!todo) {
    throw error(500, 'Inserted todo was not found just after creating it');
  }
  return json(todo);
};
