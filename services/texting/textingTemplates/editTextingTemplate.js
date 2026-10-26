const TextingTemplate = require('../../../models/activities/textbank/textingTemplate')
const { validateTextingTemplate } = require('./validateTextingTemplate')
const editTextingTemplate = async(data) => {
    if(!validateTextingTemplate(data)) return false
    return TextingTemplate.findByIdAndUpdate(data._id, data, { returnDocument: 'after' })
}

module.exports = {editTextingTemplate}
