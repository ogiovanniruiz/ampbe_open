const Geocodio = require('geocodio-library-node');

const geocode = async(address) => {
    try { 
        console.log("Starting to Geocode...")
        var geocodioAPIKey = process.env.geocodioAPIKey
        const geocodio = new Geocodio(geocodioAPIKey);
                
        return await geocodio.geocode(address).then(response => {
            return [response.results[0].location.lng, response.results[0].location.lat]
        }).catch(err => {
            return err
        });
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {geocode}