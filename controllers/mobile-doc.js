'use strict'

/**
 * @apiDefine MobileClientCredential
 * @apiHeader (Request Header) {String} client-id Client ID for Mobile SDK
 * @apiHeader (Request Header) {String} client-secret Client Secret for Mobile SDK
 */

// ----------

/**
 * @api {post} /mobile/users/verifyPhone Request Login OTP via SMS
 * @apiVersion 0.0.1
 * @apiName RequestLoginOtp
 * @apiGroup Core.MobileAPI
 * @apiDescription Trigger send OTP code via SMS
 *
 * @apiUse AppCredentialParam
 * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
 * @apiParam {String} phone User mobile phone number
 *
 * @apiUse SuccessResponse
 * @apiUse OkResponseExample
 *
 * @apiUse ErrorResponse
 */

/**
 * @api {post} /mobile/users/login/request-otp Login: Request OTP
 * @apiVersion 0.0.2
 * @apiName RequestLoginOtp
 * @apiGroup Core.MobileAPI
 * @apiDescription Trigger send OTP code via SMS
 *
 * @apiUse MobileClientCredential
 * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
 * @apiParam {String} phone User mobile phone number
 *
 * @apiUse SuccessResponse
 * @apiUse OkResponseExample
 *
 * @apiUse ErrorResponse
 */

// ----------

/**
 * @api {post} /mobile/users/register Login
 * @apiVersion 0.0.1
 * @apiName LoginByOtp
 * @apiGroup Core.MobileAPI
 * @apiDescription Login by with given OTP code
 * If user has not yet granted access to app, a new AppUser will be created
 *
 * @apiUse AppCredentialParam
 * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
 * @apiParam {String} phone User mobile phone number
 * @apiParam {String} deviceId User device ID
 * @apiParam {String} verificationCode User phone number verification code (OTP)
 * @apiParam {String} notifId Push notif ID
 *
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data Response data
 * @apiSuccess {String} data.exchangeToken Token that can be used by Partner app server to verify if a user has been authorized by humanId
 * @apiSuccess {String} data.userHash User identifier for Partner app
 * @apiSuccessExample {json} SuccessResponse:
 *   {
 *     "success": true,
 *     "code": "OK",
 *     "message": "Success",
 *     "data": {
 *       "exchangeToken": "<EXCHANGE_TOKEN>",
 *       "userHash": "<USER_HASH>"
 *     }
 *   }
 *
 * @apiUse ErrorResponse
 */

/**
 * @api {post} /mobile/users/login Login
 * @apiVersion 0.0.2
 * @apiName LoginByOtp
 * @apiGroup Core.MobileAPI
 * @apiDescription Login by with given OTP code
 * If user has not yet granted access to app, a new AppUser will be created
 *
 * @apiUse MobileClientCredential
 * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
 * @apiParam {String} phone User mobile phone number
 * @apiParam {number} deviceTypeId Device Type ID (1 = Android, 2 = iOS)
 * @apiParam {String} deviceId User device ID
 * @apiParam {String} verificationCode User phone number verification code (OTP)
 * @apiParam {String} notifId Push notif ID
 *
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data Response data
 * @apiSuccess {String} data.exchangeToken Token that can be used by Partner app server to verify if a user has been authorized by humanId
 * @apiSuccessExample {json} SuccessResponse:
 *   {
 *     "success": true,
 *     "code": "OK",
 *     "message": "Success",
 *     "data": {
 *       "exchangeToken": "<EXCHANGE_TOKEN>"
 *     }
 *   }
 *
 * @apiUse ErrorResponse
 */

// ----------

/**
 * @api {post} /mobile/users/revokeAccess Revoke App Access
 * @apiVersion 0.0.1
 * @apiName RevokeAppAccess
 * @apiGroup Core.MobileAPI
 * @apiDescription Revoke Partner App access to User data
 *
 * @apiUse AppCredentialParam
 * @apiUse UserCredentialParam
 *
 * @apiUse SuccessResponse
 * @apiUse OkResponseExample
 *
 * @apiUse ErrorResponse
 */

/**
 * @api {post} /mobile/users/revoke-access Revoke App Access
 * @apiVersion 0.0.2
 * @apiName RevokeAppAccess
 * @apiGroup Core.MobileAPI
 * @apiDescription Revoke Partner App access to User data
 *
 * @apiUse MobileClientCredential
 * @apiUse UserCredentialParam
 *
 * @apiUse SuccessResponse
 * @apiUse OkResponseExample
 *
 * @apiUse ErrorResponse
 */