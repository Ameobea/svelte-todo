FROM node:19.5-slim

ARG VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE
ENV VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE=$VITE_HTTP_BASIC_AUTH_EXPECTED_VALUE
ENV VITE_SQLITE_DB_FILE_PATH=/opt/database.db

ADD . /app
WORKDIR /app

RUN apt update && apt install -y python3 build-essential
RUN npm install
RUN npm run build

CMD node ./build/index.js
