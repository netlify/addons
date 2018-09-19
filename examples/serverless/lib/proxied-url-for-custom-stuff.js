const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports = (event, context, callback) => {
  console.log('event', event)
  console.log('context', context)

  const headers = event.headers
  // Netlify JWT token in header with site/instance data
  const netlifyToken = headers['X-Nf-Sign']
  console.log('netlifyToken to verify against secret', netlifyToken)

  const decodedToken = jwt.decode(netlifyToken, { complete: true })
  console.log('decodedToken', decodedToken)

  // TODO fix caching issue with URLs and tokens https://goo.gl/ikSEsK
  // const id = decodedToken.payload.id
  const id = event.pathParameters.id
  console.log(`Get instanceId: ${id} from DB`)

  // Validate request is from netlify
  try {
    jwt.verify(netlifyToken, process.env.NETLIFY_SECRET, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError)
      }
      console.log('valid decoded', decoded)
    })
  } catch (e) {
    console.log('catch e', e)
    // Throw here and exit
  }

  // Do custom business logic for proxied call
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

    console.log('Data from DB', data)

    const userConfig = data.Item.config

    // Do custom logic

    // callback is hash data back
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        hi: 'Hello from proxied URL',
        userConfig: userConfig
      }),
    })
  })
}
