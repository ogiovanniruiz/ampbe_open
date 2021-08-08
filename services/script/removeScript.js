var Script = require('../../models/scripts/script.js')

const removeScript = async(script) => {
    try { 
        return await Script.deleteOne({_id: script._id});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeScript}