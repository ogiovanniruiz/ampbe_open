var User = require('../../models/users/user')
var jwt = require('jsonwebtoken');

const TOKEN_EXPIRATION_TIME = 21600;


const createOauthUser = async(claims) => {
    try { 

        const firstName = claims.given_name || claims.email?.split('@')[0] || 'No First Name';
        const lastName = claims.family_name || 'No Last Name';
        const fullName = [firstName, lastName].filter(Boolean).join(' ')

        /*
        var fullName = claims.given_name

        if(!fullName){
            fullName = claims.email.split('@')[0]
        }

        var lastName = ""

        if(claims.family_name){
            fullName = fullName + " " + claims.family_name
            lastName = claims.family_name
        }*/

        var userDetails = {loginEmail: claims.email, 
                           oauths: [claims.iss], 
                           name: {firstName: firstName, 
                                  lastName: lastName,
                                  fullName: fullName
                                }}
                        
        var user = new User(userDetails);
        await user.save();
        var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_TIME }, process.env.jwtSecret);
        return {success: true, user: user, jwt: token, msg:"Success"}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createOauthUser}