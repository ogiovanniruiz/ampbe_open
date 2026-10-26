var User = require('../../models/users/user')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const TOKEN_EXPIRATION_TIME = 21600;

const localLogin = async(login) => {
    try {

        var user = await User.findOne({loginEmail: login.email}).select('+password');
        
        if(user){

            if(!user.password){
                return {success: false, msg: "Try logging in with Google."}
            }

            const hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.compare(login.password, user.password, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                });
            });

            if(hashedPassword){
                var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_TIME }, process.env.jwtSecret);
                return {success: true, user: user, jwt: token, msg: "Success."} 
            }else{
                return {success: false, msg: "Credentials do not match."} 
            }
        }

        return {success: false, msg: "User profile does not exist."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {localLogin}
