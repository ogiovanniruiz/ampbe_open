let stripeAPIKey = process.env.stripeAPIKey
const stripe = require('stripe')(stripeAPIKey);

const captureOrder = async(charge) => {
    stripe.charges.capture(charge.id)
                  .then(res => console.log(res)
                  
                  )
                  .catch(err=> console.log(err))
}


module.exports = {captureOrder}