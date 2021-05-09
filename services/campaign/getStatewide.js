var States = require('../../models/campaigns/states');

const getStatewide = async(details) => {
    try {
        return await States.find({'properties.state.name': details.state.toUpperCase()});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getStatewide};
