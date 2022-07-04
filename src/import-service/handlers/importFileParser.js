"use strict";

const AWS = require("aws-sdk");
const csv = require("csv-parser");

module.exports.importFileParser = async (event) => {
  const s3 = new AWS.S3({ region: "eu-west-1" });

  let results = [];

  console.log("Input:", event);

  try {
    for (let record of event.Records) {
      console.log("Record:", record);
      console.log("Bucket name:", record.s3.bucket.name);

      return new Promise((resolve, reject) => {
        const s3Stream = s3
          .getObject({
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key,
          })
          .createReadStream();

        s3Stream
          .pipe(csv())
          .on("data", (data) => {
            results.push(data);
          })
          .on("error", reject)
          .on("end", async () => {
            console.log("Parsed result:", results);

            await s3
              .copyObject({
                Bucket: record.s3.bucket.name,
                CopySource: record.s3.bucket.name + "/" + record.s3.object.key,
                Key: record.s3.object.key.replace("uploaded", "parsed"),
              })
              .promise();

            await s3
              .deleteObject({
                Bucket: record.s3.bucket.name,
                Key: record.s3.object.key,
              })
              .promise();

            console.log(
              `File ${
                record.s3.object.key.split("/")[1]
              } is moved to parsed/ folder`
            );

            resolve({ statusCode: 200 });
          });
      });
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
    };
  }

  console.log("Result:", results);
};
