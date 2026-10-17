var CallPool = require('../../../models/organizations/callPool')

// Frees every number this org has reserved in its calling pool (same as force hang up, for all numbers).
// It doesn't end live Twilio calls; it only makes the numbers available to callers again.
const forceHangUpAllTwilioPhonenumbers = async(detail) => {
    try {
        return await CallPool.updateMany({orgID: detail.orgID, available: false}, {$set: {available: true}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {forceHangUpAllTwilioPhonenumbers}
