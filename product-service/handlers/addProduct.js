"use strict";

const { Client } = require("pg");
const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const db_options = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
};

module.exports.addProduct = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          message: "Bad request. Body is empty",
          input: event,
        },
        null,
        2
      ),
    };
  }

  const { title, description, price, count } = JSON.parse(event.body);

  const client = new Client(db_options);
  await client.connect();

  console.log("Request data:".title, description, price, count);

  try {
    const addResult = await client.query(
      `WITH new_product AS (
          INSERT INTO products(title, description, price) VALUES
          ('${title}', '${description}', ${price})
          RETURNING id
        )
        INSERT INTO stocks(product_id, count) VALUES 
        (
            (SELECT id FROM new_product),
            ${count}
        )
    `
    );

    return {
      statusCode: 200,
      isBase64Encoded: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        { addResult: addResult.rowCount },
        null,
        2
      ).toString(),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      isBase64Encoded: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          errorMessage: error.stack,
          input: event,
        },
        null,
        2
      ),
    };
  } finally {
    client.end();
  }
};
