"use strict";

class HumanID {
    constructor(config) {
        this.baseUrl = config.apiUrl || "";
        this.appId = config.appId;
        this.appSecret = config.appSecret;
        this.interval = config.interval || 5000;
    }

    static async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Login using push notification or OTP code
     * @param {*} type {app, otp}
     * @param {*} countryCode
     * @param {*} phone
     * @param {*} verificationCode Optional. If not provided, will try push notif
     */
    async login(type, countryCode, phone, verificationCode) {
        type = type ? type.toLowerCase() : "app";

        let confirmation = null;
        let res = null;
        let data = null;
        let params = {
            type: type,
            countryCode: countryCode,
            phone: phone,
            appId: this.appId,
            appSecret: this.appSecret,
        };

        if (type === "app") {
            // loop until CONFIRMED or REJECTED
            let body = JSON.stringify(params);
            while (!confirmation) {
                res = await fetch(this.baseUrl + "/web/users/login", {
                    credentials: "include", // include cookies
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: body,
                });

                if (!res.ok) {
                    let text = await res.text();
                    throw new Error(text);
                } else {
                    data = await res.json();
                    if (data.status === "CONFIRMED") {
                        confirmation = data;
                    } else if (data.status === "REJECTED") {
                        throw new Error("Login request rejected");
                    } else if (data.status === "PENDING") {
                        await HumanID.sleep(this.interval);
                    }
                }
            }
        } else {
            // type === 'otp'
            if (verificationCode) {
                params.verificationCode = verificationCode;
            }

            let body = JSON.stringify(params);
            res = await fetch(this.baseUrl + "/web/users/login", {
                credentials: "include", // include cookies
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body,
            });

            if (!res.ok) {
                let text = await res.text();
                throw new Error(text);
            } else {
                data = await res.json();
                if (data.status === "REJECTED") {
                    throw new Error("Login request rejected");
                } else {
                    confirmation = data;
                }
            }
        }
        return confirmation;
    }
}
