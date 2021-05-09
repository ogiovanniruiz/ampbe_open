var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')

const getPhonebankContactHistory = async(detail) => {
    try { 

        var residentIDs = detail.houseHold.residents.map(resident =>{return resident.personID})
        
        var pbContactHistories = await PhonebankContactHistory.find({activityID: detail.activityID, 
                                                                     personID: {$in: residentIDs}, 
                                                                     userID: detail.userID,
                                                                     pass: detail.passes
                                                                    })

        
        var residentsResponded = pbContactHistories.filter(pbContactHistory =>{return pbContactHistory.complete})
                                                   .map(pbContactHistory =>{return pbContactHistory.personID});
        
        var residentsCalled = pbContactHistories.map(pbContactHistory =>{return pbContactHistory.personID});

        return {residentsResponded: residentsResponded, residentsCalled: residentsCalled}


    } catch(e){
        throw new Error(e.message)    
    }
}

module.exports = {getPhonebankContactHistory}
