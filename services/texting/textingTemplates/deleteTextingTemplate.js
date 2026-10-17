const TextingTemplate = require('../../../models/activities/textbank/textingTemplate')
const deleteTextingTemplate = async(data) => {
    return TextingTemplate.findByIdAndDelete(data.templateID)
}

module.exports = {deleteTextingTemplate}