FROM node:16-alpine

WORKDIR /usr/src/app

COPY . ./

RUN npm i -g npm

ENV NODE_ENV="production"

RUN npm ci

CMD ["npm", "start"]
