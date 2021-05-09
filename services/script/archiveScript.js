var Script = require('../../models/scripts/script.js')

const archiveScript = async(script) => {
    try { 

        var script  = await Script.findOne({_id: script._id})

        if(script.orgStatus.active){
            script.orgStatus.active = false
            return script.save()
        }

        script.orgStatus.active = true
        return script.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {archiveScript}