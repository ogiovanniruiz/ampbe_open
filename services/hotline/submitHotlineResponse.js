var HotlineContactHistory = require('../../models/activities/hotline/hotlineContactHistory');
var HouseHolds = require('../../models/houseHolds/houseHold')
var nodeMailer = require('nodemailer');

const submitHotlineResponse= async(detail) => {
    try { 
        console.log(detail)

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
            to: detail.activityEmail,
            subject: "Urgency Level: " + detail.urgencyLevel + " - " + detail.activityName,
            html:   "First Name: " + detail.name.firstName + "<br>"
                  + "Last Name: " + detail.name.lastName + "<br>"
                  + "Email: " + detail.email + "<br>"
                  + "PhoneNumber: " + detail.residentPhoneNum + "<br>"
                  + "Blocked: " + detail.blocked + "<br>"
                  + "Notes: " + detail.notes + "<br>"
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });

        var newHotlineContactHistory = new HotlineContactHistory(detail)
        return newHotlineContactHistory.save()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {submitHotlineResponse}