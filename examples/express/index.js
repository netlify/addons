const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('./lib/uuid')
const app = express()
const PORT = process.env.PORT || 5000

/*
  Example implementation of a Netlify Addon Provider

  GET    /               # returns the manifest for the API (in development - not required yet)
  POST   /instances      # create a new instance of your microservice
  GET    /instances/:id  # get the current configuration of an instance
  PUT    /instances/:id  # update the configuration of an instance
  DELETE /instances/:id  # delete an instance
*/

// Load express middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('combined'))

/**
 * Required Provisioning Routes needed by Netlify
 */

// Manifest Route. Returns data about the integration
app.get('/', function (req, res) {
  res.status(200).send({ name: 'example-addon' })
})

// Create an instance of your Service for Netlify Site
app.post('/instances', function (req, res) {
  const body = req.body
  console.log('Create body', body)
  const config = body.config
  console.log(`Create ${body.service_id} Instance for site ${config.site_url}`)

  /*
    CLI Command: `netlify addons:create express-example --name woooooo`

    The config `name: woooo` is user supplied via the CLI
  */

  const userConfig = config.config
  console.log('Create userConfig', userConfig)
  /* Do provisioning logic here */

  const logValue = userConfig.name || 'Express App'

  // This ID will be used for all update/create/delete calls
  // example DELETE `/instances/${id}`
  const id = uuid()
  console.log(`ID for subsequent Update/Get/Delete calls: ${id}`)

  const responseToNetlify = {
    id: id,
    config: config.config,
    env: {
      'YOUR_SERVICE_API_SECRET': 'value'
    },
    snippets: [
      {
        title: 'Snippet From Demo App',
        position: 'head',
        html: `<script>console.log("Hello from ${logValue}")</script>`
      }
    ]
  }
  // Create must return 201 response
  res.status(201).json(responseToNetlify)
})

// Get details on an instance of your Service for Netlify Site
app.get('/instances/:id', function (req, res) {
  const id = req.params.id
  console.log(`Get instanceId: ${id}`)
  console.log('Get body', req.body)
  /* Run logic to get information about instance */

  // const instanceData = fetchDataFromDatabase(id)

  const instanceData = {
    env: {
      'YOUR_SERVICE_API_SECRET': 'value'
    },
    snippets: [
      {
        title: 'Snippet From Demo App',
        position: 'head',
        html: '<script>console.log("Hello from App")</script>'
      }
    ]
  }

  res.status(200).json(instanceData)
})

// Update details on an instance of your Service for Netlify Site
app.put('/instances/:id', function (req, res) {
  const id = req.params.id
  console.log(`Update instanceId: ${id}`)
  const body = req.body
  console.log('Update body', body)
  const config = body.config
  console.log('Update config', config)

  // Run Update logic to change values in your service

  const logValue = config.name || 'Express App'

  // Return updated values to Netlify Site
  const responseToNetlify = {
    env: {
      'YOUR_SERVICE_API_SECRET': 'updated-value'
    },
    snippets: [
      {
        title: 'Snippet From Demo App',
        position: 'head',
        html: `<script>console.log("Goodbye from ${logValue}")</script>`
      }
    ]
  }

  res.status(200).json(responseToNetlify)
})

// Delete details on an instance of your Service for Netlify Site
app.delete('/instances/:id', function (req, res) {
  const id = req.params.id
  console.log(`Delete instanceId: ${id}`)
  console.log(`Delete body`, req.body)
  /* Run Deletion logic to remove the instance from your application */

  // Return any data you want back to Netlify cli
  const instanceInfo = {
    data: {
      lol: 'true'
    }
  }

  // Delete must return 204
  res.status(204).json(instanceInfo)
})

const server = app.listen(PORT, function () {
  console.log('Netlify Addon Provisioning API running on port.', server.address().port)
})
