const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports = (event, context, callback) => {
  const body = JSON.parse(event.body)
  console.log(`Delete body`, body)

  const id = event.pathParameters.id
  console.log(`Delete instanceId: ${id}`)

  const dbParams = {
    TableName: process.env.ADDON_TABLE_NAME,
    Key: {
      id: id
    }
  }

  // Delete instance from our DB
  return dynamoDb.delete(dbParams, (error, data) => {
    if (error) {
      console.log('delete error', error)
      const code = error.statusCode || 404
      return callback(null, {
        statusCode: code,
        body: JSON.stringify({
          statusCode: code,
          message: error.message
        }),
      })
    }

    const responseToNetlify = {
      statusCode: 204, // <-- delete must call back with 204. https://github.com/netlify/bitballoon/blob/3798ad7d7af1f91048001eaf13ca42fdce3218f8/app/models/service.rb#L69
      body: JSON.stringify(dbParams.Key),
    }

    return callback(null, responseToNetlify)
  })
}
