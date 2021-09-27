var Organization = require('../../../models/organizations/organization')
var Charge = require('../../../models/organizations/charges')

var CaptureOrder = require('./captueOrder')

const createOrder = async(detail) => {

    let stripeAPIKey = process.env.stripeAPIKey
    const stripe = require('stripe')(stripeAPIKey);

    console.log(detail)

    const stripeToken = detail.tokenID;
    //const price = Helper.getPrice(detail.order);
    const priceInPence = 50;

    stripe.charges.create({
        amount: priceInPence,
        currency: 'usd',
        source: stripeToken,
        capture: false,  // note that capture: false
     }).then(charge => {
         console.log(charge)
         var newCharge =  new Charge({orgID: detail.orgID,
                                       chargeID: charge.id, 
                                       amountInPence: charge.amount})
         CaptureOrder.captureOrder(newCharge)

     }).catch(error => {
         console.log(error)
        // do something in error here
     });


}


module.exports = {createOrder}