var Clinic = require('../../../models/assets/clinics')

const getClinics = async() => {
    try { 

        return await Clinic.aggregate([
            
            {$group: {_id: {
                            location:'$location',
                            },
                        address: {$first: '$address'},
                        provider: {$first: '$provider'},
                        clinics: {$push: '$$ROOT'},
                        }
            }
        ])
        return await Clinic.find()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getClinics}