const fs = require('fs');

module.exports.getProductsById = async (event) => {
    const { productId } = event.pathParameters;

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(
            JSON.parse(fs.readFileSync('products.json').toString()).find(item => item.id === productId),
            null,
            2
        )
    }
}