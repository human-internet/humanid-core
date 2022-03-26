#!/usr/bin/env sh

if [ "${BOOT_DB_UPGRADE}" = "true" ]; then
    npm run db:up
fi

npm start
