var Organization = require('../../models/organizations/organization');
var Campaign = require('../../models/campaigns/campaign');
var User = require('../../models/users/user')
var CreateNonResponseSet = require('../survey/nonResponseSet/createNonResponseSet')

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Everything is checked before the campaign is saved, so a bad request never leaves a half-linked campaign
const validate = async(detail) => {
    if(!detail.name) return "Campaign needs a name."
    if(!Array.isArray(detail.boundaryIDs) || !detail.boundaryIDs.length) return "Choose at least one district."
    if(!detail.electionType) return "Choose an election type."
    if(!detail.electionYear) return "Choose an election year."
    if(!Array.isArray(detail.dataManagers) || !detail.dataManagers.length) return "Choose at least one data manager."

    var duplicate = await Campaign.findOne({name: {$regex: `^${escapeRegex(detail.name)}$`, $options: 'i'}}, {_id: 1})
    if(duplicate) return "Campaign with that name already exists."

    var orgID = detail.orgIDs?.[0]
    if(!orgID || !(await Organization.exists({_id: orgID}))) return "Your organization couldn't be found."

    var managerIDs = [...new Set(detail.dataManagers.map(String))]
    if(await User.countDocuments({_id: {$in: managerIDs}}) !== managerIDs.length) return "One of the data managers couldn't be found."

    return null
}

const createCampaign = async(newCampaignDetail) => {
    try {
        newCampaignDetail.name = (newCampaignDetail.name || '').trim().replace(/\s+/g, ' ')
        newCampaignDetail.dataManagers = [...new Set((newCampaignDetail.dataManagers || []).map(String))]

        var error = await validate(newCampaignDetail)
        if(error) return {success: false, msg: error}

        var maxcampaignID = await Campaign.find({},{campaignID: 1}).sort({campaignID: -1}).limit(1)

        var newcampaignID = 0

        if(maxcampaignID[0]){
            newcampaignID = maxcampaignID[0].campaignID + 1
        }

        newCampaignDetail.campaignID = newcampaignID
        var campaign = new Campaign(newCampaignDetail);
        
        await campaign.save();

        await User.updateMany({_id: {$in: newCampaignDetail.dataManagers}}, {$addToSet: {dataManager: campaign.campaignID}})
        await Organization.updateOne({_id: newCampaignDetail.orgIDs[0]}, {$addToSet: {campaignIDs: String(campaign.campaignID)}})
        var org = await Organization.findById(newCampaignDetail.orgIDs[0])

        var phoenbanknonResponses = [{nonResponseType: "INVALIDPHONE", nonResponse: "Wrong Number"},
                                     {nonResponseType: "DNC", nonResponse: "Do Not Contact"},
                                     {nonResponseType: "NONRESPONSE", nonResponse: "Not Home"},
                                     {nonResponseType: "NONRESPONSE", nonResponse: "Voicemail"},
                                     {nonResponseType: "DNC", nonResponse: "Moved"},
                                     {nonResponseType: "DNC", nonResponse: "Language Barrier-DNC"},
                                     {nonResponseType: "IMP", nonResponse: "Spanish Speaker"},
                                     {nonResponseType: "DNC", nonResponse: "Deceased"}

                                    ]
        var canvassnonResponses = [{nonResponseType: "INVALIDADDRESS", nonResponse: "Wrong Address"},
                                   {nonResponseType: "DNC", nonResponse: "Do Not Contact"},
                                   {nonResponseType: "NONRESPONSE", nonResponse: "Not Home"},
                                   {nonResponseType: "DNC", nonResponse: "Deceased"},
                                   {nonResponseType: "DNC", nonResponse: "Language Barrier-DNC"},
                                   {nonResponseType: "IMP", nonResponse: "Spanish Speaker"},
                                   {nonResponseType: "NONRESPONSE", nonResponse: "Inaccessible"},
                                ]
        
        var phoenbank_name = newCampaignDetail.name + " Phonebank NonResponse Set"
        var canvass_name = newCampaignDetail.name + " Canvass NonResponse Set"

        var newPhonebankNonResponseSet = {name: phoenbank_name, 
                                          createdBy: newCampaignDetail.dataManagers[0], 
                                          nonResponses: phoenbanknonResponses, 
                                          campaignIDs: [newCampaignDetail.campaignID], 
                                          orgID: newCampaignDetail.orgIDs[0], 
                                          active: true}

        var newCanvassNonResponseSet = {name: canvass_name, 
                                        createdBy: newCampaignDetail.dataManagers[0], 
                                        nonResponses: canvassnonResponses, 
                                        campaignIDs: [newCampaignDetail.campaignID], 
                                        orgID: newCampaignDetail.orgIDs[0], 
                                        active: true}

        await CreateNonResponseSet.createNonResponseSet(newPhonebankNonResponseSet)

        await CreateNonResponseSet.createNonResponseSet(newCanvassNonResponseSet)

        return {success: true, campaign: campaign, org: org, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createCampaign}
