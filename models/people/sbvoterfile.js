var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var SbvoterfileSchema = new Schema(
    {_id: { type: ObjectId}}, {strict: false}
);

//Export model
module.exports = mongoose.model('Sbvoterfile', SbvoterfileSchema, 'svvoterfile');