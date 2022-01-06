import type { RequestHandler } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

import { createTodo, getAllTodosForBoard, getTodoByID } from 'src/db/dbUtil';
import { PositiveInt } from 'src/types';

export const get: RequestHandler = ({ url }) => {
  const boardID = url.searchParams.get('boardID');
  if (!boardID) {
    return { status: 400, body: 'Missing `boardID` query param' };
  }

  const allTodos = getAllTodosForBoard(boardID);
  return { body: allTodos };
};

const CreateTodoRequest = t.type({
  content: t.string,
  state: PositiveInt,
});
export const post: RequestHandler = ({ url, body }) => {
  const boardID = url.searchParams.get('boardID');
  if (!boardID) {
    return { status: 400, message: 'Missing `boardID` query param' };
  }

  const parsed = CreateTodoRequest.decode(body);
  if (isLeft(parsed)) {
    return {
      status: 400,
      body: `Invalid request body: ${PathReporter.report(parsed)}`,
    };
  }

  const req = parsed.right;
  const insertedID = createTodo(req.content, req.state, +boardID);
  console.log(`Created todo with id=${insertedID}`);
  const todo = getTodoByID(`${insertedID}`);
  if (!todo) {
    throw new Error('Inserted todo was not found just after creating it');
  }
  return { body: { ...todo } };
};
