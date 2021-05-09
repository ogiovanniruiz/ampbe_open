var User = require('../../models/users/user')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const localLogin = async(login) => {
    try {
        var user = await User.findOne({loginEmail: login.email});
        
        if(user){
            const hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.compare(login.password, user.password, function(err, hash) {
                    if (err) reject(err)
                    resolve(hash)
                });
            });
            if(hashedPassword){
                var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
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
