// Settings the browser needs at runtime, kept in server env vars so they change without a client rebuild.
// The Maps key is still visible in the browser by design (protect it with Google Cloud referrer restrictions);
// testCallingNumber should only be set where demo builds run, never in production.
const getClientConfig = async() => {
    return {
        googleMapsKey: process.env.googleMapsKey || '',
        testCallingNumber: process.env.testCallingNumber || '',
    }
}

module.exports = {getClientConfig}
