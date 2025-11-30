set dotenv-load

docker-build:
  docker build --build-arg VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE=${VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE} --build-arg VITE_SQLITE_DB_FILE_PATH=${VITE_SQLITE_DB_FILE_PATH} -t ameo/sveltekit-todo:latest .

run:
  yarn run dev

build-and-deploy:
  #!/bin/bash

  just docker-build
  docker save ameo/sveltekit-todo:latest | bzip2 > /tmp/sveltekit-todo.tar.bz2
  scp /tmp/sveltekit-todo.tar.bz2 debian@ameo.dev:/tmp/sveltekit-todo.tar.bz2
  ssh debian@ameo.dev -t 'cat /tmp/sveltekit-todo.tar.bz2 | bunzip2 | docker load && docker kill todo && docker container rm todo && docker run -d --name todo --restart=always -p 5601:3000 -e "VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE=eXR0cml1bTp1bnVudW5wZW50aXVt" -e "VITE_SQLITE_DB_FILE_PATH=/opt/database.db" -v /opt/todo.db:/opt/database.db ameo/sveltekit-todo:latest && docker kill sveltekit-todo-demo && docker container rm sveltekit-todo-demo && docker run -d --name sveltekit-todo-demo --restart=always -p 5600:3000 -e "VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE=eXR0cml1bTp1bnVudW5wZW50aXVt" -e "VITE_SQLITE_DB_FILE_PATH=/opt/database.db" -v /opt/svelte-todo-sqlite.db:/opt/database.db ameo/sveltekit-todo:latest && rm /tmp/sveltekit-todo.tar.bz2'
