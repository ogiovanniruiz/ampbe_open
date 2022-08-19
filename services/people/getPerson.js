var People = require('../../models/people/people');
const getPerson = async(person) => {

    var query = {}
    if(person.firstName) query['resident.name.firstName'] = person.firstName
    if(person.lastName) query['resident.name.lastName'] = person.lastName

    if(person.streetNum) query['address.streetNum'] = person.streetNum
    if(person.streetName) query['address.street'] = person.streetName

    if(person.city) query['address.city'] = person.city
    if(person.zip) query['address.zip'] = person.zip

    return await People.find(query)
}

module.exports = {getPerson}
