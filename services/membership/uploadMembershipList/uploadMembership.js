var Upload = require('../../../models/organizations/upload');
var WriteUpload = require('./writeUpload')

const uploadMembership = async(membershipData) => {
    try {

        var fileName = membershipData.files[0].originalname;
        var orgID = membershipData.body.orgID;
        var userID = membershipData.body.userID;
        var uploadName = membershipData.body.uploadName;

        var checkVoterfile = (membershipData.body.checkVoterfile === 'true');

        var checkDuplicates = (membershipData.body.checkDuplicates === 'true');


        var foundUpload = await Upload.findOne({uploadName: uploadName})

        if(foundUpload){
            return {msg: "List with that name already exists.", success: false}
        }

        var upload = new Upload({uploadName: uploadName, orgID: orgID, fileName: fileName, userID: userID, checkVoterfile: checkVoterfile, checkDuplicates: checkDuplicates});
        await upload.save()

        WriteUpload.writeUpload(membershipData, upload)

        return {msg: "Finished", success: true}

    } catch(e){
        throw new Error(e.message)
    }
}


module.exports = {uploadMembership}
