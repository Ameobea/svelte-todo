<script context="module" lang="ts">
  const ColumnTitles = ['Backlog', 'To-Do', 'WIP', 'Done'];

  const groupTodosByState = (todos: Todo[]): Todo[][] => {
    const todosByState: Todo[][] = new Array(ColumnTitles.length).fill(null).map(() => []);
    todos.forEach(todo => todosByState[todo.state].push(todo));
    return todosByState;
  };

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
        return { status: boardsRes.status, error: new Error(`Failed to load boards: ${await boardsRes.text()}`) };
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
          return {
            status: todosRes.status,
            error: new Error(`Failed to load todos: ${errText}`),
          };
        }
        fetchedTodos = await todosRes.json();
      }
    } catch (err) {
      console.error(`Error fetching todos: ${err}`);
      return { status: 500, error: 'Error fetching todos' };
    }

    const todos = { type: 'loaded' };

    const todosByState =
      todos.type === 'loaded'
        ? groupTodosByState(fetchedTodos)
        : new Array(ColumnTitles.length).fill(null).map(() => []);

    return {
      props: {
        todosByStateByBoardID: activeBoardID === undefined ? {} : { [activeBoardID]: todosByState },
        todos,
        boards,
        activeBoardID,
      },
    };
  };
</script>

<script lang="ts">
  import type { Load } from '@sveltejs/kit';
  import BoardPicker from 'src/components/BoardPicker.svelte';

  import TodoColumn from 'src/components/TodoColumn.svelte';
  import type { Todo } from 'src/types';

  export let todos: { type: 'loading' } | { type: 'loaded' } | { type: 'error'; message: string } = {
    type: 'loading',
  };
  export let boards: { name: string; id: number }[];
  export let activeBoardID: number | undefined;
  export let todosByStateByBoardID: { [boardID: number]: Todo[][] };
  $: if (activeBoardID !== undefined && !todosByStateByBoardID[activeBoardID]) {
    todosByStateByBoardID[activeBoardID] = new Array(ColumnTitles.length).fill(null).map(() => []);
  }

  // Re-fetch todos from backend when active board id is switched
  let lastActiveBoardID: number | undefined = activeBoardID;
  $: if (activeBoardID !== lastActiveBoardID && activeBoardID !== undefined) {
    console.log('Re-fetching todos for board', { activeBoardID });
    lastActiveBoardID = activeBoardID;
    const activeBoardIDCopy = activeBoardID;
    fetch(`/todos?boardID=${activeBoardIDCopy}`).then(async res => {
      if (!res.ok) {
        throw await res.text();
      }
      res.json().then(todosForActiveBoard => {
        console.log('Fetched todos for board', { activeBoardID: activeBoardIDCopy, todosForActiveBoard });
        todosByStateByBoardID[activeBoardIDCopy] = groupTodosByState(todosForActiveBoard);
      });
    });
  }
</script>

<svelte:head>
  <title>Sveltekit Todo</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
</svelte:head>

<div class="root">
  <BoardPicker bind:boards bind:activeBoardID />
  {#if activeBoardID === undefined}
    <span style="color: orange">No Board Selected; TODO</span>
  {:else if todos.type === 'error'}
    <span style="color: red">Error fetching todos: {todos.message}</span>
  {:else}
    <div class="columns-container">
      {#each ColumnTitles as title, state}
        <TodoColumn
          {title}
          bind:todos={todosByStateByBoardID[activeBoardID][state]}
          colIx={state}
          boardID={activeBoardID}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(body) {
    background-color: #121212;
    color: #ccc;
    font-family: 'PT Sans', sans-serif;
    margin: 0;
    padding: 0;
    height: 100vh;
  }

  :global(#svelte) {
    height: 100%;
  }

  :global(button) {
    background-color: #222;
    border: 1px solid #777;
    color: #eee;
    cursor: pointer;
    font-size: 16px;
  }

  :global(select) {
    background-color: #222;
    color: #eee;
  }

  .root {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .columns-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 1.5vw 2.5vw;
    height: 100%;
    max-height: 100vh;
    overflow-y: hidden;
  }
</style>
