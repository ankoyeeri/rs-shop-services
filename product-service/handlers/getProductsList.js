const fs = require('fs');

module.exports.getProductsList = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(
            JSON.parse(fs.readFileSync('products.json').toString()),
            null,
            2
        )
    }
}