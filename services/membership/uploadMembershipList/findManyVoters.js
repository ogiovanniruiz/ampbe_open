var Membership = require('../../../models/people/membership')
var {uploadQuery} = require('../memberFields')
var People = require('../../../models/people/people');
var Upload = require('../../../models/organizations/upload');
var GeocodeMemberUpload = require('./geocodeMemberUpload')

const findManyVoterStatus = async(uploadID) => {
    try {
        var members = await Membership.find(uploadQuery(uploadID))
        
        for(var i = 0; i < members.length; i++){
            console.log("Voters Checked: ", i)

            var phonenumberProvided = false;
            var emailProvided = false;
            var firstNameProvided = false
            var voterIDProvided = false

            var queryVoter = {"$and": []};

            if(members[i].resident.name.firstName){
                queryVoter.$and.push({'resident.name.firstName': members[i].resident.name.firstName});
                firstNameProvided = false
            }

            if(members[i].resident.voterID){
                queryVoter.$and.push({'resident.voterID': members[i].resident.voterID});
                voterIDProvided = true
            }

            if(members[i].resident.phones[0]){
                if(members[i].resident.phones[0].number){
                    queryVoter.$and.unshift({$or: []})
                    queryVoter.$and[0].$or.push({'resident.phones.0.number': members[i].resident.phones[0].number});
                    phonenumberProvided = true
                }
            }

            if(members[i].resident.emails[0]){
                if(!queryVoter.$and[0].$or){
                    queryVoter.$and.unshift({$or: []});
                }
                queryVoter.$and[0].$or.push({'resident.emails': members[i].resident.emails[0]});
                emailProvided = true;
            }

            var voter = await People.findOne(queryVoter);

            if(voter) {
                console.log("Voter Found.")
                members[i].isRegisteredVoter = true;
                members[i].resident = voter.resident
                

                if(!phonenumberProvided){
                    members[i].resident.phones = voter.resident.phones
                }

                if(!emailProvided){
                    members[i].resident.emails = voter.resident.emails
                }


                console.log("Using Voter Record Address.")
                members[i].address = voter.address
                members[i].fullAddress1 = voter.fullAddress1
                members[i].fullAddress2 = voter.fullAddress2
    
                members[i].districts = voter.districts
                members[i].location = voter.location
    
                members[i].geocoded = true
                members[i].accuracyType = voter.accuracyType
                members[i].county = voter.county
                members[i].blockID = voter.blockID
                members[i].electionPrecinctID = voter.electionPrecinctID
                members[i].registrationPrecinctID = voter.registrationPrecinctID
                  
                await members[i].save();
            }

        }

        await Upload.updateOne({_id: uploadID}, {$set:{votersChecked: true}})

        GeocodeMemberUpload.geocodeMemberUpload(uploadID)

    } catch(e){
        throw new Error(e.message)
    }
}


module.exports = {findManyVoterStatus}
