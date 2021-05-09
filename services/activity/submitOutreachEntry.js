var OutreachReport = require('../../models/campaigns/outreachReport')

const submitOutreachEntry = async(contactHistory) => {
    try {

        var newOutReachEntry = new OutreachReport(contactHistory)
        newOutReachEntry.save()

        console.log("Outreach Entry Submitted.")

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitOutreachEntry}
