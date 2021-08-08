var nodeMailer = require('nodemailer');

const contactDevs = async(data) => {
    try { 

        var contactEmail = process.env.contactEmail
        var contactEmailPassword = process.env.contactEmailPassword
        
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
            to: contactEmail,
            subject: data.subject,
            html:   "First Name: " + data.user.name.firstName + "<br>"
                  + "Last Name: " + data.user.name.lastName + "<br>"
                  + "Login Email: " + data.user.loginEmail + "<br>"
                  + "Message: " + data.message + "<br>"
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    
        return {msg: "Email Sent"}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {contactDevs}