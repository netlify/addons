

module.exports = function update(req, res) {
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
}
