var Campaign = require('../../models/campaigns/campaign')

const toggleAllOrgPolygons = async(request) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: request.campaignID})
        campaign.allOrgPolygons = request.value
    
        return await campaign.save()


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {toggleAllOrgPolygons}