var User = require('../../models/users/user')
var jwt = require('jsonwebtoken');
const createOauthUser = async(claims) => {
    try { 
        var fullName = claims.given_name + " " + claims.family_name

        var userDetails = {loginEmail: claims.email, 
                           oauths: [claims.iss], 
                           name: {firstName: claims.given_name, 
                                  lastName: claims.family_name,
                                  fullName: fullName
                                }}
                        
        var user = new User(userDetails);
        user.save();
        var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
        return {success: true, user: user, jwt: token, msg:"Success"}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createOauthUser}