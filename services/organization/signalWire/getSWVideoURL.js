const axios = require('axios');
const API_TOKEN = process.env.signalWireAPIToken


const getSWVideoURL = async(mediaApiUrl) => {
    const response = await axios.get(mediaApiUrl, {maxRedirects: 0,validateStatus: status => status >= 200 && status < 400});
    const match = response.data.match(/href="([^"]+)"/);
    const url = match ? match[1] : null;

    return url

}

module.exports = {getSWVideoURL}