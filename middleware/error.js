module.exports = function (err, req, res, next) {
    log(err)
    res.status(500).json({ message: "Server error", data: err })
}