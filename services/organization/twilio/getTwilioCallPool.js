var CallPool = require('../../../models/organizations/callPool')

const getTwilioCallPool = async(data) => {
    return await CallPool.find({orgID: data.orgID})
}

module.exports = {getTwilioCallPool}