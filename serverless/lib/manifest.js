module.exports = (event, context, callback) => {
  console.log('event', event)
  console.log('context', context)
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      name: 'netlify-cms-manager'
    })
  })
}
