const Router = require('express').Router
var TextImage = require('../../models/activities/textbank/textImage')

// Public (no JWT): SignalWire fetches these when sending MMS. Mounted outside /api in app.js.
module.exports = Router({ mergeParams: true }).get('/:file', async (req, res, next) => {
    try {
        var key = req.params.file.replace(/\.[a-z]+$/i, '')
        if(!/^[0-9a-f]{32}$/.test(key)) return res.sendStatus(404)

        var image = await TextImage.findOne({key}, {data: 1, contentType: 1}).lean()
        if(!image) return res.sendStatus(404)

        res.set('Content-Type', image.contentType || 'application/octet-stream')
        res.set('Cache-Control', 'public, max-age=31536000, immutable')
        // lean() returns a BSON Binary; its .buffer holds the bytes
        res.send(Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data.buffer))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
