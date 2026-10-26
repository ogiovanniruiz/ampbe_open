var Organization = require('../../../models/organizations/organization')
var Membership = require('../../../models/people/membership')
var Activity = require('../../../models/activities/activity')

// Removes a tag (with its values and colors) from the org and from every member
const deleteTag = async(data) => {
    try {

        var org = await Organization.findOne({_id: data.orgID})
        if(!org) return {success: false, msg: "Organization not found."}

        var definitions = org.tagDefinitions || []
        if(!definitions.some(d => d.label === data.tag)) return {success: false, msg: "This tag no longer exists."}

        await Membership.updateMany({'enrollment.orgID': data.orgID}, {$pull: {tags: {label: data.tag}}})
        await Activity.updateMany({orgIDs: data.orgID, tagsToHide: data.tag}, {$pull: {tagsToHide: data.tag}})

        org.tagDefinitions = definitions.filter(d => d.label !== data.tag)
        await org.save()
        return {success: true, msg: "Update Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteTag}
