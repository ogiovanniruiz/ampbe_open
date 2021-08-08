var Campaign = require('../../models/campaigns/campaign');
var CallPool = require('../../models/organizations/callPool')

const hangUpNumber = async(data) => {
    try { 

        var campaign = await Campaign.findOne({campaignID:  data.campaignID})

        var orgID = '';

        if(campaign.fundedByCreatorOrg){orgID = campaign.creatorOrg}
        else{orgID = data.orgID}

        var number = await CallPool.findOne({number: data.userPhoneNumber, orgID: orgID})

        if(number){
            console.log("Number is found and is hanging up.")
            number.available = true;
            return number.save()
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {hangUpNumber}
