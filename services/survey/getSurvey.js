var Survey = require('../../models/surveys/survey.js')

const getSurvey = async(survey) => {
    try { 
        return await Survey.findById(survey.surveyID);
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getSurvey}