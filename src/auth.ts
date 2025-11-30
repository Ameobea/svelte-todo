import { ExpectedBasicAuthValue } from './conf';

export const authenticateRequest = (req: Request): Response | null => {
  const auth = req.headers.get('authorization');
  if (auth !== `Basic ${ExpectedBasicAuthValue}`) {
    console.warn('Invalid or missing auth; sending back 401');
    return new Response('Invalid or missing authentication credentials', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="User Visible Realm", charset="UTF-8"' },
    });
  }

  console.log('Successfully authenticated request');
  return null;
};
