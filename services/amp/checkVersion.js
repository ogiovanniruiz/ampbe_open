const checkVersion = async(app) => {
    try { 
        var version = process.env.version
        
        if(app.version === version){
            return {sync: true, serverVersion: version}
        }
    
        return {sync: false, serverVersion: version}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {checkVersion}