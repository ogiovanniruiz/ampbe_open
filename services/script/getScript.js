var Script = require('../../models/scripts/script.js')

const getScript = async(script) => {
    try { 
        return await Script.findById(script.scriptID);
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getScript}