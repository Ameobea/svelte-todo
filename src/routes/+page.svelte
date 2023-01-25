<script lang="ts">
  import { browser } from '$app/environment';
  import BoardPicker from '../components/BoardPicker.svelte';
  import TodoColumn from '../components/TodoColumn.svelte';
  import { ColumnTitles, groupTodosByState } from '../util';
  import type { PageData } from './$types';

  export let data: PageData;
  let lastActiveBoardID: number | undefined = data.activeBoardID;
  let { activeBoardID, boards, todosByStateByBoardID } = data;

  $: if (activeBoardID !== undefined && !todosByStateByBoardID[activeBoardID]) {
    todosByStateByBoardID[activeBoardID] = new Array(ColumnTitles.length).fill(null).map(() => []);
  }

  // Re-fetch todos from backend when active board id is switched

  $: if (activeBoardID !== lastActiveBoardID && activeBoardID !== undefined && browser) {
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

<style lang="css">
  :root {
    color-scheme: dark;
  }

  :global(body) {
    background-color: #121212;
    color: #ccc;
    font-family: 'PT Sans', sans-serif;
    margin: 0;
    padding: 0;
    height: calc(100vh - 100px);
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
  }
</style>
