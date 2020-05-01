define({ "api": [
  {
    "type": "post",
    "url": "/mobile/users/login",
    "title": "Login by Existing Access",
    "name": "LoginByExistingAccess",
    "group": "Core_MobileAPI",
    "description": "<p>Login to new partner app using existing access</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "existingAppId",
            "description": "<p>Partner app id that is used to authorized login</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "existingUserHash",
            "description": "<p>User identifier on existing Partner app</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "deviceId",
            "description": "<p>User device identifier</p>"
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
            "description": "<p>TODO: Token that can be used by Partner app server to verify if a user has been authorized by humanId</p>"
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
    "version": "0.0.0",
    "filename": "controllers/mobile.js",
    "groupTitle": "Core_MobileAPI",
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
    "title": "Login by OTP",
    "name": "LoginByOtp",
    "group": "Core_MobileAPI",
    "description": "<p>User Login by verify given OTP code. If user has not yet granted access to app, a new AppUser will be created</p>",
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
    "version": "0.0.0",
    "filename": "controllers/mobile.js",
    "groupTitle": "Core_MobileAPI",
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
    "title": "Request OTP via SMS",
    "name": "RequestSmsOtp",
    "group": "Core_MobileAPI",
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
    "version": "0.0.0",
    "filename": "controllers/mobile.js",
    "groupTitle": "Core_MobileAPI",
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
    "url": "/mobile/users/revokeAccess",
    "title": "Revoke App Access",
    "name": "RevokeAppAccess",
    "group": "Core_MobileAPI",
    "description": "<p>Revoke Partner App access to User data</p>",
    "version": "0.0.0",
    "filename": "controllers/mobile.js",
    "groupTitle": "Core_MobileAPI",
    "parameter": {
      "fields": {
        "Parameter": [
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userHash",
            "description": "<p>User identifier for Partner app</p>"
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
    "type": "put",
    "url": "/mobile/users",
    "title": "Update FCM Notification Id",
    "name": "UpdateNotificationId",
    "group": "Core_MobileAPI",
    "description": "<p>Update notif ID</p>",
    "parameter": {
      "fields": {
        "Parameter": [
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userHash",
            "description": "<p>User identifier for Partner app</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/mobile.js",
    "groupTitle": "Core_MobileAPI",
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
    "type": "get",
    "url": "/mobile/users/login",
    "title": "Validate App User Access",
    "name": "ValidateAppUserAccess",
    "group": "Core_MobileAPI",
    "description": "<p>Check if partner app is granted access to user data</p>",
    "version": "0.0.0",
    "filename": "controllers/mobile.js",
    "groupTitle": "Core_MobileAPI",
    "parameter": {
      "fields": {
        "Parameter": [
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userHash",
            "description": "<p>User identifier for Partner app</p>"
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
    "url": "/mobile/users/verifyExchangeToken",
    "title": "Verify Exchange Token",
    "name": "VerifyExchangeToken",
    "group": "Core_ServerAPI",
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
    "version": "0.0.0",
    "filename": "controllers/mobile.js",
    "groupTitle": "Core_ServerAPI",
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
    "type": "get",
    "url": "/demo-app/api/users/profile",
    "title": "Get Profile",
    "name": "GetUserProfile",
    "group": "DemoApp",
    "description": "<p>Get user profile by user access token</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "userAccessToken",
            "description": "<p>User Access Token</p>"
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
            "description": "<p>User Profile</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/demo-app.js",
    "groupTitle": "DemoApp"
  },
  {
    "type": "post",
    "url": "/demo-app/api/users/log-in",
    "title": "Log In",
    "name": "LogIn",
    "group": "DemoApp",
    "description": "<p>LogIn to 3rd party app using humanId Exchange Token</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "clientSecret",
            "description": "<p>Client credentials to access Api</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "exchangeToken",
            "description": "<p>An exchange token that states user has been verified by humanId</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Access Token to App</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/demo-app.js",
    "groupTitle": "DemoApp"
  },
  {
    "type": "put",
    "url": "/demo-app/api/users/log-out",
    "title": "Log Out",
    "name": "LogOut",
    "group": "DemoApp",
    "description": "<p>LogOut to 3rd party app using humanId Exchange Token</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "userAccessToken",
            "description": "<p>User Access Token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Result status</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/demo-app.js",
    "groupTitle": "DemoApp"
  },
  {
    "type": "put",
    "url": "/demo-app/api/users/refresh-session",
    "title": "Refresh Session",
    "name": "RefreshSession",
    "group": "DemoApp",
    "description": "<p>Refresh user session</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "userAccessToken",
            "description": "<p>User Access Token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Refreshed Access Token to App</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/demo-app.js",
    "groupTitle": "DemoApp"
  },
  {
    "type": "put",
    "url": "/demo-app/api/users/profile",
    "title": "Update Profile",
    "name": "UpdateUserProfile",
    "group": "DemoApp",
    "description": "<p>Update user profile by user access token</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "userAccessToken",
            "description": "<p>User Access Token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "fullName",
            "description": "<p>Update full name</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Update result status</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/demo-app.js",
    "groupTitle": "DemoApp"
  },
  {
    "type": "post",
    "url": "/web/users/confirm",
    "title": "Confirm",
    "name": "Confirm",
    "group": "Mobile",
    "description": "<p>Confirm web login</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "hash",
            "description": "<p>User hash (unique authentication code) of confirming app</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "requestingAppId",
            "description": "<p>App ID that requests confirmation</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "type",
            "description": "<p>Confirmation type eg. <code>WEB_LOGIN_REQUEST</code></p>"
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
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Confirmation ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Requesting App ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Confirmation type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "confirmingAppId",
            "description": "<p>Confirming App ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/web.js",
    "groupTitle": "Mobile"
  },
  {
    "type": "post",
    "url": "/web/users/reject",
    "title": "Reject",
    "name": "Reject",
    "group": "Mobile",
    "description": "<p>Reject or revoke web login</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "hash",
            "description": "<p>User hash (unique authentication code) of confirming app</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "requestingAppId",
            "description": "<p>App ID that requests confirmation</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "type",
            "description": "<p>Confirmation type eg. <code>WEB_LOGIN_REQUEST</code></p>"
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
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Confirmation ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Requesting App ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Confirmation type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "confirmingAppId",
            "description": "<p>Confirming App ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/web.js",
    "groupTitle": "Mobile"
  },
  {
    "type": "post",
    "url": "/console/apps",
    "title": "App registration",
    "name": "CreateApp",
    "group": "WebConsole",
    "description": "<p>New (partner) app registration</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p><code>Bearer accessToken</code></p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Application ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Application ID (must be unique 5-20 characters alphanumeric)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "secret",
            "description": "<p>Secret code to invoke secured API</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "platform",
            "description": "<p>Platform <code>{'ANDROID', 'IOS'}</code></p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "serverKey",
            "description": "<p>Firebase Cloud Messaging Server Key</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "urls",
            "description": "<p>Whitelisted domain URLs for web client (comma-separated). Example: <code>https://foo.com,https://bar.com</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/webconsole.js",
    "groupTitle": "WebConsole"
  },
  {
    "type": "get",
    "url": "/console/apps",
    "title": "App list",
    "name": "ListApps",
    "group": "WebConsole",
    "description": "<p>Get list of registered (partner) apps</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p><code>Bearer accessToken</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "pages",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/webconsole.js",
    "groupTitle": "WebConsole"
  },
  {
    "type": "get",
    "url": "/console/users",
    "title": "User list",
    "name": "ListUser",
    "group": "WebConsole",
    "description": "<p>Get list of registered users</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p><code>Bearer accessToken</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "pages",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/webconsole.js",
    "groupTitle": "WebConsole"
  },
  {
    "type": "post",
    "url": "/console/login",
    "title": "Login",
    "name": "login",
    "group": "WebConsole",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "accessToken",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/webconsole.js",
    "groupTitle": "WebConsole"
  },
  {
    "type": "post",
    "url": "/web/users/login",
    "title": "Login",
    "name": "Login",
    "group": "Web",
    "description": "<p>Attempt to login by phone number. If not authorized, request confirmation based on <code>type</code>:</p> <p>1. <code>app</code>: Send login push notification to one of mobile app: <code>{\"type\": \"WEB_LOGIN_REQUEST\", \"requestingAppId\": \"APP_ID\"}</code> where <code>type</code> always be <code>WEB_LOGIN_REQUEST</code>, and <code>requestingAppId</code> is the ID of the app that requests login</p> <p>2. <code>otp</code>: Send SMS containing OTP code to phone number (if already registered)</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "type",
            "description": "<p>Auth type <code>{'app','otp'}</code>. Default: <code>'app'</code></p>"
          },
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
            "optional": true,
            "field": "verificationCode",
            "description": "<p>User phone number verification code (OTP)</p>"
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
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Partner app ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "sessionId",
            "description": "<p>session ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p><code>CONFIRMED</code></p>"
          }
        ],
        "202": [
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Partner app ID</p>"
          },
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "sessionId",
            "description": "<p>session ID</p>"
          },
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p><code>PENDING</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/web.js",
    "groupTitle": "Web"
  },
  {
    "type": "post",
    "url": "/web/users/logout",
    "title": "Logout",
    "name": "Logout",
    "group": "Web",
    "description": "<p>Revoke web login session</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sessionId",
            "description": "<p>Obtained from login response</p>"
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
    "version": "0.0.0",
    "filename": "controllers/web.js",
    "groupTitle": "Web"
  },
  {
    "type": "get",
    "url": "/web/users/status",
    "title": "Status",
    "name": "Status",
    "group": "Web",
    "description": "<p>Check login status by <code>sessionId</code> from server-side/backend</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sessionId",
            "description": "<p>Obtained from login response</p>"
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
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Partner app ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "sessionId",
            "description": "<p>session ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p><code>CONFIRMED</code></p>"
          }
        ],
        "202": [
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "appId",
            "description": "<p>Partner app ID</p>"
          },
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "sessionId",
            "description": "<p>session ID</p>"
          },
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p><code>PENDING</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/web.js",
    "groupTitle": "Web"
  }
] });
