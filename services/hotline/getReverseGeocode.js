const Geocodio = require('geocodio-library-node');

const getReverseGeocode = async(detail) => {
    try { 

        var geocodioAPIKey = process.env.geocodioAPIKey
        const geocodio = new Geocodio(geocodioAPIKey);

        var coordinate_string = String(detail.coordinates[0]) + "," + String(detail.coordinates[1])

        return geocodio.reverse(coordinate_string)
            .then(response => {
                return response.results
            })
            .catch(err => {
            return err
            }
            );
   
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getReverseGeocode}