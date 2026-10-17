var NonResponseSet = require('../../../models/surveys/nonResponseSet.js')

// set.setActive (boolean) sets the state explicitly, so a repeated request can't undo itself.
// Without it, the old toggle behavior is kept.
const archiveNonResponseSet = async(set) => {
    try { 

        var nonResponseSet  = await NonResponseSet.findOne({_id: set._id})
        if(!nonResponseSet) return null

        nonResponseSet.active = typeof set.setActive === 'boolean' ? set.setActive : !nonResponseSet.active
        return nonResponseSet.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {archiveNonResponseSet}
