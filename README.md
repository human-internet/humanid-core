# HumanID API

[![Build Status](https://travis-ci.org/bluenumberfoundation/humanid-api.png?branch=master)](https://travis-ci.org/bluenumberfoundation/humanid-api)

HumanID API server. API doc and demo https://humanid.herokuapp.com

Demo credentials:
* Webconsole admin email/password: `admin@local.host` / `admin123`
* Mobile app ID/secret: `DEMO_APP` / `2ee4300fd136ed6796a6a507de7c1f49aecd4a11663352fe54e54403c32bd6a0`

## Prerequisites

1. Node.js >= 10 LTS
2. RDBMS (MySQL >= 14.14 or SQLite3 >= 3.22)

## Setup

1. Install `nodejs >= 10.x.x`
2. Clone repo & install dependencies `npm i`
3. Run test `npm test`
4. Generate database (drop & create) by running `npm run db:refresh` on Linux/MacOS
5. Generate doc `npm run doc` (requires `apidoc` http://apidocjs.com/)
   
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
    "FIREBASE_DB_URL": "https://humanid.firebaseio.com",
    "FIREBASE_ACCOUNT_KEY": {
        "type": "service_account",
        "project_id": "humanid",
        "private_key_id": "humanidprivatekey",
        "private_key": "-----BEGIN PRIVATE KEY-----\nhumanidprivatekey\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk@humanid.iam.gserviceaccount.com",
        "client_id": "1111111111111111111",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40humanid.iam.gserviceaccount.com"
    },
}
```

## Class/Entity Relationship Diagram

The API server stores data in given structure:

> `SequelizeMeta` is just ORM migration metadata which is not related to business process

![Class/Entity Relationship Diagram](erd.png)
