<script context="module" lang="ts">
  const ColumnTitles = ['Backlog', 'To-Do', 'WIP', 'Done'];

  export const load: Load = async ({ fetch }) => {
    let fetchedTodos: Todo[];
    try {
      const res = await fetch('/todos');

      if (!res.ok) {
        return {
          status: res.status,
          error: new Error(`Failed to load todos: ${await res.text().catch(() => 'Unknown error')}`),
        };
      }
      fetchedTodos = await res.json();
    } catch (err) {
      console.error(`Error fetching todos: ${err}`);
      return { status: 500, error: 'Error fetching todos' };
    }

    const todos = { type: 'loaded' };

    const todosByState = new Array(ColumnTitles.length).fill(null).map(() => []);
    if (todos.type === 'loaded') {
      fetchedTodos.forEach(todo => {
        if (!todosByState[todo.state]) {
          todosByState[todo.state] = [];
        }
        todosByState[todo.state].push(todo);
      });
    }

    return {
      props: { todosByState, todos },
    };
  };
</script>

<script lang="ts">
  import type { Load } from '@sveltejs/kit';

  import TodoColumn from 'src/components/TodoColumn.svelte';
  import type { Todo } from 'src/types';

  export let todos: { type: 'loading' } | { type: 'loaded' } | { type: 'error'; message: string } = {
    type: 'loading',
  };
  export let todosByState: Todo[][] = new Array(ColumnTitles.length).fill(null).map(() => []);
</script>

<svelte:head>
  <title>Sveltekit Todo</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <!-- <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" /> -->
</svelte:head>

<div class="root">
  {#if todos.type === 'error'}
    <span style="color: red">Error fetching todos: {todos.message}</span>
  {:else}
    <div class="columns-container">
      {#each ColumnTitles as title, i}
        <TodoColumn {title} bind:todos={todosByState[i]} colIx={i} />
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
