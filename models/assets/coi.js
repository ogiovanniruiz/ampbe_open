var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../users/user')

var COISchema = new Schema(
    {
      geometry: {},
      properties: { name: {type: String},
                    userID: {type: String},
                    orgID: {type: String},
                    user: User.schema,
                    date: {type: Date, default: Date.now},
                    questions: [{question: {type: String}, 
                                 answer: {type: String}}],
                    geoids: [{type: String}],
                    demographics: {
                                   totalPop: {type: Number}, 
                                   percentMale: {type: Number}, 
                                   percentFemale: {type: Number}, 
                                   percentWhite: {type: Number},
                                   percentBlack: {type: Number},
                                   percentHispanic: {type: Number},
                                   percentAsian: {type: Number},
                                   percentPI: {type: Number},
                                  }  
      },
      type: {type: String, default: "Feature"},
    }
);

//Export model
module.exports = mongoose.model('COI', COISchema);