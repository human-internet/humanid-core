define({ "api": [
  {
    "type": "post",
    "url": "/mobile/users/login",
    "title": "Login",
    "version": "0.0.2",
    "name": "LoginByOtp",
    "group": "Core.MobileAPI",
    "description": "<p>Login by with given OTP code If user has not yet granted access to app, a new AppUser will be created</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "countryCode",
            "description": "<p>User mobile phone country code (eg. 62 for Indonesia)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone",
            "description": "<p>User mobile phone number</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "deviceTypeId",
            "description": "<p>Device Type ID (1 = Android, 2 = iOS)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "deviceId",
            "description": "<p>User device ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "verificationCode",
            "description": "<p>User phone number verification code (OTP)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "notifId",
            "description": "<p>Push notif ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Response data</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.exchangeToken",
            "description": "<p>Token that can be used by Partner app server to verify if a user has been authorized by humanId</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Response status</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Result code</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Result message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "SuccessResponse:",
          "content": "{\n  \"success\": true,\n  \"code\": \"OK\",\n  \"message\": \"Success\",\n  \"data\": {\n    \"exchangeToken\": \"<EXCHANGE_TOKEN>\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/mobile-doc.js",
    "groupTitle": "Core.MobileAPI",
    "header": {
      "fields": {
        "Request Header": [
          {
            "group": "Request Header",
            "type": "String",
            "optional": false,
            "field": "client-id",
            "description": "<p>Client ID for Mobile SDK</p>"
          },
          {
            "group": "Request Header",
            "type": "String",
            "optional": false,
            "field": "client-secret",
            "description": "<p>Client Secret for Mobile SDK</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Response status</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Error code</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ErrorResponse:",
          "content": "{\n  \"success\": false,\n  \"code\": \"<ERROR_CODE>\",\n  \"message\": \"<ERROR_MESSAGE>\"\n}",
          "type": "json"
        }
      ]
    }
  },
    {
      "type": "post",
      "url": "/mobile/users/register",
      "title": "Login",
      "version": "0.0.1",
      "name": "LoginByOtp",
      "group": "Core.MobileAPI",
      "description": "<p>Login by with given OTP code If user has not yet granted access to app, a new AppUser will be created</p>",
      "parameter": {
        "fields": {
          "Parameter": [
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "countryCode",
              "description": "<p>User mobile phone country code (eg. 62 for Indonesia)</p>"
            },
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "phone",
              "description": "<p>User mobile phone number</p>"
            },
            {
              "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "deviceId",
            "description": "<p>User device ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "verificationCode",
            "description": "<p>User phone number verification code (OTP)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "notifId",
            "description": "<p>Push notif ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Partner app ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "appSecret",
            "description": "<p>Partner app secret</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Response data</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.exchangeToken",
            "description": "<p>Token that can be used by Partner app server to verify if a user has been authorized by humanId</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.userHash",
            "description": "<p>User identifier for Partner app</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Response status</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Result code</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Result message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "SuccessResponse:",
          "content": "{\n  \"success\": true,\n  \"code\": \"OK\",\n  \"message\": \"Success\",\n  \"data\": {\n    \"exchangeToken\": \"<EXCHANGE_TOKEN>\",\n    \"userHash\": \"<USER_HASH>\"\n  }\n}",
          "type": "json"
        }
      ]
    },
      "filename": "controllers/mobile-doc.js",
      "groupTitle": "Core.MobileAPI",
      "error": {
        "fields": {
          "Error 4xx": [
            {
              "group": "Error 4xx",
              "type": "Boolean",
              "optional": false,
              "field": "success",
              "description": "<p>Response status</p>"
            },
            {
              "group": "Error 4xx",
              "type": "String",
              "optional": false,
              "field": "code",
              "description": "<p>Error code</p>"
            },
            {
              "group": "Error 4xx",
              "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
        },
        "examples": [
          {
            "title": "ErrorResponse:",
            "content": "{\n  \"success\": false,\n  \"code\": \"<ERROR_CODE>\",\n  \"message\": \"<ERROR_MESSAGE>\"\n}",
            "type": "json"
          }
        ]
      }
    },
    {
      "type": "post",
      "url": "/mobile/users/login/request-otp",
      "title": "Login: Request OTP",
      "version": "0.0.2",
      "name": "RequestLoginOtp",
      "group": "Core.MobileAPI",
      "description": "<p>Trigger send OTP code via SMS</p>",
      "parameter": {
        "fields": {
          "Parameter": [
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "countryCode",
              "description": "<p>User mobile phone country code (eg. 62 for Indonesia)</p>"
            },
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "phone",
              "description": "<p>User mobile phone number</p>"
            }
          ]
        }
      },
      "filename": "controllers/mobile-doc.js",
      "groupTitle": "Core.MobileAPI",
      "header": {
        "fields": {
          "Request Header": [
            {
              "group": "Request Header",
              "type": "String",
              "optional": false,
              "field": "client-id",
              "description": "<p>Client ID for Mobile SDK</p>"
            },
            {
              "group": "Request Header",
              "type": "String",
              "optional": false,
              "field": "client-secret",
              "description": "<p>Client Secret for Mobile SDK</p>"
            }
          ]
        }
      },
      "success": {
        "fields": {
          "Success 200": [
            {
              "group": "Success 200",
              "type": "Boolean",
              "optional": false,
              "field": "success",
              "description": "<p>Response status</p>"
            },
            {
              "group": "Success 200",
              "type": "String",
              "optional": false,
              "field": "code",
              "description": "<p>Result code</p>"
            },
            {
              "group": "Success 200",
              "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Result message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "SuccessResponse:",
          "content": "{\n  \"success\": true,\n  \"code\": \"OK\",\n  \"message\": \"Success\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Response status</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Error code</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ErrorResponse:",
          "content": "{\n  \"success\": false,\n  \"code\": \"<ERROR_CODE>\",\n  \"message\": \"<ERROR_MESSAGE>\"\n}",
          "type": "json"
        }
      ]
    }
    },
    {
      "type": "post",
      "url": "/mobile/users/verifyPhone",
      "title": "Request Login OTP via SMS",
      "version": "0.0.1",
      "name": "RequestLoginOtp",
      "group": "Core.MobileAPI",
      "description": "<p>Trigger send OTP code via SMS</p>",
      "parameter": {
        "fields": {
          "Parameter": [
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "countryCode",
              "description": "<p>User mobile phone country code (eg. 62 for Indonesia)</p>"
            },
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "phone",
              "description": "<p>User mobile phone number</p>"
            },
            {
              "group": "Parameter",
            "type": "String",
            "optional": false,
              "field": "appId",
              "description": "<p>Partner app ID</p>"
            },
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "appSecret",
              "description": "<p>Partner app secret</p>"
            }
          ]
        }
      },
      "filename": "controllers/mobile-doc.js",
      "groupTitle": "Core.MobileAPI",
      "success": {
        "fields": {
          "Success 200": [
            {
              "group": "Success 200",
              "type": "Boolean",
              "optional": false,
              "field": "success",
              "description": "<p>Response status</p>"
            },
            {
              "group": "Success 200",
              "type": "String",
              "optional": false,
              "field": "code",
              "description": "<p>Result code</p>"
            },
            {
              "group": "Success 200",
              "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Result message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "SuccessResponse:",
          "content": "{\n  \"success\": true,\n  \"code\": \"OK\",\n  \"message\": \"Success\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Response status</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Error code</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ErrorResponse:",
          "content": "{\n  \"success\": false,\n  \"code\": \"<ERROR_CODE>\",\n  \"message\": \"<ERROR_MESSAGE>\"\n}",
          "type": "json"
        }
      ]
    }
    },
    {
      "type": "post",
      "url": "/server/users/verifyExchangeToken",
      "title": "Verify Exchange Token",
      "version": "0.0.2",
      "name": "VerifyExchangeToken",
      "group": "Core.ServerAPI",
      "description": "<p>Host-to-host API for Partner App Server to retrieve user hash</p>",
      "parameter": {
        "fields": {
          "Parameter": [
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "exchangeToken",
              "description": "<p>Token that can be used by Partner app server to verify if a user has been authorized by humanId</p>"
            }
          ]
        }
      },
      "success": {
        "fields": {
          "Success 200": [
            {
              "group": "Success 200",
              "type": "Object",
              "optional": false,
              "field": "data",
              "description": "<p>Response data</p>"
            },
            {
              "group": "Success 200",
              "type": "String",
              "optional": false,
              "field": "data.userAppId",
              "description": "<p>User identifier for Partner app</p>"
            },
            {
              "group": "Success 200",
              "type": "Boolean",
              "optional": false,
              "field": "success",
              "description": "<p>Response status</p>"
            },
            {
              "group": "Success 200",
              "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Result code</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Result message</p>"
          }
          ]
        },
        "examples": [
          {
            "title": "SuccessResponse:",
            "content": "{\n  \"success\": true,\n  \"code\": \"OK\",\n  \"message\": \"Success\",\n  \"data\": {\n    \"userAppId\": \"<USER_APP_ID>\"\n  }\n}",
            "type": "json"
          }
        ]
      },
      "filename": "controllers/server-doc.js",
      "groupTitle": "Core.ServerAPI",
      "header": {
        "fields": {
          "Request Header": [
            {
              "group": "Request Header",
              "type": "String",
              "optional": false,
              "field": "client-id",
              "description": "<p>Client ID for Server API</p>"
            },
            {
              "group": "Request Header",
              "type": "String",
              "optional": false,
              "field": "client-secret",
              "description": "<p>Client Secret for Server API</p>"
            }
          ]
        }
      },
      "error": {
        "fields": {
          "Error 4xx": [
            {
              "group": "Error 4xx",
              "type": "Boolean",
              "optional": false,
              "field": "success",
              "description": "<p>Response status</p>"
            },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Error code</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
        },
        "examples": [
          {
            "title": "ErrorResponse:",
            "content": "{\n  \"success\": false,\n  \"code\": \"<ERROR_CODE>\",\n  \"message\": \"<ERROR_MESSAGE>\"\n}",
            "type": "json"
          }
        ]
      }
    },
    {
      "type": "post",
      "url": "/mobile/users/verifyExchangeToken",
      "title": "Verify Exchange Token",
      "version": "0.0.1",
      "name": "VerifyExchangeToken",
      "group": "Core.ServerAPI",
      "description": "<p>Host-to-host API for Partner App Server to retrieve user hash</p>",
      "parameter": {
        "fields": {
          "Parameter": [
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "exchangeToken",
              "description": "<p>Token that can be used by Partner app server to verify if a user has been authorized by humanId</p>"
            },
            {
              "group": "Parameter",
              "type": "String",
              "optional": false,
              "field": "appId",
              "description": "<p>Partner app ID</p>"
            },
            {
              "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "appSecret",
            "description": "<p>Partner app secret</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Response data</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.userHash",
            "description": "<p>User identifier for Partner app</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Response status</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Result code</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Result message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "SuccessResponse:",
          "content": "{\n  \"success\": true,\n  \"code\": \"OK\",\n  \"message\": \"Success\",\n  \"data\": {\n    \"userHash\": \"<USER_HASH>\"\n  }\n}",
          "type": "json"
        }
      ]
    },
      "filename": "controllers/server-doc.js",
      "groupTitle": "Core.ServerAPI",
      "error": {
        "fields": {
          "Error 4xx": [
            {
              "group": "Error 4xx",
              "type": "Boolean",
              "optional": false,
              "field": "success",
              "description": "<p>Response status</p>"
            },
            {
              "group": "Error 4xx",
              "type": "String",
              "optional": false,
              "field": "code",
              "description": "<p>Error code</p>"
            },
            {
              "group": "Error 4xx",
              "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ErrorResponse:",
          "content": "{\n  \"success\": false,\n  \"code\": \"<ERROR_CODE>\",\n  \"message\": \"<ERROR_MESSAGE>\"\n}",
          "type": "json"
        }
      ]
    }
  }
] });
