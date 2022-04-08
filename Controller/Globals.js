

global.log = function (data) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(data);
    }
}





