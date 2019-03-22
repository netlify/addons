

module.exports = function create(req, res) {
  const body = req.body
  console.log('Create body', body)
  const config = body.config
  console.log(`Create ${body.service_id} Instance for site ${config.site_url}`)

  const userConfig = config.config
  console.log('Create userConfig', userConfig)
  /* Do provisioning logic here */

  const logValue = userConfig.name || 'Express App'

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
}


function uuid() {
  const lut = []
  for (let i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + (i).toString(16)
  }
  return (function () {
    const d0 = Math.random() * 0xffffffff | 0
    const d1 = Math.random() * 0xffffffff | 0
    const d2 = Math.random() * 0xffffffff | 0
    const d3 = Math.random() * 0xffffffff | 0
    return `${lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff]}-${
      lut[d1 & 0xff]}${lut[d1 >> 8 & 0xff]}-${lut[d1 >> 16 & 0x0f | 0x40]}${lut[d1 >> 24 & 0xff]}-${
      lut[d2 & 0x3f | 0x80]}${lut[d2 >> 8 & 0xff]}-${lut[d2 >> 16 & 0xff]}${lut[d2 >> 24 & 0xff]
      }${lut[d3 & 0xff]}${lut[d3 >> 8 & 0xff]}${lut[d3 >> 16 & 0xff]}${lut[d3 >> 24 & 0xff]}`
  }())
}