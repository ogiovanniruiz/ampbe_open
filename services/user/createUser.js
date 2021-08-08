var User = require('../../models/users/user')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const createUser = async(userDetails) => {
    try { 
        var user = await User.findOne({loginEmail: userDetails.user.loginEmail})

        if(user){
            return {success: false, msg: "Please login with your google account."}
        }         

        var user = new User(userDetails.user);
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(userDetails.password, saltRounds, function(err, hash) {
                if (err) reject(err)
                resolve(hash)
            });
        });
        
        user.password = hashedPassword;
        user.save();
        var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
        return {success: true, user: user, jwt: token, msg: "Success."}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createUser}
