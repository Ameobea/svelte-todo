import type { RequestHandler } from '@sveltejs/kit';
import { isLeft } from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

import { deleteTodoById, getTodoByID, updateTodo } from 'src/db/dbUtil';
import { PositiveInt, type Todo } from 'src/types';

export const GET: RequestHandler = ({ params: { id } }) => {
  if (typeof id !== 'string') {
    return new Response('Invalid or missing id parameter', { status: 400 });
  }
  const todo = getTodoByID(id);
  if (!todo) {
    return new Response(null, { status: 404 });
  }
  return new Response(JSON.stringify({ ...todo }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: RequestHandler = ({ params: { id } }) => {
  if (typeof id !== 'string') {
    return new Response('Invalid or missing id parameter', { status: 400 });
  }
  const deleted = deleteTodoById(id);
  if (deleted) {
    return new Response(null, { status: 204 });
  } else {
    return new Response('No todo found with provided id', { status: 404 });
  }
};

const TodoModel = t.type({
  id: PositiveInt,
  content: t.string,
  state: PositiveInt,
});

export const PATCH: RequestHandler = async ({ request, params: { id } }) => {
  if (typeof id !== 'string') {
    return new Response('Invalid or missing id parameter', { status: 400 });
  }

  const body = await request.json();
  const parsed = TodoModel.decode(body);
  if (isLeft(parsed)) {
    return new Response(`Invalid request body: ${PathReporter.report(parsed)}`, { status: 400 });
  }
  const todo: Todo = { ...parsed.right, id: +id };
  const updated = updateTodo(todo);
  if (updated) {
    return new Response(null, { status: 204 });
  } else {
    return new Response('No todo found with provided id', { status: 404 });
  }
};
