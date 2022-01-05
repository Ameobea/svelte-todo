FROM node:17.3-slim

ADD . /app
WORKDIR /app

RUN apt update && apt install -y python3 build-essential
RUN npm install
RUN npm run build

CMD node ./build/index.js
