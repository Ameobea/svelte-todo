import { pipe } from 'fp-ts/lib/function.js';
import * as t from 'io-ts';
import * as D from 'io-ts/lib/Decoder.js';

export interface Todo {
  id: string | number;
  content: string;
  state: number;
}

interface PositiveIntBrand {
  readonly PositiveInt: unique symbol; // use `unique symbol` here to ensure uniqueness across modules / packages
}
export const PositiveInt = t.brand(t.Int, (n): n is t.Branded<t.Int, PositiveIntBrand> => n >= 0, 'PositiveInt');

export const NumberFromString: D.Decoder<unknown, number> = pipe(
  D.string,
  D.parse(s => {
    const n = parseFloat(s);
    return isNaN(n) ? D.failure(s, 'NumberFromString') : D.success(n);
  })
);
