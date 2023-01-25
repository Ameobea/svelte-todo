import { type RequestHandler, json, error } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

import { deleteTodoById, getTodoByID, updateTodo } from '../../../db/dbUtil';
import { PositiveInt, type Todo } from '../../../types';

export const GET: RequestHandler = ({ params: { id } }) => {
  if (!id) {
    throw error(400, 'No id provided');
  }
  const todo = getTodoByID(id);
  if (!todo) {
    throw error(404);
  }
  return json(todo);
};

export const DELETE: RequestHandler = ({ params: { id } }) => {
  if (!id) {
    throw error(400, 'No id provided');
  }
  const deleted = deleteTodoById(id);
  if (deleted) {
    return new Response(null, { status: 204 });
  } else {
    throw error(404, 'No todo found with provided id');
  }
};

const TodoModel = t.type({
  id: PositiveInt,
  content: t.string,
  state: PositiveInt,
});
export const PATCH: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const parsed = TodoModel.decode(body);
  if (isLeft(parsed)) {
    throw error(400, `Invalid request body: ${PathReporter.report(parsed)}`);
  }
  const todo: Todo = parsed.right;
  const updated = updateTodo(todo);
  if (updated) {
    return new Response(null, { status: 204 });
  } else {
    throw error(404, 'No todo found with provided id');
  }
};
