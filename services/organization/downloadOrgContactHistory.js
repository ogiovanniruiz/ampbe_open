var OutreachReport = require('../../models/campaigns/outreachReport')
var People = require('../../models/people/people')

const downloadOrgContactHistory = async(detail) => {
    try { 

        var orgReport = await OutreachReport.aggregate([{$match: {orgID: detail.orgID}}])

        for(var i = 0; i < orgReport.length; i++){
            if(!orgReport[i].affidavit || !orgReport[i].person){
                var voter = await People.findOne({'resident.personID': orgReport[i].personID})
                if(voter){
                    orgReport[i].person = voter
                    
                }
            }
        }

        return orgReport

        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadOrgContactHistory}