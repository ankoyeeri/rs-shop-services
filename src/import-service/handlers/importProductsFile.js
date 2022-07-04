"use strict";

const AWS = require("aws-sdk");
const BUCKET = "ankoyeeri-import-service-s3";

module.exports.importProductsFile = async (event) => {
  const s3 = new AWS.S3({ region: "eu-west-1" });

  const { name } = event.queryStringParameters;
  const catalogPath = `uploaded/${name}`;

  console.log("Key:", catalogPath);

  let statusCode = 200;
  let body = null;

  const params = {
    Bucket: BUCKET,
    Key: catalogPath,
    Expires: 60,
    ContentType: "text/csv",
  };

  try {
    let url = s3.getSignedUrl("putObject", params);

    console.log("Signed Url:", url);

    statusCode = 200;
    body = url;
  } catch (error) {
    console.error(error);

    statusCode = 500;
    body = JSON.stringify({
      errorMessage: error.stack,
      input: event,
    });
  }

  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: body,
  };
};
