exports.notFound = function(req, res) {
    res.status(404)
    res.json({
        error: 'not found',
        url: req.originalUrl
    })
}

