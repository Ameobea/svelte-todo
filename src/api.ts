import type { Todo } from './types';

export const updateTodo = async (newTodo: Todo) =>
  fetch(`/todos/${newTodo.id}`, {
    method: 'PATCH',
    body: JSON.stringify(newTodo),
    headers: { 'Content-Type': 'application/json' },
  }).then(async res => {
    console.log('Status from updating todo: ', res.status);
    if (!res.ok) {
      throw await res.text;
    }
  });

export const deleteTodo = async (id: string | number) => fetch(`/todos/${id}`, { method: 'DELETE' });

export const createTodo = async (content: string, state: number, boardID: number): Promise<Todo> =>
  fetch(`/todos?boardID=${boardID}`, {
    method: 'POST',
    body: JSON.stringify({ content, state }),
    headers: { 'Content-Type': 'application/json' },
  }).then(async res => {
    if (!res.ok) {
      throw await res.text();
    }
    return res.json();
  });
