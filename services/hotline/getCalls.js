var mongoose = require('mongoose');
var HotlineCall = require('../../models/hotline/hotlineCall'
)
const getCalls = async(detail) => {
    try { 

        return HotlineCall.find({orgID: detail.orgID}).sort({ _id: -1 })

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCalls}