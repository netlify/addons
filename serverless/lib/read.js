const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports = (event, context, callback) => {
  const body = JSON.parse(event.body)
  console.log(`Get body`, body)

  const id = event.pathParameters.id
  console.log(`Get instanceId: ${id}`)

  const dbParams = {
    TableName: process.env.ADDON_TABLE_NAME,
    Key: {
      id: id
    }
  }

  // Get instance info from database
  return dynamoDb.get(dbParams, (error, data) => {
    if (error) {
      const code = error.statusCode || 501
      return callback(null, {
        statusCode: code,
        body: JSON.stringify({
          statusCode: code,
          message: error.message
        }),
      })
    }

    const responseToNetlify = {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    }

    return callback(null, responseToNetlify)
  })
}
