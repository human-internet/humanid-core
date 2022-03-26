# humanid-core

## Requirements

2. Node.js v16 LTS
3. MySQL 5.7
4. API Credentials
    - SMS Provider
        - Vonage (formerly Nexmo)
        - AWS SNS
    - Firebase Server Key

## Set-up

### Install Dependencies

```bash
npm install
```

### Configure

Configure application with Environment Variables. See `.example.env` for available configurations.

| Key                          | Description                                                             | Value                                                                               | Required |
|------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------|----------|
| `PORT`                       | Server listening port                                                   | Number. Default: `3000`                                                             |          |
| `DEBUG`                      | Debug flag                                                              | Boolean. Default: `false`                                                           |          |
| `BASE_PATH`                  | Base Path for URL                                                       | String. Default: <EMPTY_STRING>                                                     |          |
| `BASE_URL`                   | Base URL to override URL resolver (for deployment behind Reverse Proxy) | String. Default: `http://localhost:${PORT}`                                         |          |
| `LOG_LEVEL`                  | Log level to show                                                       | String. Default: `info`                                                             |          |
| `LOG_FORMAT`                 | Logging format                                                          | String. Default: `json`. Available values: `console`                                |          |
| `DB_DRIVER`                  | Database Server Driver.                                                 | `mysql`                                                                             | ✓        |
| `DB_HOST`                    | Database Server Host                                                    | String                                                                              | ✓        |
| `DB_PORT`                    | Database Server Port                                                    | Number                                                                              | ✓        |
| `DB_USER`                    | Database Server Username                                                | String                                                                              | ✓        |
| `DB_PASS`                    | Database Server Password                                                | String                                                                              | ✓        |
| `DB_NAME`                    | Database Server Database Name                                           | String                                                                              | ✓        |
| `ASSET_URL`                  | Base URL for Assets                                                     | String                                                                              |          |
| `HMAC_SECRET`                | Secret for generating HMAC                                              | String                                                                              | ✓        |
| `HASH_ID_SALT_1`             | 1st Salt for User Hash ID generate                                      | String                                                                              | ✓        |
| `HASH_ID_SALT_2`             | 2nd Salt for User Hash ID generate                                      | String                                                                              | ✓        |
| `HASH_ID_REPEAT`             | Number of repeat User Hash ID generate                                  | Number: Default: `4`                                                                |          |
| `HASH_ID_SECRET`             | Secret for generate User Hash ID                                        | String                                                                              | ✓        |
| `EXCHANGE_TOKEN_AES_KEY`     | Secret for encrypt/decrypt Exchange Key                                 | 32 bytes encoded in Hex String. Run `npm run gen-aes-key` to generate a new AES Key | ✓        |
| `EXCHANGE_TOKEN_LIFETIME`    | Exchange Token Lifetime in seconds                                      | Number. Default: `300`                                                              |          |
| `DEV_CONSOLE_CLIENT_API_KEY` | API Key for humanID Developer Console Access                            | String                                                                              | ✓        |
| `NEXMO_API_KEY`              | Vonage API Key                                                          | String                                                                              | ✓        |
| `NEXMO_API_SECRET`           | Vonage API Secret                                                       | String                                                                              | ✓        |
| `NEXMO_SENDER_ID_DEFAULT`    | Default fallback value for Vonage Sender ID                             | String. Default: `humanID`                                                          |          |
| `NEXMO_SENDER_ID_US`         | Sender ID for US                                                        | String                                                                              |          |
| `NEXMO_SENDER_ID_VN`         | Sender ID for Vietnam                                                   | String                                                                              |          |
| `AWS_SECRET_KEY_ID`          | AWS Secret Key ID                                                       | String                                                                              | ✓        |
| `AWS_SECRET_ACCESS_KEY`      | AWS Secret Access Key                                                   | String                                                                              | ✓        |
| `AWS_SMS_REGION`             | AWS Region                                                              | String. Default: `us-west-2`                                                        |          |
| `BOOT_DB_UPGRADE`            | Run database upgrade on boot                                            | Boolean. Default: `false`                                                           |          |

### Init Database

> Use MySQL server in `docker` for local development or testing environment
>
> ```bash
> # Host: localhost
> # Port: 3306 
> # Username: root
> # Password: root
>
> docker run -d --name db-mysql -p 3306:3306 \
>  -e MYSQL_ROOT_PASSWORD=root \
>  -e MYSQL_DATABASE=l-humanid-core-db \
>  mysql:5.7
> ```

Once the server has been configured, run command below to start migration:

```bash
npm run db:refresh
```

## Development

- Start Server

  ```bash
  npm run start
  ```

## Maintenance

### Database

Database connection will use `DATABASE` in `config.json`

- Check Database Migration Status

  ```bash
  npm run db:status
  ```

- Update Database

  ```bash
  npm run db:up
  ```

- Undo to Last Migration Version

  ```bash
  npm run db:down
  ```

## License

Copyright 2019-2022 Foundation for a Human Internet Licensed under the GNU General Public License
v3.0 [(LICENSE)](/LICENSE)
