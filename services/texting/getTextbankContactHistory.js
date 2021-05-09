var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')

const getTextbankContactHistory = async(data) => {
    try { 

        var textbankContactHistory = await TextbankContactHistory.find({activityID: data.activity._id})
        var residentsSent = textbankContactHistory.map(x =>{return x['personID']});

        if(data.orgLevel === "ADMINISTRATOR"){
            var residentsResponded = textbankContactHistory.filter(x => {return (x['textReceived']['status'] && !x['complete'])});
            var residentsRespondedIDS = textbankContactHistory.filter(x => {return (x['textReceived']['status'] && !x['complete'])}).map(x =>{return x['personID']});
        } else {
            var residentsResponded = textbankContactHistory.filter(x => {return (x['textReceived']['status'] && !x['complete'] && x['userID'] === data.userID)});
            var residentsRespondedIDS = textbankContactHistory.filter(x => {return (x['textReceived']['status'] && !x['complete'] && x['userID'] === data.userID)}).map(x =>{return x['personID']});
        }

        return {residentsSent: residentsSent, residentsResponded: residentsResponded, residentsRespondedIDS: residentsRespondedIDS}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTextbankContactHistory}
