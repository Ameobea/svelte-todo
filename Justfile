set dotenv-load := true

run:
  yarn run dev

docker-build:
  docker build -t ameo/sveltekit-todo:latest --build-arg VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE=$VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE .
