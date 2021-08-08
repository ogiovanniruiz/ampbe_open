const fs = require('fs');

const getOrgLogo = async(data) => {
    try {
        var orgID = data.orgID
        var fileDir = 'public/images/' + orgID + ".png"
        return {image:fs.readFileSync(fileDir)}
    } catch(e){
        if(e.code == 'ENOENT'){
            console.log("No Logo Exists")
        }else{
            throw new Error(e.message)
        }
    }
}

module.exports = {getOrgLogo}