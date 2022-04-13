// const express = require('express')


var allowedDomains = [
    "http://localhost:3000", 'https://mp3.techfacts007.in'
] // ['https://google.com', 'https://facebook.com']

module.exports = function (req, callback) {
    var corsOptions;
    if (allowedDomains.length === 0) {
        corsOptions = { origin: true, credentials: true, }
    }
    else {
        if (allowedDomains.indexOf(req.header('Origin')) !== -1) {
            corsOptions = { origin: true, credentials: true, } // reflect (enable) the requested origin in the CORS response
        } else {
            corsOptions = { origin: false } // disable CORS for this request
        }
    }

    callback(null, corsOptions) // callback expects two parameters: error and options
}