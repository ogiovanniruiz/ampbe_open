var User = require('../../models/users/user')
const webpush = require('web-push');

webpush.setVapidDetails(
                        process.env.vapidSubject,
                        process.env.vapidPublicKey,
                        process.env.vapidPrivateKey
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