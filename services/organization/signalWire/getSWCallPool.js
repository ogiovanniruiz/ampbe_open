var CallPool = require('../../../models/organizations/swCallPool')

const getSWCallPool = async(data) => {
    return await CallPool.find({orgID: data.orgID})
}

module.exports = {getSWCallPool}