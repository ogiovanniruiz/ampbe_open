var User = require('../../models/users/user')
const webpush = require('web-push');

const vapidKeys = {publicKey:"BNePgr0mFlyTAfrgaWgIyeqSyV3uy-gqCKBB5JFa2OmO2dcChvZaP_VCuvy7aoKad2TOam9y2cdYgocdoCe2wtk",
                  privateKey:"SFYgEADmHBzWG5XV5UmCUmb2luX98X_i2bkoQJWnOOo"}

webpush.setVapidDetails(
                        'mailto:ogruiz@ieunitedorg',
                        vapidKeys.publicKey,
                        vapidKeys.privateKey
                    );
const addPushSubscriber = async(data) => {
    try { 
        var user = await User.findById(data.userID)
        user.swSub = data.sub
        return user.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {addPushSubscriber}