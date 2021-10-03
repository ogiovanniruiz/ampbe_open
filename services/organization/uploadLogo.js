const fs = require('fs');

const uploadLogo = async(data) => {
    try {
        var imageData = data.files[0].buffer
        if(imageData.length> 100000) return {success: false, msg: "Image file is too large. Max size is 100 kB."}
        
        var orgID = data.body.orgID
        var fileDir = 'public/images/' + orgID + ".png"
        success = true;
        msg = 'Success.'
        
        fs.writeFile(fileDir, imageData, 'binary', function(err){
            if (err) {
                success = false;
                msg = "Failed to write to file."
            }
        })

        return {success: success, msg: msg}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {uploadLogo}