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
  const client = new Client(db_options);
  await client.connect();

  try {
    const products = await client.query(
      `SELECT p.id, p.title, p.description, p.price, s.count 
            FROM products AS p LEFT JOIN stocks AS s 
            ON p.id = s.product_id`
    );

    console.log("getProductsList. Recieved result:", products.rows);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(products.rows, null, 2),
    };
  } catch (error) {
    console.log("Error from getProductsList:", error);
  } finally {
    client.end();
  }
};
