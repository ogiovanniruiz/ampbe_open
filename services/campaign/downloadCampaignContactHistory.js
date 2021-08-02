var OutreachReport = require('../../models/campaigns/outreachReport')
var People = require('../../models/people/people')

const downloadCampaignContactHistory = async(data) => {
    try {
        var campaignReport = await OutreachReport.aggregate([{$match: {campaignID: data.campaignID}}])

        for(var i = 0; i < campaignReport.length; i++){
            if(!campaignReport[i].affidavit || !campaignReport[i].person){
                var voter = await People.findOne({'resident.personID': campaignReport[i].personID})
                if(voter){
                    campaignReport[i].person = voter
                    
                }
            }
        }

        return campaignReport
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadCampaignContactHistory}