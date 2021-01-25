const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let contentShema = new Schema({
    name: String,
    url: String,    
    meta: Schema.Types.Mixed,
    title: String,    
    content: String,
    status: Number,
    contentDt: { type: Date, default: Date.now },
    createDt: { type: Date, default: Date.now }
});

module.exports = {
    contentShema,
    Contents: mongoose.model('Contents', contentShema)
}