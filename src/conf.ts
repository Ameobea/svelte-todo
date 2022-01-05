export const ExpectedBasicAuthValue = import.meta.env['VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE'];
export const SQLiteDbFilePath = import.meta.env['VITE_SQLITE_DB_FILE_PATH'];

if (!ExpectedBasicAuthValue) {
  console.error('Missing expected `VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE` environment variable');
  process.exit(1);
} else if (!SQLiteDbFilePath) {
  console.error('Missing expected `VITE_SQLITE_DB_FILE_PATH` environment variable');
  process.exit(1);
}
