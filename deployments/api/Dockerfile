FROM node:16-alpine as manifest

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY .git ./.git
COPY package.json scripts/gen-manifest.sh ./

RUN export APP_NAME="humanID.API" \
    && export APP_SLUG="human-id/api" \
    && export APP_VERSION="$(npm run --silent manifest:version)" \
    && export BUILD_SIGNATURE="$(npm run --silent manifest:buildSignature)" \
    && MANIFEST_OUT=manifest.js sh gen-manifest.sh

FROM node:16-alpine

WORKDIR /usr/src/app

COPY . ./
COPY --from=manifest /usr/src/app/manifest.js ./manifest.js

RUN npm i -g npm

ENV NODE_ENV="production"

RUN npm ci

CMD ["npm", "start"]
