<script lang="ts">
  export let boards: { name: string; id: number }[];
  export let activeBoardID: number | undefined;

  const createBoard = async () => {
    const boardName = prompt('Board Name');
    if (!boardName) {
      return;
    }

    try {
      const { createdBoardID } = await fetch(`/boards?boardName=${boardName}`, { method: 'POST' }).then(async res => {
        if (!res.ok) {
          throw await res.text();
        }
        return res.json();
      });
      boards = [...boards, { name: boardName, id: createdBoardID }];
      activeBoardID = createdBoardID;
    } catch (err) {
      console.log('Error creating board: ', err);
      alert('Error creating board: ' + err);
    }
  };

  const deleteActiveBoard = async () => {
    if (activeBoardID === undefined) {
      return;
    }

    const proceed = confirm(`Really delete board named ${boards.find(board => board.id == activeBoardID)!.name}?`);
    if (!proceed) {
      return;
    }

    try {
      await fetch(`/boards/${activeBoardID}`, { method: 'DELETE' }).then(async res => {
        if (!res.ok) {
          throw await res.text();
        }
        return res.text();
      });
      const newBoards = boards.filter(board => board.id !== activeBoardID);
      activeBoardID = newBoards[0]?.id;
      boards = newBoards;
    } catch (err) {
      console.error('Error deleting board: ', err);
      alert(`Error deleting board: ${err}`);
    }
  };
</script>

<div class="root">
  <select
    value={activeBoardID}
    on:change={evt => {
      const newActiveBoardID = +evt.currentTarget.value;
      activeBoardID = newActiveBoardID;
      fetch(`/activeBoardID?boardID=${newActiveBoardID}`, { method: 'POST' });
    }}
  >
    {#each boards as board (board.id)}
      <option value={board.id}>{board.name}</option>
    {/each}
  </select>
  <button class="create-board-button" on:click={createBoard}>Add Board </button>
  {#if activeBoardID !== undefined}
    <button on:click={deleteActiveBoard}>Delete Board</button>
  {/if}
</div>

<style lang="scss">
  .root {
    display: flex;
    flex-direction: row;
    margin-top: 9px;
    margin-left: 8px;
  }

  select {
    width: 100px;
  }

  button {
    margin-left: 10px;
  }
</style>
