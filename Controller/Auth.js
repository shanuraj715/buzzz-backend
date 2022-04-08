const jwt = require('jsonwebtoken')

class JwtAuth {
    #signature = "privateString"

    sign(data) {
        return jwt.sign(data, this.#signature)
    }

    verify(token) {
        try {
            var decodedDataFromToken = jwt.verify(token, this.#signature)
            return { verified: true, ...decodedDataFromToken }
        }
        catch (err) {
            return { verified: false, ...err };
        }
    }
}

module.exports = new JwtAuth()