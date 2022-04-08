const mongoose = require('mongoose')

const config = require('config')

function dbConnect() {
    const dbUrl = config.get("DATABASE_URL")
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Connected to database.")
        })
        .catch(err => {
            // console.log(err)
            process.exit(1)
        })
}

module.exports = dbConnect