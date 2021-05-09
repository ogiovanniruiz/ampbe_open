var Script = require('../../models/scripts/script.js')

const createScript = async(newScript) => {
    try { 

        var script = await Script.findOne({title: newScript.title, campaignIDs: newScript.campaignIDs})

        if(script){
            return {success: false, msg: "A Script with this name already exists."}
        }
       
        var newScript = new Script(newScript)
        newScript.save()
        return {success: true, script: newScript, msg: "Success."}
        
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createScript}