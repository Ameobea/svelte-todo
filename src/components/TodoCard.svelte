<script lang="ts">
  import { deleteTodo } from 'src/api';
  import type { Todo } from 'src/types';

  export let todo: Todo;
  export let onDelete: () => void;
</script>

<div class="root">
  <div class="content">
    {todo.content}
  </div>

  <button class="close-button" on:click={() => deleteTodo(todo.id).then(onDelete)}>×</button>
</div>

<style lang="scss">
  .root {
    display: flex;
    flex-direction: row;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-bottom: 8px;
    background-color: #121212;
  }

  .close-button {
    width: 14px;
    height: 14px;
    border: 1px solid #ccc;
    background-color: #333;
    font-size: 15px;
    color: #ccc;
    line-height: 0;
    padding: 0;
    margin: 1px 1px 8px auto;
    cursor: pointer;
    border-radius: 3px;
  }

  .content {
    padding: 4px;
    white-space: pre-line;
    font-size: 16px;
    line-height: 20px;
  }
</style>
