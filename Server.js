require('express-async-errors')
console.clear()
// GLOBAL METHODS
require('./Controller/Globals')
const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const config = require('config')
const cors = require('cors')




// FINAL ERROR HANDLING MODULE
// this will be the last middleware to handle the error
const error = require('./middleware/error')


// CONNECT TO THE DATABASE
require('./Controller/Database')()

app.use(cors(require('./Controller/HandleCors')))
// PARSE BODY IN JSON
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())
app.use('/public', express.static('./public'))

// APP ROUTES
const profile = require('./Routes/Profile')
const login = require('./Routes/Login')
const register = require('./Routes/Register')
const feeds = require('./Routes/Feeds')
const session = require('./Routes/Session')
const friend = require('./Routes/Friend')

app.use('/profile', profile)
app.use('/login', login)
app.use('/register', register)
app.use('/feeds', feeds)
app.use('/session', session)
app.use('/friend', friend)





// ERROR HANDLING MIDDLEWARE FUNCTION
app.use(error)


// START THE APP ON THE PORT
app.listen(config.get("APP_PORT"), () => {
    console.log(`Running on PORT ${config.get("APP_PORT")}`)
})