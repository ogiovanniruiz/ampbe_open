var TextRecord = require('../../models/activities/textbank/textRecords')

const textStatus = async(phoneNumber, client, personID, userID) => {
    try { 

        var record = await TextRecord.findOne({phone: phoneNumber})

        if(!record){
            console.log("Text Record not found, looking up number...")
            var lookUpResults = await client.lookups.phoneNumbers('+1' + phoneNumber)
                                           .fetch({type: ['carrier']})
                                           .then(phone_number => {return (phone_number.carrier)})
                                           .catch(e => {return e});

            var newRecord = {}
            if(lookUpResults.type){
                newRecord = {
                                deviceType: lookUpResults.type,
                                message: lookUpResults.message,
                                personID: personID,
                                phone: phoneNumber,
                                provider: lookUpResults.name,
                                error: false,
                                contactedBy: userID
                            }
                console.log("Device Type Found.")

            }else{
                newRecord = {
                    message: lookUpResults.message,
                    personID: personID,
                    phone: phoneNumber,
                    error: true,
                    contactedBy: userID
                    }
                    console.log("Error Invalid Number or device type not found.")
            }
            var record = new TextRecord(newRecord);
            return record.save()
        }
        console.log('Text record found, skipping lookup.')
        return record
            
        


    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {textStatus}
