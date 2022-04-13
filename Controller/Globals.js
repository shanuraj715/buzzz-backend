const config = require('config');

global.log = function (data) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(data);
    }
}

global.getUserProfileImage = (image) => {
    if (image) {
        return config.get("APP_DOMAIN") + 'public/images/profile-pic/' + image
    }
    return config.get("APP_DOMAIN") + 'public/images/images.png'
}



