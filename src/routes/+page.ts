import { type Load, error } from '@sveltejs/kit';

import type { Todo } from '../types';
import { groupTodosByState } from '../util';

export const load: Load = async ({ fetch }) => {
  let boards: { name: string; id: number }[];
  let fetchedTodos: Todo[] = [];
  let activeBoardID: number | undefined = undefined;
  try {
    const [boardsRes, lastActiveBoardID] = await Promise.all([
      fetch('/boards'),
      fetch('/activeBoardID')
        .then(async res => {
          if (!res.ok) {
            throw await res.text();
          }
          return (await res.json()) as number | null;
        })
        .catch(err => {
          console.error('Failed to fetch last active board ID: ', err);
          return null;
        }),
    ]);

    if (!boardsRes.ok) {
      throw error(boardsRes.status, `Failed to load boards: ${await boardsRes.text()}`);
    }

    boards = await boardsRes.json();
    activeBoardID = lastActiveBoardID ?? boards[0]?.id;
    if (!boards.some(board => board.id === activeBoardID)) {
      activeBoardID = undefined;
    }

    if (activeBoardID !== undefined) {
      const todosRes = await fetch(`/todos?boardID=${activeBoardID}`);

      if (!todosRes.ok) {
        const errText = await todosRes.text().catch(() => 'Unknown error');
        console.error('Error fetching todos: ', errText);
        throw error(todosRes.status, `Failed to load todos: ${errText}`);
      }
      fetchedTodos = await todosRes.json();
    }
  } catch (err) {
    console.error(`Error fetching todos: ${err}`);
    throw error(500, 'Error fetching todos');
  }

  const todosByState = groupTodosByState(fetchedTodos);

  return {
    todosByStateByBoardID: activeBoardID === undefined ? {} : { [activeBoardID]: todosByState },
    boards,
    activeBoardID,
  };
};
