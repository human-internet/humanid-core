define({ "api": [
  {
    "type": "post",
    "url": "/users/login",
    "title": "User login",
    "name": "LoginUser",
    "group": "Mobile",
    "description": "<p>User login to new partner app using existing hash</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "existingHash",
            "description": "<p>User existing app hash</p>"
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
            "field": "appId",
            "description": "<p>Partner app ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "hash",
            "description": "<p>User unique authentication code for given app</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "deviceId",
            "description": "<p>User unique authentication code for given app</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/mobile.js",
    "groupTitle": "Mobile"
  },
  {
    "type": "get",
    "url": "/users/login",
    "title": "Login check",
    "name": "LoginUserCheck",
    "group": "Mobile",
    "description": "<p>Check if user still logged-in (hash is still valid)</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "hash",
            "description": "<p>User app hash</p>"
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
            "field": "message",
            "description": "<p>OK</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/mobile.js",
    "groupTitle": "Mobile"
  },
  {
    "type": "post",
    "url": "/users/register",
    "title": "User registration",
    "name": "RegisterUser",
    "group": "Mobile",
    "description": "<p>New user registration</p>",
    "parameter": {
      "fields": {
        "Parameter": [
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
            "field": "appId",
            "description": "<p>Partner app ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "hash",
            "description": "<p>User hash (unique authentication code) for given app</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "deviceId",
            "description": "<p>User unique authentication code for given app</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/mobile.js",
    "groupTitle": "Mobile"
  },
  {
    "type": "post",
    "url": "/apps",
    "title": "New (partner) app registration",
    "name": "CreateApp",
    "group": "WebConsole",
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
            "description": "<p>Application ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "secret",
            "description": "<p>Secret code to invoke secured API</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/webconsole.js",
    "groupTitle": "WebConsole"
  }
] });
