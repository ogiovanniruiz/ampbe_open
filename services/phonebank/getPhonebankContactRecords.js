var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const getPhonebankContactRecords = async(detail) => {
    try { 
        var personIDs = detail.household.residents.map(resident =>{return resident.personID})
        return await ActivityContactRecord.find({activityID: detail.activityID, 
                                                 personID: {$in: personIDs}, 
                                                })

    } catch(e){
        throw new Error(e.message)    
    }
}

module.exports = {getPhonebankContactRecords}
