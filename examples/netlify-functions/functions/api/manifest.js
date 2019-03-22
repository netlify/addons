

module.exports = function manifest(req, res) {
	res.status(200).send({
		name: 'example-addon'
	})
}