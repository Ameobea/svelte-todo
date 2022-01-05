export const ExpectedBasicAuthValue = process.env['HTTP_BASIC_AUTH_EXPECTED_VALUE'];
export const SQLiteDbFilePath = process.env['SQLITE_DB_FILE_PATH'];

if (!ExpectedBasicAuthValue) {
  console.error('Missing expected `HTTP_BASIC_AUTH_EXPECTED_VALUE` environment variable');
  process.exit(1);
} else if (!SQLiteDbFilePath) {
  console.error('Missing expected `SQLITE_DB_FILE_PATH` environment variable');
  process.exit(1);
}
