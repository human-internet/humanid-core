#!/usr/bin/env bash

tee -a "${MANIFEST_OUT}" <<EOF
module.exports = {
  appName: "${APP_NAME}",
  appSlugName: "${APP_SLUG}",
  appVersion: "${APP_VERSION}",
  buildSignature: "${BUILD_SIGNATURE}",
}
EOF
