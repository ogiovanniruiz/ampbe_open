const jwt = require('jsonwebtoken')

// Routes reachable without a JWT (paths are relative to /api)
const PUBLIC_ROUTES = [
    // Login and signup: called before the client has a token
    '/localLogin',
    '/oauthLogin',
    '/createUser',
    '/createOauthUser',
    '/checkVersion',
    '/passwordReset',
    '/setNewPassword',
    '/contactDevs',
    '/processLink',
    '/createRdrUser',

    // Twilio and SignalWire webhooks
    '/call',
    '/callStatus',
    '/conferenceCallStatus',
    '/receiveTwilioText',
    '/receiveSWText',
    '/textDeliveryStatus',
    '/hotlineReceiveText',
    '/incomingHotlineCall',
    '/updateHotlineCallStatus',
].map(route => route.toLowerCase())

const normalize = path => (path.replace(/\/+$/, '') || '/').toLowerCase()

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS' || PUBLIC_ROUTES.includes(normalize(req.path))) return next()

    const [scheme, token] = (req.headers.authorization || '').split(' ')

    try {
        if (scheme !== 'Bearer' || !token) throw new Error('missing token')
        req.auth = jwt.verify(token, process.env.jwtSecret)
        next()
    } catch (e) {
        console.log('401', req.method, req.path, e.message)
        res.status(401).send({ error: 'unauthorized' })
    }
}
