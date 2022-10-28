const { S3, Credentials } = require("aws-sdk"),
    path = require("path"),
    { config } = require("../components/common");

function getObjectName(filePath, fileName) {
    let objectName;
    if (!fileName) {
        objectName = fileName;
    } else {
        objectName = path.join(filePath, fileName);
    }
    return path.join(config.S3_DIR_PREFIX, objectName);
}

function getUrl(filePath, fileName) {
    const objectName = getObjectName(filePath, fileName);
    return new URL(`${config.S3_CDN_BASE_URL}/${objectName}`);
}

function initS3() {
    const client = new S3({
        credentials: new Credentials({
            accessKeyId: config.S3_ACCESS_KEY_ID,
            secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        }),
        region: config.S3_REGION,
    });
    return {
        client,
        bucketName: config.S3_BUCKET_NAME,
        getObjectName,
        getUrl,
    };
}

module.exports = initS3();
