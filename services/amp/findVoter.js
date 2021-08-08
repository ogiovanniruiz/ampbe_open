var Membership = require('../../models/organizations/membership')
var People = require('../../models/people/people');

const findVoterStatus = async(ID, mode) => {
    try {

        if(mode === 'auto'){
            var members = await Membership.find({'resident.uploadID': ID})
        }

        if(mode === 'manual'){
            var members = await Membership.find({'_id': ID})
        }

        for(var i = 0; i < members.length; i++){
            console.log("Voters Checked: ", i)

            var queryVoter = {"$and": []};

            queryVoter.$and.push({'resident.name.firstName': members[i]['resident']['name']["firstName"]});

            if(members[i]['resident']['phones']['number']){
                queryVoter.$and.unshift({$or: []})
                queryVoter.$and[0].$or.push({'resident.phones.number': members[i]['resident']['phones']['number']});
            }

            if(members[i]['resident']['email']){

                if(!queryVoter.$and[0].$or){
                    queryVoter.$and.unshift({$or: []});
                }

                queryVoter.$and[0].$or.push({'resident.emails': members[i]['resident']['email']});
            }

            var voter = await People.findOne(queryVoter);
            if(voter) {
                members[i]['resident']['voter'] = true;
                members[i].resident.affidavit = voter.resident.affidavit;
                members[i].save();
            }

            if(mode === 'manual' && !voter && members[i]['resident']['voter']) {
                members[i]['resident']['voter'] = false;
                members[i].resident.affidavit = undefined;
                members[i].save();
            }

        }

        return {msg: "Processing..."}

    } catch(e){
        throw new Error(e.message)
    }
}


module.exports = {findVoterStatus}
