var Organization = require('../../models/organizations/organization')
var OutreachReport = require('../../models/campaigns/outreachReport')
var User = require('../../models/users/user')
var RivVoterfile = require('../../models/people/rivvoterfile')
var SbVoterfile = require('../../models/people/sbvoterfile')
var mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const downloadOrgContactHistory = async(detail) => {
    try { 

        var orgReport = await OutreachReport.find({orgID: detail.orgID})

        /*
        for(var i = 0; i < orgReport.length; i++){
            var user = await User.findById(orgReport[i].contactedBy)
            orgReport[i].name = user.name
            
            if(!orgReport[i].affidavit){
                var voter = await RivVoterfile.findById(orgReport[i].personID)
                if(voter){
                    console.log(voter)
                    
                }else{
                    var voter = await SbVoterfile.findById(orgReport[i].personID)
                    console.log(voter)
                    //orgReport[i].affidavit = voter
                }
            }
        }*/

        return orgReport

        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadOrgContactHistory}