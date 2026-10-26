var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElectionPrecincts2022Schema = new Schema(
    {
      geometry: {},
      properties: { 
                    precinctID: {type: String},
                    description: {type: String},
                    state: {type: String},
                    county: {type: String},
                    cddist: {type: Number},
                    electionData: {voteBlue: {type: Number}, 
                                   voteRed: {type: Number},
                                   voteBlueCNG: {type: Number}, 
                                   voteRedCNG: {type: Number},
                                   totalReg: {type: Number},
                                   totalVote: {type: Number},
                                   
                                
                                }
      }
    },{ collection : 'electionPrecincts2022' }
);

//Export model
module.exports = mongoose.model('ElectionPrecincts2022', ElectionPrecincts2022Schema);