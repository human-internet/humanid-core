const ISO3166 = require("./iso-3166");

const CountryValidator = {};

CountryValidator.isValidAlpha2 = (args) => {
    // Evaluate arguments
    if (typeof args === "string") {
        args = [args];
    } else if (!Array.isArray(args)) {
        throw new Error("invalid argument type. string or array of string expected");
    }

    // Get not found
    const notFound = args.filter((v) => {
        return !ISO3166.Alpha2Codes.includes(v);
    });

    if (notFound.length === 0) {
        return { valid: true };
    }

    // Compose message
    return {
        valid: false,
        error: {
            code: "ERR1",
            message: "iso 3166 alpha2 code not found",
            details: notFound,
        },
    };
};

module.exports = CountryValidator;
