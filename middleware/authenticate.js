const auth = require('../Controller/Auth')

const authenticate = (req, res, next) => {
    const token = req.headers.authtoken
    if (!token) {
        res.json({ status: false, message: "Invalid Token. Log in again" })
        return
    }
    const verify = auth.verify(token)
    if (!verify.verified) {
        res.json({ status: false, message: "Session expired. Log in again" })
        return
    }
    next()
}
module.exports = authenticate