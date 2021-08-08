var Rdr  = require('../../models/users/redirectNewUser')
const processLink = async(rdrToken) => {
    try { 
        return await Rdr.findOne({_id: rdrToken.linkID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {processLink}