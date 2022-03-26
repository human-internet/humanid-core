FROM nbsdev/nodejs-builder:16 as manifest

ARG ARG_APP_VERSION=""

ENV APP_NAME="humanID.API" \
    APP_SLUG="human-id/api" \
    APP_VERSION=${ARG_APP_VERSION} \
    MANIFEST_OUT="manifest.js"

WORKDIR /usr/src/app

COPY .git ./.git

RUN gen-manifest

FROM node:16-alpine

WORKDIR /usr/src/app

COPY . ./
COPY --from=manifest /usr/src/app/manifest.js ./manifest.js

RUN npm i -g npm

ENV NODE_ENV="production"

RUN npm ci

CMD ["npm", "start"]
