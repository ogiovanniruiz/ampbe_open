var RemoveAlreadyVotedLogic = require('./removeAlreadyVotedLogic')
const removeAlreadyVoted = async(detail) => {
    try { 

        RemoveAlreadyVotedLogic.removeAlreadyVotedLogic(detail)
        return true

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeAlreadyVoted}