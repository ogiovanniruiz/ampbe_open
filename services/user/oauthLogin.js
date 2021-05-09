var User = require('../../models/users/user')
var jwt = require('jsonwebtoken');


const oauthLogin = async(claims) => {
    try {
        var user = await User.findOne({loginEmail: claims.email})
        
        if(user){
            if(user.oauths.includes(claims.iss)){
                var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
                return {success: true, user: user, jwt: token, msg:"Success."} 
            }else{
                user.oauths.push(claims.iss)
                user.save()
                var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
                return {success: true, user: user, jwt: token, msg: "Success."} 
            }
        }
        
        return {success: false}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {oauthLogin}