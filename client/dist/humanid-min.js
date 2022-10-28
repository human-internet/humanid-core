"use strict";
class HumanID {
    constructor(e) {
        (this.baseUrl = e.apiUrl || ""),
            (this.appId = e.appId),
            (this.appSecret = e.appSecret),
            (this.interval = e.interval || 5e3);
    }
    static async sleep(e) {
        return new Promise((t) => setTimeout(t, e));
    }
    async login(e, t, a, r) {
        let s = null,
            i = null,
            n = null,
            o = {
                type: (e = e ? e.toLowerCase() : "app"),
                countryCode: t,
                phone: a,
                appId: this.appId,
                appSecret: this.appSecret,
            };
        if ("app" === e) {
            let e = JSON.stringify(o);
            for (; !s; ) {
                if (
                    !(i = await fetch(this.baseUrl + "/web/users/login", {
                        credentials: "include",
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: e,
                    })).ok
                ) {
                    let e = await i.text();
                    throw new Error(e);
                }
                if ("CONFIRMED" === (n = await i.json()).status) s = n;
                else {
                    if ("REJECTED" === n.status) throw new Error("Login request rejected");
                    "PENDING" === n.status && (await HumanID.sleep(this.interval));
                }
            }
        } else {
            r && (o.verificationCode = r);
            let e = JSON.stringify(o);
            if (
                !(i = await fetch(this.baseUrl + "/web/users/login", {
                    credentials: "include",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: e,
                })).ok
            ) {
                let e = await i.text();
                throw new Error(e);
            }
            if ("REJECTED" === (n = await i.json()).status) throw new Error("Login request rejected");
            s = n;
        }
        return s;
    }
}
