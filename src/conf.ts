const getRuntimeEnvVar = (name: string) => {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing expected \`${name}\` environment variable`);
    process.exit(1);
  }
  return val;
};

export const ExpectedBasicAuthValue = getRuntimeEnvVar('VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE');
export const SQLiteDbFilePath = getRuntimeEnvVar('VITE_SQLITE_DB_FILE_PATH');
