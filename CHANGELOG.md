# Changelog

## 1.7.4

- fix(account): Set email "from" sender

## 1.7.3

- fix(account): Returns redirect app url on success verify new phone

## 1.7.2

- fix(account): Delete existing Account on new phone when transferring recovered old Account
- fix(account): Add hasAccount flag to indicate new phone is already AppUser account
- fix(account): Allow request otp for new phone with existing AppUser to be transferred account for recovery

## 1.7.1

- feat(app): Add seeder script to fix app config structure
- fix(app): Fix init app config structure

## 1.7.0

- feat(web-login): Add flag new account created and app offers account recovery or not

## 1.6.0

- feat(web-login): Add application config in Get Detail App response
- feat(dc/app): Init default app config values on Create App
- fix: Remove OTP logging for debug

## 1.5.1

- fix(account): Add app name in Transfer Account response

## 1.5.0

- fix(sandbox): Change dev user limit to configurable via env
- feat(account): Add API Transfer Account to new phone number
- fix(user): Remove unused version column
- feat(account): Add API Request OTP for Transfer Account
- fix(db): Fix missing AppStatus reference data
- feat(account): Add API Verify New Phone
- fix(auth): Add error logging when error parsing Authorization header occurred
- feat(account): Add API Request OTP for Account Recovery

## 1.4.3

- fix(sandbox): Fix missing phoneNoMasked response in API List Sandbox OTP

## 1.4.2

- fix(server): Fix duplicate log when writing request log and fix formatting
- fix(web-login): Add expiredAt and hasSetupRecovery flag in API Log-in response
- feat(server): Add request log after writing response

## 1.4.1

- fix(account): Change response exchangeToken to redirectUrl on successfully Set Email for Account Recovery

## 1.4.0

- feat(account): Add API Set Account Recovery Email
- fix(auth): Remove clear exchange token from validate function
- fix(auth): Add expiredAt in create exchange token result
- feat(assets): Add upload files to S3
- fix(app): Fix promise save call

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
