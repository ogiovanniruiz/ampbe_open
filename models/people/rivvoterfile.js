var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var RivvoterfileSchema = new Schema(
    {_id: { type:  ObjectId }}, {strict: false}
);

//Export model
module.exports = mongoose.model('Rivvoterfile', RivvoterfileSchema, 'rivvoterfile');