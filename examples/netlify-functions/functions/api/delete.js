

module.exports = function delete(req, res) {
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
}