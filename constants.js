"use strict";

module.exports = {
    RESPONSE_SUCCESS: "OK",
    RESPONSE_ERROR_BAD_REQUEST: "400",
    RESPONSE_ERROR_UNAUTHORIZED: "401",
    RESPONSE_ERROR_FORBIDDEN: "403",
    RESPONSE_ERROR_NOT_FOUND: "404",
    RESPONSE_ERROR_INTERNAL: "500",
    AUTH_SCOPE_SERVER: 1,
    AUTH_SCOPE_MOBILE: 2,
    AUTH_SCOPE_WEB_LOGIN: 3,
    APP_ACCESS_GRANTED: 1,
    ENV_DEVELOPMENT: 2,
    WEB_LOGIN_SESSION_PURPOSE_REQUEST_LOGIN_OTP: "web-login/request-login-otp",
    WEB_LOGIN_SESSION_PURPOSE_LOGIN: "web-login/login",
    WebLogin: {
        SourceMobile: "m",
        SourceWeb: "w",
    },
};
