const mongoose = require('mongoose');

function mongoInit(){

    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', function(){
        // CONNECTED TO MONGODB SERVER
        console.log("--------------------------------------------------");
        console.log("Connected to mongod server");
    });

    // mongoose.connect('mongodb://crawler:crawler1!@192.168.219.111/crawling');
    mongoose.connect('mongodb://192.168.219.111/crawling', {        
        user: 'crawler', pass: 'crawler1!'
    });

    return mongoose;
}

module.exports = {
    init: mongoInit
};