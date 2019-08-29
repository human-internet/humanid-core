# HumanID API

[![Build Status](https://travis-ci.org/bluenumberfoundation/humanid-api.png?branch=master)](https://travis-ci.org/bluenumberfoundation/humanid-api)

HumanID API server. API doc and demo https://humanid.herokuapp.com

Demo data:

**Admin**

```
{
    "email": "admin@local.host",
    "password": "admin123"
}
```

**Apps**

```
[{
    "id": "DEMO_APP",
    "secret": "2ee4300fd136ed6796a6a507de7c1f49aecd4a11663352fe54e54403c32bd6a0",
    "platform": "ANDROID",
	"serverKey": "AAAA....S4"    
},
{
    "id": "DEMO_APP_IOS",
    "secret": "541ec90bf636f0a8847885af37faedc258dcc875481f870d507c64d0e785bc1e",
    "platform": "IOS",
	"serverKey": null
}
]
```

**Users**

```
{
    "countryCode": "62",
    "phone": "81234567890",
    "hash": [
        "7a009b9c3203ac3ff081146137e658583d2d60cf867acdb49716b84f1603f8a4", // For DEMO_APP
        "0c88468123e1c193a5f2e925d360266025f739f30ed0eeab7321887905f8c68c", // For DEMO_APP_IOS
    ]
}
```

## Prerequisites

1. Node.js >= 10 LTS
2. RDBMS (MySQL >= 14.14 or SQLite3 >= 3.22)

## Setup

1. Install `nodejs >= 10.x.x`
2. Clone repo & install dependencies `npm i`
3. Run test `npm test`
4. Generate database (drop & create) by running `npm run db:refresh` on Linux/MacOS
5. Generate doc `npm run doc` (requires `apidoc` http://apidocjs.com/)
6. Build client SDK (javascript) `npm run build`
   
> To generate database on Windows **maybe** you can run `setx NODE_ENV=DATABASE && npx sequelize db:drop && sequelize db:create && npx sequelize db:migrate && npx sequelize db:seed:all` **(UNTESTED)**

## Configuration

App configuration is read from `config.json`. You can reuse the provided example in `config.json.example`. 

**Database**

For `DATABASE` configuration please refer to [Sequelize configuration](http://docs.sequelizejs.com/manual/getting-started). Some common examples:

> Sqlite3 file storage

```
{
    ...
    "DATABASE": {
        "username": "root",
        "password": null,
        "database": "humanid",
        "dialect": "sqlite",
        "storage": "db.sqlite"
    },
    ...
}
```

> MySQL with connection pooling

```
{
    ...
    "DATABASE": {
        "username": "root",
        "password": "root",
        "database": "humanid",
        "dialect": "mysql",
        "pool": {
            "max": 5,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        }    
    },
    ...
}
```

**SMS Verification**

To enable phone number verification SMS using [Nexmo](https://www.nexmo.com/products/sms) please provide valid configuration like below (replace values with your own account details):

```
{
    "NEXMO_REST_URL": "https://rest.nexmo.com",
    "NEXMO_API_KEY": "abcd1234",
    "NEXMO_API_KEY": "abcdefgh12345678",
}
```
> If one or more value are missing, no verification SMS will be triggered and verification code is not validated (**always considered valid**)

**Push Notification**

To enable push notification using [Firebase Cloud Messaging](https://firebase.google.com/docs/admin/setup?authuser=0#initialize_the_sdk), provide valid like below (replace values with your own account details):

```
{
    "FIREBASE_SERVER_KEY": "AAAAVo...BmFpE",
}
```

> Currently this is only used for IOS. For Android, `serverKey` for each apps are used

## Class/Entity Relationship Diagram

The API server stores data in given structure:

> `SequelizeMeta` is just ORM migration metadata which is not related to business process

![Class/Entity Relationship Diagram](erd.png)


## Examples

Web login implementation example can be found in `http://localhost:3000/examples/login.html` (publishing from `examples/` dir). 

To simulate web login without mobile device, follow these steps:

1. Open in a tab `http://localhost:3000/examples/confirm.html` and **allow** notification. Leave it open
2. Open in **another** tab `http://localhost:3000/examples/login.html` enter country code & phone number (demo data provided above) and click **Sign In**
3. Go to previous tab that points to `http://localhost:3000/examples/confirm.html`. A confirmation dialog should be shown. Click **Confirm**
4. Go to the other tab `http://localhost:3000/examples/login.html` and you should see **success** alert

> In the actual implementation, every actions in `confirm.html` can only be done from mobile device. Because it requires login hash which should be kept secret per user/app.


## Mobile API Recipes

Registration (login when no other HumanID app installed)

1. Verify user phone number (request OTP SMS) [POST /mobile/users/verifyPhone](https://humanid.herokuapp.com/#api-Mobile-VerifyPhone)
2. Register user [POST /mobile/users/register](https://humanid.herokuapp.com/#api-Mobile-RegisterUser)
3. Store the `hash` safely

Login to new app (login when there is existing HumanID app(s) installed)

1. Login (using installed app `hash`) [POST /mobile/users/login](https://humanid.herokuapp.com/#api-Mobile-LoginUser)
2. Store the new `hash` safely
   
Validation (check if a `hash` is still valid)

1. Login check [GET /mobile/users/login](https://humanid.herokuapp.com/#api-Mobile-LoginUserCheck)
2. Logout if not success (eg. device or number changed)

Login from new device (no other HumanID app installed, but already registered once)

> The same as new registration. Everything else is handled in server/backend

1. Verify user phone number (request OTP SMS) [POST /mobile/users/verifyPhone](https://humanid.herokuapp.com/#api-Mobile-VerifyPhone)
2. Register user [POST /mobile/users/register](https://humanid.herokuapp.com/#api-Mobile-RegisterUser)
3. Store the `hash` safely

Update phone number (from logged-in/authenticated app):

1. Verify user **new** phone number (request OTP SMS) [POST /mobile/users/verifyPhone](https://humanid.herokuapp.com/#api-Mobile-VerifyPhone)
2. Update phone [POST /mobile/users/updatePhone](https://humanid.herokuapp.com/#api-Mobile-UpdatePhone)

Web login confirmation:

1. Update notification ID (get it from Firebase Cloud Messaging SDK) [PUT /mobile/users](https://humanid.herokuapp.com/#api-Mobile-Update) 
2. On push notification, confirm [POST /web/users/confirm](https://humanid.herokuapp.com/#api-Web-Confirm)
3. Or reject [POST /web/users/reject](https://humanid.herokuapp.com/#api-Web-Reject)

Push notification payload that need to be handled:

```
{
    "type": "WEB_LOGIN_REQUEST", 
    "requestingAppId": "APP_ID"
}
```