var Script = require('../../models/scripts/script.js')

const editScript = async(data) => {
    try { 
        var script = await Script.findOne({_id: data.scriptID})

        if(script.title != data.script.title){
            var duplicateScript = await Script.findOne({title: data.script.title, campaignIDs: data.campaignID})
            if(duplicateScript){
                return {success: false, msg: "Script with that title already exists."}
            }

            script.title = data.script.title
        }

        script.campaignIDs = data.script.campaignIDs
        script.questions = data.script.questions
        script.save()

        return {success: true, script: script, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editScript}