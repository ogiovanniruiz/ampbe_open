var PasswordReset = require('../../models/users/passwordReset')
var User = require('../../models/users/user')
const bcrypt = require('bcrypt');
const saltRounds = 12;

const setNewPassword = async(details) => {
    try {
        var passwordResetItem = await PasswordReset.findOne({'_id': details.upr});
        var person = await User.findOne({'loginEmail': passwordResetItem.email});

        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(details.password, saltRounds, function(err, hash) {
                if (err) reject(err)
                resolve(hash)
            });
        });
        person.password = hashedPassword;
        person.save()

        PasswordReset.remove({_id: details.upr}).exec();

        return {success: true, msg: "Success."};
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {setNewPassword}
