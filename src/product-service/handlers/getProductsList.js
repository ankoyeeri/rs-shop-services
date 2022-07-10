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

module.exports.getProductsList = async (event) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: null,
  };

  try {
    const client = new Client(db_options);
    await client.connect();

    try {
      const products = await client.query(
        `SELECT p.id, p.title, p.description, p.price, s.count 
            FROM products AS p LEFT JOIN stocks AS s 
            ON p.id = s.product_id`
      );

      console.log("getProductsList. Recieved result:", products.rows);

      response.body = JSON.stringify(products.rows, null, 2);

      return response;
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
    } finally {
      client.end();
    }
  } catch (error) {
    console.error(error.stack);

    response.statusCode = 500;
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
