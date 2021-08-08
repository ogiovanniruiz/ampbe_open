var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')

const getTextbankContactHistory = async(data) => {
    try { 

        if(data.orgLevel === "ADMINISTRATOR"){

            var textbankContactHistory = await TextbankContactHistory.find({activityID: data.activity._id, complete: false})

            console.log(textbankContactHistory)
            var residentsSent = textbankContactHistory.map(x =>{return x['personID']});

            var residentsResponded = textbankContactHistory.filter(x => {return (x['textReceived']['status'])});
            var residentsRespondedIDS = textbankContactHistory.filter(x => {return (x['textReceived']['status'])}).map(x =>{return x['personID']});

            console.log("Admin.")
        } else {

            var textbankContactHistory = await TextbankContactHistory.find({activityID: data.activity._id, userID: data.userID, complete: false})
            var residentsSent = textbankContactHistory.map(x =>{return x['personID']});

            var residentsResponded = textbankContactHistory.filter(x => {return (x['textReceived']['status'])});
            var residentsRespondedIDS = textbankContactHistory.filter(x => {return (x['textReceived']['status'])}).map(x =>{return x['personID']});
            console.log("Not Admin.")
        }

        return {residentsSent: residentsSent, residentsResponded: residentsResponded, residentsRespondedIDS: residentsRespondedIDS}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTextbankContactHistory}
