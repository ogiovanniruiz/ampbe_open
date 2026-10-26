var ActivityContactRecord = require('../../models/activities/activityContactRecord')

// Statuses that end a message's life; callbacks can arrive out of order
const FINAL_STATUSES = ['delivered', 'undelivered', 'failed']

const textDeliveryStatus = async(incoming) => {
    try {
        if(!incoming.MessageSid || !incoming.MessageStatus) return

        var filter = {'textbankContactDetails.messageSid': incoming.MessageSid}

        // A late "sent" must not replace "delivered"
        if(!FINAL_STATUSES.includes(incoming.MessageStatus)){
            filter['textbankContactDetails.deliveryStatus'] = {$nin: FINAL_STATUSES}
        }

        var update = {'textbankContactDetails.deliveryStatus': incoming.MessageStatus}
        if(incoming.ErrorCode) update['textbankContactDetails.deliveryError'] = String(incoming.ErrorCode)

        await ActivityContactRecord.updateOne(filter, {$set: update})

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {textDeliveryStatus}
