const TextingTemplate = require('../../../models/activities/textbank/textingTemplate')
const { validateTextingTemplate } = require('./validateTextingTemplate')
const createTextingTemplate = async(data) => {
    if(!validateTextingTemplate(data)) return false
    const textingTemplate = new TextingTemplate(data)
    return textingTemplate.save()
}

module.exports = {createTextingTemplate}
