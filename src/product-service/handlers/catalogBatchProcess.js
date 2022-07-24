'use strict';

const { Client } = require('pg');
const AWS = require('aws-sdk');

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

module.exports.catalogBatchProcess = async (event) => {
  const products = event.Records.map(({ body }) => JSON.parse(body));

  console.log('Given products:', products);

  const client = new Client(db_options);
  const sns = new AWS.SNS({ region: 'eu-west-1' });
  await client.connect();
  await client.query('BEGIN');

  try {
    products[0].forEach(async (item) => {
      let { title, description, price, count } = item;

      console.log('Raw item:', item);
      console.log('Request data:', title, description, price, count);

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
      console.log('Query result:', addResult.rowCount);
    });

    console.log('Publishing...');

    sns.publish(
      {
        Subject: 'catalogBatchProcess',
        Message: JSON.stringify(products[0]),
        TopicArn: process.env.SNS_ARN,
      },
      (err, result) => {
        if (err) throw err;
        console.log('Email sent with success:', result);
      }
    );
  } catch (error) {
    console.error(error.stack);
    await client.query('ROLLBACK');
  } finally {
    await client.query('COMMIT');
    await client.end();

    console.log('Client closed');
  }
};
