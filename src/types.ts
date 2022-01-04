import * as t from 'io-ts';

export interface Todo {
  id: string | number;
  content: string;
  state: number;
}

interface PositiveIntBrand {
  readonly PositiveInt: unique symbol; // use `unique symbol` here to ensure uniqueness across modules / packages
}
export const PositiveInt = t.brand(t.Int, (n): n is t.Branded<t.Int, PositiveIntBrand> => n >= 0, 'PositiveInt');
