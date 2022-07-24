const { getProductsById } = require('./handlers/getProductsById');
const { getProductsList } = require('./handlers/getProductsList');
const { addProduct } = require('./handlers/addProduct');
const { catalogBatchProcess } = require('./handlers/catalogBatchProcess');

module.exports = {
  getProductsById,
  getProductsList,
  addProduct,
  catalogBatchProcess,
};
