var Blockgroup = require('../../models/targets/blockgroup');
var Precinct = require('../../models/targets/precinct');

const lockGeometries = async(geometryDetails) => {

    var returnedPrecincts = []
    for(var i = 0; i < geometryDetails.data.length; i++){
        //console.log(i)

        var precinct = await Precinct.findOne({_id: geometryDetails.data[i]._id});
        if(precinct.properties.locked.length > 0){

            //console.log(precinct.properties)

            var found = false

            for(var j = precinct.properties.locked.length - 1; j >= 0; j--){
                if(precinct.properties.locked[j].campaignID === geometryDetails.campaignID && precinct.properties.locked[j].orgID === geometryDetails.orgID){
                    found = true
                    //if(precinct.properties.locked[j].finished){
                        //console.log("Unlocking")
                       // precinct.properties.locked.splice(j, 1);
                        //returnedPrecincts.push({precinct: precinct, mode: "Unlocked"})
                    //}else{
                        //console.log("Finishing")
                        precinct.properties.locked[j].finished = true
                        returnedPrecincts.push({precinct: precinct, mode: "Finished"})

                    //}
                }
            }

            if(!found){
                //console.log("Locking")
                precinct.properties['locked'].push({orgID: geometryDetails.orgID, campaignID: geometryDetails.campaignID, geometryID: geometryDetails.geometryCollID});
                returnedPrecincts.push({precinct: precinct, mode: "Locked"})
            }

        }else{
            //console.log("Locking2")
            precinct.properties['locked'].push({orgID: geometryDetails.orgID, campaignID: geometryDetails.campaignID, geometryID: geometryDetails.geometryCollID});
            returnedPrecincts.push({precinct: precinct, mode: "Locked"})
        }

        //if(precinct.properties.registered.length > 0){
        //    precinct.properties.registered = []
        //}

        await precinct.save();
    }

    return returnedPrecincts
}

module.exports = {lockGeometries}