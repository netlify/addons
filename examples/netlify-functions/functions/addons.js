const path = require('path')
const serverless = require('serverless-http')
const express = require('express')
//const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const customLogger = require('./middleware/logger')

// Routes https://github.com/netlify/addons#add-on-api
const manifest = require('./api/manifest')
const createAddon = require('./api/create')
const readAddon = require('./api/read')
const updateAddon = require('./api/update')
const deleteAddon = require('./api/delete')

// Start express
const app = express()
const router = express.Router()
const isDev = process.env.NODE_ENV === 'dev'
const functionName = path.basename(__filename, '.js')
const routerBasePath = isDev ? `/${functionName}` : `/.netlify/functions/${functionName}/`

// Routes
router.get('/manifest', manifest)
router.post('/instances', createAddon)
router.get('/instances/:id', readAddon)
router.put('/instances/:id', updateAddon)
router.delete('/instances/:id', deleteAddon)

// Attach logger
app.use(morgan(customLogger))

// Setup routes
app.use(routerBasePath, router)

// Apply express middlewares
// router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// Export lambda handler
exports.handler = serverless(app)