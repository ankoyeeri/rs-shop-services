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
  const response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: null,
  };

  try {
    const client = new Client(db_options);
    await client.connect();
    await client.query("BEGIN");

    try {
      if (!JSON.parse(event.body)) {
        throw new Error("Bad request. No parameters in the body");
      }

      const { title, description, price, count } = JSON.parse(event.body);

      console.log("Request data:".title, description, price, count);

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
        )`
      );

      response.body = JSON.stringify(
        { addResult: addResult.rowCount },
        null,
        2
      );

      return response;
    } catch (error) {
      console.error(error);

      response.statusCode = 400;
      response.body = JSON.stringify(
        {
          errorMessage: error.stack,
          input: event,
        },
        null,
        2
      );

      return response;
    } finally {
      await client.query("COMMIT");
      await client.end();
    }
  } catch (error) {
    console.error(error.stack);

    response.statusCode = 400;
    response.body = JSON.stringify(
      {
        errorMessage: error.stack,
        input: event,
      },
      null,
      2
    );

    return response;
  }
};
