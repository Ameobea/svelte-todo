import { ColumnTitles, type Todo } from './types';

export const groupTodosByState = (todos: Todo[]): Todo[][] => {
  const todosByState: Todo[][] = new Array(ColumnTitles.length).fill(null).map(() => []);
  todos.forEach(todo => todosByState[todo.state].push(todo));
  return todosByState;
};
