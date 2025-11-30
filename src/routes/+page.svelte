<script lang="ts">
  import BoardPicker from 'src/components/BoardPicker.svelte';
  import TodoColumn from 'src/components/TodoColumn.svelte';
  import { ColumnTitles, type Todo } from 'src/types';
  import type { PageData } from './$types';
  import { groupTodosByState } from 'src/helpers';
  import LoadingTodos from 'src/components/LoadingTodos.svelte';

  let { data }: { data: PageData } = $props();
  let { boards, activeBoardID: initialActiveBoardID, todos: initialTodos } = $derived(data);

  let activeBoardID: number | undefined = $state(initialActiveBoardID);
  let todosByStateByBoardID: Record<number, Record<number, Todo[]>> = $state(
    typeof initialActiveBoardID === 'number'
      ? {
          [initialActiveBoardID]: groupTodosByState(initialTodos),
        }
      : {}
  );

  $effect(() => {
    if (activeBoardID !== undefined && !todosByStateByBoardID[activeBoardID]) {
      todosByStateByBoardID[activeBoardID] = new Array(ColumnTitles.length).fill(null).map(() => []);
    }
  });

  // Re-fetch todos from backend when active board id is switched
  let lastActiveBoardID: number | undefined = $state(activeBoardID);
  $effect(() => {
    if (activeBoardID !== lastActiveBoardID && activeBoardID !== undefined) {
      console.log('Re-fetching todos for board', { activeBoardID });
      lastActiveBoardID = activeBoardID;
      const activeBoardIDCopy = activeBoardID;
      fetch(`/todos?boardID=${activeBoardIDCopy}`).then(async res => {
        if (!res.ok) {
          throw await res.text();
        }
        res.json().then(todosForActiveBoard => {
          console.log('Fetched todos for board', {
            activeBoardID: activeBoardIDCopy,
            todosForActiveBoard,
          });
          todosByStateByBoardID[activeBoardIDCopy] = groupTodosByState(todosForActiveBoard);
        });
      });
    }
  });
</script>

<svelte:head>
  <title>Sveltekit Todo</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="root">
  <BoardPicker bind:boards bind:activeBoardID />
  {#if activeBoardID === undefined}
    <span style="color: orange">No Board Selected; TODO</span>
  {:else}
    {@const todos = todosByStateByBoardID[activeBoardID]}
    {#if todos}
      <div class="columns-container">
        {#each ColumnTitles as title, state}
          <TodoColumn {title} bind:todos={todos[state]} colIx={state} boardID={activeBoardID} />
        {/each}
      </div>
    {:else}
      <LoadingTodos />
    {/if}
  {/if}
</div>

<style>
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
