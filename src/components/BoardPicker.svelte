<script lang="ts">
  let {
    boards = $bindable(),
    activeBoardID = $bindable(),
  }: {
    boards: { name: string; id: number; archived: boolean }[];
    activeBoardID: number | undefined;
  } = $props();

  let showArchived = $state(false);
  let activeBoards = $derived(boards.filter(board => !board.archived));
  let archivedBoards = $derived(boards.filter(board => board.archived));

  const createBoard = async () => {
    const boardName = prompt('Board Name');
    if (!boardName) {
      return;
    }

    try {
      const { createdBoardID } = await fetch(`/boards?boardName=${boardName}`, {
        method: 'POST',
      }).then(async res => {
        if (!res.ok) {
          throw await res.text();
        }
        return res.json();
      });
      boards = [...boards, { name: boardName, id: createdBoardID, archived: false }];
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

  const archiveActiveBoard = async () => {
    if (activeBoardID === undefined) {
      return;
    }

    try {
      await fetch(`/boards/${activeBoardID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      }).then(async res => {
        if (!res.ok) {
          throw await res.text();
        }
      });

      boards = boards.map(board => (board.id === activeBoardID ? { ...board, archived: true } : board));
      activeBoardID = boards.find(board => !board.archived)?.id;
      if (typeof activeBoardID === 'number') {
        fetch(`/activeBoardID?boardID=${activeBoardID}`, { method: 'POST' });
      }
    } catch (err) {
      console.error('Error archiving board: ', err);
      alert(`Error archiving board: ${err}`);
    }
  };

  const unarchiveBoard = async (boardID: number) => {
    try {
      await fetch(`/boards/${boardID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      }).then(async res => {
        if (!res.ok) {
          throw await res.text();
        }
      });

      boards = boards.map(board => (board.id === boardID ? { ...board, archived: false } : board));
      activeBoardID = boardID;
      fetch(`/activeBoardID?boardID=${boardID}`, { method: 'POST' });
    } catch (err) {
      console.error('Error unarchiving board: ', err);
      alert(`Error unarchiving board: ${err}`);
    }
  };

  const toggleArchiveView = async () => {
    showArchived = !showArchived;
  };
</script>

<div class="root">
  <select
    value={activeBoardID}
    onchange={evt => {
      const newActiveBoardID = +evt.currentTarget.value;
      activeBoardID = newActiveBoardID;
      fetch(`/activeBoardID?boardID=${newActiveBoardID}`, { method: 'POST' });
    }}
  >
    {#each activeBoards as board (board.id)}
      <option value={board.id}>{board.name}</option>
    {/each}
  </select>
  <button class="create-board-button" onclick={createBoard}>Add Board </button>
  {#if activeBoardID !== undefined}
    <button onclick={archiveActiveBoard}>Archive Board</button>
    <button onclick={deleteActiveBoard}>Delete Board</button>
  {/if}
  <button onclick={toggleArchiveView}>
    {showArchived ? 'Hide' : 'Show'} Archived ({archivedBoards.length})
  </button>
</div>

{#if showArchived}
  <div class="archived-section">
    {#if archivedBoards.length === 0}
      <p class="no-archived">No archived boards</p>
    {:else}
      <ul class="archived-list">
        {#each archivedBoards as board (board.id)}
          <li>
            <span class="board-name">{board.name}</span>
            <button onclick={() => unarchiveBoard(board.id)}>Unarchive</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

<style lang="css">
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

  .archived-section {
    margin-top: 10px;
    margin-left: 4px;
    padding: 8px;
    max-width: 600px;
    max-height: 500px;
    overflow-y: auto;
  }

  .no-archived {
    color: #666;
    font-style: italic;
    margin: 10px 0;
  }

  .archived-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .archived-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px 6px;
    margin-bottom: 5px;
    border: 1px solid #ddd;
  }

  .board-name {
    flex-grow: 1;
  }

  .archived-list button {
    margin-left: 10px;
    padding: 4px 12px;
    font-size: 13px;
  }
</style>
