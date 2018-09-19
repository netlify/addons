const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid')
const util = require('util')

module.exports = (event, context, callback) => {
  const body = JSON.parse(event.body)
  console.log('Create body', util.inspect(body, false, null))

  const config = body.config
  console.log(`Create ${body.service_id} Instance for site ${config.site_url}`)

  const userConfig = config.config
  console.log('Create userConfig', userConfig)

  const newInstanceId = uuid.v1()
  console.log(`ID for subsequent Update/Get/Delete calls: ${newInstanceId}`)

  const dbParams = {
    TableName: process.env.ADDON_TABLE_NAME,
    Item: {
      id: newInstanceId,
      createdAt: new Date().getTime(),
      config: config.config,
      site_url: config.site_url,
      site_id: config.site_id,
      jwt: config.jwt.secret,
    }
  }

  // Save to DB
  return dynamoDb.put(dbParams, (error, data) => {
    if (error) {
      console.error(error)
      return callback(null, {
        statusCode: error.statusCode || 501,
        body: 'Couldn\'t add the integration.',
      })
    }

    const proxyUrlBase = process.env.CREDENTIALS_API_URL

    // our api endpoint api.com/get-credentials/
    const proxyUrlEndpoint = `${proxyUrlBase}/${newInstanceId}`

    // (optionally) we can pass additional info along with the proxied call
    //  const proxyUrlEndpoint = `${proxyUrlBase}/${otherLookupInfo}?paramsTo=pass`

    const response = {
      statusCode: 201,
      body: JSON.stringify({
        id: newInstanceId,
        endpoint: proxyUrlEndpoint,
      })
    }

    console.log('Create response', response)

    return callback(error, response)
  })
}
