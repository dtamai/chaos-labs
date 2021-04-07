FROM node:15.8.0-alpine3.12

WORKDIR /app

ADD package.json .
ADD package-lock.json .
RUN npm install

ADD . .

ENTRYPOINT [ "npx", "nodemon", "/app/index.js" ]
