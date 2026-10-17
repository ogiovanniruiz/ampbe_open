var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

// Someone added at a dropped household becomes one of its residents, and the door is done
const addCanvassHouseholdResident = async(details) => {
    try {
        var record = await ActivityHouseholdRecord.findById(details.activityHouseholdRecordID)
        if(!record) throw new Error("Household not found")
        if(!record.dropped) throw new Error("Only dropped households take new residents")

        const resident = details.resident
        if(!resident?.personID) throw new Error("Resident needs a personID")

        const alreadyResident = record.household.residents.some(existing => String(existing.personID) === String(resident.personID))
        if(!alreadyResident) record.household.residents.push(resident)

        record.complete = true
        record.passed = true
        record.timesContacted = record.timesContacted + 1

        return await record.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {addCanvassHouseholdResident}
