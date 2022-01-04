import type { RequestHandler } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

import { deleteTodoById, getTodoByID, updateTodo } from 'src/db/dbUtil';
import { PositiveInt, Todo } from 'src/types';

export const get: RequestHandler = ({ params: { id } }) => {
  const todo = getTodoByID(id);
  if (!todo) {
    return { status: 404 };
  }
  return { status: 200, body: { ...todo } };
};

export const del: RequestHandler = ({ params: { id } }) => {
  const deleted = deleteTodoById(id);
  if (deleted) {
    return { status: 204 };
  } else {
    return { status: 404, body: 'No todo found with provided id' };
  }
};

const TodoModel = t.type({
  id: PositiveInt,
  content: t.string,
  state: PositiveInt,
});
export const patch: RequestHandler = req => {
  const parsed = TodoModel.decode(req.body);
  if (isLeft(parsed)) {
    return {
      status: 400,
      body: `Invalid request body: ${PathReporter.report(parsed)}`,
    };
  }
  const todo: Todo = parsed.right;
  const updated = updateTodo(todo);
  if (updated) {
    return { status: 204 };
  } else {
    return { status: 404, body: 'No todo found with provided id' };
  }
};
