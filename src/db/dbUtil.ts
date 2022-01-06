import Database from 'better-sqlite3';

import { SQLiteDbFilePath } from 'src/conf';
import type { Todo } from 'src/types';

export const db = new Database(SQLiteDbFilePath, {});
db.pragma('foreign_keys = ON;');

const runMigrations = () => {
  console.log('Running migrations...');
  db.prepare(
    `CREATE TABLE boards (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );`
  ).run();
  db.prepare(`CREATE UNIQUE INDEX board_name_idx ON boards (name);`).run();
  db.prepare(
    `CREATE TABLE todos (
      id INTEGER PRIMARY KEY,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      text TEXT NOT NULL,
      state INTEGER NOT NULL,
      board_id INTEGER NOT NULL,
      FOREIGN KEY (board_id) REFERENCES boards (id)
    );`
  ).run();
  db.prepare(`CREATE TABLE kv_store (key TEXT NOT NULL, value TEXT);`).run();
  db.prepare('INSERT INTO kv_store (key, value) VALUES (@key, @value);').run({ key: 'last_active_board_id', value: 0 });
  db.prepare(`CREATE UNIQUE INDEX kv_store_key_idx ON kv_store (key);`).run();
  console.log('Migrations run successfully');
};

const tableList: { name: string }[] = db.pragma('table_list');
if (!tableList.some(t => t.name === 'todos')) {
  runMigrations();
}

export const createTodo = (content: string, state: number, boardID: number) => {
  const res = db
    .prepare('INSERT INTO todos (text, state, board_id) VALUES (@content, @state, @boardID);')
    .run({ content, state, boardID });
  return res.lastInsertRowid;
};

export const getAllTodosForBoard = (boardID: string): { content: string; state: number; createdAt: Date }[] =>
  db
    .prepare('SELECT id, created_at as createdAt, text as content, state FROM todos WHERE board_id = @boardID;')
    .all({ boardID });

export const getTodoByID = (id: string | number): Todo | null =>
  db.prepare('SELECT id, created_at as createdAt, text as content, state FROM todos WHERE id = @id').get({ id });

/**
 * Returns `true` if todo deleted successfully, `false` otherwise
 */
export const deleteTodoById = (id: string | number): boolean => {
  const res = db.prepare('DELETE FROM todos WHERE id = @id;').run({ id });
  return res.changes > 0;
};

/**
 * Returns `true` if todo updated successfully, `false` if no post found with provided id
 */
export const updateTodo = ({ content, state, id }: Todo): boolean => {
  const res = db.prepare('UPDATE todos SET state = @state WHERE id = @id;').run({ content, state, id });
  return res.changes > 0;
};

export const createBoard = (boardName: string): number => {
  const res = db.prepare('INSERT INTO boards (name) VALUES (@name);').run({ name: boardName });
  if (typeof res.lastInsertRowid === 'bigint') {
    throw new Error('Got `bigint` for `lastInsertRowid` returned when creating board');
  }
  return res.lastInsertRowid;
};

export const getAllBoards = (): { id: number; name: string }[] => db.prepare('SELECT name, id FROM boards;').all();

/**
 * Returns `true` if board deleted successfully, `false` otherwise
 */
export const deleteBoardByID = (boardID: number): boolean => {
  const deleteExistingTodos = db.prepare('DELETE FROM todos WHERE board_id = @boardID;');
  const deleteBoard = db.prepare('DELETE FROM boards WHERE id = @boardID');
  return db.transaction(() => {
    deleteExistingTodos.run({ boardID });
    const res = deleteBoard.run({ boardID });
    return res.changes > 0;
  })();
};

export const getLastActiveBoardID = (): number | null => {
  const { val } = db.prepare("SELECT value as val FROM kv_store WHERE key = 'last_active_board_id';").get();
  if (typeof val === 'number') {
    return val;
  }
  if (!val) {
    return null;
  }
  const parsed = parseInt(val, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
};

export const setLastActiveBoardID = (activeBoardID: number) =>
  db
    .prepare('INSERT OR REPLACE INTO kv_store (key, value) VALUES (@key, @value);')
    .run({ key: 'last_active_board_id', value: `${activeBoardID}` });
