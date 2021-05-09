var Organization = require('../../../models/organizations/organization')
var Membership = require('../../../models/organizations/membership')

const deleteTag = async(data) => {
    try {
        var org = await Organization.findOne({_id: data.orgID})

        await Membership.updateMany({'resident.orgID': data.orgID}, {$pull: {'resident.tags': data.tag}})

        for(var i = 0; i < org.tags.length; i++){
            if(org.tags[i] === data.tag){
                org.tags.splice(i,1)
                org.save()
                return {success: true, org: org, msg: "Success."}
            }
        }

        return {success: false, org: org, msg: "There was an unknow error."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteTag}