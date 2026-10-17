var Survey = require('../../models/surveys/survey.js')

// survey.setActive (boolean) sets the state explicitly, so archiving can never restore by accident.
// Without it, the old toggle behavior is kept (the Other Surveys dialog relies on it).
const archiveSurvey = async(detail) => {
    try { 

        var survey  = await Survey.findOne({_id: detail._id})
        if(!survey) return null

        survey.active = typeof detail.setActive === 'boolean' ? detail.setActive : !survey.active
        return survey.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {archiveSurvey}
