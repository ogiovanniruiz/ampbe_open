const mongoose = require('mongoose');
var OrgLogo = require('../../models/organizations/orgLogo')

// Logos live only in the database; with none, nothing is returned and the client shows the stock image
const getOrgLogo = async(data) => {
    try {
        var orgID = String(data.orgID || '')
        if(!mongoose.Types.ObjectId.isValid(orgID) || String(new mongoose.Types.ObjectId(orgID)) !== orgID) return

        var logo = await OrgLogo.findOne({orgID}, {data: 1}).lean()
        if(!logo?.data) return

        // A Node Buffer serializes as {type: 'Buffer', data: [...]}, which the client decodes
        return {image: Buffer.from(logo.data.buffer || logo.data)}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgLogo}
