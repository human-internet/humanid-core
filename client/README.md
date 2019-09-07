# HumanID Web SDK

A [client-side js SDK](client/dist/humanid-min.js) is provided to simplify web application interacts with HumanID platform. 

An example of simple HumanID login implementation using jQuery & Bootstrap is available [here](examples/login.html).

## Implementation steps


Include SDK
```
<script src="/lib/humanid-min.js"></script>
```

Initialize with app credentials
```
const humanID = new HumanID({
	apiUrl: 'https://https://humanid.herokuapp.com', 
	appId: 'DEMO_APP', 
	appSecret: '2ee4300fd136ed6796a6a507de7c1f49aecd4a11663352fe54e54403c32bd6a0',
})
```

Login by app (push notification)
```
humanID.login(countryCode, phone)
    .then(() => {
        // confirmed. proceed with login flow
        // on server side call API to validate:
        // POST /web/users/login {countryCode: countryCode, phone: phone, appId: this.appId, appSecret: this.appSecret}
    })
    .catch(err => {
        // handle error
    })
```

Login by OTP (SMS)
```
// Step 1: Request OTP SMS
humanID.requestOTP(countryCode, phone)
    .then(() => {
        // on success, show login form 
        // with verification code input
    })
    .catch((e) => {
        // failed. rejected or error        
    })

// Step 2: Login with verification code
humanID.login(countryCode, phone, verificationCode)
    .then(() => {
        // confirmed. proceed with login flow
        // on server side call API to validate:
        // POST /web/users/login {countryCode: countryCode, phone: phone, appId: this.appId, appSecret: this.appSecret}
    })
    .catch((e) => {
        // handle error
    })
```

