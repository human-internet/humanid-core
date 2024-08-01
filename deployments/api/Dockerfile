FROM nbsdev/nodejs-builder:16 as manifest

ARG ARG_APP_VERSION=""

ENV APP_NAME="humanID.API" \
    APP_SLUG="human-id/api" \
    APP_VERSION=${ARG_APP_VERSION} \
    MANIFEST_OUT="manifest.js"

WORKDIR /usr/src/app

COPY .git ./.git

RUN gen-manifest

FROM node:18-alpine

WORKDIR /usr/src/app

COPY migrations ./migrations
COPY public ./public
COPY src ./src
COPY package.json package-lock.json .sequelizerc entrypoint.sh ./
COPY --from=manifest /usr/src/app/manifest.js ./src/manifest.js

RUN npm i -g npm \
    && mkdir -p storage/temp

ENV NODE_ENV="production"

RUN npm ci

ENTRYPOINT ["sh", "/usr/src/app/entrypoint.sh"]
