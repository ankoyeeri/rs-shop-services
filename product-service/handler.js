const { getProductsById } = require("./handlers/getProductsById");
const { getProductsList } = require("./handlers/getProductsList");
const { addProduct } = require("./handlers/addProduct");

module.exports = { getProductsById, getProductsList, addProduct };
