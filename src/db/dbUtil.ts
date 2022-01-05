import Database from 'better-sqlite3';

import { SQLiteDbFilePath } from 'src/conf';
import type { Todo } from 'src/types';

export const db = new Database(SQLiteDbFilePath, {});

const runMigrations = () => {
  console.log('Running migrations...');
  db.prepare(
    `CREATE TABLE todos (
      id INTEGER PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      text TEXT,
      state INTEGER
    );`
  ).run();
  console.log('Migrations run successfully');
};

const tableList: { name: string }[] = db.pragma('table_list');
if (!tableList.some(t => t.name === 'todos')) {
  runMigrations();
}

export const createTodo = (content: string, state: number) => {
  const res = db.prepare('INSERT INTO todos (text, state) VALUES (@content, @state);').run({ content, state });
  return res.lastInsertRowid;
};

export const getAllTodos = (): { content: string; state: number; createdAt: Date }[] =>
  db.prepare('SELECT id, created_At as createdAt, text as content, state FROM todos;').all();

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
