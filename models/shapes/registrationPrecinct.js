var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RegistrationPrecinctsSchema = new Schema(
    {
      geometry: {},
      
      properties: {
                    precinctID: {type: String},
                    cddist: {type: Number},
                    state: {type: String},
                    county: {type: String},
                    cddist: {type: Number},
                    registrationData: {dem: {type: Number}, 
                                      rep: {type: Number},
                                      dcl: {type: Number},
                                      totalReg: {type: Number},
                                      totalHH: {type: Number},
                                }
      }
    },{ collection : 'registrationPrecincts' }
);

//Export model
module.exports = mongoose.model('RegistrationPrecincts', RegistrationPrecinctsSchema);