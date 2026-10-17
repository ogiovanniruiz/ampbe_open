var mongoose = require('mongoose')
var PasswordReset = require('../../models/users/passwordReset')
var User = require('../../models/users/user')
const bcrypt = require('bcrypt');
const saltRounds = 12;

const setNewPassword = async(details) => {
    try {
        // Links expire after 10 minutes (TTL index) and are deleted once used
        var expired = {success: false, expired: true, msg: "This reset link has expired or was already used."}
        if(!mongoose.Types.ObjectId.isValid(String(details.upr || ''))) return expired

        var passwordResetItem = await PasswordReset.findOne({'_id': details.upr});
        if(!passwordResetItem) return expired

        var person = await User.findOne({'loginEmail': passwordResetItem.email});
        if(!person) return expired

        if(!details.password) return {success: false, msg: "Enter a new password."}

        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(details.password, saltRounds, function(err, hash) {
                if (err) reject(err)
                resolve(hash)
            });
        });
        person.password = hashedPassword;
        await person.save()

        await PasswordReset.deleteOne({_id: details.upr}).exec();

        return {success: true, msg: "Success."};
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {setNewPassword}
