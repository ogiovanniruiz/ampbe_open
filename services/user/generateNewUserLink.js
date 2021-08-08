var User = require('../../models/users/user')
var Rdr  = require('../../models/users/redirectNewUser')
const generateNewUserLink = async(rdrDetails) => {
    try { 
        var query = {}

        if(rdrDetails.activityID){
            query = {campaignID: rdrDetails.campaignID, orgID: rdrDetails.orgID, activityID: rdrDetails.activityID  }
        }else{
            query = {campaignID: rdrDetails.campaignID, orgID: rdrDetails.orgID}
        }

        var rdr = await Rdr.findOne(query)

        if(rdr){
            var url = process.env.fe+ "/?dir=" + rdr._id
            return {url: url, exists: true}
        }

        var rdr = new Rdr(rdrDetails);
        rdr.exp = Math.floor(Date.now() / 1000) + 2592000
        rdr.save()

        var url = process.env.fe+ "/?dir=" + rdr._id

        return {url: url, exists: false}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {generateNewUserLink}