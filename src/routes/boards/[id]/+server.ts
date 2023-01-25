import { error, type RequestHandler } from '@sveltejs/kit';
import { deleteBoardByID } from '../../../db/dbUtil';

export const DELETE: RequestHandler = ({ params: { id } }) => {
  if (!id) {
    throw error(400, 'No id provided');
  }
  const deleted = deleteBoardByID(+id);
  if (deleted) {
    return new Response(null, { status: 204 });
  } else {
    throw error(404, 'No board found with provided id');
  }
};
