<script lang="ts">
  export let onAdd: (content: string) => Promise<void>;

  let isExpanded = false;
  let editValue = '';
  let isSubmitting = false;

  const handleSubmit = async () => {
    if (isSubmitting || !editValue.trim()) {
      return;
    }

    try {
      await onAdd(editValue);
      editValue = '';
      isExpanded = false;
    } finally {
      isSubmitting = false;
    }
  };
</script>

<div
  class="root"
  on:click={evt => {
    if (evt.button !== 0) {
      return;
    }

    if (!isExpanded) {
      isExpanded = true;
    }
  }}
  on:mousedown
  on:mouseup
>
  {#if isExpanded}
    <div class="expanded-wrapper">
      <textarea
        bind:value={editValue}
        on:keydown={evt => {
          if (evt.key === 'Enter' && !evt.shiftKey) {
            handleSubmit();
          }
        }}
      />
      <div class="buttons-container">
        <button
          on:click|stopPropagation={() => {
            isExpanded = false;
          }}
        >
          Cancel
        </button>
        <button disabled={!editValue.trim() || isSubmitting} on:click={handleSubmit}>Submit</button>
      </div>
    </div>
  {:else}
    <button class="add-button">+</button>
  {/if}
</div>

<style lang="scss">
  .root {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20px;
  }

  .expanded-wrapper {
    display: flex;
    flex-direction: column;

    textarea {
      background-color: #121212;
      margin-bottom: 6px;
      color: #ccc;
      height: 100px;
    }

    .buttons-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
  }

  .add-button {
    display: flex;
    flex-direction: column;
    height: 40px;
    width: 100%;
    margin: 6px;
    padding: 4px;
    font-size: 20px;
    background-color: #333;
    text-align: center;
    color: #ccc;
    border: 1px solid #ccc;
    outline: none;
    border-radius: 10px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>
