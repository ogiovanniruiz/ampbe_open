var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var People = require('../../models/people/people')

const removeAlreadyVotedLogic = async(detail) => {
    try { 

        var activityHouseholds = await ActivityHouseholdRecord.find({activityID: detail.activityID})

        for(var i = 0; i < activityHouseholds.length; i++){
            console.log(i)
            var new_residents = []
            for(var j = 0; j < activityHouseholds[i].household.residents.length; j++ ){
                var personFound = await People.findOne({'resident.voted_current_cycle': {$ne: true},'resident.personID': activityHouseholds[i].household.residents[j].personID})
                if(personFound){
                    new_residents.push(personFound.resident)  
                }
            }

            if(new_residents.length === 0){
                await ActivityHouseholdRecord.deleteOne({_id: activityHouseholds[i]._id})
            }else{            
                activityHouseholds[i].household.residents = new_residents
                await activityHouseholds[i].save()
            }
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeAlreadyVotedLogic}