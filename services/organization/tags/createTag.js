var Organization = require('../../../models/organizations/organization')

const createTag = async(data) => {
    try {
        var org = await Organization.findOne({_id: data.orgID})

        for(var i = 0; i < org.tags.length; i++){
            if(org.tags[i].toUpperCase() === data.tag.toUpperCase()){
                return {success: false, org: org, msg: "Tag already exists."}
            }
        }

        org.tags.push(data.tag)
        org.save()
        
        return {success: true, org: org, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createTag}
