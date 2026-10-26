var nodeMailer = require('nodemailer');
var mongoose = require('mongoose');
var Organization = require('../../models/organizations/organization')

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const contactDevs = async(data) => {
    try {

        var subject = typeof data.subject === 'string' ? data.subject.trim() : '';
        var message = typeof data.message === 'string' ? data.message.trim() : '';

        if(!subject || !message){
            throw new Error('Subject and message are required.')
        }

        var contactEmail = process.env.contactEmail
        var contactEmailPassword = process.env.contactEmailPassword

        // The dialog can be opened before an org is chosen, so the orgID may be missing or stale
        var org = mongoose.isValidObjectId(data.orgID) ? await Organization.findById(data.orgID) : null
        var user = data.user || {}

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
            from: contactEmail,
            to: process.env.devEmails,
            subject: '[Amplify Support] ' + subject,
            html:   "First Name: " + escapeHtml(user.name?.firstName) + "<br>"
                  + "Last Name: " + escapeHtml(user.name?.lastName) + "<br>"
                  + "Login Email: " + escapeHtml(user.loginEmail) + "<br>"
                  + "Organization: " + escapeHtml(org ? org.name : '(none selected)') + "<br>"
                  + "Message: " + escapeHtml(message).replace(/\r?\n/g, '<br>') + "<br>"
        };

        if(user.loginEmail) mailOptions.replyTo = user.loginEmail

        // Await so an SMTP failure reaches the client as an error instead of a false "sent"
        var info = await transporter.sendMail(mailOptions)
        console.log('Message %s sent: %s', info.messageId, info.response);

        return {msg: "Email Sent"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {contactDevs}
