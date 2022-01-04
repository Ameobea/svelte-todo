import type { RequestHandler } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

import { createTodo, getAllTodos, getTodoByID } from 'src/db/dbUtil';
import { PositiveInt } from 'src/types';

export const get: RequestHandler = () => {
  const allTodos = getAllTodos();
  return { body: allTodos };
};

const CreateTodoRequest = t.type({
  content: t.string,
  state: PositiveInt,
});
export const post: RequestHandler = ({ body }) => {
  const parsed = CreateTodoRequest.decode(body);
  if (isLeft(parsed)) {
    return {
      status: 400,
      body: `Invalid request body: ${PathReporter.report(parsed)}`,
    };
  }

  const req = parsed.right;
  const insertedID = createTodo(req.content, req.state);
  console.log(`Created todo with id=${insertedID}`);
  const todo = getTodoByID(`${insertedID}`);
  if (!todo) {
    throw new Error('Inserted todo was not found just after creating it');
  }
  return { body: { ...todo } };
};
