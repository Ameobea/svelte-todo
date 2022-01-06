<script context="module" lang="ts">
  export const FlipDurationMs = 40;
</script>

<script lang="ts">
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';

  import type { Todo } from 'src/types';
  import LoadingTodos from './LoadingTodos.svelte';
  import TodoCard from './TodoCard.svelte';
  import { createTodo, updateTodo } from 'src/api';
  import AddTodo from './AddTodo.svelte';
  import { onMount } from 'svelte';

  export let todos: Todo[] | null;
  export let title: string;
  export let boardID: number;
  export let colIx: number;

  let dragDisabled = false;

  onMount(() => {
    const mouseUpCb = () => {
      dragDisabled = false;
    };
    window.addEventListener('mouseup', mouseUpCb);

    return () => {
      console.log('Removing event listener');
      window.removeEventListener('mouseup', mouseUpCb);
    };
  });

  const onFinalize = (
    e: CustomEvent<DndEvent> & {
      target: EventTarget & HTMLElement;
    }
  ) => {
    handleSort(e);
    const id = e.detail?.info.id;
    const newTodo = e.detail?.items.find(item => item.id == id);
    if (newTodo) {
      updateTodo({ ...newTodo, state: colIx } as Todo);
    }
  };
  const handleSort = (
    e: CustomEvent<DndEvent> & {
      target: EventTarget & HTMLElement;
    }
  ) => {
    todos = e.detail.items as Todo[];
  };
</script>

<div class="wrapper">
  <h2 class="title">{title}</h2>
  {#if todos}
    <section
      class="content"
      use:dndzone={{ items: todos, flipDurationMs: FlipDurationMs, dragDisabled }}
      on:consider={handleSort}
      on:finalize={onFinalize}
    >
      {#each todos as todo (todo.id)}
        <div animate:flip={{ duration: FlipDurationMs }}>
          <TodoCard
            {todo}
            onDelete={() => {
              if (todos) {
                todos = todos.filter(otodo => otodo.id !== todo.id);
              }
            }}
          />
        </div>
      {/each}
      <AddTodo
        onAdd={async content => {
          try {
            const createdTodo = await createTodo(content, colIx, boardID);
            todos = [...(todos ?? []), createdTodo];
          } catch (err) {
            alert(`Error creating todo: ${err}`);
          }
        }}
        on:mousedown={() => {
          dragDisabled = true;
        }}
        on:mouseup={() => {
          dragDisabled = false;
        }}
      />
    </section>
  {:else}
    <LoadingTodos />
  {/if}
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: calc(max(10px, 1.2vw));
    margin-right: calc(max(10px, 1.2vw));

    .title {
      text-align: center;
      font-size: 26px;
      margin-top: 0;
      margin-bottom: 8px;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    background-color: #222;
    padding: 4px;
    flex: 1;
    overflow-y: auto;
    min-width: 200px;
    min-height: 300px;
  }
</style>
