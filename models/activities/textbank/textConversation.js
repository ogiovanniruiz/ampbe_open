var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TextConversationSchema = new Schema(
    {
        origin: {type: String}, 
        msg: {type: String}, 
        error: {type: String, default: 'false'}, 
        date: {type: Date, default: Date.now},
    }
  );
  
  //Export model
  module.exports = mongoose.model('TextConversation', TextConversationSchema);