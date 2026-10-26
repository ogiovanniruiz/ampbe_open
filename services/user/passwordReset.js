var User = require('../../models/users/user')
var PasswordReset = require('../../models/users/passwordReset')
var nodeMailer = require('nodemailer');

const passwordReset = async(email) => {
    try {

        var contactEmail = process.env.contactEmail
        var contactEmailPassword = process.env.contactEmailPassword
        var user = await User.findOne({loginEmail: email.email}).select('+password')

        if (user){
            if (user.password) {
                var personEmail = {email: email.email}
                var reset = new PasswordReset(personEmail);
                await reset.save();

                // The link always points at our own front end. Trusting the client's url would let anyone
                // email a real reset token to a victim with a link to another site.
                var appUrl = (process.env.fe || '').replace(/\/+$/, '')
                if(!appUrl){
                    console.log('passwordReset: fe is not set; using the request origin for the reset link')
                    appUrl = String(email.url || '').replace(/\/+$/, '')
                }

                let transporter = nodeMailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: contactEmail,
                        pass: contactEmailPassword
                    }
                });

                let mailOptions = {
                    to: reset.email,
                    subject: 'Password Reset Instructions',
                    html: "Someone has requested a password reset for the following account:" + reset.email + "<br><br>" +
                        "If this was a mistake, just ignore this email and nothing will happen." + "<br><br>" +
                        "Click this link to set a new password: " + "<a href='"+appUrl+"/passwordreset/?upr="+reset._id+"'>set a password here.</a>" + "<br><br>" +
                        "This link expires in 10 minutes."
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });

                return {success: true, msg: "Email Sent"}
            } else {
                return {success: false, msg: "Please login with your google account."}
            }
        } else {
            return {success: true, msg: "User not found. Please enter a valid email address."}
        }
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {passwordReset}
