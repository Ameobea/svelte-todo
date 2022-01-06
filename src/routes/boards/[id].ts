import type { RequestHandler } from '@sveltejs/kit';
import { deleteBoardByID } from 'src/db/dbUtil';

export const del: RequestHandler = ({ params: { id } }) => {
  const deleted = deleteBoardByID(+id);
  if (deleted) {
    return { status: 204 };
  } else {
    return { status: 404, body: 'No board found with provided id' };
  }
};
