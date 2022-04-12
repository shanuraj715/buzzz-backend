module.exports = function (err, req, res, next) {
    log(err)
    res.status(500).json({ status: false, message: "Server error", data: err })
}