

module.exports = function read(req, res) {
  const id = req.params.id
  console.log(`Get instanceId: ${id}`)
  console.log('Get body', req.body)

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
}
