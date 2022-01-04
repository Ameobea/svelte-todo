export const ExpectedBasicAuthValue = process.env['HTTP_BASIC_AUTH_EXPECTED_VALUE'];

if (!ExpectedBasicAuthValue) {
  console.error('Missing expected `HTTP_BASIC_AUTH_EXPECTED_VALUE` environment variable');
  process.exit(1);
}
