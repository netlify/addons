/*
 *  Netlify Integration:
 *  Required Rest endpoints for an addon
 */

// POST `/instances`
module.exports.create = require('./lib/create')

// POST `/instances/{id}`
module.exports.read = require('./lib/read')

// PUT `/instances/{id}`
module.exports.update = require('./lib/update')

// DELETE `/instances/{id}`
module.exports.delete = require('./lib/delete')

// Manifest GET `/` details about addon
module.exports.getManifest = require('./lib/manifest')

// Custom functionality proxied to by `/.netlify/your-addon-namespace`
module.exports.customFunctionality = require('./lib/proxied-url-for-custom-stuff')
