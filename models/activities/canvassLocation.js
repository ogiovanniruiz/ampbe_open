var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Only the canvasser's id and name are stored: these records are sent to
// every canvasser on the activity, so no email or permissions belong here.
var CanvassLocationSchema = new Schema({
    location: {type: { type: String, default: "Point" },
               coordinates: { type: [Number] }}, // GeoJSON order: [lng, lat]
    user: {
        _id: {type: String},
        name: {
            firstName: {type: String},
            lastName: {type: String},
            fullName: {type: String},
        },
    },
    dateUpdated: {type: Date, default: Date.now},
    activityID: {type: String}
});

CanvassLocationSchema.index({activityID: 1, 'user._id': 1})

//Export model
module.exports = mongoose.model('CanvassLocation', CanvassLocationSchema);
