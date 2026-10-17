const TextingTemplate = require('../../../models/activities/textbank/textingTemplate')
const getTextingTemplates = async(data) => {
    return TextingTemplate.find({campaignID: data.campaignID})
}

module.exports = {getTextingTemplates}