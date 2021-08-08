var HouseHold = require('../../models/houseHolds/houseHold')
var PetitionContactHistory = require('../../models/activities/petition/petitionContactHistory')
var submitoutrachEntry= require('../activity/submitOutreachEntry')

const submitPetition = async(details) => {
    try {
        console.log(details)

        //needs to parse address and geocode??????
        //needs to get geoid and precinctID??????

        /*
        var date = new Date();
        var petitionContactHistory = await details.petition;
        petitionContactHistory.scriptResponse.date = await date;
        var petition = new PetitionContactHistory(petitionContactHistory);


        //  do we add to every org allowed in this activity???
        var outReachEntry = {}
        outReachEntry = {
            name: details.petition.name,
            scriptResponse: details.petition.scriptResponse,
            address: details.petition.address,
            orgID: details.activity.orgID,
            contactedBy: details.activity.userID,
            residentPhoneNumber: details.petition.residentPhoneNum,
            scriptID: details.activity.scriptID,
            activityType: "Petition",
            date: date,
            activityID: details.petition.activityID,
        }


        const agg = [
            {
                '$set': {
                    'addressString': {
                        '$replaceAll': {
                            'input': {
                                '$concat': [
                                    '$_id.streetNum', '$_id.prefix', '$_id.street', '$_id.suffix'
                                ]
                            },
                            'find': ' ',
                            'replacement': ''
                        }
                    }
                }
            }, {
                '$match': {
                    'addressString': details.petition.address.addressString.replace(/\s/g,''),
                    '_id.zip': details.petition.address.zip,
                    '_id.city' : details.petition.address.city,
                    '_id.unit' : details.petition.address.unit,
                }
            }
        ];
        var findHH = await HouseHold.aggregate(agg)
        if(findHH.length){
            for(var i = 0; i < findHH[0].residents.length; i++){
                if(findHH[0].residents[i].name.firstName === details.petition.name.firstName && findHH[0].residents[i].name.lastName === details.petition.name.lastName){
                    console.log('FOUND')
                    petitionContactHistory.personID = await findHH[0].residents[i].personID
                    outReachEntry.personID = await findHH[0].residents[i].personID
                }
            }
        }

        submitoutrachEntry.submitoutrachEntry('', outReachEntry, details.activity.campaignID)
        return petition.save()*/

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitPetition}
