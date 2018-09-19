const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

// Update the instance
module.exports = (event, context, callback) => {
  const body = JSON.parse(event.body)
  console.log('Update body', body)

  const id = event.pathParameters.id
  console.log(`Get instanceId: ${id}`)

  const config = body.config
  console.log('Update config', config)

  const dbParams = {
    TableName: process.env.ADDON_TABLE_NAME,
    Item: {
      id: id,
      updatedAt: new Date().getTime(),
      config: config,
    }
  }

  return dynamoDb.put(dbParams, (error, data) => {
    if (error) {
      console.log('Update error', error)
      const code = error.statusCode || 404
      return callback(null, {
        statusCode: code,
        body: JSON.stringify({
          statusCode: code,
          message: error.message
        }),
      })
    }

    console.log('Update data', data)

    console.log('params.Item', dbParams.Item)

    const newData = {}

    console.log('newData', newData)

    const responseToNetlify = {
      statusCode: 200,
      body: JSON.stringify(newData),
    }

    return callback(null, responseToNetlify)
  })
}
