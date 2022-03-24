require("dotenv").config();

module.exports = {
    db: {
        dialect: process.env.DB_DRIVER || "mysql",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    },
};
