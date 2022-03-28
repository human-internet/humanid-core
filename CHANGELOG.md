# Changelog

## 1.3.4

- feat(assets): Add upload files to S3
- fix(app): Fix promise save call
- feat(boot): Add feature to run database upgrade on boot
- fix(config): Fix boolean value parsing from env
- feat(server): Add version and build signature on health response
- fix(web-login): Fix limit country config retrieval

## 1.3.3

- feat(boot): Add feature to run database upgrade on boot
- fix(config): Fix boolean value parsing from env
- feat(server): Add version and build signature on health response
- fix(web-login): Fix limit country config retrieval
- fix(otp): Replace raw query with sequelize orm

## 1.3.2

- fix(otp): Replace raw query with sequelize orm

## 1.3.1

- [FIXED] Change priorityCountry param to priority_country

## 1.3.0

- [ADDED] Implement limit country on generating Web Log-in URL
- [ADDED] Implement web config schema input validation on Update App configuration
- [FIXED] Upgrade vulnerable dependency on aws-sdk

## 1.2.2

- [FIXED] Update vulnerable dependencies

## 1.2.1

- [FIXED] change deep link uri scheme to lower case
- [FIXED] implement get redirect url from source mobile

## 1.2.0

- [ADDED] add API Update App Name

## 1.1.1

- [FIXED] add seeders directory to fix error when running migration

## 1.1.0

- [ADDED] add Web Log-in for Mobile API

## 1.0.1

- [SECURITY] audit and fix vulnerable dependencies

## 1.0.0

- [ADDED] add filter list app by name
