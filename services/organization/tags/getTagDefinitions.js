var Organization = require('../../../models/organizations/organization')
var {tagList, isStyled} = require('./orgTags')

// The org's tags with values or a color (plain tags are left out; getTags lists every tag)
const getTagDefinitions = async(detail) => {
    try {
        var org = await Organization.findOne({_id: detail.orgID}, {tagDefinitions: 1}).lean()
        return tagList(org).filter(isStyled)
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTagDefinitions}
