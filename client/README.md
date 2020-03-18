# humanID Web SDK

A [client-side js SDK](client/dist/humanid-min.js) is provided to simplify web application interacts with humanID API server. 

An example of simple humanID login implementation using jQuery & Bootstrap is available [here](examples/login.html).

## Implementation steps

Include SDK
```HTML
<script src="/lib/humanid-min.js"></script>
```

Initialize with app credentials
```JavaScript
const humanID = new HumanID({
	apiUrl: 'https://https://humanid.herokuapp.com', 
	appId: 'DEMO_APP', 
	appSecret: '2ee4300fd136ed6796a6a507de7c1f49aecd4a11663352fe54e54403c32bd6a0',
})
```
> `https://https://humanid.herokuapp.com` is our temporary API server

Login by app (push notification)
```JavaScript
humanID.login('otp', countryCode, phone)
    .then((res) => {
        // Confirmed. Store sessionId for validation and logout
        let sessionId = res.sessionId        
        // validate on server-side: 
        // GET /web/users/status?sessionId={sessionId}
    })
    .catch(err => {
        // handle error
    })
```

Login by OTP (SMS)
```JavaScript
// Step 1: Request OTP SMS
humanID.login('otp', countryCode, phone)
    .then((res) => {
        if (res.status === 'CONFIRMED') {
            // active session found
            // store sessionId
            let sessionId = res.sessionId
            // validate on server-side: 
            // GET /web/users/status?sessionId={sessionId}
        } else {
            // show form to enter verification code
        }
    })
    .catch((e) => {
        // failed. rejected or error        
    })

// Step 2: Login with verification code
humanID.login('otp', countryCode, phone, verificationCode)
    .then(() => {
        // Confirmed. Store sessionId for validation and logout
        let sessionId = res.sessionId
        // validate on server-side: 
        // GET /web/users/status?sessionId={sessionId}
    })
    .catch((e) => {
        // handle error
    })
```

## REST APIs

This web SDK is actually wrapping below REST API. It is also possible to directly call this API to implement humanID web authentication:

* [POST /web/users/login](https://humanid.herokuapp.com/#api-Web-Login) Login

There are also some REST APIs related to web implementation but need to be called from backend/server-side:

* [GET /web/users/status](https://humanid.herokuapp.com/#api-Web-Status) Validate login status
* [POST /web/users/logout](https://humanid.herokuapp.com/#api-Web-Logout) Logout