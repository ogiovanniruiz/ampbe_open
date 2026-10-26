const axios = require('axios');
const url = 'https://api.mailerlite.com/api/v2/subscribers';
var Organization = require('../../../models/organizations/organization')


const getMailerLiteContacts = async(detail) => {
    try { 

        var org = await Organization.findById(detail.orgID)

        if(!org.mailerLiteAPIKey){
          return false
        }

        const api_key = org.mailerLiteAPIKey
        const config = {headers: {'Content-Type': 'application/json','X-MailerLite-ApiKey': api_key}};
        
        return await axios.get(url, config)
          .then(response => {
            var return_data = []

            for(var i = 0; i < response.data.length; i++){
                var { name, email } = response.data[i];
                var {firstName, lastName} = splitName(name) 
                return_data.push({firstName, lastName, email})
            }
            return return_data
          })
          .catch(error => {
            console.error('Failed to fetch subscribers:', error);
          });

    } catch(e){
        throw new Error(e.message)
    }
}

function splitName(name) {
    let parts = name.split(" "); // Split the name string by space
    let firstName = parts[0];    // First part is the first name
    let lastName = parts.length > 1 ? parts.slice(1).join(" ") : ""; // Join the remaining parts as last name
    return { firstName, lastName };
  }

module.exports = {getMailerLiteContacts}