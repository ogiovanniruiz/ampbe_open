var User = require('../../models/users/user')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const TOKEN_EXPIRATION_TIME = 21600;

const createUser = async(userDetails) => {
    try { 
        var user = await User.findOne({loginEmail: userDetails.user.loginEmail})

        if(user){
            // Covers both email/password and Google accounts
            return {success: false, msg: "An account with this email already exists. Sign in instead."}
        }         

        var user = new User(userDetails.user);
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(userDetails.password, saltRounds, function(err, hash) {
                if (err) reject(err)
                resolve(hash)
            });
        });
        
        user.password = hashedPassword;
        await user.save();
        var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_TIME }, process.env.jwtSecret);
        return {success: true, user: user, jwt: token, msg: "Success."}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createUser}
