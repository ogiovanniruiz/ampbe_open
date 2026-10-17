const Household = require('../../models/households/household')
const Membership = require('../../models/people/membership')
const getCommunityListCities = async(detail) => {
    try {

        return await Membership.distinct('address.city', {'enrollment.orgID': detail.orgID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCommunityListCities}
